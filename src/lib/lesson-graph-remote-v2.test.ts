import { afterEach, describe, expect, it, vi } from "vitest";
import type { LessonCommandResultV2, LessonStateV2 } from "@/types/lesson-graph-v2";
import { selectLatestLessonStateV2 } from "@/lib/lesson-graph-v2";
import {
  LESSON_REMOTE_TOPIC_V2,
  LessonGraphRemoteControllerV2,
  parseLessonCommandResultV2,
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

describe("parseLessonCommandResultV2", () => {
  it.each([
    ["WRONG_RUN", { ...state, run_id: "runner-run", status: "paused" as const, state_revision: 2 }],
    ["WRONG_SESSION", { ...state, session_id: "runner-session", status: "paused" as const, state_revision: 2 }],
  ] as const)("accepts a %s rejection with the runner's authoritative identity", (reason, authoritativeState) => {
    expect(parseLessonCommandResultV2(resultPacket({ accepted: false, reason }, authoritativeState)))
      .toMatchObject({ accepted: false, reason, state: authoritativeState });
  });

  it("rejects mismatched runner identity for accepted results and unrelated rejections", () => {
    const foreignRunState = { ...state, run_id: "runner-run" };

    expect(parseLessonCommandResultV2(resultPacket({}, foreignRunState))).toBeNull();
    expect(parseLessonCommandResultV2(resultPacket(
      { accepted: false, reason: "STALE_ACTIVATION" },
      foreignRunState,
    ))).toBeNull();
  });
});

describe("selectLatestLessonStateV2", () => {
  it("orders different runs by the full fractional UTC instant before comparing revisions", () => {
    const earlierRun = { ...state, run_id: "run-old", launch_token: "launch-old", state_revision: 99,
      updated_at_utc: "2026-09-24T08:00:00.1234567+00:00" };
    const laterRun = { ...state, run_id: "run-new", launch_token: "launch-new", state_revision: 1,
      updated_at_utc: "2026-09-24T08:00:00.1234568Z" };

    expect(selectLatestLessonStateV2(laterRun, earlierRun, "session-1")).toEqual(laterRun);
  });

  it("treats equivalent offset timestamps as the same instant", () => {
    const first = { ...state, run_id: "run-a", launch_token: "launch-a", state_revision: 3,
      updated_at_utc: "2026-09-24T08:00:00.1234567+00:00" };
    const equivalentInstant = { ...state, run_id: "run-b", launch_token: "launch-b", state_revision: 4,
      updated_at_utc: "2026-09-24T10:00:00.1234567+02:00" };

    expect(selectLatestLessonStateV2(first, equivalentInstant, "session-1")).toEqual(equivalentInstant);
  });
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
    controller.receive(statePacket({ ...state, state_revision: 0 }), LESSON_REMOTE_TOPIC_V2);
    expect(controller.snapshot.state).toEqual(state);
    controller.receive({
      contract_version: 2,
      event: "LESSON_STATE",
      state: { ...state, status: "waiting" },
    }, LESSON_REMOTE_TOPIC_V2);
    expect(controller.snapshot.identifiedV2).toBe(true);
    expect(controller.snapshot.state).toEqual(state);
    expect(resolveLessonRemoteUiModeV2(controller.snapshot.identifiedV2, controller.snapshot.state, "session-1"))
      .toBe("v2");
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

  it.each([
    ["WRONG_RUN", { ...state, run_id: "runner-run", status: "paused" as const, state_revision: 2 }],
    ["WRONG_SESSION", { ...state, session_id: "runner-session", status: "paused" as const, state_revision: 2 }],
  ] as const)("settles a %s rejection without adopting the foreign runner state", async (reason, authoritativeState) => {
    const { controller } = createHarness();
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const completion = controller.send("PAUSE");

    controller.receive(resultPacket({ accepted: false, reason }, authoritativeState), LESSON_REMOTE_TOPIC_V2);
    const snapshotAfterResult = controller.snapshot;
    controller.dispose();

    expect(snapshotAfterResult.pending).toBe(false);
    await expect(completion).resolves.toMatchObject({ accepted: false, reason, state: authoritativeState });
    expect(snapshotAfterResult.rejection).toBe(reason);
    expect(snapshotAfterResult.state).toEqual(state);
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

  it("retains the correlated command result until a newer outcome or controller session reset", async () => {
    const { controller } = createHarness();
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const pause = controller.send("PAUSE");
    const paused = { ...state, status: "paused" as const, state_revision: 2 };
    const accepted = resultPacket({}, paused);

    controller.receive(accepted, LESSON_REMOTE_TOPIC_V2);
    await expect(pause).resolves.toEqual(accepted);
    expect(controller.snapshot.commandOutcome).toEqual(accepted);

    const resume = controller.send("RESUME");
    expect(controller.snapshot.commandOutcome).toBeNull();
    const rejected = resultPacket({
      command: "RESUME",
      command_id: "command-2",
      accepted: false,
      reason: "STALE_ACTIVATION",
    }, paused);
    controller.receive(rejected, LESSON_REMOTE_TOPIC_V2);
    await expect(resume).resolves.toEqual(rejected);
    expect(controller.snapshot.commandOutcome).toEqual(rejected);

    controller.dispose();
    expect(controller.snapshot.commandOutcome).toBeNull();
  });

  it("marks a missing acknowledgement unconfirmed without changing state", async () => {
    vi.useFakeTimers();
    const { controller } = createHarness(5000);
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const completion = controller.send("PAUSE");

    await vi.advanceTimersByTimeAsync(5000);

    await expect(completion).resolves.toBeNull();
    expect(controller.snapshot.commandOutcome).toMatchObject({
      accepted: null,
      reason: "UNCONFIRMED",
      command: "PAUSE",
      command_id: "command-1",
      run_id: "run-1",
      node_id: "quest-1",
      activation_id: "activation-1",
    });
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

  it("returns the typed transport disposition with the pending command target", async () => {
    const { controller } = createHarness();
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const completion = controller.send("PAUSE");

    controller.setConnected(false);

    await expect(completion).resolves.toBeNull();
    expect(controller.snapshot.commandOutcome).toMatchObject({
      accepted: null,
      reason: "TRANSPORT_UNAVAILABLE",
      command: "PAUSE",
      command_id: "command-1",
      run_id: "run-1",
      node_id: "quest-1",
      activation_id: "activation-1",
    });
  });

  it("returns run-switch cancellation for the command's original target", async () => {
    const { controller } = createHarness();
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const completion = controller.send("PAUSE");
    const nextRun = {
      ...state,
      run_id: "run-2",
      launch_token: "launch-2",
      node_id: "quest-2",
      activation_id: "activation-2",
      updated_at_utc: "2026-09-24T00:01:00Z",
      state_revision: 1,
    };

    controller.receive(statePacket(nextRun), LESSON_REMOTE_TOPIC_V2);

    await expect(completion).resolves.toBeNull();
    expect(controller.snapshot.commandOutcome).toMatchObject({
      accepted: null,
      reason: "CANCELLED",
      command: "PAUSE",
      command_id: "command-1",
      run_id: "run-1",
      node_id: "quest-1",
      activation_id: "activation-1",
    });
  });

  it("returns a separate INVALID_STATE disposition for a second attempt without changing the first target", async () => {
    const { controller } = createHarness();
    controller.setConnected(true);
    controller.receive(statePacket(), LESSON_REMOTE_TOPIC_V2);
    const firstAttempt = controller.send("PAUSE");
    const secondAttempt = controller.send("SKIP");

    await expect(secondAttempt).resolves.toBeNull();
    expect(controller.snapshot.commandOutcome).toMatchObject({
      accepted: null,
      reason: "INVALID_STATE",
      command: "SKIP",
      run_id: "run-1",
      node_id: "quest-1",
      activation_id: "activation-1",
    });
    controller.setConnected(false);
    await expect(firstAttempt).resolves.toBeNull();
    expect(controller.snapshot.commandOutcome).toMatchObject({
      accepted: null,
      reason: "TRANSPORT_UNAVAILABLE",
      command: "PAUSE",
      command_id: "command-1",
      run_id: "run-1",
      node_id: "quest-1",
      activation_id: "activation-1",
    });
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
