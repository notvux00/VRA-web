"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { Session, FirestoreTimestamp } from "@/types";

export const getCachedChildSessions = unstable_cache(
  async (childId: string) => {
    console.log("🔥 [CACHE MISS] Fetching sessions for child: ", childId);
    const snap = await adminDb
      .collection("sessions")
      .where("child_profile_id", "==", childId.trim())
      .orderBy("start_time", "desc")
      .limit(50)
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[];
  },
  ["child-sessions-stats"],
  { revalidate: 3600, tags: ["sessions"] }
);

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

export async function getChildSessionHistory(
  childId: string,
  limit = 20,
  afterId?: string
): Promise<{ success: boolean; sessions?: Session[]; hasMore?: boolean; lastId?: string; error?: string }> {
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
    // Cursor-based pagination
    let query = adminDb.collection("sessions")
      .where("child_profile_id", "==", childId)
      .orderBy("start_time", "desc")
      .limit(limit + 1); // fetch one extra to detect hasMore

    if (afterId) {
      const cursorDoc = await adminDb.collection("sessions").doc(afterId).get();
      if (cursorDoc.exists) query = query.startAfter(cursorDoc);
    }

    const snapshot = await query.get();

    const sessions: Session[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const st = data.start_time?.toDate?.() || new Date(data.start_time);
      const ft = data.finish_time?.toDate?.() || new Date(data.finish_time);
      
      let duration = data.duration;
      if (typeof duration === 'string' && duration.includes(':')) {
        const [m, s] = duration.split(':').map(Number);
        duration = m * 60 + s;
      } else {
        duration = Number(duration) || 0;
      }
      
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

    const hasMore = sessions.length > limit;
    if (hasMore) sessions.pop(); // remove the extra doc
    const lastId = sessions.length > 0 ? sessions[sessions.length - 1].id : undefined;
    return { success: true, sessions, hasMore, lastId };
  } catch (error: unknown) {
    console.error("Error fetching session history:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
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

    const rawSt = sessionData.start_time;
    const rawFt = sessionData.finish_time;
    const st = (rawSt && typeof rawSt === 'object') ? (rawSt as { toDate: () => Date }).toDate() : new Date(rawSt as string);
    const ft = (rawFt && typeof rawFt === 'object') ? (rawFt as { toDate: () => Date }).toDate() : new Date(rawFt as string);
    
    let duration: number = 0;
    const rawDuration = sessionData.duration as string | number | undefined;
    if (typeof rawDuration === 'string' && rawDuration.includes(':')) {
      const [m, s] = rawDuration.split(':').map(Number);
      duration = m * 60 + s;
    } else {
      duration = Number(rawDuration) || 0;
    }
    
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
  } catch (error: unknown) {
    console.error("Error fetching session detail:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}
