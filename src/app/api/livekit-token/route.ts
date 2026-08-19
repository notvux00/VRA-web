import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

  const apiKey = process.env.LIVEKIT_API_KEY || "API713e89647225";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "SECa713e89647225";
  const wsUrl = process.env.LIVEKIT_URL || "wss://vra-9jrt51dr.livekit.cloud";

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
  } catch (error: any) {
    console.error("[LiveKitToken] Error generating token:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}
