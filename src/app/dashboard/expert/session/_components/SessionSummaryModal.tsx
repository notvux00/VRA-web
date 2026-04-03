"use client";

import React, { useState } from "react";
import { 
  X, CheckCircle, Brain, 
  Target, BarChart3, Star, 
  Save, Loader2, Info, AlertTriangle
} from "lucide-react";

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (summary: any) => void;
  sessionTime: number;
  alertsCount: number;
  logsCount: number;
  childName: string;
}

export default function SessionSummaryModal({ 
  isOpen, onClose, onSave, 
  sessionTime, alertsCount, logsCount, childName 
}: SessionSummaryModalProps) {
  const [evaluation, setEvaluation] = useState("");
  const [score, setScore] = useState(80);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      evaluation,
      score,
      duration: formatTime(sessionTime),
      alertsCount,
      logsCount
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      
      <div className="bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
        {/* Header Branding */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-blue-600/20 to-purple-600/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
              <CheckCircle size={150} />
           </div>
           <div className="relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tight uppercase mb-1">Session Termination</h3>
              <p className="text-zinc-500 font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                <Brain size={14} className="text-blue-500" /> TOÀN VĂN BÁO CÁO: {childName}
              </p>
           </div>
        </div>

        <div className="p-10 space-y-10">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
             <SummaryStat label="Thời lượng" value={formatTime(sessionTime)} color="blue" />
             <SummaryStat label="Cảnh báo AI" value={alertsCount.toString()} color="amber" />
             <SummaryStat label="Ghi chú lâm sàng" value={logsCount.toString()} color="purple" />
          </div>

          {/* Performance Score */}
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   <Target size={12} className="text-blue-500" /> Đánh giá hiệu suất tập trung
                </label>
                <span className="text-xl font-black text-blue-500">{score}%</span>
             </div>
             <input 
              type="range" min="0" max="100" value={score} 
              onChange={(e) => setScore(parseInt(e.target.value))}
              className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
             <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                <span>Cần hỗ trợ nhiều</span>
                <span>Tốt</span>
                <span>Xuất sắc / Độc lập</span>
             </div>
          </div>

          {/* Evaluation Area */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Star size={12} className="text-amber-500" /> Nhận xét chuyên môn của Chuyên gia
             </label>
             <textarea 
              value={evaluation}
              onChange={(e) => setEvaluation(e.target.value)}
              placeholder="Nhập tổng kết buổi tập, các tiến bộ hoặc khó khăn con gặp phải..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-medium leading-relaxed resize-none"
             />
          </div>

          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex gap-4">
             <div className="p-2 bg-blue-600 rounded-lg shrink-0">
                <Info size={16} className="text-white" />
             </div>
             <p className="text-[10px] text-blue-400 font-bold leading-relaxed">
                Sau khi nhấn "Hoàn tất & Lưu", báo cáo này sẽ được mã hóa và lưu trữ vĩnh viễn trên Firestore. 
                Cha mẹ của trẻ có thể xem báo cáo tóm lược qua ứng dụng Parent.
             </p>
          </div>
        </div>

        <div className="p-8 bg-zinc-900/50 border-t border-white/5 flex gap-4">
           <button 
            onClick={onClose}
            className="flex-1 px-8 py-5 rounded-2xl text-xs font-black text-zinc-500 uppercase tracking-widest hover:bg-white/5 transition-all text-center"
           >
              QUAY LẠI CHỈNH SỬA
           </button>
           <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-white hover:bg-zinc-200 text-black px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-50"
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
  const getBorder = () => {
    if (color === 'amber') return 'border-amber-500/20';
    if (color === 'purple') return 'border-purple-500/20';
    return 'border-blue-500/20';
  };
  const getIconColor = () => {
    if (color === 'amber') return 'text-amber-500';
    if (color === 'purple') return 'text-purple-500';
    return 'text-blue-500';
  };

  return (
    <div className={`p-4 bg-white/5 rounded-2xl border flex flex-col items-center justify-center text-center ${getBorder()}`}>
       <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
       <p className={`text-xl font-black ${getIconColor()}`}>{value}</p>
    </div>
  );
}
