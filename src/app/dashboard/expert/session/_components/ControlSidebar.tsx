"use client";

import React from "react";
import { 
  Play, Pause, RotateCcw, 
  ArrowRight, Target, Brain, 
  Clock, Zap, Loader2, Info
} from "lucide-react";

interface ControlSidebarProps {
  sessionTime: number;
  telemetry: any;
}

export default function ControlSidebar({ sessionTime, telemetry }: ControlSidebarProps) {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Session Timer Header */}
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-950 text-white flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Clock size={80} />
        </div>
        <div className="relative z-10">
           <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Session Timer</h3>
           <p className="text-3xl font-black font-mono tracking-widest leading-none">{formatTime(sessionTime)}</p>
        </div>
        <div className="relative z-10 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]" />
           <span className="text-[10px] font-black uppercase tracking-tighter">VR CONNECTED</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Quest Progress */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                 <Brain size={12} /> QUEST PROGRESS
              </h4>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded uppercase">Step 1/3</span>
           </div>

           <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-black text-zinc-900 dark:text-white uppercase mb-2 tracking-tight">Washing Hands: Apply Soap</p>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 w-[45%]" />
              </div>
           </div>

           <div className="space-y-2">
              <QuestStep label="Wet Hands" isCompleted={true} />
              <QuestStep label="Apply Soap" isActive={true} />
              <QuestStep label="Scrub & Rinse" />
           </div>
        </div>

        {/* Remote Commands */}
        <div className="space-y-4">
           <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <Zap size={12} /> REMOTE COMMANDS (RTDB)
           </h4>

           <div className="grid grid-cols-2 gap-3">
              <CommandButton icon={Pause} label="PAUSE" />
              <CommandButton icon={RotateCcw} label="RESET STAGE" />
              <CommandButton icon={ArrowRight} label="NEXT STEP" color="blue" />
              <CommandButton icon={Target} label="CALIBRATE" />
           </div>
        </div>
      </div>

      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
         <div className="flex gap-3 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
               <Info size={18} />
            </div>
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
               Lệnh remote được truyền qua RTDB với độ trễ &lt;100ms. Luôn thông báo cho trẻ trước khi can thiệp qua VR.
            </p>
         </div>
         <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-95">
            TERMINATE SESSION
         </button>
      </div>
    </div>
  );
}

function QuestStep({ label, isCompleted, isActive }: { label: string, isCompleted?: boolean, isActive?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
      isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 ring-2 ring-blue-500/10' : 
      isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 opacity-60' : 
      'bg-transparent border-transparent'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${
        isCompleted ? 'bg-emerald-500' : isActive ? 'bg-blue-600 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'
      }`} />
      <span className={`text-[10px] font-bold uppercase tracking-tight ${
        isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-500'
      }`}>
        {label}
      </span>
    </div>
  );
}

function CommandButton({ icon: Icon, label, color = "zinc" }: { icon: any, label: string, color?: string }) {
  const colorClass = color === "blue" ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500" : "bg-white dark:bg-zinc-800 hover:bg-zinc-50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white";
  return (
    <button className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all active:scale-95 shadow-sm hover:shadow-md ${colorClass}`}>
       <Icon size={18} />
       <span className="text-[9px] font-black tracking-widest uppercase">{label}</span>
    </button>
  );
}
