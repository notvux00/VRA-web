"use client";

import React from "react";
import {
  Eye, Monitor, Maximize2,
  Target, Zap, MousePointer2
} from "lucide-react";

interface POVMonitorProps {
  telemetry: any;
  childName: string;
  stream: MediaStream | null;
  connectionState: string;
}

export default function POVMonitor({ telemetry, childName, stream, connectionState }: POVMonitorProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      const track = stream.getVideoTracks()[0];
      console.log(`[WebRTC] Track status: readyState=${track?.readyState}, muted=${track?.muted}, enabled=${track?.enabled}`);
      videoRef.current.play().catch(e => console.warn("[WebRTC] Autoplay failed:", e));
    }
  }, [stream, connectionState]);
  // Use a nice placeholder image for VR POV
  const POV_PLACEHOLDER = "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="relative aspect-video bg-zinc-950 rounded-3xl overflow-hidden border-4 border-zinc-900 group shadow-2xl">

      {/* VR POV Video Stream */}
      {connectionState === 'connected' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-100 opacity-100"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-100 opacity-60"
          style={{
            backgroundImage: `url(${POV_PLACEHOLDER})`,
            transform: `scale(1.1) translate(${telemetry?.head?.yaw || 0}px, ${telemetry?.head?.pitch || 0}px)`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-zinc-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              {connectionState === 'connecting' && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />}
              {connectionState === 'disconnected' && <div className="w-2 h-2 bg-red-500 rounded-full" />}
              {connectionState === 'connecting' ? 'Đang kết nối camera...' : 'Mất kết nối camera'}
            </span>
          </div>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Top Header info */}
      <div className="absolute top-4 left-6 right-6 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE VR POV</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="p-2 bg-black/50 backdrop-blur-md text-white/80 rounded-lg border border-white/10 hover:bg-white/10 pointer-events-auto transition-all">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Target Reticle Removed */}

    </div>
  );
}
