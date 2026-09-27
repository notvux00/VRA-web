/**
 * Converts a Firebase Storage download URL to a server-side proxy URL.
 * This prevents the Firebase Storage URL (with token) from being exposed in the browser.
 *
 * Input:  https://firebasestorage.googleapis.com/v0/b/{bucket}/o/lesson_image%2Fintro.png?alt=media&token=xxx
 * Output: /api/image?path=lesson_image%2Fintro.png
 */
export function toProxyUrl(storageUrl: string | null | undefined): string | null {
  if (!storageUrl) return null;

  try {
    const u = new URL(storageUrl);
    // Firebase Storage URL format: /v0/b/{bucket}/o/{encodedPath}
    const parts = u.pathname.split("/o/");
    if (parts.length < 2) return storageUrl;

    const storagePath = decodeURIComponent(parts[1]);
    return `/api/image?path=${encodeURIComponent(storagePath)}`;
  } catch {
    return storageUrl; // fallback — better to show image than break
  }
}
