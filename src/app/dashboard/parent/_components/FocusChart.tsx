export default function FocusChart() {
  const data = [40, 65, 55, 80, 75, 90, 85];

  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Chỉ số tập trung (7 ngày qua)</h2>
        <select className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs px-3 py-1.5 text-zinc-600 dark:text-zinc-400 focus:outline-none">
          <option>Hàng tuần</option>
          <option>Hàng tháng</option>
        </select>
      </div>
      <div className="h-64 flex items-end justify-between gap-2 px-2">
        {data.map((height, i) => (
          <div key={i} className="w-full flex flex-col items-center gap-3">
            <div className="w-full relative bg-zinc-100 dark:bg-zinc-800/50 rounded-t-lg h-full flex items-end overflow-hidden group">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-purple-400 dark:from-blue-600 dark:to-purple-500 rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                style={{ height: `${height}%` }}
              >
                <div className="absolute top-0 w-full h-1 bg-white/40 dark:bg-white/20" />
              </div>
            </div>
            <span className="text-xs text-zinc-500 font-medium">Ngày {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
