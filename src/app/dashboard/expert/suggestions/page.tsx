import { getAssignedChildren } from "@/actions/expert";
import { Sparkles, Brain, Target, TrendingUp, Zap, ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

interface Child {
  id: string;
  display_name?: string;
  name?: string;
  condition?: string;
  [key: string]: any;
}

const MOCK_SUGGESTIONS = [
  {
    id: "S001",
    title: "Phát triển tập trung thị giác",
    reason: "Dựa trên chỉ số tập trung thấp trong 3 buổi gần nhất (TB: 45%)",
    lessonTitle: "Tìm kiếm đồ vật trong rừng",
    intensity: "Cao",
    duration: "15 phút",
    benefits: ["Cải thiện khả năng lọc nhiễu", "Tăng thời gian chú ý đơn mục tiêu"]
  },
  {
    id: "S002",
    title: "Giảm nhạy cảm âm thanh",
    reason: "Bé có biểu hiện lo âu khi gặp tiếng ồn đột ngột trong môi trường giả lập.",
    lessonTitle: "Âm thanh đường phố êm dịu",
    intensity: "Thấp",
    duration: "10 phút",
    benefits: ["Giải mẫn cảm âm thanh", "Kỹ thuật tự điều chỉnh cảm xúc"]
  },
  {
    id: "S003",
    title: "Kỹ năng tương tác xã hội",
    reason: "Khuyến nghị từ phác đồ chuẩn cho trẻ cùng độ tuổi và tình trạng.",
    lessonTitle: "Chào hỏi hàng xóm",
    intensity: "Trung bình",
    duration: "12 phút",
    benefits: ["Thực hành giao tiếp ánh mắt", "Học các mẫu câu chào hỏi cơ bản"]
  }
];

export default async function ExpertSuggestionsPage({ searchParams }: PageProps) {
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
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-amber-500/20 transform hover:rotate-12 transition-transform">
            <Sparkles size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Bài học gợi ý AI</h1>
            <p className="text-zinc-500 font-medium tracking-wide">
              Lộ trình cá nhân hóa cho: <span className="text-amber-600 font-black uppercase">{child?.display_name || child?.name}</span>
            </p>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-6 py-3 rounded-2xl border border-amber-100 dark:border-amber-900/30">
           <Brain className="text-amber-600" size={20} />
           <span className="text-xs font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">
             AI-Powered Analytics
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
         {MOCK_SUGGESTIONS.map((s, i) => (
           <div 
             key={s.id} 
             className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-10 flex flex-col lg:flex-row gap-10 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-500 relative overflow-hidden"
           >
              <div className="lg:w-1/3 space-y-4">
                 <div className="flex items-center gap-2 text-amber-600">
                    <Target size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Mục tiêu can thiệp</span>
                 </div>
                 <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase leading-tight group-hover:text-amber-600 transition-colors">
                   {s.title}
                 </h2>
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                   {s.reason}
                 </p>
                 <div className="pt-4 flex flex-wrap gap-2">
                    {s.benefits.map((b, idx) => (
                      <span key={idx} className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-500">
                        + {b}
                      </span>
                    ))}
                 </div>
              </div>

              <div className="lg:w-2/3 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] p-8 border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-8 group-hover:bg-amber-50/50 dark:group-hover:bg-amber-500/5 transition-colors">
                 <div className="space-y-2 text-center md:text-left">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bài học đề xuất</p>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase">{s.lessonTitle}</h3>
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                       <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                          <TrendingUp size={14} className="text-amber-500" /> Cường độ: {s.intensity}
                       </span>
                       <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                          <Zap size={14} className="text-blue-500" /> {s.duration}
                       </span>
                    </div>
                 </div>

                 <button className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 transition-all shadow-xl shadow-zinc-200/50 dark:shadow-none active:scale-95 whitespace-nowrap">
                    <PlayCircle size={18} />
                    Bắt đầu lộ trình
                    <ChevronRight size={16} />
                 </button>
              </div>

              {i === 0 && (
                <div className="absolute top-0 right-0">
                  <div className="bg-amber-500 text-white text-[10px] font-black uppercase px-6 py-2 rounded-bl-3xl tracking-widest shadow-lg">
                    Ưu tiên cao
                  </div>
                </div>
              )}
           </div>
         ))}
      </div>
    </div>
  );
}
