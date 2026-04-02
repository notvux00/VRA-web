"use client";

import React, { useState, useEffect, use } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCenterDetails, addCenterManager, updateCenterStatus, deleteCenter } from "@/actions/auth";
import CenterHeader from "./_components/CenterHeader";
import CenterStatsPanel from "./_components/CenterStatsPanel";
import ManagerList from "./_components/ManagerList";
import AddManagerModal from "./_components/AddManagerModal";

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

  useEffect(() => { fetchData(); }, [id]);

  const handleToggleStatus = async () => {
    if (!center) return;
    setUpdatingStatus(true);
    const newStatus = center.status === "Active" ? "Inactive" : "Active";
    const res = await updateCenterStatus(id, newStatus);
    if (res.success) setCenter({ ...center, status: newStatus });
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
      setTimeout(() => { setIsAddModalOpen(false); setSuccess(""); fetchData(); }, 1500);
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
      <CenterHeader
        center={center}
        updatingStatus={updatingStatus}
        onToggleStatus={handleToggleStatus}
        onAddManager={() => setIsAddModalOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CenterStatsPanel center={center} onDelete={handleDeleteCenter} />
        <div className="lg:col-span-2">
          <ManagerList managers={managers} />
        </div>
      </div>

      <AddManagerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddManager}
        newManager={newManager}
        setNewManager={setNewManager}
        submitting={submitting}
        error={error}
        success={success}
      />
    </div>
  );
}
