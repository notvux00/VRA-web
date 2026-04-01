"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck, UserPlus, Loader2, Search } from "lucide-react";
import ParentList from "../_components/ParentList";
import AddParentModal from "../_components/AddParentModal";
import { getCenterParents, getCenterChildren } from "@/app/actions/center";

export default function CenterParentsPage() {
  const { centerId, centerName } = useAuth();
  const [parents, setParents] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    if (!centerId) return;
    setLoading(true);
    try {
      const [parentRes, childRes] = await Promise.all([
        getCenterParents(centerId),
        getCenterChildren(centerId)
      ]);
      if (parentRes.success) setParents(parentRes.parents || []);
      if (childRes.success) setChildren(childRes.children || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [centerId]);

  const filteredParents = parents.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <ShieldCheck size={32} />
            Quản lý Phụ huynh
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Cấp tài khoản và hỗ trợ liên kết cho phụ huynh tại {centerName}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black transition-all shadow-xl shadow-emerald-500/20"
        >
          <UserPlus size={18} />
          <span>Cấp tài khoản Phụ huynh</span>
        </button>
      </div>

      <div className="flex items-center relative max-w-md">
        <Search className="absolute left-3 text-zinc-400" size={18} />
        <input 
          type="text" 
          placeholder="Tìm tên phụ huynh hoặc email..."
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : (
        <div className="w-full">
          <ParentList parents={filteredParents} children={children} onRefresh={fetchData} />
        </div>
      )}

      {centerId && (
        <AddParentModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={fetchData}
          centerId={centerId}
        />
      )}
    </div>
  );
}
