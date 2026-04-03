"use client";

import React, { useState } from "react";
import { 
  X, MessageSquare, AlertTriangle, 
  CheckCircle, Plus, Hash 
} from "lucide-react";

interface BehaviorLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (log: any) => void;
  currentTime: number;
}

export default function BehaviorLogModal({ isOpen, onClose, onAdd, currentTime }: BehaviorLogModalProps) {
  const [tag, setTag] = useState("Vận động lặp lại");
  const [severity, setSeverity] = useState("low");
  const [note, setNote] = useState("");

  const tags = [
    "Vận động lặp lại", "La hét / Tiếng ồn", 
    "Không phản ứng", "Kích động", "Né tránh mắt",
    "Thực hiện sai bước", "Khác"
  ];

  if (!isOpen) return null;

  const handleSubmit = () => {
    onAdd({
      timestamp: Date.now(),
      sessionTime: currentTime,
      behavior_tag: tag,
      severity,
      expert_note: note
    });
    setNote("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-3">
             <MessageSquare size={22} className="text-blue-500" />
             GHI CHÚ HÀNH VI LÂM SÀNG
          </h3>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Timestamp Indicator */}
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full w-fit uppercase tracking-widest">
             <Hash size={12} /> TẠI THỜI ĐIỂM: {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
          </div>

          {/* Behavior Tag */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phân loại hành vi</label>
            <div className="flex flex-wrap gap-2">
               {tags.map((t) => (
                 <button 
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    tag === t ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                 >
                   {t}
                 </button>
               ))}
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mức độ ảnh hưởng</label>
            <div className="grid grid-cols-3 gap-3">
               <SeverityButton active={severity === 'low'} label="NHẸ" color="emerald" onClick={() => setSeverity('low')} />
               <SeverityButton active={severity === 'medium'} label="TRUNG BÌNH" color="amber" onClick={() => setSeverity('medium')} />
               <SeverityButton active={severity === 'high'} label="NGHIÊM TRỌNG" color="red" onClick={() => setSeverity('high')} />
            </div>
          </div>

          {/* Note Area */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ghi chú chi tiết</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập quan sát lâm sàng của bạn..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-medium resize-none"
            />
          </div>
        </div>

        <div className="p-6 bg-zinc-900/50 border-t border-white/5 flex gap-3">
           <button onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl text-xs font-black text-zinc-500 uppercase tracking-widest hover:bg-white/5 transition-all">
              HỦY BỎ
           </button>
           <button 
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
           >
              <CheckCircle size={18} />
              LƯU GHI CHÚ
           </button>
        </div>
      </div>
    </div>
  );
}

function SeverityButton({ active, label, color, onClick }: any) {
  const getColors = () => {
    if (color === 'red') return active ? 'bg-red-600 border-red-500 text-white' : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20';
    if (color === 'amber') return active ? 'bg-amber-600 border-amber-500 text-white' : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20';
    return active ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20';
  };

  return (
    <button 
      onClick={onClick}
      className={`py-3 rounded-xl text-[10px] font-black border transition-all ${getColors()}`}
    >
      {label}
    </button>
  );
}
