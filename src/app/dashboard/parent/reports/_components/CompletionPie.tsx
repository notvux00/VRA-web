import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface CompletionPieProps {
  questSuccess: number;
  questTotal: number;
  data: { name: string; value: number; color: string }[];
}

export default function CompletionPie({ questSuccess, questTotal, data }: CompletionPieProps) {
  return (
    <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-rose-500"></div>
      
      <div className="space-y-1">
        <h3 className="text-lg font-black uppercase tracking-tight">Tỉ lệ hoàn thành</h3>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mức độ vượt qua bài học</p>
      </div>

      <div className="h-[180px] w-full flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={questSuccess === questTotal || questSuccess === 0 ? 0 : 6}
              dataKey="value"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
            {questTotal > 0 ? Math.round((questSuccess/questTotal)*100) : 0}%
          </p>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Thành công</p>
        </div>
      </div>
      
      <div className="flex gap-4 w-full">
        <div className="flex-1 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
          <p className="text-xs font-black text-emerald-600 leading-none mb-1">{questSuccess}</p>
          <p className="text-[8px] font-bold text-emerald-600/60 uppercase">Đúng</p>
        </div>
        <div className="flex-1 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl">
          <p className="text-xs font-black text-rose-600 leading-none mb-1">{questTotal - questSuccess}</p>
          <p className="text-[8px] font-bold text-rose-600/60 uppercase">Cần tập lại</p>
        </div>
      </div>
    </div>
  );
}
