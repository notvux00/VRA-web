// @ts-nocheck
"use client";

import React, { useEffect, useState, use } from "react";
import { getSessionDetail } from "@/actions/history";
import { Session } from "@/types";
import { 
  Download, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  Timer,
  Target,
  Calendar,
  HelpCircle,
  Award,
  Activity,
  Trophy
} from "lucide-react";
import Link from "next/link";
import SpeedChart from "./_components/SpeedChart";
import CompletionPie from "./_components/CompletionPie";
import HintsBarChart from "./_components/HintsBarChart";
import EmotionScatterChart from "./_components/EmotionScatterChart";

interface PageProps {
  searchParams: Promise<{ sessionId?: string; childId?: string }>;
}

export default function ParentReportsPage({ searchParams }: PageProps) {
  const { sessionId, childId } = use(searchParams);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (sessionId) {
      const fetchSession = async () => {
        // Trì hoãn việc set state để tránh lỗi cascading render đồng bộ
        await Promise.resolve();
        if (!isMounted) return;
        setLoading(true);
        
        try {
          const res = await getSessionDetail(sessionId);
          if (!isMounted) return;
          if (res.success && res.session) {
            setSession(res.session);
            setError(null);
          } else {
            setError(res.error || "Không thể tải dữ liệu báo cáo");
          }
        } catch {
          if (isMounted) setError("Có lỗi xảy ra khi tải báo cáo");
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchSession();
    }
    return () => { isMounted = false; };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
         <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-600">
               <Activity size={48} />
            </div>
            <div className="max-w-md mx-auto">
               <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Vui lòng chọn một buổi học</h3>
               <p className="text-zinc-500 font-medium mt-2">Đi tới trang <strong>Lịch sử học của bé</strong> và chọn báo cáo để xem phân tích chi tiết.</p>
               <Link href={childId ? `/dashboard/parent/history?childId=${childId}` : "/dashboard/parent/history"} className="inline-block mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-900 transition-colors shadow-lg shadow-blue-500/20">
                  Xem lịch sử của bé
               </Link>
            </div>
         </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Đang chuẩn bị báo cáo cho ba mẹ...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-500 font-bold">{error || "Đã xảy ra lỗi khi tải báo cáo"}</p>
        <Link href="/dashboard/parent/history" className="text-blue-500 hover:underline">Quay lại</Link>
      </div>
    );
  }

  // Data for Charts
  const questLogs = session.quest_logs || [];
  const questTotal = questLogs.length || 0;
  const questSuccess = questLogs.filter(q => q.completion_status === "success").length || 0;
  const accuracy = questTotal > 0 ? Math.round((questSuccess / questTotal) * 100) : (session.score || 0);
  
  const chartData = questLogs.map((q, index) => ({
    name: `NV ${index + 1}`,
    time: Math.round(q.response_time * 100) / 100,
    visual: q.hints_visual || 0,
    verbal: q.hints_verbal || 0,
    physical: q.hints_physical || 0,
    status: q.completion_status === "success" ? "Đạt" : "Chưa đạt"
  }));

  const alertMap: Record<string, { y: number; label: string; color: string }> = {
    "freeze": { y: 5, label: "Căng thẳng", color: "#f43f5e" },
    "meltdown_proxy": { y: 5, label: "Căng thẳng", color: "#f43f5e" },
    "distraction": { y: 4, label: "Xao nhãng", color: "#f59e0b" },
    "idle": { y: 3, label: "Đứng ỳ", color: "#3b82f6" },
    "stimming_proxy": { y: 2, label: "Kích thích", color: "#8b5cf6" },
    "hesitation": { y: 1, label: "Ngập ngừng", color: "#64748b" },
  };

  const alertTimelineData = session.auto_alerts?.map((a: { type: string; time_offset?: number; duration_sec?: number; count?: number }) => {
    const config = alertMap[a.type] || { y: 0, label: "Khác", color: "#94a3b8" };
    return {
      time: a.time_offset || 0,
      timeLabel: `${Math.floor((a.time_offset || 0)/60)}:${((a.time_offset || 0)%60).toString().padStart(2, '0')}`,
      category: config.y,
      categoryLabel: config.label,
      duration: a.duration_sec || (a.count ? a.count * 5 : 5),
      color: config.color
    };
  }) || [];

  const pieData = [
    { name: 'Thành công', value: questSuccess, color: '#10b981' },
    { name: 'Cần tập lại', value: questTotal - questSuccess, color: '#f43f5e' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
           <Link 
              href={`/dashboard/parent/history?childId=${session.child_profile_id}`}
              className="group flex items-center gap-2 text-zinc-400 hover:text-blue-600 transition-colors font-black uppercase text-[10px] tracking-widest"
            >
             <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại lịch sử
           </Link>
           <div className="space-y-1">
             <div className="flex items-center gap-2 text-blue-600 mb-2">
                < Award size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Báo cáo kết quả rèn luyện</span>
             </div>
             <h1 className="text-4xl sm:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
                {session.lesson_name}
             </h1>
             <div className="flex flex-wrap items-center gap-4 text-zinc-400 font-bold uppercase text-[10px] tracking-widest pt-2">
                <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(session.start_time).toLocaleDateString("vi-VN")}</div>
                <div className="flex items-center gap-1.5 font-black text-zinc-900 dark:text-zinc-100">
                   <Clock size={12} /> {new Date(session.start_time).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400">ID: {session.session_id.slice(-8)}</div>
             </div>
           </div>
        </div>
        
        <button 
           onClick={() => window.print()}
           className="flex items-center justify-center gap-3 px-8 py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
           <Download size={16} /> Tải báo cáo chi tiết
        </button>
      </div>

      {/* Top 3 Impact Stats - Friendly Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 p-5 rounded-[2rem] border border-blue-100 dark:border-blue-500/20 flex items-center gap-4 transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
               <Target size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Độ chính xác</p>
               <p className="text-2xl font-black tracking-tighter">{accuracy}%</p>
            </div>
         </div>

         <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 p-5 rounded-[2rem] border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-4 transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
               <Trophy size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Nhiệm vụ đạt</p>
               <p className="text-2xl font-black tracking-tighter">{questSuccess}/{questTotal}</p>
            </div>
         </div>

         <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 p-5 rounded-[2rem] border border-amber-100 dark:border-amber-500/20 flex items-center gap-4 transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 bg-amber-400 text-zinc-900 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
               <Timer size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Thời gian tập</p>
               <p className="text-2xl font-black tracking-tighter">
                  {session.duration >= 60 ? `${Math.floor(session.duration/60)}p ${Math.round(session.duration%60)}s` : `${Math.round(session.duration)} Giây`}
               </p>
            </div>
         </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <SpeedChart data={chartData} />
         <CompletionPie questSuccess={questSuccess} questTotal={questTotal} data={pieData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <HintsBarChart data={chartData} />
         <EmotionScatterChart data={alertTimelineData} />
      </div>

      {/* Achievement Cards Grid (The old quest list) */}
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
               <Activity size={24} className="text-blue-600" /> Nhật ký từng bước của con
            </h3>
            <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">
               Tổng cộng {questTotal} nhiệm vụ
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {questLogs.map((quest, i) => (
               <div 
                  key={i} 
                  className={`p-8 rounded-[2.5rem] border transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${
                     quest.completion_status === "success" 
                        ? "bg-white dark:bg-zinc-900 border-emerald-100 dark:border-emerald-500/20 shadow-emerald-500/5" 
                        : "bg-white dark:bg-zinc-900 border-amber-100 dark:border-amber-500/20 shadow-amber-500/5"
                  }`}
               >
                  <div className="flex flex-col h-full space-y-4">
                     <div className="flex items-start justify-between">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">NV {i + 1}</span>
                        <div className={`p-2 rounded-xl ${
                           quest.completion_status === "success" 
                              ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10" 
                              : "bg-amber-50 text-amber-500 dark:bg-amber-500/10"
                        }`}>
                           {quest.completion_status === "success" ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                        </div>
                     </div>

                     <div className="flex-1">
                        <p className="text-lg font-black text-zinc-900 dark:text-white leading-tight mb-3 capitalize">{quest.quest_name}</p>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-zinc-400">
                           <div className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {Math.round(quest.response_time * 10) / 10}s</div>
                           <div className="flex items-center gap-1.5"><HelpCircle size={14} className="text-amber-500" /> Hỗ trợ: {quest.hints_physical + quest.hints_verbal + quest.hints_visual}</div>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
