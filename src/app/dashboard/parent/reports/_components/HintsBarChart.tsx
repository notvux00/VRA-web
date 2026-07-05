import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HintsBarChartProps {
  data: { name: string; time: number; visual: number; verbal: number; physical: number; status: string }[];
}

export default function HintsBarChart({ data }: HintsBarChartProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Sự trợ giúp của cô</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Loại gợi ý con đã nhận</p>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" hide />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
              labelStyle={{ fontWeight: 900, color: '#18181b', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
            />
            <Bar dataKey="visual" name="Gợi ý hình ảnh" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={30} />
            <Bar dataKey="verbal" name="Gợi ý lời nói" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={30} />
            <Bar dataKey="physical" name="Hỗ trợ vật lý" stackId="a" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-zinc-400 text-center italic font-medium">Cột càng thấp nghĩa là con càng tự lập và chủ động hơn đấy ba mẹ!</p>
    </div>
  );
}
