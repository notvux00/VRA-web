"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Stethoscope, UserPlus, Loader2, ArrowLeft } from "lucide-react";
import ExpertRoster from "../_components/ExpertRoster";
import AddExpertModal from "../_components/AddExpertModal";
import { getCenterExperts } from "@/actions/center";
import Link from "next/link";

export default function CenterExpertPage() {
  const { centerId, centerName } = useAuth();
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = async () => {
    if (!centerId) return;
    setLoading(true);
    try {
      const res = await getCenterExperts(centerId);
      if (res.success) setExperts(res.experts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [centerId]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <Stethoscope size={32} />
            Quản lý Chuyên gia
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Danh sách đội ngũ y bác sĩ thuộc {centerName}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black transition-all shadow-xl shadow-blue-500/20"
        >
          <UserPlus size={18} />
          <span>Thêm Chuyên gia mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <div className="max-w-4xl">
          <ExpertRoster experts={experts} onRefresh={fetchData} />
        </div>
      )}

      <AddExpertModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchData}
      />
    </div>
  );
}
