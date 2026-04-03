"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Baby, Calendar, Shield, UserCheck, 
  History, Link as LinkIcon, Loader2, AlertCircle, 
  PlayCircle, Scale, Ruler, Activity, Info
} from "lucide-react";
import Link from "next/link";
import { getAssignedChildDetail } from "@/actions/expert";
import { useAuth } from "@/contexts/AuthContext";
import AlertProfileEditor from "./_components/AlertProfileEditor";
import SessionHistory from "./_components/SessionHistory";

export default function ExpertChildDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid || !id) return;
      try {
        const res = await getAssignedChildDetail(user.uid, id as string);
        if (res.success) {
          setChild(res.child);
        } else {
          setError(res.error || "Không tìm thấy thông tin trẻ");
        }
      } catch (err) {
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchData();
    }
  }, [id, user?.uid, authLoading]);

  if (authLoading || loading) return (
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
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{child.name}</h1>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                child.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700'
              }`}>
                {child.status === 'Active' ? 'Đang hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
            <p className="text-zinc-500 font-medium flex items-center gap-2 mt-0.5">
              <Baby size={14} className="text-blue-500" /> ID: {child.id} &bull; {child.age} tuổi &bull; {child.gender === 'male' ? 'Nam' : 'Nữ'}
            </p>
          </div>
        </div>

        <Link 
          href={`/dashboard/expert/lessons?childId=${child.id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-sm font-black transition-all shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95"
        >
          <PlayCircle size={20} />
          BẮT ĐẦU BUỔI TẬP VR
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Metrics & Basic Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Baby size={100} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-70">Chỉ số sinh trắc & Cấu hình hỗ trợ</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <MetricItem icon={Ruler} label="Chiều cao" value={`${child.height_cm || "--"} cm`} />
              <MetricItem icon={Scale} label="Cân nặng" value={`${child.weight_kg || "--"} kg`} />
              <MetricItem icon={Activity} label="Nhạy cảm âm thanh" value={`${child.sound_sensitivity || "3"}/5`} />
              <MetricItem icon={History} label="Tập trung" value={`${child.attention_span_min || "--"} p`} />
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">Chẩn đoán sơ bộ</p>
              <p className="text-sm font-bold leading-relaxed">{child.condition}</p>
              {child.diagnosis_notes && (
                <p className="text-xs mt-2 opacity-80 italic line-clamp-3">"{child.diagnosis_notes}"</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
             <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
               <Info size={14} className="text-blue-500" /> Tác nhân gây lo âu
             </h4>
             <div className="flex flex-wrap gap-2">
                {child.anxiety_triggers && child.anxiety_triggers.length > 0 ? (
                  child.anxiety_triggers.map((t: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      {t}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 italic">Chưa có thông tin ghi nhận.</p>
                )}
             </div>
          </div>
        </div>

        {/* Center/Right: Alert Profile & History */}
        <div className="lg:col-span-8 space-y-8">
           <AlertProfileEditor 
             childId={child.id} 
             initialProfile={child.alert_profile} 
           />
           
           <SessionHistory childId={child.id} />
        </div>
      </div>
    </div>
  );
}

function MetricItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
      <div className="p-1.5 bg-white/10 rounded-lg w-fit mb-2">
        <Icon size={14} />
      </div>
      <p className="text-[9px] font-bold uppercase tracking-wider opacity-60 leading-none mb-1">{label}</p>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}
