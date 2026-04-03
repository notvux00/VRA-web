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
import POVMonitor from "../_components/POVMonitor";
import AlertSidebar from "../_components/AlertSidebar";
import ControlSidebar from "../_components/ControlSidebar";
import BehaviorLogModal from "../_components/BehaviorLogModal";
import SessionSummaryModal from "../_components/SessionSummaryModal";
import { getAssignedChildDetail, finalizeSession } from "@/actions/expert";

export default function LiveSessionPage() {
  const { id } = useParams(); // id is the childId for this session
  const searchParams = useSearchParams();
  const lessonName = searchParams.get("lesson") || "Bài tập VR";
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);

  // States for logging and summary
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [behaviorLogs, setBehaviorLogs] = useState<any[]>([]);
  const alertsHistoryRef = useRef<any[]>([]);

  // 1. Fetch child profile once
  useEffect(() => {
    async function fetchData() {
      if (!user?.uid || !id) return;
      try {
        const res = await getAssignedChildDetail(user.uid, id as string);
        if (res.success) {
          setChild(res.child);
          // Automatically start session for simulation demo
          setTimeout(() => setIsSessionActive(true), 1500);
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
  }, [id, user?.uid, authLoading]);

  // 2. Simulated Hook
  const { telemetry, activeAlerts, sessionTime } = useSimulatedSession(
    isSessionActive && child !== null, 
    child?.alert_profile
  );

  // 3. Keep track of all alerts that occurred
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
    if (!user?.uid || !id) return;
    
    try {
      const res = await finalizeSession(user.uid, id as string, {
        lessonName,
        duration: summary.duration,
        score: summary.score,
        evaluation: summary.evaluation,
        alerts: alertsHistoryRef.current,
        behaviorLogs: behaviorLogs
      });

      if (res.success) {
        setIsSummaryModalOpen(false);
        router.push(`/dashboard/expert/children/${id}`);
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
      <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2">
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
            onClick={() => {
              if (window.confirm("Kết thúc buổi tập và lưu báo cáo?")) setIsSummaryModalOpen(true);
            }}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title="Quay lại"
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

      {/* Main Layout: 3 Columns */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden max-h-[calc(100vh-64px)] min-h-0">
        
        {/* Column 1: Control (3 units) */}
        <div className="lg:col-span-3 min-h-0">
           <ControlSidebar sessionTime={sessionTime} telemetry={telemetry} />
        </div>

        {/* Column 2: Main POV Monitor (6 units) */}
        <div className="lg:col-span-6 flex flex-col gap-6 min-h-0">
           <POVMonitor telemetry={telemetry} childName={child.name} />
           
           {/* Clinical Telemetry Charts Placeholder */}
           <div className="flex-1 bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden group min-h-0">
              <div className="flex justify-between items-start mb-6">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <LayoutDashboard size={14} className="text-blue-500" /> BIỂU ĐỒ SINH TRẮC (REAL-TIME)
                 </h3>
                 <Settings2 size={14} className="text-zinc-600 cursor-pointer hover:text-white transition-colors" />
              </div>
              
              <div className="h-full flex items-center justify-center -mt-4">
                 <div className="flex items-end gap-1 h-32 w-full opacity-30 grayscale saturate-0 group-hover:grayscale-0 group-hover:saturate-100 transition-all duration-700">
                    {[3, 5, 4, 8, 2, 6, 9, 4, 2, 5, 7, 3, 6, 8, 4, 9, 2, 5, 8, 4, 6].map((h, i) => (
                      <div 
                        key={i} 
                        className="bg-blue-500/50 w-full rounded-t-sm animate-[pulse_2s_infinite]" 
                        style={{ height: `${h * 10}%`, animationDelay: `${i * 0.1}s` }} 
                      />
                    ))}
                 </div>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                 <div className="p-4 bg-zinc-950/80 backdrop-blur rounded-2xl border border-white/10 flex items-center gap-3">
                    <Info size={16} className="text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Metric Dashboard Loading...</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Column 3: Alerts (3 units) */}
        <div className="lg:col-span-3 min-h-0">
           <AlertSidebar activeAlerts={activeAlerts} alertProfile={child.alert_profile} />
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
