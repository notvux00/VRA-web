"use client";

import { useEffect, useState, useCallback } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

export interface QuestStatusPayload {
  quest_name: string;
  status: "active" | "matched" | string;
  phrases_cached?: boolean;
}

export function useLiveKitDataChannel(
  onQuestStatus?: (status: QuestStatusPayload) => void
) {
  let room: any = null;
  try {
    room = useRoomContext();
  } catch (e) {
    // If used outside LiveKitRoom context, gracefully handle null
  }

  const [lastEvent, setLastEvent] = useState<any>(null);

  const sendDataPacket = useCallback(
    async (eventName: string, extraData?: Record<string, any>) => {
      if (!room || !room.localParticipant) {
        console.warn("[LiveKitDataChannel] Room or local participant not available");
        return false;
      }

      try {
        const payload = JSON.stringify({
          event: eventName,
          ...(extraData || {}),
        });
        const encoder = new TextEncoder();
        const data = encoder.encode(payload);

        await room.localParticipant.publishData(data, { reliable: true });
        console.log(`[LiveKitDataChannel] Sent ${eventName}:`, payload);
        return true;
      } catch (err) {
        console.error(`[LiveKitDataChannel] Failed to send ${eventName}:`, err);
        return false;
      }
    },
    [room]
  );

  const sendVerbalHint = useCallback(async () => {
    return sendDataPacket("VERBAL_HINT");
  }, [sendDataPacket]);

  const sendSpeakScript = useCallback(
    async (text: string) => {
      return sendDataPacket("SPEAK_SCRIPT", { text });
    },
    [sendDataPacket]
  );

  useEffect(() => {
    if (!room) return;

    const handleData = (
      payload: Uint8Array,
      participant: any,
      kind: any,
      topic?: string
    ) => {
      try {
        const decoder = new TextDecoder();
        const text = decoder.decode(payload);
        const data = JSON.parse(text);
        setLastEvent(data);

        if (data.event === "QUEST_STATUS" && onQuestStatus) {
          onQuestStatus({
            quest_name: data.quest_name,
            status: data.status,
            phrases_cached: data.phrases_cached,
          });
        }
      } catch (err) {
        console.error("[LiveKitDataChannel] Error parsing incoming packet:", err);
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, onQuestStatus]);

  return {
    sendDataPacket,
    sendVerbalHint,
    sendSpeakScript,
    lastEvent,
    isReady: Boolean(room && room.state === "connected"),
  };
}
