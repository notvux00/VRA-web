"use client";

import { rtdb } from "@/lib/firebase/client";
import { ref, get, update, remove } from "firebase/database";

// ─────────────────────────────────────────────────────
// Tất cả logic RTDB pairing nằm ở đây, các component chỉ gọi hàm
// ─────────────────────────────────────────────────────

/**
 * Kết nối (Pair) với thiết bị VR bằng mã PIN.
 * Ghi child_id hiện tại vào RTDB ngay lập tức.
 * Trả về pin.
 */
export async function pairWithDevice(pinCode: string, childId: string): Promise<{ pin: string }> {
  const pinRef = ref(rtdb, `pairing_codes/${pinCode}`);
  const snapshot = await get(pinRef);

  if (!snapshot.exists()) {
    throw new Error("Mã PIN không tồn tại hoặc đã hết hạn.");
  }

  const data = snapshot.val();
  if (data.status !== "waiting") {
    throw new Error("Thiết bị không ở trạng thái chờ ghép nối.");
  }

  // Không tạo sessionId lúc Pair, chỉ cập nhật trạng thái
  await update(pinRef, {
    status: "paired",
    current_child_id: childId || "",
  });

  return { pin: pinCode };
}

/**
 * Gửi lệnh chạy Bài học tới Kính VR.
 * Lúc này mới sinh SessionId và truyền kèm theo LessonId.
 */
export async function startLessonOnDevice(pinCode: string, lessonId: string): Promise<string> {
  const pinRef = ref(rtdb, `pairing_codes/${pinCode}`);
  const sessionId = crypto.randomUUID();

  await update(pinRef, {
    current_lesson_id: lessonId,
    current_session_id: sessionId,
  });

  return sessionId;
}

/**
 * Cập nhật child_id trên RTDB khi Expert đổi hồ sơ trẻ.
 * Gọi hàm này mỗi khi user chọn profile mới.
 */
export async function updateChildOnDevice(pinCode: string, childId: string): Promise<void> {
  const pinRef = ref(rtdb, `pairing_codes/${pinCode}`);
  await update(pinRef, {
    current_child_id: childId || "",
  });
}

/**
 * Ngắt kết nối: set status về "disconnected" và xoá các field session.
 */
export async function disconnectDevice(pinCode: string): Promise<void> {
  const pinRef = ref(rtdb, `pairing_codes/${pinCode}`);
  await update(pinRef, {
    status: "waiting", // Đưa về lại trạng thái chờ để có thể kết nối lại bằng chính PIN này
    current_child_id: "",
    current_lesson_id: "",
    current_session_id: "",
  });
}
