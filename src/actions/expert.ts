"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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

/**
 * Fetch all children assigned to this expert
 */
export async function getAssignedChildren() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const snapshot = await adminDb.collection("child_profiles")
      .where("expertUid", "==", session.uid)
      .get();
    
    const children = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, children };
  } catch (error: any) {
    console.error("Error fetching assigned children:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch stats for the Expert Dashboard
 */
export async function getExpertStats() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    // 1. Total Assigned Children
    const childrenSnap = await adminDb.collection("child_profiles")
      .where("expertUid", "==", session.uid)
      .count()
      .get();
    
    // 2. Total Sessions Hosted by this Expert
    const sessionsSnap = await adminDb.collection("sessions")
      .where("hostedBy", "==", session.uid)
      .count()
      .get();

    // 3. Active Sessions (Placeholder until status is fully implemented)
    const activeSessionsSnap = await adminDb.collection("sessions")
      .where("hostedBy", "==", session.uid)
      .where("status", "==", "in-progress")
      .count()
      .get();

    return {
      success: true,
      stats: {
        totalChildren: childrenSnap.data().count,
        totalSessions: sessionsSnap.data().count,
        activeSessions: activeSessionsSnap.data().count,
      }
    };
  } catch (error: any) {
    console.error("Error fetching expert stats:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch a specific assigned child detail
 * This ensures the Expert actually has access to this child
 */
export async function getAssignedChildDetail(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const doc = await adminDb.collection("child_profiles").doc(childId).get();
    
    if (!doc.exists) return { success: false, error: "Child profile not found" };
    
    const data = doc.data();
    if (data?.expertUid !== session.uid) {
      return { success: false, error: "Unauthorized access to this child profile" };
    }
    
    return { 
      success: true, 
      child: { id: doc.id, ...data } 
    };
  } catch (error: any) {
    console.error("Error fetching assigned child detail:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update the Alert Profile for a child
 */
export async function updateAlertProfile(childId: string, alertProfile: any) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    const childDoc = await childRef.get();
    
    if (!childDoc.exists) return { success: false, error: "Child profile not found" };
    
    const data = childDoc.data();
    if (data?.expertUid !== session.uid) {
      return { success: false, error: "Unauthorized: You are not assigned to this child" };
    }
    
    await childRef.update({
      alert_profile: {
        ...alertProfile,
        last_updated_by: session.uid,
        last_updated_at: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    });
    
    revalidatePath(`/dashboard/expert/stats?childId=${childId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating alert profile:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Save and finalize a session
 */
export async function finalizeSession(childId: string, data: {
  lessonName: string,
  duration: string,
  score: number,
  evaluation: string,
  alerts: any[],
  behaviorLogs: any[]
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const sessionRef = adminDb.collection("sessions").doc();
    const sessionId = sessionRef.id;

    const sessionData = {
      id: sessionId,
      childId: childId,
      hostedBy: session.uid,
      lessonName: data.lessonName,
      duration: data.duration,
      score: data.score,
      evaluation: data.evaluation,
      alerts: data.alerts,
      behaviorLogs: data.behaviorLogs,
      status: "completed",
      startTime: new Date(Date.now() - 600000).toISOString(), // Mock start time 10m ago
      endTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await sessionRef.set(sessionData);

    // Update child record (increments session count, update last session time)
    const childRef = adminDb.collection("child_profiles").doc(childId);
    const childSnap = await childRef.get();
    const currentCount = childSnap.data()?.sessionCount || 0;

    await childRef.update({
      sessionCount: currentCount + 1,
      lastSessionAt: new Date().toLocaleDateString("vi-VN"),
      updatedAt: new Date().toISOString()
    });

    revalidatePath(`/dashboard/expert/history?childId=${childId}`);
    revalidatePath("/dashboard/expert");
    
    return { success: true, sessionId };
  } catch (error: any) {
    console.error("Error finalizing session:", error);
    return { success: false, error: error.message };
  }
}
