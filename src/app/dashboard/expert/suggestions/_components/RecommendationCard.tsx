"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { AILessonRecommendation, RecommendationPriority } from "@/types";
import { Target, Star, ChevronRight, X, BarChart2 } from "lucide-react";
import StartLessonButton from "../../lessons/_components/StartLessonButton";

interface Props {
  rec: AILessonRecommendation;
  index: number;
  childId: string;
  pin: string;
}

const PRIORITY_CONFIG: Record<
  RecommendationPriority,
  { label: string; color: string }
> = {
  high: {
    label: "Ưu tiên cao",
    color: "text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
  },
  medium: {
    label: "Ưu tiên vừa",
    color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
  },
  low: {
    label: "Ưu tiên thấp",
    color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
  },
};

export default function RecommendationCard({ rec, index, childId, pin }: Props) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const p = PRIORITY_CONFIG[rec.priority] ?? PRIORITY_CONFIG.low;
  
  const isTheory = rec.type === "theoretical" || rec.type === "theory";
  const typeLabel = isTheory ? "Lý thuyết" : "Thực hành";

  return (
    <div
      id={`rec-card-${index}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
    >
      {/* ── Thumbnail Area ── */}
      <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        {rec.thumbnailUrl ? (
          <Image 
            src={rec.thumbnailUrl} 
            alt={rec.lessonTitle} 
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            priority={index < 4}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-500 to-transparent" />
        )}
        
        {/* Badges on image (like LessonCard) */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-black/80 text-zinc-800 dark:text-zinc-200 backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm">
            {typeLabel}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${p.color} backdrop-blur-md`}>
            {p.label}
          </span>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {rec.lessonTitle}
        </h3>
        
        {/* Description (Reason) */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2 flex-1">
          {rec.reason}
        </p>

        {/* Meta info (like LessonCard) */}
        <div className="grid grid-cols-2 gap-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium col-span-2">
            <Target size={14} className="text-blue-500" />
            <span className="truncate">Mục tiêu: {rec.targetSkill}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium col-span-2">
            <Star size={14} className="text-amber-500" />
            <span>Gợi ý AI thứ #{index + 1} ({rec.levelName})</span>
          </div>
        </div>

        {/* AI Analysis Modal Trigger */}
        <div className="mb-4">
          <button 
            onClick={() => setShowAnalysis(true)}
            className="flex items-center justify-between w-full text-xs font-bold text-zinc-500 hover:text-blue-600 uppercase tracking-wider py-2 border-t border-zinc-100 dark:border-zinc-800"
          >
            <span>XEM PHÂN TÍCH CHI TIẾT CỦA AI</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <StartLessonButton
            lessonDocId={rec.lessonId}
            sceneName={rec.sceneName || ""}
            lessonName={`${rec.lessonTitle} - ${rec.levelName}`}
            pin={pin}
            childId={childId}
          />
        </div>
      </div>

      {/* ── AI Analysis Modal ── */}
      {showAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowAnalysis(false)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex gap-4 items-center">
                {rec.thumbnailUrl && (
                  <Image 
                    src={rec.thumbnailUrl} 
                    alt="thumbnail" 
                    width={64}
                    height={64}
                    className="rounded-xl object-cover" 
                  />
                )}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1 block">
                    Phân tích AI: Gợi ý #{index + 1}
                  </span>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white line-clamp-2">
                    {rec.lessonTitle}
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setShowAnalysis(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Basic Info Section */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-5">
                
                <div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Tổng quan / Lý do đề xuất</span>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                      <BarChart2 size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Độ khó</span>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{rec.difficultyLevel || "Chưa xác định"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                      <Star size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Loại bài học</span>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{rec.levelName} ({typeLabel})</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  Chi tiết phân tích từ AI
                </h3>
                
                <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30">
                  <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Lợi ích kỳ vọng
                  </h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {rec.expectedBenefit}
                  </p>
                </div>

                <div className="bg-rose-50 dark:bg-rose-500/5 rounded-2xl p-5 border border-rose-100 dark:border-rose-900/30">
                  <h4 className="text-xs font-black text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Lưu ý lâm sàng
                  </h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {rec.specialistNotes}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
              <button 
                onClick={() => setShowAnalysis(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
