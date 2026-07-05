"use client";

import React, { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Clock, X, Trash2, Info, Sparkles } from "lucide-react";
import { Schedule, createSchedule, updateSchedule, deleteSchedule } from "@/actions/schedule";
import { LessonData } from "@/actions/lessons";

// Helper: Get Monday of the current week based on a given date
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper: Add days to a date
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper: Format date to dd/MM
const formatDate = (date: Date) => {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
};

// Helper: Format month and year
const formatMonthYear = (date: Date) => {
  const months = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  return `${months[date.getMonth()]} năm ${date.getFullYear()}`;
};

const DAYS_OF_WEEK = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const START_HOUR = 7;
const END_HOUR = 18;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

// Color options
const COLOR_OPTIONS = [
  { id: "blue", style: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800", hex: "bg-blue-500", ring: "ring-blue-500" },
  { id: "emerald", style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", hex: "bg-emerald-500", ring: "ring-emerald-500" },
  { id: "amber", style: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800", hex: "bg-amber-500", ring: "ring-amber-500" },
  { id: "purple", style: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800", hex: "bg-purple-500", ring: "ring-purple-500" },
];

interface ScheduleClientProps {
  expertUid: string;
  childId: string;
  initialSchedules: Schedule[];
  lessons: LessonData[];
  suggestedLessonIds: string[];
  readOnly?: boolean;
}

export default function ScheduleClient({ expertUid, childId, initialSchedules, lessons, suggestedLessonIds, readOnly = false }: ScheduleClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPending, startTransition] = useTransition();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  // Form States
  const [formLessonSource, setFormLessonSource] = useState<"suggested" | "all">("suggested");
  const [formLessonId, setFormLessonId] = useState<string>("");
  const [formDayOfWeek, setFormDayOfWeek] = useState<string>("0");
  const [formDuration, setFormDuration] = useState<string>("30");
  const [formStartTime, setFormStartTime] = useState<string>("08:00");
  const [formColorStyle, setFormColorStyle] = useState<string>(COLOR_OPTIONS[0].style);

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const handleToday = () => setCurrentDate(new Date());

  // Function to calculate top and height for schedule block
  const getBlockStyle = (startHour: number, startMinute: number, durationMinutes: number) => {
    const HOUR_HEIGHT = 160; 
    const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
    
    const topOffset = ((startHour - START_HOUR) * HOUR_HEIGHT) + (startMinute * MINUTE_HEIGHT);
    const height = durationMinutes * MINUTE_HEIGHT;
    
    return {
      top: `${topOffset}px`,
      height: `${height}px`,
    };
  };

  const openCreateModal = () => {
    setSelectedScheduleId(null);
    setFormLessonSource("suggested");
    setFormLessonId("");
    setFormDayOfWeek("0");
    setFormDuration("30");
    setFormStartTime("08:00");
    setFormColorStyle(COLOR_OPTIONS[0].style);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (schedule: Schedule) => {
    setSelectedScheduleId(schedule.id || null);
    setFormLessonSource("all");
    setFormLessonId(schedule.lessonId);
    setFormDayOfWeek(schedule.dayOfWeek.toString());
    setFormDuration(schedule.durationMinutes.toString());
    setFormStartTime(`${schedule.startHour.toString().padStart(2, '0')}:${schedule.startMinute.toString().padStart(2, '0')}`);
    setFormColorStyle(schedule.color);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!formLessonId) return;

    const [startHourStr, startMinuteStr] = formStartTime.split(":");
    const scheduleData = {
      childId,
      expertUid,
      lessonId: formLessonId,
      dayOfWeek: parseInt(formDayOfWeek),
      startHour: parseInt(startHourStr),
      startMinute: parseInt(startMinuteStr),
      durationMinutes: parseInt(formDuration),
      color: formColorStyle,
    };

    startTransition(async () => {
      if (isEditMode && selectedScheduleId) {
        await updateSchedule(selectedScheduleId, scheduleData);
      } else {
        await createSchedule(scheduleData);
      }
      closeModals();
    });
  };

  const handleDelete = () => {
    if (selectedScheduleId) {
      startTransition(async () => {
        await deleteSchedule(selectedScheduleId);
        closeModals();
      });
    }
  };

  const selectedLessonDetails = lessons.find(l => l.id === formLessonId);
  const filteredLessons = lessons.filter(lesson => formLessonSource === "all" || suggestedLessonIds.includes(lesson.id));

  // Thêm loading UI tạm cho form submit
  const isSubmitting = isPending;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            Thời khóa biểu cá nhân
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Theo dõi và quản lý lịch học
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-1">
            <button 
              onClick={handlePrevWeek}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-600 dark:text-zinc-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleToday}
              className="px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-900 dark:text-zinc-100"
            >
              Hôm nay
            </button>
            <button 
              onClick={handleNextWeek}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-600 dark:text-zinc-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {!readOnly && (
            <button 
              onClick={openCreateModal}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold flex items-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>Thêm phiên học</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar Area */}
      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col relative z-0">
        {/* Month/Year Banner */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 p-4 text-center shrink-0">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {formatMonthYear(startOfWeek)}
          </h2>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] lg:grid-cols-[80px_repeat(7,1fr)] border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="p-3 flex items-center justify-center border-r border-zinc-200 dark:border-zinc-800">
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          {weekDays.map((date, index) => {
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <div 
                key={index} 
                className={`p-3 text-center border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 ${
                  isToday ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                }`}
              >
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  {DAYS_OF_WEEK[index]}
                </div>
                <div className={`text-lg sm:text-xl font-semibold ${
                  isToday 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-zinc-900 dark:text-white"
                }`}>
                  {formatDate(date)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar z-0">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] lg:grid-cols-[80px_repeat(7,1fr)] absolute inset-0 min-h-max">
            {/* Time labels column */}
            <div className="border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 relative z-10 pointer-events-none">
              {HOURS.map((hour) => (
                <div 
                  key={hour} 
                  className="h-[160px] border-b border-zinc-200 dark:border-zinc-800 relative bg-white dark:bg-zinc-900"
                >
                  <span className="absolute -top-3 left-0 right-0 text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 px-1 mx-2 rounded">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Days columns */}
            {weekDays.map((date, dayIndex) => {
              const isToday = new Date().toDateString() === date.toDateString();
              const daySchedules = initialSchedules.filter(s => s.dayOfWeek === dayIndex);

              return (
                <div 
                  key={dayIndex} 
                  className={`border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 relative ${
                    isToday ? "bg-blue-50/20 dark:bg-blue-900/5" : ""
                  }`}
                >
                  {/* Horizontal grid lines for half hours */}
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-[160px] border-b border-zinc-100 dark:border-zinc-800/50 pointer-events-none">
                      <div className="h-[80px] border-b border-dashed border-zinc-100 dark:border-zinc-800/30"></div>
                    </div>
                  ))}

                  {/* Schedule Blocks */}
                  {daySchedules.map((schedule) => {
                    const lesson = lessons.find(l => l.id === schedule.lessonId);
                    return (
                      <div
                        key={schedule.id}
                        onClick={() => { if (!readOnly) openEditModal(schedule); }}
                        className={`absolute left-1 right-1 rounded-xl p-2.5 text-xs shadow-sm border flex flex-col justify-between overflow-hidden transition-all group z-20 ${
                          readOnly ? "cursor-default" : "cursor-pointer hover:shadow-md hover:scale-[1.02]"
                        } ${schedule.color || COLOR_OPTIONS[0].style} ${isPending ? "opacity-50" : ""}`}
                        style={getBlockStyle(schedule.startHour, schedule.startMinute, schedule.durationMinutes)}
                      >
                        <div className="text-xs sm:text-sm font-semibold leading-tight mb-1">
                          {lesson?.lesson_name || "Chưa chọn bài học"}
                        </div>
                        <div className="text-[10px] opacity-75 hidden sm:block font-medium mt-auto">
                          {schedule.startHour.toString().padStart(2, "0")}:{schedule.startMinute.toString().padStart(2, "0")} 
                          {' '}- {schedule.durationMinutes} phút
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Current Time Indicator line (Mocked at 10:15 for today just to show) */}
                  {isToday && (
                    <div 
                      className="absolute left-0 right-0 h-0.5 bg-red-500 z-30 pointer-events-none"
                      style={getBlockStyle(10, 15, 0)} // assuming current time is 10:15
                    >
                      <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- UNIFIED FORM MODAL --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModals}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                {isEditMode ? "Chỉnh sửa phiên học" : "Tạo phiên học mới"}
              </h3>
              <button onClick={closeModals} disabled={isSubmitting} className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Lesson Selection with Source Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tên bài học</label>
                  {!isEditMode && (
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                      <button 
                        onClick={() => {
                          setFormLessonSource("suggested");
                          setFormLessonId("");
                        }}
                        disabled={isSubmitting}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${formLessonSource === "suggested" ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"}`}
                      >
                        <Sparkles className="w-3 h-3" /> Gợi ý
                      </button>
                      <button 
                        onClick={() => {
                          setFormLessonSource("all");
                          setFormLessonId("");
                        }}
                        disabled={isSubmitting}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${formLessonSource === "all" ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"}`}
                      >
                        Tất cả
                      </button>
                    </div>
                  )}
                </div>
                <select 
                  value={formLessonId}
                  onChange={(e) => setFormLessonId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-zinc-100 disabled:dark:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {formLessonSource === "suggested" ? "-- Chọn bài học từ mục Gợi ý --" : "-- Chọn bài học từ danh sách --"}
                  </option>
                  {filteredLessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>{lesson.lesson_name}</option>
                  ))}
                </select>
              </div>

              {/* Lesson Info (Read-only) */}
              {selectedLessonDetails && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Thông tin bài học
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`}>
                      {selectedLessonDetails.level_name || "Mức độ"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {selectedLessonDetails.description || "Chưa có mô tả chi tiết."}
                  </p>
                </div>
              )}

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ngày trong tuần</label>
                  <select 
                    value={formDayOfWeek}
                    onChange={(e) => setFormDayOfWeek(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70"
                  >
                    <option value="0">Thứ 2</option>
                    <option value="1">Thứ 3</option>
                    <option value="2">Thứ 4</option>
                    <option value="3">Thứ 5</option>
                    <option value="4">Thứ 6</option>
                    <option value="5">Thứ 7</option>
                    <option value="6">Chủ nhật</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Thời lượng</label>
                  <select 
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70"
                  >
                    <option value="15">15 phút</option>
                    <option value="30">30 phút</option>
                    <option value="45">45 phút</option>
                    <option value="60">60 phút</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Giờ bắt đầu</label>
                  <input 
                    type="time" 
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Màu sắc</label>
                  <div className="flex items-center gap-2 mt-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button 
                        key={c.id}
                        disabled={isSubmitting}
                        onClick={() => setFormColorStyle(c.style)}
                        className={`w-6 h-6 rounded-full ${c.hex} transition-all disabled:cursor-not-allowed ${
                          formColorStyle === c.style 
                            ? `ring-2 ring-offset-2 dark:ring-offset-zinc-900 ${c.ring}` 
                            : "opacity-60 hover:opacity-100"
                        }`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between gap-3 shrink-0">
              {isEditMode ? (
                <button 
                  onClick={handleDelete} 
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isSubmitting ? "Đang xử lý..." : "Xóa"}
                </button>
              ) : (
                <div></div> // Spacer to keep right buttons aligned
              )}
              
              <div className="flex gap-3">
                <button onClick={closeModals} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50">
                  Hủy
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={!formLessonId || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Đang xử lý..." : (isEditMode ? "Cập nhật" : "Tạo phiên học")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Scrollbar styles to hide/style the scrollbar to look sleek */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
      `}} />
    </div>
  );
}
