"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, ChevronRight, Loader2 } from "lucide-react";

export default function VRPairingForm() {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (pin.some(digit => !digit)) return;
    setIsVerifying(true);
    // Giả lập xác thực
    setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("vr", "connected");
      window.location.href = url.toString();
    }, 2000);
  };

  return (
    <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-center gap-3">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-10 h-14 text-center text-xl font-black bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={pin.some(digit => !digit) || isVerifying}
          className={`w-full py-3.5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
            pin.some(digit => !digit) 
              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800" 
              : "bg-zinc-900 text-white hover:bg-blue-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-blue-600 dark:hover:text-white shadow-xl shadow-zinc-500/10"
          }`}
        >
          {isVerifying ? (
             <Loader2 size={20} className="animate-spin" />
          ) : (
             <>
               <span>Kết nối thiết bị</span>
               <ChevronRight size={18} />
             </>
          )}
        </button>
      </div>

      <div className="space-y-6 pt-6 border-t border-zinc-50 dark:border-zinc-800">
         <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 text-xs font-black">1</div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Khởi chạy ứng dụng <span className="text-zinc-900 dark:text-white font-bold">VRA</span> trên thiết bị VR của bạn.</p>
         </div>
         <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 text-xs font-black">2</div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Mã PIN gồm 6 chữ số sẽ xuất hiện trên màn hình chính của thiết bị VR.</p>
         </div>
         <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 text-xs font-black">3</div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Nhập mã đó vào các ô phía trên để thiết lập kết nối điều khiển thời gian thực.</p>
         </div>
      </div>
    </div>
  );
}
