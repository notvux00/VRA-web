"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "session";

export interface ChildProfile {
  id: string;
  display_name: string;
  parentUid: string;
  centerId: string;
  age?: number;
  [key: string]: any;
}

export interface SessionData {
  id: string;
  child_profile_id: string;
  lesson_id: string;
  completion_status: string;
  score: number;
  duration: number;
  start_time: string;
  finish_time: string;
  notes?: string;
  [key: string]: any;
}

export interface ParentDashboardStats {
  totalSessions: number;
  totalTime: string;
  avgFocus: number;
  achievements: number;
}

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

export async function getParentChildren() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childrenSnapshot = await adminDb
      .collection("child_profiles")
      .where("parentUid", "==", session.uid)
      .get();

    const children: ChildProfile[] = childrenSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as ChildProfile));

    // If no children, fetch center contact info
    let centerPhone = null;
    if (children.length === 0) {
      const parentDoc = await adminDb.collection("parents").doc(session.uid).get();
      const parentData = parentDoc.data();
      if (parentData?.centerId) {
        const centerDoc = await adminDb.collection("centers").doc(parentData.centerId).get();
        centerPhone = centerDoc.data()?.phone || null;
      }
    }

    return { success: true, children, centerPhone };
  } catch (error: any) {
    console.error("Error fetching parent children:", error);
    return { success: false, error: error.message };
  }
}

export async function getChildSessions(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childDoc = await adminDb.collection("child_profiles").doc(childId).get();
    if (!childDoc.exists || childDoc.data()?.parentUid !== session.uid) {
      return { success: false, error: "Access denied" };
    }

    const sessionsSnapshot = await adminDb
      .collection("sessions")
      .where("child_profile_id", "==", childId)
      .orderBy("start_time", "desc")
      .limit(10)
      .get();

    const sessions: SessionData[] = sessionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      start_time: doc.data().start_time?.toDate()?.toISOString(),
      finish_time: doc.data().finish_time?.toDate()?.toISOString(),
    } as SessionData));

    return { success: true, sessions };
  } catch (error: any) {
    console.error("Error fetching child sessions:", error);
    return { success: false, error: error.message };
  }
}

export async function getChildStats(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const sessionsSnapshot = await adminDb
      .collection("sessions")
      .where("child_profile_id", "==", childId)
      .get();

    const sessions = sessionsSnapshot.docs.map(doc => doc.data());
    
    const totalSessions = sessions.length;
    const totalDurationMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
    const avgScore = totalSessions > 0 
      ? sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSessions 
      : 0;

    return {
      success: true,
      stats: {
        totalSessions,
        totalTime: `${Math.floor(totalDurationMinutes / 60)}h ${Math.round(totalDurationMinutes % 60)}m`,
        avgFocus: Math.round(avgScore),
        achievements: 0,
      } as ParentDashboardStats
    };
  } catch (error: any) {
    console.error("Error calculating child stats:", error);
    return { success: false, error: error.message };
  }
}

export async function getChildLatestNote(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const notesSnapshot = await adminDb
      .collection("behavior_logs")
      .where("child_id", "==", childId)
      .orderBy("time_offset", "desc")
      .limit(1)
      .get();

    if (notesSnapshot.empty) {
      const sessionSnapshot = await adminDb
        .collection("sessions")
        .where("child_profile_id", "==", childId)
        .orderBy("start_time", "desc")
        .limit(1)
        .get();
      
      if (!sessionSnapshot.empty) {
        const sessionData = sessionSnapshot.docs[0].data();
        return { 
          success: true, 
          note: sessionData.notes || "Buổi học diễn ra tốt đẹp. Trẻ đang làm quen với môi trường mới.",
          date: sessionData.start_time?.toDate()?.toLocaleDateString("vi-VN")
        };
      }

      return { success: true, note: null };
    }

    const noteData = notesSnapshot.docs[0].data();
    return { 
      success: true, 
      note: noteData.note || "Đã ghi nhận hành vi tập trung tốt.",
      date: "Gần đây"
    };
  } catch (error: any) {
    console.error("Error fetching latest note:", error);
    return { success: false, error: error.message };
  }
}

export async function getChildProfileDetail(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childDoc = await adminDb.collection("child_profiles").doc(childId).get();
    if (!childDoc.exists || childDoc.data()?.parentUid !== session.uid) {
      return { success: false, error: "Access denied" };
    }

    const childData = childDoc.data();
    let expertData = null;

    if (childData?.expertUid) {
      const expertDoc = await adminDb.collection("experts").doc(childData.expertUid).get();
      if (expertDoc.exists) {
        const d = expertDoc.data();
        expertData = {
          name: d?.name || "Chuyên gia hệ thống",
          email: d?.email || "N/A",
          specialization: d?.specialization || "Chuyên gia giáo dục đặc biệt"
        };
      }
    }

    return { 
      success: true, 
      child: { id: childDoc.id, ...childData },
      expert: expertData
    };
  } catch (error: any) {
    console.error("Error fetching child profile detail:", error);
    return { success: false, error: error.message };
  }
}
export async function getChildAlertStats(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const alertsSnapshot = await adminDb
      .collection("AUTO_ALERTS")
      .where("child_id", "==", childId)
      .get();

    const alerts = alertsSnapshot.docs.map(doc => doc.data());
    
    // Aggregate counts by group
    const stressCount = alerts.filter(a => a.group === "stress_overwhelm").length;
    const distractionCount = alerts.filter(a => a.group === "distraction").length;
    const executionCount = alerts.filter(a => a.group === "execution_difficulty").length;
    const hesitationCount = alerts.filter(a => a.type === "hesitation").length;
    const idleCount = alerts.filter(a => a.type === "idle").length;

    // Normalize to 0-100 scale (Base 100 minus penalty per event)
    const factor = 10; // Penalty per event
    const normalize = (val: number) => Math.max(20, 100 - (val * factor));

    const radarData = [
      { subject: 'Tập trung', A: normalize(distractionCount), fullMark: 100 },
      { subject: 'Bình tĩnh', A: normalize(stressCount), fullMark: 100 },
      { subject: 'Thực thi', A: normalize(executionCount), fullMark: 100 },
      { subject: 'Tốc độ', A: normalize(hesitationCount), fullMark: 100 },
      { subject: 'Kiên trì', A: normalize(idleCount), fullMark: 100 },
    ];

    return { success: true, radarData };
  } catch (error: any) {
    console.error("Error fetching child alert stats:", error);
    return { success: false, error: error.message };
  }
}
