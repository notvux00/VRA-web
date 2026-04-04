"use client";

import React from "react";
import { Award, Zap, Shield, Clock, Lock } from "lucide-react";

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
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
          <Award className="text-amber-500" /> Thành tích đạt được
        </h3>
        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
          {achievements.filter(a => a.earned).length}/{achievements.length} Đã mở khóa
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => {
          const IconComponent = iconMap[achievement.icon] || Award;
          
          return (
            <div 
              key={achievement.id}
              className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                achievement.earned 
                  ? "bg-zinc-50 dark:bg-zinc-800/20 border-zinc-100 dark:border-zinc-800" 
                  : "bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed border-zinc-200 dark:border-zinc-800 opacity-60"
              }`}
            >
              {!achievement.earned && (
                <div className="absolute top-3 right-3 text-zinc-300 dark:text-zinc-700">
                  <Lock size={14} />
                </div>
              )}
              
              <div className={`p-3 rounded-xl w-fit mb-4 ${
                achievement.earned 
                  ? `${achievement.color.replace('text-', 'bg-').replace('500', '500/10')} ${achievement.color}` 
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
              }`}>
                <IconComponent size={24} />
              </div>

              <h4 className={`font-black text-sm uppercase tracking-tight mb-1 ${
                achievement.earned ? "text-zinc-900 dark:text-white" : "text-zinc-400"
              }`}>
                {achievement.name}
              </h4>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {achievement.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
