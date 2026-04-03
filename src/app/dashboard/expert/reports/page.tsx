"use client";

import { FileText, ArrowLeft, Download, Eye, Clock, User, Target } from "lucide-react";
import Link from "next/link";

const reports = [
  { id: "REP-01", child: "Gia Bảo", date: "02/04/2026", lesson: "Rửa tay", score: 85, status: "Hoàn tất" },
  { id: "REP-02", child: "Minh Anh", date: "01/04/2026", lesson: "Đi siêu thị", score: 72, status: "Chờ duyệt" },
  { id: "REP-03", child: "Hoàng Long", date: "31/03/2026", lesson: "Nhận biết cảm xúc", score: 90, status: "Hoàn tất" },
];

export default function ExpertReportsPage() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Link href="/dashboard/expert" className="text-zinc-500 hover:text-blue-600 flex items-center gap-2 text-sm mb-4 transition-colors font-medium">
            <ArrowLeft size={16} />
            Quay lại tổng quan
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Báo cáo Lâm sàng</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Danh sách các báo cáo buổi tập đã thực hiện và lưu trữ.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-6">
               <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                  <FileText size={24} />
               </div>
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{report.id}</span>
                     <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                        report.status === 'Hoàn tất' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                     }`}>{report.status}</span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{report.lesson}</h3>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                     <span className="flex items-center gap-1"><User size={12} /> {report.child}</span>
                     <span className="flex items-center gap-1"><Clock size={12} /> {report.date}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto">
               <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">HIỆU SUẤT</p>
                  <div className="flex items-center gap-2">
                     <div className="w-24 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${report.score}%` }} />
                     </div>
                     <span className="text-sm font-black text-blue-600 font-mono">{report.score}%</span>
                  </div>
               </div>
               
               <div className="flex gap-2">
                  <button className="p-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-500 hover:text-blue-600 rounded-xl transition-all border border-zinc-100 dark:border-zinc-800">
                     <Eye size={20} />
                  </button>
                  <button className="p-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-500 hover:text-blue-600 rounded-xl transition-all border border-zinc-100 dark:border-zinc-800">
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
