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

export function parseLessonStateV2(value: unknown): LessonStateV2 | null {
  if (!record(value) || value.contract_version !== 2
    || !nonblank(value.session_id) || forbiddenPathChars.test(value.session_id)
    || !nonblank(value.run_id) || !nonblank(value.graph_id)
    || !nonblank(value.lesson_id) || !nonblank(value.launch_token)
    || !integer(value.lesson_voice_revision) || !integer(value.child_phrase_revision)
    || typeof value.node_id !== "string" || typeof value.node_type !== "string"
    || !integer(value.node_index) || typeof value.activation_id !== "string"
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
