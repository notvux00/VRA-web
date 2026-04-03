"use client";

import React, { useState } from "react";
import { 
  Bell, BellOff, AlertTriangle, 
  Settings2, ChevronDown, CheckCircle 
} from "lucide-react";

interface Alert {
  id: string;
  type: string;
  severity: "high" | "medium" | "low";
  duration_sec: number;
}

interface AlertSidebarProps {
  activeAlerts: Alert[];
  alertProfile: any;
}

export default function AlertSidebar({ activeAlerts, alertProfile }: AlertSidebarProps) {
  const [mutedGroups, setMutedGroups] = useState<string[]>([]);

  const toggleMute = (group: string) => {
    setMutedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const alertGroups = [
    { key: "stress_overwhelm", label: "Stress / Overwhelm", icon: "😰", severity: "high" },
    { key: "distraction", label: "Mất tập trung", icon: "😵", severity: "medium" },
    { key: "execution_difficulty", label: "Khó thực hiện", icon: "🤔", severity: "low" },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-full shadow-lg">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-between items-center">
        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
           <Bell size={16} className="text-blue-600" />
           ALERT CONTROL
        </h3>
        <Settings2 size={16} className="text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Connection Group Toggles */}
        <div className="space-y-2">
          {alertGroups.map((group) => {
            const isMuted = mutedGroups.includes(group.key);
            const isActive = activeAlerts.some(a => {
              if (group.key === 'stress_overwhelm') return a.type === 'freeze';
              if (group.key === 'distraction') return a.type === 'distraction';
              if (group.key === 'execution_difficulty') return a.type === 'idle' || a.type === 'hesitation';
              return false;
            });

            return (
              <div 
                key={group.key}
                className={`p-3 rounded-2xl flex items-center justify-between transition-all border ${
                  isMuted 
                    ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 opacity-60 grayscale' 
                    : isActive 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 ring-2 ring-red-500/20'
                      : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{group.icon}</span>
                  <p className={`text-xs font-bold ${isMuted ? 'text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>{group.label}</p>
                </div>
                <button 
                  onClick={() => toggleMute(group.key)}
                  className={`p-1.5 rounded-lg transition-colors ${isMuted ? 'text-zinc-400 bg-zinc-200/50' : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'}`}
                >
                  {isMuted ? <BellOff size={14} /> : <Bell size={14} />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
           <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={12} /> ACTIVE ALERTS ({activeAlerts.length})
           </h4>

           <div className="space-y-2">
             {activeAlerts.length > 0 ? (
               activeAlerts.map((alert, idx) => (
                 <div key={idx} className="p-4 bg-zinc-900 dark:bg-black rounded-2xl border border-zinc-800 animate-in zoom-in-95 slide-in-from-right-4">
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm ${
                         alert.severity === 'high' ? 'bg-red-500 text-white' : 
                         alert.severity === 'medium' ? 'bg-amber-500 text-white' : 
                         'bg-blue-500 text-white'
                       }`}>
                         {alert.type}
                       </span>
                       <span className="text-[10px] font-bold text-zinc-500">{alert.duration_sec}s</span>
                    </div>
                    <p className="text-xs font-medium text-white/80 leading-relaxed capitalize">
                       Hành vi {alert.type} được phát hiện qua sensor.
                    </p>
                    <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 animate-[loading_2s_linear_infinite]" style={{ width: '100%' }} />
                    </div>
                 </div>
               ))
             ) : (
               <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600 dark:text-emerald-400 mb-4 animate-in zoom-in-95">
                    <CheckCircle size={32} />
                  </div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">Everything Normal</p>
                  <p className="text-[10px] text-zinc-500 max-w-[150px] mt-1 font-medium italic">Không có hành vi bất thường nào được phát hiện qua telemetry.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
