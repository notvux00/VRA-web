"use client";

import React, { useEffect, useState, use } from "react";
import { getSessionDetail } from "@/actions/history";
import { Session } from "@/types";
import { 
  AlertCircle, 
  ChevronLeft, 
  Clock, 
  ShieldAlert, 
  ShieldQuestion, 
  ShieldCheck,
  Timer,
  FileText,
  AlertTriangle,
  Brain
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ sessionId?: string; childId?: string }>;
}

export default function AlertsDetailPage({ searchParams }: PageProps) {
  const { sessionId, childId } = use(searchParams);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      getSessionDetail(sessionId)
        .then(res => {
          if (res.success && res.session) {
            setSession(res.session);
          } else {
            setError(res.error || "Không thể tải dữ liệu cảnh báo");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  if (!sessionId) return <div className="p-8 text-center">No session selected.</div>;
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Đang tải dữ liệu...</div>;
  if (error || !session) return <div className="p-8 text-center text-rose-500">{error || "Lỗi tải dữ liệu"}</div>;

  const alerts = session.auto_alerts || [];
  const highSeverity = alerts.filter(a => a.severity === "high").length;
  const mediumSeverity = alerts.filter(a => a.severity === "medium").length;
  const lowSeverity = alerts.filter(a => a.severity === "low").length;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/dashboard/expert/reports?sessionId=${sessionId}&childId=${childId}`}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest"
        >
          <ChevronLeft size={16} /> Quay lại báo cáo tổng quan
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
           <Brain size={14} className="text-blue-500" />
           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">AI Diagnostic Data</span>
        </div>
      </div>

      {/* Header Context */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Chi tiết Cảnh báo AI</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
            Bài học: <span className="text-zinc-900 dark:text-white">{session.lesson_name}</span> 
            <span className="mx-3 opacity-20">|</span> 
            ID: {session.session_id}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Cao" value={highSeverity} color="bg-red-500" />
          <StatCard label="Trung bình" value={mediumSeverity} color="bg-amber-500" />
          <StatCard label="Thấp" value={lowSeverity} color="bg-blue-50" textColor="text-blue-600" />
        </div>
      </div>

      {/* Alert List Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Thời điểm</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Loại / Nhóm</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Nội dung cảnh báo</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Thời lượng</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Ghi chú lâm sàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {alerts.length > 0 ? alerts.map((alert: any, idx: number) => (
                <tr key={alert.id || idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-zinc-300" />
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatTime(alert.time_offset)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter w-fit ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                        alert.severity === 'medium' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {alert.type}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">{alert.group}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-snug">{alert.message}</p>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                       <Timer size={12} className="text-zinc-400" />
                       <span className="text-xs font-black text-zinc-600 dark:text-zinc-400">{alert.duration_sec}s</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    {alert.note ? (
                      <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                        <FileText size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-900 dark:text-blue-200 font-medium italic">&quot;{alert.note}&quot;</p>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-300 italic font-medium">Không có ghi chú</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                      <ShieldCheck size={48} className="mx-auto text-emerald-100" />
                      <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Hệ thống không ghi nhận cảnh báo bất thường nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, textColor = "text-white" }: { label: string, value: number, color: string, textColor?: string }) {
  return (
    <div className={`px-6 py-4 rounded-2xl ${color} flex flex-col items-center justify-center text-center shadow-sm min-w-[100px]`}>
       <p className={`text-[9px] font-black uppercase tracking-widest opacity-80 mb-1 ${textColor}`}>{label}</p>
       <p className={`text-2xl font-black ${textColor}`}>{value}</p>
    </div>
  );
}
