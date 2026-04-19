"use client";

import React from "react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Zap, Info, X, Target, Zap as ZapIcon, Eye, Activity, Heart } from "lucide-react";

interface ChildRadarChartProps {
  radarData: any[];
}

export default function ChildRadarChart({ radarData }: ChildRadarChartProps) {
  const [mounted, setMounted] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[400px] w-full bg-zinc-50 dark:bg-zinc-800/10 rounded-3xl animate-pulse" />;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 relative">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <Zap size={20} className="text-emerald-600" /> Hồ sơ năng lực
            </h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Đánh giá 5 chiều hành vi</p>
         </div>
         <button 
           onClick={() => setShowInfo(!showInfo)}
           className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-blue-600"
         >
           <Info size={20} />
         </button>
      </div>

      <div className="h-[300px] min-h-[300px] w-full flex items-center justify-center min-w-0 overflow-hidden">
        <ResponsiveContainer 
          id="radar-chart-container"
          width="100%" 
          height="100%" 
          minWidth={0} 
          minHeight={0} 
          debounce={0}
        >
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

      {/* Interactive Info Overlay */}
      {showInfo && (
        <div className="absolute inset-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-8 rounded-3xl animate-in fade-in zoom-in duration-300 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Ý nghĩa các chỉ số</h4>
            <button 
              onClick={() => setShowInfo(false)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={20} className="text-zinc-500" />
            </button>
          </div>
          
          <div className="space-y-6">
            <InfoCard 
              icon={Eye} 
              color="text-blue-500" 
              label="TẬP TRUNG" 
              tracking="Đánh giá khả năng duy trì góc nhìn vào khu vực chứa nội dung bài học."
              meaning="Trẻ có nhìn thẳng vào bài học không hay mắt cứ láo liên tìm kiếm, ngó dọc ngó ngang linh tinh."
            />
            <InfoCard 
              icon={Heart} 
              color="text-red-500" 
              label="BÌNH TĨNH" 
              tracking="Đánh giá năng lực chống đỡ với áp lực sợ hãi và tính quá tải trầm trọng."
              meaning="Trẻ có khóc ré lên, hoảng sợ bị đơ người, hay từ chối mọi tương tác từ môi trường không."
            />
            <InfoCard 
              icon={Target} 
              color="text-purple-500" 
              label="CHỦ ĐỘNG" 
              tracking="Đánh giá sự tự giác của trẻ trong việc bắt đầu tương tác vào các mục tiêu của bài học."
              meaning="Trẻ có tự giác làm bài không, hay đứng ỳ một chỗ đợi thầy cô nhắc nhở liên tục."
            />
            <InfoCard 
              icon={ZapIcon} 
              color="text-amber-500" 
              label="TỰ TIN" 
              tracking="Đánh giá độ dứt khoát và mạnh dạn khi trẻ thực hiện một động tác vận động."
              meaning="Trẻ có ngập ngừng, lưỡng lự khi làm nhiệm vụ hay không, thao tác có nhanh nhẹn dứt điểm không."
            />
            <InfoCard 
              icon={Activity} 
              color="text-emerald-500" 
              label="ỔN ĐỊNH" 
              tracking="Đánh giá sự thư giãn của cơ thể, khả năng tránh các hành vi tự kích thích bù trừ (Self-Stimming)."
              meaning="Tay chân, đầu cổ của trẻ có bình thường không hay bé đang liên tục vẫy tay, lắc đầu vô thức."
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, color, label, tracking, meaning }: any) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.replace('text-', 'bg-')}/10 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-1">{label}</p>
        <p className="text-[10px] text-zinc-500 font-bold mb-1 opacity-80 italic">Đang theo dõi: {tracking}</p>
        <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">"{meaning}"</p>
      </div>
    </div>
  );
}
