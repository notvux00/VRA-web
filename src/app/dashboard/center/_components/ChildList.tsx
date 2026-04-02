import React, { useState } from "react";
import { User, Plus, Calendar, Shield, MoreHorizontal, UserCheck, Loader2, Eye, ToggleLeft, ToggleRight, X, Heart } from "lucide-react";
import { assignExpertToChild, toggleChildStatus, linkParentToChild } from "@/actions/center";
import Link from "next/link";

interface ChildListProps {
  children: any[];
  expert: any[];
  parents: any[];
  onRefresh: () => void;
}

export default function ChildList({ children, expert, parents, onRefresh }: ChildListProps) {
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [isLinkingParent, setIsLinkingParent] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
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

  const handleLinkParent = async (childId: string) => {
    if (!selectedParent) return;
    setSubmitting(true);
    try {
      const res = await linkParentToChild(childId, selectedParent);
      if (res.success) {
        setIsLinkingParent(null);
        setSelectedParent("");
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
          <p className="text-xs text-zinc-500 font-medium">Quản lý hồ sơ và kết nối nhân sự</p>
        </div>
        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50 transition-all">
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
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/40 dark:to-blue-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-white dark:border-zinc-800 shadow-sm transition-all group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-emerald-500/20">
                        <User size={20} />
                      </div>
                    </Link>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/dashboard/center/children/${child.id}`}>
                          <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">{child.name}</h4>
                        </Link>
                        {child.status === 'Inactive' && (
                          <span className="text-[10px] font-bold bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded">Ngưng hoạt động</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] sm:text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">{child.age} tuổi &bull; {child.gender === "male" ? "Nam" : "Nữ"}</span>
                        <span className="text-[10px] sm:text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/50">{child.condition}</span>
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
                  </div>
                </div>

                {/* Assignment & Linkage Section */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Expert Assignment Row */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} className="text-zinc-400" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Chuyên gia phụ trách</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {child.expertUids?.length > 0 ? (
                        child.expertUids.map((uid: string) => {
                          const Exp = expert.find(s => s.uid === uid);
                          return (
                            <div key={uid} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1 text-[10px] text-zinc-600 dark:text-zinc-300 font-medium">
                              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                              {Exp?.name || "Chuyên gia"}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[10px] text-zinc-400 italic">Chưa gán</p>
                      )}
                      
                      {isAssigning === child.id ? (
                        <div className="flex items-center gap-1 mt-1 w-full animate-in slide-in-from-left-2 duration-300">
                          <select 
                            className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] p-1.5 outline-none transition-all dark:text-zinc-200"
                            value={selectedExpert}
                            onChange={(e) => setSelectedExpert(e.target.value)}
                          >
                            <option value="">Chọn...</option>
                            {expert.filter(s => !child.expertUids?.includes(s.uid) && s.status !== 'Inactive').map(s => (
                              <option key={s.uid} value={s.uid}>{s.name}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleAssign(child.id)}
                            disabled={submitting || !selectedExpert}
                            className="bg-zinc-950 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold"
                          >
                            {submitting ? <Loader2 size={12} className="animate-spin" /> : "Gán"}
                          </button>
                          <button onClick={() => setIsAssigning(null)} className="text-zinc-400"><X size={14} /></button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsAssigning(child.id)}
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          + Gán Chuyên gia
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Parent Linkage Row */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Heart size={14} className="text-zinc-400" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Phụ huynh liên kết</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {child.parentUid ? (
                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full px-3 py-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                          {parents.find(p => p.uid === child.parentUid)?.name || "Phụ huynh"}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-400 italic">Chưa liên kết</p>
                      )}

                      {isLinkingParent === child.id ? (
                        <div className="flex items-center gap-1 mt-1 w-full animate-in slide-in-from-left-2 duration-300">
                          <select 
                            className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] p-1.5 outline-none transition-all dark:text-zinc-200"
                            value={selectedParent}
                            onChange={(e) => setSelectedParent(e.target.value)}
                          >
                            <option value="">Chọn phụ huynh...</option>
                            {parents.filter(p => child.parentUid !== p.uid).map(p => (
                              <option key={p.uid} value={p.uid}>{p.name}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleLinkParent(child.id)}
                            disabled={submitting || !selectedParent}
                            className="bg-emerald-600 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold"
                          >
                            {submitting ? <Loader2 size={12} className="animate-spin" /> : "Liên kết"}
                          </button>
                          <button onClick={() => setIsLinkingParent(null)} className="text-zinc-400"><X size={14} /></button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsLinkingParent(child.id)}
                          className="text-[10px] font-bold text-emerald-600 hover:underline"
                        >
                          {child.parentUid ? "/ Đổi Phụ huynh" : "+ Kết nối"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-6 text-zinc-300 border-2 border-dashed border-zinc-100 dark:border-zinc-800 transform rotate-12">
              <Shield size={32} />
            </div>
            <h3 className="text-zinc-900 dark:text-white font-bold mb-1">Cơ sở dữ liệu trống</h3>
            <p className="text-xs text-zinc-400 max-w-[200px] font-medium leading-relaxed">Dữ liệu trẻ em thuộc trung tâm bạn sẽ hiển thị tại đây.</p>
          </div>
        )}
      </div>
    </div>
  );
}
