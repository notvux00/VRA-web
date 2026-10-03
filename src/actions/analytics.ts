"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { Session, AutoAlert } from "@/types";
import { getCachedChildSessions } from "./history";
import { calculateRadarData } from "@/lib/analytics/statsProcessor";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";

async function getSession() {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}

export async function getChildAlertStats(childId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized: No session");

    const sessions = await getCachedChildSessions(childId);
    // Cast to Session[] to satisfy typescript, although our cache already returns the right shape
    const radarData = calculateRadarData(sessions as Session[]);

    return { success: true, radarData };
  } catch (error: unknown) {
    console.error("Error fetching child alert stats:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
