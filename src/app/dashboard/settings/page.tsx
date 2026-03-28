"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, Key, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile, updateUserPassword } from "@/app/actions/user";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function SettingsPage() {
  const { user } = useAuth();
  
  // Profile state
  const [name, setName] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsProfileLoading(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const result = await updateUserProfile(user.uid, { name });
      if (result.success) {
        // Refresh local user object to show new name immediately
        await user.reload();
        setProfileMessage({ type: "success", text: "Hồ sơ đã được cập nhật thành công!" });
      } else {
        setProfileMessage({ type: "error", text: result.error || "Có lỗi xảy ra khi cập nhật hồ sơ." });
      }
    } catch (error) {
      setProfileMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }

    setIsPasswordLoading(true);
    setPasswordMessage({ type: "", text: "" });

    try {
      // 1. Re-authenticate on the client first for security
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Call server action to update password via Admin SDK
      const result = await updateUserPassword(user.uid, newPassword);
      
      if (result.success) {
        setPasswordMessage({ type: "success", text: "Mật khẩu đã được thay đổi thành công!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: result.error || "Có lỗi xảy ra." });
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      if (error.code === "auth/wrong-password") {
        setPasswordMessage({ type: "error", text: "Mật khẩu hiện tại không chính xác." });
      } else {
        setPasswordMessage({ type: "error", text: "Xác thực thất bại. Vui lòng thử lại." });
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Cài đặt người dùng</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <User size={20} />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Thông tin cá nhân</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tên hiển thị</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 opacity-50">Địa chỉ Email (Không thể thay đổi)</label>
              <input 
                type="email" 
                value={user?.email || ""}
                disabled
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed"
              />
            </div>

            {profileMessage.text && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                profileMessage.type === "success" 
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}>
                {profileMessage.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {profileMessage.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isProfileLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isProfileLoading ? <Loader2 className="animate-spin" size={18} /> : "Lưu thay đổi"}
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Shield size={20} />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Bảo mật tài khoản</h2>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mật khẩu hiện tại</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-50 dark:border-zinc-800">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mật khẩu mới</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Xác nhận mật khẩu mới</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                required
              />
            </div>

            {passwordMessage.text && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                passwordMessage.type === "success" 
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}>
                {passwordMessage.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {passwordMessage.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isPasswordLoading}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isPasswordLoading ? <Loader2 className="animate-spin" size={18} /> : "Cập nhật mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
