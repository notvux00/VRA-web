import { getAssignedChildren } from "@/actions/expert";
import { getLessons } from "@/actions/lessons";
import React from "react";
import LessonsList from "./_components/LessonsList";

interface PageProps {
  searchParams: Promise<{ childId?: string; pin?: string; vr?: string }>;
}

interface Child {
  id: string;
  display_name?: string;
  name?: string;
  [key: string]: any;
}

export default async function ExpertLessonsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.childId;
  const pin = params.pin || "";
  const isVRConnected = params.vr === "connected";

  if (!childId) {
    return (
      <div className="p-20 text-center uppercase font-black text-zinc-400">
        Vui lòng chọn hồ sơ trẻ trước
      </div>
    );
  }

  const [{ children }, { success, lessons }] = await Promise.all([
    getAssignedChildren() as Promise<{ children: Child[] | undefined }>,
    getLessons(),
  ]);

  const child = children?.find((c) => c.id === childId);

  if (!success || !lessons) {
    return (
      <div className="p-20 text-center space-y-2">
        <p className="text-red-500 font-bold text-lg">Không thể tải danh sách bài học</p>
        <p className="text-zinc-400 text-sm">Vui lòng kiểm tra kết nối Firestore và thử lại.</p>
      </div>
    );
  }

  return (
    <LessonsList
      initialLessons={lessons as any}
      child={child}
      pin={pin}
      isVRConnected={isVRConnected}
    />
  );
}

