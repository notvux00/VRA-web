import { Star, User, Eye, ToggleLeft, ToggleRight, Loader2, Key, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toggleExpertStatus } from "@/actions/center";

interface ExpertRosterProps {
  experts: any[];
  onRefresh: () => void;
}

export default function ExpertRoster({ experts, onRefresh }: ExpertRosterProps) {
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [resetModal, setResetModal] = useState<{ open: boolean; uid: string; name: string }>({ open: false, uid: "", name: "" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleToggleStatus = async (uid: string, currentStatus: string) => {
    setTogglingStatus(uid);
    try {
      const res = await toggleExpertStatus(uid, currentStatus);
      if (res.success) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingStatus(null);
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

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const handleSendResetEmail = async (email: string) => {
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");
      await sendPasswordResetEmail(auth, email);
      alert(`Đã gửi email khôi phục mật khẩu thành công đến ${email}!`);
    } catch (error: any) {
      console.error(error);
      alert("Lỗi khi gửi email: " + error.message);
    }
  };

  const filteredExperts = experts.filter(expert => 
    (expert.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (expert.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none h-fit transition-all duration-300">
      <div className="rounded-t-2xl p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">Đội ngũ Chuyên gia</h2>
        <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700/50">
          {experts.length} Thành viên
        </span>
      </div>
      
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center relative max-w-sm">
          <Search className="absolute left-3 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm tên hoặc email chuyên gia..."
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {filteredExperts.length > 0 ? (
          filteredExperts.map((expert) => (
            <div 
              key={expert.uid} 
              className={`group flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-white dark:hover:bg-zinc-800/60 transition-all duration-300 ${expert.status === 'Inactive' ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              <div className="flex items-center gap-4">
                <Link href={`/dashboard/center/experts/${expert.uid}`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold group-hover:scale-110 transition-transform">
                    <User size={18} />
                  </div>
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/center/experts/${expert.uid}`}>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">{expert.name}</h4>
                    </Link>
                    {expert.status === 'Inactive' && (
                      <span className="text-[10px] font-bold bg-zinc-200 text-zinc-600 px-1 py-0.5 rounded">Ngưng</span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-zinc-500 font-bold tracking-tight">
                    {expert.specialization} &bull; {expert.status === 'Inactive' ? "Ngưng hoạt động" : "Sẵn sàng"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-l border-zinc-200 dark:border-zinc-800 ml-1 pl-3 gap-1">
                   <div className="relative">
                     <button 
                      onClick={() => setDropdownOpen(dropdownOpen === expert.uid ? null : expert.uid)}
                      className="p-1.5 text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Quản lý mật khẩu"
                     >
                       <Key size={16} />
                     </button>
                     
                     {dropdownOpen === expert.uid && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-10 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <button 
                          onClick={() => {
                            setDropdownOpen(null);
                            setResetModal({ open: true, uid: expert.uid, name: expert.name });
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                        >
                          Đổi mật khẩu mới
                        </button>
                        <button 
                          onClick={() => {
                            setDropdownOpen(null);
                            handleSendResetEmail(expert.email);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                        >
                          Reset mật khẩu
                        </button>
                      </div>
                    )}
                   </div>
                   <Link 
                    href={`/dashboard/center/experts/${expert.uid}`}
                    className="p-1.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                   >
                     <Eye size={16} />
                   </Link>
                   <button 
                    onClick={() => handleToggleStatus(expert.uid, expert.status || "Active")}
                    disabled={togglingStatus === expert.uid}
                    className={`p-1.5 transition-colors ${expert.status === 'Inactive' ? 'text-zinc-400 hover:text-emerald-500' : 'text-emerald-500 hover:text-zinc-400'}`}
                   >
                     {togglingStatus === expert.uid ? <Loader2 size={16} className="animate-spin" /> : (expert.status === 'Inactive' ? <ToggleLeft size={18} /> : <ToggleRight size={18} />)}
                   </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-300 border-2 border-dashed border-zinc-200 dark:border-zinc-700">
              <User size={30} />
            </div>
            <p className="text-sm font-medium text-zinc-500 mb-1">Chưa có chuyên gia nào</p>
            <p className="text-xs text-zinc-400">Hãy thêm chuyên gia đầu tiên để bắt đầu quản lý.</p>
          </div>
        )}
      </div>
    </div>
    {resetModal.open && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Đổi Mật Khẩu</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Cho chuyên gia: <strong className="text-zinc-900 dark:text-white">{resetModal.name}</strong>
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
    </>
  );
}
