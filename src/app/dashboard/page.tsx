"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Get the session cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const session = getCookie("session");
    
    if (!session) {
      router.push("/");
      return;
    }

    try {
      // 2. Decode the role from JWT and redirect client-side
      const payloadBase64 = session.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const role = decodedPayload.role;

      if (role === "admin") router.push("/dashboard/admin");
      else if (role === "center") router.push("/dashboard/center");
      else if (role === "expert") router.push("/dashboard/expert");
      else if (role === "parent") router.push("/dashboard/parent");
      else {
        // Fallback or wait a bit for role propagation
        const timer = setTimeout(() => window.location.reload(), 2000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 animate-pulse">Đang chuyển hướng đến trang tổng quan của bạn...</p>
      </div>
    </div>
  );
}
