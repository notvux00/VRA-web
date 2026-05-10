"use client";

import React, { useState } from "react";
import { 
  X, CheckCircle, Brain, 
  Target, BarChart3, Star, 
  Save, Loader2, Info, AlertTriangle
} from "lucide-react";

interface Alert {
  id: string;
  type: string;
  group: string;
  severity: "high" | "medium" | "low";
  time_offset: number;
  duration_sec: number;
  message: string;
  note?: string;
}

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (summary: any) => void;
  sessionTime: number;
  alerts: Alert[];
  logsCount: number;
  childName: string;
}

export default function SessionSummaryModal({ 
  isOpen, onClose, onSave, 
  sessionTime, alerts, logsCount, childName 
}: SessionSummaryModalProps) {
  const [evaluation, setEvaluation] = useState("");
  const [score, setScore] = useState(8.0);
  const [status, setStatus] = useState<"success" | "failed">("success");
  const [saving, setSaving] = useState(false);
  const [editableAlerts, setEditableAlerts] = useState<Alert[]>([]);

  // Initialize editable alerts when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setEditableAlerts(alerts.map(a => ({ ...a, note: a.note || "" })));
    }
  }, [isOpen, alerts]);

  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const updateAlertNote = (id: string, note: string) => {
    setEditableAlerts(prev => prev.map(a => a.id === id ? { ...a, note } : a));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      evaluation,
      score,
      status,
      duration: formatTime(sessionTime),
      alerts: editableAlerts,
      logsCount
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="bg-white border border-zinc-200 w-full max-w-4xl rounded-3xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header Branding */}
        <div className="p-8 border-b border-zinc-100 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden shrink-0">
           <div className="absolute top-0 right-0 p-12 text-blue-500/5 rotate-12">
              <CheckCircle size={150} />
           </div>
           <div className="relative z-10 flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase mb-1">Session Summary Report</h3>
                <p className="text-zinc-500 font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                  <Brain size={14} className="text-blue-600" /> TOÀN VĂN BÁO CÁO: {childName}
                </p>
              </div>
              
              <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                <button 
                  onClick={() => setStatus("success")}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${status === "success" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  SUCCESS
                </button>
                <button 
                  onClick={() => setStatus("failed")}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${status === "failed" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  FAILED
                </button>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-white">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
             <SummaryStat label="Thời lượng" value={formatTime(sessionTime)} color="blue" />
             <SummaryStat label="Cảnh báo AI" value={alerts.length.toString()} color="amber" />
             <SummaryStat label="Ghi chú lâm sàng" value={logsCount.toString()} color="purple" />
          </div>

          {/* Detailed Alert Review Section */}
          <div className="space-y-6">
             <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                   <AlertTriangle size={12} className="text-amber-500" /> Rà soát chi tiết Cảnh báo AI
                </label>
                <span className="text-[10px] text-zinc-400 font-bold italic">Thêm ghi chú cho từng sự kiện bên dưới</span>
             </div>

             <div className="space-y-3">
                {editableAlerts.length > 0 ? editableAlerts.map((alert, idx) => (
                  <div key={alert.id} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 hover:border-zinc-200 transition-all shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                          alert.severity === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {alert.type}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Offset: {formatTime(alert.time_offset)} | Duration: {alert.duration_sec}s
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-zinc-800 mb-3">"{alert.message}"</p>
                    <input 
                      type="text"
                      placeholder="Nhập ghi chú lâm sàng cho sự kiện này..."
                      value={alert.note}
                      onChange={(e) => updateAlertNote(alert.id, e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
                    />
                  </div>
                )) : (
                  <div className="text-center py-12 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-600">Không có cảnh báo bất thường nào được phát hiện.</p>
                  </div>
                )}
             </div>
          </div>

          {/* Performance Score */}
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                   <Target size={12} className="text-blue-600" /> Đánh giá hiệu suất tổng quan (Grade 0-10)
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={score}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setScore(Math.min(10, Math.max(0, val)));
                    }}
                    className="w-20 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xl font-black text-blue-600 text-center focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                  />
                  <span className="text-zinc-300 font-black text-xl">/ 10</span>
                </div>
             </div>
             <div className="relative pt-1">
                <input 
                  type="range" min="0" max="10" step="0.1" value={score} 
                  onChange={(e) => setScore(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-4 px-1">
                    <span className="flex flex-col items-start gap-1">
                      <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                      Cần hỗ trợ nhiều (0)
                    </span>
                    <span className="flex flex-col items-center gap-1">
                      <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                      Khá / Tốt (5)
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                      Xuất sắc / Độc lập (10)
                    </span>
                </div>
             </div>
          </div>

          {/* Evaluation Area */}
          <div className="space-y-4 pb-4">
             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Star size={12} className="text-amber-500" /> Kết luận chuyên môn buổi tập
             </label>
             <textarea 
              value={evaluation}
              onChange={(e) => setEvaluation(e.target.value)}
              placeholder="Nhập tổng kết buổi tập, các tiến bộ hoặc khó khăn con gặp phải..."
              className="w-full h-40 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium leading-relaxed resize-none shadow-inner"
             />
          </div>
        </div>

        <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex gap-4 shrink-0">
           <button 
            onClick={onClose}
            className="flex-1 px-8 py-5 rounded-2xl text-xs font-black text-zinc-400 uppercase tracking-widest hover:bg-zinc-100 transition-all text-center border border-zinc-200"
           >
              QUAY LẠI
           </button>
           <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-zinc-900 hover:bg-black text-white px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-3 disabled:opacity-50"
           >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              HOÀN TẤT & LƯU BÁO CÁO
           </button>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, color }: { label: string, value: string, color: string }) {
  const getColors = () => {
    if (color === 'amber') return 'bg-amber-50 border-amber-100 text-amber-600';
    if (color === 'purple') return 'bg-purple-50 border-purple-100 text-purple-600';
    return 'bg-blue-50 border-blue-100 text-blue-600';
  };

  return (
    <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center shadow-sm ${getColors()}`}>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
       <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
