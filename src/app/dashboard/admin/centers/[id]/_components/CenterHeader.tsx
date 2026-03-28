import Link from "next/link";
import { Building, Mail, Shield, Power, UserPlus, Loader2 } from "lucide-react";

interface Center {
  id: string;
  name: string;
  email: string;
  status: string;
  centerId?: string;
  phone?: string;
}

interface CenterHeaderProps {
  center: Center;
  updatingStatus: boolean;
  onToggleStatus: () => void;
  onAddManager: () => void;
}

export default function CenterHeader({ center, updatingStatus, onToggleStatus, onAddManager }: CenterHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/admin/centers"
        className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest inline-flex"
      >
        ← Quay lại danh sách
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex gap-6 items-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Building size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {center.centerId}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                center.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}>
                {center.status === "Active" ? "Hoạt động" : "Ngừng hoạt động"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">{center.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-500 font-medium">
              <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <Mail size={12} className="text-blue-500" /> {center.email}
              </div>
              {center.phone && (
                <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <Shield size={12} className="text-purple-500" /> {center.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onToggleStatus}
            disabled={updatingStatus}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
              center.status === "Active"
                ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {updatingStatus ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
            {center.status === "Active" ? "Ngừng hoạt động" : "Kích hoạt"}
          </button>
          <button
            onClick={onAddManager}
            className="flex-1 md:flex-none bg-zinc-900 dark:bg-white dark:text-black text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-zinc-500/10"
          >
            <UserPlus size={16} />
            Thêm Quản lý
          </button>
        </div>
      </div>
    </div>
  );
}
