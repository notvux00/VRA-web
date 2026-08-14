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
 * Update goals for a child
 */
export async function updateChildGoals(childId: string, goals: any[]) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    const childDoc = await childRef.get();

    if (!childDoc.exists) return { success: false, error: "Child profile not found" };

    const data = childDoc.data();
    const isAssigned = data?.expertUid === session.uid || data?.expertUids?.includes(session.uid);
    if (!isAssigned) {
      return { success: false, error: "Unauthorized: You are not assigned to this child" };
    }

    await childRef.update({
      goals: goals,
      updatedAt: new Date().toISOString()
    });

    revalidatePath(`/dashboard/expert/stats`);
    revalidatePath(`/dashboard/parent/children/${childId}`);
    
    return { success: true };
  } catch (error: any) {
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
export async function finalizeSession(childId: string, sessionId: string, data: {
  lessonName: string,
  duration: string,
  score: number,
  status: string,
  evaluation: string,
  alerts: any[],
  behaviorLogs: any[]
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const sessionRef = adminDb.collection("sessions").doc(sessionId);

    // Convert duration "M:SS" back to total seconds (number) for DB consistency
    const durationParts = data.duration.split(':');
    const durationSeconds = durationParts.length === 2 
      ? parseInt(durationParts[0]) * 60 + parseInt(durationParts[1])
      : parseInt(data.duration) || 0;

    const sessionData = {
      session_id: sessionId,
      child_profile_id: childId,
      hosted_by: session.uid,
      duration: durationSeconds,
      score: data.score,
      evaluation: data.evaluation,
      auto_alerts: data.alerts, 
      behavior_logs: data.behaviorLogs,
      completion_status: data.status,
      finish_time: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await sessionRef.set(sessionData, { merge: true });

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

/**
 * Update the default lesson parameters for a child (Story 2.3)
 * Written as a nested map to Firestore: { actions: {...}, quiz: {...}, exploration: {...} }
 * Values of -1 indicate "use system default" (sentinel for VR Client fallback to Inspector).
 */
export async function updateDefaultLessonParams(childId: string, lessonParams: {
  actions: {
    enable_auto_hint: boolean;
    enable_visual_guidance: boolean;
    enable_bubble_hints: boolean;
    speech_silence_timeout: number;
    action_reminder_cycle: number;
    gaze_cone_angle: number;
  };
  quiz: {
    quiz_intro_delay: number;
    quiz_sound_gap: number;
    quiz_end_delay: number;
  };
  exploration: {
    camera_move_speed: number;
    sound_to_description_gap: number;
  };
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    const childDoc = await childRef.get();

    if (!childDoc.exists) return { success: false, error: "Child profile not found" };

    const data = childDoc.data();
    // Verify the expert is assigned to this child (either primary or in the array)
    const isAssigned = data?.expertUid === session.uid || data?.expertUids?.includes(session.uid);
    if (!isAssigned) {
      return { success: false, error: "Unauthorized: You are not assigned to this child" };
    }

    await childRef.update({
      default_lesson_params: lessonParams,
      updatedAt: new Date().toISOString()
    });

    revalidatePath(`/dashboard/expert/stats?childId=${childId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating default lesson params:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update the custom quick phrases for a child (Story 3.9)
 * Saves to childRef: { quick_phrases: Record<string, Record<string, string[]>> }
 */
export async function updateChildQuickPhrases(childId: string, quickPhrases: Record<string, any>) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    const childDoc = await childRef.get();

    if (!childDoc.exists) return { success: false, error: "Child profile not found" };

    const data = childDoc.data();
    const isAssigned = data?.expertUid === session.uid || data?.expertUids?.includes(session.uid);
    if (!isAssigned) {
      return { success: false, error: "Unauthorized: You are not assigned to this child" };
    }

    await childRef.update({
      quick_phrases: quickPhrases,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating child quick phrases:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Lazy-syncs a lesson's default phrases to the child's quick_phrases if they don't have them yet.
 * Returns the child's phrases for this specific lesson.
 */
export async function syncAndGetChildPhrases(childId: string, lessonDocId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    const childDoc = await childRef.get();

    if (!childDoc.exists) return { success: false, error: "Child profile not found" };

    const childData = childDoc.data();
    const quickPhrases = childData?.quick_phrases || {};

    if (!quickPhrases[lessonDocId]) {
      // Fetch default phrases from the lesson document
      const lessonDoc = await adminDb.collection("lessons").doc(lessonDocId).get();
      if (lessonDoc.exists) {
        const lessonData = lessonDoc.data();
        const quests = lessonData?.quests || [];
        const questList: Array<{ quest_name: string; phrases: string[] }> = [];
        quests.forEach((q: any) => {
          const questName = q.title || q.name || q.id || "";
          questList.push({
            quest_name: questName,
            phrases: q.default_phrases || []
          });
        });
        
        quickPhrases[lessonDocId] = questList;
        
        await childRef.update({
          quick_phrases: quickPhrases,
          updatedAt: new Date().toISOString()
        });
      }
    }

    return { success: true, phrases: quickPhrases[lessonDocId] || {} };
  } catch (error: any) {
    console.error("Error syncing child quick phrases:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Import child settings (quick phrases and/or default lesson parameters) (Story 3.9 / Duplication)
 */
export async function importChildSettings(
  childId: string, 
  settings: { quick_phrases?: Record<string, any>; default_lesson_params?: any }
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    const childDoc = await childRef.get();

    if (!childDoc.exists) return { success: false, error: "Child profile not found" };

    const data = childDoc.data();
    const isAssigned = data?.expertUid === session.uid || data?.expertUids?.includes(session.uid);
    if (!isAssigned) {
      return { success: false, error: "Unauthorized: You are not assigned to this child" };
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };
    if (settings.quick_phrases) {
      updates.quick_phrases = settings.quick_phrases;
    }
    if (settings.default_lesson_params) {
      updates.default_lesson_params = settings.default_lesson_params;
    }

    await childRef.update(updates);
    revalidatePath(`/dashboard/expert/stats?childId=${childId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error importing child settings:", error);
    return { success: false, error: error.message };
  }
}

