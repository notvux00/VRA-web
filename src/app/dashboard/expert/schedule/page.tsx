"use client";

import { Calendar as CalendarIcon, ArrowLeft, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ExpertSchedulePage() {
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
           <Link href="/dashboard/expert" className="text-zinc-500 hover:text-blue-600 flex items-center gap-2 text-sm mb-4 transition-colors font-medium">
              <ArrowLeft size={16} />
              Quay lại tổng quan
           </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Lịch Trị liệu</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Quản lý các buổi tập VR đã lên lịch với trẻ em.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
           <Plus size={16} />
           SẮP XẾP LỊCH MỚI
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Tháng 4, 2026</h3>
            <div className="flex gap-2">
               <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
               <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"><ChevronRight size={20} /></button>
            </div>
         </div>

         <div className="grid grid-cols-7 gap-4">
            {days.map(day => (
               <div key={day} className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">{day}</div>
            ))}
            {/* Calendar Placeholder */}
            {Array.from({ length: 30 }).map((_, i) => (
               <div key={i} className={`aspect-square p-2 border border-zinc-100 dark:border-zinc-800 rounded-2xl relative group hover:border-blue-500/50 transition-all cursor-pointer ${i === 3 ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                  <span className="text-xs font-bold text-zinc-500">{i + 1}</span>
                  {i === 3 && (
                     <div className="absolute inset-x-1 bottom-1 p-1 bg-blue-600 rounded-lg text-[8px] font-black text-white truncate uppercase tracking-tighter">
                        VR: Gia Bảo
                     </div>
                  )}
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
