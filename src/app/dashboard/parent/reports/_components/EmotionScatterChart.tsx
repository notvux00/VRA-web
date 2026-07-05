import React from "react";
import { ScatterChart, Scatter, Cell, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

interface EmotionScatterChartProps {
  data: { time: number; timeLabel: string; category: number; categoryLabel: string; duration: number; color: string }[];
}

export default function EmotionScatterChart({ data }: EmotionScatterChartProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Cảm xúc của con</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Diễn biến tâm lý trong buổi học</p>
        </div>
        <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500">
          <Activity size={18} />
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f1f5f9" />
            <XAxis type="number" dataKey="time" hide />
            <YAxis 
              type="number" 
              dataKey="category" 
              ticks={[1, 2, 3, 4, 5]}
              domain={[0, 6]}
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(val) => {
                if (val === 1) return "NGẬP NGỪNG";
                if (val === 2) return "KÍCH THÍCH";
                if (val === 3) return "ĐỨNG Ỳ";
                if (val === 4) return "XAO NHÃNG";
                if (val === 5) return "CĂNG THẲNG";
                return "";
              }}
              tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }} 
            />
            <ZAxis type="number" dataKey="duration" range={[50, 400]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-black text-zinc-900 dark:text-white uppercase">{item.categoryLabel}</p>
                      <p className="text-[10px] font-bold text-zinc-500 mt-1">Kéo dài: {item.duration}s</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={data}>
              {data.map((entry, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} stroke={entry.color} strokeWidth={2} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-zinc-400 text-center italic font-medium">Theo dõi các điểm màu để hiểu lúc nào con cần ba mẹ vỗ về nhất.</p>
    </div>
  );
}
