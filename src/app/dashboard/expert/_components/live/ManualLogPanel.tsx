"use client";

import React, { useState } from "react";
import { ThumbsUp, Frown, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

interface ManualLogPanelProps {
  isFooterCollapsed: boolean;
  setIsFooterCollapsed: (val: boolean) => void;
  onQuickLog: (event: string, note: string) => void;
}

export default function ManualLogPanel({
  isFooterCollapsed,
  setIsFooterCollapsed,
  onQuickLog
}: ManualLogPanelProps) {
  const [note, setNote] = useState("");

  const handleLog = (event: string) => {
    onQuickLog(event, note);
    setNote("");
  };

  return (
    <div className={`border-t border-white/5 bg-zinc-950 flex flex-col shrink-0 transition-all duration-300 ${isFooterCollapsed ? "h-10" : "h-[120px]"}`}>
      <div className="h-10 flex items-center justify-between px-4 cursor-pointer hover:bg-white/5" onClick={() => setIsFooterCollapsed(!isFooterCollapsed)}>
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ghi chú Hành Vi Nhanh</span>
        {isFooterCollapsed ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
      </div>
      
      {!isFooterCollapsed && (
        <div className="flex-1 flex gap-4 p-4 pt-0 items-end">
          <input
            type="text"
            placeholder="Ghi chú chi tiết (nếu có)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
          />
          <div className="flex gap-2">
            <button 
              onClick={() => handleLog("positive")}
              className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg font-bold text-xs transition-colors"
            >
              <ThumbsUp size={16} /> Tốt
            </button>
            <button 
              onClick={() => handleLog("negative")}
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-lg font-bold text-xs transition-colors"
            >
              <Frown size={16} /> Bất hợp tác
            </button>
            <button 
              onClick={() => handleLog("intervention")}
              className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-lg font-bold text-xs transition-colors"
            >
              <Lightbulb size={16} /> Cần can thiệp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
