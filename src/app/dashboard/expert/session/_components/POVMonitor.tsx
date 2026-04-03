"use client";

import React from "react";
import { 
  Eye, Monitor, Maximize2, 
  Target, Zap, MousePointer2 
} from "lucide-react";

interface POVMonitorProps {
  telemetry: any;
  childName: string;
}

export default function POVMonitor({ telemetry, childName }: POVMonitorProps) {
  // Use a nice placeholder image for VR POV
  const POV_PLACEHOLDER = "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="relative aspect-video bg-zinc-950 rounded-3xl overflow-hidden border-4 border-zinc-900 group shadow-2xl">
      {/* VR POV Image Placeholder */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-100 opacity-60"
        style={{ 
          backgroundImage: `url(${POV_PLACEHOLDER})`,
          // Simulate slight head movement from telemetry
          transform: `scale(1.1) translate(${telemetry?.head?.yaw || 0}px, ${telemetry?.head?.pitch || 0}px)`
        }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Top Header info */}
      <div className="absolute top-4 left-6 right-6 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE VR POV</span>
          </div>
          <div className="w-[1px] h-3 bg-white/20" />
          <span className="text-xs font-bold text-white/80">{childName}</span>
        </div>

        <div className="flex gap-2">
           <button className="p-2 bg-black/50 backdrop-blur-md text-white/80 rounded-lg border border-white/10 hover:bg-white/10 pointer-events-auto transition-all">
             <Maximize2 size={16} />
           </button>
        </div>
      </div>

      {/* Target Reticle (Simulated) */}
      <div 
         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300"
         style={{ 
           transform: `translate(calc(-50% - ${telemetry?.head?.yaw || 0} * 2px), calc(-50% - ${telemetry?.head?.pitch || 0} * 2px))`
         }}
      >
        <div className="relative w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center">
           <div className={`w-1 h-20 absolute border-r border-white/20`} />
           <div className={`h-1 w-20 absolute border-b border-white/20`} />
           <Target size={24} className={`${(telemetry?.task_zone?.deviation_deg || 0) < 15 ? 'text-emerald-400' : 'text-red-400'} opacity-80`} />
        </div>
      </div>

      {/* Telemetry Minimal Overlay */}
      <div className="absolute bottom-6 left-6 flex gap-4 pointer-events-none">
         <TelemetryTag label="YAW" value={telemetry?.head?.yaw?.toFixed(1) || "0.0"} />
         <TelemetryTag label="ANG VEL" value={telemetry?.head?.angular_velocity?.toFixed(2) || "0.00"} />
         <TelemetryTag label="DEV" value={telemetry?.task_zone?.deviation_deg?.toFixed(1) || "0.0"} highlight={(telemetry?.task_zone?.deviation_deg || 0) > 30} />
      </div>

      {/* Hands interaction Indicator */}
      <div className="absolute bottom-6 right-6 flex gap-2">
         <div className={`px-2 py-1 rounded bg-black/50 border border-white/10 flex items-center gap-1.5 ${telemetry?.left_hand?.near_object ? 'text-blue-400' : 'text-white/40'}`}>
            <MousePointer2 size={10} />
            <span className="text-[9px] font-black uppercase">L-HAND</span>
         </div>
         <div className={`px-2 py-1 rounded bg-black/50 border border-white/10 flex items-center gap-1.5 ${telemetry?.right_hand?.near_object ? 'text-blue-400' : 'text-white/40'}`}>
            <MousePointer2 size={10} />
            <span className="text-[9px] font-black uppercase">R-HAND</span>
         </div>
      </div>
    </div>
  );
}

function TelemetryTag({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className={`bg-black/50 backdrop-blur-md px-3 py-1.5 border rounded-lg flex flex-col ${highlight ? 'border-red-500/50 text-red-400' : 'border-white/10 text-white/60'}`}>
       <span className="text-[8px] font-black uppercase tracking-tighter leading-none mb-1 opacity-50">{label}</span>
       <span className="text-xs font-black tracking-widest leading-none">{value}</span>
    </div>
  );
}
