"use client";

import React from "react";
import { ChevronRight, Baby, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface Child {
  id: string;
  display_name?: string;
  name?: string;
  age?: number;
  avatar_color?: string;
}

interface ExportProfilePickerProps {
  childrenList: Child[];
}

const COLORS = [
  "from-blue-600 to-blue-400",
  "from-purple-600 to-purple-400",
  "from-emerald-600 to-emerald-400",
  "from-amber-600 to-amber-400",
  "from-rose-600 to-rose-400",
  "from-indigo-600 to-indigo-400",
];

export default function ExpertProfilePicker({ childrenList }: ExportProfilePickerProps) {
  const router = useRouter();

  const handleSelect = (childId: string) => {
    router.push(`/dashboard/expert?childId=${childId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-black overflow-hidden select-none">
      <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10">
          <Users size={32} />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
          Hôm nay bạn <br className="hidden md:block"/> làm việc với ai?
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
          Chọn hồ sơ trẻ để bắt đầu phiên làm việc chuyên sâu
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14 max-w-6xl animate-in fade-in zoom-in duration-800 delay-200">
        {childrenList.map((child, index) => (
          <button
            key={child.id}
            onClick={() => handleSelect(child.id)}
            className="group flex flex-col items-center gap-6 transition-all duration-500"
          >
            {/* Avatar Circle */}
            <div className={`relative w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center text-white transition-all duration-500 group-hover:scale-110 group-hover:ring-8 group-hover:ring-blue-500/20 group-active:scale-95 bg-gradient-to-tr shadow-2xl ${COLORS[index % COLORS.length]}`}>
              <Baby size={48} className="md:size-52 transition-transform duration-500 group-hover:rotate-6" />
              
              <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ChevronRight size={32} className="text-white drop-shadow-lg" />
              </div>

              <div className="absolute -inset-2 border-4 border-transparent group-hover:border-blue-500 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100" />
            </div>

            {/* Child Name */}
            <div className="text-center space-y-1">
              <h3 className="text-xl md:text-2xl font-black text-zinc-800 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                {child.display_name || child.name || "Bé"}
              </h3>
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md mx-auto w-fit">
                Hồ sơ chi tiết
              </p>
            </div>
          </button>
        ))}

        {childrenList.length === 0 && (
           <div className="text-center py-20 bg-white dark:bg-zinc-900 p-10 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl">
              <Users size={48} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Chưa có trẻ nào được phân công.</p>
              <p className="text-zinc-400 text-xs mt-2">Vui lòng liên hệ Center Manager để gán hồ sơ.</p>
           </div>
        )}
      </div>

      <div className="mt-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
        <button className="px-10 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl text-zinc-600 dark:text-zinc-300 font-bold tracking-[0.2em] uppercase text-xs transition-all hover:scale-105 active:scale-95 shadow-sm">
          Quay lại Báo cáo tổng
        </button>
      </div>
    </div>
  );
}
