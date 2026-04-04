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
      {/* 1. Progress Chart (Score over time) - Enabled as per user request */}
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

      {/* 2. Placeholder for remaining analytics */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
        <div className="max-w-md mx-auto space-y-4 relative z-10 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
          </div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Phân tích chuyên sâu</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
            Hệ thống đang tổng hợp dữ liệu cho Hồ sơ năng lực và Cường độ luyện tập. Các thông tin này sẽ sớm xuất hiện.
          </p>
        </div>
      </div>
    </div>
  );
}
