"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

/**
 * Fetch all children assigned to this expert
 */
export async function getAssignedChildren(expertUid: string) {
  try {
    const snapshot = await adminDb.collection("child_profiles")
      .where("expertUids", "array-contains", expertUid)
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
export async function getExpertStats(expertUid: string) {
  try {
    // 1. Total Assigned Children
    const childrenSnap = await adminDb.collection("child_profiles")
      .where("expertUids", "array-contains", expertUid)
      .count()
      .get();
    
    // 2. Total Sessions Hosted by this Expert
    const sessionsSnap = await adminDb.collection("sessions")
      .where("hostedBy", "==", expertUid)
      .count()
      .get();

    // 3. Active Sessions (Placeholder until status is fully implemented)
    const activeSessionsSnap = await adminDb.collection("sessions")
      .where("hostedBy", "==", expertUid)
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
export async function getAssignedChildDetail(expertUid: string, childId: string) {
  try {
    const doc = await adminDb.collection("child_profiles").doc(childId).get();
    
    if (!doc.exists) return { success: false, error: "Child profile not found" };
    
    const data = doc.data();
    const expertUids = data?.expertUids || [];
    
    if (!expertUids.includes(expertUid)) {
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
export async function updateAlertProfile(expertUid: string, childId: string, alertProfile: any) {
  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    const childDoc = await childRef.get();
    
    if (!childDoc.exists) return { success: false, error: "Child profile not found" };
    
    const data = childDoc.data();
    const expertUids = data?.expertUids || [];
    
    if (!expertUids.includes(expertUid)) {
      return { success: false, error: "Unauthorized: You are not assigned to this child" };
    }
    
    await childRef.update({
      alert_profile: {
        ...alertProfile,
        last_updated_by: expertUid,
        last_updated_at: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    });
    
    revalidatePath(`/dashboard/expert/children/${childId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating alert profile:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Save and finalize a session
 */
export async function finalizeSession(expertUid: string, childId: string, data: {
  lessonName: string,
  duration: string,
  score: number,
  evaluation: string,
  alerts: any[],
  behaviorLogs: any[]
}) {
  try {
    const sessionRef = adminDb.collection("sessions").doc();
    const sessionId = sessionRef.id;

    const sessionData = {
      id: sessionId,
      childId: childId,
      hostedBy: expertUid,
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
    await adminDb.collection("child_profiles").doc(childId).update({
      sessionCount: (await adminDb.collection("child_profiles").doc(childId).get()).data()?.sessionCount + 1,
      lastSessionAt: new Date().toLocaleDateString("vi-VN"),
      updatedAt: new Date().toISOString()
    });

    revalidatePath(`/dashboard/expert/children/${childId}`);
    revalidatePath("/dashboard/expert");
    
    return { success: true, sessionId };
  } catch (error: any) {
    console.error("Error finalizing session:", error);
    return { success: false, error: error.message };
  }
}
