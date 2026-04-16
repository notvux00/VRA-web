import { getAssignedChildren } from "@/actions/expert";
import { getChildSessionHistory } from "@/actions/history";
import { 
  History, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Gamepad2, 
  ChevronRight,
  Timer,
  Target,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Session } from "@/types";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

export default async function ExpertHistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.childId;

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] flex items-center justify-center text-zinc-400 border border-zinc-100 dark:border-zinc-800 shadow-inner">
           <History size={48} />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Chưa chọn hồ sơ</h2>
          <p className="text-zinc-500 font-medium italic">Vui lòng chọn hồ sơ trẻ từ danh sách để xem lịch sử can thiệp.</p>
        </div>
      </div>
    );
  }

  const { children } = await getAssignedChildren() as { children: any[] | undefined };
  const child = children?.find(c => c.id === childId);
  const { sessions, success, error } = await getChildSessionHistory(childId);

  // Calculate quick stats
  const totalSessions = sessions?.length || 0;
  const avgScore = totalSessions > 0 
    ? Math.round(sessions!.reduce((acc, s) => {
        const questTotal = s.quest_logs?.length || 0;
        const questSuccess = s.quest_logs?.filter(q => q.completion_status === "success").length || 0;
        const score = questTotal > 0 ? (questSuccess / questTotal) * 100 : (s.score || 0);
        return acc + score;
      }, 0) / totalSessions) 
    : 0;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-zinc-900 shadow-xl shadow-zinc-500/10">
            <History size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">Lịch sử bài học</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500"></span>
               Hồ sơ: <span className="text-zinc-900 dark:text-zinc-200">{child?.display_name || child?.name}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 px-8 rounded-3xl shadow-sm">
           <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tổng buổi</p>
              <p className="text-xl font-black text-zinc-900 dark:text-white leading-none">{totalSessions}</p>
           </div>
           <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800"></div>
           <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Độ chính xác TB</p>
              <p className="text-xl font-black text-blue-600 leading-none">{avgScore}%</p>
           </div>
        </div>
      </div>

      {/* Sessions Horizontal List */}
      <div className="space-y-4">
        {!success || totalSessions === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-16 text-center space-y-6">
             <BarChart3 size={48} className="mx-auto text-zinc-200" />
             <p className="text-zinc-500 font-bold italic">{error || "Chưa có dữ liệu lịch sử."}</p>
          </div>
        ) : (
          sessions.map((session: Session) => {
            const date = new Date(session.start_time).toLocaleDateString("vi-VN", { 
              day: "2-digit", 
              month: "2-digit"
            });
            const time = new Date(session.start_time).toLocaleTimeString("vi-VN", { 
              hour: "2-digit", 
              minute: "2-digit" 
            });
            const isSuccess = session.completion_status === "success";
            const questTotal = session.quest_logs?.length || 0;
            const questSuccess = session.quest_logs?.filter(q => q.completion_status === "success").length || 0;
            const accuracy = questTotal > 0 ? Math.round((questSuccess / questTotal) * 100) : session.score;

            return (
              <div key={session.id} className="group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300">
                <div className="grid grid-cols-12 items-center gap-4">
                  {/* Date/Time Block - 1 unit */}
                  <div className="col-span-1 min-w-[70px]">
                    <div className="bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-xl text-center">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{date}</p>
                        <p className="text-sm font-black text-zinc-900 dark:text-white leading-none tracking-tighter">{time}</p>
                    </div>
                  </div>

                  {/* Lesson Info - 4 units */}
                  <div className="col-span-4 space-y-1 lg:pl-4">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none opacity-70 italic">Bài học</p>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight truncate">
                      {session.lesson_name}
                    </h3>
                  </div>

                  <div className="col-span-1 text-center">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Thời lượng</p>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">
                      {session.duration >= 60 ? `${Math.floor(session.duration/60)}m ${Math.round(session.duration%60)}s` : `${Math.round(session.duration)}s`}
                    </p>
                  </div>

                  {/* Accuracy - 1 unit */}
                  <div className="col-span-1 text-center">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Độ chính xác</p>
                    <p className="text-2xl font-black text-blue-600 leading-none">{accuracy}%</p>
                  </div>

                  {/* Progress - 2 units */}
                  <div className="hidden lg:block col-span-2 space-y-2 px-4">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-zinc-400">
                        <span>Tiến độ Quest</span>
                        <span className="text-zinc-900 dark:text-white">{questSuccess}/{questTotal}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full transition-all duration-1000`} 
                          style={{ width: questTotal > 0 ? `${(questSuccess/questTotal)*100}%` : '0%' }}
                        />
                    </div>
                  </div>

                  {/* Status/Badge - 2 units */}
                  <div className="col-span-2 flex justify-end">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      isSuccess 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
                        : "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20"
                    }`}>
                      {isSuccess ? 'Thành công' : 'Bị gián đoạn'}
                    </span>
                  </div>

                  {/* Action - 1 unit */}
                  <div className="col-span-1 flex justify-end">
                    <Link 
                      href={`/dashboard/expert/reports?sessionId=${session.id}&childId=${childId}`}
                      className="p-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-lg active:scale-95"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
