"use client";

import React from "react";
import { ArrowLeft, Save } from "lucide-react";
import { ChildProfile } from "@/types";

interface SessionHeaderProps {
  lessonName: string;
  child: ChildProfile | null;
  sessionTime: number;
  onBack: () => void;
  onSave: () => void;
}

export default function SessionHeader({
  lessonName,
  child,
  sessionTime,
  onBack,
  onSave
}: SessionHeaderProps) {
  return (
    <header className="h-14 border-b border-white/5 bg-zinc-950 flex items-center justify-between px-4 shrink-0 transition-all">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="font-mono text-sm tracking-widest text-zinc-400">
            {Math.floor(sessionTime / 60).toString().padStart(2, "0")}:{Math.floor(sessionTime % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <div className="h-4 w-px bg-white/10 mx-2"></div>
        <h1 className="font-bold uppercase tracking-wide text-xs">
          {lessonName} <span className="text-zinc-600">—</span> {child?.name || "Đang tải..."}
        </h1>
      </div>
      <button 
        onClick={onSave} 
        className="flex items-center gap-2 bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 px-4 py-1.5 rounded text-xs font-bold transition-colors"
      >
        <Save size={14} /> CHỐT BÁO CÁO
      </button>
    </header>
  );
}
