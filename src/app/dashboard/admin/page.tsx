"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { getCenters, createCenter, getGlobalStats, updateCenterStatus, deleteCenter } from "@/app/actions/auth";
import StatCards from "./_components/StatCards";
import CentersTable from "./_components/CentersTable";
import CreateCenterModal from "./_components/CreateCenterModal";

const EMPTY_CENTER = { name: "", managerName: "", email: "", password: "", address: "", phone: "", centerEmail: "" };

export default function AdminDashboard() {
  const [centers, setCenters] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCenters: 0, totalLessons: 0, totalSessions: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCenter, setNewCenter] = useState(EMPTY_CENTER);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [centersRes, statsRes] = await Promise.all([getCenters(), getGlobalStats()]);
    if (centersRes.success) setCenters(centersRes.centers || []);
    if (statsRes.success) setStats(statsRes.stats);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await createCenter(newCenter);
    if (result.success) {
      setIsModalOpen(false);
      setNewCenter(EMPTY_CENTER);
      fetchData();
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
      if (res.success) {
        setCenters(centers.filter(c => c.id !== centerId));
        fetchData();
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Tổng quan</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Theo dõi hoạt động và quản lý các trung tâm trên hệ thống.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} />
          <span>Tạo Trung tâm</span>
        </button>
      </div>

      <StatCards stats={stats} loading={loading} />
      <CentersTable centers={centers} loading={loading} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />

      <CreateCenterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleOnboard}
        newCenter={newCenter}
        setNewCenter={setNewCenter}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}
