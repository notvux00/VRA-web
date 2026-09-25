import type { LessonAuditEventV2, LessonStateV2, NodeLogDataV2 } from "@/types/lesson-graph-v2";
import { parseLessonStateV2, selectLatestLessonStateV2 } from "@/lib/lesson-graph-v2";

export { selectLatestLessonStateV2 };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function string(value: unknown): value is string {
  return typeof value === "string";
}

function nonnegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function nonnegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function parseNodeLog(value: unknown, sessionId?: string): NodeLogDataV2 | null {
  if (!record(value)
    || !nonblank(value.event_id)
    || !nonblank(value.session_id)
    || !nonblank(value.run_id)
    || !nonblank(value.graph_id)
    || !nonblank(value.lesson_id)
    || !nonblank(value.launch_token)
    || !nonnegativeInteger(value.lesson_voice_revision)
    || !nonnegativeInteger(value.child_phrase_revision)
    || !nonblank(value.node_id)
    || !nonblank(value.node_type)
    || !string(value.node_name)
    || !nonnegativeInteger(value.node_index)
    || !nonblank(value.activation_id)
    || !nonblank(value.entered_at_utc)
    || !nonblank(value.exited_at_utc)
    || !nonnegativeNumber(value.duration_seconds)
    || !nonnegativeNumber(value.elapsed_seconds)
    || !nonblank(value.status)
    || !string(value.completion_channel)
    || (sessionId !== undefined && value.session_id !== sessionId)) return null;

  return {
    event_id: value.event_id,
    session_id: value.session_id,
    run_id: value.run_id,
    graph_id: value.graph_id,
    lesson_id: value.lesson_id,
    launch_token: value.launch_token,
    lesson_voice_revision: value.lesson_voice_revision,
    child_phrase_revision: value.child_phrase_revision,
    node_id: value.node_id,
    node_type: value.node_type,
    node_name: value.node_name,
    node_index: value.node_index,
    activation_id: value.activation_id,
    entered_at_utc: value.entered_at_utc,
    exited_at_utc: value.exited_at_utc,
    duration_seconds: value.duration_seconds,
    elapsed_seconds: value.elapsed_seconds,
    status: value.status,
    completion_channel: value.completion_channel,
  };
}

function parseAuditEvent(value: unknown, sessionId?: string): LessonAuditEventV2 | null {
  const hasNode = record(value)
    && nonblank(value.node_id)
    && nonblank(value.node_type)
    && nonblank(value.activation_id)
    && nonnegativeInteger(value.node_index);
  const hasNoNode = record(value)
    && value.node_id === ""
    && value.node_type === ""
    && value.activation_id === ""
    && value.node_index === -1;
  if (!record(value)
    || !nonblank(value.event_id)
    || !nonblank(value.event_type)
    || !nonblank(value.session_id)
    || !nonblank(value.run_id)
    || !nonblank(value.graph_id)
    || !nonblank(value.lesson_id)
    || (!hasNode && !hasNoNode)
    || !nonblank(value.occurred_at_utc)
    || !nonnegativeNumber(value.elapsed_seconds)
    || !string(value.status)
    || !string(value.command_id)
    || !string(value.command)
    || !string(value.binding_id)
    || !string(value.reason)
    || !nonblank(value.launch_token)
    || !nonnegativeInteger(value.lesson_voice_revision)
    || !nonnegativeInteger(value.child_phrase_revision)
    || (sessionId !== undefined && value.session_id !== sessionId)) return null;

  return {
    event_id: value.event_id,
    event_type: value.event_type,
    session_id: value.session_id,
    run_id: value.run_id,
    graph_id: value.graph_id,
    lesson_id: value.lesson_id,
    node_id: value.node_id as string,
    node_type: value.node_type as string,
    node_index: value.node_index as number,
    activation_id: value.activation_id as string,
    occurred_at_utc: value.occurred_at_utc,
    elapsed_seconds: value.elapsed_seconds,
    status: value.status,
    command_id: value.command_id,
    command: value.command,
    binding_id: value.binding_id,
    reason: value.reason,
    launch_token: value.launch_token,
    lesson_voice_revision: value.lesson_voice_revision,
    child_phrase_revision: value.child_phrase_revision,
  };
}

export function parseLessonGraphStateV2(value: unknown, sessionId: string): LessonStateV2 | null {
  // RTDB omits empty child collections (and can surface them as null), so
  // normalize only those absent collections at this RTDB boundary. DataPacket
  // payloads continue through the strict parser unchanged.
  const normalizedValue = record(value) ? {
    ...value,
    active_node_ids: value.active_node_ids == null ? [] : value.active_node_ids,
    bindings: value.bindings == null ? [] : value.bindings,
  } : value;
  const state = parseLessonStateV2(normalizedValue);
  return state?.session_id === sessionId ? state : null;
}

export function selectLatestLessonTelemetryStateV2(
  previous: LessonStateV2 | null,
  incoming: unknown,
  sessionId: string | null,
): LessonStateV2 | null {
  const parsedIncoming = parseLessonGraphStateV2(incoming, sessionId || "");
  return selectLatestLessonStateV2(previous, parsedIncoming, sessionId);
}

export interface LessonTelemetrySelectionV2 {
  sessionId: string | null;
  state: LessonStateV2 | null;
}

export function selectCurrentLessonTelemetryStateV2(
  previous: LessonTelemetrySelectionV2,
  sessionId: string | null,
  rtdbState: unknown,
  packetState: unknown,
): LessonTelemetrySelectionV2 {
  const retained = previous.sessionId === sessionId ? previous.state : null;
  const withRtdb = selectLatestLessonTelemetryStateV2(retained, rtdbState, sessionId);
  const selected = selectLatestLessonTelemetryStateV2(withRtdb, packetState, sessionId);
  return { sessionId, state: selected };
}

export function parseLessonNodeLogsV2(value: unknown, sessionId?: string): NodeLogDataV2[] {
  const collection = record(value) ? value.node_logs : value;
  if (!Array.isArray(collection)) return [];

  const seen = new Set<string>();
  const logs: NodeLogDataV2[] = [];
  for (const item of collection) {
    const parsed = parseNodeLog(item, sessionId);
    if (!parsed || seen.has(parsed.event_id)) continue;
    seen.add(parsed.event_id);
    logs.push(parsed);
  }
  return logs.sort((left, right) => left.entered_at_utc.localeCompare(right.entered_at_utc));
}

export function parseLessonAuditEventsV2(value: unknown, sessionId?: string): LessonAuditEventV2[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const events: LessonAuditEventV2[] = [];
  for (const item of value) {
    const parsed = parseAuditEvent(item, sessionId);
    if (!parsed || seen.has(parsed.event_id)) continue;
    seen.add(parsed.event_id);
    events.push(parsed);
  }
  return events.sort((left, right) => right.occurred_at_utc.localeCompare(left.occurred_at_utc));
}

type TelemetryValueHandlerV2 = (value: unknown) => void;
type TelemetryErrorHandlerV2 = (error: unknown) => void;
type UnsubscribeV2 = () => void;

export interface LessonGraphTelemetrySourcesV2 {
  subscribeState: (
    sessionId: string,
    onValue: TelemetryValueHandlerV2,
    onError: TelemetryErrorHandlerV2,
  ) => UnsubscribeV2;
  subscribeNodeLogs: (
    sessionId: string,
    onValue: TelemetryValueHandlerV2,
    onError: TelemetryErrorHandlerV2,
  ) => UnsubscribeV2;
  subscribeAuditEvents: (
    sessionId: string,
    onValue: TelemetryValueHandlerV2,
    onError: TelemetryErrorHandlerV2,
  ) => UnsubscribeV2;
}

export interface LessonGraphTelemetryHandlersV2 {
  onState: TelemetryValueHandlerV2;
  onNodeLogs?: TelemetryValueHandlerV2;
  onAuditEvents?: TelemetryValueHandlerV2;
  onError?: TelemetryErrorHandlerV2;
}

export function createLessonGraphTelemetrySubscriptionV2(
  sessionId: string,
  handlers: LessonGraphTelemetryHandlersV2,
  sources: LessonGraphTelemetrySourcesV2,
): UnsubscribeV2 {
  let active = true;
  const unsubscribers: UnsubscribeV2[] = [];
  const reportError = (error: unknown) => {
    if (active) handlers.onError?.(error);
  };
  const subscribe = (
    source: (sessionId: string, onValue: TelemetryValueHandlerV2, onError: TelemetryErrorHandlerV2) => UnsubscribeV2,
    handler?: TelemetryValueHandlerV2,
  ) => {
    if (!handler) return;
    try {
      unsubscribers.push(source(
        sessionId,
        (value) => { if (active) handler(value); },
        reportError,
      ));
    } catch (error) {
      reportError(error);
    }
  };

  subscribe(sources.subscribeState, handlers.onState);
  subscribe(sources.subscribeNodeLogs, handlers.onNodeLogs);
  subscribe(sources.subscribeAuditEvents, handlers.onAuditEvents);

  return () => {
    if (!active) return;
    active = false;
    for (const unsubscribe of unsubscribers) {
      try {
        unsubscribe();
      } catch {
        // Continue clearing the other session-scoped listeners.
      }
    }
  };
}
