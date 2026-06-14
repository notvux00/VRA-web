import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getLessons } from "@/actions/lessons";
import { getSchedules } from "@/actions/schedule";
import { getCachedAIRecommendations } from "@/actions/ai-recommendations";
import ScheduleClient from "./ScheduleClient";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

export default async function ScheduleServerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.childId;

  // 1. Kiểm tra childId
  if (!childId) {
    // Nếu không có childId, quay về trang dashboard chính để chọn bé
    redirect("/dashboard/expert");
  }

  // 2. Lấy expertUid từ cookie/auth
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  // Giả lập lấy expertUid từ cookie (thực tế dự án đang dùng action check auth nhưng đây là fallback)
  // Thực tế `getSchedules` yêu cầu expertUid nếu muốn bảo mật, nhưng schema hiện tại chỉ lọc theo childId
  const expertUid = "expert123"; // TODO: Nên lấy từ AuthContext hoặc getExpertProfile() nếu cần

  // 3. Fetch dữ liệu song song
  const [lessonsRes, schedulesRes, aiRes] = await Promise.all([
    getLessons(),
    getSchedules(childId),
    getCachedAIRecommendations(childId)
  ]);

  const lessons = lessonsRes.success ? lessonsRes.lessons || [] : [];
  const schedules = schedulesRes.success ? schedulesRes.schedules || [] : [];
  
  // Trích xuất danh sách ID bài học gợi ý từ AI
  let suggestedLessonIds: string[] = [];
  if (aiRes.success && aiRes.recommendations) {
    suggestedLessonIds = aiRes.recommendations.map(r => r.lessonId);
  }

  return (
    <ScheduleClient 
      childId={childId}
      expertUid={expertUid}
      initialSchedules={schedules}
      lessons={lessons}
      suggestedLessonIds={suggestedLessonIds}
    />
  );
}
