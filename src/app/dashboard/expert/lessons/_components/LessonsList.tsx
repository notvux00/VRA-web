"use client";

import React, { useState } from "react";
import { 
  PlayCircle, Clock, BookOpen, Layers, 
  Beaker, GraduationCap, MapPin, Sliders, X,
  Plus, Trash2, Save, RotateCcw, CheckCircle2, Info, MessageSquare
} from "lucide-react";
import StartLessonButton from "./StartLessonButton";
import { updateChildQuickPhrases } from "@/actions/expert";

interface QuestMetadata {
  id: string;
  title: string;
  default_phrases: string[];
  description?: string;
}

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
  quests?: QuestMetadata[];
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
  const [customizeLevel, setCustomizeLevel] = useState<LessonData | null>(null);
  const [phrasesState, setPhrasesState] = useState<Record<string, any>>(child?.quick_phrases || {});
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

  // Lấy câu thoại hiện tại của level, nếu chưa có thì fallback về mặc định
  const getLevelPhrases = (level: LessonData): Record<string, string[]> => {
    if (phrasesState[level.id]) {
      return phrasesState[level.id];
    }
    const fallback: Record<string, string[]> = {};
    if (level.quests) {
      level.quests.forEach(q => {
        fallback[q.id] = q.default_phrases || [];
      });
    }
    return fallback;
  };

  // Cập nhật câu thoại trong state cục bộ
  const updatePhraseText = (levelId: string, questKey: string, index: number, value: string) => {
    setPhrasesState(prev => {
      const levelPhrases = prev[levelId] ? { ...prev[levelId] } : getLevelPhrases(initialLessons.find(l => l.id === levelId)!);
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
      const levelPhrases = prev[levelId] ? { ...prev[levelId] } : getLevelPhrases(initialLessons.find(l => l.id === levelId)!);
      if (!levelPhrases[questKey]) levelPhrases[questKey] = [];
      
      levelPhrases[questKey] = [...levelPhrases[questKey], ""];
      return { ...prev, [levelId]: levelPhrases };
    });
  };

  // Xóa một câu thoại
  const deletePhrase = (levelId: string, questKey: string, index: number) => {
    setPhrasesState(prev => {
      const levelPhrases = prev[levelId] ? { ...prev[levelId] } : getLevelPhrases(initialLessons.find(l => l.id === levelId)!);
      if (!levelPhrases[questKey]) return prev;
      
      levelPhrases[questKey] = levelPhrases[questKey].filter((_: string, i: number) => i !== index);
      return { ...prev, [levelId]: levelPhrases };
    });
  };

  // Khôi phục bộ mẫu câu mặc định
  const resetToDefault = (levelId: string) => {
    const level = initialLessons.find(l => l.id === levelId)!;
    const defaultPhrases: Record<string, string[]> = {};
    if (level.quests) {
      level.quests.forEach(q => {
        defaultPhrases[q.id] = q.default_phrases || [];
      });
    }
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
      const levelPhrases = phrasesState[levelId] || getLevelPhrases(initialLessons.find(l => l.id === levelId)!);
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

        <div className="flex items-center gap-4">
          {/* VR Connection Indicator */}
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
              isVRConnected
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600"
                : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isVRConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" : "bg-zinc-300"
              }`}
            />
            {isVRConnected ? `VR CONNECTED (${pin})` : "VR CHƯA KẾT NỐI"}
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

      {/* Grid Danh sách bài học - Square Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {grouped.map((group) => {
          const typeInfo = TYPE_LABELS[group.type] || TYPE_LABELS.practical;
          const thumbnail = group.levels[0]?.thumbnail_url || null;

          return (
            <div
              key={group.lessonId}
              className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between"
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
              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
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
                </div>

                {/* Level Selector — Liệt kê từng cấp bên dưới */}
                <div className="space-y-2 pt-4">
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
                        
                        {/* Nút Tùy chỉnh câu thoại */}
                        <button
                          onClick={() => setCustomizeLevel(level)}
                          className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          <Sliders size={12} />
                          Mẫu câu
                        </button>
                      </div>

                      <StartLessonButton
                        lessonDocId={level.id}
                        sceneName={level.scene_name}
                        lessonName={`${level.lesson_name} - ${level.level_name}`}
                        pin={pin}
                        childId={child.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup Cấu hình câu mẫu */}
      {customizeLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden transform transition-all scale-100 duration-350 ease-out">
            {/* Header Modal */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wide">
                  Tùy chỉnh mẫu câu nhanh
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Bài học: <span className="font-extrabold uppercase text-blue-600 dark:text-blue-400">{customizeLevel.lesson_name}</span> — Cấp {customizeLevel.level_index}: {customizeLevel.level_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setCustomizeLevel(null);
                  setSaveStatus({});
                }}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title="Đóng cửa sổ"
              >
                <X size={20} className="text-zinc-500 dark:text-zinc-400" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Cảnh báo hướng dẫn */}
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <Info size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider mb-1">Hướng dẫn chỉnh sửa mẫu câu</p>
                  <p>Các câu thoại này sẽ được nạp riêng cho bé <strong>{child?.name}</strong>. Khi chạy bài học VR, bảng điều khiển sẽ tự động lọc các câu thoại này theo từng nhiệm vụ (Quest) tương ứng để giáo viên click gửi nhanh.</p>
                </div>
              </div>

              {/* Danh sách nhiệm vụ (Quests) */}
              <div className="space-y-6">
                {(() => {
                  const levelPhrases = getLevelPhrases(customizeLevel);
                  const quests = customizeLevel.quests || [];
                  
                  return quests.map((q) => {
                    const questKey = q.id;
                    const list = levelPhrases[questKey] || [];

                    return (
                      <div 
                        key={questKey} 
                        className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800/80"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} className="text-blue-500" />
                            <div className="flex flex-col text-left">
                              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                                {q.title}
                              </span>
                              {q.description && (
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">
                                  {q.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">
                            {list.length} câu
                          </span>
                        </div>

                        {/* Inputs List */}
                        <div className="space-y-2">
                          {list.map((phrase: string, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={phrase}
                                onChange={(e) => updatePhraseText(customizeLevel.id, questKey, idx, e.target.value)}
                                placeholder="Nhập nội dung thoại bằng tiếng Việt..."
                                className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                              />
                              <button
                                onClick={() => deletePhrase(customizeLevel.id, questKey, idx)}
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

                        {/* Add new phrase button */}
                        <button
                          onClick={() => addPhrase(customizeLevel.id, questKey)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-750 text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 rounded-xl transition-all active:scale-95"
                        >
                          <Plus size={10} />
                          Thêm câu mẫu
                        </button>
                      </div>
                    );
                  });
                })()}

                {/* General Phrases inside Child Profile */}
                {(() => {
                  const list = phrasesState.general || child?.quick_phrases?.general || ["Con làm tốt lắm!", "Tuyệt vời!", "Cố lên con!"];
                  
                  const updateGeneralPhraseText = (index: number, value: string) => {
                    setPhrasesState(prev => {
                      const newGeneral = [...(prev.general || list)];
                      newGeneral[index] = value;
                      return { ...prev, general: newGeneral };
                    });
                  };

                  const addGeneralPhrase = () => {
                    setPhrasesState(prev => {
                      const newGeneral = [...(prev.general || list), ""];
                      return { ...prev, general: newGeneral };
                    });
                  };

                  const deleteGeneralPhrase = (index: number) => {
                    setPhrasesState(prev => {
                      const newGeneral = (prev.general || list).filter((_: string, i: number) => i !== index);
                      return { ...prev, general: newGeneral };
                    });
                  };

                  return (
                    <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={14} className="text-purple-500" />
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                              Khích lệ chung (Tất cả bài học)
                            </span>
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">
                              Sử dụng chung cho tất cả các bài học
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">
                          {list.length} câu
                        </span>
                      </div>

                      {/* Inputs List */}
                      <div className="space-y-2">
                        {list.map((phrase: string, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={phrase}
                              onChange={(e) => updateGeneralPhraseText(idx, e.target.value)}
                              placeholder="Nhập nội dung thoại bằng tiếng Việt..."
                              className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button
                              onClick={() => deleteGeneralPhrase(idx)}
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

                      {/* Add new phrase button */}
                      <button
                        onClick={addGeneralPhrase}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-750 text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 rounded-xl transition-all active:scale-95"
                      >
                        <Plus size={10} />
                        Thêm câu mẫu
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
              <button
                onClick={() => resetToDefault(customizeLevel.id)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-500 text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                title="Khôi phục câu mẫu mặc định của bài học"
              >
                <RotateCcw size={12} />
                Khôi phục mặc định
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCustomizeLevel(null);
                    setSaveStatus({});
                  }}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 rounded-xl transition-all active:scale-95"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleSavePhrases(customizeLevel.id)}
                  disabled={savingId === customizeLevel.id || saveStatus[customizeLevel.id] === "success"}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase text-white flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    saveStatus[customizeLevel.id] === "success" 
                      ? "bg-emerald-600" 
                      : "bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-wait"
                  }`}
                >
                  {saveStatus[customizeLevel.id] === "success" ? (
                    <>
                      <CheckCircle2 size={14} />
                      Đã lưu thành công
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
