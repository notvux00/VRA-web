import React from "react";
import { UserPlus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface NewManagerData {
  name: string;
  email: string;
  password: string;
}

interface AddManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newManager: NewManagerData;
  setNewManager: (data: NewManagerData) => void;
  submitting: boolean;
  error: string;
  success: string;
}

export default function AddManagerModal({
  isOpen, onClose, onSubmit, newManager, setNewManager, submitting, error, success
}: AddManagerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-8 bg-zinc-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Thêm Quản lý</h3>
            <p className="text-zinc-400 text-xs mt-1">Cấp quyền quản lý cho trung tâm này.</p>
          </div>
          <UserPlus size={32} className="text-zinc-700" />
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-3 rounded-xl flex items-center gap-2 font-bold uppercase">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] p-3 rounded-xl flex items-center gap-2 font-bold uppercase">
              <CheckCircle2 size={14} /> {success}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Họ và Tên</label>
            <input
              type="text" required placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={newManager.name}
              onChange={e => setNewManager({ ...newManager, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Email</label>
            <input
              type="email" required placeholder="manager@center.com"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={newManager.email}
              onChange={e => setNewManager({ ...newManager, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Mật khẩu</label>
            <input
              type="password" required placeholder="••••••••"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={newManager.password}
              onChange={e => setNewManager({ ...newManager, password: e.target.value })}
            />
          </div>

          <div className="flex gap-3 mt-10">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-3 text-xs font-black text-zinc-400 hover:text-zinc-600 transition-all uppercase tracking-widest"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={submitting}
              className="flex-1 px-4 py-3 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              <span>{submitting ? "..." : "Thêm quản lý"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
