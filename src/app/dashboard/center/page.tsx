"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, UserPlus, Plus, Loader2 } from "lucide-react";
import CenterOverviewStats from "./_components/CenterOverviewStats";
import TherapistRoster from "./_components/TherapistRoster";
import ChildList from "./_components/ChildList";
import AddTherapistModal from "./_components/AddTherapistModal";
import AddChildModal from "./_components/AddChildModal";
import { getCenterStats, getCenterStaff, getCenterChildren } from "@/app/actions/center";

export default function CenterDashboard() {
  const { centerName, centerId } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddTherapistOpen, setIsAddTherapistOpen] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);

  const fetchData = async () => {
    if (!centerId) return;
    setLoading(true);
    try {
      const [statsRes, staffRes, childrenRes] = await Promise.all([
        getCenterStats(centerId),
        getCenterStaff(centerId),
        getCenterChildren(centerId)
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (staffRes.success) setStaff(staffRes.staff || []);
      if (childrenRes.success) setChildren(childrenRes.children || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [centerId]);

  if (loading && !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Tổng quan Trung tâm</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{centerName || "Trung tâm Trị liệu VRA"}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsAddChildOpen(true)}
            className="bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>Thêm trẻ em</span>
          </button>
          <button 
            onClick={() => setIsAddTherapistOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            <UserPlus size={16} />
            <span>Thêm chuyên gia</span>
          </button>
        </div>
      </div>

      <CenterOverviewStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TherapistRoster staff={staff} onRefresh={fetchData} />
        <ChildList children={children} staff={staff} onRefresh={fetchData} />
      </div>

      <AddTherapistModal 
        isOpen={isAddTherapistOpen} 
        onClose={() => setIsAddTherapistOpen(false)} 
        onSuccess={fetchData}
      />
      
      <AddChildModal 
        isOpen={isAddChildOpen} 
        onClose={() => setIsAddChildOpen(false)} 
        onSuccess={fetchData}
      />
    </div>
  );
}
