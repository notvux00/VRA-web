import { PlayCircle, Clock, Target, Trophy, TrendingUp } from "lucide-react";

const stats = [
  { label: "Số buổi tập VR", value: "24", icon: PlayCircle, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-400/10" },
  { label: "Thời gian trong VR", value: "14h 30m", icon: Clock, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-400/10" },
  { label: "Điểm Tập trung", value: "85%", icon: Target, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-400/10" },
  { label: "Thành tích", value: "12", icon: Trophy, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-400/10" },
];

export default function ParentStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-blue-200 dark:hover:border-zinc-700 transition-colors shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center mb-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <TrendingUp size={18} className="text-zinc-400 dark:text-zinc-600" />
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</div>
          <div className="text-sm font-medium text-zinc-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
