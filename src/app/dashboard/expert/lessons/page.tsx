import { getAssignedChildren } from "@/actions/expert";
import { getLessons, LessonData } from "@/actions/lessons";
import { PlayCircle, Clock, BookOpen, Layers, GraduationCap, Beaker, MapPin } from "lucide-react";
import React from "react";
import StartLessonButton from "./_components/StartLessonButton";

interface PageProps {
  searchParams: Promise<{ childId?: string; pin?: string; vr?: string }>;
}

interface Child {
  id: string;
  display_name?: string;
  name?: string;
  [key: string]: any;
}

/** Nhóm các level lại theo lesson_id gốc để hiển thị dạng "1 bài → nhiều cấp độ" */
function groupByLesson(lessons: LessonData[]) {
  const map = new Map<string, { lessonId: string; lessonName: string; type: string; levels: LessonData[] }>();

  for (const l of lessons) {
    if (!map.has(l.lesson_id)) {
      map.set(l.lesson_id, {
        lessonId: l.lesson_id,
        lessonName: l.lesson_name,
        type: l.type,
        levels: [],
      });
    }
    map.get(l.lesson_id)!.levels.push(l);
  }

  return Array.from(map.values());
}

/** Ảnh đại diện dự phòng cho mỗi bài (vì thumbnail_url có thể rỗng) */
// (Đã xóa LESSON_THUMBNAILS mock giả)

const TYPE_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  practical: {
    label: "Thực hành",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    icon: <Beaker size={12} />,
  },
  theory: {
    label: "Lý thuyết",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    icon: <GraduationCap size={12} />,
  },
  quiz: {
    label: "Kiểm tra",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    icon: <GraduationCap size={12} />,
  },
};

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

  const grouped = groupByLesson(lessons);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 transform hover:scale-110 transition-transform cursor-pointer">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Kho bài học VR
            </h1>
            <p className="text-zinc-500 font-medium tracking-wide">
              Chọn bài học cho bé:{" "}
              <span className="text-blue-600 font-black uppercase">
                {child?.display_name || child?.name}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* VR Connection Badge */}
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
              isVRConnected
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600"
                : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isVRConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"
              }`}
            />
            {isVRConnected ? "VR Đã kết nối" : "VR Chưa kết nối"}
          </div>

          {/* Lesson Count */}
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-2 pl-5 rounded-2xl shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                Tổng bài học
              </p>
              <p className="text-lg font-black text-zinc-900 dark:text-white">{grouped.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
              <Layers size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Grid — Mỗi card = 1 bài gốc, bên trong liệt kê các level */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {grouped.map((group) => {
          const typeInfo = TYPE_LABELS[group.type] || TYPE_LABELS.practical;
          const thumbnail = group.levels[0]?.thumbnail_url || null;

          return (
            <div
              key={group.lessonId}
              className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Thumbnail */}
              <div className="h-44 relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex flex-col justify-center items-center">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={group.lessonName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-500 to-transparent" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${typeInfo.color}`}
                  >
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase leading-tight group-hover:text-blue-600 transition-colors">
                  {group.lessonName}
                </h3>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {group.levels[0]?.description || "Bài học VR tương tác cho trẻ tự kỷ."}
                </p>

                {/* Meta: Scene + Duration */}
                <div className="flex items-center gap-4 pt-2 border-t border-zinc-50 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-500 uppercase">
                      {group.levels[0]?.scene_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-500 uppercase">
                      {group.levels[0]?.duration_min} phút
                    </span>
                  </div>
                </div>

                {/* Level Selector — Liệt kê từng cấp bên dưới */}
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Chọn cấp độ ({group.levels.length})
                  </p>
                  {group.levels.map((level) => (
                    <div
                      key={level.id}
                      className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-700/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                          Cấp {level.level_index}: {level.level_name}
                        </span>
                      </div>

                      <StartLessonButton
                        lessonDocId={level.id}
                        sceneName={level.scene_name}
                        lessonName={`${level.lesson_name} - ${level.level_name}`}
                        pin={pin}
                        childId={childId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
