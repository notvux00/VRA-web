"use client";

import React, { useState } from "react";
import { PlayCircle, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { startLessonOnDevice } from "@/lib/firebase/rtdb";
import { useAuth } from "@/contexts/AuthContext";

interface StartLessonButtonProps {
  /** Document ID trên Firestore — chính là key để VR fetch metadata */
  lessonDocId: string;
  /** Tên file .unity (VD: "Bathroom", "Farm") */
  sceneName: string;
  /** Tên bài học hiển thị */
  lessonName: string;
  /** Mã PIN đang kết nối với Kính VR */
  pin: string;
  /** ID hồ sơ trẻ đang được chọn */
  childId: string;
}

export default function StartLessonButton({
  lessonDocId,
  sceneName,
  lessonName,
  pin,
  childId,
}: StartLessonButtonProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  // ✅ Đọc URL live — đảm bảo lấy trạng thái thực tế ngay tại thời điểm bấm
  // Khi VRConnectionMonitor xoá ?pin&vr khỏi URL, hook này sẽ re-render tức thì
  const searchParams = useSearchParams();
  const livePin = searchParams.get("pin") || pin;
  const isVRConnected = searchParams.get("vr") === "connected";

  const handleStart = async () => {
    // Guard 1: Không có PIN → chưa ghép nối
    if (!livePin) {
      setStatus("error");
      setErrorMsg("Chưa kết nối Kính VR. Vui lòng ghép nối trước.");
      return;
    }

    // Guard 2: PIN có nhưng trạng thái VR không còn "connected" trong URL
    // → Đây là trường hợp kính VR đã tắt app ngay sau khi render trang
    if (!isVRConnected) {
      setStatus("error");
      setErrorMsg("Kính VR đã mất kết nối. Vui lòng kiểm tra thiết bị và ghép nối lại.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      // Gửi lệnh khởi chạy lên RTDB → Kính VR sẽ nhận và chuyển Scene
      const sessionId = await startLessonOnDevice(livePin, sceneName, lessonDocId, user?.uid || "");

      setStatus("success");

      // Chuyển hướng sang trang Session sau 1.2 giây (để user nhìn thấy tick xanh)
      setTimeout(() => {
        const q = new URLSearchParams();
        q.set("childId", childId);
        q.set("pin", livePin);
        q.set("vr", "connected"); // ⚠️ QUAN TRỌNG: Phải có vr=connected để dashboard không tưởng là mất pin
        q.set("session", sessionId);
        q.set("lesson", lessonDocId);
        router.push(`/dashboard/expert/session/${sessionId}?${q.toString()}`);
      }, 1200);
    } catch (error: any) {
      console.error("StartLesson Error:", error);
      setStatus("error");
      setErrorMsg(error.message || "Không thể gửi lệnh tới Kính VR.");
    }
  };

  // Nếu chưa có PIN hoặc VR đã ngắt kết nối → Hiện nút xám disabled
  if (!livePin || !isVRConnected) {
    return (
      <button
        disabled
        className="w-full mt-2 py-4 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 cursor-not-allowed border border-zinc-300 dark:border-zinc-700"
      >
        <AlertCircle size={16} />
        {!livePin ? "Chưa kết nối VR" : "VR mất kết nối"}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleStart}
        disabled={status === "sending" || status === "success"}
        className={`w-full mt-2 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${
          status === "success"
            ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20"
            : status === "sending"
            ? "bg-blue-500 text-white/80 cursor-wait"
            : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 shadow-xl shadow-zinc-200/50 dark:shadow-none"
        }`}
      >
        {status === "sending" && (
          <>
            <Loader2 size={18} className="animate-spin" />
            Đang gửi lệnh...
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={18} />
            Đã gửi — Đang chuyển hướng...
          </>
        )}
        {status === "idle" && (
          <>
            <PlayCircle size={18} />
            Khởi chạy trên Kính VR
          </>
        )}
        {status === "error" && (
          <>
            <PlayCircle size={18} />
            Thử lại
          </>
        )}
      </button>

      {/* Error message */}
      {status === "error" && errorMsg && (
        <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">{errorMsg}</p>
        </div>
      )}
    </>
  );
}
