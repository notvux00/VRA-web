"use client";

import { Link as LinkIcon } from "lucide-react";
import ParentStats from "./_components/ParentStats";
import FocusChart from "./_components/FocusChart";
import ExpertNote from "./_components/TherapistNote";
import RecentSessions from "./_components/RecentSessions";

export default function ParentDashboard() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Chào buổi tối!</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Đây là tiến trình học tập của bé trong tuần này.</p>
        </div>
        <button className="bg-blue-600 dark:bg-white/10 hover:bg-blue-700 dark:hover:bg-white/20 border border-blue-500 dark:border-white/10 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all shadow-sm">
          <LinkIcon size={16} />
          <span>Thêm hồ sơ bé</span>
        </button>
      </div>

      <ParentStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <FocusChart />
          <ExpertNote />
        </div>
        <div>
          <RecentSessions />
        </div>
      </div>
    </div>
  );
}
