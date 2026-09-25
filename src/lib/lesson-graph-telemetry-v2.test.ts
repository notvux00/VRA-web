import { describe, expect, it, vi } from "vitest";
import {
  createLessonGraphTelemetrySubscriptionV2,
  parseLessonAuditEventsV2,
  parseLessonGraphStateV2,
  parseLessonNodeLogsV2,
  selectLatestLessonStateV2,
  selectCurrentLessonTelemetryStateV2,
  type LessonGraphTelemetrySourcesV2,
} from "@/lib/lesson-graph-telemetry-v2";
import { parseLessonStateV2 } from "@/lib/lesson-graph-v2";

const stateFixture = "{\"contract_version\":2,\"session_id\":\"session-1\",\"run_id\":\"run-1\",\"graph_id\":\"graph-1\",\"lesson_id\":\"lesson-1\",\"launch_token\":\"launch-1\",\"lesson_voice_revision\":4,\"child_phrase_revision\":7,\"node_id\":\"quest-1\",\"node_type\":\"Quest\",\"node_index\":2,\"activation_id\":\"activation-1\",\"status\":\"running\",\"checkpoint_id\":\"\",\"updated_at_utc\":\"2026-09-24T08:00:00.0000000+00:00\",\"state_revision\":1,\"active_node_ids\":[\"quest-1\"],\"parallel_group_id\":\"\",\"bindings\":[]}";
const state = JSON.parse(stateFixture) as Record<string, unknown>;

const nodeLog = {
  event_id: "node-log-1",
  session_id: "session-1",
  run_id: "run-1",
  graph_id: "graph-1",
  lesson_id: "lesson-1",
  launch_token: "launch-1",
  lesson_voice_revision: 4,
  child_phrase_revision: 7,
  node_id: "quest-1",
  node_type: "Quest",
  node_name: "Wash hands",
  node_index: 2,
  activation_id: "activation-1",
  entered_at_utc: "2026-09-24T08:00:00.0000000+00:00",
  exited_at_utc: "2026-09-24T08:00:09.0000000+00:00",
  duration_seconds: 9,
  elapsed_seconds: 14,
  status: "failed",
  completion_channel: "timeout",
};

const auditFixture = "{\"event_id\":\"event-1\",\"event_type\":\"NODE_COMPLETED\",\"session_id\":\"session-1\",\"run_id\":\"run-1\",\"graph_id\":\"graph-1\",\"lesson_id\":\"lesson-1\",\"node_id\":\"quest-1\",\"node_type\":\"Quest\",\"node_index\":2,\"activation_id\":\"activation-1\",\"occurred_at_utc\":\"2026-09-24T08:00:09.0000000+00:00\",\"elapsed_seconds\":14.0,\"status\":\"success\",\"command_id\":\"\",\"command\":\"\",\"binding_id\":\"\",\"reason\":\"\",\"launch_token\":\"launch-1\",\"lesson_voice_revision\":4,\"child_phrase_revision\":7}";
const auditEvent = JSON.parse(auditFixture) as Record<string, unknown>;

describe("Lesson Graph V2 telemetry consumption", () => {
  it("keeps legacy sessions with no node_logs readable", () => {
    expect(parseLessonNodeLogsV2(undefined)).toEqual([]);
    expect(parseLessonNodeLogsV2({ quest_logs: [] })).toEqual([]);
  });

  it("accepts valid V2 state and ignores additive future fields", () => {
    expect(parseLessonGraphStateV2({ ...state, future_parallel_detail: { group: "g-1" } }, "session-1"))
      .toEqual(state);
  });

  it("normalizes RTDB-omitted empty collections without relaxing the DataPacket parser", () => {
    const stateWithoutCollections = { ...state };
    delete stateWithoutCollections.active_node_ids;
    delete stateWithoutCollections.bindings;

    expect(parseLessonGraphStateV2(stateWithoutCollections, "session-1"))
      .toEqual({ ...state, active_node_ids: [], bindings: [] });
    expect(parseLessonGraphStateV2({ ...state, active_node_ids: null, bindings: null }, "session-1"))
      .toEqual({ ...state, active_node_ids: [], bindings: [] });
    expect(parseLessonStateV2(stateWithoutCollections)).toBeNull();
  });

  it("rejects invalid state fields and state belonging to a different session", () => {
    expect(parseLessonGraphStateV2({ ...state, state_revision: "4" }, "session-1")).toBeNull();
    expect(parseLessonGraphStateV2({
      ...state,
      bindings: [{ binding_id: "soap-touch", npc_binding_id: "", can_verbal_hint: true, can_visual_hint: 1 }],
    }, "session-1"))
      .toBeNull();
    expect(parseLessonGraphStateV2({ ...state, session_id: "session-other" }, "session-1")).toBeNull();
  });

  it("accepts a cancelled terminal V2 state", () => {
    expect(parseLessonGraphStateV2({ ...state, status: "cancelled" }, "session-1")?.status).toBe("cancelled");
  });

  it("keeps the higher revision for the same session and run", () => {
    const previous = parseLessonGraphStateV2(state, "session-1");
    const incoming = parseLessonGraphStateV2({ ...state, state_revision: 5 }, "session-1");
    expect(selectLatestLessonStateV2(previous, incoming, "session-1")?.state_revision).toBe(5);
    expect(selectLatestLessonStateV2(incoming, previous, "session-1")?.state_revision).toBe(5);
    expect(selectLatestLessonStateV2(incoming, { ...state, state_revision: "6" }, "session-1")).toBe(incoming);
    expect(selectLatestLessonStateV2(incoming, { ...state, session_id: "session-other" }, "session-1")).toBe(incoming);
  });

  it("retains packet revision N through packet loss when RTDB still has N-1", () => {
    const packetN = { ...state, state_revision: 2, node_id: "quest-2", activation_id: "activation-2" };
    const rtdbNMinus1 = { ...state, state_revision: 1 };
    const initial = { sessionId: null, state: null };

    const packetConnected = selectCurrentLessonTelemetryStateV2(
      initial,
      "session-1",
      rtdbNMinus1,
      packetN,
    );
    const packetLost = selectCurrentLessonTelemetryStateV2(
      packetConnected,
      "session-1",
      rtdbNMinus1,
      null,
    );

    expect(packetConnected.state?.state_revision).toBe(2);
    expect(packetLost.state).toEqual(packetConnected.state);
  });

  it("clears retained packet state when telemetry switches sessions", () => {
    const packetN = parseLessonGraphStateV2({ ...state, state_revision: 2 }, "session-1");
    const nextSession = parseLessonGraphStateV2({ ...state, session_id: "session-2" }, "session-2");
    const retained = selectCurrentLessonTelemetryStateV2(
      { sessionId: "session-1", state: packetN },
      "session-2",
      nextSession,
      null,
    );

    expect(retained).toEqual({ sessionId: "session-2", state: nextSession });
  });

  it("does not let an older prior-run RTDB write replace a newer launch", () => {
    const activeRun = parseLessonGraphStateV2({
      ...state,
      run_id: "run-2",
      launch_token: "launch-2",
      updated_at_utc: "2026-09-24T00:01:00.000Z",
      state_revision: 1,
    }, "session-1");
    const staleRun = parseLessonGraphStateV2({
      ...state,
      run_id: "run-1",
      updated_at_utc: "2026-09-24T00:00:30.000Z",
      state_revision: 99,
    }, "session-1");

    expect(selectLatestLessonStateV2(activeRun, staleRun, "session-1")).toBe(activeRun);
  });

  it("parses failed quest status and duration from node logs", () => {
    expect(parseLessonNodeLogsV2([nodeLog])).toEqual([nodeLog]);
  });

  it("deduplicates Firestore audit documents by stable event_id", () => {
    const duplicateRejection = { ...auditEvent, event_type: "COMMAND_REJECTED", reason: "WRONG_BINDING" };
    expect(parseLessonAuditEventsV2([auditEvent, duplicateRejection]))
      .toEqual([auditEvent]);
  });

  it("accepts lesson-level audit events without node correlation", () => {
    const lessonEvent = {
      ...auditEvent,
      event_type: "LESSON_CANCELLED",
      node_id: "",
      node_type: "",
      node_index: -1,
      activation_id: "",
    };
    expect(parseLessonAuditEventsV2([lessonEvent])).toEqual([lessonEvent]);
  });

  it("cleans up prior-session subscriptions and ignores callbacks after a session switch", () => {
    let oldSessionCallback: ((value: unknown) => void) | undefined;
    const subscribedSessions: string[] = [];
    const unsubscribeState = { "session-1": vi.fn(), "session-2": vi.fn() };
    const unsubscribeLogs = { "session-1": vi.fn(), "session-2": vi.fn() };
    const unsubscribeAudit = { "session-1": vi.fn(), "session-2": vi.fn() };
    const sources: LessonGraphTelemetrySourcesV2 = {
      subscribeState: (sessionId, onValue) => {
        subscribedSessions.push(sessionId);
        if (sessionId === "session-1") oldSessionCallback = onValue;
        return unsubscribeState[sessionId as "session-1" | "session-2"];
      },
      subscribeNodeLogs: (sessionId) => unsubscribeLogs[sessionId as "session-1" | "session-2"],
      subscribeAuditEvents: (sessionId) => unsubscribeAudit[sessionId as "session-1" | "session-2"],
    };
    const onState = vi.fn();
    const stopOldSession = createLessonGraphTelemetrySubscriptionV2("session-1", {
      onState,
      onNodeLogs: vi.fn(),
      onAuditEvents: vi.fn(),
    }, sources);

    stopOldSession();
    const stopNewSession = createLessonGraphTelemetrySubscriptionV2("session-2", {
      onState: vi.fn(),
      onNodeLogs: vi.fn(),
      onAuditEvents: vi.fn(),
    }, sources);
    oldSessionCallback?.(state);

    expect(subscribedSessions).toEqual(["session-1", "session-2"]);
    expect(unsubscribeState["session-1"]).toHaveBeenCalledOnce();
    expect(unsubscribeLogs["session-1"]).toHaveBeenCalledOnce();
    expect(unsubscribeAudit["session-1"]).toHaveBeenCalledOnce();
    expect(onState).not.toHaveBeenCalled();
    stopNewSession();
  });
});
