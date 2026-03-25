"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building, Users, Search, Plus, Loader2, MoreVertical, ExternalLink, Shield, Mail, Calendar, MapPin, Power, Trash2 } from "lucide-react";
import { getCenters, createCenter, updateCenterStatus, deleteCenter } from "@/app/actions/auth";

export default function ManageCentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCenter, setNewCenter] = useState({ 
    name: "", managerName: "", email: "", password: "",
    address: "", phone: "", centerEmail: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCenters = async () => {
    setLoading(true);
    const result = await getCenters();
    if (result.success) {
      setCenters(result.centers || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await createCenter(newCenter);
    if (result.success) {
      setIsModalOpen(false);
      setNewCenter({ 
        name: "", managerName: "", email: "", password: "",
        address: "", phone: "", centerEmail: ""
      });
      fetchCenters();
    } else {
      setError(result.error || "Không thể tạo trung tâm");
    }
    setSubmitting(false);
  };

  const handleToggleStatus = async (centerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const res = await updateCenterStatus(centerId, newStatus);
    if (res.success) {
      setCenters(centers.map(c => c.id === centerId ? { ...c, status: newStatus } : c));
    }
  };

  const handleDelete = async (centerId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trung tâm này? Hành động này không thể hoàn tác.")) {
      const res = await deleteCenter(centerId);
      if (res.success) {
        setCenters(centers.filter(c => c.id !== centerId));
      }
    }
  };

  const filteredCenters = centers.filter(center => 
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    center.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.centerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Trung tâm</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Quản lý danh sách các trung tâm trị liệu trên hệ thống.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          <span>Tạo Trung tâm</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email hoặc ID..."
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-tighter">
          <span>Tổng: {centers.length}</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-emerald-500">Hoạt động: {centers.filter(c => c.status === 'Active').length}</span>
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-zinc-500 font-medium">Đang tải dữ liệu trung tâm...</p>
        </div>
      ) : filteredCenters.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-20 text-center flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
            <Building className="text-zinc-400 w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Không tìm thấy trung tâm nào</h3>
          <p className="text-zinc-500 max-w-sm mt-2">
            {searchTerm ? `Không có kết quả nào khớp với "${searchTerm}". Hãy thử một từ khóa khác.` : "Bắt đầu bằng cách tạo tài khoản cho trung tâm trị liệu đầu tiên trên VRA."}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 text-blue-500 font-medium hover:underline flex items-center gap-2"
            >
              <Plus size={16} /> Tạo trung tâm ngay
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <div key={center.id} className="group bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/5 origin-center overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                  <Building size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleToggleStatus(center.id, center.status)}
                    title={center.status === 'Active' ? 'Ngừng hoạt động' : 'Kích hoạt'}
                    className={`p-2 rounded-lg border transition-all ${
                      center.status === 'Active' 
                        ? 'text-amber-500 hover:bg-amber-50 border-amber-100' 
                        : 'text-emerald-500 hover:bg-emerald-50 border-emerald-100'
                    }`}
                  >
                    <Power size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(center.id)}
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
                  <span><b>{center.therapistCount || 0}</b> Chuyên gia</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  center.status === 'Active' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {center.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                </span>
                <Link 
                  href={`/dashboard/admin/centers/${center.id}`}
                  className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 text-sm font-bold"
                >
                  Chi tiết <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Modal (Reused) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 bg-zinc-900 text-white flex justify-between items-center">
               <div>
                  <h3 className="text-xl font-bold">Thêm Trung tâm mới</h3>
                  <p className="text-zinc-400 text-xs mt-1">Khởi tạo tài khoản đối tác mới trên VRA.</p>
               </div>
               <Building size={32} className="text-zinc-700" />
            </div>
            
            <form onSubmit={handleCreateCenter} className="p-8 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl flex items-center gap-2">
                   {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Tên Trung tâm</label>
                <input 
                  type="text" required placeholder="Ví dụ: Trung tâm Hy Vọng"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-medium"
                  value={newCenter.name}
                  onChange={e => setNewCenter({...newCenter, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Địa chỉ</label>
                <input 
                  type="text" required placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-medium"
                  value={newCenter.address}
                  onChange={e => setNewCenter({...newCenter, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Số điện thoại</label>
                  <input 
                    type="tel" required placeholder="09xx xxx xxx"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-medium"
                    value={newCenter.phone}
                    onChange={e => setNewCenter({...newCenter, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Email Trung tâm</label>
                  <input 
                    type="email" required placeholder="contact@center.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-medium"
                    value={newCenter.centerEmail}
                    onChange={e => setNewCenter({...newCenter, centerEmail: e.target.value})}
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
                    onChange={e => setNewCenter({...newCenter, managerName: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Email đăng nhập</label>
                    <input 
                      type="email" required placeholder="manager@center.com"
                      className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                      value={newCenter.email}
                      onChange={e => setNewCenter({...newCenter, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Mật khẩu</label>
                    <input 
                      type="password" required placeholder="••••••••"
                      className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                      value={newCenter.password}
                      onChange={e => setNewCenter({...newCenter, password: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
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
      )}
    </div>
  );
}
