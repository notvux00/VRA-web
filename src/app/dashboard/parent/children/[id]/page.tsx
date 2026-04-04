import { getChildProfileDetail, getChildStats, getChildSessions, getChildAlertStats } from "@/actions/parent";
import { Baby, Calendar, Ruler, Scale, Activity, History, ShieldCheck, Mail, Info, UserCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChildChartsContainer from "../../_components/ChildChartsContainer";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ childId?: string }>;
}

export default async function ChildDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const [result, statsResult, sessionsResult, alertResult] = await Promise.all([
    getChildProfileDetail(id),
    getChildStats(id),
    getChildSessions(id),
    getChildAlertStats(id)
  ]);

  if (!result.success || !result.child) return notFound();
  
  const child = result.child as any;
  const expert = result.expert as any;
  const stats = statsResult.success ? statsResult.stats : null;
  const sessions = (sessionsResult as any).success ? ((sessionsResult as any).sessions || []) : [];
  const radarData = (alertResult as any).success ? ((alertResult as any).radarData || []) : [];

  // Biometric Items
  const metrics = [
    { label: "Chiều cao", value: `${child.height_cm || "--"} cm`, icon: Ruler },
    { label: "Cân nặng", value: `${child.weight_kg || "--"} kg`, icon: Scale },
    { label: "Âm thanh", value: `${child.sound_sensitivity || "3"}/5`, icon: Activity },
    { label: "Tập trung", value: `${child.attention_span_min || "--"} phút`, icon: History },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                {child.name || child.display_name || "Hồ sơ trẻ"}
              </h1>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                Đang hoạt động
              </span>
            </div>
            <p className="text-zinc-500 font-medium flex items-center gap-2 mt-0.5 uppercase tracking-widest text-[10px]">
              ID: {child.id} &bull; {child.age || "--"} tuổi &bull; {child.gender === 'male' ? 'Nam' : 'Nữ'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Clinical Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Baby size={100} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 opacity-70">Chỉ số & Chẩn đoán bẩm sinh</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((m, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <div className="p-1.5 bg-white/10 rounded-lg w-fit mb-2">
                    <m.icon size={14} />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">{m.label}</p>
                  <p className="text-sm font-black">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">Chẩn đoán sơ bộ</p>
              <p className="text-sm font-bold leading-relaxed">{child.condition || "Chưa có chẩn đoán chính thức"}</p>
              {child.diagnosis_notes && (
                <p className="text-xs mt-3 opacity-80 border-l-2 border-white/20 pl-3 leading-relaxed">
                  {child.diagnosis_notes}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
             <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
               <ShieldCheck size={14} className="text-emerald-500" /> Tác nhân gây lo âu
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

        {/* Right Column: Expert Note & Intervention */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                 Thông tin Chuyên gia phụ trách
               </h3>
               <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                 <ShieldCheck size={20} />
               </div>
             </div>

             <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                   <UserCheck size={40} />
                </div>
                <div>
                   <h4 className="text-2xl font-black text-zinc-900 dark:text-white">
                     {expert?.name || "Chuyên gia hệ thống"}
                   </h4>
                   <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">
                     {expert?.specialization || "Chuyên gia giáo dục đặc biệt"}
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4 text-center">
                <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                   <Mail className="text-zinc-400" size={18} />
                   <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                     {expert?.email || "N/A"}
                   </span>
                </div>
             </div>
           </div>

           <ChildChartsContainer sessions={sessions} radarData={radarData} />
        </div>
      </div>
    </div>
  );
}

