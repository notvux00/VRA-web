import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap } from "lucide-react";

interface SpeedChartProps {
  data: { name: string; time: number; visual: number; verbal: number; physical: number; status: string }[];
}

export default function SpeedChart({ data }: SpeedChartProps) {
  return (
    <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight leading-none mb-1">Tốc độ của bé</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phản xạ qua từng câu hỏi</p>
          </div>
        </div>
      </div>

      <div className="h-[200px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis dataKey="name" hide />
            <YAxis hide domain={[0, 'dataMax + 1']} />
            <Tooltip 
              contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
              labelStyle={{ fontWeight: 900, color: '#3b82f6', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
            />
            <Area 
              type="monotone" 
              dataKey="time" 
              stroke="#3b82f6" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorResponse)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 font-medium italic text-center leading-relaxed">
          &quot;Biểu đồ này cho thấy thời gian con suy nghĩ. Đường đi xuống và ổn định là con đang rất tự tin đấy ba mẹ ơi!&quot;
        </p>
      </div>
    </div>
  );
}
