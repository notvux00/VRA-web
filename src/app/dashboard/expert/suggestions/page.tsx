import { getAssignedChildren } from "@/actions/expert";
import { getCachedAIRecommendations } from "@/actions/ai-recommendations";
import { Sparkles, Brain } from "lucide-react";
import React from "react";
import SuggestionsClient from "./_components/SuggestionsClient";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

interface Child {
  id: string;
  display_name?: string;
  name?: string;
  [key: string]: any;
}

export default async function ExpertSuggestionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.childId;

  // ── Chưa chọn trẻ ──
  if (!childId) {
    return (
      <div className="p-20 text-center">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-400 mx-auto mb-4">
          <Sparkles size={36} />
        </div>
        <p className="font-black uppercase text-zinc-400 tracking-widest text-sm">
          Vui lòng chọn hồ sơ trẻ trước
        </p>
      </div>
    );
  }

  // ── Lấy thông tin trẻ ──
  const { children } = (await getAssignedChildren()) as {
    children: Child[] | undefined;
  };
  const child = children?.find((c) => c.id === childId);
  const childName = child?.display_name || child?.name || "Trẻ";

  // ── Đọc cache từ Firestore (không gọi Gemini) ──
  const initial = await getCachedAIRecommendations(childId);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-700">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-amber-500/25">
            <Sparkles size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Bài học gợi ý AI
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Lộ trình cá nhân hóa cho:{" "}
              <span className="text-amber-600 dark:text-amber-400 font-black uppercase">
                {childName}
              </span>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-5 py-3 rounded-2xl border border-amber-100 dark:border-amber-900/40">
          <Brain size={18} className="text-amber-600" />
          <span className="text-xs font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">
            Gemini 2.5 Flash
          </span>
        </div>
      </div>

      {/* ── Main Content (Client) ── */}
      <SuggestionsClient
        childId={childId}
        childName={childName}
        initial={initial}
      />
    </div>
  );
}
