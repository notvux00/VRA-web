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

// Mock data removed for empty state

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
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-600 border border-amber-100 dark:border-amber-900/40">
           <Sparkles size={40} />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Chưa có dữ liệu bài học gợi ý</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            Mô hình Trí tuệ AI cần thu thập thêm dữ liệu từ các buổi học tương tác của trẻ với kính VR trên thực tế để đưa ra lộ trình cá nhân hóa chính xác nhất.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
