"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Star, Briefcase, Mail, Shield, 
  Baby, History, Loader2, AlertCircle, Info,
  TrendingUp, Award, UserCheck, Calendar
} from "lucide-react";
import Link from "next/link";
import { getExpertDetail, toggleExpertStatus } from "@/actions/center";

export default function ExpertDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<{ expert: any, assignedChildren: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingStatus, setTogglingStatus] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getExpertDetail(id as string);
      if (res.success) {
        setData({ expert: res.expert, assignedChildren: res.assignedChildren || [] });
      } else {
        setError(res.error || "Không tìm thấy thông tin chuyên gia");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!data?.expert) return;
    setTogglingStatus(true);
    try {
      const res = await toggleExpertStatus(id as string, data.expert.status || "Active");
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (error || !data) return (
    <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 max-w-md mx-auto mt-20">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{error}</h3>
      <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Quay lại
      </button>
    </div>
  );

  const { expert, assignedChildren } = data;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{expert.name}</h1>
            <p className="text-zinc-500 font-bold flex items-center gap-2 text-sm">
               {expert.specialization} &bull; {expert.status === 'Active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleToggleStatus}
          disabled={togglingStatus}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            expert.status === 'Active' 
              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400' 
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400'
          }`}
        >
          {togglingStatus ? <Loader2 size={16} className="animate-spin" /> : (expert.status === 'Active' ? 'Tạm dừng' : 'Kích hoạt lại')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden relative">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2">Thông tin Chuyên gia</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Mail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Liên hệ</p>
                  <p className="font-bold text-zinc-900 dark:text-white truncate text-sm">{expert.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Award size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Trạng thái hỗ trợ</p>
                  <p className="font-bold text-zinc-900 dark:text-white">{expert.status === 'Active' ? 'Sẵn sàng' : 'Tạm dừng/Vắng mặt'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Children */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Baby size={20} className="text-purple-600" />
                  Trẻ em đang phụ trách
                </h3>
                <span className="text-[10px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-800/50">
                  {assignedChildren.length} Trẻ
                </span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {assignedChildren.length > 0 ? (
                 assignedChildren.map((child) => (
                   <Link key={child.id} href={`/dashboard/center/children/${child.id}`} className="group p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-purple-200 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center font-bold">
                            {child.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 transition-colors">{child.name}</p>
                            <p className="text-[10px] text-zinc-400 font-medium">{child.age} tuổi &bull; {child.condition}</p>
                         </div>
                      </div>
                      <ArrowLeft size={16} className="text-zinc-300 group-hover:text-purple-400 rotate-180 transition-all" />
                   </Link>
                 ))
               ) : (
                 <div className="col-span-2 py-12 text-center bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm text-zinc-400 font-medium italic">Hiện chưa phụ trách trẻ nào.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
