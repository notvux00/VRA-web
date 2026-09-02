"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCenterReportsData } from "@/actions/reports";
import { BarChart3, TrendingUp, Target, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

export default function CenterReportsPage() {
  const { centerId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!centerId) return;
      setLoading(true);
      const res = await getCenterReportsData(centerId);
      if (res.success) {
        setReportData(res.data);
      }
      setLoading(false);
    }
    fetchData();
  }, [centerId]);

  if (loading || !reportData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <BarChart3 size={32} className="text-blue-600" />
            Báo cáo & Thống kê
          </h1>
          <p className="text-zinc-500 font-medium">Trung tâm Điều trị</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Frequency Chart */}
        <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">Tần suất Trị liệu VR</h3>
              <p className="text-xs text-zinc-500 font-medium">7 ngày qua</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.frequencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#71717a" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#71717a" }} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontWeight: 600 }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Area type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Achievement Rate */}
        <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <Target size={20} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">Tỷ lệ Hoàn thành Mục tiêu</h3>
              <p className="text-xs text-zinc-500 font-medium">Thống kê theo hạng mục</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.goalData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e4e4e7" opacity={0.5} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#3f3f46", fontWeight: 600 }} width={80} />
                <Tooltip 
                  cursor={{fill: "transparent"}}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value) => [`${value}%`, "Đạt"]}
                />
                <Bar dataKey="achieved" radius={[0, 8, 8, 0]} barSize={24}>
                  {reportData.goalData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.achieved > 70 ? "#3b82f6" : entry.achieved > 50 ? "#eab308" : "#f43f5e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lesson Effectiveness */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <h3 className="font-bold text-zinc-900 dark:text-white">Hiệu quả Kịch bản VR</h3>
          <p className="text-xs text-zinc-500 font-medium mt-1">Các môi trường ảo được sử dụng nhiều nhất</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">Kịch bản</th>
                <th className="px-6 py-4 text-center">Lượt sử dụng</th>
                <th className="px-6 py-4 text-center">Tỷ lệ Hoàn thành</th>
                <th className="px-6 py-4 text-center">Thời lượng TB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {reportData.lessonData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    Chưa có dữ liệu từ các buổi học VR.
                  </td>
                </tr>
              ) : (
                reportData.lessonData.map((lesson: any, i: number) => (
                  <tr key={lesson.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                      {lesson.name}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                      {lesson.uses}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-full max-w-[100px] bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${lesson.completionRate >= 80 ? 'bg-emerald-500' : lesson.completionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: lesson.completionRate + "%" }}
                          />
                        </div>
                        <span className="font-bold w-8 text-right">{lesson.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-zinc-500">
                      {lesson.averageTime}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
