import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { checkRateLimit, formatRetryAfter } from "@/lib/rate-limiter";

// Parents don't join live VR sessions directly — only staff-side roles do.
const ALLOWED_ROLES = ["admin", "center", "expert", "therapist"];

export async function GET(req: NextRequest) {
  // Verify session cookie — reject unauthenticated callers
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let uid: string;
  try {
    const claims = await adminAuth.verifySessionCookie(sessionCookie);
    if (!ALLOWED_ROLES.includes(claims.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    uid = claims.uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 20 lần cấp token / 10 phút / user (đủ cho join/reconnect nhiều lần)
  const rl = await checkRateLimit(uid, "livekit_token", 20, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${formatRetryAfter(rl.retryAfterMs ?? 60000)}.` },
      { status: 429 }
    );
  }

  const room = req.nextUrl.searchParams.get("room");
  const username =
    req.nextUrl.searchParams.get("username") ||
    `expert_${Math.random().toString(36).substring(7)}`;

  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" query parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "LiveKit server environment variables not configured" },
      { status: 500 }
    );
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      ttl: "4h",
    });

    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    return NextResponse.json({ token, wsUrl });
  } catch (error: unknown) {
    console.error("[LiveKitToken] Error generating token:", error);
    return NextResponse.json(
      { error: (error as any)?.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}
