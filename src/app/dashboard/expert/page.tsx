"use client";

import { FileText, Plus } from "lucide-react";
import ExpertStats from "./_components/TherapistStats";
import ChildrenTable from "./_components/ChildrenTable";

export default function ExpertDashboard() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Trang Chuyên gia</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Theo dõi hồ sơ trẻ em và điều phối các buổi tập VR.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all shadow-sm">
            <FileText size={16} />
            <span>Báo cáo</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all shadow-sm">
            <Plus size={16} />
            <span>Thêm hồ sơ</span>
          </button>
        </div>
      </div>

      <ExpertStats />
      <ChildrenTable />
    </div>
  );
}
