import type {
  LessonBindingV2,
  LessonCommandKindV2,
  LessonCommandReasonV2,
  LessonCommandResultV2,
  LessonCommandV2,
  LessonStateV2,
} from "@/types/lesson-graph-v2";
import { createLessonCommandV2, parseLessonStateV2 } from "@/lib/lesson-graph-v2";

export const LESSON_REMOTE_TOPIC_V2 = "lesson-graph-v2.remote";
export const LESSON_REMOTE_TIMEOUT_MS = 5000;

export type LessonRemoteFeedbackV2 = LessonCommandReasonV2 | "UNCONFIRMED";
export type LessonRemoteUiModeV2 = "legacy" | "v2-pending" | "v2";

export interface ReliableLessonPacketOptionsV2 {
  reliable: true;
  topic: typeof LESSON_REMOTE_TOPIC_V2;
}

export type LessonRemotePublisherV2 = (
  packet: unknown,
  options: ReliableLessonPacketOptionsV2,
) => Promise<void>;

export interface LessonRemoteClockV2 {
  setTimeout(callback: () => void, delayMs: number): ReturnType<typeof setTimeout>;
  clearTimeout(handle: ReturnType<typeof setTimeout>): void;
}

const systemClock: LessonRemoteClockV2 = {
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (handle) => globalThis.clearTimeout(handle),
};

export interface LessonGraphRemoteControllerOptionsV2 {
  sessionId: string | null;
  publish: LessonRemotePublisherV2;
  idFactory?: () => string;
  timeoutMs?: number;
  clock?: LessonRemoteClockV2;
}

export interface LessonGraphRemoteSnapshotV2 {
  state: LessonStateV2 | null;
  connected: boolean;
  pending: boolean;
  rejection: LessonRemoteFeedbackV2 | null;
  identifiedV2: boolean;
}

interface PendingCommandV2 {
  command: LessonCommandV2;
  timeout: ReturnType<typeof setTimeout>;
  resolve: (result: LessonCommandResultV2 | null) => void;
}

type RecordValue = Record<string, unknown>;

const commandKinds = new Set<LessonCommandKindV2>([
  "SKIP",
  "PAUSE",
  "RESUME",
  "VERBAL_HINT",
  "VISUAL_HINT",
]);

const rejectionReasons = new Set<LessonCommandReasonV2>([
  "NONE",
  "MALFORMED",
  "WRONG_SESSION",
  "WRONG_RUN",
  "WRONG_NODE",
  "STALE_ACTIVATION",
  "DUPLICATE",
  "NOT_ACTIVE",
  "INVALID_STATE",
  "WRONG_BINDING",
  "UNSUPPORTED_CAPABILITY",
  "TRANSPORT_UNAVAILABLE",
  "CANCELLED",
]);

function record(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseLessonCommandResultV2(value: unknown): LessonCommandResultV2 | null {
  if (!record(value)
    || value.contract_version !== 2
    || value.event !== "LESSON_COMMAND_RESULT"
    || !nonblank(value.command_id)
    || !nonblank(value.session_id)
    || !nonblank(value.run_id)
    || !nonblank(value.node_id)
    || !nonblank(value.activation_id)
    || !commandKinds.has(value.command as LessonCommandKindV2)
    || typeof value.binding_id !== "string"
    || typeof value.accepted !== "boolean"
    || !rejectionReasons.has(value.reason as LessonCommandReasonV2)
    || (value.accepted && value.reason !== "NONE")
    || (!value.accepted && value.reason === "NONE")) return null;

  const state = parseLessonStateV2(value.state);
  const identityRejection = !value.accepted
    && (value.reason === "WRONG_SESSION" || value.reason === "WRONG_RUN");
  if (!state || (!identityRejection
    && (state.session_id !== value.session_id || state.run_id !== value.run_id))) return null;

  return {
    contract_version: 2,
    event: "LESSON_COMMAND_RESULT",
    command_id: value.command_id,
    session_id: value.session_id,
    run_id: value.run_id,
    node_id: value.node_id,
    activation_id: value.activation_id,
    command: value.command as LessonCommandKindV2,
    binding_id: value.binding_id,
    accepted: value.accepted,
    reason: value.reason as LessonCommandReasonV2,
    state,
  };
}

export function resolveLessonRemoteUiModeV2(
  identifiedV2: boolean,
  state: LessonStateV2 | null,
  sessionId: string | null,
): LessonRemoteUiModeV2 {
  if (!identifiedV2) return "legacy";
  return state && sessionId && state.session_id === sessionId ? "v2" : "v2-pending";
}

export class LessonGraphRemoteControllerV2 {
  private state: LessonStateV2 | null = null;
  private connected = false;
  private identifiedV2 = false;
  private rejection: LessonRemoteFeedbackV2 | null = null;
  private pendingCommand: PendingCommandV2 | null = null;
  private readonly sentCommandIds = new Set<string>();
  private readonly listeners = new Set<() => void>();
  private disposed = false;
  private snapshotValue: LessonGraphRemoteSnapshotV2 = {
    state: null,
    connected: false,
    pending: false,
    rejection: null,
    identifiedV2: false,
  };

  private readonly publish: LessonRemotePublisherV2;
  private readonly idFactory: () => string;
  private readonly timeoutMs: number;
  private readonly clock: LessonRemoteClockV2;
  private readonly sessionId: string | null;

  constructor(options: LessonGraphRemoteControllerOptionsV2) {
    this.sessionId = options.sessionId?.trim() || null;
    this.publish = options.publish;
    this.idFactory = options.idFactory ?? (() => globalThis.crypto?.randomUUID?.() ?? `lesson-${Date.now()}-${Math.random()}`);
    this.timeoutMs = options.timeoutMs ?? LESSON_REMOTE_TIMEOUT_MS;
    this.clock = options.clock ?? systemClock;
  }

  get snapshot(): LessonGraphRemoteSnapshotV2 {
    return this.snapshotValue;
  }

  readonly getSnapshot = (): LessonGraphRemoteSnapshotV2 => this.snapshotValue;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly setConnected = (connected: boolean): void => {
    if (this.disposed) return;
    const next = Boolean(connected && this.sessionId);
    if (next === this.connected) return;

    this.connected = next;
    this.emit();
    if (!next) {
      this.settlePending(null, "TRANSPORT_UNAVAILABLE");
      return;
    }

    void this.publishPacket({
      contract_version: 2,
      event: "LESSON_STATE_REQUEST",
      session_id: this.sessionId,
    }).then((published) => {
      if (!published && !this.disposed) {
        this.rejection = "TRANSPORT_UNAVAILABLE";
        this.emit();
      }
    });
  };

  readonly receive = (packet: unknown, topic?: string): void => {
    if (this.disposed || topic !== LESSON_REMOTE_TOPIC_V2 || !record(packet)) return;

    if (packet.event === "LESSON_STATE") {
      const candidate = record(packet.state) ? packet.state : null;
      if (!this.sessionId || candidate?.session_id !== this.sessionId) return;

      this.identifiedV2 = true;
      const parsed = packet.contract_version === 2 ? parseLessonStateV2(candidate) : null;
      if (!parsed || parsed.session_id !== this.sessionId) {
        this.state = null;
        this.emit();
        return;
      }

      this.applyState(parsed);
      return;
    }

    if (packet.event !== "LESSON_COMMAND_RESULT" || packet.session_id !== this.sessionId) return;
    this.identifiedV2 = true;

    const result = parseLessonCommandResultV2(packet);
    const pending = this.pendingCommand;
    if (!result || !pending || !this.matchesPending(result, pending.command)) return;

    const resultStateMatchesCommand = result.state.session_id === pending.command.session_id
      && result.state.run_id === pending.command.run_id;
    if (resultStateMatchesCommand && this.newerState(result.state, this.state)) {
      this.state = result.state;
    }
    this.settlePending(result, result.accepted ? null : result.reason);
  };

  readonly send = (
    command: LessonCommandKindV2,
    bindingId = "",
  ): Promise<LessonCommandResultV2 | null> => {
    if (this.disposed || !this.connected || !this.sessionId || !this.state) {
      this.rejection = "TRANSPORT_UNAVAILABLE";
      this.emit();
      return Promise.resolve(null);
    }
    if (this.pendingCommand) {
      this.rejection = "INVALID_STATE";
      this.emit();
      return Promise.resolve(null);
    }

    const eligibility = this.validateCommand(command, bindingId, this.state);
    if (eligibility) {
      this.rejection = eligibility;
      this.emit();
      return Promise.resolve(null);
    }

    let payload: LessonCommandV2;
    try {
      payload = createLessonCommandV2(this.state, command, this.idFactory(), bindingId);
    } catch {
      this.rejection = "MALFORMED";
      this.emit();
      return Promise.resolve(null);
    }

    if (this.sentCommandIds.has(payload.command_id)) {
      this.rejection = "DUPLICATE";
      this.emit();
      return Promise.resolve(null);
    }
    this.sentCommandIds.add(payload.command_id);
    this.rejection = null;

    let resolveCompletion: (result: LessonCommandResultV2 | null) => void = () => {};
    const completion = new Promise<LessonCommandResultV2 | null>((resolve) => {
      resolveCompletion = resolve;
    });
    const timeout = this.clock.setTimeout(() => {
      this.settlePending(null, "UNCONFIRMED");
    }, this.timeoutMs);

    this.pendingCommand = { command: payload, timeout, resolve: resolveCompletion };
    this.emit();

    void this.publishPacket(payload).then((published) => {
      if (!published && this.pendingCommand?.command.command_id === payload.command_id) {
        this.settlePending(null, "TRANSPORT_UNAVAILABLE");
      }
    });

    return completion;
  };

  readonly dispose = (): void => {
    if (this.disposed) return;
    this.disposed = true;
    const pending = this.pendingCommand;
    this.pendingCommand = null;
    if (pending) {
      this.clock.clearTimeout(pending.timeout);
      pending.resolve(null);
    }

    this.state = null;
    this.connected = false;
    this.identifiedV2 = false;
    this.rejection = null;
    this.sentCommandIds.clear();
    this.snapshotValue = {
      state: null,
      connected: false,
      pending: false,
      rejection: null,
      identifiedV2: false,
    };
    this.listeners.clear();
  };

  private validateCommand(
    command: LessonCommandKindV2,
    bindingId: string,
    state: LessonStateV2,
  ): LessonCommandReasonV2 | null {
    if (!commandKinds.has(command)) return "MALFORMED";

    const hint = command === "VERBAL_HINT" || command === "VISUAL_HINT";
    if (hint) {
      const binding = state.bindings.find((item: LessonBindingV2) => item.binding_id === bindingId);
      if (!binding) return "WRONG_BINDING";
      if (command === "VERBAL_HINT" && !binding.can_verbal_hint) return "UNSUPPORTED_CAPABILITY";
      if (command === "VISUAL_HINT" && !binding.can_visual_hint) return "UNSUPPORTED_CAPABILITY";
      if (state.status !== "running") return "NOT_ACTIVE";
    } else if (command === "PAUSE" && state.status !== "running") {
      return "INVALID_STATE";
    } else if (command === "RESUME" && state.status !== "paused") {
      return "INVALID_STATE";
    } else if (command === "SKIP" && state.status !== "running") {
      return "NOT_ACTIVE";
    }

    return null;
  }

  private applyState(incoming: LessonStateV2): void {
    if (incoming.session_id !== this.sessionId) return;
    if (this.state && !this.newerState(incoming, this.state)) return;

    if (this.state && incoming.run_id !== this.state.run_id && this.pendingCommand) {
      this.settlePending(null, "CANCELLED", false);
    }
    this.state = incoming;
    this.emit();
  }

  private newerState(incoming: LessonStateV2, previous: LessonStateV2 | null): boolean {
    if (!previous) return true;
    if (incoming.run_id !== previous.run_id) {
      const incomingTime = Date.parse(incoming.updated_at_utc);
      const previousTime = Date.parse(previous.updated_at_utc);
      return Number.isFinite(incomingTime) && Number.isFinite(previousTime)
        ? incomingTime >= previousTime
        : false;
    }
    return incoming.state_revision > previous.state_revision;
  }

  private matchesPending(result: LessonCommandResultV2, command: LessonCommandV2): boolean {
    return result.command_id === command.command_id
      && result.session_id === command.session_id
      && result.run_id === command.run_id
      && result.node_id === command.node_id
      && result.activation_id === command.activation_id
      && result.command === command.command
      && result.binding_id === command.binding_id;
  }

  private settlePending(
    result: LessonCommandResultV2 | null,
    rejection: LessonRemoteFeedbackV2 | null,
    notify = true,
  ): void {
    const pending = this.pendingCommand;
    if (!pending) return;
    this.pendingCommand = null;
    this.clock.clearTimeout(pending.timeout);
    this.rejection = rejection;
    if (notify) this.emit();
    pending.resolve(result);
  }

  private async publishPacket(packet: unknown): Promise<boolean> {
    try {
      await this.publish(packet, { reliable: true, topic: LESSON_REMOTE_TOPIC_V2 });
      return true;
    } catch {
      return false;
    }
  }

  private emit(): void {
    this.snapshotValue = {
      state: this.state,
      connected: this.connected,
      pending: this.pendingCommand !== null,
      rejection: this.rejection,
      identifiedV2: this.identifiedV2,
    };
    this.listeners.forEach((listener) => listener());
  }
}
