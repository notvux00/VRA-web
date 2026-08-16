"use client";

import React, { useEffect, useState, use } from "react";
import { getSessionDetail } from "@/actions/history";
import { Session } from "@/types";
import { 
  ChevronLeft, 
  Clock, 
  ThumbsUp, 
  Frown, 
  MessageSquare,
  User,
  History,
  Info,
  Calendar
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ sessionId?: string; childId?: string }>;
}

export default function BehaviorLogPage({ searchParams }: PageProps) {
  const { sessionId, childId } = use(searchParams);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      getSessionDetail(sessionId)
        .then(res => {
          if (res.success && res.session) {
            setSession(res.session);
          } else {
            setError(res.error || "Không thể tải nhật ký hành vi");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  if (!sessionId) return <div className="p-8 text-center">No session selected.</div>;
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest text-xs">Đang trích xuất nhật ký...</div>;
  if (error || !session) return <div className="p-8 text-center text-rose-500">{error || "Lỗi tải dữ liệu"}</div>;

  const behaviorLogs = session.behavior_logs || [];

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case "Tích cực": return <ThumbsUp size={18} className="text-emerald-500" />;
      case "Meltdown": return <Frown size={18} className="text-rose-500" />;
      default: return <MessageSquare size={18} className="text-blue-500" />;
    }
  };

  const getEventBg = (event: string) => {
    switch (event) {
      case "Tích cực": return "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20";
      case "Meltdown": return "bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20";
      default: return "bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/dashboard/expert/reports?sessionId=${sessionId}&childId=${childId}`}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest"
        >
          <ChevronLeft size={16} /> Quay lại báo cáo tổng quan
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
           <History size={14} className="text-emerald-500" />
           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Expert Clinical Log</span>
        </div>
      </div>

      {/* Header Context */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-10 rounded-[3rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-zinc-500/5 -rotate-12">
            <MessageSquare size={200} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-lg">Nhật ký chuyên gia</span>
             <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest italic">{session.session_id}</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Nhật ký Hành vi Lâm sàng</h1>
          <div className="flex flex-wrap items-center gap-6 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
             <div className="flex items-center gap-2"><User size={14} className="text-blue-500" /> Chuyên gia: {session.hosted_by}</div>
             <div className="flex items-center gap-2"><Calendar size={14} className="text-zinc-400" /> {new Date(session.start_time).toLocaleDateString("vi-VN")}</div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative space-y-8">
        {/* Timeline Vertical Line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-zinc-100 dark:bg-zinc-800 hidden sm:block"></div>

        {behaviorLogs.length > 0 ? behaviorLogs.map((log: any, idx: number) => (
          <div key={log.log_id || idx} className="relative flex flex-col sm:flex-row gap-6 items-start group">
            {/* Timeline Node */}
            <div className="z-10 w-14 h-14 bg-white dark:bg-zinc-950 border-4 border-zinc-50 dark:border-zinc-900 rounded-full flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
               {getEventIcon(log.event)}
            </div>

            {/* Log Card */}
            <div className={`flex-1 w-full border rounded-[2rem] p-6 sm:p-8 transition-all hover:shadow-xl hover:shadow-zinc-500/5 ${getEventBg(log.event)}`}>
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Thời điểm</span>
                     <div className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full font-mono text-sm font-black tracking-tighter">
                        {formatTime(log.time_offset)}
                     </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                     {new Date(log.timestamp).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
               </div>
               
               <h3 className="text-xl font-black uppercase tracking-tight mb-2">{log.event}</h3>
               <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                 &quot;{log.note || "Không có ghi chú thêm"}&quot;
               </p>
            </div>
          </div>
        )) : (
          <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] p-20 text-center space-y-6">
             <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-200">
                <Info size={40} />
             </div>
             <div className="max-w-xs mx-auto">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase">Chưa có nhật ký ghi nhận</h3>
                <p className="text-zinc-500 font-medium mt-2 text-sm">Chuyên gia không ghi nhận bất kỳ sự kiện hành vi thủ công nào trong suốt buổi tập.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
