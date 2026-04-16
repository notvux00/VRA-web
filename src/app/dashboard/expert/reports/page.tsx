"use client";

import React, { useEffect, useState, use } from "react";
import { getSessionDetail } from "@/actions/history";
import { Session, QuestLog } from "@/types";
import { 
  FileText, 
  Download, 
  Clock, 
  User, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  Timer,
  Target,
  Zap,
  HelpCircle,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

interface PageProps {
  searchParams: Promise<{ sessionId?: string; childId?: string }>;
}

export default function ExpertReportsPage({ searchParams }: PageProps) {
  const { sessionId, childId } = use(searchParams);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      getSessionDetail(sessionId)
        .then(res => {
          if (res.success && res.session) {
            setSession(res.session);
          } else {
            setError(res.error || "Không thể tải dữ liệu báo cáo");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white">
              <BarChart3 size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Kho báo cáo</h1>
              <p className="text-zinc-500 font-medium tracking-wide italic">Chọn một buổi học từ lịch sử để xem phân tích chuyên sâu</p>
            </div>
         </div>
         
         <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-300">
               <FileText size={48} />
            </div>
            <div className="max-w-md mx-auto">
               <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase">Chưa có báo cáo được chọn</h3>
               <p className="text-zinc-500 font-medium mt-2">Vui lòng quay lại trang <strong>Lịch sử</strong> và chọn một buổi học cụ thể để xem biểu đồ phân tích.</p>
               <Link href={childId ? `/dashboard/expert/history?childId=${childId}` : "/dashboard/expert/history"} className="inline-block mt-8 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-colors">
                  Quay lại lịch sử
               </Link>
            </div>
         </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-zinc-400 font-black uppercase tracking-widest text-[10px]">Đang trích xuất dữ liệu...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-500 font-bold">{error || "Đã xảy ra lỗi"}</p>
        <Link href="/dashboard/expert/history" className="text-blue-500 hover:underline">Quay lại</Link>
      </div>
    );
  }

  // Data Processing for Charts
  const chartData = session.quest_logs?.map((q, index) => ({
    name: `Q${index + 1}`,
    fullName: q.quest_name,
    time: Math.round(q.response_time * 100) / 100,
    status: q.completion_status,
    color: q.completion_status === "success" ? "#10b981" : "#f43f5e"
  })) || [];

  const questTotal = session.quest_logs?.length || 0;
  const questSuccess = session.quest_logs?.filter(q => q.completion_status === "success").length || 0;
  const accuracy = questTotal > 0 ? Math.round((questSuccess / questTotal) * 100) : (session.score || 0);

  const stats = [
    { label: "Độ chính xác", value: `${accuracy}%`, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Thời lượng", value: session.duration >= 60 ? `${Math.floor(session.duration/60)}m ${Math.round(session.duration%60)}s` : `${Math.round(session.duration)}s`, icon: Timer, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Nhiệm vụ đạt", value: `${questSuccess}/${questTotal}`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Loại bài tập", value: session.type === "practical" ? "Thực hành" : "Lý thuyết", icon: Zap, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
         <Link 
            href={`/dashboard/expert/history?childId=${session.child_profile_id}`}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest"
          >
           <ChevronLeft size={16} /> Quay lại lịch sử
         </Link>
         
         <div className="flex items-center gap-3">
            <button 
               onClick={() => window.print()} 
               className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-zinc-50 transition-all"
            >
               <Download size={14} /> Tải PDF (In)
            </button>
         </div>
      </div>

      {/* Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 sm:p-10 rounded-[3rem] shadow-xl shadow-zinc-500/5 space-y-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
         
         <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Báo cáo VR</span>
                  <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest italic">{session.session_id}</span>
               </div>
               <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">{session.lesson_name}</h1>
               <div className="flex flex-wrap items-center gap-6 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                  <div className="flex items-center gap-2"><User size={14} className="text-blue-500" /> Hồ sơ: {session.child_profile_id}</div>
                  <div className="flex items-center gap-2"><Clock size={14} className="text-zinc-900 dark:text-white" /> Bắt đầu: {new Date(session.start_time).toLocaleString("vi-VN")}</div>
               </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                   <div key={i} className={`p-4 rounded-[1.5rem] ${stat.bg} border border-zinc-100 dark:border-zinc-800/50 flex flex-col items-center justify-center text-center space-y-1.5`}>
                     <stat.icon className={stat.color} size={20} />
                     <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                        <p className={`text-xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Chart Section */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 sm:p-10 rounded-[3rem] shadow-sm space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase tracking-tight">Phân tích phản xạ (s)</h3>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Thời gian trả lời</span>
                  </div>
               </div>
               
               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                           dataKey="name" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                           dy={10}
                        />
                        <YAxis 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                        />
                        <Tooltip 
                           contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                           labelStyle={{ fontWeight: 900, color: '#18181b', marginBottom: '0.25rem', textTransform: 'uppercase' }}
                        />
                        <Area 
                           type="monotone" 
                           dataKey="time" 
                           stroke="#3b82f6" 
                           strokeWidth={4} 
                           fillOpacity={1} 
                           fill="url(#colorTime)" 
                           animationDuration={1500}
                        />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Detailed Quest Table */}
         <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] overflow-hidden shadow-sm">
               <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50">
                  <h3 className="text-lg font-black uppercase tracking-tight">Chi tiết nhiệm vụ</h3>
               </div>
               <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {session.quest_logs?.map((quest, i) => (
                     <div key={i} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                        <div className="flex items-start justify-between gap-4">
                           <div className="space-y-1">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">NV {i + 1}</span>
                              <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight capitalize">{quest.quest_name}</p>
                              
                              <div className="flex items-center gap-4 mt-3">
                                 <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase">
                                    <HelpCircle size={12} className="text-blue-500" /> Hỗ trợ: {quest.hints_physical + quest.hints_verbal + quest.hints_visual}
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase">
                                    <Clock size={12} className="text-amber-500" /> {Math.round(quest.response_time * 10) / 10}s
                                 </div>
                              </div>
                           </div>
                           <div className={`p-2 rounded-xl border ${
                              quest.completion_status === "success" 
                                 ? "bg-emerald-50 border-emerald-100 text-emerald-500" 
                                 : "bg-rose-50 border-rose-100 text-rose-500"
                           }`}>
                              {quest.completion_status === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
