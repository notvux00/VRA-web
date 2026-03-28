"use client";

import React, { useState, useEffect } from "react";
import { Building, Search, Plus, Loader2 } from "lucide-react";
import { getCenters, createCenter, updateCenterStatus, deleteCenter } from "@/app/actions/auth";
import CenterCard from "./_components/CenterCard";
import CreateCenterModal from "../_components/CreateCenterModal";

const EMPTY_CENTER = { name: "", managerName: "", email: "", password: "", address: "", phone: "", centerEmail: "" };

export default function ManageCentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCenter, setNewCenter] = useState(EMPTY_CENTER);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCenters = async () => {
    setLoading(true);
    const result = await getCenters();
    if (result.success) setCenters(result.centers || []);
    setLoading(false);
  };

  useEffect(() => { fetchCenters(); }, []);

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await createCenter(newCenter);
    if (result.success) {
      setIsModalOpen(false);
      setNewCenter(EMPTY_CENTER);
      fetchCenters();
    } else {
      setError(result.error || "Không thể tạo trung tâm");
    }
    setSubmitting(false);
  };

  const handleToggleStatus = async (centerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const res = await updateCenterStatus(centerId, newStatus);
    if (res.success) {
      setCenters(centers.map(c => c.id === centerId ? { ...c, status: newStatus } : c));
    }
  };

  const handleDelete = async (centerId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trung tâm này? Hành động này không thể hoàn tác.")) {
      const res = await deleteCenter(centerId);
      if (res.success) setCenters(centers.filter(c => c.id !== centerId));
    }
  };

  const filteredCenters = centers.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.centerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
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

      {/* Search & Stats Bar */}
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
          <span className="text-emerald-500">Hoạt động: {centers.filter(c => c.status === "Active").length}</span>
        </div>
      </div>

      {/* Centers Grid */}
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
            {searchTerm ? `Không có kết quả nào khớp với "${searchTerm}".` : "Bắt đầu bằng cách tạo tài khoản cho trung tâm trị liệu đầu tiên trên VRA."}
          </p>
          {!searchTerm && (
            <button onClick={() => setIsModalOpen(true)} className="mt-8 text-blue-500 font-medium hover:underline flex items-center gap-2">
              <Plus size={16} /> Tạo trung tâm ngay
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <CenterCard key={center.id} center={center} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <CreateCenterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCenter}
        newCenter={newCenter}
        setNewCenter={setNewCenter}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}
