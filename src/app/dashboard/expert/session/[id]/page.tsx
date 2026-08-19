"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveTelemetry } from "../../_hooks/useLiveTelemetry";
import SessionSummaryModal from "../_components/SessionSummaryModal";
import { getAssignedChildDetail, finalizeSession, syncAndGetChildPhrases } from "@/actions/expert";
import { getLessonDetail } from "@/actions/lessons";
import POVMonitor from "../_components/POVMonitor";
import { endLessonOnDevice, subscribeToVrHandshake, pushRemoteCommand } from "@/lib/firebase/rtdb";
import { LiveKitRoomProvider } from "@/components/livekit/LiveKitRoomProvider";
import { useLiveKitDataChannel, QuestStatusPayload } from "@/hooks/useLiveKitDataChannel";

import SessionHeader from "../../_components/live/SessionHeader";
import RemoteControlPanel from "../../_components/live/RemoteControlPanel";
import NPCChatPanel from "../../_components/live/NPCChatPanel";
import AlertsFooter from "../../_components/live/AlertsFooter";

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

  const [child, setChild] = useState<any>(null);
  const [lessonDetail, setLessonDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [vrReady, setVrReady] = useState(false);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [manualLogs, setManualLogs] = useState<any[]>([]);
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
  const alertsHistoryRef = useRef<any[]>([]);
  const manualLogsRef = useRef<any[]>([]);

  // 1. Lấy thông tin bé, bài học và đồng bộ các câu thoại mẫu
  useEffect(() => {
    async function fetchData() {
      if (!user?.uid || !childId) return;
      try {
        const lessonDocId = searchParams.get("lesson");
        if (lessonDocId) {
          await syncAndGetChildPhrases(childId as string, lessonDocId);

          const lessonRes = await getLessonDetail(lessonDocId);
          if (lessonRes.success) {
            setLessonDetail(lessonRes.lesson);
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
    } catch (e: any) {
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
    } catch (e: any) {
      console.error("Failed to send SPEAK_SCRIPT:", e);
      showToast(`Lỗi: ${e.message || "Không thể gửi lệnh thoại NPC."}`);
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
    } catch (e: any) {
      console.error("Failed to send trigger_visual_hint command:", e.message);
      showToast("Lỗi: Không thể gửi lệnh Gợi ý Hình ảnh.");
    }
  };

  const handleForceSkip = async () => {
    if (!validSessionId) return;
    try {
      console.log("[LiveSessionPage] Sending skip_quest to RTDB...");
      await pushRemoteCommand(validSessionId, "skip_quest");
      showToast("Gửi lệnh Skip Quest thành công!");
    } catch (e: any) {
      console.error("Failed to send skip_quest command:", e.message);
      showToast("Lỗi: Không thể gửi lệnh Skip Quest.");
    }
  };

  const handleAdjustVolume = async (volume: number) => {
    if (!validSessionId) return;
    try {
      console.log(`[LiveSessionPage] Sending set_volume (${volume}) to RTDB...`);
      await pushRemoteCommand(validSessionId, "set_volume", volume);
      showToast("Đã gửi yêu cầu đổi âm lượng!");
    } catch (e: any) {
      console.error("Failed to send set_volume command:", e.message);
      showToast("Lỗi: Không thể đổi âm lượng.");
    }
  };

  // Cuộn thanh ngang alert sang phải mỗi khi có alert mới
  useEffect(() => {
    if (activeAlerts.length > 0) {
      activeAlerts.forEach((alert) => {
        if (!alertsHistoryRef.current.find((a: any) => a.id === alert.id)) {
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

  const handleFinalSave = async (summary: any) => {
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
              {currentQuest}
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
            <NPCChatPanel
              npcText={npcText}
              setNpcText={setNpcText}
              sendingNpc={sendingNpc}
              onSendNpcScript={handleSendNpcScript}
              child={child}
              lessonDocId={searchParams.get("lesson") || ""}
              currentQuest={currentQuest}
              lessonQuests={lessonDetail?.quests || []}
            />
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
        alerts={alertsHistoryRef.current}
        logsCount={manualLogs.length}
        childName={child?.name || "Bé"}
      />
    </div>
  );
}
