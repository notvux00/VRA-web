"use client";

import { useTransition } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { generateAIRecommendations } from "@/actions/ai-recommendations";
import type { GenerateAIRecommendationsResult } from "@/types";

interface Props {
  childId: string;
  hasCache: boolean;
  onResult: (result: GenerateAIRecommendationsResult) => void;
}

export default function GenerateButton({ childId, hasCache, onResult }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await generateAIRecommendations(childId);
      onResult(result);
    });
  }

  return (
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
          <span>AI đang phân tích...</span>
        </>
      ) : (
        <>
          <Sparkles size={18} className="group-hover:scale-110 transition-transform" />
          <span>{hasCache ? "Làm mới gợi ý AI" : "Tạo gợi ý AI"}</span>
        </>
      )}
    </button>
  );
}
