import { Users, Activity, PlayCircle, TrendingUp } from "lucide-react";

interface CenterOverviewStatsProps {
  stats: {
    totalexpert: number;
    totalChildren: number;
    activeSessions: number;
  } | null;
}

export default function CenterOverviewStats({ stats }: CenterOverviewStatsProps) {
  const displayStats = [
    { 
      label: "Chuyên gia", 
      value: stats?.totalexpert || 0, 
      icon: Users, 
      color: "text-blue-600 dark:text-blue-400", 
      bg: "bg-blue-100 dark:bg-blue-400/10" 
    },
    { 
      label: "Trẻ em", 
      value: stats?.totalChildren || 0, 
      icon: Activity, 
      color: "text-purple-600 dark:text-purple-400", 
      bg: "bg-purple-100 dark:bg-purple-400/10" 
    },
    { 
      label: "Đang trị liệu", 
      value: stats?.activeSessions || 0, 
      icon: PlayCircle, 
      color: "text-emerald-600 dark:text-emerald-400", 
      bg: "bg-emerald-100 dark:bg-emerald-400/10" 
    },
    { 
      label: "Hiệu quả trung bình", 
      value: "82%", 
      icon: TrendingUp, 
      color: "text-amber-600 dark:text-amber-400", 
      bg: "bg-amber-100 dark:bg-amber-400/10" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayStats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-blue-200 dark:hover:border-zinc-700 transition-colors shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center mb-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</div>
          <div className="text-sm font-medium text-zinc-500 underline-offset-4 decoration-dotted decoration-zinc-300 dark:decoration-zinc-700">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
