import { TrendingUp, Info } from "lucide-react";
import { getChildSessions } from "@/actions/parent";

interface FocusChartProps {
  childId: string;
}

export default async function FocusChart({ childId }: FocusChartProps) {
  const result = await getChildSessions(childId);
  const sessions = result.success ? result.sessions : [];

  // Mock Skill Data (Derived from Session Types later)
  const skills = [
    { name: "Kỹ năng Xã hội", progress: 75, color: "bg-blue-500" },
    { name: "Kiểm soát Cảm xúc", progress: 60, color: "bg-purple-500" },
    { name: "Vận động & Phản xạ", progress: 85, color: "bg-emerald-500" },
  ];

  // Simplified Focus Trend (Last 5 sessions)
  const trendData = sessions.slice(0, 5).reverse().map(s => s.score || 70);

  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Biểu đồ Tiến trình</h2>
          <p className="text-sm text-zinc-500">Đánh giá khả năng tập trung và kỹ năng của trẻ</p>
        </div>
        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400">
          <Info size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Skill Progress Bars */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Phân bổ Kỹ năng</h3>
          <div className="space-y-5">
            {skills.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">{skill.name}</span>
                  <span className="text-zinc-500 font-bold">{skill.progress}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${skill.color} transition-all duration-1000`} 
                    style={{ width: `${skill.progress}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Trend Visualization (SVG) */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp size={14} />
            Xu hướng Tập trung (Hệ số Score)
          </h3>
          <div className="h-40 w-full bg-zinc-50 dark:bg-zinc-800/20 rounded-xl flex items-end p-4 gap-4">
            {trendData.length > 0 ? trendData.map((val, i) => (
              <div 
                key={i} 
                className="flex-1 bg-blue-500/20 dark:bg-blue-500/10 border-t-2 border-blue-500 relative group"
                style={{ height: `${val}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  {val}%
                </div>
              </div>
            )) : (
              <div className="w-full flex items-center justify-center text-zinc-400 text-sm italic">
                Cần thêm dữ liệu...
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4 px-1">
            <span className="text-[10px] text-zinc-400">Buổi cũ</span>
            <span className="text-[10px] text-zinc-400 font-bold">Mới nhất</span>
          </div>
        </div>
      </div>
    </div>
  );
}
