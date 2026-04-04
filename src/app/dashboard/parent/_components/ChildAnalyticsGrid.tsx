"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Cell
} from "recharts";
import { Activity, Zap } from "lucide-react";

interface ChildAnalyticsGridProps {
  sessions: any[];
  radarData: any[];
}

export default function ChildAnalyticsGrid({ sessions, radarData }: ChildAnalyticsGridProps) {
  // Process sessions for bar chart (Duration in minutes)
  const barData = [...sessions].reverse().slice(-7).map(s => ({
    date: new Date(s.start_time).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' }),
    duration: Math.round((s.duration || 0) / 60) // Convert seconds to minutes
  }));

  return (
    <div className="space-y-8 min-w-0">
      {/* 1. Training Intensity Bar Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 min-w-0 relative">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <Activity size={20} className="text-purple-600" /> Cường độ luyện tập
              </h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Thời gian học tập (phút)</p>
           </div>
        </div>
        
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} 
                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '16px', padding: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
              />
              <Bar dataKey="duration" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Thời lượng (p)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Behavioral Profile Radar Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <Zap size={20} className="text-emerald-600" /> Hồ sơ năng lực
              </h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Đánh giá 5 chiều hành vi</p>
           </div>
        </div>

        <div className="h-[300px] w-full flex items-center justify-center min-w-0">
          <ResponsiveContainer width="99%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e4e4e7" className="dark:stroke-zinc-800" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="none" />
              <Radar
                name="Năng lực"
                dataKey="A"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.5}
                animationDuration={2000}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '16px', padding: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
