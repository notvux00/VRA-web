import { Users, PlayCircle, Activity } from "lucide-react";

interface ExpertStatsProps {
  totalChildren: number;
  totalSessions: number;
  activeSessions: number;
}

export default function ExpertStats({ totalChildren, totalSessions, activeSessions }: ExpertStatsProps) {
  const stats = [
    { label: "Đang can thiệp", value: totalChildren.toString(), icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-400/10" },
    { label: "Tổng buổi tập", value: totalSessions.toString(), icon: PlayCircle, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-400/10" },
    { label: "Đang diễn ra", value: activeSessions.toString(), icon: Activity, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-400/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-blue-200 dark:hover:border-zinc-700 transition-colors shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center mb-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</div>
          <div className="text-sm font-medium text-zinc-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
