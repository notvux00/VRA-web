"use server";

import { adminDb } from "@/lib/firebase/admin";
import { Session, AutoAlert } from "@/types";
import { getCachedChildSessions } from "./history";
import { calculateRadarData } from "@/lib/analytics/statsProcessor";

export async function getChildAlertStats(childId: string) {
  try {
    const sessions = await getCachedChildSessions(childId);
    // Cast to Session[] to satisfy typescript, although our cache already returns the right shape
    const radarData = calculateRadarData(sessions as Session[]);

    return { success: true, radarData };
  } catch (error: unknown) {
    console.error("Error fetching child alert stats:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
