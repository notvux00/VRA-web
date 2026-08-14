"use client";

import React, { MutableRefObject } from "react";
import { Bell, BellOff, ChevronDown, ChevronUp, ThumbsUp, Frown, MessageSquarePlus } from "lucide-react";
interface Alert {
  id: string;
  group: string;
  type: string;
  severity: "high" | "medium" | "low";
  timestamp: number;
  message: string;
  duration_sec: number;
}

interface SessionLog {
  log_id: string;
  time_offset: number;
  event: string;
  note?: string;
  triggered_by: string;
  timestamp: number;
}

interface AlertsFooterProps {
  isFooterCollapsed: boolean;
  setIsFooterCollapsed: (val: boolean) => void;
  mutedGroups: string[];
  toggleMute: (group: string) => void;
  activeAlerts: Alert[];
  alertsScrollRef: React.RefObject<HTMLDivElement | null>;
  manualLogs: SessionLog[];
  onQuickLog: (event: string, note: string) => void;
}

export default function AlertsFooter({
  isFooterCollapsed,
  setIsFooterCollapsed,
  mutedGroups,
  toggleMute,
  activeAlerts,
  alertsScrollRef,
  manualLogs,
  onQuickLog
}: AlertsFooterProps) {
  return (
    <div 
      className={`relative border-t border-white/5 bg-black flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${
        isFooterCollapsed ? 'h-12' : 'h-52'
      }`}
    >
      {!isFooterCollapsed && (
        <button
          onClick={() => setIsFooterCollapsed(true)}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white z-30 transition-all hover:bg-zinc-800 active:scale-95"
          title="Thu gọn cảnh báo"
        >
          <ChevronDown size={14} />
        </button>
      )}

      <div className={`flex-1 flex min-h-0 transition-all duration-300 ${isFooterCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="w-80 border-r border-white/5 p-4 bg-zinc-950/40 flex flex-col justify-center gap-2 select-none shrink-0">
          <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2 mb-1">
            <Bell size={12} /> Bật/Tắt Cảnh Báo
          </h3>
          <div className="flex flex-col gap-1.5">
            {[
              { key: "stress_overwhelm", label: "Stress / Overwhelm", icon: "😰" },
              { key: "distraction", label: "Mất tập trung", icon: "😵" },
              { key: "execution_difficulty", label: "Khó thực hiện", icon: "🤔" },
            ].map((group) => {
              const isMuted = mutedGroups.includes(group.key);
              const isActive = activeAlerts.some(a => a.group === group.key);
              return (
                <button
                  key={group.key}
                  onClick={() => toggleMute(group.key)}
                  className={`px-3 py-1.5 rounded-lg flex items-center justify-between transition-all border text-left ${
                    isMuted 
                      ? 'bg-zinc-900/40 border-white/5 opacity-40 hover:opacity-60' 
                      : isActive 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-zinc-900/80 border-white/10 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{group.icon}</span>
                    <span className="text-xs font-bold text-zinc-200">{group.label}</span>
                  </div>
                  <span className="text-zinc-500">
                    {isMuted ? <BellOff size={12} /> : <Bell size={12} className="text-blue-400" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div 
          ref={alertsScrollRef as React.RefObject<HTMLDivElement>}
          className="flex-1 flex gap-3 p-4 overflow-x-auto items-center no-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 to-transparent"
        >
          {activeAlerts.length === 0 && (
            <div className="text-xs font-mono text-zinc-600 opacity-50 pl-2">
              [SYSTEM_LOG] Đang nhận luồng dữ liệu 50Hz...
            </div>
          )}

          {activeAlerts.filter(a => !mutedGroups.includes(a.group)).map((alert, idx) => (
            <div key={`${alert.id}-${idx}`} className={`shrink-0 min-w-[200px] border px-3 py-2 rounded-lg flex flex-col gap-1 shadow-lg
              ${alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-100' : ''}
              ${alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-100' : ''}
              ${alert.severity === 'low' ? 'bg-blue-500/10 border-blue-500/30 text-blue-100' : ''}
            `}>
              <div className="flex items-center justify-between opacity-60">
                <div className="text-[9px] font-mono uppercase tracking-wider">
                  {alert.group.replace('_', ' ')} <span className="mx-1">/</span> {alert.type}
                </div>
                <div className="text-[9px] font-mono">{new Date(alert.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</div>
              </div>
              <div className="text-xs font-bold mb-1">{alert.message}</div>
              <div className="flex items-center gap-1.5 mt-auto">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-current opacity-30 animate-pulse" style={{ width: '100%' }}></div>
                </div>
                <span className="text-[10px] font-mono font-bold opacity-80">{alert.duration_sec}s</span>
              </div>
            </div>
          ))}

          {manualLogs.map((log) => (
            <div key={log.log_id} className="shrink-0 min-w-[180px] border border-emerald-500/30 bg-emerald-500/10 text-emerald-100 px-3 py-2 rounded-lg flex flex-col gap-1 shadow-lg">
              <div className="flex items-center justify-between opacity-60">
                <div className="text-[9px] font-mono uppercase tracking-wider">Expert Log</div>
                <div className="text-[9px] font-mono">
                  {Math.floor(log.time_offset/60)}:{(Math.floor(log.time_offset%60)).toString().padStart(2,'0')}
                </div>
              </div>
              <div className="text-xs font-bold">{log.event}</div>
              {log.note && log.event === "Note" && (
                <div className="text-[10px] opacity-80 italic line-clamp-1 border-t border-emerald-500/20 mt-1 pt-1">
                  {log.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="h-12 border-t border-white/5 bg-zinc-950 flex items-center px-4 gap-3 shrink-0">
        <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold border-r border-white/10 pr-4 mr-1">
          Ghi Log Nhanh
        </div>

        <button 
          onClick={() => onQuickLog("Tích cực", "Trẻ tự động làm quen vật thể")}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
        >
          <ThumbsUp size={14} /> Phản Ứng Tốt
        </button>

        <button 
          onClick={() => onQuickLog("Meltdown", "Trẻ khóc / hoảng sợ đột ngột")}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
        >
          <Frown size={14} /> Dấu Hiệu Hoảng
        </button>

        <button 
          onClick={() => {
            const text = window.prompt("Ghi chú tùy chỉnh:");
            if(text) onQuickLog("Note", text);
          }}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ml-auto"
        >
          <MessageSquarePlus size={14} /> Viết Ghi Chú...
        </button>

        {isFooterCollapsed && (
          <button 
            onClick={() => setIsFooterCollapsed(false)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all active:scale-95 flex-shrink-0"
            title="Mở rộng cảnh báo"
          >
            <ChevronUp size={14} />
            <span>Hiện Cảnh Báo</span>
          </button>
        )}
      </div>
    </div>
  );
}
