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
  Legend
} from "recharts";
import { ShieldCheck } from "lucide-react";

interface ChildIndependenceChartProps {
  sessions: any[];
}

export default function ChildIndependenceChart({ sessions }: ChildIndependenceChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Process data: Total hints of each type per session
  const data = [...sessions].reverse().slice(-7).map(s => {
    const logs = s.quest_logs || [];
    let verbal = 0;
    let visual = 0;
    let physical = 0;

    logs.forEach((log: any) => {
      verbal += (log.hints_verbal || 0);
      visual += (log.hints_visual || 0);
      physical += (log.hints_physical || 0);
    });

    return {
      date: new Date(s.start_time).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' }),
      verbal,
      visual,
      physical,
      total: verbal + visual + physical
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
              <ShieldCheck size={20} className="text-blue-600" /> Chỉ số Độc lập
            </h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Số lần hỗ trợ/gợi ý qua từng buổi học</p>
         </div>
      </div>
      
      <div className="h-[300px] min-h-[300px] w-full min-w-0 overflow-hidden">
        <ResponsiveContainer 
          id="independence-chart-container"
          width="100%" 
          height="100%" 
          minWidth={0} 
          minHeight={0} 
          debounce={0}
        >
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
          <Tooltip 
            cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} 
            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '16px', padding: '12px' }}
            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
          <Bar dataKey="verbal" name="Lời nói" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
          <Bar dataKey="visual" name="Hình ảnh" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} />
          <Bar dataKey="physical" name="Cử chỉ" stackId="a" fill="#f87171" radius={[6, 6, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
