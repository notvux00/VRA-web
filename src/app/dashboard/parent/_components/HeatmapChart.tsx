"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Info } from "lucide-react";
import { getChildHeatmapData } from "@/actions/parent";

interface HeatmapChartProps {
  childId: string;
}

export default function HeatmapChart({ childId }: HeatmapChartProps) {
  const [data, setData] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const availableYears = useMemo(() => {
    const current = new Date().getFullYear();
    return [current, current - 1, current - 2];
  }, []);

  // 1. Fetch data
  useEffect(() => {
    setLoading(true);
    getChildHeatmapData(childId).then(res => {
      if (res.success) {
        setData(res.heatmapData);
      }
      setLoading(false);
    });
  }, [childId]);

  // 2. Generate Calendar Year (Jan 1 to Dec 31)
  const { chronDays, monthLabels, totalContributions, isCurrentYear } = useMemo(() => {
    const today = new Date();
    const year = selectedYear;
    const isCurrent = year === today.getFullYear();
    const startDate = new Date(year, 0, 1); // Jan 1st
    const endDate = new Date(year, 11, 31); // Dec 31st
    
    // Align start to the beginning of the week (Monday-based for our 7-row logic)
    // In our grid: T2, T3, T4, T5, T6, T7, CN
    const startDay = startDate.getDay(); // 0 is Sunday
    const offset = startDay === 0 ? 6 : startDay - 1; // Days to subtract to get to Monday
    const gridStart = new Date(startDate);
    gridStart.setDate(startDate.getDate() - offset);

    const days: { date: string; count: number; month: number; monthName: string; isFuture: boolean }[] = [];
    let total = 0;

    // We want to cover the whole year in weeks (max 53 weeks * 7 days = 371 days)
    for (let i = 0; i < 371; i++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        
        // Stop if we past the end of the year week
        if (d.getFullYear() > year && d.getDay() === 1) break;

        const dateStr = d.getFullYear() + "-" + 
                        String(d.getMonth() + 1).padStart(2, '0') + "-" + 
                        String(d.getDate()).padStart(2, '0');
        
        const isFuture = d > today;
        const count = data[dateStr] || 0;
        
        // Only count sessions within the actual current year
        if (d.getFullYear() === year) {
            total += count;
        }

        days.push({
            date: dateStr,
            count: count,
            month: d.getMonth(),
            monthName: `T${d.getMonth() + 1}`,
            isFuture: isFuture
        });
    }
    
    // Calculate Month Label positions (only for the first day of each month in our grid)
    const mLabels: { name: string; colIndex: number }[] = [];
    let lastMonth = -1;
    
    for (let col = 0; col < Math.ceil(days.length / 7); col++) {
        const firstDayOfWeek = days[col * 7];
        if (firstDayOfWeek && firstDayOfWeek.month !== lastMonth && firstDayOfWeek.date.startsWith(`${year}`)) {
            mLabels.push({
                name: firstDayOfWeek.monthName,
                colIndex: col
            });
            lastMonth = firstDayOfWeek.month;
        }
    }

    return { 
        chronDays: days, 
        monthLabels: mLabels,
        totalContributions: total,
        isCurrentYear: isCurrent
    };
  }, [data, selectedYear]);

  // 3. Auto-scroll to CURRENT week (only if selected year is current)
  useEffect(() => {
    if (!loading && isCurrentYear) {
      const today = new Date();
      const todayStr = today.getFullYear() + "-" + 
                       String(today.getMonth() + 1).padStart(2, '0') + "-" + 
                       String(today.getDate()).padStart(2, '0');
      
      const todayIndex = chronDays.findIndex(d => d.date === todayStr);
      if (todayIndex !== -1) {
        const colIndex = Math.floor(todayIndex / 7);
        const container = document.getElementById("heatmap-scroll-container");
        if (container) {
          container.scrollLeft = Math.max(0, colIndex * (10 + 2) - 100);
        }
      }
    } else if (!loading && !isCurrentYear) {
      // For past years, scroll to start
      const container = document.getElementById("heatmap-scroll-container");
      if (container) {
        container.scrollLeft = 0;
      }
    }
  }, [loading, data, chronDays, isCurrentYear]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 h-[240px] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const getColor = (count: number) => {
    if (count === 0) return "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800/50";
    if (count === 1) return "bg-blue-200 dark:bg-blue-900/40 border-blue-200";
    if (count === 2) return "bg-blue-300 dark:bg-blue-800/60 border-blue-300";
    return "bg-blue-500 dark:bg-blue-600 border-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.2)]";
  };

  const dayLabels = ["T2", "", "T4", "", "T6", "", "CN"];

  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm dark:shadow-none overflow-hidden relative group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-baseline gap-1.5 leading-none">
            <span className="text-2xl text-blue-600">{totalContributions}</span> 
            <span>buổi rèn luyện</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-medium text-xs">Phạm vi rèn luyện:</span>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent border-none text-zinc-900 dark:text-white font-bold text-sm focus:ring-0 cursor-pointer hover:text-blue-600 transition-colors p-0"
            >
              {availableYears.map(y => (
                <option key={y} value={y} className="dark:bg-zinc-900 font-sans">Năm {y}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded-lg border border-zinc-100 dark:border-zinc-700/30">
          <Info size={10} className="text-blue-500" />
          Mục tiêu cả năm
        </div>
      </div>

      <div className="relative">
        <div 
          id="heatmap-scroll-container"
          className="overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 scroll-smooth"
        >
          <div className="inline-flex gap-3 items-start min-w-max">
            <div className="grid grid-rows-7 gap-[2px] mt-5 shrink-0 sticky left-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm pr-3 z-10">
              {dayLabels.map((label, i) => (
                <span key={i} className="text-[9px] font-black text-zinc-300 dark:text-zinc-700 h-[10px] w-4 uppercase flex items-center">
                  {label}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="relative h-4 w-full mb-1">
                {monthLabels.map((ml, i) => (
                  <span 
                    key={i} 
                    className="absolute text-[9px] font-bold text-zinc-400 uppercase tracking-tighter whitespace-nowrap"
                    style={{ left: `${ml.colIndex * (10 + 2)}px` }}
                  >
                    {ml.name}
                  </span>
                ))}
              </div>

              <div className="grid grid-flow-col grid-rows-7 gap-[2px]">
                {chronDays.map((day, i) => (
                  <div
                    key={i}
                    title={`${day.date}: ${day.count} buổi rèn luyện`}
                    className={`w-[10px] h-[10px] rounded-[1.5px] border transition-all duration-300 hover:scale-125 hover:z-20 cursor-help ${getColor(day.count)}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent pointer-events-none" />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-300 dark:text-zinc-700">
           <span>Hành trình rèn luyện niên độ {selectedYear}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 mr-4">
            <span>Ít</span>
            <div className="w-[10px] h-[10px] rounded-[1.5px] bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50" />
            <div className="w-[10px] h-[10px] rounded-[1.5px] bg-blue-200" />
            <div className="w-[10px] h-[10px] rounded-[1.5px] bg-blue-300" />
            <div className="w-[10px] h-[10px] rounded-[1.5px] bg-blue-500" />
            <span>Nhiều</span>
        </div>
      </div>
    </div>
  );
}
