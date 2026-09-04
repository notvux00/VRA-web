import { getAssignedChildren } from "@/actions/expert";
import { getCachedAIRecommendations } from "@/actions/ai-recommendations";
import { adminDb } from "@/lib/firebase/admin";
import { Sparkles, Brain } from "lucide-react";
import React from "react";
import SuggestionsClient from "./_components/SuggestionsClient";

interface PageProps {
  searchParams: Promise<{ childId?: string; pin?: string }>;
}

interface Child {
  id: string;
  display_name?: string;
  name?: string;
  [key: string]: unknown;
}

export default async function ExpertSuggestionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.childId;
  const pin = params.pin || "";

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

  // Tự động bổ sung thumbnailUrl cho dữ liệu từ cache cũ (nếu thiếu)
  if (initial.success && initial.recommendations) {
    try {
      const lessonsSnap = await adminDb.collection("lessons").get();
      const lessonMap = new Map(
        lessonsSnap.docs.map((d) => [
          d.id, 
          { 
            thumbnailUrl: d.data().thumbnail_url ?? null,
            sceneName: d.data().scene_name ?? ""
          }
        ])
      );
      initial.recommendations = initial.recommendations.map((r) => ({
        ...r,
        thumbnailUrl: r.thumbnailUrl || lessonMap.get(r.lessonId)?.thumbnailUrl || null,
        sceneName: r.sceneName || lessonMap.get(r.lessonId)?.sceneName || "",
      }));
    } catch (e) {
      console.error("[ExpertSuggestionsPage] Lỗi phục hồi ảnh từ cache:", e);
    }
  }

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

      </div>

      {/* ── Main Content (Client) ── */}
      <SuggestionsClient
        childId={childId}
        childName={childName}
        initial={initial}
        pin={pin}
      />
    </div>
  );
}
