"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRoomContext } from "@livekit/components-react";
import { ConnectionState, RoomEvent } from "livekit-client";
import {
  LessonGraphRemoteControllerV2,
  type LessonRemotePublisherV2,
} from "@/lib/lesson-graph-remote-v2";

export function useLessonGraphRemoteV2(sessionId: string | null) {
  const room = useRoomContext();

  const controller = useMemo(() => {
    const publish: LessonRemotePublisherV2 = async (packet, options) => {
      if (!room.localParticipant || room.state !== ConnectionState.Connected) {
        throw new Error("LiveKit remote transport is not connected");
      }
      const data = new TextEncoder().encode(JSON.stringify(packet));
      await room.localParticipant.publishData(data, options);
    };

    return new LessonGraphRemoteControllerV2({ sessionId, publish });
  }, [sessionId, room]);

  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );

  useEffect(() => {
    const handleData = (
      payload: Uint8Array,
      _participant: unknown,
      _kind: unknown,
      topic?: string,
    ) => {
      try {
        controller.receive(JSON.parse(new TextDecoder().decode(payload)) as unknown, topic);
      } catch {
        // Malformed packets are ignored; the controller fails closed after valid V2 identity.
      }
    };
    const updateConnection = () => {
      controller.setConnected(room.state === ConnectionState.Connected);
    };

    room.on(RoomEvent.DataReceived, handleData);
    room.on(RoomEvent.ConnectionStateChanged, updateConnection);
    updateConnection();

    return () => {
      room.off(RoomEvent.DataReceived, handleData);
      room.off(RoomEvent.ConnectionStateChanged, updateConnection);
    };
  }, [controller, room]);

  useEffect(() => () => controller.dispose(), [controller]);

  return {
    ...snapshot,
    send: controller.send,
  };
}
