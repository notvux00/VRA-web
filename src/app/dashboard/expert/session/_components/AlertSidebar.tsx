"use client";

import React, { useState } from "react";
import { 
  Bell, BellOff, AlertTriangle, 
  Settings2, ChevronDown, CheckCircle 
} from "lucide-react";

interface Alert {
  id: string;
  type: string;
  group: string;
  severity: "high" | "medium" | "low";
  duration_sec: number;
}

interface AlertSidebarProps {
  activeAlerts: Alert[];
  mutedGroups: string[];
  onToggleMute: (group: string) => void;
}

export default function AlertSidebar({ activeAlerts, mutedGroups, onToggleMute }: AlertSidebarProps) {
  const alertGroups = [
    { key: "stress_overwhelm", label: "Stress / Overwhelm", icon: "😰", severity: "high" },
    { key: "distraction", label: "Mất tập trung", icon: "😵", severity: "medium" },
    { key: "execution_difficulty", label: "Khó thực hiện", icon: "🤔", severity: "low" },
  ];

  return (
    <div className="p-4 border-t border-white/5">
      <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
        <Bell size={12} /> Alert Control
      </h3>
      
      <div className="space-y-2">
        {alertGroups.map((group) => {
          const isMuted = mutedGroups.includes(group.key);
          const isActive = activeAlerts.some(a => a.group === group.key);

          return (
            <div 
              key={group.key}
              className={`p-3 rounded-xl flex items-center justify-between transition-all border ${
                isMuted 
                  ? 'bg-zinc-900/50 border-white/5 opacity-50' 
                  : isActive 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : 'bg-zinc-900 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{group.icon}</span>
                <p className="text-xs font-bold text-zinc-200">{group.label}</p>
              </div>
              <button 
                onClick={() => onToggleMute(group.key)}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted 
                    ? 'text-zinc-500 hover:text-zinc-300' 
                    : 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                }`}
              >
                {isMuted ? <BellOff size={14} /> : <Bell size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
