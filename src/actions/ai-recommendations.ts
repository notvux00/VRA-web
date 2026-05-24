"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import type {
  AILessonRecommendation,
  AIRecommendationCache,
  GenerateAIRecommendationsResult,
  RecommendationPriority,
} from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSION_COOKIE_NAME = "session";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const MAX_SESSIONS = 3;

// ─── Auth helper ─────────────────────────────────────────────────────────────
async function getAuthSession() {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    return await adminAuth.verifySessionCookie(cookie);
  } catch {
    return null;
  }
}

// ─── Public Action: đọc cache ─────────────────────────────────────────────────
/**
 * Đọc dữ liệu gợi ý đã lưu trong Firestore (nếu có).
 * Không gọi Gemini. Trả về hasNewSessionData=true nếu có session mới hơn cache.
 */
export async function getCachedAIRecommendations(
  childId: string
): Promise<GenerateAIRecommendationsResult> {
  const auth = await getAuthSession();
  if (!auth) return { success: false, error: "Unauthorized" };

  try {
    // Kiểm tra quyền truy cập
    const childDoc = await adminDb.collection("child_profiles").doc(childId).get();
    if (!childDoc.exists) return { success: false, error: "Không tìm thấy hồ sơ trẻ" };

    const childData = childDoc.data()!;
    if (childData.expertUid !== auth.uid && auth.role !== "admin") {
      return { success: false, error: "Bạn không có quyền truy cập hồ sơ này" };
    }

    // Lấy 3 session mới nhất để so khớp cache
    const latestSessionIds = await getLatestSessionIds(childId);

    // Đọc cache
    const cacheDoc = await adminDb.collection("ai_recommendations").doc(childId).get();
    if (!cacheDoc.exists) {
      return {
        success: true,
        source: "cache",
        childId,
        hasNewSessionData: false,
        recommendations: undefined,
      };
    }

    const cache = cacheDoc.data() as AIRecommendationCache;
    const hasNewSessionData =
      JSON.stringify(latestSessionIds) !== JSON.stringify(cache.basedOnSessionIds);

    return {
      success: true,
      source: "cache",
      childId,
      generatedAt: cache.generatedAt,
      basedOnSessionIds: cache.basedOnSessionIds,
      hasNewSessionData,
      summary: cache.summary,
      recommendations: cache.recommendations,
      insufficientData: cache.insufficientData,
      isDemo: cache.isDemo,
    };
  } catch (err: any) {
    console.error("[getCachedAIRecommendations] error:", err);
    return { success: false, error: err.message };
  }
}

// ─── Public Action: tạo/làm mới gợi ý ────────────────────────────────────────
/**
 * Tạo mới hoặc làm mới gợi ý bài học bằng Gemini (hoặc Demo Mode).
 * Kết quả được lưu vào ai_recommendations/{childId}.
 */
export async function generateAIRecommendations(
  childId: string
): Promise<GenerateAIRecommendationsResult> {
  const auth = await getAuthSession();
  if (!auth) return { success: false, error: "Unauthorized" };

  try {
    // 1. Kiểm tra quyền
    const childDoc = await adminDb.collection("child_profiles").doc(childId).get();
    if (!childDoc.exists) return { success: false, error: "Không tìm thấy hồ sơ trẻ" };

    const childData = childDoc.data()!;
    if (childData.expertUid !== auth.uid && auth.role !== "admin") {
      return { success: false, error: "Bạn không có quyền truy cập hồ sơ này" };
    }

    // Lấy 3 session mới nhất — sắp xếp trong memory tránh yêu cầu Composite Index
    const sessionsSnap = await adminDb
      .collection("sessions")
      .where("child_profile_id", "==", childId)
      .get();

    const sessions = sessionsSnap.docs
      .map((d) => {
        const s = d.data();
        return {
          id: d.id,
          lesson_id: s.lesson_id ?? "",
          lesson_name: s.lesson_name ?? "",
          level_name: s.level_name ?? "",
          type: s.type ?? "",
          score: s.score ?? 0,
          completion_status: s.completion_status ?? "",
          duration: s.duration ?? 0,
          quest_logs: s.quest_logs ?? [],
          auto_alerts: s.auto_alerts ?? [],
          behavior_logs: s.behavior_logs ?? [],
          evaluation: s.evaluation ?? "",
          notes: s.notes ?? "",
          start_time: s.start_time ?? "",
          finish_time: s.finish_time ?? "",
        };
      })
      .sort((a, b) => {
        // Mới nhất lên đầu
        const ta = a.finish_time ? new Date(a.finish_time).getTime() : 0;
        const tb = b.finish_time ? new Date(b.finish_time).getTime() : 0;
        return tb - ta;
      })
      .slice(0, MAX_SESSIONS);

    const basedOnSessionIds = sessions.map((s) => s.id);
    const insufficientData = sessions.length < MAX_SESSIONS;

    // 3. Lấy danh mục bài học và lọc theo độ tuổi
    const lessonsSnap = await adminDb.collection("lessons").get();
    const childAge: number = childData.age ?? 0;
    const allLessons = lessonsSnap.docs.map((d) => {
      const l = d.data();
      return {
        id: d.id,
        lesson_id: l.lesson_id ?? d.id,
        lesson_name: l.lesson_name ?? "",
        level_name: l.level_name ?? "",
        type: l.type ?? "",
        description: l.description ?? "",
        min_age: l.min_age ?? 0,
        duration_min: l.duration_min ?? 0,
      };
    });
    // Lọc bài học phù hợp tuổi để giảm kích thước payload
    const eligibleLessons = allLessons.filter((l) => l.min_age <= childAge);
    const lessonIds = new Set(eligibleLessons.map((l) => l.id));

    // 4. Ẩn danh hóa hồ sơ trẻ — chỉ giữ các trường lâm sàng
    const anonymizedChild = {
      age: childData.age,
      gender: childData.gender,
      condition: childData.condition,
      sound_sensitivity: childData.sound_sensitivity,
      attention_span_min: childData.attention_span_min,
      anxiety_triggers: childData.anxiety_triggers,
      diagnosis_notes: childData.diagnosis_notes,
      sessionCount: childData.sessionCount,
    };

    // 5. Nếu thiếu API key → Demo Mode
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const demoResult = buildDemoRecommendations(
        childId,
        auth.uid,
        eligibleLessons,
        sessions,
        basedOnSessionIds,
        insufficientData
      );
      await saveCache(demoResult);
      return { ...toResult(demoResult), source: "demo" };
    }

    // 6. Gọi Gemini 2.5 Flash
    const geminiResult = await callGemini(
      apiKey,
      anonymizedChild,
      sessions,
      eligibleLessons,
      childId,
      auth.uid,
      basedOnSessionIds,
      insufficientData
    );

    // 7. Validate: lessonId phải tồn tại trong Firestore lessons
    const validRecs = (geminiResult.recommendations ?? []).filter((r) => {
      if (!lessonIds.has(r.lessonId)) {
        console.warn(`[AI] Loại bỏ bài không tồn tại: ${r.lessonId}`);
        return false;
      }
      if (r.confidence < 0 || r.confidence > 1) return false;
      if (!["high", "medium", "low"].includes(r.priority)) return false;
      return true;
    });

    if (validRecs.length === 0) {
      return {
        success: false,
        error: "AI không trả về bài học hợp lệ nào. Vui lòng thử lại.",
      };
    }

    const finalCache: AIRecommendationCache = {
      ...geminiResult,
      recommendations: validRecs,
    };

    await saveCache(finalCache);
    return { ...toResult(finalCache), source: "gemini" };
  } catch (err: any) {
    console.error("[generateAIRecommendations] error:", err);
    return { success: false, error: err.message ?? "Đã có lỗi xảy ra" };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getLatestSessionIds(childId: string): Promise<string[]> {
  // Không dùng orderBy để tránh yêu cầu Composite Index trên Firestore
  const snap = await adminDb
    .collection("sessions")
    .where("child_profile_id", "==", childId)
    .get();

  return snap.docs
    .map((d) => ({
      id: d.id,
      finish_time: d.data().finish_time ?? "",
    }))
    .sort((a, b) => {
      const ta = a.finish_time ? new Date(a.finish_time).getTime() : 0;
      const tb = b.finish_time ? new Date(b.finish_time).getTime() : 0;
      return tb - ta;
    })
    .slice(0, MAX_SESSIONS)
    .map((s) => s.id);
}

async function saveCache(cache: AIRecommendationCache) {
  await adminDb
    .collection("ai_recommendations")
    .doc(cache.childId)
    .set(cache, { merge: false });
}

function toResult(cache: AIRecommendationCache): GenerateAIRecommendationsResult {
  return {
    success: true,
    childId: cache.childId,
    generatedAt: cache.generatedAt,
    basedOnSessionIds: cache.basedOnSessionIds,
    hasNewSessionData: false,
    summary: cache.summary,
    recommendations: cache.recommendations,
    insufficientData: cache.insufficientData,
    isDemo: cache.isDemo,
  };
}

// ─── Gemini Caller ────────────────────────────────────────────────────────────
async function callGemini(
  apiKey: string,
  child: Record<string, any>,
  sessions: Record<string, any>[],
  lessons: Record<string, any>[],
  childId: string,
  expertUid: string,
  basedOnSessionIds: string[],
  insufficientData: boolean
): Promise<AIRecommendationCache> {
  // Dynamic import để Next.js Server Action không bundle phía client
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const systemInstruction = `Bạn là một trợ lý AI hỗ trợ chuyên gia trị liệu giáo dục đặc biệt cho trẻ tự kỷ (ASD).

Quy tắc bắt buộc:
- Tuyệt đối KHÔNG đưa ra chẩn đoán y khoa.
- Tuyệt đối KHÔNG thay thế vai trò của chuyên gia lâm sàng.
- Chỉ sử dụng dữ liệu được cung cấp trong prompt.
- Chỉ được gợi ý bài học CÓ TRONG danh sách lessonCatalog. Tuyệt đối không tự tạo bài học mới.
- Mọi lý do phân tích phải dựa trên bằng chứng từ dữ liệu hồ sơ và lịch sử phiên học.
- Nếu dữ liệu không đủ để phân tích, vẫn đề xuất nhưng đặt insufficientData = true.
- Trả về JSON hợp lệ, không có ký tự markdown, không có văn bản ngoài khối JSON.
- Tất cả trường văn bản tự do (summary, targetSkill, reason, expectedBenefit, specialistNotes) PHẢI viết bằng tiếng Việt có dấu, văn phong lâm sàng ôn hòa, dễ hiểu với trị liệu viên Việt Nam.`;

  const userPrompt = `Phân tích hồ sơ trẻ và lịch sử buổi học, sau đó gợi ý 3-5 bài học phù hợp nhất từ danh sách bài học được cung cấp.

=== HỒ SƠ TRẺ (ẩn danh) ===
${JSON.stringify(child, null, 2)}

=== LỊCH SỬ ${sessions.length} BUỔI HỌC GẦN NHẤT ===
${JSON.stringify(sessions, null, 2)}

=== DANH MỤC BÀI HỌC CÓ SẴN (chỉ chọn trong danh sách này) ===
${JSON.stringify(lessons, null, 2)}

=== YÊU CẦU OUTPUT ===
Trả về JSON theo schema sau, KHÔNG kèm markdown:
{
  "insufficientData": false,
  "summary": "Tóm tắt xu hướng từ các buổi học gần nhất (1-2 câu, tiếng Việt có dấu)",
  "recommendations": [
    {
      "lessonId": "<id chính xác từ danh sách lessons>",
      "lessonTitle": "<tên bài học>",
      "levelName": "<cấp độ>",
      "type": "<practical | theoretical>",
      "targetSkill": "<kỹ năng mục tiêu, tiếng Việt có dấu>",
      "priority": "<high | medium | low>",
      "confidence": <số 0-1>,
      "reason": "<lý do đề xuất dựa trên dữ liệu, tiếng Việt có dấu>",
      "expectedBenefit": "<lợi ích kỳ vọng, tiếng Việt có dấu>",
      "specialistNotes": "<lưu ý lâm sàng cho chuyên gia, tiếng Việt có dấu>"
    }
  ]
}`;

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { responseMimeType: "application/json" },
  });

  const raw = result.response.text().trim();
  const parsed = JSON.parse(raw) as {
    insufficientData: boolean;
    summary: string;
    recommendations: AILessonRecommendation[];
  };

  return {
    childId,
    model: GEMINI_MODEL,
    generatedAt: new Date().toISOString(),
    generatedBy: expertUid,
    basedOnSessionIds,
    status: "draft",
    insufficientData: parsed.insufficientData ?? insufficientData,
    summary: parsed.summary ?? "",
    recommendations: parsed.recommendations ?? [],
    isDemo: false,
  };
}

// ─── Demo Mode fallback (không cần API key) ───────────────────────────────────
function buildDemoRecommendations(
  childId: string,
  expertUid: string,
  lessons: Record<string, any>[],
  sessions: Record<string, any>[],
  basedOnSessionIds: string[],
  insufficientData: boolean
): AIRecommendationCache {
  // Lấy các bài học trẻ chưa học gần đây để ưu tiên gợi ý
  const recentLessonIds = new Set(sessions.map((s) => s.lesson_id));
  const unplayed = lessons.filter((l) => !recentLessonIds.has(l.lesson_id));
  const played = lessons.filter((l) => recentLessonIds.has(l.lesson_id));
  const pool = [...unplayed, ...played].slice(0, 5);

  const priorities: RecommendationPriority[] = ["high", "medium", "low"];

  const recommendations: AILessonRecommendation[] = pool.map((l, i) => ({
    lessonId: l.id,
    lessonTitle: l.lesson_name,
    levelName: l.level_name,
    type: l.type,
    targetSkill: l.type === "practical" ? "Kỹ năng thực hành và hoàn thành nhiệm vụ" : "Kỹ năng nhận thức và giao tiếp xã hội",
    priority: priorities[Math.min(i, 2)],
    confidence: parseFloat((0.85 - i * 0.08).toFixed(2)),
    reason: sessions.length > 0
      ? `Dựa trên ${sessions.length} buổi học gần nhất, đây là bài học phù hợp để tiếp tục luyện tập. (⚙️ Chế độ Demo)`
      : `Trẻ chưa có lịch sử học. Đây là bài học phù hợp với hồ sơ ban đầu. (⚙️ Chế độ Demo)`,
    expectedBenefit: "Giúp trẻ xây dựng nền tảng kỹ năng theo lộ trình tăng dần.",
    specialistNotes: "Đây là gợi ý từ chế độ Demo. Hãy cấu hình GEMINI_API_KEY để nhận gợi ý lâm sàng chính xác từ AI.",
  }));

  return {
    childId,
    model: "demo-mode",
    generatedAt: new Date().toISOString(),
    generatedBy: expertUid,
    basedOnSessionIds,
    status: "draft",
    insufficientData,
    summary: `⚙️ Hệ thống đang chạy ở chế độ Demo. Phân tích ${sessions.length} buổi học gần nhất và danh mục ${lessons.length} bài học có sẵn để tạo gợi ý mẫu.`,
    recommendations,
    isDemo: true,
  };
}
