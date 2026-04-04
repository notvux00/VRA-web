import { getAssignedChildren } from "@/actions/expert";
import { History, Calendar, Clock, BarChart3, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

interface Child {
  id: string;
  display_name?: string;
  name?: string;
  [key: string]: any;
}

const MOCK_HISTORY = [
  {
    id: "H001",
    date: "04/04/2026",
    lesson: "Nhận biết cảm xúc cơ bản",
    duration: "15:20",
    focusScore: 88,
    status: "Hoàn thành",
    notes: "Bé phản ứng tốt với các icon cảm xúc, cần tăng độ khó."
  },
  {
    id: "H002",
    date: "02/04/2026",
    lesson: "Xếp hàng siêu thị",
    duration: "10:45",
    focusScore: 65,
    status: "Hoàn thành",
    notes: "Bé hơi lo lắng khi đám đông xuất hiện. Cần luyện tập thêm bài giảm nhạy cảm."
  },
  {
    id: "H003",
    date: "30/03/2026",
    lesson: "Giao tiếp ánh mắt",
    duration: "05:12",
    focusScore: 42,
    status: "Bị ngắt quãng",
    notes: "Bé tháo kính VR giữa chừng. Môi trường có thể quá sáng."
  },
  {
    id: "H004",
    date: "28/03/2026",
    lesson: "Phân loại vật dụng",
    duration: "18:00",
    focusScore: 92,
    status: "Hoàn thành",
    notes: "Hoàn thành xuất sắc. Đã đạt được huy hiệu Tỉ mỉ."
  },
  {
    id: "H005",
    date: "25/03/2026",
    lesson: "Thoát hiểm hỏa hoạn",
    duration: "12:30",
    focusScore: 75,
    status: "Hoàn thành",
    notes: "Thực hiện đúng các bước di chuyển. Cần cải thiện tốc độ phản xạ."
  }
];

export default async function ExpertHistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.childId;

  if (!childId) {
    return (
      <div className="p-20 text-center uppercase font-black text-zinc-400">
        Vui lòng chọn hồ sơ trẻ trước
      </div>
    );
  }

  const { children } = await getAssignedChildren() as { children: Child[] | undefined };
  const child = children?.find(c => c.id === childId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-zinc-900 dark:bg-white rounded-3xl flex items-center justify-center text-white dark:text-zinc-900 shadow-2xl shadow-zinc-500/20 transform hover:-rotate-6 transition-transform">
            <History size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Lịch sử can thiệp</h1>
            <p className="text-zinc-500 font-medium tracking-wide">
              Hành trình huấn luyện của: <span className="text-zinc-900 dark:text-zinc-400 font-black uppercase">{child?.display_name || child?.name}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 divide-x divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-[2rem] shadow-sm">
           <div className="px-4 text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Tổng buổi</p>
              <p className="text-xl font-black text-zinc-900 dark:text-white">24</p>
           </div>
           <div className="px-4 text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Focus TB</p>
              <p className="text-xl font-black text-blue-600">76%</p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
         {MOCK_HISTORY.map((entry) => (
           <div 
             key={entry.id} 
             className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-6 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-zinc-500/5 transition-all duration-300"
           >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-900 transition-colors">
                       <Calendar size={18} />
                       <span className="text-[8px] font-black mt-1 uppercase">{entry.date.split('/')[0]}/{entry.date.split('/')[1]}</span>
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase leading-tight tracking-tight">
                         {entry.lesson}
                       </h3>
                       <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                             <Clock size={12} /> {entry.duration}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                             <BarChart3 size={12} /> {entry.focusScore}% Focus
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl flex-1 min-w-[200px] max-w-md lg:max-w-xs">
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Ghi chú chuyên gia</p>
                       <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 italic line-clamp-2">
                         "{entry.notes}"
                       </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                       {entry.status === "Hoàn thành" ? (
                         <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest">Hoàn thành</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-100 dark:border-rose-900/30">
                            <AlertCircle size={16} className="text-rose-600" />
                            <span className="text-[10px] font-black text-rose-700 dark:text-rose-500 uppercase tracking-widest text-nowrap">Dán đoạn</span>
                         </div>
                       )}
                       
                       <button className="p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90">
                          <ExternalLink size={18} />
                       </button>
                    </div>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
