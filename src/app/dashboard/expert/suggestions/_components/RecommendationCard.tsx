import type { AILessonRecommendation, RecommendationPriority } from "@/types";
import { Target, TrendingUp, Shield, BookOpen } from "lucide-react";

interface Props {
  rec: AILessonRecommendation;
  index: number;
}

const PRIORITY_CONFIG: Record<
  RecommendationPriority,
  { label: string; color: string; dot: string }
> = {
  high: {
    label: "Ưu tiên cao",
    color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
  },
  medium: {
    label: "Ưu tiên vừa",
    color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  low: {
    label: "Ưu tiên thấp",
    color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
};

export default function RecommendationCard({ rec, index }: Props) {
  const p = PRIORITY_CONFIG[rec.priority] ?? PRIORITY_CONFIG.low;
  const confidencePct = Math.round(rec.confidence * 100);

  return (
    <div
      id={`rec-card-${index}`}
      className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all duration-300 flex flex-col gap-6"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Rank badge */}
          <span className="inline-block mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">
            Gợi ý #{index + 1}
          </span>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            {rec.lessonTitle}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            {rec.levelName} &middot; {rec.type === "practical" ? "Thực hành" : "Lý thuyết"}
          </p>
        </div>

        {/* Confidence ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor"
                className="text-zinc-100 dark:text-zinc-800" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={`${confidencePct} 100`} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-zinc-900 dark:text-white">
              {confidencePct}%
            </span>
          </div>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Độ tin cậy</span>
        </div>
      </div>

      {/* Priority badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border ${p.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {p.label}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700">
          <Target size={11} />
          {rec.targetSkill}
        </span>
      </div>

      {/* Content rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-50 dark:border-zinc-800 pt-4">
        <InfoRow icon={<BookOpen size={14} />} label="Lý do đề xuất" value={rec.reason} />
        <InfoRow icon={<TrendingUp size={14} />} label="Lợi ích kỳ vọng" value={rec.expectedBenefit} />
        <InfoRow icon={<Shield size={14} />} label="Lưu ý chuyên gia" value={rec.specialistNotes} highlight />
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? "bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-900/30" : "bg-zinc-50 dark:bg-zinc-800/50"}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-zinc-400">{icon}</span>
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{value}</p>
    </div>
  );
}
