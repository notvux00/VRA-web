"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, RefreshCw, Sparkles, Brain, Info } from "lucide-react";
import { generateAIRecommendations } from "@/actions/ai-recommendations";
import type { AILessonRecommendation, GenerateAIRecommendationsResult } from "@/types";
import GenerateButton from "./GenerateButton";
import RecommendationCard from "./RecommendationCard";
import SkeletonCards from "./SkeletonCards";

interface Props {
  childId: string;
  childName: string;
  initial: GenerateAIRecommendationsResult;
}

export default function SuggestionsClient({ childId, childName, initial }: Props) {
  const [data, setData] = useState<GenerateAIRecommendationsResult>(initial);
  const [isPending, startTransition] = useTransition();

  const hasCache = !!data.recommendations;
  const recs: AILessonRecommendation[] = data.recommendations ?? [];

  function handleResult(result: GenerateAIRecommendationsResult) {
    setData({ ...result, hasNewSessionData: false });
  }

  return (
    <div className="space-y-10">
      {/* ── Demo Mode Banner ── */}
      {data.isDemo && (
        <div
          id="demo-mode-banner"
          className="flex items-start gap-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800 rounded-2xl px-6 py-4"
        >
          <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-wide">
              ⚙️ Chế độ Demo (Giả lập AI)
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-500 mt-0.5">
              Thêm{" "}
              <code className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded text-xs font-mono">
                GEMINI_API_KEY
              </code>{" "}
              vào{" "}
              <code className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded text-xs font-mono">
                .env.local
              </code>{" "}
              để kích hoạt AI thật từ Google Gemini 2.5 Flash.
            </p>
          </div>
        </div>
      )}

      {/* ── New Session Banner ── */}
      {data.hasNewSessionData && !isPending && (
        <div
          id="new-session-banner"
          className="flex items-center justify-between gap-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 rounded-2xl px-6 py-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Đã có dữ liệu buổi học mới của{" "}
              <span className="font-black">{childName}</span>. Gợi ý hiện tại có thể chưa phản ánh tiến trình mới nhất.
            </p>
          </div>
          <button
            onClick={() =>
              startTransition(async () => {
                const result = await generateAIRecommendations(childId);
                setData({ ...result, hasNewSessionData: false });
              })
            }
            disabled={isPending}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wide transition-colors"
          >
            <RefreshCw size={13} className={isPending ? "animate-spin" : ""} />
            Làm mới ngay
          </button>
        </div>
      )}

      {/* ── Error State ── */}
      {!data.success && data.error && (
        <div
          id="error-banner"
          className="flex items-start gap-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-2xl px-6 py-4"
        >
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-wide">Lỗi</p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">{data.error}</p>
          </div>
        </div>
      )}

      {/* ── Insufficient Data Notice ── */}
      {data.insufficientData && hasCache && (
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-5 py-3">
          <Info size={16} className="text-zinc-400 flex-shrink-0" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold">Lộ trình sơ khởi</span> — AI cần thêm dữ liệu buổi học thực tế để tối ưu hoá gợi ý.
          </p>
        </div>
      )}

      {/* ── AI Summary ── */}
      {data.summary && hasCache && !isPending && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-7">
          <div className="flex items-center gap-3 mb-3">
            <Brain size={18} className="text-amber-600" />
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">
              Nhận xét tổng quan của AI
            </span>
          </div>
          <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
            {data.summary}
          </p>
          {data.generatedAt && (
            <p className="text-xs text-zinc-400 mt-3">
              Được tạo lúc{" "}
              {new Date(data.generatedAt).toLocaleString("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              })}
              {data.source === "cache" && " · Từ bộ nhớ đệm"}
            </p>
          )}
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {isPending && <SkeletonCards />}

      {/* ── Recommendation Cards ── */}
      {!isPending && recs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {recs.map((rec, i) => (
            <RecommendationCard key={rec.lessonId + i} rec={rec} index={i} />
          ))}
        </div>
      )}

      {/* ── Empty State (no cache yet) ── */}
      {!isPending && !hasCache && data.success && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-14 flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 border border-amber-100 dark:border-amber-900/40">
            <Sparkles size={36} />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Chưa có gợi ý bài học
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Bấm nút bên dưới để AI phân tích hồ sơ và lịch sử buổi học của{" "}
              <span className="font-black text-zinc-700 dark:text-zinc-300">{childName}</span>,
              sau đó đề xuất lộ trình bài học phù hợp nhất.
            </p>
          </div>
          <GenerateButton childId={childId} hasCache={false} onResult={handleResult} />
        </div>
      )}

      {/* ── Refresh Button (when cache exists) ── */}
      {!isPending && hasCache && (
        <div className="flex justify-center">
          <GenerateButton childId={childId} hasCache={true} onResult={handleResult} />
        </div>
      )}
    </div>
  );
}
