"use client";

import React from "react";
import { MessageCircle, Eye, SkipForward, Volume2 } from "lucide-react";

interface RemoteControlPanelProps {
  volumeLevel: number;
  onVolumeChange: (val: number) => void;
  onTriggerVerbalHint: () => void;
  onTriggerVisualHint: () => void;
  onForceSkip: () => void;
}

export default function RemoteControlPanel({
  volumeLevel,
  onVolumeChange,
  onTriggerVerbalHint,
  onTriggerVisualHint,
  onForceSkip
}: RemoteControlPanelProps) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
      <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Tác Động Từ Xa (Remote)</h3>
      <div className="flex flex-col gap-2">
        <button 
          onClick={onTriggerVerbalHint}
          className="flex items-center gap-3 w-full bg-zinc-900/60 border border-white/5 hover:border-zinc-500 p-2.5 rounded-lg text-left transition-all group"
        >
          <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <MessageCircle size={14} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-zinc-200">Gợi Ý Lời Nói (Verbal)</div>
          </div>
        </button>

        <button 
          onClick={onTriggerVisualHint}
          className="flex items-center gap-3 w-full bg-zinc-900/60 border border-white/5 hover:border-zinc-500 p-2.5 rounded-lg text-left transition-all group"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Eye size={14} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-zinc-200">Gợi Ý Thị Giác (Visual)</div>
          </div>
        </button>

        <button 
          onClick={onForceSkip}
          className="flex items-center gap-3 w-full bg-zinc-900/60 border border-white/5 hover:border-zinc-500 p-2.5 rounded-lg text-left transition-all group"
        >
          <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <SkipForward size={14} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-zinc-200">Force Skip</div>
          </div>
        </button>

        <div className="w-full bg-zinc-900/60 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center">
                <Volume2 size={14} />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-200">Âm lượng hệ thống</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-fuchsia-400">{Math.round(volumeLevel * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volumeLevel}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-fuchsia-500 h-1 bg-zinc-800 rounded-lg cursor-pointer appearance-none"
          />
        </div>
      </div>
    </div>
  );
}
