"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Baby, UserPlus, Loader2, ArrowLeft, Search } from "lucide-react";
import ChildList from "../_components/ChildList";
import AddChildModal from "../_components/AddChildModal";
import { getCenterChildren, getCenterExperts } from "@/app/actions/center";
import Link from "next/link";

export default function CenterChildrenPage() {
  const { centerId, centerName } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    if (!centerId) return;
    setLoading(true);
    try {
      const [childRes, expertRes] = await Promise.all([
        getCenterChildren(centerId),
        getCenterExperts(centerId)
      ]);
      if (childRes.success) setChildren(childRes.children || []);
      if (expertRes.success) setExperts(expertRes.experts || []);
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
          placeholder="Tìm tên trẻ hoặc mã Link Code..."
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <ChildList children={filteredChildren} expert={experts} onRefresh={fetchData} />
          
          {/* Quick Info Box */}
          <div className="hidden xl:block bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-100 dark:border-purple-800/30 rounded-3xl p-8 sticky top-24">
             <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-4">Gợi ý Quản lý mẫu</h3>
             <ul className="space-y-4">
                <li className="flex gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                   <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">1</div>
                   Gửi **Link Code** cho phụ huynh để họ kết nối tài khoản và nhận báo cáo.
                </li>
                <li className="flex gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                   <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">2</div>
                   Mỗi trẻ có thể được phụ trách bởi nhiều chuyên gia (ABA, OT, etc.).
                </li>
                <li className="flex gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                   <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">3</div>
                   Link Code có hiệu lực trong **48 giờ**. Sau thời gian này, hãy tạo mã mới trong trang chi tiết.
                </li>
             </ul>
          </div>
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
