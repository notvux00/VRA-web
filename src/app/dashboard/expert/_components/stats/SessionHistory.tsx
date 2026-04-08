"use client";

import React from "react";
import { 
  Calendar, Clock, CheckCircle2, XCircle, 
  Brain, Zap, MessageSquare 
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm shadow-zinc-200/50 dark:shadow-none">
      <div className="p-8 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10">
        <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
          <Brain size={24} className="text-purple-600" />
          Nhật ký can thiệp VR
        </h3>
      </div>

      <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
        {mockSessions.map((session) => (
          <div key={session.id} className="p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-all group cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="flex gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  session.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 
                  session.status === 'aborted' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 
                  'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
                }`}>
                  {session.status === 'success' ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors tracking-tight uppercase">{session.lessonName}</h4>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500" /> {session.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-zinc-500" /> {session.duration}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-zinc-900 dark:text-white">{session.score}%</div>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest leading-none">Chất lượng</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <span className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={12} className="text-amber-500" /> 3 AI Alerts
              </span>
              <span className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare size={12} className="text-blue-500" /> 2 Clinical Notes
              </span>
            </div>
          </div>
        ))}
      </div>

      <Link 
        href={`/dashboard/expert/history?childId=${childId}`}
        className="block p-6 bg-zinc-50 dark:bg-zinc-800/10 text-center border-t border-zinc-50 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-all group"
      >
        <span className="text-xs font-black text-zinc-400 group-hover:text-blue-600 transition-colors uppercase tracking-[0.3em]">
          Xem toàn bộ lịch sử
        </span>
      </Link>
    </div>
  );
}
