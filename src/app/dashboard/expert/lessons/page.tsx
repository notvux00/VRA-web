"use client";

import { PlayCircle, ArrowLeft, Search, Filter } from "lucide-react";
import Link from "next/link";

const lessons = [
  { id: 1, title: "Rửa tay sạch sẽ", duration: "10 min", category: "Kỹ năng sống", difficulty: "Dễ" },
  { id: 2, title: "Đi siêu thị", duration: "15 min", category: "Kỹ năng xã hội", difficulty: "Trung bình" },
  { id: 3, title: "Nhận biết cảm xúc", duration: "12 min", category: "Giao tiếp", difficulty: "Dễ" },
  { id: 4, title: "Xếp hàng chờ đợi", duration: "8 min", category: "Kỹ năng xã hội", difficulty: "Dễ" },
  { id: 5, title: "Sang đường an toàn", duration: "20 min", category: "Kỹ năng sống", difficulty: "Khó" },
];

export default function ExpertLessonsPage() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Link href="/dashboard/expert" className="text-zinc-500 hover:text-blue-600 flex items-center gap-2 text-sm mb-4 transition-colors font-medium">
            <ArrowLeft size={16} />
            Quay lại tổng quan
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Thư viện Bài học VR</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Danh sách các bài tập VR có sẵn để gán cho các buổi tập.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
               type="text" 
               placeholder="Tìm kiếm bài học..." 
               className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-all">
            <Filter size={16} />
            Lọc
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 transition-transform group-hover:scale-110">
                <PlayCircle size={24} />
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                lesson.difficulty === 'Dễ' ? 'bg-emerald-50 text-emerald-600' : 
                lesson.difficulty === 'Trung bình' ? 'bg-amber-50 text-amber-600' : 
                'bg-red-50 text-red-600'
              }`}>
                {lesson.difficulty}
              </span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
              {lesson.title}
            </h3>
            <p className="text-sm text-zinc-500 mb-4">{lesson.category}</p>
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
               <span>ĐỘ DÀI: {lesson.duration}</span>
               <button className="text-blue-600 hover:underline">CHI TIẾT</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
