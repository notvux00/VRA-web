"use client";

import React from "react";
import dynamic from "next/dynamic";

const ChildProgressChart = dynamic(() => import("./ChildProgressChart"), { 
  ssr: false,
  loading: () => <div className="h-[320px] w-full bg-zinc-50 dark:bg-zinc-800/10 rounded-3xl animate-pulse" />
});

const ChildAnalyticsGrid = dynamic(() => import("./ChildAnalyticsGrid"), { 
  ssr: false, 
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
      <div className="h-[400px] w-full bg-zinc-50 dark:bg-zinc-800/10 rounded-3xl animate-pulse" />
      <div className="h-[400px] w-full bg-zinc-50 dark:bg-zinc-800/10 rounded-3xl animate-pulse" />
    </div>
  )
});

interface ChildChartsContainerProps {
  sessions: any[];
  radarData: any[];
}

export default function ChildChartsContainer({ sessions, radarData }: ChildChartsContainerProps) {
  return (
    <div className="space-y-8">
      {/* 1. Progress Chart (Score over time) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
             <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
               Biểu đồ tiến triển
             </h3>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Kết quả 10 buổi học gần nhất</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 border border-zinc-100 dark:border-zinc-800 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Điểm tập trung</span>
             </div>
          </div>
        </div>
        <ChildProgressChart sessions={sessions} />
      </div>

      {/* 2. Analytics Grid (Intensity + Behavioral Radar) - Full width stack now */}
      <ChildAnalyticsGrid sessions={sessions} radarData={radarData} />
    </div>
  );
}
