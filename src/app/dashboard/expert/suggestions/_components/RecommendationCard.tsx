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
  
  const isTheory = rec.type === "theoretical" || rec.type === "theory";
  const typeLabel = isTheory ? "Lý thuyết" : "Thực hành";
  const typeColor = isTheory 
    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";

  return (
    <div
      id={`rec-card-${index}`}
      className="group bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-200 dark:hover:border-amber-800/50 transition-all duration-500 flex flex-col md:flex-row"
    >
      {/* ── Thumbnail ── */}
      <div className="h-44 md:w-64 md:min-h-[16rem] relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
        {rec.thumbnailUrl ? (
          <img
            src={rec.thumbnailUrl}
            alt={rec.lessonTitle}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-500 to-transparent" />
        )}
        
        {/* Dark overlay & type badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${typeColor}`}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="p-8 flex-1 flex flex-col gap-5 justify-between">
        {/* Header */}
        <div className="flex-1 min-w-0">
          <span className="inline-block mb-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">
            Gợi ý #{index + 1}
          </span>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase leading-tight group-hover:text-amber-500 transition-colors">
            {rec.lessonTitle}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold mt-1">
            {rec.levelName}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
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
