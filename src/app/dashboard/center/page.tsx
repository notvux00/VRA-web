"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Users, Activity, PlayCircle, Star, Settings, FileText, UserPlus, TrendingUp } from "lucide-react";

export default function CenterDashboard() {
  const { centerName } = useAuth();
  const therapists = [
    { id: "T001", name: "BS. Sarah Jenkins", specialization: "ASD / ADHD", assignedChildren: 14, rating: 4.8 },
    { id: "T002", name: "BS. Michael Chen", specialization: "Rối loạn Lo âu", assignedChildren: 9, rating: 4.9 },
    { id: "T003", name: "BS. Emily Wong", specialization: "Tự kỷ (ASD)", assignedChildren: 11, rating: 4.7 },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Tổng quan</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{centerName || "Trung tâm Trị liệu VRA"}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all shadow-sm">
            <Settings size={16} />
            <span>Cài đặt</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all shadow-sm">
            <UserPlus size={16} />
            <span>Thêm chuyên gia</span>
          </button>
        </div>
      </div>

      {/* Center Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Chuyên gia", value: "12", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-400/10" },
          { label: "Trẻ em", value: "184", icon: Activity, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-400/10" },
          { label: "Buổi tập VR (Tháng)", value: "420", icon: PlayCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-400/10" },
          { label: "Điểm tập trung", value: "78%", icon: TrendingUp, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-400/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-blue-200 dark:hover:border-zinc-700 transition-colors shadow-sm dark:shadow-none">
            <div className="flex justify-between items-center mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Therapists Roster */}
        <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Danh sách chuyên gia</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Xem tất cả</button>
          </div>
          <div className="p-4 space-y-4">
            {therapists.map((therapist) => (
              <div key={therapist.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-zinc-700 flex items-center justify-center text-blue-600 dark:text-zinc-300 font-bold">
                    {therapist.name.split(" ")[1].charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-white">{therapist.name}</h4>
                    <p className="text-xs text-zinc-500">{therapist.specialization} &bull; {therapist.assignedChildren} trẻ em</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
                  <Star size={14} className="fill-amber-500" />
                  {therapist.rating}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Activity / Referrals */}
        <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Hoạt động Gần đây</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <UserPlus size={14} />
              </div>
              <div>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  <span className="font-medium text-zinc-900 dark:text-white">BS. Sarah Jenkins</span> đã tiếp nhận trẻ em mới <span className="font-medium text-zinc-900 dark:text-white">Liam D.</span>
                </p>
                <p className="text-xs text-zinc-500 mt-1">2 giờ trước</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <PlayCircle size={14} />
              </div>
              <div>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  Hôm nay đã hoàn thành <span className="font-medium text-zinc-900 dark:text-white">12 buổi tập VR</span>.
                </p>
                <p className="text-xs text-zinc-500 mt-1">5 giờ trước</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FileText size={14} />
              </div>
              <div>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  Báo cáo Tuân thủ Phòng khám Hàng tuần đã được tạo tự động.
                </p>
                <p className="text-xs text-zinc-500 mt-1">1 ngày trước</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
