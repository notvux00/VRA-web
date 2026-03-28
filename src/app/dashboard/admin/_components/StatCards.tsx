import { Building, Users, Activity, PlayCircle } from "lucide-react";

interface Stats {
  totalCenters: number;
  totalTherapists: number;
  totalChildren: number;
  totalSessions: number;
}

interface StatCardsProps {
  stats: Stats;
  loading: boolean;
}

export default function StatCards({ stats, loading }: StatCardsProps) {
  const cards = [
    { label: "Tổng trung tâm", value: stats.totalCenters, icon: Building, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10" },
    { label: "Chuyên gia", value: stats.totalTherapists, icon: Users, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/10" },
    { label: "Trẻ em", value: stats.totalChildren, icon: Activity, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10" },
    { label: "Buổi tập VR", value: stats.totalSessions, icon: PlayCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}><stat.icon size={20} /></div>
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-4">
            {loading ? "..." : stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
