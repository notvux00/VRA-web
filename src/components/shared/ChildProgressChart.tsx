"use client";

import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface Session {
  id: string;
  score: number;
  start_time: string;
  [key: string]: any;
}

interface ChildProgressChartProps {
  sessions: Session[];
}

export default function ChildProgressChart({ sessions }: ChildProgressChartProps) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Process sessions for chart (reverse to show chronological order)
  const data = [...sessions].reverse().map(s => ({
    date: new Date(s.start_time).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' }),
    score: s.score || 0,
    fullDate: new Date(s.start_time).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })
  }));

  if (data.length === 0) {
    return (
      <div className="h-[320px] w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/20 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-400 text-sm font-medium italic">Chưa có dữ liệu buổi học để hiển thị biểu đồ.</p>
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full pt-4 pr-4 min-w-0 overflow-hidden">
      <ResponsiveContainer 
        key={mounted ? "chart-mounted" : "chart-unmounted"}
        id="progress-chart-main"
        width="100%" 
        height="100%" 
        minWidth={0} 
        minHeight={0}
        debounce={100}
      >
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#e4e4e7" 
            className="dark:stroke-zinc-800" 
          />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#18181b', 
              border: 'none', 
              borderRadius: '16px',
              padding: '12px'
            }}
            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
            cursor={{ stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '4 4' }}
            labelFormatter={(value, data) => data[0]?.payload?.fullDate || value}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#2563eb" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            animationDuration={1500}
            name="Điểm bài học"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
