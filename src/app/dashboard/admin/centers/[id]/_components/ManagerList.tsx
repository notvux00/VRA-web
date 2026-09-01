import { Users, Key, Loader2, Search } from "lucide-react";
import React, { useState } from "react";

interface Manager {
  uid: string;
  name: string;
  email: string;
}

interface ManagerListProps {
  managers: Manager[];
}

export default function ManagerList({ managers }: ManagerListProps) {
  const [resetModal, setResetModal] = useState<{ open: boolean; uid: string; name: string }>({ open: false, uid: "", name: "" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const handleSendResetEmail = async (email: string) => {
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");
      await sendPasswordResetEmail(auth, email);
      alert(`Đã gửi email khôi phục mật khẩu thành công đến ${email}!`);
    } catch (error: unknown) {
      console.error(error);
      alert("Lỗi khi gửi email: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    try {
      const { resetUserPassword } = await import("@/actions/auth");
      const res = await resetUserPassword(resetModal.uid, newPassword);
      if (res.success) {
        alert("Đổi mật khẩu thành công!");
        setResetModal({ open: false, uid: "", name: "" });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(res.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const filteredManagers = managers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
      <div className="rounded-t-3xl p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20">
        <div className="flex items-center gap-3">
          <Users className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Quản lý trung tâm</h2>
        </div>
        <span className="text-[10px] font-black bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
          {managers.length} Thành viên
        </span>
      </div>

      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center relative max-w-sm">
          <Search className="absolute left-3 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm tên hoặc email quản lý..."
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 min-h-[200px]">
        {filteredManagers.map((manager, idx) => (
          <div key={manager.uid} className="p-6 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-white border border-zinc-200 dark:border-zinc-700">
                {manager.name[0]}
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  {manager.name}
                  {idx === 0 && searchQuery === "" && (
                    <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md uppercase font-black tracking-widest">Chủ sở hữu chính</span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 font-medium">{manager.email}</p>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(dropdownOpen === manager.uid ? null : manager.uid)}
                className="p-2 text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Quản lý mật khẩu"
              >
                <Key size={18} />
              </button>
              
              {dropdownOpen === manager.uid && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-10 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={() => {
                      setDropdownOpen(null);
                      setResetModal({ open: true, uid: manager.uid, name: manager.name });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    Đổi mật khẩu mới
                  </button>
                  <button 
                    onClick={() => {
                      setDropdownOpen(null);
                      handleSendResetEmail(manager.email);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    Reset mật khẩu
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredManagers.length === 0 && (
          <div className="p-6 text-center text-sm text-zinc-500">
            Không tìm thấy quản lý nào.
          </div>
        )}
      </div>

      {resetModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Đổi Mật Khẩu</h3>
            <p className="text-sm text-zinc-500 mb-4">
              Cho quản lý: <strong className="text-zinc-900 dark:text-white">{resetModal.name}</strong>
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <input 
                  type="text" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${confirmPassword && newPassword !== confirmPassword ? 'border-rose-500 focus:ring-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'} text-zinc-900 dark:text-white`}
                  required
                  minLength={6}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">Mật khẩu xác nhận không khớp!</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setResetModal({ open: false, uid: "", name: "" });
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={resetting || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {resetting ? <Loader2 size={14} className="animate-spin" /> : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
