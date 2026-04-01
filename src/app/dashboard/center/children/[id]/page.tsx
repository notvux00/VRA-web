"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Baby, Calendar, Shield, UserCheck, 
  History, Link as LinkIcon, Loader2, AlertCircle, 
  UserX, CheckCircle, Info
} from "lucide-react";
import Link from "next/link";
import { getChildDetail, getCenterExperts, unassignExpertFromChild } from "@/app/actions/center";

export default function ChildDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unassigning, setUnassigning] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [childRes] = await Promise.all([
        getChildDetail(id as string),
      ]);

      if (childRes.success && childRes.child) {
        setChild(childRes.child);
        const childData = childRes.child as any;
        const sRes = await getCenterExperts(childData.centerId);
        if (sRes.success) setExperts(sRes.experts || []);
      } else {
        setError(childRes.error || "Không tìm thấy thông tin trẻ");
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

  const handleUnassign = async (expertUid: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ chuyên gia này khỏi hồ sơ trẻ?")) return;
    
    setUnassigning(expertUid);
    try {
      const res = await unassignExpertFromChild(id as string, expertUid);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUnassigning(null);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 max-w-md mx-auto mt-20">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{error}</h3>
      <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Quay lại
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{child.name}</h1>
          <p className="text-zinc-500 font-medium flex items-center gap-2">
            <Baby size={14} /> Hồ sơ trẻ em &bull; {child.status === 'Active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Baby size={120} />
            </div>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2">Thông tin cơ bản</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Độ tuổi</p>
                  <p className="font-bold text-zinc-900 dark:text-white">{child.age} tuổi ({child.gender === 'male' ? 'Nam' : 'Nữ'})</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Tình trạng ASD</p>
                  <p className="font-bold text-zinc-900 dark:text-white">{child.condition}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Specialists & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Specialists List */}
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                 <UserCheck size={20} className="text-blue-600" />
                 Chuyên gia phụ trách
               </h3>
               <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                 {child.expertUids?.length || 0} Thành viên
               </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {child.expertUids?.length > 0 ? (
                child.expertUids.map((uid: string) => {
                  const expert = experts.find(s => s.uid === uid);
                  return (
                    <div key={uid} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-200 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-400">
                          {expert?.name?.charAt(0) || "T"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{expert?.name || "Đang tải..."}</p>
                          <p className="text-[10px] text-zinc-500 font-medium">{expert?.specialization}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleUnassign(uid)}
                        disabled={unassigning === uid}
                        className="p-2 text-zinc-300 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        {unassigning === uid ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 py-8 text-center bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm text-zinc-400 font-medium italic">Chưa có chuyên gia nào được phân công.</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Placeholder */}
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center relative overflow-hidden">
             <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                  <History size={32} />
                </div>
             </div>
             <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Lịch sử bài học & Tiến độ</h3>
             <p className="text-sm text-zinc-500 max-w-sm mx-auto font-medium">Báo cáo chi tiết về các buổi tập VR, dữ liệu đo lường và nhận xét của chuyên gia sẽ hiển thị tại đây.</p>
             
             <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40 grayscale">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col justify-end">
                    <div className="w-full bg-blue-400/20 h-full rounded-lg mb-2 overflow-hidden">
                       <div className="bg-blue-400 h-full w-[60%]" />
                    </div>
                    <div className="h-2 w-12 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                ))}
             </div>

             <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent pointer-events-none dark:from-zinc-950/90" />
             <div className="absolute bottom-10 left-0 right-0 z-10">
                <div className="bg-zinc-950 dark:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full inline-flex items-center gap-2">
                  <Info size={12} className="text-blue-400" />
                  Sắp ra mắt
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
