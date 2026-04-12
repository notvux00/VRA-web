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

// Mock data removed for empty state

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
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-400 border border-zinc-100 dark:border-zinc-700">
           <History size={40} />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Chưa có dữ liệu</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            Lịch sử học tập sẽ được cập nhật đầy đủ sau khi các bảng báo cáo đo lường hoàn tất. Tính năng đang trong quá trình phát triển.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
