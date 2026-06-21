"use client";

import React, { useState } from "react";
import { 
  PlayCircle, Clock, BookOpen, Layers, 
  Beaker, GraduationCap, MapPin, ChevronDown, 
  ChevronUp, Plus, Trash2, Save, RotateCcw, 
  CheckCircle2, Info, MessageSquare
} from "lucide-react";
import StartLessonButton from "./StartLessonButton";
import { updateChildQuickPhrases } from "@/actions/expert";

interface LessonData {
  id: string;
  lesson_id: string;
  scene_name: string;
  lesson_name: string;
  level_name: string;
  lesson_index: number;
  level_index: number;
  type: string;
  level_id: string;
  description: string;
  thumbnail_url: string;
  min_age: number;
  duration_min: number;
  default_phrases?: Record<string, string[]>;
}

interface LessonsListProps {
  initialLessons: LessonData[];
  child: any;
  pin: string;
  isVRConnected: boolean;
}

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

export default function LessonsList({ initialLessons, child, pin, isVRConnected }: LessonsListProps) {
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [phrasesState, setPhrasesState] = useState<Record<string, Record<string, string[]>>>(child?.quick_phrases || {});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "success" | "error">>({});

  // Group lessons
  const groupByLesson = (lessons: LessonData[]) => {
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
  };

  const grouped = groupByLesson(initialLessons);

  const toggleExpand = (lessonId: string) => {
    setExpandedLessonId(expandedLessonId === lessonId ? null : lessonId);
  };

  // Lấy câu thoại hiện tại của level, nếu chưa có thì fallback về mặc định
  const getLevelPhrases = (level: LessonData): Record<string, string[]> => {
    if (phrasesState[level.id]) {
      return phrasesState[level.id];
    }
    return level.default_phrases || {};
  };

  // Cập nhật câu thoại trong state cục bộ
  const updatePhraseText = (levelId: string, questKey: string, index: number, value: string) => {
    setPhrasesState(prev => {
      const levelPhrases = prev[levelId] ? { ...prev[levelId] } : { ...(initialLessons.find(l => l.id === levelId)?.default_phrases || {}) };
      if (!levelPhrases[questKey]) levelPhrases[questKey] = [];
      
      const newArray = [...levelPhrases[questKey]];
      newArray[index] = value;
      levelPhrases[questKey] = newArray;
      
      return { ...prev, [levelId]: levelPhrases };
    });
  };

  // Thêm một câu thoại mới vào một quest
  const addPhrase = (levelId: string, questKey: string) => {
    setPhrasesState(prev => {
      const levelPhrases = prev[levelId] ? { ...prev[levelId] } : { ...(initialLessons.find(l => l.id === levelId)?.default_phrases || {}) };
      if (!levelPhrases[questKey]) levelPhrases[questKey] = [];
      
      levelPhrases[questKey] = [...levelPhrases[questKey], ""];
      return { ...prev, [levelId]: levelPhrases };
    });
  };

  // Xóa một câu thoại
  const deletePhrase = (levelId: string, questKey: string, index: number) => {
    setPhrasesState(prev => {
      const levelPhrases = prev[levelId] ? { ...prev[levelId] } : { ...(initialLessons.find(l => l.id === levelId)?.default_phrases || {}) };
      if (!levelPhrases[questKey]) return prev;
      
      levelPhrases[questKey] = levelPhrases[questKey].filter((_, i) => i !== index);
      return { ...prev, [levelId]: levelPhrases };
    });
  };

  // Khôi phục bộ mẫu câu mặc định
  const resetToDefault = (levelId: string) => {
    const defaultPhrases = initialLessons.find(l => l.id === levelId)?.default_phrases || {};
    setPhrasesState(prev => ({
      ...prev,
      [levelId]: JSON.parse(JSON.stringify(defaultPhrases)) // Deep clone
    }));
  };

  // Lưu cấu hình xuống Firestore
  const handleSavePhrases = async (levelId: string) => {
    setSavingId(levelId);
    setSaveStatus(prev => ({ ...prev, [levelId]: "idle" }));
    try {
      const levelPhrases = phrasesState[levelId] || initialLessons.find(l => l.id === levelId)?.default_phrases || {};
      const updatedPhrases = { ...phrasesState, [levelId]: levelPhrases };
      
      const res = await updateChildQuickPhrases(child.id, updatedPhrases);
      if (res.success) {
        setPhrasesState(updatedPhrases);
        setSaveStatus(prev => ({ ...prev, [levelId]: "success" }));
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, [levelId]: "idle" }));
        }, 3000);
      } else {
        setSaveStatus(prev => ({ ...prev, [levelId]: "error" }));
      }
    } catch (e) {
      console.error(e);
      setSaveStatus(prev => ({ ...prev, [levelId]: "error" }));
    } finally {
      setSavingId(null);
    }
  };

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
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Đang tùy chỉnh giáo trình cho bé: <span className="font-extrabold text-blue-600 dark:text-blue-400 uppercase">{child?.name}</span>
            </p>
          </div>
        </div>

        {/* VR Connection Indicator */}
        <div className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center gap-3 shadow-sm shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${isVRConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" : "bg-zinc-300 dark:bg-zinc-700"}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {isVRConnected ? `VR CONNECTED (${pin})` : "VR CHƯA KẾT NỐI"}
          </span>
        </div>
      </div>

      {/* Grid Danh sách bài học */}
      <div className="grid grid-cols-1 gap-8">
        {grouped.map((group) => {
          const isExpanded = expandedLessonId === group.lessonId;
          const thumbnail = group.levels[0]?.thumbnail_url;
          const typeInfo = TYPE_LABELS[group.type] || TYPE_LABELS.practical;

          return (
            <div
              key={group.lessonId}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
            >
              {/* Header của Card: Click để Đóng/Mở */}
              <div 
                onClick={() => toggleExpand(group.lessonId)}
                className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors select-none"
              >
                <div className="flex gap-6 items-center flex-1">
                  {/* Thumbnail nhỏ ở Header */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-100 dark:border-zinc-800 relative">
                    {thumbnail ? (
                      <img src={thumbnail} alt={group.lessonName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-500/10 flex items-center justify-center text-blue-500"><BookOpen size={24} /></div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${typeInfo.color}`}>
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <MapPin size={12} />
                        <span className="text-[10px] font-bold uppercase">{group.levels[0]?.scene_name}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase leading-tight group-hover:text-blue-600 transition-colors">
                      {group.lessonName}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-xl font-medium">
                      {group.levels[0]?.description || "Bài học VR tương tác cho trẻ tự kỷ."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Nút Xem chi tiết */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(group.lessonId);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-xl text-xs font-bold transition-all text-zinc-700 dark:text-zinc-300"
                  >
                    <span>{isExpanded ? "Đóng tùy chỉnh" : "Tùy chỉnh câu thoại"}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Vùng mở rộng: Chứa level, quests, và chỉnh sửa câu thoại */}
              {isExpanded && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
                  
                  {/* Cảnh báo mô tả */}
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold uppercase tracking-wider mb-1">Hướng dẫn chỉnh sửa mẫu câu</p>
                      <p>Các câu thoại này sẽ được nạp trực tiếp vào hồ sơ của bé <strong>{child?.name}</strong>. Khi chạy buổi học VR, bảng điều khiển sẽ tự động lọc các câu thoại này theo từng nhiệm vụ (Quest) tương ứng để giáo viên click gửi nhanh.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {group.levels.map((level) => {
                      const levelPhrases = getLevelPhrases(level);
                      const questsList = Object.keys(levelPhrases);
                      const isSaving = savingId === level.id;
                      const status = saveStatus[level.id] || "idle";

                      return (
                        <div 
                          key={level.id}
                          className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-3xl p-6 space-y-6 shadow-sm"
                        >
                          {/* Tiêu đề cấp độ */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                              <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase">
                                Cấp {level.level_index}: {level.level_name}
                              </h4>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                Khởi động bài học trên kính VR bằng nút bên dưới hoặc cấu hình mẫu câu cho cấp độ này.
                              </p>
                            </div>
                            
                            {/* Start button bên trong card */}
                            <div className="w-full sm:w-auto shrink-0">
                              <StartLessonButton
                                lessonDocId={level.id}
                                sceneName={level.scene_name}
                                lessonName={`${level.lesson_name} - ${level.level_name}`}
                                pin={pin}
                                childId={child.id}
                              />
                            </div>
                          </div>

                          {/* Bộ chỉnh sửa mẫu câu thoại */}
                          <div className="space-y-6">
                            {questsList.map((questKey) => {
                              const list = levelPhrases[questKey] || [];
                              const isGeneral = questKey === "general";

                              return (
                                <div key={questKey} className="space-y-3 bg-zinc-50/50 dark:bg-zinc-850/20 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <MessageSquare size={14} className={isGeneral ? "text-purple-500" : "text-blue-500"} />
                                      <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                                        {isGeneral ? "Khích lệ chung" : `Nhiệm vụ: ${questKey}`}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                                      {list.length} câu
                                    </span>
                                  </div>

                                  {/* Inputs list */}
                                  <div className="space-y-2">
                                    {list.map((phrase, idx) => (
                                      <div key={idx} className="flex gap-2 items-center">
                                        <input
                                          type="text"
                                          value={phrase}
                                          onChange={(e) => updatePhraseText(level.id, questKey, idx, e.target.value)}
                                          placeholder="Nhập nội dung thoại bằng tiếng Việt..."
                                          className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                        <button
                                          onClick={() => deletePhrase(level.id, questKey, idx)}
                                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                          title="Xóa mẫu câu"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ))}

                                    {list.length === 0 && (
                                      <p className="text-xs text-zinc-400 italic py-1 font-medium pl-1">Chưa có câu thoại mẫu nào được thiết lập.</p>
                                    )}
                                  </div>

                                  {/* Add new button */}
                                  <button
                                    onClick={() => addPhrase(level.id, questKey)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-750 text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 rounded-xl transition-all active:scale-95"
                                  >
                                    <Plus size={10} />
                                    Thêm câu mẫu
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer của cấp độ: Lưu thay đổi */}
                          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                              onClick={() => resetToDefault(level.id)}
                              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                              title="Khôi phục câu mẫu mặc định của bài học"
                            >
                              <RotateCcw size={12} />
                              Khôi phục mặc định
                            </button>

                            <button
                              onClick={() => handleSavePhrases(level.id)}
                              disabled={isSaving || status === "success"}
                              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase text-white flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                status === "success" 
                                  ? "bg-emerald-600" 
                                  : "bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-wait"
                              }`}
                            >
                              {status === "success" ? (
                                <>
                                  <CheckCircle2 size={14} />
                                  Đã lưu thành công
                                </>
                              ) : (
                                <>
                                  <Save size={14} />
                                  Lưu mẫu câu cá nhân hóa
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
