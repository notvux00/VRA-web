"use client";

import { useEffect, useState } from "react";
import { collection, doc, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { onValue as onRtdbValue, ref } from "firebase/database";
import { db, rtdb } from "@/lib/firebase/client";
import type { LessonAuditEventV2, LessonStateV2, NodeLogDataV2 } from "@/types/lesson-graph-v2";
import {
  createLessonGraphTelemetrySubscriptionV2,
  parseLessonAuditEventsV2,
  parseLessonGraphStateV2,
  parseLessonNodeLogsV2,
  selectLatestLessonTelemetryStateV2,
  selectCurrentLessonTelemetryStateV2,
  type LessonGraphTelemetrySourcesV2,
  type LessonTelemetrySelectionV2,
} from "@/lib/lesson-graph-telemetry-v2";

interface LessonGraphTelemetrySnapshotV2 {
  sessionId: string | null;
  state: LessonStateV2 | null;
  nodeLogs: NodeLogDataV2[];
  auditEvents: LessonAuditEventV2[];
  error: string | null;
}

const emptySnapshot = (sessionId: string | null): LessonGraphTelemetrySnapshotV2 => ({
  sessionId,
  state: null,
  nodeLogs: [],
  auditEvents: [],
  error: null,
});

const firebaseSources: LessonGraphTelemetrySourcesV2 = {
  subscribeState: (sessionId, onState, onError) => onRtdbValue(
    ref(rtdb, `live_sessions/${sessionId}/lesson_graph`),
    (snapshot) => onState(snapshot.val()),
    onError,
  ),
  subscribeNodeLogs: (sessionId, onNodeLogs, onError) => onSnapshot(
    doc(db, "sessions", sessionId),
    (snapshot) => onNodeLogs(snapshot.exists() ? snapshot.data().node_logs : undefined),
    onError,
  ),
  subscribeAuditEvents: (sessionId, onAuditEvents, onError) => {
    const auditQuery = query(
      collection(db, "sessions", sessionId, "lesson_events"),
      orderBy("occurred_at_utc", "desc"),
      limit(100),
    );
    return onSnapshot(
      auditQuery,
      (snapshot) => onAuditEvents(snapshot.docs.map((item) => item.data())),
      onError,
    );
  },
};

export function useLessonGraphTelemetryV2(
  sessionId: string | null,
  packetState: LessonStateV2 | null = null,
) {
  const [snapshot, setSnapshot] = useState<LessonGraphTelemetrySnapshotV2>(() => emptySnapshot(sessionId));
  const [retainedSelection, setRetainedSelection] = useState<LessonTelemetrySelectionV2>(() => ({
    sessionId,
    state: null,
  }));

  useEffect(() => {
    if (!sessionId) return;

    return createLessonGraphTelemetrySubscriptionV2(sessionId, {
      onState: (value) => {
        const incoming = parseLessonGraphStateV2(value, sessionId);
        setSnapshot((current) => {
          const scoped = current.sessionId === sessionId ? current : emptySnapshot(sessionId);
          return {
            ...scoped,
            state: selectLatestLessonTelemetryStateV2(scoped.state, incoming, sessionId),
          };
        });
      },
      onNodeLogs: (value) => setSnapshot((current) => {
        const scoped = current.sessionId === sessionId ? current : emptySnapshot(sessionId);
        return { ...scoped, nodeLogs: parseLessonNodeLogsV2(value, sessionId) };
      }),
      onAuditEvents: (value) => setSnapshot((current) => {
        const scoped = current.sessionId === sessionId ? current : emptySnapshot(sessionId);
        return { ...scoped, auditEvents: parseLessonAuditEventsV2(value, sessionId) };
      }),
      onError: (error) => setSnapshot((current) => {
        const scoped = current.sessionId === sessionId ? current : emptySnapshot(sessionId);
        return { ...scoped, error: error instanceof Error ? error.message : String(error) };
      }),
    }, firebaseSources);
  }, [sessionId]);

  const scopedSnapshot = snapshot.sessionId === sessionId ? snapshot : emptySnapshot(sessionId);
  const selection = selectCurrentLessonTelemetryStateV2(
    retainedSelection,
    sessionId,
    scopedSnapshot.state,
    packetState,
  );
  if (selection.sessionId !== retainedSelection.sessionId || selection.state !== retainedSelection.state) {
    setRetainedSelection(selection);
  }
  const state = selection.state;
  const commandRejections = scopedSnapshot.auditEvents.filter(
    (event) => event.event_type === "COMMAND_REJECTED" && event.reason.length > 0,
  );

  return {
    state,
    nodeLogs: scopedSnapshot.nodeLogs,
    auditEvents: scopedSnapshot.auditEvents,
    commandRejections,
    error: scopedSnapshot.error,
  };
}
