"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Baby, UserPlus, Loader2, ArrowLeft, Search } from "lucide-react";
import ChildList from "../_components/ChildList";
import AddChildModal from "../_components/AddChildModal";
import { getCenterChildren, getCenterExperts, getCenterParents } from "@/app/actions/center";
import Link from "next/link";

export default function CenterChildrenPage() {
  const { centerId, centerName } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    if (!centerId) return;
    setLoading(true);
    try {
      const [childRes, expertRes, parentRes] = await Promise.all([
        getCenterChildren(centerId),
        getCenterExperts(centerId),
        getCenterParents(centerId)
      ]);
      if (childRes.success) setChildren(childRes.children || []);
      if (expertRes.success) setExperts(expertRes.experts || []);
      if (parentRes.success) setParents(parentRes.parents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [centerId]);

  const filteredChildren = children.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.linkCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <Baby size={32} />
            Quản lý Trẻ em
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Theo dõi hồ sơ và điều phối chuyên gia cho {centerName}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black transition-all shadow-xl shadow-purple-500/20"
        >
          <UserPlus size={18} />
          <span>Thêm Hồ sơ Trẻ em</span>
        </button>
      </div>

      <div className="flex items-center relative max-w-md">
        <Search className="absolute left-3 text-zinc-400" size={18} />
        <input 
          type="text" 
          placeholder="Tìm tên trẻ..."
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      ) : (
        <div className="w-full">
          <ChildList children={filteredChildren} expert={experts} parents={parents} onRefresh={fetchData} />
        </div>
      )}

      <AddChildModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchData}
      />
    </div>
  );
}
