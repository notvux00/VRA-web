import { afterEach, describe, expect, it, vi } from "vitest";
import type { LessonStateV2 } from "@/types/lesson-graph-v2";

const harness = vi.hoisted(() => ({
  effects: [] as Array<() => void | (() => void)>,
  captureEffects: true,
  memoizedController: undefined as unknown,
  lifecycleRef: undefined as unknown,
  room: undefined as unknown,
}));

vi.mock("react", () => ({
  useMemo: (factory: () => unknown) => {
    if (harness.memoizedController === undefined) harness.memoizedController = factory();
    return harness.memoizedController;
  },
  useRef: (initialValue: unknown) => {
    if (harness.lifecycleRef === undefined) harness.lifecycleRef = { current: initialValue };
    return harness.lifecycleRef;
  },
  useEffect: (effect: () => void | (() => void)) => {
    if (harness.captureEffects) harness.effects.push(effect);
  },
  useSyncExternalStore: (_subscribe: () => () => void, getSnapshot: () => unknown) => getSnapshot(),
}));

vi.mock("@livekit/components-react", () => ({
  useRoomContext: () => harness.room,
}));

import { useLessonGraphRemoteV2 } from "@/hooks/useLessonGraphRemoteV2";
import { RoomEvent } from "livekit-client";

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
  bindings: [],
};

afterEach(() => {
  harness.effects = [];
  harness.captureEffects = true;
  harness.memoizedController = undefined;
  harness.lifecycleRef = undefined;
  harness.room = undefined;
});

describe("useLessonGraphRemoteV2 lifecycle", () => {
  it("keeps the same session controller live through StrictMode effect replay", async () => {
    const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
    const room = {
      state: "connected",
      localParticipant: { publishData: vi.fn(async () => {}) },
      on: (event: string, listener: (...args: unknown[]) => void) => {
        const eventListeners = listeners.get(event) ?? new Set();
        eventListeners.add(listener);
        listeners.set(event, eventListeners);
      },
      off: (event: string, listener: (...args: unknown[]) => void) => listeners.get(event)?.delete(listener),
    };
    harness.room = room;

    useLessonGraphRemoteV2("session-1");

    const strictEffects = harness.effects.map((effect) => effect());
    strictEffects.forEach((cleanup) => {
      if (cleanup) cleanup();
    });
    const replayCleanups = harness.effects.map((effect) => effect());

    const packet = new TextEncoder().encode(JSON.stringify({
      contract_version: 2,
      event: "LESSON_STATE",
      state,
    }));
    listeners.get(RoomEvent.DataReceived)?.forEach((listener) => {
      listener(packet, undefined, undefined, "lesson-graph-v2.remote");
    });
    await Promise.resolve();

    harness.captureEffects = false;
    const result = useLessonGraphRemoteV2("session-1");
    expect(result.state).toEqual(state);

    replayCleanups.forEach((cleanup) => {
      if (cleanup) cleanup();
    });
    await Promise.resolve();
  });
});
