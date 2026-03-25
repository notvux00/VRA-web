"use client";

import React, { useState, useEffect, use } from "react";
import { 
  Building, Users, Shield, Mail, Calendar, 
  ArrowLeft, Plus, Loader2, UserPlus, 
  Trash2, CheckCircle2, AlertCircle, Power, 
  XCircle, ToggleLeft, ToggleRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCenterDetails, addCenterManager, updateCenterStatus, deleteCenter } from "@/app/actions/auth";

export default function CenterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [center, setCenter] = useState<any>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newManager, setNewManager] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const result = await getCenterDetails(id);
    if (result.success) {
      setCenter(result.center);
      setManagers(result.managers || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!center) return;
    setUpdatingStatus(true);
    const newStatus = center.status === 'Active' ? 'Inactive' : 'Active';
    const res = await updateCenterStatus(id, newStatus);
    if (res.success) {
      setCenter({ ...center, status: newStatus });
    }
    setUpdatingStatus(false);
  };

  const handleDeleteCenter = async () => {
    if (window.confirm("QUAN TRỌNG: Bạn có chắc chắn muốn xóa toàn bộ trung tâm này? Hành động này sẽ xóa tất cả dữ liệu liên quan và không thể hoàn tác.")) {
      const res = await deleteCenter(id);
      if (res.success) {
        router.push("/dashboard/admin/centers");
      } else {
        alert("Không thể xóa trung tâm: " + res.error);
      }
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    const result = await addCenterManager(id, newManager);
    if (result.success) {
      setSuccess("Đã thêm quản lý thành công!");
      setNewManager({ name: "", email: "", password: "" });
      setTimeout(() => {
        setIsAddModalOpen(false);
        setSuccess("");
        fetchData();
      }, 1500);
    } else {
      setError(result.error || "Không thể thêm quản lý");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-medium">Đang tải dữ liệu lâm sàng...</p>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Không tìm thấy trung tâm</h2>
        <Link href="/dashboard/admin/centers" className="text-blue-500 mt-4 block">Quay lại Danh bạ</Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-32">
      {/* Header & Back */}
      <div className="space-y-4">
        <Link 
          href="/dashboard/admin/centers" 
          className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest inline-flex"
        >
          <ArrowLeft size={14} />
          Quay lại danh sách
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
                    center.status === 'Active' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                  {center.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
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
              onClick={handleToggleStatus}
              disabled={updatingStatus}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
                center.status === 'Active' 
                  ? 'border-amber-200 text-amber-600 hover:bg-amber-50' 
                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {updatingStatus ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
              {center.status === 'Active' ? "Ngừng hoạt động" : "Kích hoạt"}
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none bg-zinc-900 dark:bg-white dark:text-black text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-zinc-500/10"
            >
              <UserPlus size={16} />
              Thêm Quản lý
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
             <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 px-1">Thống kê</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                   <span className="block text-2xl font-bold text-zinc-900 dark:text-white">{center.therapistCount || 0}</span>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Chuyên gia</span>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                   <span className="block text-2xl font-bold text-zinc-900 dark:text-white">{center.sessionCount || 0}</span>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Buổi tập VR</span>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
             <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-1">Thông tin chi tiết</h3>
             <div className="space-y-4 text-xs font-medium">
                <div className="flex justify-between py-2 border-b border-zinc-50 dark:border-zinc-800">
                   <span className="text-zinc-500">ID Hệ thống</span>
                   <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{center.centerId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-50 dark:border-zinc-800">
                   <span className="text-zinc-500">Ngày tham gia</span>
                   <span className="font-bold text-zinc-900 dark:text-white">{new Date(center.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-50 dark:border-zinc-800">
                   <span className="text-zinc-500">Số điện thoại</span>
                   <span className="font-bold text-zinc-900 dark:text-white">{center.phone || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1 py-2 border-b border-zinc-50 dark:border-zinc-800">
                   <span className="text-zinc-500">Địa chỉ</span>
                   <span className="font-bold text-zinc-900 dark:text-white leading-relaxed">{center.address || "Chưa có thông tin địa chỉ"}</span>
                </div>
                <div className="flex justify-between py-2">
                   <span className="text-zinc-500">Email liên hệ</span>
                   <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">{center.email}</span>
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
               onClick={handleDeleteCenter}
               className="w-full py-2.5 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all flex items-center justify-center gap-2"
             >
               <Trash2 size={14} />
               Xóa Trung tâm Vĩnh viễn
             </button>
          </div>
        </div>

        {/* Right Column: Manager Management */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={20} />
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Quản lý trung tâm</h2>
                </div>
                <span className="text-[10px] font-black bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{managers.length} Thành viên</span>
              </div>
              
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 min-h-[200px]">
                {managers.map((manager, idx) => (
                  <div key={manager.uid} className="p-6 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-white border border-zinc-200 dark:border-zinc-700">
                        {manager.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          {manager.name} 
                          {idx === 0 && <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md uppercase font-black tracking-widest">Chủ sở hữu chính</span>}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium">{manager.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Add Manager Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 bg-zinc-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Thêm Quản lý</h3>
                <p className="text-zinc-400 text-xs mt-1">Cấp quyền quản lý cho trung tâm này.</p>
              </div>
              <UserPlus size={32} className="text-zinc-700" />
            </div>
            
            <form onSubmit={handleAddManager} className="p-8 space-y-4">
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
                  onChange={e => setNewManager({...newManager, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Email</label>
                <input 
                  type="email" required placeholder="manager@center.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={newManager.email}
                  onChange={e => setNewManager({...newManager, email: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Mật khẩu</label>
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={newManager.password}
                  onChange={e => setNewManager({...newManager, password: e.target.value})}
                />
              </div>

              <div className="flex gap-3 mt-10">
                <button 
                  type="button" onClick={() => setIsAddModalOpen(false)}
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
      )}
    </div>
  );
}
