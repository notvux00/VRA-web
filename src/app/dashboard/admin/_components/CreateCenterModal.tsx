import React from "react";
import { Building, Loader2, Plus } from "lucide-react";

interface NewCenterData {
  name: string;
  managerName: string;
  email: string;
  password: string;
  address: string;
  phone: string;
  centerEmail: string;
}

interface CreateCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newCenter: NewCenterData;
  setNewCenter: (data: NewCenterData) => void;
  submitting: boolean;
  error: string;
}

export default function CreateCenterModal({
  isOpen, onClose, onSubmit, newCenter, setNewCenter, submitting, error
}: CreateCenterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-8 bg-zinc-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Thêm Trung tâm mới</h3>
            <p className="text-zinc-400 text-xs mt-1">Khởi tạo tài khoản đối tác mới trên VRA.</p>
          </div>
          <Building size={32} className="text-zinc-700" />
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl flex items-center gap-2">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Tên Trung tâm</label>
            <input
              type="text" required placeholder="Ví dụ: Trung tâm Hy Vọng"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-medium"
              value={newCenter.name}
              onChange={e => setNewCenter({ ...newCenter, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Địa chỉ</label>
            <input
              type="text" required placeholder="Số nhà, đường, phường/xã, quận/huyện..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-medium"
              value={newCenter.address}
              onChange={e => setNewCenter({ ...newCenter, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Số điện thoại</label>
              <input
                type="tel" required placeholder="09xx xxx xxx"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-medium"
                value={newCenter.phone}
                onChange={e => setNewCenter({ ...newCenter, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Email Trung tâm</label>
              <input
                type="email" required placeholder="contact@center.com"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-medium"
                value={newCenter.centerEmail}
                onChange={e => setNewCenter({ ...newCenter, centerEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4 shadow-inner">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tài khoản Quản lý</h4>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Tên Quản lý</label>
              <input
                type="text" required placeholder="Họ và tên chủ sở hữu"
                className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                value={newCenter.managerName}
                onChange={e => setNewCenter({ ...newCenter, managerName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Email đăng nhập</label>
                <input
                  type="email" required placeholder="manager@center.com"
                  className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                  value={newCenter.email}
                  onChange={e => setNewCenter({ ...newCenter, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Mật khẩu</label>
                <input
                  type="password" required placeholder="••••••••"
                  className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                  value={newCenter.password}
                  onChange={e => setNewCenter({ ...newCenter, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-zinc-400 hover:text-zinc-600 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={submitting}
              className="flex-1 px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              <span>{submitting ? "Đang tạo..." : "Xác nhận"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
