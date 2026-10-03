"use client";

import { useEffect } from "react";
import { AlertTriangle, LogOut, RefreshCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { logout } = useAuth();
  
  const isUnauthorized =
    error.message.includes("Unauthorized") ||
    error.message.includes("Invalid session") ||
    error.message.includes("No session") ||
    error.message.includes("Forbidden");

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard Global Error:", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
      </div>
      
      <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">
        {isUnauthorized ? "Phiên làm việc đã hết hạn" : "Đã xảy ra lỗi"}
      </h2>
      
      <p className="mb-8 max-w-md text-zinc-500 dark:text-zinc-400">
        {isUnauthorized 
          ? "Rất tiếc, phiên đăng nhập của bạn đã hết hạn để đảm bảo an toàn. Vui lòng đăng nhập lại để tiếp tục." 
          : "Có lỗi xảy ra trong quá trình tải dữ liệu. Bạn có thể thử lại hoặc quay lại trang chủ."}
      </p>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        {isUnauthorized ? (
          <button
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/25"
          >
            <LogOut size={18} />
            Đăng nhập lại ngay
          </button>
        ) : (
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/25"
          >
            <RefreshCcw size={18} />
            Thử lại
          </button>
        )}
      </div>
      
      {/* Show raw error message for debugging in dev mode if not unauth */}
      {!isUnauthorized && process.env.NODE_ENV !== "production" && (
        <div className="mt-8 max-w-2xl rounded-lg bg-zinc-100 p-4 text-left text-xs text-red-500 dark:bg-zinc-900 overflow-auto">
          <code>{error.message}</code>
        </div>
      )}
    </div>
  );
}
