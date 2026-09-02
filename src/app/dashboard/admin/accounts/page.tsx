"use client";

import React, { useState, useEffect } from "react";
import { getAdminAccounts, resetUserPassword } from "@/actions/auth";
import { Loader2, Users, Key, Search } from "lucide-react";

interface AdminUser { uid: string; name?: string; email: string; role: string; [key: string]: unknown; }

export default function AdminAccountsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [resetModal, setResetModal] = useState<{ open: boolean; uid: string; name: string; role: string }>({
    open: false, uid: "", name: "", role: ""
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [createModal, setCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "", phone: "" });
  const [creating, setCreating] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const adminRes = await getAdminAccounts();
    if (adminRes.success) setAdmins((adminRes.admins || []) as unknown as AdminUser[]);
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchData(false));
  }, []);

  const handleSendResetEmail = async (email: string) => {
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");
      await sendPasswordResetEmail(auth, email);
      setMessage({ text: `Đã gửi email khôi phục tới ${email}`, type: "success" });
    } catch (error: unknown) {
      console.error(error);
      setMessage({ text: "Lỗi gửi email: " + (error instanceof Error ? error.message : String(error)), type: "error" });
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    setMessage({ text: "", type: "" });
    const res = await resetUserPassword(resetModal.uid, newPassword);
    if (res.success) {
      setMessage({ text: "Đổi mật khẩu thành công!", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setResetModal({ ...resetModal, open: false }), 2000);
    } else {
      setMessage({ text: res.error || "Có lỗi xảy ra", type: "error" });
    }
    setResetting(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage({ text: "", type: "" });
    
    try {
      const { createAdminAccount } = await import("@/actions/auth");
      const res = await createAdminAccount(newAdmin);
      if (res.success) {
        setMessage({ text: "Tạo tài khoản Admin thành công!", type: "success" });
        setNewAdmin({ name: "", email: "", password: "", phone: "" });
        setTimeout(() => {
          setCreateModal(false);
          fetchData();
        }, 1500);
      } else {
        setMessage({ text: res.error || "Có lỗi xảy ra", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Lỗi hệ thống", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const filteredAdmins = admins.filter(a => 
    (a.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Quản lý Tài khoản</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Danh sách quản trị viên hệ thống.</p>
        </div>
        <button 
          onClick={() => { setCreateModal(true); setMessage({ text: "", type: "" }); }}
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-zinc-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
        >
          + Thêm Quản trị viên
        </button>
      </div>
      
      <div className="flex items-center relative max-w-md">
        <Search className="absolute left-3 text-zinc-400" size={18} />
        <input 
          type="text" 
          placeholder="Tìm tên hoặc email quản trị viên..."
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* System Admins */}
        <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">System Admins</h2>
          </div>
          
          <div className="space-y-3">
            {filteredAdmins.map(admin => (
              <div key={admin.uid} className="flex justify-between items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">{admin.name || "N/A"}</p>
                  <p className="text-sm text-zinc-500">{admin.email}</p>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(dropdownOpen === admin.uid ? null : admin.uid)}
                    className="p-2 text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                    title="Quản lý mật khẩu"
                  >
                    <Key size={16} />
                  </button>
                  
                  {dropdownOpen === admin.uid && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-10 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <button 
                        onClick={() => {
                          setDropdownOpen(null);
                          setResetModal({ open: true, uid: admin.uid, name: admin.name || admin.email, role: "admin" });
                          setMessage({ text: "", type: "" });
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        Đổi mật khẩu mới
                      </button>
                      <button 
                        onClick={() => {
                          setDropdownOpen(null);
                          handleSendResetEmail(admin.email);
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
            {filteredAdmins.length === 0 && <p className="text-zinc-500 text-sm italic">Không có quản trị viên nào phù hợp.</p>}
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Đổi Mật Khẩu</h3>
            <p className="text-sm text-zinc-500 mb-4">
              Đặt lại mật khẩu cho: <strong className="text-zinc-900 dark:text-white">{resetModal.name}</strong>
            </p>
            
            <form onSubmit={handleResetSubmit} className="space-y-4">
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

              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setResetModal({ ...resetModal, open: false });
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
                  {resetting && <Loader2 size={14} className="animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {createModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Thêm Quản Trị Viên</h3>
            <p className="text-sm text-zinc-500 mb-6">Tạo tài khoản System Admin mới cho hệ thống.</p>
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Họ và Tên</label>
                <input 
                  type="text" 
                  value={newAdmin.name}
                  onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
                <input 
                  type="email" 
                  value={newAdmin.email}
                  onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Số điện thoại (Tùy chọn)</label>
                <input 
                  type="text" 
                  value={newAdmin.phone}
                  onChange={e => setNewAdmin({...newAdmin, phone: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Mật khẩu</label>
                <input 
                  type="text" 
                  value={newAdmin.password}
                  onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  required
                  minLength={6}
                />
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
