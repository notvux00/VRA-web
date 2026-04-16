"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Info, Loader2 } from "lucide-react";
import { getChildDashboardAnalytics } from "@/actions/parent";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart
} from 'recharts';

interface RadarItem {
  subject: string;
  A: number;
  fullMark: number;
}

interface TrendItem {
  date: string;
  score: number;
  duration: number;
}

interface FocusChartProps {
  childId: string;
}

export default function FocusChart({ childId }: FocusChartProps) {
  const [data, setData] = useState<{ radarData: RadarItem[], trendData: TrendItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    getChildDashboardAnalytics(childId).then(res => {
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    });
  }, [childId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!data || (!data.radarData.length && !data.trendData.length)) {
    return (
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-[400px] flex flex-col items-center justify-center text-zinc-500 italic">
        <p>Chưa đủ dữ liệu để phân tích chuyên sâu.</p>
        <p className="text-xs mt-2 text-zinc-400 font-normal">(Cần thực hiện ít nhất 1-3 buổi học)</p>
      </div>
    );
  }

  const skillDefinitions = [
    { label: "Chính xác", desc: "Tỉ lệ trả lời đúng các yêu cầu trong bài tập." },
    { label: "Tự chủ", desc: "Khả năng tự thực hiện nhiệm vụ mà không cần sự trợ giúp/gợi ý." },
    { label: "Tốc độ", desc: "Thời gian phản ứng và hoàn thành các yêu cầu trong bài học." },
    { label: "Hoàn thành", desc: "Mức độ hoàn thành các bài học và đạt điểm số mục tiêu." },
    { label: "Tập trung", desc: "Sự kiên trì và độ ổn định khi xử lý các tình huống luyện tập." },
  ];

  return (
    <div className="relative bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm dark:shadow-none transition-all hover:shadow-xl hover:shadow-blue-500/5">
      {/* Info Modal Overlay - Readable Brighter Look */}
      {showInfo && (
        <div className="absolute inset-x-4 top-24 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border-2 border-blue-100/40 dark:border-blue-500/10 animate-in fade-in zoom-in duration-300 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black uppercase tracking-widest text-[11px] text-blue-600 dark:text-blue-400">Giải thích Chỉ số rèn luyện</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {skillDefinitions.map((s, i) => (
              <div key={i} className="bg-zinc-50/50 dark:bg-zinc-800/30 p-5 rounded-2xl border border-zinc-100/50 dark:border-zinc-700/50 hover:border-blue-200 transition-colors">
                <span className="text-[11px] font-black uppercase text-zinc-900 dark:text-white mb-2 block tracking-wider">{s.label}</span>
                <p className="text-[12px] font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Phân tích Năng lực</h2>
          <p className="text-sm text-zinc-500 font-medium">Đánh giá dựa trên kết quả rèn luyện thực tế</p>
        </div>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className={`p-3 rounded-2xl transition-all ${
            showInfo 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-blue-600"
          }`}
        >
          <Info size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
        {/* Radar Chart Section */}
        <div className="w-full flex flex-col items-center">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6 self-start">Biểu đồ Phân bổ Kỹ năng</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
                <PolarGrid stroke="#e4e4e7" strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                />
                <Radar
                   name="Bé"
                   dataKey="A"
                   stroke="#2563eb"
                   strokeWidth={3}
                   fill="#3b82f6"
                   fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
             {data.radarData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-100 dark:border-zinc-800">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">{d.subject}: {d.A}%</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
