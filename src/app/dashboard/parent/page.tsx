"use client";

import React from "react";
import { Activity, Clock, Trophy, Target, PlayCircle, TrendingUp, Brain, Link as LinkIcon } from "lucide-react";

export default function ParentDashboard() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Chào buổi tối!</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Đây là tiến trình học tập của bé trong tuần này.</p>
        </div>
        <button className="bg-blue-600 dark:bg-white/10 hover:bg-blue-700 dark:hover:bg-white/20 border border-blue-500 dark:border-white/10 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all shadow-sm">
          <LinkIcon size={16} />
          <span>Thêm hồ sơ bé</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Số buổi tập VR", value: "24", icon: PlayCircle, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-400/10" },
          { label: "Thời gian trong VR", value: "14h 30m", icon: Clock, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-400/10" },
          { label: "Điểm Tập trung", value: "85%", icon: Target, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-400/10" },
          { label: "Thành tích", value: "12", icon: Trophy, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-400/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-blue-200 dark:hover:border-zinc-700 transition-colors shadow-sm dark:shadow-none">
            <div className="flex justify-between items-center mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <TrendingUp size={18} className="text-zinc-400 dark:text-zinc-600" />
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Progress Chart & Insights */}
        <div className="xl:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Chỉ số tập trung (7 ngày qua)</h2>
              <select className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs px-3 py-1.5 text-zinc-600 dark:text-zinc-400 focus:outline-none">
                <option>Hàng tuần</option>
                <option>Hàng tháng</option>
              </select>
            </div>
            {/* Mock Chart */}
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {[40, 65, 55, 80, 75, 90, 85].map((height, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-3">
                  <div className="w-full relative bg-zinc-100 dark:bg-zinc-800/50 rounded-t-lg h-full flex items-end overflow-hidden group">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-400 dark:from-blue-600 dark:to-purple-500 rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute top-0 w-full h-1 bg-white/40 dark:bg-white/20"></div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">Ngày {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Nhận xét từ chuyên gia</h2>
            <div className="bg-blue-50 dark:bg-black/50 border border-blue-100 dark:border-zinc-800/50 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm border border-zinc-100 dark:border-zinc-700">
                  <Brain size={18} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-zinc-900 dark:text-white font-medium mb-1">BS. Sarah Jenkins</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-400 mb-3 leading-relaxed">
                    "Tommy đã cho thấy sự tiến bộ vượt bậc hôm nay trong mô-đun nhận thức không gian. Bé duy trì sự tập trung trong 12 phút liên tục mà không cần nhắc nhở thị giác, đây là thành tích tốt nhất của bé từ trước đến nay. Hãy tiếp tục thực hành các bài tập thở mà chúng ta đã thảo luận nhé!"
                  </p>
                  <span className="text-xs text-zinc-500 dark:text-zinc-600 font-medium uppercase tracking-wider">Đăng 2 giờ trước</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Recent Sessions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Hoạt động gần đây</h2>
            <div className="space-y-5">
              {[
                { title: "Luyện tập Tập trung Không gian", date: "Hôm nay", duration: "25 phút", status: "Đã hoàn thành", score: "A" },
                { title: "Điều chỉnh Cảm xúc", date: "Hôm qua", duration: "30 phút", status: "Đã hoàn thành", score: "B+" },
                { title: "Tương tác Xã hội Sandbox", date: "18 thg 3", duration: "15 phút", status: "Bị gián đoạn", score: "N/A" },
                { title: "Luyện tập Tập trung Không gian", date: "15 thg 3", duration: "20 phút", status: "Đã hoàn thành", score: "B" },
              ].map((session, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    session.status === "Đã hoàn thành" 
                      ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400" 
                      : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-500"
                  }`}>
                    <Activity size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-zinc-900 dark:text-zinc-200 font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{session.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500">{session.date}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                      <span className="text-xs text-zinc-500">{session.duration}</span>
                    </div>
                  </div>
                  {session.status === "Đã hoàn thành" && (
                    <div className="font-bold text-sm text-zinc-800 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                      {session.score}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors">
              Xem tất cả
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
