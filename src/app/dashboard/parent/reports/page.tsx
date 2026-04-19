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
  Calendar,
  HelpCircle,
  Award,
  Activity,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie
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

  const alertTimelineData = session.auto_alerts?.map((a: any) => {
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
         {/* Speed Chart - 7 Columns */}
         <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                     <Zap size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-black uppercase tracking-tight leading-none mb-1">Tốc độ của bé</h3>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phản xạ qua từng câu hỏi</p>
                  </div>
               </div>
            </div>

            <div className="h-[200px] w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                     <XAxis dataKey="name" hide />
                     <YAxis hide domain={[0, 'dataMax + 1']} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                        labelStyle={{ fontWeight: 900, color: '#3b82f6', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="time" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorResponse)" 
                        animationDuration={2000}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
               <p className="text-xs text-zinc-500 font-medium italic text-center leading-relaxed">
                  &quot;Biểu đồ này cho thấy thời gian con suy nghĩ. Đường đi xuống và ổn định là con đang rất tự tin đấy ba mẹ ơi!&quot;
               </p>
            </div>
         </div>

         {/* Completion Doughnut - 5 Columns */}
         <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-rose-500"></div>
            
            <div className="space-y-1">
               <h3 className="text-lg font-black uppercase tracking-tight">Tỉ lệ hoàn thành</h3>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mức độ vượt qua bài học</p>
            </div>

            <div className="h-[180px] w-full flex items-center justify-center relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={questSuccess === questTotal || questSuccess === 0 ? 0 : 6}
                        dataKey="value"
                        animationDuration={1500}
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{Math.round((questSuccess/questTotal)*100)}%</p>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Thành công</p>
               </div>
            </div>
            
            <div className="flex gap-4 w-full">
               <div className="flex-1 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
                  <p className="text-xs font-black text-emerald-600 leading-none mb-1">{questSuccess}</p>
                  <p className="text-[8px] font-bold text-emerald-600/60 uppercase">Đúng</p>
               </div>
               <div className="flex-1 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl">
                  <p className="text-xs font-black text-rose-600 leading-none mb-1">{questTotal - questSuccess}</p>
                  <p className="text-[8px] font-bold text-rose-600/60 uppercase">Cần tập lại</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Hints Analysis - Parent Version */}
         <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Sự trợ giúp của cô</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Loại gợi ý con đã nhận</p>
               </div>
               <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
               </div>
            </div>

            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" hide />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                     <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                        labelStyle={{ fontWeight: 900, color: '#18181b', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                     />
                     <Bar dataKey="visual" name="Gợi ý hình ảnh" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={30} />
                     <Bar dataKey="verbal" name="Gợi ý lời nói" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={30} />
                     <Bar dataKey="physical" name="Hỗ trợ vật lý" stackId="a" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={30} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-zinc-400 text-center italic font-medium">Cột càng thấp nghĩa là con càng tự lập và chủ động hơn đấy ba mẹ!</p>
         </div>

         {/* Behavioral Timeline - Parent Version */}
         <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Cảm xúc của con</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Diễn biến tâm lý trong buổi học</p>
               </div>
               <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500">
                  <Activity size={18} />
               </div>
            </div>

            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f1f5f9" />
                     <XAxis type="number" dataKey="time" hide />
                     <YAxis 
                        type="number" 
                        dataKey="category" 
                        ticks={[1, 2, 3, 4, 5]}
                        domain={[0, 6]}
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(val) => {
                           if (val === 1) return "NGẬP NGỪNG";
                           if (val === 2) return "KÍCH THÍCH";
                           if (val === 3) return "ĐỨNG Ỳ";
                           if (val === 4) return "XAO NHÃNG";
                           if (val === 5) return "CĂNG THẲNG";
                           return "";
                        }}
                        tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }} 
                     />
                     <ZAxis type="number" dataKey="duration" range={[50, 400]} />
                     <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                           if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                 <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-xs font-black text-zinc-900 dark:text-white uppercase">{data.categoryLabel}</p>
                                    <p className="text-[10px] font-bold text-zinc-500 mt-1">Kéo dài: {data.duration}s</p>
                                 </div>
                              );
                           }
                           return null;
                        }}
                     />
                     <Scatter data={alertTimelineData}>
                        {alertTimelineData.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} stroke={entry.color} strokeWidth={2} />
                        ))}
                     </Scatter>
                  </ScatterChart>
               </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-zinc-400 text-center italic font-medium">Theo dõi các điểm màu để hiểu lúc nào con cần ba mẹ vỗ về nhất.</p>
         </div>
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
