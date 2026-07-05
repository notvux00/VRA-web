"use client";

import React, { useState, useTransition } from "react";
import { Target, Plus, Trash2, Save, Sparkles } from "lucide-react";
import { updateChildGoals } from "@/actions/expert";
import { ChildGoal } from "@/types";

interface GoalSettingsEditorProps {
  childId: string;
  initialGoals?: ChildGoal[];
}

export default function GoalSettingsEditor({ childId, initialGoals = [] }: GoalSettingsEditorProps) {
  const [goals, setGoals] = useState<ChildGoal[]>(initialGoals);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateChildGoals(childId, goals);
      if (result.success) {
        setIsEditing(false);
      } else {
        alert("Có lỗi xảy ra khi lưu mục tiêu: " + result.error);
      }
    });
  };

  const handleAddGoal = () => {
    const newGoal: ChildGoal = {
      id: Math.random().toString(36).substring(7),
      type: "custom",
      title: "Mục tiêu mới",
      targetValue: 10,
      unit: "lần"
    };
    setGoals([...goals, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleChange = (id: string, field: keyof ChildGoal, value: any) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 sm:p-8 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Target className="text-blue-500" /> Mục tiêu trong tuần
          </h3>
        </div>
        
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setGoals(initialGoals);
                setIsEditing(false);
              }}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Save size={18} /> {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
          >
            Chỉnh sửa Mục tiêu
          </button>
        )}
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className={`relative p-5 rounded-2xl border ${isEditing ? 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 shadow-sm' : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'}`}>
              {isEditing && (
                <button 
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="absolute -top-2 -right-2 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full hover:bg-red-200 transition-colors z-10"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <div className="flex flex-col space-y-3">
                {isEditing ? (
                  <>
                    <input 
                      type="text" 
                      value={goal.title} 
                      onChange={(e) => handleChange(goal.id, 'title', e.target.value)}
                      placeholder="Tên mục tiêu"
                      className="font-bold text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 w-full text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <select
                      value={goal.type}
                      onChange={(e) => handleChange(goal.id, 'type', e.target.value)}
                      className="text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 outline-none text-zinc-700 dark:text-zinc-300"
                    >
                      <option value="weekly_sessions">Số buổi học/tuần</option>
                      <option value="target_duration_minutes">Thời lượng học (phút)</option>
                      <option value="target_focus_score">Độ tập trung (điểm)</option>
                      <option value="streak_days">Chuỗi ngày liên tục</option>
                      <option value="custom">Mục tiêu khác</option>
                    </select>
                  </>
                ) : (
                  <h4 className="font-bold text-zinc-900 dark:text-white">{goal.title}</h4>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    Chỉ tiêu
                  </span>
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full min-w-0">
                      <input 
                        type="number" 
                        value={goal.targetValue} 
                        onChange={(e) => handleChange(goal.id, 'targetValue', parseFloat(e.target.value))}
                        className="w-16 font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-2 py-1 text-sm outline-none text-center" 
                      />
                      <input 
                        type="text" 
                        value={goal.unit || ""} 
                        onChange={(e) => handleChange(goal.id, 'unit', e.target.value)}
                        placeholder="đơn vị"
                        className="w-24 min-w-0 font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm outline-none" 
                      />
                    </div>
                  ) : (
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {goal.targetValue} <span className="text-sm font-medium text-zinc-500">{goal.unit}</span>
                    </div>
                  )}
                </div>

                {goal.type === "custom" && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700/50">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                      Đã đạt
                    </span>
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={goal.currentValue || 0} 
                        onChange={(e) => handleChange(goal.id, 'currentValue', parseFloat(e.target.value))}
                        className="w-16 font-black text-purple-600 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg px-2 py-1 text-sm outline-none text-center" 
                      />
                    ) : (
                      <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                        {goal.currentValue || 0}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isEditing && (
            <button 
              onClick={handleAddGoal}
              className="flex flex-col items-center justify-center p-5 bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Plus size={24} className="mb-2" />
              <span className="font-bold text-sm">Thêm Mục tiêu mới</span>
            </button>
          )}

          {!isEditing && goals.length === 0 && (
            <div className="col-span-full p-8 text-center bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <p className="text-zinc-500 dark:text-zinc-400">Chưa có mục tiêu nào được thiết lập. Hãy bấm "Chỉnh sửa" để bắt đầu.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
