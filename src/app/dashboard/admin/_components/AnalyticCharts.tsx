export default function AnalyticCharts() {
  const sessionData = [
    { month: "T10", count: 420 }, { month: "T11", count: 380 },
    { month: "T12", count: 510 }, { month: "T01", count: 480 },
    { month: "T02", count: 620 }, { month: "T03", count: 750 },
  ];
  const maxCount = Math.max(...sessionData.map(d => d.count));
  const width = 400;
  const height = 120;
  const points = sessionData.map((d, i) => {
    const x = (i / (sessionData.length - 1)) * width;
    const y = height - (d.count / maxCount) * height;
    return `${x},${y}`;
  }).join(" ");
  const areaPath = `0,${height} ${points} ${width},${height}`;

  const topCenters = [
    { name: "Trung tâm Hy Vọng", sessions: 245 },
    { name: "Cơ sở Hà Nội", sessions: 182 },
    { name: "Sunshine Clinic", sessions: 156 },
    { name: "VRA Đà Nẵng", sessions: 94 },
    { name: "Green World", sessions: 67 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Area Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm group hover:border-blue-500/30 transition-all">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Hiệu suất Buổi tập</h3>
            <p className="text-xs text-zinc-500 font-medium tracking-tight">Thống kê lưu lượng tham gia VR trên toàn hệ thống.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">+12.5%</span>
          </div>
        </div>
        <div className="relative h-48 w-full mt-4 flex items-end">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline fill="url(#areaGradient)" points={areaPath} />
            <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
            {sessionData.map((d, i) => (
              <circle key={i} cx={(i / (sessionData.length - 1)) * width} cy={height - (d.count / maxCount) * height} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
            ))}
          </svg>
        </div>
        <div className="flex justify-between mt-4 px-1">
          {sessionData.map((d, i) => (<span key={i} className="text-[10px] font-bold text-zinc-400">{d.month}</span>))}
        </div>
      </div>

      {/* Top Centers Leaderboard */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/10 text-amber-600 rounded-xl uppercase font-black text-[10px] tracking-tighter shrink-0 border border-amber-500/20">Top 5</div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Trung tâm Hoạt động</h3>
        </div>
        <div className="space-y-4 flex-1">
          {topCenters.map((center, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[140px]">{center.name}</span>
                <span className="text-[10px] font-bold text-zinc-500">{center.sessions} buổi</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(center.sessions / 300) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
