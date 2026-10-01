import React from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6 animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-500/20 shadow-inner">
        <Loader2 size={32} className="animate-spin" />
      </div>
      <div className="max-w-md">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">
          Đang tải dữ liệu...
        </h2>
        <p className="text-zinc-500 text-sm font-medium italic">
          Vui lòng đợi trong giây lát
        </p>
      </div>
    </div>
  );
}