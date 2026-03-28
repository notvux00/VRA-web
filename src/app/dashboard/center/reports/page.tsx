"use client";

import React from "react";
import { BarChart3, ArrowLeft, Construction, Info } from "lucide-react";
import Link from "next/link";

export default function CenterReportsPage() {
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Báo cáo & Thống kê</h1>
          <p className="text-zinc-500 font-medium">Trung tâm Điều trị</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[3rem] p-12 text-center relative overflow-hidden">
         <div className="flex items-center justify-center mb-8">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 animate-pulse">
              <Construction size={64} />
            </div>
         </div>
         <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">Tính năng đang được phát triển</h3>
         <p className="text-lg text-zinc-500 max-w-md mx-auto font-medium leading-relaxed">
           Hệ thống báo cáo chuyên sâu về hiệu suất của trung tâm, tần suất sử dụng thiết bị VR và tiến độ hồi phục của trẻ em đang được chúng tôi hoàn thiện.
         </p>
         
         <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-40 grayscale pointer-events-none">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 h-40 flex flex-col justify-end gap-3 text-left">
                 <div className="w-12 h-2 bg-blue-400 rounded-full" />
                 <div className="w-20 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
                 <div className="w-full h-8 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
              </div>
            ))}
         </div>

         <div className="absolute top-10 right-10">
            <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-blue-500/40">
              Coming Soon
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 shrink-0">
               <Info size={24} />
            </div>
            <div>
               <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Dữ liệu Real-time</h4>
               <p className="text-sm text-zinc-500 font-medium">Báo cáo sẽ được tổng hợp tự động từ các Session hoàn thành trên kính VR.</p>
            </div>
         </div>
         <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 shrink-0">
               <BarChart3 size={24} />
            </div>
            <div>
               <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Xuất file PDF/Excel</h4>
               <p className="text-sm text-zinc-500 font-medium">Hỗ trợ xuất báo cáo định kỳ hàng tuần cho từng gia đình và nội bộ trung tâm.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
