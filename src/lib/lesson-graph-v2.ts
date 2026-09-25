import type { LessonBindingV2, LessonCommandKindV2, LessonCommandV2, LessonStateV2, LessonRuntimeStatusV2 } from "@/types/lesson-graph-v2";

const commands = new Set<LessonCommandKindV2>(["SKIP", "PAUSE", "RESUME", "VERBAL_HINT", "VISUAL_HINT"]);
const statuses = new Set<LessonRuntimeStatusV2>(["running", "pausing", "paused", "completed", "failed", "cancelled"]);
const forbiddenPathChars = /[\/.#$\[\]]/;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function integer(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function binding(value: unknown): value is LessonBindingV2 {
  return record(value)
    && nonblank(value.binding_id)
    && typeof value.npc_binding_id === "string"
    && typeof value.can_verbal_hint === "boolean"
    && typeof value.can_visual_hint === "boolean";
}

interface UtcInstantV2 {
  epochSeconds: number;
  fractionalSeconds: string;
}

function parseUtcInstant(value: string): UtcInstantV2 | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/i.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = "", offsetText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const utc = new Date(0);
  utc.setUTCFullYear(year, month - 1, day);
  utc.setUTCHours(hour, minute, second, 0);
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day
    || utc.getUTCHours() !== hour || utc.getUTCMinutes() !== minute || utc.getUTCSeconds() !== second) return null;

  let offsetMinutes = 0;
  if (offsetText.toUpperCase() !== "Z") {
    const offsetHours = Number(offsetText.slice(1, 3));
    const offsetRemainderMinutes = Number(offsetText.slice(4, 6));
    if (offsetHours > 23 || offsetRemainderMinutes > 59) return null;
    const direction = offsetText[0] === "+" ? 1 : -1;
    offsetMinutes = direction * (offsetHours * 60 + offsetRemainderMinutes);
  }

  return {
    epochSeconds: utc.getTime() / 1000 - offsetMinutes * 60,
    fractionalSeconds: fraction.replace(/0+$/, ""),
  };
}

function compareUtcInstants(left: UtcInstantV2, right: UtcInstantV2): number {
  if (left.epochSeconds !== right.epochSeconds) return left.epochSeconds < right.epochSeconds ? -1 : 1;
  const precision = Math.max(left.fractionalSeconds.length, right.fractionalSeconds.length);
  const leftFraction = left.fractionalSeconds.padEnd(precision, "0");
  const rightFraction = right.fractionalSeconds.padEnd(precision, "0");
  if (leftFraction === rightFraction) return 0;
  return leftFraction < rightFraction ? -1 : 1;
}

export function parseLessonStateV2(value: unknown): LessonStateV2 | null {
  if (!record(value) || value.contract_version !== 2
    || !nonblank(value.session_id) || forbiddenPathChars.test(value.session_id)
    || !nonblank(value.run_id) || !nonblank(value.graph_id)
    || !nonblank(value.lesson_id) || !nonblank(value.launch_token)
    || !integer(value.lesson_voice_revision) || !integer(value.child_phrase_revision)
    || !nonblank(value.node_id) || typeof value.node_type !== "string"
    || !integer(value.node_index) || !nonblank(value.activation_id)
    || !statuses.has(value.status as LessonRuntimeStatusV2)
    || typeof value.checkpoint_id !== "string" || !nonblank(value.updated_at_utc)
    || !integer(value.state_revision)
    || !Array.isArray(value.active_node_ids) || !value.active_node_ids.every(nonblank)
    || typeof value.parallel_group_id !== "string"
    || !Array.isArray(value.bindings) || !value.bindings.every(binding)) return null;

  return {
    contract_version: 2,
    session_id: value.session_id,
    run_id: value.run_id,
    graph_id: value.graph_id,
    lesson_id: value.lesson_id,
    launch_token: value.launch_token,
    lesson_voice_revision: value.lesson_voice_revision,
    child_phrase_revision: value.child_phrase_revision,
    node_id: value.node_id,
    node_type: value.node_type,
    node_index: value.node_index,
    activation_id: value.activation_id,
    status: value.status as LessonRuntimeStatusV2,
    checkpoint_id: value.checkpoint_id,
    updated_at_utc: value.updated_at_utc,
    state_revision: value.state_revision,
    active_node_ids: value.active_node_ids,
    parallel_group_id: value.parallel_group_id,
    bindings: value.bindings.map((item: LessonBindingV2) => ({
      binding_id: item.binding_id,
      npc_binding_id: item.npc_binding_id,
      can_verbal_hint: item.can_verbal_hint,
      can_visual_hint: item.can_visual_hint,
    })),
  };
}

export function selectLatestLessonStateV2(
  previous: LessonStateV2 | null,
  incoming: unknown,
  sessionId: string | null,
): LessonStateV2 | null {
  const current = sessionId && previous?.session_id === sessionId ? previous : null;
  if (!sessionId) return null;

  const candidate = parseLessonStateV2(incoming);
  if (!candidate || candidate.session_id !== sessionId) return current;
  if (!current) return candidate;

  if (candidate.run_id === current.run_id && candidate.launch_token === current.launch_token) {
    return candidate.state_revision > current.state_revision ? candidate : current;
  }

  const candidateTime = parseUtcInstant(candidate.updated_at_utc);
  const currentTime = parseUtcInstant(current.updated_at_utc);
  if (candidateTime === null || currentTime === null) return current;
  const timeOrder = compareUtcInstants(candidateTime, currentTime);
  if (timeOrder !== 0) return timeOrder > 0 ? candidate : current;
  return candidate.state_revision > current.state_revision ? candidate : current;
}

export function createLessonCommandV2(
  state: LessonStateV2,
  command: LessonCommandKindV2,
  commandId: string,
  bindingId = "",
): LessonCommandV2 {
  if (!parseLessonStateV2(state) || !nonblank(commandId)
    || !nonblank(state.node_id) || !nonblank(state.activation_id)
    || !commands.has(command)) throw new Error("Invalid lesson command correlation");
  const hint = command === "VERBAL_HINT" || command === "VISUAL_HINT";
  if (hint ? !nonblank(bindingId) : bindingId !== "") throw new Error("Invalid lesson command binding");
  return {
    contract_version: 2,
    event: "LESSON_COMMAND",
    command_id: commandId,
    session_id: state.session_id,
    run_id: state.run_id,
    node_id: state.node_id,
    activation_id: state.activation_id,
    command,
    binding_id: bindingId,
  };
}
