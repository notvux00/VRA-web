import React from "react";
import { redirect } from "next/navigation";
import { getLessons } from "@/actions/lessons";
import { getSchedules } from "@/actions/schedule";
import ScheduleClient from "../../expert/schedule/ScheduleClient";
import { Calendar } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

export default async function ParentSchedulePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.childId;

  if (!childId) {
    return (
      <div className="p-20 flex flex-col items-center justify-center h-full text-center space-y-4">
        <Calendar size={48} className="text-zinc-300 dark:text-zinc-700" />
        <h2 className="text-xl font-black text-zinc-400 uppercase tracking-widest">
          Vui lòng chọn hồ sơ trẻ
        </h2>
        <p className="text-zinc-500">Bạn cần chọn một hồ sơ trẻ cụ thể để xem thời khóa biểu.</p>
      </div>
    );
  }

  // Fetch data
  const [lessonsRes, schedulesRes] = await Promise.all([
    getLessons(),
    getSchedules(childId)
  ]);

  const lessons = lessonsRes.success ? lessonsRes.lessons || [] : [];
  const schedules = schedulesRes.success ? schedulesRes.schedules || [] : [];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Calendar className="text-blue-500" /> 
            Thời khóa biểu
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-1">Xem lịch trình học tập được sắp xếp bởi chuyên gia</p>
        </div>
      </div>

      <ScheduleClient 
        childId={childId}
        expertUid="" // Parent doesn't need this
        initialSchedules={schedules}
        lessons={lessons}
        suggestedLessonIds={[]} // Parent doesn't need AI suggestions
        readOnly={true}
      />
    </div>
  );
}
