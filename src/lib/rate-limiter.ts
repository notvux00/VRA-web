import { adminDb } from "@/lib/firebase/admin";

/**
 * Sliding-window rate limiter backed by Firestore.
 * Works correctly across Vercel serverless instances.
 *
 * @param uid       Firebase UID của user
 * @param action    Tên hành động (e.g. "ai_recs", "chatbot")
 * @param maxCalls  Số lần tối đa trong cửa sổ thời gian
 * @param windowMs  Kích thước cửa sổ thời gian (milliseconds)
 */
export async function checkRateLimit(
  uid: string,
  action: string,
  maxCalls: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMs?: number }> {
  const key = `${uid}_${action}`;
  const docRef = adminDb.collection("rate_limits").doc(key);
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    return await adminDb.runTransaction(async (tx) => {
      const doc = await tx.get(docRef);
      // Lọc các timestamp nằm trong cửa sổ hiện tại
      const timestamps: number[] = doc.exists
        ? (doc.data()?.timestamps ?? []).filter((t: number) => t > windowStart)
        : [];

      if (timestamps.length >= maxCalls) {
        const oldestInWindow = Math.min(...timestamps);
        const retryAfterMs = oldestInWindow + windowMs - now;
        return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) };
      }

      timestamps.push(now);
      tx.set(docRef, { timestamps, uid, action, updatedAt: now });
      return { allowed: true };
    });
  } catch (err) {
    // Nếu Firestore lỗi, cho phép request đi qua (fail open) để không block user
    console.error("[RateLimit] Firestore error, fail-open:", err);
    return { allowed: true };
  }
}

/** Format thời gian chờ thành chuỗi tiếng Việt dễ đọc */
export function formatRetryAfter(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} giây`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} phút`;
}
