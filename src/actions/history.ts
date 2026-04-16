"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { Session } from "@/types";

const SESSION_COOKIE_NAME = "session";

async function getAuthSession() {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}

export async function getChildSessionHistory(childId: string): Promise<{ success: boolean; sessions?: Session[]; error?: string }> {
  const authSession = await getAuthSession();
  if (!authSession) return { success: false, error: "Unauthorized" };

  try {
    // 1. Verify Access
    const childDoc = await adminDb.collection("child_profiles").doc(childId).get();
    if (!childDoc.exists) return { success: false, error: "Không tìm thấy hồ sơ trẻ" };

    const childData = childDoc.data();
    const isParent = childData?.parentUid === authSession.uid;
    const isExpert = childData?.expertUid === authSession.uid;
    const isAdmin = authSession.role === "admin";

    if (!isParent && !isExpert && !isAdmin) {
      return { success: false, error: "Bạn không có quyền xem lịch sử của trẻ này" };
    }

    // 2. Fetch Sessions
    const snapshot = await adminDb.collection("sessions")
      .where("child_profile_id", "==", childId)
      .orderBy("start_time", "desc")
      .get();

    const sessions: Session[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const st = data.start_time?.toDate?.() || new Date(data.start_time);
      const ft = data.finish_time?.toDate?.() || new Date(data.finish_time);
      
      let duration = data.duration || 0;
      if (!duration && st && ft) {
        duration = Math.max(0, Math.floor((ft.getTime() - st.getTime()) / 1000));
      }

      return {
        id: doc.id,
        ...data,
        duration: duration,
        start_time: st.toISOString(),
        finish_time: ft.toISOString(),
      } as Session;
    });

    return { success: true, sessions };
  } catch (error: any) {
    console.error("Error fetching session history:", error);
    return { success: false, error: error.message };
  }
}

export async function getSessionDetail(sessionId: string): Promise<{ success: boolean; session?: Session; error?: string }> {
  const authSession = await getAuthSession();
  if (!authSession) return { success: false, error: "Unauthorized" };

  try {
    const doc = await adminDb.collection("sessions").doc(sessionId).get();
    if (!doc.exists) return { success: false, error: "Không tìm thấy dữ liệu buổi học" };

    const sessionData = doc.id ? { id: doc.id, ...doc.data() } as Session : null;
    if (!sessionData) return { success: false, error: "Dữ liệu không hợp lệ" };

    // Verify access to the session (check child_profile_id from session and compare with user permissions)
    const childId = sessionData.child_profile_id;
    const childDoc = await adminDb.collection("child_profiles").doc(childId).get();
    
    if (childDoc.exists) {
      const childData = childDoc.data();
      const isParent = childData?.parentUid === authSession.uid;
      const isExpert = childData?.expertUid === authSession.uid;
      const isAdmin = authSession.role === "admin";

      if (!isParent && !isExpert && !isAdmin) {
        return { success: false, error: "Bạn không có quyền xem báo cáo của buổi học này" };
      }
    }

    const st = (sessionData as any).start_time?.toDate?.() || new Date(sessionData.start_time);
    const ft = (sessionData as any).finish_time?.toDate?.() || new Date(sessionData.finish_time);
    
    let duration = sessionData.duration || 0;
    if (!duration && st && ft) {
      duration = Math.max(0, Math.floor((ft.getTime() - st.getTime()) / 1000));
    }

    return { 
      success: true, 
      session: {
        ...sessionData,
        duration: duration,
        start_time: st.toISOString(),
        finish_time: ft.toISOString(),
      }
    };
  } catch (error: any) {
    console.error("Error fetching session detail:", error);
    return { success: false, error: error.message };
  }
}
