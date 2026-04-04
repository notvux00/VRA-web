"use client";

import { FileText, Download, Eye, Clock, User, FileBarChart, Filter, Search, ChevronRight } from "lucide-react";
import React from "react";

const reports = [
  { id: "REP-01", child: "Gia Bảo", date: "02/04/2026", lesson: "Rửa tay giải trí", score: 85, focus: 92, status: "Đã duyệt" },
  { id: "REP-02", child: "Minh Anh", date: "01/04/2026", lesson: "Siêu thị ảo", score: 72, focus: 68, status: "Chờ duyệt" },
  { id: "REP-03", child: "Hoàng Long", date: "31/03/2026", lesson: "Cảm xúc sơ cấp", score: 95, focus: 98, status: "Đã duyệt" },
  { id: "REP-04", child: "Bảo Nam", date: "29/03/2026", lesson: "Thoát hiểm hỏa hoạn", score: 88, focus: 85, status: "Đã duyệt" },
  { id: "REP-05", child: "Khánh Linh", date: "28/03/2026", lesson: "Giao tiếp mắt", score: 65, focus: 45, status: "Cần lưu ý" },
];

export default function ExpertReportsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
            <FileBarChart size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Báo cáo Lâm sàng</h1>
            <p className="text-zinc-500 font-medium tracking-wide">Lưu trữ kết quả & đánh giá chuyên sâu hằng ngày</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Tìm mã báo cáo, tên trẻ..." 
                className="pl-12 pr-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-full md:w-80 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
           </div>
           <button className="p-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-zinc-500/10">
              <Filter size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <div 
            key={report.id} 
            className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 cursor-pointer"
          >
            <div className="flex items-center gap-8 w-full lg:w-auto">
               <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <FileText size={28} />
               </div>
               
               <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                     <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{report.id}</span>
                     <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                        report.status === 'Đã duyệt' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500' : 
                        report.status === 'Chờ duyệt' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500' :
                        'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500'
                     }`}>{report.status}</span>
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter group-hover:text-blue-600 transition-colors">{report.lesson}</h3>
                  <div className="flex items-center gap-6 text-xs text-zinc-400 font-bold uppercase tracking-widest">
                     <span className="flex items-center gap-2"><User size={14} className="text-blue-500" /> {report.child}</span>
                     <span className="flex items-center gap-2"><Clock size={14} className="text-zinc-600 dark:text-white" /> {report.date}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-12 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-zinc-50 dark:border-zinc-800 pt-6 lg:pt-0">
               <div className="flex gap-12">
                  <div className="text-center">
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Score</p>
                     <p className="text-xl font-black text-zinc-900 dark:text-white font-mono leading-none">{report.score}%</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Focus Ratio</p>
                     <p className={`text-xl font-black font-mono leading-none ${report.focus > 80 ? 'text-emerald-500' : report.focus > 60 ? 'text-amber-500' : 'text-rose-500'}`}>{report.focus}%</p>
                  </div>
               </div>
               
               <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-6 py-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-600 text-zinc-900 dark:text-white hover:text-white rounded-2xl transition-all border border-zinc-100 dark:border-zinc-800 shadow-sm font-black text-xs uppercase tracking-widest group/btn">
                     <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                     <span>Xem chi tiết</span>
                  </button>
                  <button className="p-4 bg-white dark:bg-zinc-900 hover:bg-zinc-900 dark:hover:bg-white text-zinc-400 hover:text-white dark:hover:text-zinc-900 rounded-2xl transition-all border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-95">
                     <Download size={20} />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
