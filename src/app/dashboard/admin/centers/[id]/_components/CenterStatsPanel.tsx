import { AlertCircle, Trash2 } from "lucide-react";

interface Center {
  centerId?: string;
  expertCount?: number;
  sessionCount?: number;
  createdAt?: string;
  phone?: string;
  address?: string;
  email: string;
}

interface CenterStatsPanelProps {
  center: Center;
  onDelete: () => void;
}

export default function CenterStatsPanel({ center, onDelete }: CenterStatsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 px-1">Thống kê</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <span className="block text-2xl font-bold text-zinc-900 dark:text-white">{center.expertCount || 0}</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Chuyên gia</span>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <span className="block text-2xl font-bold text-zinc-900 dark:text-white">{center.sessionCount || 0}</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Buổi tập VR</span>
          </div>
        </div>
      </div>

      {/* Center Details */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-1">Thông tin chi tiết</h3>
        <div className="space-y-4 text-xs font-medium">
          {[
            { label: "ID Hệ thống", value: center.centerId, className: "font-bold uppercase tracking-wider" },
            { label: "Ngày tham gia", value: center.createdAt ? new Date(center.createdAt).toLocaleDateString("vi-VN") : "N/A" },
            { label: "Số điện thoại", value: center.phone || "N/A" },
            { label: "Email liên hệ", value: center.email },
          ].map((item) => (
            <div key={item.label} className="flex justify-between py-2 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
              <span className="text-zinc-500">{item.label}</span>
              <span className={`font-bold text-zinc-900 dark:text-white truncate max-w-[150px] ${item.className || ""}`}>{item.value}</span>
            </div>
          ))}
          <div className="flex flex-col gap-1 py-2 border-b border-zinc-50 dark:border-zinc-800">
            <span className="text-zinc-500">Địa chỉ</span>
            <span className="font-bold text-zinc-900 dark:text-white leading-relaxed">{center.address || "Chưa có thông tin địa chỉ"}</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/30 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 p-6 rounded-3xl">
        <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <AlertCircle size={14} /> Vùng Nguy hiểm
        </h3>
        <p className="text-[11px] text-red-600 dark:text-red-400 mb-4 font-medium leading-relaxed">
          Xóa trung tâm này sẽ xóa vĩnh viễn tất cả dữ liệu lâm sàng liên quan và các phân công chuyên gia.
        </p>
        <button
          onClick={onDelete}
          className="w-full py-2.5 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={14} />
          Xóa Trung tâm Vĩnh viễn
        </button>
      </div>
    </div>
  );
}
