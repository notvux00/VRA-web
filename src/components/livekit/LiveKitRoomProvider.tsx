"use client";

import React, { useEffect, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { Loader2, AlertCircle } from "lucide-react";

interface LiveKitRoomProviderProps {
  roomName: string;
  username?: string;
  children: React.ReactNode;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function LiveKitRoomProvider({
  roomName,
  username,
  children,
  onConnected,
  onDisconnected,
}: LiveKitRoomProviderProps) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomName) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    let isMounted = true;
    Promise.resolve().then(() => {
      setLoading(true);
      setError(null);
    });

    async function fetchToken() {
      try {
        const query = new URLSearchParams({ room: roomName });
        if (username) query.set("username", username);

        const res = await fetch(`/api/livekit-token?${query.toString()}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Không thể lấy LiveKit Token");
        }
        const data = await res.json();
        if (isMounted) {
          setToken(data.token);
          setServerUrl(data.wsUrl);
          setLoading(false);
        }
      } catch (err: unknown) {
        console.error("[LiveKitRoomProvider] Token error:", err);
        if (isMounted) {
          setError((err instanceof Error ? err.message : String(err)) || "Lỗi kết nối máy chủ LiveKit");
          setLoading(false);
        }
      }
    }

    fetchToken();
    return () => {
      isMounted = false;
    };
  }, [roomName, username]);

  if (error) {
    return (
      <div className="h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8">
        <AlertCircle className="mb-4 text-red-500" size={48} />
        <h2 className="text-xl font-bold uppercase tracking-widest text-red-400 mb-2">
          Lỗi kết nối LiveKit
        </h2>
        <p className="text-zinc-400 text-sm max-w-md text-center mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (loading || !token || !serverUrl) {
    return (
      <div className="h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8">
        <Loader2 className="animate-spin mb-4 text-emerald-500" size={48} />
        <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400">
          Đang khởi tạo phòng LiveKit...
        </h2>
        <p className="text-zinc-500 text-sm mt-2">Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      onConnected={onConnected}
      onDisconnected={onDisconnected}
    >
      {children}
    </LiveKitRoom>
  );
}
