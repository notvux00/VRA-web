"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Loader2, AlertCircle, 
  MessageSquarePlus, Save, Eye, Video, 
  ThumbsUp, Frown, Lightbulb, SkipForward, Volume2, Mic, MessageCircle,
  Bell, BellOff, ChevronDown, ChevronUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveTelemetry } from "../../_hooks/useLiveTelemetry";
import SessionSummaryModal from "../_components/SessionSummaryModal";
import { getAssignedChildDetail, finalizeSession, syncAndGetChildPhrases } from "@/actions/expert";
import { getLessonDetail } from "@/actions/lessons";
import AlertSidebar from "../_components/AlertSidebar";
import POVMonitor from "../_components/POVMonitor";
import { endLessonOnDevice, subscribeToVrHandshake, pushRemoteCommand } from "@/lib/firebase/rtdb";
import { useWebRTCViewer } from "../../_hooks/useWebRTCViewer";

export default function LiveSessionPage() {
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
          // Tự động đồng bộ các mẫu câu mới nhất của bài học vào hồ sơ trẻ nếu chưa có (self-healing)
          await syncAndGetChildPhrases(childId as string, lessonDocId);
          
          // Tải thông tin chi tiết của bài học (để lấy tiêu đề tiếng Việt của quest)
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
      if (pin) try { await endLessonOnDevice(pin); } catch (e) { console.error("Error ending lesson:", e); }
      
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
      (data) => {
        setVrReady(true);
        setIsSessionActive(true);
      },
      handleExit, // onEnded
      handleExit  // onDisconnect
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
  
  // 4. WebRTC POV Logic
  const { stream, connectionState } = useWebRTCViewer(isSessionActive && vrReady && validSessionId ? validSessionId : "");

  // 5. Remote Commands Dispatchers
  const handleTriggerVerbalHint = async () => {
    if (!validSessionId) return;
    try {
      console.log("[LiveSessionPage] Sending trigger_verbal_hint command...");
      await pushRemoteCommand(validSessionId, "trigger_verbal_hint");
      showToast("Gửi lệnh Gợi ý Lời nói thành công!");
    } catch (e: any) {
      console.error("Failed to send trigger_verbal_hint command:", e.message);
      showToast("Lỗi: Không thể gửi lệnh Gợi ý Lời nói.");
    }
  };

  const handleTriggerVisualHint = async () => {
    if (!validSessionId) return;
    try {
      console.log("[LiveSessionPage] Sending trigger_visual_hint command...");
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
      console.log("[LiveSessionPage] Sending skip_quest command...");
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
      console.log(`[LiveSessionPage] Sending set_volume (${volume}) command...`);
      await pushRemoteCommand(validSessionId, "set_volume", volume);
      showToast("Đã gửi yêu cầu đổi âm lượng!");
    } catch (e: any) {
      console.error("Failed to send set_volume command:", e.message);
      showToast("Lỗi: Không thể đổi âm lượng.");
    }
  };

  const handleSendNpcScript = async (customText?: any) => {
    const textToSend = (typeof customText === "string" ? customText : npcText).trim();
    if (!validSessionId || !textToSend) return;
    setSendingNpc(true);
    try {
      console.log("[LiveSessionPage] Calling /api/tts to generate audio...");
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToSend,
          sessionId: validSessionId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo file âm thanh");
      }

      const { url } = await res.json();
      console.log("[LiveSessionPage] TTS generated successfully. URL:", url);

      await pushRemoteCommand(validSessionId, "play_npc_script", {
        audio_url: url,
        text: textToSend,
      });

      showToast("Đã gửi câu thoại thành công tới NPC!");
      if (typeof customText !== "string") {
        setNpcText("");
      }
    } catch (e: any) {
      console.error("Failed to send play_npc_script command:", e.message);
      showToast(`Lỗi: ${e.message || "Không thể gửi lệnh thoại NPC."}`);
    } finally {
      setSendingNpc(false);
    }
  };

  // Cuộn thanh ngang alert sang phải mỗi khi có alert mới
  useEffect(() => {
    if (activeAlerts.length > 0) {
      activeAlerts.forEach(alert => {
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
    setMutedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleQuickLog = (event: string, note: string) => {
    const newLog = {
      log_id: crypto.randomUUID(),
      time_offset: sessionTime,
      event,
      note,
      triggered_by: user?.uid || "unknown",
      timestamp: Date.now()
    };
    setManualLogs(prev => {
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
        behaviorLogs: manualLogs
      });

      if (res.success) {
        console.log("Session saved successfully!");
        setIsSummaryModalOpen(false);
        // Redirect to child stats/history page instead of profile selection
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
        <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest text-emerald-400">Đang chờ kính VR</h2>
        <p className="text-zinc-500">Giáo viên đã chuẩn bị bài {lessonName}. Vui lòng đeo kính cho bé.</p>
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
      {/* HEADER DỌC THEO MÀN HÌNH */}
      <header className="h-14 border-b border-white/5 bg-zinc-950 flex items-center justify-between px-4 shrink-0 transition-all">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="font-mono text-sm tracking-widest text-zinc-400">
              {Math.floor(sessionTime / 60).toString().padStart(2, "0")}:{Math.floor(sessionTime % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <h1 className="font-bold uppercase tracking-wide text-xs">{lessonName} <span className="text-zinc-600">—</span> {child?.name}</h1>
        </div>
        <button onClick={() => setIsSummaryModalOpen(true)} className="flex items-center gap-2 bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 px-4 py-1.5 rounded text-xs font-bold transition-colors">
          <Save size={14} /> CHỐT BÁO CÁO
        </button>
      </header>

      {/* TOAST UI */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg font-bold text-xs animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* VÙNG GIỮA: CHIA 2 CỘT (60% POV - 40% CONTROLS) */}
      <div className="flex-1 flex min-h-0">
        
        {/* CỘT TRÁI: POV */}
        <div 
          style={{ width: `${leftWidth}%` }} 
          className="relative bg-zinc-950 flex flex-col min-w-[35%] max-w-[75%]"
        >
          {/* POV Video Container */}
          <div className="absolute inset-4 rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
            
            {/* POV Component */}
            <div className="absolute inset-0 w-full h-full">
               <POVMonitor 
                 telemetry={telemetry} 
                 childName={child?.name || "Bé"} 
                 stream={stream} 
                 connectionState={connectionState} 
               />
            </div>
            <div className="absolute bottom-4 right-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 backdrop-blur-md px-4 py-1.5 rounded font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] z-10">
              {currentQuest}
            </div>
          </div>
        </div>

        {/* ĐƯỜNG PHÂN CHIA CO GIÃN (DRAGGABLE DIVIDER) */}
        <div 
          onMouseDown={handleMouseDown}
          className="w-1.5 cursor-col-resize bg-zinc-900 border-l border-r border-white/5 hover:bg-emerald-500 active:bg-emerald-500 transition-colors z-20 self-stretch select-none flex-shrink-0"
        />

        {/* CỘT PHẢI: CHIẾN DỊCH & REMOTE CONTROL */}
        <div 
          style={{ width: `${100 - leftWidth}%` }} 
          className="bg-zinc-950 flex flex-col min-h-0 min-w-[25%] max-w-[65%] @container"
        >
          <div className="flex-1 grid grid-cols-1 @xl:grid-cols-2 gap-4 p-4 overflow-y-auto min-h-0">
            

              {/* Tác động từ xa */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Tác Động Từ Xa (Remote)</h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleTriggerVerbalHint}
                    className="flex items-center gap-3 w-full bg-zinc-900/60 border border-white/5 hover:border-zinc-500 p-2.5 rounded-lg text-left transition-all group"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <MessageCircle size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-zinc-200">Gợi Ý Lời Nói (Verbal)</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleTriggerVisualHint}
                    className="flex items-center gap-3 w-full bg-zinc-900/60 border border-white/5 hover:border-zinc-500 p-2.5 rounded-lg text-left transition-all group"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <Eye size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-zinc-200">Gợi Ý Thị Giác (Visual)</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleForceSkip}
                    className="flex items-center gap-3 w-full bg-zinc-900/60 border border-white/5 hover:border-zinc-500 p-2.5 rounded-lg text-left transition-all group"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <SkipForward size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-zinc-200">Force Skip</div>
                    </div>
                  </button>

                  <div className="w-full bg-zinc-900/60 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center">
                          <Volume2 size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-200">Âm lượng hệ thống</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-fuchsia-400">{Math.round(volumeLevel * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volumeLevel}
                      onChange={async (e) => {
                        const val = parseFloat(e.target.value);
                        setVolumeLevel(val);
                        await handleAdjustVolume(val);
                      }}
                      className="w-full accent-fuchsia-500 h-1 bg-zinc-800 rounded-lg cursor-pointer appearance-none"
                    />
                  </div>
                </div>
              </div>

            {/* Cột 2: Giao tiếp NPC, Mẫu câu nhanh */}
            <div className="space-y-4">
              {/* Nói qua NPC (TTS) */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
                <div className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                  <MessageCircle size={14} className="text-blue-400" />
                  <span>Nói qua NPC (TTS)</span>
                </div>
                <textarea
                  value={npcText}
                  onChange={(e) => setNpcText(e.target.value)}
                  placeholder="Nhập nội dung thoại tiếng Việt (tối đa 200 ký tự)..."
                  maxLength={200}
                  className="w-full bg-black border border-white/10 rounded p-2.5 text-xs text-white resize-none h-16 focus:outline-none focus:border-zinc-500"
                />
                <button
                  disabled={sendingNpc || !npcText.trim()}
                  onClick={() => handleSendNpcScript()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                  {sendingNpc ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <span>Gửi câu thoại</span>
                  )}
                </button>
              </div>

              {/* Mẫu câu nhanh */}
              {(() => {
                const lessonDocId = searchParams.get("lesson") || "";
                const childPhrases = child?.quick_phrases || {};
                const questsList = lessonDetail?.quests || [];
                const activeQuestObj = questsList.find((q: any) => (q.id && q.id === currentQuest) || q.title === currentQuest);
                const activeQuestTitle = activeQuestObj ? activeQuestObj.title : currentQuest;

                let activeQuestPhrases: string[] = [];
                let otherQuestsList: Array<{ key: string; title: string; phrases: string[] }> = [];

                if (Array.isArray(lessonPhrases)) {
                  lessonPhrases.forEach((item: any, idx: number) => {
                    const qName = item.quest_name || item.title || "";
                    const phrasesArr = item.phrases || item.default_phrases || [];
                    if (qName === currentQuest || idx.toString() === currentQuest || (activeQuestObj && qName === activeQuestObj.title)) {
                      activeQuestPhrases = phrasesArr;
                    } else {
                      otherQuestsList.push({ key: qName || `quest_${idx}`, title: qName || `Nhiệm vụ ${idx + 1}`, phrases: phrasesArr });
                    }
                  });
                } else if (typeof lessonPhrases === 'object' && lessonPhrases !== null) {
                  const lessonQuestKeys = Object.keys(lessonPhrases).filter(k => k !== "general");
                  activeQuestPhrases = lessonPhrases[currentQuest] || [];
                  otherQuestsList = lessonQuestKeys.filter(k => k !== currentQuest).map(qKey => {
                    const questObj = questsList.find((q: any) => (q.id && q.id === qKey) || q.title === qKey);
                    return { key: qKey, title: questObj ? questObj.title : qKey, phrases: lessonPhrases[qKey] || [] };
                  });
                }

                const generalPhrases = childPhrases["general"] || (typeof lessonPhrases === 'object' && !Array.isArray(lessonPhrases) && lessonPhrases["general"]) || ["Con làm tốt lắm!", "Tuyệt vời!", "Cố lên con!"];

                return (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-4 max-h-[450px] overflow-y-auto">
                    <div className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MessageSquarePlus size={14} className="text-emerald-400" />
                        <span>Mẫu câu nhanh</span>
                      </span>
                    </div>

                    {/* Active Quest Phrases */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                        Nhiệm vụ: {activeQuestTitle}
                      </div>
                      {activeQuestPhrases.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {activeQuestPhrases.map((phrase: string, idx: number) => (
                            <div
                              key={idx}
                              className="group flex items-center justify-between gap-2 bg-black/40 border border-white/5 hover:border-blue-500/30 rounded-lg p-2 text-xs transition-colors"
                            >
                              <button
                                onClick={() => setNpcText(phrase)}
                                className="text-left text-zinc-300 hover:text-white flex-1 line-clamp-2"
                                title="Click để chỉnh sửa câu thoại"
                              >
                                {phrase}
                              </button>
                              <button
                                onClick={() => handleSendNpcScript(phrase)}
                                disabled={sendingNpc}
                                className="p-1 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 rounded transition-colors active:scale-95 disabled:opacity-50"
                                title="Gửi ngay câu thoại này"
                              >
                                <Volume2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-500 italic">Không có mẫu câu cho nhiệm vụ này.</p>
                      )}
                    </div>

                    {/* General Phrases */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                        Khích lệ chung
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {generalPhrases.map((phrase: string, idx: number) => (
                          <div
                            key={idx}
                            className="group flex items-center justify-between gap-2 bg-black/40 border border-white/5 hover:border-purple-500/30 rounded-lg p-2 text-xs transition-colors"
                          >
                            <button
                              onClick={() => setNpcText(phrase)}
                              className="text-left text-zinc-300 hover:text-white flex-1 line-clamp-2"
                              title="Click để chỉnh sửa câu thoại"
                            >
                              {phrase}
                            </button>
                            <button
                              onClick={() => handleSendNpcScript(phrase)}
                              disabled={sendingNpc}
                              className="p-1 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 rounded transition-colors active:scale-95 disabled:opacity-50"
                              title="Gửi ngay câu thoại này"
                            >
                              <Volume2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Other Quests Accordion */}
                    {otherQuestsList.length > 0 && (
                      <details className="group/details space-y-2">
                        <summary className="text-[10px] text-zinc-500 group-open/details:text-zinc-400 uppercase tracking-wider font-bold cursor-pointer hover:text-zinc-300 transition-colors select-none list-none flex items-center justify-between">
                          <span>Nhiệm vụ khác ({otherQuestsList.length})</span>
                          <span className="text-[8px] transition-transform group-open/details:rotate-180">▼</span>
                        </summary>
                        <div className="space-y-4 pt-2 border-t border-white/5">
                          {otherQuestsList.map((qItem) => {
                            const questTitle = qItem.title;
                            const phrases = qItem.phrases || [];
                            if (phrases.length === 0) return null;
                            return (
                              <div key={qItem.key} className="space-y-2">
                                <div className="text-[9px] text-zinc-500 font-bold uppercase">{questTitle}</div>
                                <div className="flex flex-col gap-1.5">
                                  {phrases.map((phrase: string, idx: number) => (
                                    <div
                                      key={idx}
                                      className="group flex items-center justify-between gap-2 bg-black/20 border border-white/5 hover:border-zinc-500/30 rounded-lg p-2 text-xs transition-colors"
                                    >
                                      <button
                                        onClick={() => setNpcText(phrase)}
                                        className="text-left text-zinc-400 hover:text-white flex-1 line-clamp-2"
                                        title="Click để chỉnh sửa câu thoại"
                                      >
                                        {phrase}
                                      </button>
                                      <button
                                        onClick={() => handleSendNpcScript(phrase)}
                                        disabled={sendingNpc}
                                        className="p-1 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 rounded transition-colors active:scale-95 disabled:opacity-50"
                                        title="Gửi ngay câu thoại này"
                                      >
                                        <Volume2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })()}
            </div>
            
          </div>
        </div>

      </div>

      {/* VÙNG DƯỚI: ALERT CONTROL & HORIZONTAL LOGS & MANUAL BUTTONS */}
      <div 
        className={`relative border-t border-white/5 bg-black flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${
          isFooterCollapsed ? 'h-12' : 'h-52'
        }`}
      >
        {/* Nút thu gọn ở góc trên cùng bên phải */}
        {!isFooterCollapsed && (
          <button
            onClick={() => setIsFooterCollapsed(true)}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white z-30 transition-all hover:bg-zinc-800 active:scale-95"
            title="Thu gọn cảnh báo"
          >
            <ChevronDown size={14} />
          </button>
        )}

        <div className={`flex-1 flex min-h-0 transition-all duration-300 ${isFooterCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* CỘT PHỤ TRÁI: BỘ NÚT BẬT TẮT ALERT CONTROL */}
          <div className="w-80 border-r border-white/5 p-4 bg-zinc-950/40 flex flex-col justify-center gap-2 select-none shrink-0">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2 mb-1">
              <Bell size={12} /> Bật/Tắt Cảnh Báo
            </h3>
            <div className="flex flex-col gap-1.5">
              {[
                { key: "stress_overwhelm", label: "Stress / Overwhelm", icon: "😰" },
                { key: "distraction", label: "Mất tập trung", icon: "😵" },
                { key: "execution_difficulty", label: "Khó thực hiện", icon: "🤔" },
              ].map((group) => {
                const isMuted = mutedGroups.includes(group.key);
                const isActive = activeAlerts.some(a => a.group === group.key);
                return (
                  <button
                    key={group.key}
                    onClick={() => toggleMute(group.key)}
                    className={`px-3 py-1.5 rounded-lg flex items-center justify-between transition-all border text-left ${
                      isMuted 
                        ? 'bg-zinc-900/40 border-white/5 opacity-40 hover:opacity-60' 
                        : isActive 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : 'bg-zinc-900/80 border-white/10 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{group.icon}</span>
                      <span className="text-xs font-bold text-zinc-200">{group.label}</span>
                    </div>
                    <span className="text-zinc-500">
                      {isMuted ? <BellOff size={12} /> : <Bell size={12} className="text-blue-400" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CỘT PHỤ PHẢI: HÀNG NGANG CHỨA CÁC THẺ ALERT TRÔI */}
          <div 
            ref={alertsScrollRef}
            className="flex-1 flex gap-3 p-4 overflow-x-auto items-center no-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 to-transparent"
          >
            {activeAlerts.length === 0 && (
              <div className="text-xs font-mono text-zinc-600 opacity-50 pl-2">
                [SYSTEM_LOG] Đang nhận luồng dữ liệu 50Hz...
              </div>
            )}

            {activeAlerts.filter(a => !mutedGroups.includes(a.group)).map((alert, idx) => (
              <div key={`${alert.id}-${idx}`} className={`shrink-0 min-w-[200px] border px-3 py-2 rounded-lg flex flex-col gap-1 shadow-lg
                ${alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-100' : ''}
                ${alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-100' : ''}
                ${alert.severity === 'low' ? 'bg-blue-500/10 border-blue-500/30 text-blue-100' : ''}
              `}>
                <div className="flex items-center justify-between opacity-60">
                  <div className="text-[9px] font-mono uppercase tracking-wider">
                    {alert.group.replace('_', ' ')} <span className="mx-1">/</span> {alert.type}
                  </div>
                  <div className="text-[9px] font-mono">{new Date(alert.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</div>
                </div>
                <div className="text-xs font-bold mb-1">{alert.message}</div>
                <div className="flex items-center gap-1.5 mt-auto">
                  <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-current opacity-30 animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-[10px] font-mono font-bold opacity-80">{alert.duration_sec}s</span>
                </div>
              </div>
            ))}

            {manualLogs.map((log) => (
              <div key={log.log_id} className="shrink-0 min-w-[180px] border border-emerald-500/30 bg-emerald-500/10 text-emerald-100 px-3 py-2 rounded-lg flex flex-col gap-1 shadow-lg">
                <div className="flex items-center justify-between opacity-60">
                  <div className="text-[9px] font-mono uppercase tracking-wider">Expert Log</div>
                  <div className="text-[9px] font-mono">
                    {Math.floor(log.time_offset/60)}:{(Math.floor(log.time_offset%60)).toString().padStart(2,'0')}
                  </div>
                </div>
                <div className="text-xs font-bold">{log.event}</div>
                {log.note && log.event === "Note" && (
                  <div className="text-[10px] opacity-80 italic line-clamp-1 border-t border-emerald-500/20 mt-1 pt-1">
                    {log.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar dưới cùng */}
        <div className="h-12 border-t border-white/5 bg-zinc-950 flex items-center px-4 gap-3 shrink-0">
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold border-r border-white/10 pr-4 mr-1">
            Ghi Log Nhanh
          </div>

          <button 
            onClick={() => handleQuickLog("Tích cực", "Trẻ tự động làm quen vật thể")}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
          >
            <ThumbsUp size={14} /> Phản Ứng Tốt
          </button>

          <button 
            onClick={() => handleQuickLog("Meltdown", "Trẻ khóc / hoảng sợ đột ngột")}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
          >
            <Frown size={14} /> Dấu Hiệu Hoảng
          </button>

          <button 
            onClick={() => {
              const text = window.prompt("Ghi chú tùy chỉnh:");
              if(text) handleQuickLog("Note", text);
            }}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ml-auto"
          >
            <MessageSquarePlus size={14} /> Viết Ghi Chú...
          </button>

          {isFooterCollapsed && (
            <button 
              onClick={() => setIsFooterCollapsed(false)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all active:scale-95 flex-shrink-0"
              title="Mở rộng cảnh báo"
            >
              <ChevronUp size={14} />
              <span>Hiện Cảnh Báo</span>
            </button>
          )}
        </div>

      </div>

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
