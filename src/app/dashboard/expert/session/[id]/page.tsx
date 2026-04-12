"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Brain, Loader2, AlertCircle, 
  Settings2, LayoutDashboard, MessageSquarePlus, 
  Save, PlayCircle, Eye, Info
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSimulatedSession } from "../../_hooks/useSimulatedSession";
import BehaviorLogModal from "../_components/BehaviorLogModal";
import SessionSummaryModal from "../_components/SessionSummaryModal";
import { getAssignedChildDetail, finalizeSession } from "@/actions/expert";
import { endLessonOnDevice, subscribeToVrHandshake } from "@/lib/firebase/rtdb";

export default function LiveSessionPage() {
  const { id: sessionId } = useParams(); // id trong URL là sessionId
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");
  const lessonName = searchParams.get("lesson") || "Bài tập VR";
  const pin = searchParams.get("pin");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  // vrReady = true khi VR đã bắn handshake xác nhận vào scene
  const [vrReady, setVrReady] = useState(false);
  const [vrSceneName, setVrSceneName] = useState("");

  // States for logging and summary
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [behaviorLogs, setBehaviorLogs] = useState<any[]>([]);
  const alertsHistoryRef = useRef<any[]>([]);

  // 1. Fetch child profile once
  useEffect(() => {
    async function fetchData() {
      if (!user?.uid || !childId) return;
      try {
        const res = await getAssignedChildDetail(childId as string);
        if (res.success) {
          setChild(res.child);
          // Không tự bật session nữa — chờ VR handshake
        } else {
          setError(res.error || "Không tìm thấy thông tin trẻ");
        }
      } catch (err) {
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) fetchData();
  }, [childId, user?.uid, authLoading]);

  // 2. Lắng nghe VR Handshake — chỉ bật session khi VR xác nhận đã vào scene
  useEffect(() => {
    const rawSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;
    if (!rawSessionId) return;

    const unsubscribe = subscribeToVrHandshake(
      rawSessionId,
      // onReady: VR báo đã vào scene
      (data) => {
        setVrReady(true);
        setVrSceneName(data.scene_name);
        setIsSessionActive(true);
      },
      // onEnded: VR báo bài học đã kết thúc → tự động dọn và quay về Dashboard
      async () => {
        console.log("[Session] VR kết thúc bài học, tự động redirect về Dashboard...");
        if (pin) {
          try { await endLessonOnDevice(pin); } catch (e) {}
        }
        const current = new URLSearchParams(searchParams.toString());
        current.delete("session");
        current.set("vr", "connected");
        router.push(`/dashboard/expert?${current.toString()}`);
      },
      // onDisconnect: VR bị ngắt đột ngột
      () => {
        setVrReady(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);


  // 3. Simulated Hook (chạy khi VR đã ready)
  const { telemetry, activeAlerts, sessionTime } = useSimulatedSession(
    isSessionActive && child !== null, 
    child?.alert_profile
  );

  // 4. Keep track of all alerts that occurred
  useEffect(() => {
    if (activeAlerts.length > 0) {
      activeAlerts.forEach(alert => {
        if (!alertsHistoryRef.current.find((a: any) => a.id === alert.id)) {
          alertsHistoryRef.current.push(alert);
        }
      });
    }
  }, [activeAlerts]);

  const handleManualLog = (log: any) => {
    setBehaviorLogs(prev => [...prev, log]);
  };

  const handleFinalSave = async (summary: any) => {
    if (!user?.uid || !childId) return;
    
    try {
      const res = await finalizeSession(childId as string, {
        lessonName,
        duration: summary.duration,
        score: summary.score,
        evaluation: summary.evaluation,
        alerts: alertsHistoryRef.current,
        behaviorLogs: behaviorLogs
      });

      if (res.success) {
        setIsSummaryModalOpen(false);
        if (pin) {
          try {
            await endLessonOnDevice(pin);
          } catch (e) {
            console.error("Lỗi khi kết thúc bài học trên VR:", e);
          }
        }
        
        // Giữ lại URL params (như pin, vr) để không bị ngắt kết nối
        const current = new URLSearchParams(searchParams.toString());
        current.delete("session"); // Không cần thiết giữ session cũ
        current.set("vr", "connected"); // ⚠️ Đảm bảo Dashboard không hiểu nhầm là đã ngắt
        router.push(`/dashboard/expert?${current.toString()}`);
      } else {
        alert("Lỗi khi lưu báo cáo: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ khi lưu báo cáo.");
    }
  };

  if (authLoading || loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center bg-zinc-950 rounded-3xl border border-zinc-800 max-w-md mx-auto mt-20">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h3 className="text-xl font-bold text-white mb-2">{error}</h3>
      <button onClick={async () => {
        if (pin) {
          try { await endLessonOnDevice(pin); } catch(e){}
        }
        const current = new URLSearchParams(searchParams.toString());
        current.delete("session");
        current.set("vr", "connected");
        router.push(`/dashboard/expert?${current.toString()}`);
      }} className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Quay lại
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white font-sans overflow-hidden flex flex-col">
      {/* Session Top Bar */}
      <div className="h-16 border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl px-6 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={async () => {
              if (window.confirm("Bỏ qua báo cáo và huỷ bài học này? (Kính VR sẽ quay về phòng chờ)")) {
                if (pin) {
                  try { await endLessonOnDevice(pin); } catch(e){}
                }
                const current = new URLSearchParams(searchParams.toString());
                current.delete("session");
                current.set("vr", "connected");
                router.push(`/dashboard/expert?${current.toString()}`);
              }
            }}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title="Quay lại không lưu"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <h2 className="text-lg font-black tracking-tight uppercase">{lessonName}</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] bg-white/5 px-2 py-1 rounded">
               <Eye size={12} className="text-blue-500" /> MONITORING: {child.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Behavior Log Button */}
           <button 
            onClick={() => setIsLogModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border border-white/5 transition-all"
           >
              <MessageSquarePlus size={16} className="text-blue-400" />
              GHI CHÚ HÀNH VI
           </button>
           <button 
            onClick={() => setIsSummaryModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
           >
              <Save size={16} />
              KẾT THÚC & LƯU
           </button>
        </div>
      </div>

      {/* Main Layout: Chờ Handshake hoặc hiển thị Placeholder */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&q=80&w=2000" 
            alt="VR Streaming Placeholder" 
            className="w-full h-full object-cover opacity-20 filter blur-sm"
          />
        </div>
        
        <div className="z-10 bg-zinc-900/60 backdrop-blur-2xl border border-white/10 p-12 rounded-[3rem] flex flex-col items-center text-center max-w-2xl shadow-2xl">
          {!vrReady ? (
            /* Chưa nhận được Handshake từ VR */
            <>
              <div className="w-24 h-24 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/20 mb-8">
                <Loader2 size={40} className="animate-spin" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase mb-4">Chờ Trẻ Vào Bài</h2>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed mb-8">
                Lệnh bắt đầu đã được gửi tới kính VR. <br/>
                <b>Đang chờ xác nhận trẻ đã vào bên trong scene bài học...</b>
              </p>
              <div className="flex items-center gap-3 px-6 py-3 bg-zinc-950 rounded-2xl border border-white/5 text-sm font-bold text-amber-400 tracking-widest uppercase shadow-inner">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                Đang chờ Handshake từ: {child.name}
              </div>
            </>
          ) : (
            /* VR đã xác nhận — Hiển thị Placeholder Dashboard */
            <>
              <div className="w-24 h-24 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center border border-blue-500/30 mb-8 animate-pulse">
                <Eye size={40} />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase mb-4">Màn Hình Trích Xuất VR</h2>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed mb-8">
                Bản đồ theo dõi thời gian thực (Telemetrics, Alerts, POV Monitor) đang trong quá trình thiết kế chi tiết. <br/>
                {vrSceneName && <span className="text-emerald-400 font-bold">Scene đang chạy: {vrSceneName}</span>}
              </p>
              <div className="flex items-center gap-3 px-6 py-3 bg-zinc-950 rounded-2xl border border-white/5 text-sm font-bold text-emerald-400 tracking-widest uppercase shadow-inner">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                Đang duy trì kết nối với: {child.name}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <BehaviorLogModal 
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onAdd={handleManualLog}
        currentTime={sessionTime}
      />

      <SessionSummaryModal 
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onSave={handleFinalSave}
        sessionTime={sessionTime}
        alertsCount={alertsHistoryRef.current.length}
        logsCount={behaviorLogs.length}
        childName={child.name}
      />
    </div>
  );
}
