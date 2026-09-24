import { describe, expect, it } from "vitest";
import { createLessonCommandV2, parseLessonStateV2 } from "@/lib/lesson-graph-v2";
import type { LessonCommandKindV2, LessonStateV2 } from "@/types/lesson-graph-v2";

const state: LessonStateV2 = {
  contract_version: 2,
  session_id: "session-1",
  run_id: "run-1",
  graph_id: "graph-1",
  lesson_id: "lesson-1",
  launch_token: "launch-1",
  lesson_voice_revision: 3,
  child_phrase_revision: 4,
  node_id: "quest-1",
  node_type: "Quest",
  node_index: 0,
  activation_id: "activation-1",
  status: "running",
  checkpoint_id: "",
  updated_at_utc: "2026-09-24T00:00:00Z",
  state_revision: 1,
  active_node_ids: ["quest-1"],
  parallel_group_id: "",
  bindings: [{ binding_id: "soap-touch", npc_binding_id: "teacher-npc", can_verbal_hint: true, can_visual_hint: true }],
};

const stateFixture = "{\"contract_version\":2,\"session_id\":\"session-1\",\"run_id\":\"run-1\",\"graph_id\":\"graph-1\",\"lesson_id\":\"lesson-1\",\"launch_token\":\"launch-1\",\"lesson_voice_revision\":3,\"child_phrase_revision\":4,\"node_id\":\"quest-1\",\"node_type\":\"Quest\",\"node_index\":0,\"activation_id\":\"activation-1\",\"status\":\"running\",\"checkpoint_id\":\"\",\"updated_at_utc\":\"2026-09-24T00:00:00Z\",\"state_revision\":1,\"active_node_ids\":[\"quest-1\"],\"parallel_group_id\":\"\",\"bindings\":[{\"binding_id\":\"soap-touch\",\"npc_binding_id\":\"teacher-npc\",\"can_verbal_hint\":true,\"can_visual_hint\":true}]}";
const commandFixture = "{\"contract_version\":2,\"event\":\"LESSON_COMMAND\",\"command_id\":\"cmd-1\",\"session_id\":\"session-1\",\"run_id\":\"run-1\",\"node_id\":\"quest-1\",\"activation_id\":\"activation-1\",\"command\":\"VISUAL_HINT\",\"binding_id\":\"soap-touch\"}";

describe("lesson graph V2 wire contract", () => {
  it("parses a complete state and tolerates additive fields", () => {
    expect(parseLessonStateV2({ ...state, future_field: { value: true } })).toEqual(state);
  });

  it("parses the shared literal state fixture and rejects the shared invalid version fixture", () => {
    expect(parseLessonStateV2(JSON.parse(stateFixture))).toEqual(state);
    expect(parseLessonStateV2({ ...JSON.parse(stateFixture), contract_version: "2" })).toBeNull();
  });

  it.each(["running", "pausing", "paused", "completed", "failed", "cancelled"] as const)(
    "retains node and activation identity in %s state snapshots",
    (status) => {
      const parsed = parseLessonStateV2({ ...state, status });
      expect(parsed).toMatchObject({ node_id: "quest-1", activation_id: "activation-1", status });
    },
  );

  it.each(["running", "pausing", "paused", "completed", "failed", "cancelled"] as const)(
    "rejects blank node and activation identities in %s state snapshots",
    (status) => {
      expect(parseLessonStateV2({ ...state, status, node_id: " " })).toBeNull();
      expect(parseLessonStateV2({ ...state, status, activation_id: "" })).toBeNull();
    },
  );

  it.each([
    ["missing version", { contract_version: undefined }],
    ["string version", { contract_version: "2" }],
    ["old version", { contract_version: 1 }],
    ["bad session path", { session_id: "session/other" }],
    ["blank run", { run_id: " " }],
    ["wrong revision type", { state_revision: "1" }],
    ["wrong bindings type", { bindings: {} }],
    ["wrong binding flag", { bindings: [{ ...state.bindings[0], can_visual_hint: "true" }] }],
    ["unknown status", { status: "waiting" }],
    ["wrong node list member", { active_node_ids: [1] }],
  ])("rejects %s", (_name, override) => {
    expect(parseLessonStateV2({ ...state, ...override })).toBeNull();
  });

  it.each<LessonCommandKindV2>(["SKIP", "PAUSE", "RESUME", "VERBAL_HINT", "VISUAL_HINT"])(
    "builds a correlated %s command",
    (kind) => {
      const hint = kind === "VERBAL_HINT" || kind === "VISUAL_HINT";
      expect(createLessonCommandV2(state, kind, "cmd-1", hint ? "soap-touch" : undefined)).toEqual({
        contract_version: 2,
        event: "LESSON_COMMAND",
        command_id: "cmd-1",
        session_id: "session-1",
        run_id: "run-1",
        node_id: "quest-1",
        activation_id: "activation-1",
        command: kind,
        binding_id: hint ? "soap-touch" : "",
      });
    },
  );

  it("serializes the shared literal command fixture byte-for-byte", () => {
    expect(JSON.stringify(createLessonCommandV2(state, "VISUAL_HINT", "cmd-1", "soap-touch"))).toBe(commandFixture);
  });

  it("rejects missing hint binding, blank command ID, and unsafe session path", () => {
    expect(() => createLessonCommandV2(state, "VISUAL_HINT", "cmd-1")).toThrow();
    expect(() => createLessonCommandV2(state, "SKIP", " ")).toThrow();
    expect(() => createLessonCommandV2({ ...state, session_id: "session#1" }, "SKIP", "cmd-1")).toThrow();
  });

  it("rejects a binding on a non-hint command and wrong command kind at runtime", () => {
    expect(() => createLessonCommandV2(state, "SKIP", "cmd-1", "soap-touch")).toThrow();
    expect(() => createLessonCommandV2(state, "STOP" as LessonCommandKindV2, "cmd-1")).toThrow();
  });
});
