// @ts-nocheck
"use client";

import React from "react";
import { Track, ConnectionState } from "livekit-client";
import {
  useTracks,
  VideoTrack,
  useConnectionState,
  useRoomContext,
} from "@livekit/components-react";
import { Maximize2 } from "lucide-react";

interface LiveKitPOVViewerProps {
  telemetry?: unknown;
  childName?: string;
}

const POV_PLACEHOLDER =
  "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1200&auto=format&fit=crop";

export function LiveKitPOVViewer({ telemetry, childName }: LiveKitPOVViewerProps) {
  let hasRoomContext = false;
  try {
    const room = useRoomContext();
    hasRoomContext = Boolean(room);
  } catch (e) {
    hasRoomContext = false;
  }

  if (!hasRoomContext) {
    return (
      <POVPlaceholder
        telemetry={telemetry}
        message="Đang khởi tạo phòng LiveKit..."
      />
    );
  }

  return <LiveKitTrackDisplay telemetry={telemetry} childName={childName} />;
}

function LiveKitTrackDisplay({ telemetry }: LiveKitPOVViewerProps) {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const connectionState = useConnectionState();

  const cameraTrack = tracks.find(
    (t) => t.source === Track.Source.Camera && t.publication.kind === "video"
  );

  const isConnected = connectionState === ConnectionState.Connected;
  const isConnecting =
    connectionState === ConnectionState.Connecting ||
    connectionState === ConnectionState.Reconnecting;

  const hasVideo = isConnected && cameraTrack && cameraTrack.publication.isSubscribed;

  if (!hasVideo) {
    const message = isConnecting
      ? "Đang kết nối camera LiveKit..."
      : isConnected
      ? "Đang chờ luồng video từ kính VR..."
      : "Mất kết nối camera";

    return (
      <POVPlaceholder
        telemetry={telemetry}
        isConnecting={isConnecting}
        isConnected={isConnected}
        message={message}
      />
    );
  }

  return (
    <div className="relative aspect-video bg-zinc-950 rounded-3xl overflow-hidden border-4 border-zinc-900 group shadow-2xl">
      <VideoTrack
        trackRef={cameraTrack}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-100 opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
      <HeaderOverlay hasVideo={true} />
    </div>
  );
}

function POVPlaceholder({
  telemetry,
  isConnecting = false,
  isConnected = false,
  message,
}: {
  telemetry?: unknown;
  isConnecting?: boolean;
  isConnected?: boolean;
  message: string;
}) {
  return (
    <div className="relative aspect-video bg-zinc-950 rounded-3xl overflow-hidden border-4 border-zinc-900 group shadow-2xl">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-100 opacity-60"
        style={{
          backgroundImage: `url(${POV_PLACEHOLDER})`,
          transform: `scale(1.1) translate(${telemetry?.head?.yaw || 0}px, ${
            telemetry?.head?.pitch || 0
          }px)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="text-zinc-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            {isConnecting && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
            )}
            {!isConnected && !isConnecting && (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
            {message}
          </span>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
      <HeaderOverlay hasVideo={false} />
    </div>
  );
}

function HeaderOverlay({ hasVideo }: { hasVideo: boolean }) {
  return (
    <div className="absolute top-4 left-6 right-6 flex justify-between items-start pointer-events-none">
      <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              hasVideo
                ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"
                : "bg-amber-500"
            }`}
          />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            LIVE VR POV {hasVideo ? "(720p 30fps)" : ""}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          title="Toàn màn hình"
          onClick={() => {
            const el = document.querySelector(".aspect-video");
            if (el) {
              if (!document.fullscreenElement) {
                el.requestFullscreen().catch((err) => console.warn(err));
              } else {
                document.exitFullscreen().catch((err) => console.warn(err));
              }
            }
          }}
          className="p-2 bg-black/50 backdrop-blur-md text-white/80 rounded-lg border border-white/10 hover:bg-white/10 pointer-events-auto transition-all"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}
