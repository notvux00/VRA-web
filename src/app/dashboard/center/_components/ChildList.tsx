import React, { useState } from "react";
import { User, Plus, Calendar, Shield, MoreHorizontal, UserCheck, Loader2, Eye, ToggleLeft, ToggleRight, X } from "lucide-react";
import { assignExpertToChild, toggleChildStatus } from "@/app/actions/center";
import Link from "next/link";

interface ChildListProps {
  children: any[];
  expert: any[];
  onRefresh: () => void;
}

export default function ChildList({ children, expert, onRefresh }: ChildListProps) {
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  const handleAssign = async (childId: string) => {
    if (!selectedExpert) return;
    setSubmitting(true);
    try {
      const res = await assignExpertToChild(childId, selectedExpert);
      if (res.success) {
        setIsAssigning(null);
        setSelectedExpert("");
        onRefresh();
      } else {
        alert(res.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (childId: string, currentStatus: string) => {
    setTogglingStatus(childId);
    try {
      const res = await toggleChildStatus(childId, currentStatus);
      if (res.success) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingStatus(null);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden h-fit transition-all duration-300">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">Danh sách Trẻ em</h2>
          <p className="text-xs text-zinc-500 font-medium">Quản lý hồ sơ và phân công chuyên gia</p>
        </div>
        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/50 transition-all">
          {children.length} Trẻ
        </div>
      </div>
      
      <div className="p-1">
        {children.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {children.map((child) => (
              <div key={child.id} className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-all group ${child.status === 'Inactive' ? 'opacity-60 saturate-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <Link href={`/dashboard/center/children/${child.id}`} className="block">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-white dark:border-zinc-800 shadow-sm transition-all group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-purple-500/20">
                        <User size={20} />
                      </div>
                    </Link>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/dashboard/center/children/${child.id}`}>
                          <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">{child.name}</h4>
                        </Link>
                        {child.status === 'Inactive' && (
                          <span className="text-[10px] font-bold bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded">Ngưng hoạt động</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] sm:text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">{child.age} tuổi &bull; {child.gender === "male" ? "Nam" : "Nữ"}</span>
                        <span className="text-[10px] sm:text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/50">{child.condition}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                       <Link 
                        href={`/dashboard/center/children/${child.id}`}
                        className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Xem chi tiết"
                       >
                         <Eye size={18} />
                       </Link>
                       <button 
                        onClick={() => handleToggleStatus(child.id, child.status || "Active")}
                        disabled={togglingStatus === child.id}
                        className={`p-2 transition-colors ${child.status === 'Inactive' ? 'text-zinc-400 hover:text-emerald-500' : 'text-emerald-500 hover:text-zinc-400'}`}
                        title={child.status === 'Inactive' ? "Kích hoạt lại" : "Tạm dừng"}
                       >
                         {togglingStatus === child.id ? <Loader2 size={18} className="animate-spin" /> : (child.status === 'Inactive' ? <ToggleLeft size={18} /> : <ToggleRight size={18} />)}
                       </button>
                    </div>
                     <code className="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-800/10 group-hover:border-blue-400 transition-all">{child.linkCode}</code>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} className="text-zinc-400" />
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-tighter">Chuyên gia phụ trách</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {child.expert.ids?.length > 0 ? (
                      child.expert.ids.map((uid: string) => {
                        const Expert = expert.find(s => s.uid === uid);
                        return (
                          <div key={uid} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1 text-xs text-zinc-600 dark:text-zinc-300 font-medium hover:bg-white dark:hover:bg-zinc-700 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {Expert?.name || "Chưa rõ"}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[10px] text-zinc-400 italic font-medium py-1">Chưa được phân công chuyên gia</p>
                    )}
                    
                    {isAssigning === child.id ? (
                      <div className="flex items-center gap-2 mt-2 w-full animate-in slide-in-from-left-2 duration-300">
                        <select 
                          className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-zinc-200"
                          value={selectedExpert}
                          onChange={(e) => setSelectedExpert(e.target.value)}
                        >
                          <option value="">Chọn chuyên gia...</option>
                          {expert.filter(s => !child.expert.ids?.includes(s.uid) && s.status !== 'Inactive').map(s => (
                            <option key={s.uid} value={s.uid}>{s.name} ({s.specialization})</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleAssign(child.id)}
                          disabled={submitting || !selectedExpert}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md shadow-blue-500/10 h-8 flex items-center justify-center min-w-[60px]"
                        >
                          {submitting ? <Loader2 className="animate-spin" size={14} /> : "Lưu"}
                        </button>
                        <button 
                          onClick={() => setIsAssigning(null)}
                          className="text-zinc-500 hover:text-zinc-700 p-2 text-xs font-bold"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsAssigning(child.id)}
                        disabled={child.status === 'Inactive'}
                        className="flex items-center gap-1.5 py-1 px-3 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:text-blue-600 hover:border-blue-600 dark:hover:text-blue-400 dark:hover:border-blue-400 transition-all text-xs font-bold disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Plus size={12} /> Phân công
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-6 text-zinc-300 border-2 border-dashed border-zinc-100 dark:border-zinc-800 transform rotate-12">
              <User size={32} />
            </div>
            <h3 className="text-zinc-900 dark:text-white font-bold mb-1">Cơ sở dữ liệu trống</h3>
            <p className="text-xs text-zinc-400 max-w-[200px] font-medium leading-relaxed">Dữ liệu trẻ em thuộc trung tâm bạn sẽ hiển thị tại đây.</p>
          </div>
        )}
      </div>
    </div>
  );
}
