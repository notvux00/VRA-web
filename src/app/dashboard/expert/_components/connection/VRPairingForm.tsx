"use client";

import React, { useState, useRef } from "react";
import { AlertCircle, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { rtdb } from "@/lib/firebase/client";
import { ref, get, update } from "firebase/database";

interface VRPairingFormProps {
  childId?: string;
}

export default function VRPairingForm({ childId }: VRPairingFormProps) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const handleVerify = async () => {
    if (pin.some(digit => !digit)) return;

    setStatus("verifying");
    setErrorMsg("");

    const pinCode = pin.join("");

    try {
      const pinRef = ref(rtdb, `pairing_codes/${pinCode}`);
      const snapshot = await get(pinRef);

      if (!snapshot.exists()) {
        setStatus("error");
        setErrorMsg("Mã PIN không tồn tại hoặc đã hết hạn.");
        return;
      }

      const data = snapshot.val();
      if (data.status !== "waiting") {
        setStatus("error");
        setErrorMsg("Thiết bị không ở trạng thái chờ ghép nối.");
        return;
      }

      const sessionId = crypto.randomUUID();

      await update(pinRef, {
        status: "paired",
        child_profile_id: childId || "UNKNOWN_CHILD",
        session_id: sessionId,
      });

      setStatus("success");
      setTimeout(() => {
        const current = new URLSearchParams(searchParams.toString());
        current.set("vr", "connected");
        current.set("session", sessionId);
        router.push(`/dashboard/expert/connection?${current.toString()}`);
      }, 1500);
    } catch (err) {
      console.error("VRPairingForm error:", err);
      setStatus("error");
      setErrorMsg("Lỗi kết nối. Vui lòng thử lại.");
    }
  };

  const isComplete = pin.every(d => d !== "");

  return (
    <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col items-center gap-6">
        {/* 6 ô nhập PIN */}
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
              disabled={status === "verifying" || status === "success"}
              className={`w-10 h-14 text-center text-xl font-black bg-white dark:bg-zinc-900 border-2 rounded-xl outline-none transition-all
                ${status === "error" ? "border-red-400 focus:ring-red-500/10" : "border-zinc-100 dark:border-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"}
                ${status === "success" ? "border-emerald-400" : ""}
              `}
            />
          ))}
        </div>

        {/* Thông báo trạng thái */}
        {status === "error" && (
          <div className="flex items-center gap-2 text-red-500 animate-in fade-in">
            <AlertCircle size={14} />
            <span className="text-[11px] font-bold uppercase tracking-widest">{errorMsg}</span>
          </div>
        )}
        {status === "success" && (
          <div className="flex items-center gap-2 text-emerald-500 animate-in fade-in">
            <CheckCircle2 size={14} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Ghép nối thành công!</span>
          </div>
        )}

        {/* Nút bấm */}
        <button
          onClick={handleVerify}
          disabled={!isComplete || status === "verifying" || status === "success"}
          className={`w-full py-3.5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
            !isComplete
              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800"
              : "bg-zinc-900 text-white hover:bg-blue-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-blue-600 dark:hover:text-white shadow-xl shadow-zinc-500/10"
          }`}
        >
          {status === "verifying" ? (
            <Loader2 size={20} className="animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 size={20} className="text-emerald-400" />
          ) : (
            <>
              <span>Kết nối thiết bị</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* Hướng dẫn từng bước */}
      <div className="space-y-6 pt-6 border-t border-zinc-50 dark:border-zinc-800">
        {[
          "Khởi chạy ứng dụng VRA trên thiết bị VR của bạn.",
          "Mã PIN gồm 6 chữ số sẽ xuất hiện trên màn hình chính của thiết bị VR.",
          "Nhập mã đó vào các ô phía trên để thiết lập kết nối điều khiển thời gian thực.",
        ].map((text, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 text-xs font-black shrink-0">
              {i + 1}
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
