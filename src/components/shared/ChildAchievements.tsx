"use client";

import React from "react";
import { Award, Zap, Shield, Clock, Lock, Sparkles } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  value?: string | number;
}

interface ChildAchievementsProps {
  achievements: Achievement[];
}

const iconMap: Record<string, any> = {
  Award,
  Zap,
  Shield,
  Clock
};

export default function ChildAchievements({ achievements }: ChildAchievementsProps) {
  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <Sparkles className="text-amber-500" size={24} /> Thành tích đạt được
          </h3>
          <p className="text-xs text-zinc-400 font-medium mt-1">Ghi nhận tiến trình rèn luyện lâm sàng của trẻ</p>
        </div>
        
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-100 dark:border-amber-900/30">
           <Award className="text-amber-600" size={16} />
           <span className="text-xs font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">
             {earnedCount}/{achievements.length} Đã mở khóa
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {achievements.map((achievement) => {
          const IconComponent = iconMap[achievement.icon] || Award;
          
          return (
            <div 
              key={achievement.id}
              className={`group relative p-6 rounded-[2rem] border transition-all duration-500 ${
                achievement.earned 
                  ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:translate-y-[-4px]" 
                  : "bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed border-zinc-200 dark:border-zinc-800 opacity-50 grayscale"
              }`}
            >
              <div className={`p-4 rounded-2xl w-fit mb-6 transition-transform duration-500 group-hover:scale-110 ${
                achievement.earned 
                  ? `${achievement.color.replace('text-', 'bg-').replace('500', '500/10')} ${achievement.color} shadow-lg` 
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
              }`}>
                {achievement.earned ? (
                  <IconComponent size={28} />
                ) : (
                  <Lock size={28} className="opacity-40" />
                )}
              </div>

              <div className="space-y-2">
                 <h4 className={`font-black text-sm uppercase tracking-tight leading-tight ${
                   achievement.earned ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                 }`}>
                   {achievement.name}
                 </h4>
                 <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                   {achievement.description}
                 </p>
              </div>

              {achievement.earned && (
                <div className="absolute top-4 right-4 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
