import { Activity } from "lucide-react";

const sessions = [
  { title: "Luyện tập Tập trung Không gian", date: "Hôm nay", duration: "25 phút", status: "Đã hoàn thành", score: "A" },
  { title: "Điều chỉnh Cảm xúc", date: "Hôm qua", duration: "30 phút", status: "Đã hoàn thành", score: "B+" },
  { title: "Tương tác Xã hội Sandbox", date: "18 thg 3", duration: "15 phút", status: "Bị gián đoạn", score: "N/A" },
  { title: "Luyện tập Tập trung Không gian", date: "15 thg 3", duration: "20 phút", status: "Đã hoàn thành", score: "B" },
];

export default function RecentSessions() {
  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Hoạt động gần đây</h2>
      <div className="space-y-5">
        {sessions.map((session, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-pointer">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              session.status === "Đã hoàn thành"
                ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"
                : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-500"
            }`}>
              <Activity size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-zinc-900 dark:text-zinc-200 font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {session.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-500">{session.date}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-xs text-zinc-500">{session.duration}</span>
              </div>
            </div>
            {session.status === "Đã hoàn thành" && (
              <div className="font-bold text-sm text-zinc-800 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                {session.score}
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors">
        Xem tất cả
      </button>
    </div>
  );
}
