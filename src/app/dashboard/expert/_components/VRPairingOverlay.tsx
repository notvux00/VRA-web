"use client";

import React, { useState } from "react";
import { Smartphone, Cast, CheckCircle2, Loader2, X, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface VRPairingOverlayProps {
  onConnect?: () => void;
  onSkip?: () => void;
  childName: string;
}

export default function VRPairingOverlay({ onConnect, onSkip, childName }: VRPairingOverlayProps) {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleConnect = () => {
    if (pin.length < 3) return;
    
    setStatus("connecting");
    // Simulated delay for demo
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set("vr", "connected");
        router.push(`/dashboard/expert?${current.toString()}`);
        onConnect?.();
      }, 1500);
    }, 2000);
  };

  const handleSkip = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("vr", "skipped");
    router.push(`/dashboard/expert?${current.toString()}`);
    onSkip?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-[340px] rounded-[2rem] overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-500">
        
        {/* Header Illustration */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col items-center gap-3">
             <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl">
                {status === 'success' ? (
                  <CheckCircle2 size={32} className="text-emerald-400 animate-in zoom-in" />
                ) : (
                  <Cast size={32} className={status === 'connecting' ? 'animate-pulse' : ''} />
                )}
             </div>
             <h2 className="text-xl font-black uppercase tracking-tighter">Kết nối VR</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {status === 'success' ? (
            <div className="text-center py-6 space-y-3 animate-in fade-in slide-in-from-bottom-4">
               <h3 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">KẾT NỐI THÀNH CÔNG</h3>
               <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Đang chuyển hướng đến bảng điều khiển...</p>
               <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mt-4" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] block text-center">
                  NHẬP MÃ PIN (VD: ABC-123)
                </label>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Mã PIN hiển thị trên kính"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.toUpperCase())}
                    className="w-full text-2xl font-black tracking-[0.3em] text-center py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all uppercase placeholder:text-zinc-300 dark:placeholder:text-zinc-600 placeholder:tracking-normal placeholder:text-sm"
                    maxLength={10}
                    disabled={status === 'connecting'}
                  />
                  {status === 'connecting' && (
                    <div className="absolute inset-x-0 -bottom-8 flex items-center justify-center gap-2">
                       <Loader2 size={14} className="text-blue-600 animate-spin" />
                       <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Đang xác thực...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleConnect}
                  disabled={pin.length < 3 || status === 'connecting'}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Cast size={20} />
                  Kết nối ngay
                </button>
                <button 
                  onClick={handleSkip}
                  disabled={status === 'connecting'}
                  className="w-full py-4 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest rounded-2xl border border-zinc-100 dark:border-zinc-700 transition-all active:scale-95"
                >
                  Bỏ qua kết nối
                </button>
              </div>

              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                  Đảm bảo Kính VR đã được bật và kết nối mạng để nhận tín hiệu điều khiển từ Dashboard này.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
