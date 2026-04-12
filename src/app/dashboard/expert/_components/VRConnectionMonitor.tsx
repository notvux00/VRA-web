"use client";

import { useEffect } from "react";
import { rtdb } from "@/lib/firebase/client";
import { ref, onValue } from "firebase/database";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function VRConnectionMonitor({ pin }: { pin: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!pin) return;

    const pinRef = ref(rtdb, `pairing_codes/${pin}`);
    const unsubscribe = onValue(pinRef, (snapshot) => {
      if (!snapshot.exists()) {
        console.warn(`[VR Monitor] Mã PIN ${pin} không còn tồn tại trên RTDB.`);
        
        // Xóa tham số pin và vr khỏi URL (tự động cập nhật giao diện thành "Chưa kết nối")
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.delete("pin");
        current.delete("vr");
        
        // Hiện thông báo (tạm dùng alert cùi bắp, sau này anh có thể đổi sang Toast popup cho đẹp)
        alert("⚠️ Kính VR đã ngắt kết nối (hoặc tắt ứng dụng đột ngột). Vui lòng ghép nối lại nếu muốn tiếp tục!");
        
        router.push(`${pathname}?${current.toString()}`);
      }
    });

    // Cleanup listener khi component unmount
    return () => unsubscribe();
  }, [pin, router, searchParams, pathname]);

  return null; // Component tàng hình, chỉ làm nhiệm vụ "nghe lén"
}
