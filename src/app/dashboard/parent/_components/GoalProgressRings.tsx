"use client";

import React, { useEffect, useState } from "react";
import { Target, CheckCircle2, Flame, Clock, PlayCircle, Star, Calendar } from "lucide-react";
import { ChildGoal, Session } from "@/types";

interface GoalProgressRingsProps {
  goals: ChildGoal[];
  sessions: Session[];
}

export default function GoalProgressRings({ goals, sessions }: GoalProgressRingsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!goals || goals.length === 0) {
    return null;
  }

  // Lọc sessions trong tuần này (từ Thứ Hai)
  const getThisWeekSessions = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Điều chỉnh nếu Chủ Nhật
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    return sessions.filter(s => new Date(s.finish_time || s.start_time) >= startOfWeek);
  };

  const thisWeekSessions = getThisWeekSessions();

  const calculateCurrentValue = (goal: ChildGoal) => {
    switch (goal.type) {
      case "weekly_sessions":
        return thisWeekSessions.length;
      case "target_duration_minutes":
        return thisWeekSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60; // tính bằng phút (s.duration thường lưu giây, chia 60)
      case "target_focus_score":
        if (thisWeekSessions.length === 0) return 0;
        const totalFocus = thisWeekSessions.reduce((acc, s) => acc + (((s as unknown) as { score_attention?: number, score?: { attention?: number } }).score_attention || ((s as unknown) as { score?: { attention?: number } }).score?.attention || 0), 0);
        return Math.round((totalFocus / thisWeekSessions.length) * 10) / 10;
      case "streak_days":
        // Demo logic cho streak (thực tế cần tính toán ngày học liên tục)
        return thisWeekSessions.length > 0 ? 1 : 0; 
      case "custom":
        return goal.currentValue || 0;
      default:
        return 0;
    }
  };

  const getGoalColor = (type: string) => {
    switch (type) {
      case "weekly_sessions": return "text-blue-500";
      case "target_duration_minutes": return "text-amber-500";
      case "target_focus_score": return "text-emerald-500";
      case "streak_days": return "text-orange-500";
      case "custom": return "text-purple-500";
      default: return "text-zinc-500";
    }
  };

  const calculatePercentage = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <Flame className="text-orange-500" />
            Mục tiêu trong tuần
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const current = calculateCurrentValue(goal);
          const percentage = calculatePercentage(current, goal.targetValue);
          const strokeDashoffset = 283 - (283 * (mounted ? percentage : 0)) / 100; // 2 * pi * r (r=45) = 282.7
          const colorClass = getGoalColor(goal.type);

          return (
            <div key={goal.id} className="relative flex flex-col items-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              {/* Vòng tròn Progress */}
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                {/* Vòng nền */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="45"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-zinc-200 dark:text-zinc-700"
                  />
                  {/* Vòng màu (Progress) */}
                  <circle
                    cx="64"
                    cy="64"
                    r="45"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                    style={{
                      strokeDasharray: 283,
                      strokeDashoffset: strokeDashoffset,
                    }}
                  />
                </svg>
                {/* Phần trăm ở giữa */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${colorClass}`}>{percentage}%</span>
                </div>
              </div>

              {/* Thông tin */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center mb-2">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{goal.title}</h3>
                </div>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">
                    {Number.isInteger(current) ? current : current.toFixed(1)}
                  </span>
                  <span className="text-sm font-medium text-zinc-500 mb-0.5">/ {goal.targetValue} {goal.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
