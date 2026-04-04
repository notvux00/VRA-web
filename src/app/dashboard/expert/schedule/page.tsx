"use client";

import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, User, Target, MapPin } from "lucide-react";
import React from "react";

const UPCOMING_SESSIONS = [
  { id: 1, child: "Gia Bảo", time: "09:00 - 10:00", lesson: "Nhận biết cảm xúc", type: "Virtual Reality" },
  { id: 2, child: "Minh Anh", time: "10:30 - 11:30", lesson: "Kỹ năng đi siêu thị", type: "Mixed Reality" },
  { id: 3, child: "Hoàng Long", time: "14:00 - 15:00", lesson: "Giao tiếp ánh mắt", type: "Eye Tracking" },
];

export default function ExpertSchedulePage() {
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 dark:bg-white rounded-3xl flex items-center justify-center text-white dark:text-zinc-900 shadow-2xl shadow-blue-500/20 transform hover:rotate-3 transition-transform">
            <CalendarIcon size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Lịch Trị liệu</h1>
            <p className="text-zinc-500 font-medium tracking-wide italic">Điều phối các buổi can thiệp VR trong ngày</p>
          </div>
        </div>
        <button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white px-8 py-4 rounded-[1.5rem] text-xs font-black flex items-center gap-2 shadow-xl shadow-zinc-500/10 active:scale-95 transition-all group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            SẮP XẾP LỊCH MỚI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Calendar View */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 text-zinc-50 opacity-5 dark:opacity-10 pointer-events-none">
             <CalendarIcon size={200} />
          </div>
          
          <div className="flex justify-between items-center mb-10 relative z-10">
             <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">Tháng 4, 2026</h3>
             <div className="flex gap-4">
                <button className="p-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-200 rounded-2xl transition-all"><ChevronLeft size={20} /></button>
                <button className="p-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-200 rounded-2xl transition-all"><ChevronRight size={20} /></button>
             </div>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-8 relative z-10">
             {days.map(day => (
                <div key={day} className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">{day}</div>
             ))}
          </div>
          
          <div className="grid grid-cols-7 gap-3 relative z-10">
             {Array.from({ length: 35 }).map((_, i) => {
               const dayNum = i - 2; // Offset for Monday start
               const isCurrentMonth = dayNum > 0 && dayNum <= 30;
               const isToday = dayNum === 14;
               const hasEvent = dayNum === 4 || dayNum === 15 || dayNum === 22;

               return (
                <div key={i} className={`aspect-square p-2 border border-zinc-50 dark:border-zinc-800 rounded-2xl relative group hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden ${!isCurrentMonth ? 'opacity-20' : ''} ${isToday ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 ring-2 ring-blue-500/20' : 'bg-zinc-50/50'}`}>
                   <span className={`text-xs font-black ${isToday ? 'text-blue-600' : 'text-zinc-500'}`}>{isCurrentMonth ? dayNum : ''}</span>
                   {isCurrentMonth && hasEvent && (
                      <div className="absolute inset-x-1 bottom-1 p-1 bg-zinc-900 dark:bg-zinc-700 rounded-lg text-[8px] font-black text-white truncate uppercase tracking-tighter text-center">
                         CAN-THIEP
                      </div>
                   )}
                </div>
               );
             })}
          </div>
        </div>

        {/* Right: Upcoming Focus */}
        <div className="space-y-6">
           <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter pl-4 border-l-4 border-blue-600">Buổi tập hôm nay</h3>
           <div className="flex flex-col gap-4">
              {UPCOMING_SESSIONS.map((session) => (
                <div key={session.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 hover:shadow-lg transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">
                         <Target size={12} />
                         {session.type}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 italic">{session.time}</span>
                   </div>
                   <h4 className="text-lg font-black text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">{session.lesson}</h4>
                   <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                            <User size={16} />
                         </div>
                         <span className="text-sm font-bold text-zinc-500">{session.child}</span>
                      </div>
                      <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                         <ChevronRight size={20} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="bg-zinc-900 dark:bg-zinc-100 p-8 rounded-[2.5rem] mt-10 text-white dark:text-zinc-900 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 font-mono italic">AI Recommendation</p>
                <h4 className="text-xl font-black tracking-tight leading-tight mb-4 group-hover:translate-x-1 transition-transform">Xu hướng tập trung buổi chiều thường thấp hơn 15%.</h4>
                <p className="text-sm font-medium opacity-80 leading-relaxed mb-6">
                  Chúng tôi đề xuất sắp xếp các bài tập cường độ cao vào khung giờ 09:00 - 11:30 để tối ưu hiệu quả.
                </p>
                <button className="w-full py-4 bg-white/20 dark:bg-zinc-900/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/30 transition-all backdrop-blur-md">
                   Tối ưu hóa lịch trình
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
           </div>
        </div>
      </div>
    </div>
  );
}
