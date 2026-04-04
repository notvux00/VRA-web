import { Activity, Clock, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { getChildSessions } from "@/actions/parent";

interface RecentSessionsProps {
  childId: string;
}

export default async function RecentSessions({ childId }: RecentSessionsProps) {
  const result = await getChildSessions(childId);
  
  if (!result.success || !result.sessions) return null;
  const sessions = result.sessions;

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Hoạt động gần đây</h2>
        <div className="text-center py-10">
          <Activity className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" size={40} />
          <p className="text-zinc-500 dark:text-zinc-400">Chưa có dữ liệu buổi tập nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Hoạt động gần đây</h2>
      <div className="space-y-5">
        {sessions.map((session, i) => {
          const isCompleted = ["success", "Đã hoàn thành"].includes(session.completion_status);
          const date = session.start_time ? new Date(session.start_time).toLocaleDateString("vi-VN", { day: "numeric", month: "short" }) : "N/A";
          const duration = session.duration ? `${Math.round(session.duration / 60)} phút` : "N/A";

          return (
            <div key={session.id || i} className="flex items-center gap-4 group cursor-pointer">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                isCompleted
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-500"
              }`}>
                {isCompleted ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-zinc-900 dark:text-zinc-200 font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {session.lesson_id || "Bài tập VR"}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Calendar size={12} />
                    <span>{date}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock size={12} />
                    <span>{duration}</span>
                  </div>
                </div>
              </div>
              {isCompleted && (
                <div className="font-bold text-sm text-zinc-800 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                  {session.score || "75"}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button className="w-full mt-6 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors">
        Xem tất cả
      </button>
    </div>
  );
}
