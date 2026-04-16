import { Activity, Clock, Calendar, PlayCircle } from "lucide-react";
import { getChildSessions } from "@/actions/parent";
import Link from "next/link";

interface RecentSessionsProps {
  childId: string;
}

export default async function RecentSessions({ childId }: RecentSessionsProps) {
  const result = await getChildSessions(childId);
  
  if (!result.success || !result.sessions) return null;
  const sessions = result.sessions;

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm dark:shadow-none">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-8">Hoạt động gần đây</h2>
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="text-zinc-300 dark:text-zinc-600" size={32} />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Chưa có dữ liệu buổi tập nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Hoạt động gần đây</h2>
        <Link 
          href={`/dashboard/parent/history?childId=${childId}`}
          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
        >
          Tất cả
        </Link>
      </div>

      <div className="relative space-y-1">
        {/* Timeline Vertical Line */}
        <div className="absolute left-6 top-2 bottom-6 w-0.5 bg-zinc-100 dark:bg-zinc-800" />

        {sessions.slice(0, 5).map((session, i) => {
          const isCompleted = ["success", "Đã hoàn thành"].includes(session.completion_status);
          const date = session.start_time ? new Date(session.start_time).toLocaleDateString("vi-VN", { day: "numeric", month: "long" }) : "N/A";
          const duration = session.duration 
            ? (session.duration >= 60 
                ? `${Math.floor(session.duration / 60)} phút ${Math.round(session.duration % 60)} giây` 
                : `${Math.round(session.duration)} giây`) 
            : "---";

          return (
            <Link 
              key={session.id || i}
              href={`/dashboard/parent/reports?sessionId=${session.id}`}
              className="relative flex items-start gap-6 p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group"
            >
              {/* Timeline Node */}
              <div className={`relative z-10 w-4 h-4 rounded-full mt-5 shrink-0 border-4 border-white dark:border-zinc-950 ${
                isCompleted ? "bg-emerald-500" : "bg-red-500"
              }`} />

              <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-5 rounded-3xl shadow-sm group-hover:shadow-md group-hover:border-blue-200 dark:group-hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wide truncate">
                    {session.lesson_name || session.lesson_id || "Bài tập VR"}
                  </h4>
                  <div className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                    isCompleted 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                      : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                  }`}>
                    {session.score || "---"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                    <Calendar size={12} className="text-zinc-400" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                    <Clock size={12} className="text-zinc-400" />
                    <span>{duration}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link 
        href={`/dashboard/parent/history?childId=${childId}`}
        className="w-full mt-8 py-4 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-500/30 font-black text-[10px] text-zinc-400 hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
      >
        <PlayCircle size={14} className="group-hover:scale-110 transition-transform" />
        Lịch sử tập luyện
      </Link>
    </div>
  );
}
