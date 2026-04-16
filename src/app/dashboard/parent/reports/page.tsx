"use client";

import React, { useEffect, useState, use } from "react";
import { getSessionDetail } from "@/actions/history";
import { Session } from "@/types";
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  Timer,
  Target,
  Zap,
  BarChart2,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface PageProps {
  searchParams: Promise<{ sessionId?: string; childId?: string }>;
}

export default function ParentReportsPage({ searchParams }: PageProps) {
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
         <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-600">
               <BarChart2 size={48} />
            </div>
            <div className="max-w-md mx-auto">
               <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Vui lòng chọn một buổi học</h3>
               <p className="text-zinc-500 font-medium mt-2">Đi tới trang <strong>Lịch sử học của bé</strong> và chọn biểu tượng báo cáo để xem phân tích chi tiết.</p>
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
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Đang chuẩn bị báo cáo...</p>
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
  const questTotal = session.quest_logs?.length || 0;
  const questSuccess = session.quest_logs?.filter(q => q.completion_status === "success").length || 0;
  const accuracy = questTotal > 0 ? Math.round((questSuccess / questTotal) * 100) : (session.score || 0);
  
  const chartData = questLogs.map((q, index) => ({
    name: `Lần ${index + 1}`,
    time: Math.round(q.response_time * 100) / 100,
    status: q.completion_status === "success" ? "Đạt" : "Chưa đạt"
  }));

  const pieData = [
    { name: 'Thành công', value: questSuccess, color: '#10b981' },
    { name: 'Cần cố gắng', value: questTotal - questSuccess, color: '#f43f5e' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
         <Link 
            href={`/dashboard/parent/history?childId=${session.child_profile_id}`}
            className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 transition-colors font-black uppercase text-[10px] tracking-widest"
          >
           <ChevronLeft size={16} /> Quay lại lịch sử
         </Link>
         
         <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
         >
            <Download size={14} /> Tải báo cáo PDF
         </button>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-8 sm:p-10 shadow-xl shadow-zinc-500/5 space-y-10">
         <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-blue-600">
                  <FileText size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Báo cáo rèn luyện tổng quát</span>
               </div>
               <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">{session.lesson_name}</h1>
               <div className="flex flex-wrap items-center gap-6 text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                  <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(session.start_time).toLocaleDateString("vi-VN")}</div>
                  <div className="flex items-center gap-2"><Clock size={14} /> {new Date(session.start_time).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="flex items-center gap-2"><Timer size={14} /> {session.duration >= 60 ? `${Math.floor(session.duration/60)} phút ${Math.round(session.duration%60)} giây` : `${Math.round(session.duration)} giây`} tập luyện</div>
               </div>
            </div>

            <div className="flex items-center gap-6 bg-zinc-50 dark:bg-zinc-800/50 p-4 sm:p-5 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800">
               <div className="text-center px-4">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Độ chính xác</p>
                  <p className="text-3xl font-black text-blue-600">{accuracy}%</p>
               </div>
               <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700"></div>
               <div className="text-center px-4">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nhiệm vụ</p>
                  <p className="text-3xl font-black text-emerald-500">{questSuccess}/{questTotal}</p>
               </div>
            </div>
         </div>

         {/* Visual Analytics */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Speed Chart */}
            <div className="space-y-6">
               <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                  <Zap size={20} className="text-amber-500" /> Tốc độ phản ứng của bé
               </h3>
               <div className="h-[280px] w-full bg-zinc-50 dark:bg-zinc-800/20 rounded-[2rem] p-6 border border-zinc-50 dark:border-zinc-800">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="colorParent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={[0, 'dataMax + 1']} />
                        <Tooltip 
                           contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                           labelStyle={{ fontWeight: 800, color: '#3b82f6', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorParent)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
               <p className="text-xs text-zinc-400 font-medium italic text-center">
                  Biểu đồ thể hiện thời gian bé suy nghĩ trước khi đưa ra đáp án. Thời gian ngắn và ổn định cho thấy bé đang nắm bắt vấn đề tốt.
               </p>
            </div>

            {/* Achievement Pie */}
            <div className="space-y-6">
               <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                  <Target size={20} className="text-emerald-500" /> Tỉ lệ hoàn thành bài học
               </h3>
               <div className="h-[280px] w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={pieData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={90}
                           paddingAngle={8}
                           dataKey="value"
                        >
                           {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <p className="text-3xl font-black text-zinc-900 dark:text-white leading-none">{Math.round((questSuccess/questTotal)*100)}%</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Hoàn thành</p>
                  </div>
               </div>
               
               <div className="flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-[10px] font-black uppercase text-zinc-500">Thành công</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                     <span className="text-[10px] font-black uppercase text-zinc-500">Cần cố gắng</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
