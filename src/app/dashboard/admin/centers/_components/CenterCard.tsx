import Link from "next/link";
import { Building, Users, Mail, Power, Trash2, ExternalLink } from "lucide-react";

interface Center {
  id: string;
  name: string;
  email: string;
  status: string;
  centerId?: string;
  expertCount?: number;
}

interface CenterCardProps {
  center: Center;
  onToggleStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function CenterCard({ center, onToggleStatus, onDelete }: CenterCardProps) {
  return (
    <div className="group bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/5 origin-center overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
          <Building size={24} />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleStatus(center.id, center.status)}
            title={center.status === "Active" ? "Ngừng hoạt động" : "Kích hoạt"}
            className={`p-2 rounded-lg border transition-all ${
              center.status === "Active"
                ? "text-amber-500 hover:bg-amber-50 border-amber-100"
                : "text-emerald-500 hover:bg-emerald-50 border-emerald-100"
            }`}
          >
            <Power size={14} />
          </button>
          <button
            onClick={() => onDelete(center.id)}
            title="Xóa trung tâm"
            className="p-2 text-red-500 hover:bg-red-50 border border-red-100 rounded-lg transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
          {center.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-800 w-fit px-2 py-0.5 rounded-lg">
          <span className="uppercase tracking-widest">{center.centerId || "CHƯA CÓ ID"}</span>
        </div>
      </div>

      <div className="space-y-3 py-4 border-y border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Mail size={16} className="shrink-0 text-zinc-400" />
          <span className="truncate">{center.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Users size={16} className="shrink-0 text-zinc-400" />
          <span><b>{center.expertCount || 0}</b> Chuyên gia</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
          center.status === "Active"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
            : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20"
        }`}>
          {center.status === "Active" ? "Hoạt động" : "Ngừng hoạt động"}
        </span>
        <Link
          href={`/dashboard/admin/centers/${center.id}`}
          className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 text-sm font-bold"
        >
          Chi tiết <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  );
}
