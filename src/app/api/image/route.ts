import { NextRequest, NextResponse } from "next/server";
import { adminAuth, admin } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  // Require valid session
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) return new NextResponse(null, { status: 401 });
  try {
    // No revocation check here — this only gates read access to non-sensitive
    // lesson images, so a local JWT verify (no network round-trip) is enough.
    await adminAuth.verifySessionCookie(sessionCookie);
  } catch {
    return new NextResponse(null, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path) return new NextResponse(null, { status: 400 });

  try {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) return new NextResponse(null, { status: 500 });

    const bucket = admin.storage().bucket(bucketName);
    const file = bucket.file(path);

    // Fetch metadata and content together instead of exists() -> getMetadata() -> download()
    // in sequence; download() itself throws (caught below) when the file is missing.
    const [[metadata], [buffer]] = await Promise.all([
      file.getMetadata(),
      file.download(),
    ]);
    const contentType = (metadata.contentType as string) || "image/jpeg";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        // Lesson images are non-sensitive content — CDN can cache publicly
        // Browser: 1h | Vercel Edge CDN: 24h
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code === 404) return new NextResponse(null, { status: 404 });
    console.error("[ImageProxy] Error:", err);
    return new NextResponse(null, { status: 500 });
  }
}
