"use client";

import React from "react";
import { 
  Calendar, Clock, CheckCircle2, XCircle, 
  ChevronRight, Brain, Zap, MessageSquare 
} from "lucide-react";
import Link from "next/link";

interface Session {
  id: string;
  lessonName: string;
  date: string;
  duration: string;
  status: "success" | "aborted" | "timeout";
  score: number;
}

const mockSessions: Session[] = [
  { id: "s1", lessonName: "Nhận biết Cảm xúc", date: "02/04/2026", duration: "12:45", status: "success", score: 85 },
  { id: "s2", lessonName: "Giao tiếp Ánh mắt", date: "28/03/2026", duration: "08:20", status: "aborted", score: 45 },
  { id: "s3", lessonName: "Xếp hình Không gian", date: "20/03/2026", duration: "15:00", status: "success", score: 92 },
];

export default function SessionHistory({ childId }: { childId: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm shadow-zinc-200/50 dark:shadow-none">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
        <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Brain size={20} className="text-purple-600" />
          Lịch sử Buổi tập VR
        </h3>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {mockSessions.map((session) => (
          <div key={session.id} className="p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  session.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 
                  session.status === 'aborted' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 
                  'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
                }`}>
                  {session.status === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">{session.lessonName}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {session.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {session.duration}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-zinc-900 dark:text-white">{session.score}%</div>
                <p className="text-[10px] font-black uppercase text-zinc-400">Điểm số</p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1">
                <Zap size={10} /> 3 Cảnh báo AI
              </span>
              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1">
                <MessageSquare size={10} /> 2 Ghi chú lâm sàng
              </span>
            </div>
          </div>
        ))}
      </div>

      <Link 
        href={`/dashboard/expert/reports?childId=${childId}`}
        className="block p-4 bg-zinc-50 dark:bg-zinc-800/30 text-center border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all group"
      >
        <span className="text-xs font-black text-zinc-500 group-hover:text-blue-600 transition-colors uppercase tracking-widest">
          Xem tất cả báo cáo
        </span>
      </Link>
    </div>
  );
}
