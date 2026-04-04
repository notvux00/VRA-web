import { getAssignedChildDetail } from "@/actions/expert";
import { getChildStats, getChildSessions, getChildAlertStats } from "@/actions/parent";
import { 
  Baby, Ruler, Scale, 
  Activity, History, Info, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import React from "react";
import AlertProfileEditor from "../_components/AlertProfileEditor";
import ChildAchievements from "../../parent/_components/ChildAchievements";
import ChildChartsContainer from "../../parent/_components/ChildChartsContainer";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

interface Child {
  id: string;
  name?: string;
  display_name?: string;
  age?: number;
  gender?: string;
  status?: string;
  height_cm?: number;
  weight_kg?: number;
  sound_sensitivity?: number;
  attention_span_min?: number;
  condition?: string;
  diagnosis_notes?: string;
  anxiety_triggers?: string[];
  alert_profile?: any;
}

export default async function ExpertStatsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.childId;

  if (!childId) {
    return (
      <div className="p-20 text-center uppercase font-black text-zinc-400">
        Vui lòng chọn hồ sơ trẻ trước
      </div>
    );
  }

  // Fetch data on the server
  const [childRes, statsRes, sessionsRes, radarRes] = await Promise.all([
    getAssignedChildDetail(childId),
    getChildStats(childId),
    getChildSessions(childId),
    getChildAlertStats(childId)
  ]);

  const child = childRes.child as Child;
  const stats = statsRes.stats;
  const sessions = sessionsRes.sessions || [];
  const radarData = radarRes.radarData || [];

  if (!child) {
    return (
       <div className="p-20 text-center">
          <p className="text-red-500 font-bold underline">Không tìm thấy thông tin trẻ hoặc bạn không có quyền truy cập.</p>
          <Link href="/dashboard/expert" className="mt-4 inline-block text-zinc-500 font-bold uppercase text-xs">Quay lại</Link>
       </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Thống kê chi tiết</h1>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/10 text-blue-600 border border-blue-200 dark:border-blue-900/30 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                Clinical Data
              </span>
            </div>
            <p className="text-zinc-500 font-medium tracking-wide">Đang xem hồ sơ: <span className="text-blue-600 font-black">{child.display_name || child.name}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2 pl-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
           <div className="text-right">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Chỉ số tập trung</p>
              <p className="text-lg font-black text-zinc-900 dark:text-white">{child.attention_span_min || "--"} phút</p>
           </div>
           <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
              <Activity size={20} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Biometrics & Condition */}
        <div className="lg:col-span-4 space-y-8">
          {/* Metrics Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Baby size={120} />
            </div>
            
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-70 flex items-center gap-2">
              <ShieldCheck size={14} /> Chỉ số sinh trắc & Chẩn đoán
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <MetricItem icon={Ruler} label="Chiều cao" value={`${child.height_cm || "--"} cm`} />
              <MetricItem icon={Scale} label="Cân nặng" value={`${child.weight_kg || "--"} kg`} />
              <MetricItem icon={Activity} label="Nhạy cảm" value={`${child.sound_sensitivity || "3"}/5`} />
              <MetricItem icon={History} label="Tập trung" value={`${child.attention_span_min || "--"} p`} />
            </div>

            <div className="pt-8 border-t border-white/10 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Tình trạng trẻ</p>
                <p className="text-base font-bold leading-relaxed line-clamp-3">{child.condition || "Chưa có thông tin chẩn đoán sơ bộ."}</p>
              </div>
              {child.diagnosis_notes && (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs opacity-80 italic italic leading-relaxed">"{child.diagnosis_notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Anxiety Triggers */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 space-y-6 shadow-sm">
             <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <Info size={14} className="text-blue-500" /> Tác nhân gây lo âu
             </h4>
             <div className="flex flex-wrap gap-2">
                {child.anxiety_triggers && child.anxiety_triggers.length > 0 ? (
                  child.anxiety_triggers.map((t, i) => (
                    <span key={i} className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-blue-50 transition-colors">
                      {t}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 italic">Chưa có thông tin ghi nhận về tác nhân gây lo âu.</p>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Alert Profile & History & Achievements */}
        <div className="lg:col-span-8 space-y-10">
           {/* Alert Profile Configuration */}
           <AlertProfileEditor 
             childId={child.id} 
             initialProfile={child.alert_profile} 
           />
           
           {/* Achievements Section */}
           <ChildAchievements achievements={stats?.achievements || []} />

           {/* Analytics Charts - Replaced SessionHistory */}
           <ChildChartsContainer 
             sessions={sessions} 
             radarData={radarData} 
           />
        </div>
      </div>
    </div>
  );
}

function MetricItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
      <div className="p-2 bg-white/10 rounded-xl w-fit mb-3">
        <Icon size={16} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-none mb-2">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
