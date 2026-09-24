import { afterEach, describe, expect, it, vi } from "vitest";
import type { LessonCommandResultV2, LessonStateV2 } from "@/types/lesson-graph-v2";
import {
  LESSON_REMOTE_TOPIC_V2,
  LessonGraphRemoteControllerV2,
  resolveLessonRemoteUiModeV2,
} from "@/lib/lesson-graph-remote-v2";

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
  bindings: [
    { binding_id: "soap-touch", npc_binding_id: "teacher-npc", can_verbal_hint: true, can_visual_hint: true },
    { binding_id: "brush-touch", npc_binding_id: "assistant-npc", can_verbal_hint: false, can_visual_hint: true },
  ],
};

type PublishedPacket = { packet: Record<string, unknown>; options: { reliable: true; topic: string } };

function createHarness(timeoutMs = 5000) {
  const published: PublishedPacket[] = [];
  let nextId = 0;
  const controller = new LessonGraphRemoteControllerV2({
    sessionId: "session-1",
    timeoutMs,
    idFactory: () => `command-${++nextId}`,
    publish: async (packet, options) => {
      published.push({ packet: packet as Record<string, unknown>, options });
    },
  });
  return { controller, published };
}

function statePacket(nextState: LessonStateV2 = state) {
  return { contract_version: 2, event: "LESSON_STATE", state: nextState };
}

function resultPacket(
  overrides: Partial<LessonCommandResultV2> = {},
  nextState: LessonStateV2 = state,
): LessonCommandResultV2 {
  return {
    contract_version: 2,
    event: "LESSON_COMMAND_RESULT",
    command_id: "command-1",
    session_id: "session-1",
    run_id: "run-1",
    node_id: "quest-1",
    activation_id: "activation-1",
    command: "PAUSE",
    binding_id: "",
    accepted: true,
    reason: "NONE",
    state: nextState,
    ...overrides,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("LessonGraphRemoteControllerV2", () => {
  it("requests authoritative state on connect over the reliable remote topic", () => {
    const { controller, published } = createHarness();

    controller.setConnected(true);

    expect(published[0]).toEqual({
      packet: { contract_version: 2, event: "LESSON_STATE_REQUEST", session_id: "session-1" },
      options: { reliable: true, topic: LESSON_REMOTE_TOPIC_V2 },
    });
  });

  it("does not identify a legacy session until a same-session V2 state envelope arrives", () => {
    const { controller } = createHarness();

    expect(resolveLessonRemoteUiModeV2(controller.snapshot.identifiedV2, null, "session-1")).toBe("legacy");
    controller.receive(statePacket({ ...state, session_id: "other-session" }), LESSON_REMOTE_TOPIC_V2);
    expect(controller.snapshot.identifiedV2).toBe(false);
    expect(resolveLessonRemoteUiModeV2(controller.snapshot.identifiedV2, null, "session-1")).toBe("legacy");

    controller.receive({
      contract_version: 2,
      event: "LESSON_STATE",
      state: { contract_version: 2, session_id: "session-1" },
    }, LESSON_REMOTE_TOPIC_V2);

    expect(controller.snapshot.identifiedV2).toBe(true);
    expect(controller.snapshot.state).toBeNull();
    expect(resolveLessonRemoteUiModeV2(controller.snapshot.identifiedV2, controller.snapshot.state, "session-1"))
      .toBe("v2-pending");
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    expect(controller.snapshot.state).toEqual(state);
    controller.receive({
      contract_version: 2,
      event: "LESSON_STATE",
      state: { ...state, status: "waiting" },
    }, LESSON_REMOTE_TOPIC_V2);
    expect(controller.snapshot.identifiedV2).toBe(true);
    expect(controller.snapshot.state).toBeNull();
    expect(resolveLessonRemoteUiModeV2(controller.snapshot.identifiedV2, controller.snapshot.state, "session-1"))
      .toBe("v2-pending");
  });

  it("sends a command with the observed state and binding, without optimistic progress", async () => {
    const { controller, published } = createHarness();
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);

    const completion = controller.send("VERBAL_HINT", "soap-touch");

    expect(published.at(-1)).toEqual({
      packet: {
        contract_version: 2,
        event: "LESSON_COMMAND",
        command_id: "command-1",
        session_id: "session-1",
        run_id: "run-1",
        node_id: "quest-1",
        activation_id: "activation-1",
        command: "VERBAL_HINT",
        binding_id: "soap-touch",
      },
      options: { reliable: true, topic: LESSON_REMOTE_TOPIC_V2 },
    });
    expect(controller.snapshot.state).toEqual(state);
    expect(controller.snapshot.pending).toBe(true);

    const paused = { ...state, status: "paused" as const, state_revision: 2 };
    controller.receive(resultPacket({ command: "VERBAL_HINT", binding_id: "soap-touch" }, paused), LESSON_REMOTE_TOPIC_V2);

    await expect(completion).resolves.toMatchObject({ accepted: true, reason: "NONE" });
    expect(controller.snapshot.state).toEqual(paused);
  });

  it("surfaces a typed rejection and leaves authoritative state unchanged", async () => {
    const { controller } = createHarness();
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const completion = controller.send("PAUSE");

    controller.receive(resultPacket({ accepted: false, reason: "STALE_ACTIVATION" }), LESSON_REMOTE_TOPIC_V2);

    await expect(completion).resolves.toMatchObject({ accepted: false, reason: "STALE_ACTIVATION" });
    expect(controller.snapshot.rejection).toBe("STALE_ACTIVATION");
    expect(controller.snapshot.state).toEqual(state);
  });

  it("ignores results from another session or run and settles a matching result only once", async () => {
    const { controller } = createHarness();
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const completion = controller.send("PAUSE");
    const paused = { ...state, status: "paused" as const, state_revision: 2 };
    const accepted = resultPacket({}, paused);

    controller.receive({ ...accepted, session_id: "other-session" }, LESSON_REMOTE_TOPIC_V2);
    controller.receive({ ...accepted, run_id: "other-run" }, LESSON_REMOTE_TOPIC_V2);
    expect(controller.snapshot.pending).toBe(true);

    controller.receive(accepted, LESSON_REMOTE_TOPIC_V2);
    await expect(completion).resolves.toMatchObject({ accepted: true });
    controller.receive(resultPacket({}, { ...paused, state_revision: 3 }), LESSON_REMOTE_TOPIC_V2);

    expect(controller.snapshot.state).toEqual(paused);
    expect(controller.snapshot.pending).toBe(false);
  });

  it("marks a missing acknowledgement unconfirmed without changing state", async () => {
    vi.useFakeTimers();
    const { controller } = createHarness(5000);
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const completion = controller.send("PAUSE");

    await vi.advanceTimersByTimeAsync(5000);

    await expect(completion).resolves.toBeNull();
    expect(controller.snapshot.rejection).toBe("UNCONFIRMED");
    expect(controller.snapshot.state).toEqual(state);
    expect(controller.snapshot.pending).toBe(false);
  });

  it("uses the injected clock to expire a missing acknowledgement", async () => {
    const timer = { callback: null as (() => void) | null, delay: 0, cleared: false };
    const clock = {
      setTimeout(callback: () => void, delayMs: number) {
        timer.callback = callback;
        timer.delay = delayMs;
        return 1 as unknown as ReturnType<typeof setTimeout>;
      },
      clearTimeout() {
        timer.cleared = true;
      },
    };
    const controller = new LessonGraphRemoteControllerV2({
      sessionId: "session-1",
      timeoutMs: 1200,
      clock,
      idFactory: () => "command-1",
      publish: async () => {},
    });
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const completion = controller.send("PAUSE");

    expect(timer.delay).toBe(1200);
    expect(timer.callback).toBeTypeOf("function");
    timer.callback?.();
    await expect(completion).resolves.toBeNull();
    expect(controller.snapshot.rejection).toBe("UNCONFIRMED");
    expect(timer.cleared).toBe(true);
    controller.dispose();
  });

  it("settles an in-flight command and blocks further sends on disconnect", async () => {
    const { controller, published } = createHarness();
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const completion = controller.send("PAUSE");

    controller.setConnected(false);

    await expect(completion).resolves.toBeNull();
    expect(controller.snapshot.connected).toBe(false);
    expect(controller.snapshot.rejection).toBe("TRANSPORT_UNAVAILABLE");
    await expect(controller.send("SKIP")).resolves.toBeNull();
    expect(published.filter(({ packet }) => packet.event === "LESSON_COMMAND")).toHaveLength(1);
  });

  it("resets V2 identification when the page switches to a different session", () => {
    const { controller: firstSession } = createHarness();
    firstSession.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    firstSession.dispose();
    const nextSession = new LessonGraphRemoteControllerV2({
      sessionId: "session-2",
      publish: async () => {},
    });

    expect(nextSession.snapshot.identifiedV2).toBe(false);
    expect(nextSession.snapshot.state).toBeNull();
    expect(resolveLessonRemoteUiModeV2(nextSession.snapshot.identifiedV2, nextSession.snapshot.state, "session-2"))
      .toBe("legacy");
    nextSession.dispose();
  });

  it("clears session identity and pending work on disposal", async () => {
    const { controller } = createHarness();
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const completion = controller.send("PAUSE");

    controller.dispose();

    await expect(completion).resolves.toBeNull();
    expect(controller.snapshot).toMatchObject({
      connected: false,
      identifiedV2: false,
      pending: false,
      state: null,
    });
    expect(resolveLessonRemoteUiModeV2(controller.snapshot.identifiedV2, controller.snapshot.state, "session-1"))
      .toBe("legacy");
    await expect(controller.send("SKIP")).resolves.toBeNull();
  });
});

describe("resolveLessonRemoteUiModeV2", () => {
  it("keeps legacy controls active before identification and blocks legacy writes while V2 state is pending", () => {
    expect(resolveLessonRemoteUiModeV2(false, null, "session-1")).toBe("legacy");
    expect(resolveLessonRemoteUiModeV2(true, null, "session-1")).toBe("v2-pending");
    expect(resolveLessonRemoteUiModeV2(true, state, "other-session")).toBe("v2-pending");
    expect(resolveLessonRemoteUiModeV2(true, state, "session-1")).toBe("v2");
  });
});
