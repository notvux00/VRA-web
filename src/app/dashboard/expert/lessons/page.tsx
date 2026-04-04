import { getAssignedChildren } from "@/actions/expert";
import { PlayCircle, Award, Clock, BookOpen, Layers, Star } from "lucide-react";
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

const MOCK_LESSONS = [
  {
    id: "L001",
    title: "Nhận biết cảm xúc cơ bản",
    description: "Giúp trẻ nhận biết và gọi tên các cảm xúc: Vui, Buồn, Giận dữ thông qua các tình huống 3D sinh động.",
    category: "Giao tiếp xã hội",
    duration: "15 phút",
    difficulty: "Dễ",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=400",
    color: "bg-blue-500"
  },
  {
    id: "L002",
    title: "Giao tiếp ánh mắt trong cửa hàng",
    description: "Môi trường giả lập siêu thị, trẻ thực hành nhìn vào mắt nhân viên thu ngân khi thanh toán.",
    category: "Kỹ năng sống",
    duration: "10 phút",
    difficulty: "Trung bình",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
    color: "bg-emerald-500"
  },
  {
    id: "L003",
    title: "Xử lý tiếng ồn nơi công cộng",
    description: "Trẻ tập làm quen với tiếng ồn của xe cộ và đám đông trong môi trường kiểm soát.",
    category: "Phòng ngừa lo âu",
    duration: "20 phút",
    difficulty: "Khó",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=400",
    color: "bg-amber-500"
  },
  {
    id: "L004",
    title: "Phân loại vật dụng theo màu sắc",
    description: "Trò chơi tương tác tay-mắt yêu cầu trẻ phân loại các vật phẩm vào đúng rổ màu.",
    category: "Tư duy logic",
    duration: "12 phút",
    difficulty: "Dễ",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=400",
    color: "bg-purple-500"
  },
  {
    id: "L005",
    title: "Xếp hàng chờ đợi",
    description: "Thực hành kỹ năng kiên nhẫn khi phải xếp hàng tại trạm xe bus giả lập.",
    category: "Kỹ năng xã hội",
    duration: "15 phút",
    difficulty: "Trung bình",
    image: "https://images.unsplash.com/photo-1517611508029-4a0230bc014c?auto=format&fit=crop&q=80&w=400",
    color: "bg-indigo-500"
  },
  {
    id: "L006",
    title: "Thoát hiểm khi có hỏa hoạn",
    description: "Bài học kỹ năng sinh tồn quan trọng, dạy trẻ các bước di chuyển an toàn khi có báo động.",
    category: "Kỹ năng sinh tồn",
    duration: "25 phút",
    difficulty: "Khó",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400",
    color: "bg-rose-500"
  }
];

export default async function ExpertLessonsPage({ searchParams }: PageProps) {
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
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 transform hover:scale-110 transition-transform cursor-pointer">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Kho bài học VR</h1>
            <p className="text-zinc-500 font-medium tracking-wide">
              Thiết lập chương trình cho bé: <span className="text-blue-600 font-black uppercase">{child?.display_name || child?.name}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-2 pl-5 rounded-2xl shadow-sm">
           <div className="text-right">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Tổng số bài học</p>
              <p className="text-lg font-black text-zinc-900 dark:text-white">{MOCK_LESSONS.length}</p>
           </div>
           <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
              <Layers size={20} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {MOCK_LESSONS.map((lesson, i) => (
           <div 
             key={lesson.id} 
             className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 relative"
           >
              <div className="h-44 relative overflow-hidden">
                <img 
                  src={lesson.image} 
                  alt={lesson.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6">
                   <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                     {lesson.category}
                   </span>
                </div>
              </div>

              <div className="p-8 space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase leading-tight group-hover:text-blue-600 transition-colors">
                      {lesson.title}
                    </h3>
                 </div>
                 
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                   {lesson.description}
                 </p>

                 <div className="flex items-center gap-4 pt-4 border-t border-zinc-50 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                       <Clock size={14} className="text-zinc-400" />
                       <span className="text-xs font-bold text-zinc-500 uppercase">{lesson.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Star size={14} className="text-amber-500" fill="currentColor" />
                       <span className="text-xs font-bold text-zinc-500 uppercase">{lesson.difficulty}</span>
                    </div>
                 </div>

                 <button className="w-full mt-2 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all shadow-xl shadow-zinc-200/50 dark:shadow-none active:scale-95">
                    <PlayCircle size={18} />
                    Khởi chạy trên thiết bị VR
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
