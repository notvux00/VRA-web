"use client";

import React, { useState } from "react";
import { X, User, Mail, Lock, Loader2, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { createParent } from "@/actions/center";

interface AddParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  centerId: string;
}

export default function AddParentModal({ isOpen, onClose, onSuccess, centerId }: AddParentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createParent(centerId, formData);
      if (result.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", password: "" });
      } else {
        setError(result.error || "Có lỗi xảy ra khi tạo tài khoản.");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Shield size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Thêm Phụ huynh</h3>
          </div>
          <button onClick={() => { if(success) onSuccess(); onClose(); }} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50 dark:border-green-500/5">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-zinc-900 dark:text-white">Tạo thành công!</h4>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">Tài khoản phụ huynh đã sẵn sàng. Họ có thể đăng nhập ngay bằng email và mật khẩu bạn đã thiết lập.</p>
            </div>
            
            <button 
              onClick={() => { onSuccess(); onClose(); }}
              className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 font-extrabold py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-zinc-500/10"
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Họ và tên</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Email liên lạc</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white"
                    placeholder="parent@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Mật khẩu khởi tạo</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>
                <p className="text-[10px] text-zinc-500 font-medium pl-1 italic">* Phụ huynh sẽ dùng email và mật khẩu này để đăng nhập.</p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl flex items-center gap-3 text-sm font-bold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-zinc-950 dark:bg-emerald-600 text-white font-extrabold py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Tạo tài khoản Phụ huynh"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
