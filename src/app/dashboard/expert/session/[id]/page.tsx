"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Loader2, AlertCircle, 
  MessageSquarePlus, Save, Eye, Video, 
  ThumbsUp, Frown, Lightbulb, SkipForward, Volume2, Mic
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveTelemetry } from "../../_hooks/useLiveTelemetry";
import SessionSummaryModal from "../_components/SessionSummaryModal";
import { getAssignedChildDetail, finalizeSession } from "@/actions/expert";
import { endLessonOnDevice, subscribeToVrHandshake } from "@/lib/firebase/rtdb";

export default function LiveSessionPage() {
  const { id: sessionId } = useParams(); 
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
  const [vrReady, setVrReady] = useState(false);
  
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [manualLogs, setManualLogs] = useState<any[]>([]);
  
  const alertsScrollRef = useRef<HTMLDivElement>(null);
  const alertsHistoryRef = useRef<any[]>([]);

  // 1. Lấy thông tin bé
  useEffect(() => {
    async function fetchData() {
      if (!user?.uid || !childId) return;
      try {
        const res = await getAssignedChildDetail(childId as string);
        if (res.success) {
          setChild(res.child);
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

  // 2. Handshake VR
  useEffect(() => {
    const rawSessionId = (Array.isArray(sessionId) ? sessionId[0] : sessionId) || "";
    if (!rawSessionId) return;

    const unsubscribe = subscribeToVrHandshake(
      rawSessionId,
      (data) => {
        setVrReady(true);
        setIsSessionActive(true);
      },
      async () => {
        if (pin) try { await endLessonOnDevice(pin); } catch (e) {}
        const current = new URLSearchParams(searchParams.toString());
        current.delete("session");
        current.set("vr", "connected");
        router.push(`/dashboard/expert?${current.toString()}`);
      },
      () => setVrReady(false)
    );
    return () => unsubscribe();
  }, [sessionId]);

  // 3. Telemetry Logic
  const validSessionId = (Array.isArray(sessionId) ? sessionId[0] : sessionId) || null;
  const { telemetry, activeAlerts, sessionTime, currentQuest } = useLiveTelemetry(
    isSessionActive && vrReady ? validSessionId : null,
    isSessionActive
  );

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

  // Handle Manual Logs
  const handleQuickLog = (type: string, note: string) => {
    const newLog = {
      id: crypto.randomUUID(),
      time: sessionTime,
      type,
      note,
      timestamp: Date.now()
    };
    setManualLogs(prev => [...prev, newLog]);
  };

  const handleFinalSave = async (summary: any) => {
    // Save logic omitted for brevity
    alert("Đã lưu (Demo)");
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

      {/* VÙNG GIỮA: CHIA 2 CỘT */}
      <div className="flex-1 flex min-h-0">
        
        {/* CỘT TRÁI: POV & TELEMETRY HUD (75% width) */}
        <div className="flex-1 border-r border-white/5 relative bg-zinc-950 flex flex-col">
          {/* POV Video Container */}
          <div className="absolute inset-4 rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
            {/* Giả lập WebRTC */}
            <Video size={48} className="text-zinc-800 absolute" />
            <img 
              src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=2000" 
              alt="POV Stream"
              className="w-full h-full object-cover opacity-30" 
            />
            
            {/* HUD Overlay cho Telemetry */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="bg-black/50 backdrop-blur border border-white/10 px-3 py-1.5 rounded font-mono text-[10px] text-zinc-300">
                HEAD_VEL: {telemetry ? Math.round(telemetry.head_vel_avg * 100) / 100 : "0.00"}
              </div>
              <div className="bg-black/50 backdrop-blur border border-white/10 px-3 py-1.5 rounded font-mono text-[10px] text-zinc-300">
                DIST: {telemetry && telemetry.min_hand_dist >= 0 ? `${(Math.round(telemetry.min_hand_dist * 100))} cm` : "--"}
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 backdrop-blur-md px-4 py-1.5 rounded font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              {currentQuest}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: CHIẾN DỊCH & REMOTE CONTROL (25% width) */}
        <div className="w-80 bg-zinc-950 flex flex-col">
          
          <div className="p-4 border-b border-white/5">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3">Thông Tin Bài Học</h3>
            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
              <div className="text-xs text-zinc-400 mb-1">Quest Hiện Tại</div>
              <div className="text-sm font-bold text-emerald-400 leading-tight">{currentQuest}</div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3">Tác Động Tự Xa (Remote)</h3>
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-3 w-full bg-zinc-900 border border-white/5 hover:border-zinc-500 p-3 rounded-lg text-left transition-all group">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Lightbulb size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-zinc-200">Kích Hoạt Gợi Ý</div>
                  <div className="text-[10px] text-zinc-500">Phát loa NPC dỗ dành</div>
                </div>
              </button>

              <button className="flex items-center gap-3 w-full bg-zinc-900 border border-white/5 hover:border-zinc-500 p-3 rounded-lg text-left transition-all group">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <SkipForward size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-zinc-200">Force Skip</div>
                  <div className="text-[10px] text-zinc-500">Bỏ qua nhanh câu này</div>
                </div>
              </button>

              <button className="flex items-center gap-3 w-full bg-zinc-900 border border-white/5 hover:border-zinc-500 p-3 rounded-lg text-left transition-all group">
                <div className="w-8 h-8 rounded-full bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center group-hover:bg-fuchsia-500/20 transition-colors">
                  <Volume2 size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-zinc-200">Điều hòa âm thanh</div>
                  <div className="text-[10px] text-zinc-500">Giảm tiếng ồn môi trường</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VÙNG DƯỚI: HORIZONTAL LOGS & MANUAL BUTTONS (Khoảng 30% height) */}
      <div className="h-44 border-t border-white/5 bg-black flex flex-col shrink-0">
        
        {/* Hàng ngang chứa các thẻ Alert trôi */}
        <div 
          ref={alertsScrollRef}
          className="flex-1 flex gap-3 p-4 overflow-x-auto items-end no-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 to-transparent"
        >
          {activeAlerts.length === 0 && (
            <div className="text-xs font-mono text-zinc-600 opacity-50 absolute left-4 bottom-8">
              [SYSTEM_LOG] Đang nhận luồng dữ liệu 50Hz...
            </div>
          )}

          {activeAlerts.map((alert, idx) => (
            <div key={`${alert.id}-${idx}`} className={`shrink-0 min-w-[200px] border px-3 py-2 rounded-lg flex flex-col gap-1 shadow-lg
              ${alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-100' : ''}
              ${alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-100' : ''}
              ${alert.severity === 'low' ? 'bg-blue-500/10 border-blue-500/30 text-blue-100' : ''}
            `}>
              <div className="flex items-center justify-between opacity-60">
                <div className="text-[9px] font-mono uppercase tracking-wider">{alert.type}</div>
                <div className="text-[9px] font-mono">{new Date(alert.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</div>
              </div>
              <div className="text-xs font-bold">{alert.message}</div>
            </div>
          ))}

          {manualLogs.map((log) => (
            <div key={log.id} className="shrink-0 min-w-[180px] border border-emerald-500/30 bg-emerald-500/10 text-emerald-100 px-3 py-2 rounded-lg flex flex-col gap-1 shadow-lg">
              <div className="flex items-center justify-between opacity-60">
                <div className="text-[9px] font-mono uppercase tracking-wider">Expert Log</div>
                <div className="text-[9px] font-mono">{Math.floor(log.time/60)}:{(log.time%60).toString().padStart(2,'0')}</div>
              </div>
              <div className="text-xs font-bold">{log.type}</div>
            </div>
          ))}
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
        </div>

      </div>

      <SessionSummaryModal 
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onSave={handleFinalSave}
        sessionTime={sessionTime}
        alertsCount={activeAlerts.length}
        logsCount={manualLogs.length}
        childName={child?.name || "Bé"}
      />
    </div>
  );
}
