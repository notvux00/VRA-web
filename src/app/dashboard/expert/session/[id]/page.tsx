// @ts-nocheck
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveTelemetry } from "../../_hooks/useLiveTelemetry";
import SessionSummaryModal from "../_components/SessionSummaryModal";
import { getAssignedChildDetail, finalizeSession, syncAndGetChildPhrases } from "@/actions/expert";
import { getChildPhraseSetsV2 } from "@/actions/voice-phrases";
import { getLessonDetail } from "@/actions/lessons";
import POVMonitor from "../_components/POVMonitor";
import { endLessonOnDevice, subscribeToVrHandshake, pushRemoteCommand } from "@/lib/firebase/rtdb";
import { ChildProfile, AutoAlert, BehaviorLog } from "@/types";
import { LiveKitRoomProvider } from "@/components/livekit/LiveKitRoomProvider";
import { useLiveKitDataChannel, QuestStatusPayload } from "@/hooks/useLiveKitDataChannel";
import { useLessonGraphRemoteV2 } from "@/hooks/useLessonGraphRemoteV2";
import { useLessonGraphTelemetryV2 } from "@/hooks/useLessonGraphTelemetryV2";
import {
  resolveLessonRemoteUiModeV2,
  type LessonCommandOutcomeV2,
} from "@/lib/lesson-graph-remote-v2";
import type {
  LessonAuditEventV2,
  LessonCommandKindV2,
  LessonStateV2,
  NodeLogDataV2,
} from "@/types/lesson-graph-v2";
import type { LessonRemoteFeedbackV2 } from "@/lib/lesson-graph-remote-v2";

import SessionHeader from "../../_components/live/SessionHeader";
import RemoteControlPanel from "../../_components/live/RemoteControlPanel";
import NPCChatPanel from "../../_components/live/NPCChatPanel";
import AlertsFooter from "../../_components/live/AlertsFooter";

function LessonGraphRemoteControlsV2({
  state,
  connected,
  stateConfirmed,
  pending,
  rejection,
  commandOutcome,
  nodeLogs,
  auditEvents,
  commandRejections,
  telemetryError,
  onSend,
}: {
  state: LessonStateV2;
  connected: boolean;
  stateConfirmed: boolean;
  pending: boolean;
  rejection: LessonRemoteFeedbackV2 | null;
  commandOutcome: LessonCommandOutcomeV2 | null;
  nodeLogs: NodeLogDataV2[];
  auditEvents: LessonAuditEventV2[];
  commandRejections: LessonAuditEventV2[];
  telemetryError: string | null;
  onSend: (command: LessonCommandKindV2, bindingId?: string) => void;
}) {
  const [selectedHintBindingId, setSelectedHintBindingId] = useState("");
  const hintBindings = state.bindings.filter((binding) => binding.can_verbal_hint || binding.can_visual_hint);
  const selectedHintBinding = hintBindings.find((binding) => binding.binding_id === selectedHintBindingId) || hintBindings[0];
  const canSend = connected && stateConfirmed && !pending;
  const commandTarget = commandOutcome
    ? [
      commandOutcome.run_id && `run ${commandOutcome.run_id}`,
      commandOutcome.node_id && `node ${commandOutcome.node_id}`,
      commandOutcome.activation_id && `activation ${commandOutcome.activation_id}`,
    ].filter(Boolean).join(", ") || "the current session"
    : "";
  const feedback = pending ? "Waiting for the VR command result..."
    : commandOutcome ? commandOutcome.accepted === true
      ? `Accepted ${commandOutcome.command} (${commandOutcome.command_id}) for ${commandTarget}. Awaiting authoritative state.`
      : commandOutcome.accepted === false
        ? `Rejected ${commandOutcome.command} (${commandOutcome.command_id}): ${commandOutcome.reason} for ${commandTarget}.`
        : commandOutcome.reason === "UNCONFIRMED"
          ? `Unconfirmed ${commandOutcome.command}: ${commandOutcome.reason} for ${commandTarget}.`
          : `${commandOutcome.command} not accepted: ${commandOutcome.reason} for ${commandTarget}.`
    : rejection === "UNCONFIRMED"
      ? "No confirmation received. The graph state remains authoritative."
      : rejection ? "Rejected: " + rejection
    : connected && !stateConfirmed ? "Waiting for the matching LiveKit state before commands are enabled."
    : connected ? "Connected to VR." : "Disconnected. Reconnect to send commands.";
  const activeNodeEntry = auditEvents
    .find((event) => event.event_type === "NODE_ENTERED"
      && event.run_id === state.run_id
      && event.node_id === state.node_id
      && event.activation_id === state.activation_id);

  return (
    <section aria-label="Lesson Graph V2 controls" className="space-y-3 rounded-xl border border-emerald-500/30 p-4">
      <h3 className="font-bold text-emerald-300">Lesson Graph V2</h3>
      <p className="text-sm">Current node: {state.node_type || "Node"} / {state.node_id} / #{state.node_index + 1}</p>
      <p className="text-sm">Status: <span className="font-semibold">{state.status}</span></p>
      <p className="text-xs text-zinc-400">Active since (UTC): {activeNodeEntry?.occurred_at_utc || state.updated_at_utc}</p>
      <p className="text-xs text-zinc-500">Free-text NPC speech is unavailable in V2 mode; commands stay tied to the active lesson node.</p>
      <div aria-live="polite" className="text-xs text-zinc-400">{feedback}</div>
      {telemetryError && <p role="status" className="text-xs text-amber-300">Telemetry: {telemetryError}</p>}
      {hintBindings.length > 1 && (
        <label className="block space-y-1 text-sm">
          <span>Hint target</span>
          <select
            aria-label="Hint target"
            className="block w-full rounded border border-zinc-700 bg-zinc-900 p-2"
            value={selectedHintBinding?.binding_id || ""}
            onChange={(event) => setSelectedHintBindingId(event.target.value)}
          >
            {hintBindings.map((binding) => (
              <option key={binding.binding_id} value={binding.binding_id}>
                {binding.npc_binding_id || binding.binding_id}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        <button className="rounded border px-3 py-2 disabled:opacity-40" disabled={!canSend || state.status !== "running"} onClick={() => onSend("SKIP")}>Skip</button>
        <button className="rounded border px-3 py-2 disabled:opacity-40" disabled={!canSend || state.status !== "running"} onClick={() => onSend("PAUSE")}>Pause</button>
        <button className="rounded border px-3 py-2 disabled:opacity-40" disabled={!canSend || state.status !== "paused"} onClick={() => onSend("RESUME")}>Resume</button>
        <button className="rounded border px-3 py-2 disabled:opacity-40" disabled={!canSend || state.status !== "running" || !selectedHintBinding?.can_verbal_hint} onClick={() => onSend("VERBAL_HINT", selectedHintBinding?.binding_id)}>Verbal hint</button>
        <button className="rounded border px-3 py-2 disabled:opacity-40" disabled={!canSend || state.status !== "running" || !selectedHintBinding?.can_visual_hint} onClick={() => onSend("VISUAL_HINT", selectedHintBinding?.binding_id)}>Visual hint</button>
      </div>
      <div className="space-y-2 border-t border-zinc-800 pt-3">
        <h4 className="text-sm font-semibold">Node history</h4>
        {nodeLogs.length === 0 ? (
          <p className="text-xs text-zinc-500">No V2 node history is recorded for this session yet.</p>
        ) : (
          <ol className="space-y-1 text-xs text-zinc-400">
            {nodeLogs.map((log) => (
              <li key={log.event_id}>
                #{log.node_index + 1} {log.node_name || log.node_id}: {log.status}, {log.duration_seconds}s
                ({log.entered_at_utc} – {log.exited_at_utc} UTC)
              </li>
            ))}
          </ol>
        )}
      </div>
      {commandRejections.length > 0 && (
        <div className="space-y-2 border-t border-zinc-800 pt-3">
          <h4 className="text-sm font-semibold">Recent rejected commands</h4>
          <ul className="space-y-1 text-xs text-amber-300">
            {commandRejections.slice(0, 5).map((event) => (
              <li key={event.event_id}>
                {event.command || "Command"}: {event.reason} ({event.occurred_at_utc} UTC)
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
export default function LiveSessionPage() {
  const { id: sessionId } = useParams();
  const rawSessionId = (Array.isArray(sessionId) ? sessionId[0] : sessionId) || "";

  return (
    <LiveKitRoomProvider roomName={rawSessionId}>
      <LiveSessionContent />
    </LiveKitRoomProvider>
  );
}

function LiveSessionContent() {
  const { id: sessionId } = useParams();
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");
  const lessonName = searchParams.get("lesson") || "Bài tập VR";
  const pin = searchParams.get("pin");

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [child, setChild] = useState<ChildProfile | null>(null);
  const [generalPhrasesV2, setGeneralPhrasesV2] = useState<string[]>([]);
  const [lessonDetail, setLessonDetail] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [vrReady, setVrReady] = useState(false);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [manualLogs, setManualLogs] = useState<BehaviorLog[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [npcText, setNpcText] = useState("");
  const [sendingNpc, setSendingNpc] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0.5);
  const [leftWidth, setLeftWidth] = useState(60);
  const [isFooterCollapsed, setIsFooterCollapsed] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = (moveEvent.clientX / window.innerWidth) * 100;
      if (newWidth >= 35 && newWidth <= 75) {
        setLeftWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const alertsScrollRef = useRef<HTMLDivElement>(null);
  const alertsHistoryRef = useRef<AutoAlert[]>([]);
  const manualLogsRef = useRef<BehaviorLog[]>([]);

  // 1. Lấy thông tin bé, bài học và đồng bộ các câu thoại mẫu
  useEffect(() => {
    async function fetchData() {
      if (!user?.uid || !childId) return;
      try {
        const lessonDocId = searchParams.get("lesson");
        if (lessonDocId) {
          const lessonRes = await getLessonDetail(lessonDocId);
          if (lessonRes.success) {
            setLessonDetail(lessonRes.lesson);
            if ((lessonRes.lesson as any)?.voice_schema_version === 2) {
              const phrases = await getChildPhraseSetsV2(childId as string, lessonDocId);
              if (!phrases.success) throw new Error(phrases.error);
              setGeneralPhrasesV2(phrases.general.phrases);
            } else {
              await syncAndGetChildPhrases(childId as string, lessonDocId);
            }
          }
        }

        const res = await getAssignedChildDetail(childId as string);
        if (res.success) {
          setChild(res.child);
        } else {
          setError(res.error || "Không tìm thấy thông tin trẻ");
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin bé hoặc đồng bộ câu thoại:", err);
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) fetchData();
  }, [childId, user?.uid, authLoading, searchParams]);

  // 2. Handshake VR
  useEffect(() => {
    const rawSessionId = (Array.isArray(sessionId) ? sessionId[0] : sessionId) || "";
    if (!rawSessionId) return;

    const handleExit = async () => {
      console.log("Session finished/disconnected from VR, auto exiting...");
      setVrReady(false);
      setIsSessionActive(false);
      if (pin) {
        try {
          await endLessonOnDevice(pin);
        } catch (e) {
          console.error("Error ending lesson:", e);
        }
      }

      const q = new URLSearchParams();
      if (childId) q.set("childId", childId);
      if (pin) {
        q.set("vr", "connected");
        q.set("pin", pin);
      }

      if (childId) {
        router.replace(`/dashboard/expert/stats?${q.toString()}`);
      } else {
        router.replace(`/dashboard/expert?${q.toString()}`);
      }
    };

    const unsubscribe = subscribeToVrHandshake(
      rawSessionId,
      () => {
        setVrReady(true);
        setIsSessionActive(true);
      },
      handleExit, // onEnded
      handleExit // onDisconnect
    );
    return () => unsubscribe();
  }, [sessionId, childId, router, pin]);

  // 3. Telemetry Logic
  const [mutedGroups, setMutedGroups] = useState<string[]>([]);
  const validSessionId = (Array.isArray(sessionId) ? sessionId[0] : sessionId) || null;
  const lessonGraphRemote = useLessonGraphRemoteV2(validSessionId);
  const lessonGraphTelemetry = useLessonGraphTelemetryV2(validSessionId, lessonGraphRemote.state);
  const lessonRemoteMode = resolveLessonRemoteUiModeV2(
    lessonGraphRemote.identifiedV2 || lessonGraphTelemetry.state !== null,
    lessonGraphTelemetry.state,
    validSessionId,
  );
  const remoteStateMatchesTelemetry = Boolean(
    lessonGraphRemote.state
      && lessonGraphTelemetry.state
      && lessonGraphRemote.state.session_id === lessonGraphTelemetry.state.session_id
      && lessonGraphRemote.state.run_id === lessonGraphTelemetry.state.run_id
      && lessonGraphRemote.state.launch_token === lessonGraphTelemetry.state.launch_token
      && lessonGraphRemote.state.node_id === lessonGraphTelemetry.state.node_id
      && lessonGraphRemote.state.activation_id === lessonGraphTelemetry.state.activation_id
      && lessonGraphRemote.state.state_revision === lessonGraphTelemetry.state.state_revision,
  );
  const { telemetry, activeAlerts, sessionTime, currentQuest } = useLiveTelemetry(
    isSessionActive && vrReady ? validSessionId : null,
    isSessionActive,
    mutedGroups,
    child?.default_lesson_params?.actions
  );

  // 4. LiveKit Data Channel (Voice Commands & Agent Events)
  const handleQuestStatus = useCallback((status: QuestStatusPayload) => {
    console.log("[LiveSessionPage] LiveKit Quest Status:", status);
  }, []);

  const { sendVerbalHint, sendSpeakScript } = useLiveKitDataChannel(handleQuestStatus);

  // 5. Remote Commands Dispatchers
  // (a) Voice/Speech commands via LiveKit DataPackets
  const handleTriggerVerbalHint = async () => {
    try {
      console.log("[LiveSessionPage] Sending VERBAL_HINT via LiveKit DataPacket...");
      const success = await sendVerbalHint();
      if (success) {
        showToast("Gửi Gợi ý Lời nói thành công (LiveKit)!");
      } else {
        showToast("Lỗi gửi Gợi ý Lời nói qua LiveKit.");
      }
    } catch (e: unknown) {
      console.error("Failed to send VERBAL_HINT:", e);
      showToast("Lỗi: Không thể gửi lệnh Gợi ý Lời nói.");
    }
  };

  const handleSendNpcScript = async (customText?: string) => {
    const textToSend = (typeof customText === "string" ? customText : npcText).trim();
    if (!textToSend) return;
    setSendingNpc(true);
    try {
      console.log("[LiveSessionPage] Sending SPEAK_SCRIPT via LiveKit DataPacket:", textToSend);
      const success = await sendSpeakScript(textToSend);
      if (success) {
        showToast("Đã gửi câu thoại thành công tới AI Agent!");
        if (typeof customText !== "string") {
          setNpcText("");
        }
      } else {
        showToast("Lỗi gửi câu thoại tới LiveKit.");
      }
    } catch (e: unknown) {
      console.error("Failed to send SPEAK_SCRIPT:", e);
      showToast(`Lỗi: ${(e instanceof Error ? e.message : String(e)) || "Không thể gửi lệnh thoại NPC."}`);
    } finally {
      setSendingNpc(false);
    }
  };

  // (b) Control commands remain on Firebase RTDB
  const handleTriggerVisualHint = async () => {
    if (!validSessionId) return;
    try {
      console.log("[LiveSessionPage] Sending trigger_visual_hint to RTDB...");
      await pushRemoteCommand(validSessionId, "trigger_visual_hint");
      showToast("Gửi lệnh Gợi ý Hình ảnh thành công!");
    } catch (e: unknown) {
      console.error("Failed to send trigger_visual_hint command:", (e instanceof Error ? e.message : String(e)));
      showToast("Lỗi: Không thể gửi lệnh Gợi ý Hình ảnh.");
    }
  };

  const handleForceSkip = async () => {
    if (!validSessionId) return;
    try {
      console.log("[LiveSessionPage] Sending skip_quest to RTDB...");
      await pushRemoteCommand(validSessionId, "skip_quest");
      showToast("Gửi lệnh Skip Quest thành công!");
    } catch (e: unknown) {
      console.error("Failed to send skip_quest command:", (e instanceof Error ? e.message : String(e)));
      showToast("Lỗi: Không thể gửi lệnh Skip Quest.");
    }
  };

  const handleSendLessonCommandV2 = async (command: LessonCommandKindV2, bindingId = "") => {
    const result = await lessonGraphRemote.send(command, bindingId);
    if (!result) {
      showToast("Command unconfirmed or transport unavailable; no progress was assumed.");
      return;
    }
    showToast(result.accepted ? "Command accepted by VR; waiting for authoritative state." : "Command rejected: " + result.reason);
  };

  const handleAdjustVolume = async (volume: number) => {
    if (!validSessionId) return;
    try {
      console.log(`[LiveSessionPage] Sending set_volume (${volume}) to RTDB...`);
      await pushRemoteCommand(validSessionId, "set_volume", volume);
      showToast("Đã gửi yêu cầu đổi âm lượng!");
    } catch (e: unknown) {
      console.error("Failed to send set_volume command:", (e instanceof Error ? e.message : String(e)));
      showToast("Lỗi: Không thể đổi âm lượng.");
    }
  };

  // Cuộn thanh ngang alert sang phải mỗi khi có alert mới
  useEffect(() => {
    if (activeAlerts.length > 0) {
      activeAlerts.forEach((alert) => {
        if (!alertsHistoryRef.current.find((a: AutoAlert) => a.id === alert.id)) {
          alertsHistoryRef.current.push(alert);
        }
      });
      if (alertsScrollRef.current) {
        alertsScrollRef.current.scrollLeft = alertsScrollRef.current.scrollWidth;
      }
    }
  }, [activeAlerts]);

  const toggleMute = (group: string) => {
    setMutedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const handleQuickLog = (event: string, note: string) => {
    const newLog = {
      log_id: crypto.randomUUID(),
      time_offset: sessionTime,
      event,
      note,
      triggered_by: user?.uid || "unknown",
      timestamp: Date.now(),
    };
    setManualLogs((prev) => {
      const next = [...prev, newLog];
      manualLogsRef.current = next;
      return next;
    });
  };

  const handleFinalSave = async (summary: Record<string, unknown>) => {
    if (!childId) {
      router.push("/dashboard/expert");
      return;
    }

    try {
      const res = await finalizeSession(childId as string, sessionId as string, {
        lessonName: lessonName,
        duration: summary.duration,
        score: summary.score,
        status: summary.status,
        evaluation: summary.evaluation,
        alerts: summary.alerts,
        behaviorLogs: manualLogs,
      });

      if (res.success) {
        console.log("Session saved successfully!");
        setIsSummaryModalOpen(false);
        const q = new URLSearchParams();
        if (childId) q.set("childId", childId);
        if (pin) {
          q.set("vr", "connected");
          q.set("pin", pin);
        }
        router.push(`/dashboard/expert/stats?${q.toString()}`);
      } else {
        alert("Lỗi khi lưu báo cáo: " + res.error);
      }
    } catch (err) {
      console.error("Final save error:", err);
      alert("Lỗi kết nối khi lưu báo cáo");
    }
  };

  if (authLoading || loading) return <p>Đang tải...</p>;
  if (error) return <p className="p-8 text-white">{error}</p>;

  // Nếu màn hình đang chờ VR kết nối
  if (!vrReady) {
    return (
      <div className="h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8">
        <Loader2 className="animate-spin mb-4 text-emerald-500" size={48} />
        <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest text-emerald-400">
          Đang chờ kính VR
        </h2>
        <p className="text-zinc-500">
          Giáo viên đã chuẩn bị bài {lessonName}. Vui lòng đeo kính cho bé.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-8 px-6 py-2 border border-zinc-800 rounded hover:bg-zinc-900 transition-colors"
        >
          Hủy buổi học
        </button>
      </div>
    );
  }

  // MÀN HÌNH CHÍNH
  return (
    <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
      <SessionHeader
        lessonName={lessonName}
        child={child}
        sessionTime={sessionTime}
        onBack={() => router.back()}
        onSave={() => setIsSummaryModalOpen(true)}
      />

      {/* TOAST UI */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg font-bold text-xs animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* VÙNG GIỮA */}
      <div className="flex-1 flex min-h-0">
        {/* CỘT TRÁI: POV */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="relative bg-zinc-950 flex flex-col min-w-[35%] max-w-[75%]"
        >
          <div className="absolute inset-4 rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
            <div className="absolute inset-0 w-full h-full">
              <POVMonitor
                telemetry={telemetry}
                childName={child?.name || "Bé"}
              />
            </div>
            <div className="absolute bottom-4 right-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 backdrop-blur-md px-4 py-1.5 rounded font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] z-10">
              {lessonRemoteMode === "v2" && lessonGraphTelemetry.state
                ? `${lessonGraphTelemetry.state.node_type} / ${lessonGraphTelemetry.state.node_id}`
                : lessonRemoteMode === "v2-pending" ? "Waiting for V2 lesson state" : currentQuest}
            </div>
          </div>
        </div>

        {/* ĐƯỜNG PHÂN CHIA CO GIÃN */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1.5 cursor-col-resize bg-zinc-900 border-l border-r border-white/5 hover:bg-emerald-500 active:bg-emerald-500 transition-colors z-20 self-stretch select-none flex-shrink-0"
        />

        {/* CỘT PHẢI */}
        <div
          style={{ width: `${100 - leftWidth}%` }}
          className="bg-zinc-950 flex flex-col min-h-0 min-w-[25%] max-w-[65%] @container"
        >
          <div className="flex-1 grid grid-cols-1 @xl:grid-cols-2 gap-4 p-4 overflow-y-auto min-h-0">
            {lessonRemoteMode === "legacy" ? (
              <>
            <RemoteControlPanel
              volumeLevel={volumeLevel}
              onVolumeChange={(val: number) => {
                setVolumeLevel(val);
                handleAdjustVolume(val);
              }}
              onTriggerVerbalHint={handleTriggerVerbalHint}
              onTriggerVisualHint={handleTriggerVisualHint}
              onForceSkip={handleForceSkip}
            />
            {lessonDetail?.voice_schema_version === 2 ? (
              <section className="space-y-3 rounded-xl border p-4">
                <h3 className="font-bold">Khích lệ chung</h3>
                {generalPhrasesV2.map((phrase, index) => <button key={index} disabled={sendingNpc} onClick={() => handleSendNpcScript(phrase)} className="block rounded-lg border p-2">{phrase}</button>)}
                {generalPhrasesV2.length === 0 && <p>Chưa có mẫu câu chung.</p>}
              </section>
            ) : <NPCChatPanel
              npcText={npcText}
              setNpcText={setNpcText}
              sendingNpc={sendingNpc}
              onSendNpcScript={handleSendNpcScript}
              child={child}
              lessonDocId={searchParams.get("lesson") || ""}
              currentQuest={currentQuest}
              lessonQuests={lessonDetail?.quests || []}
            />}
              </>
            ) : lessonRemoteMode === "v2" && lessonGraphTelemetry.state ? (
              <LessonGraphRemoteControlsV2
                state={lessonGraphTelemetry.state}
                connected={lessonGraphRemote.connected}
                stateConfirmed={remoteStateMatchesTelemetry}
                pending={lessonGraphRemote.pending}
                rejection={lessonGraphRemote.rejection}
                commandOutcome={lessonGraphRemote.commandOutcome?.session_id === validSessionId
                  ? lessonGraphRemote.commandOutcome
                  : null}
                nodeLogs={lessonGraphTelemetry.nodeLogs}
                auditEvents={lessonGraphTelemetry.auditEvents}
                commandRejections={lessonGraphTelemetry.commandRejections}
                telemetryError={lessonGraphTelemetry.error}
                onSend={handleSendLessonCommandV2}
              />
            ) : (
              <section aria-live="polite" className="space-y-2 rounded-xl border p-4">
                <h3 className="font-bold">Lesson Graph V2</h3>
                <p className="text-sm text-zinc-400">{lessonGraphRemote.connected ? "Waiting for validated V2 lesson state. Remote controls are paused." : "Waiting for the VR connection. Remote controls are paused."}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      <AlertsFooter
        isFooterCollapsed={isFooterCollapsed}
        setIsFooterCollapsed={setIsFooterCollapsed}
        mutedGroups={mutedGroups}
        toggleMute={toggleMute}
        activeAlerts={activeAlerts}
        alertsScrollRef={alertsScrollRef}
        manualLogs={manualLogs}
        onQuickLog={handleQuickLog}
      />

      <SessionSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onSave={handleFinalSave}
        sessionTime={sessionTime}
        // eslint-disable-next-line react-hooks/refs
        alerts={alertsHistoryRef.current}
        logsCount={manualLogs.length}
        childName={child?.name || "Bé"}
      />
    </div>
  );
}
