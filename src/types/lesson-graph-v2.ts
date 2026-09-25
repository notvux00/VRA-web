export type LessonCommandKindV2 = "SKIP" | "PAUSE" | "RESUME" | "VERBAL_HINT" | "VISUAL_HINT";

export type LessonRuntimeStatusV2 = "running" | "pausing" | "paused" | "completed" | "failed" | "cancelled";

export type LessonCommandReasonV2 =
  | "NONE" | "MALFORMED" | "WRONG_SESSION" | "WRONG_RUN" | "WRONG_NODE"
  | "STALE_ACTIVATION" | "DUPLICATE" | "NOT_ACTIVE" | "INVALID_STATE"
  | "WRONG_BINDING" | "UNSUPPORTED_CAPABILITY" | "TRANSPORT_UNAVAILABLE" | "CANCELLED";

export interface LessonBindingV2 {
  binding_id: string;
  npc_binding_id: string;
  can_verbal_hint: boolean;
  can_visual_hint: boolean;
}

export interface LessonStateV2 {
  contract_version: 2;
  session_id: string;
  run_id: string;
  graph_id: string;
  lesson_id: string;
  launch_token: string;
  lesson_voice_revision: number;
  child_phrase_revision: number;
  node_id: string;
  node_type: string;
  node_index: number;
  activation_id: string;
  status: LessonRuntimeStatusV2;
  checkpoint_id: string;
  updated_at_utc: string;
  state_revision: number;
  active_node_ids: string[];
  parallel_group_id: string;
  bindings: LessonBindingV2[];
}

export interface LessonCommandV2 {
  contract_version: 2;
  event: "LESSON_COMMAND";
  command_id: string;
  session_id: string;
  run_id: string;
  node_id: string;
  activation_id: string;
  command: LessonCommandKindV2;
  binding_id: string;
}

export type LessonCommandResultV2 = Omit<LessonCommandV2, "event"> & {
  event: "LESSON_COMMAND_RESULT";
  accepted: boolean;
  reason: LessonCommandReasonV2;
  state: LessonStateV2;
};

export interface LessonStatePacketV2 {
  contract_version: 2;
  event: "LESSON_STATE";
  state: LessonStateV2;
}

export interface NodeLogDataV2 {
  event_id: string;
  session_id: string;
  run_id: string;
  graph_id: string;
  lesson_id: string;
  launch_token: string;
  lesson_voice_revision: number;
  child_phrase_revision: number;
  node_id: string;
  node_type: string;
  node_name: string;
  node_index: number;
  activation_id: string;
  entered_at_utc: string;
  exited_at_utc: string;
  duration_seconds: number;
  elapsed_seconds: number;
  status: string;
  completion_channel: string;
}

export interface LessonAuditEventV2 {
  event_id: string;
  event_type: string;
  session_id: string;
  run_id: string;
  graph_id: string;
  lesson_id: string;
  node_id: string;
  node_type: string;
  node_index: number;
  activation_id: string;
  occurred_at_utc: string;
  elapsed_seconds: number;
  status: string;
  command_id: string;
  command: string;
  binding_id: string;
  reason: string;
  launch_token: string;
  lesson_voice_revision: number;
  child_phrase_revision: number;
}
