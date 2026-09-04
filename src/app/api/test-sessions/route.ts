import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const s = await adminDb.collection("sessions").limit(5).get();
    const data = s.docs.map(d => d.data());
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
