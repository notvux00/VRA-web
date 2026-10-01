// @ts-nocheck
"use client";

import React from "react";
import { useIsMounted } from "@/hooks/useIsMounted";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { Activity } from "lucide-react";

interface ChildIntensityChartProps {
  sessions: Record<string, unknown>[];
}

export default function ChildIntensityChart({ sessions }: ChildIntensityChartProps) {
  const mounted = useIsMounted();

    const chronologicalSessions = [...sessions].reverse();
  const groupedData = chronologicalSessions.reduce((acc, s) => {
    const date = new Date((s as any).start_time).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
    const totalSeconds = Math.round((s as any).duration || 0);
    if (!acc[date]) {
      acc[date] = { date, duration: 0 };
    }
    acc[date].duration += totalSeconds;
    return acc;
  }, {} as Record<string, any>);

  const barData = Object.values(groupedData).slice(-7).map((item: any) => {
    const mins = Math.floor(item.duration / 60);
    const secs = item.duration % 60;
    return {
      date: item.date,
      duration: item.duration,
      formattedTime: `${mins}p ${secs}s`
    };
  });

  if (!mounted) {
    return <div className="h-[400px] w-full bg-zinc-50 dark:bg-zinc-800/10 rounded-3xl animate-pulse" />;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 min-w-0 relative">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <Activity size={20} className="text-purple-600" /> Cường độ luyện tập
            </h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Thời gian học tập (giây)</p>
         </div>
      </div>
      
      <div className="h-[300px] min-h-[300px] w-full min-w-0 overflow-hidden">
        <ResponsiveContainer 
          id="intensity-bar-chart"
          width="100%" 
          height="100%" 
          minWidth={0} 
          minHeight={0} 
          debounce={0}
        >
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
          <Tooltip 
            cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} 
            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '16px', padding: '12px' }}
            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
            formatter={(value: unknown, name: unknown, props: unknown) => [props.payload.formattedTime, "Thời lượng"]}
          />
          <Bar dataKey="duration" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Thời lượng" />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
