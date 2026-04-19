"use client";

import React from "react";
import dynamic from "next/dynamic";

const ChildProgressChart = dynamic(() => import("./ChildProgressChart"), { 
  ssr: false,
  loading: () => <div className="h-[320px] w-full bg-zinc-50 dark:bg-zinc-800/10 rounded-3xl animate-pulse" />
});

const ChildRadarChart = dynamic(() => import("./ChildRadarChart"), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-zinc-50 dark:bg-zinc-800/10 rounded-3xl animate-pulse" />
});

const ChildIntensityChart = dynamic(() => import("./ChildIntensityChart"), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-zinc-50 dark:bg-zinc-800/10 rounded-3xl animate-pulse" />
});

const ChildIndependenceChart = dynamic(() => import("./ChildIndependenceChart"), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-zinc-50 dark:bg-zinc-800/10 rounded-3xl animate-pulse" />
});

interface ChildChartsContainerProps {
  sessions: any[];
  radarData: any[];
}

export default function ChildChartsContainer({ sessions, radarData }: ChildChartsContainerProps) {
  return (
    <div className="space-y-8">
      {/* 1. Behavioral Profile (Radar Chart) - MOVED TO TOP */}
      <ChildRadarChart radarData={radarData} />

      {/* 2. Progress Chart (Score over time) */}
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
                <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Điểm bài học</span>
             </div>
          </div>
        </div>
        <ChildProgressChart sessions={sessions} />
      </div>

      {/* 3. Training Intensity (Bar Chart) */}
      <ChildIntensityChart sessions={sessions} />

      {/* 4. Independence Index (Stacked Bar Chart) */}
      <ChildIndependenceChart sessions={sessions} />
    </div>
  );
}
