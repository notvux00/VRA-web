"use client";

import { useTransition, useState, useEffect } from "react";
import { Sparkles, RefreshCw, CheckCircle2, CircleDashed } from "lucide-react";
import { generateAIRecommendations } from "@/actions/ai-recommendations";
import type { GenerateAIRecommendationsResult } from "@/types";

interface Props {
  childId: string;
  hasCache: boolean;
  onResult: (result: GenerateAIRecommendationsResult) => void;
}

const LOADING_STEPS = [
  "Thu thập 3 phiên học gần nhất...",
  "Đọc kịch bản 20 bài học khả thi...",
  "AI đang phân tích & suy luận sư phạm...",
];

export default function GenerateButton({ childId, hasCache, onResult }: Props) {
  const [isPending, startTransition] = useTransition();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (isPending) {
      setStepIndex(0);
      const timer1 = setTimeout(() => setStepIndex(1), 800);
      const timer2 = setTimeout(() => setStepIndex(2), 1800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setStepIndex(0);
    }
  }, [isPending]);

  function handleClick() {
    startTransition(async () => {
      const result = await generateAIRecommendations(childId);
      onResult(result);
    });
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={handleClick}
        disabled={isPending}
        id="ai-generate-btn"
        className={`
          group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider
          transition-all duration-200 shadow-lg
          ${isPending
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none"
            : "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0"
          }
        `}
      >
        {isPending ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            <span>AI ĐANG PHÂN TÍCH...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} className="group-hover:scale-110 transition-transform" />
            <span>{hasCache ? "LÀM MỚI GỢI Ý AI" : "TẠO GỢI Ý AI"}</span>
          </>
        )}
      </button>

      {/* Progress Steps UI */}
      {isPending && (
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-4">
            {LOADING_STEPS.map((step, idx) => {
              const isCompleted = idx < stepIndex;
              const isActive = idx === stepIndex;
              const isWaiting = idx > stepIndex;

              return (
                <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${isWaiting ? "opacity-40" : "opacity-100"}`}>
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : isActive ? (
                    <RefreshCw size={18} className="text-amber-500 animate-spin" />
                  ) : (
                    <CircleDashed size={18} className="text-zinc-400" />
                  )}
                  <span className={`text-sm font-medium ${isCompleted ? "text-emerald-600 dark:text-emerald-400" : isActive ? "text-amber-600 dark:text-amber-500 font-bold" : "text-zinc-500"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
