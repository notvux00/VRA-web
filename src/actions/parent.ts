"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { getCachedChildSessions } from "./history";
import { calculateRadarData, calculateTrendData } from "@/lib/analytics/statsProcessor";
import { ChildProfile, Session, QuestLog, AutoAlert, FirestoreTimestamp } from "@/types";

const SESSION_COOKIE_NAME = "session";



export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  value?: string | number;
}

export interface ParentDashboardStats {
  totalSessions: number;
  totalTime: string;
  avgScore: number;
  streak: number;
  achievements: Achievement[];
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
  } catch (error: unknown) {
    console.error("Error fetching parent children:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

export async function getChildSessions(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childDoc = await adminDb.collection("child_profiles").doc(childId).get();
    if (!childDoc.exists) return { success: false, error: "Child not found" };
    
    const childData = childDoc.data();
    const isParent = childData?.parentUid === session.uid;
    const isExpert = childData?.expertUid === session.uid;

    if (!isParent && !isExpert) {
      return { success: false, error: "Access denied" };
    }

    const sessions = await getCachedChildSessions(childId);

    return { success: true, sessions };
  } catch (error: unknown) {
    console.error("Error fetching child sessions:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

// Fetch sessions cho một trẻ — dùng Firestore index thay vì full-scan
// Yêu cầu composite index: sessions(child_profile_id ASC, start_time DESC)
async function fetchSessionsForChild(childId: string) {
  return await getCachedChildSessions(childId);
}


export async function getChildStats(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childDoc = await adminDb.collection("child_profiles").doc(childId).get();
    if (!childDoc.exists) return { success: false, error: "Child not found" };
    
    const childData = childDoc.data();
    const isParent = childData?.parentUid === session.uid;
    const isExpert = childData?.expertUid === session.uid;

    if (!isParent && !isExpert) {
      return { success: false, error: "Access denied" };
    }

    const sessions = await fetchSessionsForChild(childId);
    
    const totalSessions = sessions.length;
    const totalDurationSeconds = sessions.reduce((acc: number, s: Session) => acc + (s.duration || 0), 0);
    const totalDurationMinutes = totalDurationSeconds / 60;
    const avgScore = totalSessions > 0 
      ? sessions.reduce((acc: number, s: Session) => acc + (s.score || 0), 0) / totalSessions 
      : 0;

    const maxDuration = sessions.length > 0 ? Math.max(...sessions.map((s: Session) => s.duration || 0)) : 0;

    const formatDate = (date: Date) => {
      return date.getFullYear() + "-" + 
             String(date.getMonth() + 1).padStart(2, '0') + "-" + 
             String(date.getDate()).padStart(2, '0');
    };

    const sessionDates = sessions
      .map((s: Session) => {
        const rawDate = s.start_time || (s as Session & { startTime?: string }).startTime;
        if (!rawDate) return null;
        
        const d = (typeof rawDate === 'object' && (rawDate as { toDate?: () => Date }).toDate) 
          ? (rawDate as { toDate: () => Date }).toDate() 
          : new Date(rawDate as string);
          
        return formatDate(d);
      })
      .filter((d: any) => d !== null) as string[];

    const uniqueDates = Array.from(new Set(sessionDates)).sort((a, b) => b.localeCompare(a));

    let streak = 0;
    if (uniqueDates.length > 0) {
      const now = new Date();
      
      // We start checking from TODAY
      const checkDate = new Date(now);
      const todayStr = formatDate(checkDate);
      
      // If no session today, we check if it starts from YESTERDAY
      if (!uniqueDates.includes(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = formatDate(checkDate);
        if (!uniqueDates.includes(yesterdayStr)) {
          // No session today or yesterday = streak is 0
          streak = 0;
        } else {
          // Streak starts from yesterday
          streak = 0; // Will be incremented in the loop
        }
      }

      // If we found a starting point (today or yesterday)
      if (uniqueDates.includes(formatDate(checkDate))) {
        while (uniqueDates.includes(formatDate(checkDate))) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    // Define Achievement Logic
    const achievementsList: Achievement[] = [
      {
        id: "first_session",
        name: "Bước chân đầu tiên",
        description: "Hoàn thành buổi học VR đầu tiên",
        icon: "Award",
        color: "text-amber-500",
        earned: totalSessions >= 1
      },
      {
        id: "focus_master",
        name: "Bậc thầy tập trung",
        description: "Đạt điểm bài học trung bình trên 80",
        icon: "Zap",
        color: "text-blue-500",
        earned: avgScore >= 80 && totalSessions >= 3
      },
      {
        id: "persistent",
        name: "Chiến binh kiên trì",
        description: "Hoàn thành từ 5 buổi học trở lên",
        icon: "Shield",
        color: "text-emerald-500",
        earned: totalSessions >= 5
      },
      {
        id: "time_master",
        name: "Mười giờ vàng",
        description: "Tổng thời gian rèn luyện đạt 10 giờ",
        icon: "Clock",
        color: "text-purple-500",
        earned: (totalDurationSeconds / 3600) >= 10
      },
      {
        id: "streak_master",
        name: "Chuỗi ngày rực rỡ",
        description: "Học liên tiếp 3 ngày trở lên",
        icon: "Flame",
        color: "text-orange-500",
        earned: streak >= 3
      },
      {
        id: "deep_focus",
        name: "Tập trung sâu",
        description: "Có ít nhất một buổi học trên 30 phút",
        icon: "Headphones",
        color: "text-blue-600",
        earned: maxDuration >= 1800
      },
      {
        id: "veteran",
        name: "Chiến binh kỳ cựu",
        description: "Hoàn thành từ 20 buổi học trở lên",
        icon: "Trophy",
        color: "text-rose-500",
        earned: totalSessions >= 20
      },
      {
        id: "discipline",
        name: "Kỷ luật thép",
        description: "Học liên tiếp 7 ngày trở lên",
        icon: "Sparkles",
        color: "text-indigo-500",
        earned: streak >= 7
      },
      {
        id: "time_expert",
        name: "Chuyên gia thời gian",
        description: "Tổng thời gian rèn luyện đạt 50 giờ",
        icon: "Hourglass",
        color: "text-teal-500",
        earned: (totalDurationSeconds / 3600) >= 50
      },
      {
        id: "legend",
        name: "Huyền thoại",
        description: "Hoàn thành từ 50 buổi học trở lên",
        icon: "Crown",
        color: "text-yellow-500",
        earned: totalSessions >= 50
      }
    ];

    return {
      success: true,
      stats: {
        totalSessions,
        totalTime: `${Math.floor(totalDurationMinutes / 60)}h ${Math.round(totalDurationMinutes % 60)}m`,
        avgScore,
        streak,
        achievements: achievementsList,
      } as ParentDashboardStats
    };
  } catch (error: unknown) {
    console.error("Error calculating child stats:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
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
        let formattedDate = "Gần đây";
        if (sessionData.start_time?.toDate) {
          formattedDate = sessionData.start_time.toDate().toLocaleDateString("vi-VN");
        } else {
          const rawDate = sessionData.start_time || sessionData.startTime;
          if (typeof rawDate === 'string') {
            const [y, m, d] = rawDate.split('T')[0].split('-');
            formattedDate = `${d}/${m}/${y}`;
          }
        }

        return { 
          success: true, 
          note: sessionData.notes || "Buổi học diễn ra tốt đẹp. Trẻ đang làm quen với môi trường mới.",
          date: formattedDate
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
  } catch (error: unknown) {
    console.error("Error fetching latest note:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
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
  } catch (error: unknown) {
    console.error("Error fetching child profile detail:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

export async function getChildDashboardAnalytics(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const sessions = await fetchSessionsForChild(childId);
    if (sessions.length === 0) return { success: true, radarData: [], trendData: [] };

    // Use unified analytics processor
    const radarData = calculateRadarData(sessions as Session[]);
    const trendData = calculateTrendData(sessions as Session[]);

    return { success: true, radarData, trendData };
  } catch (error: unknown) {
    console.error("Error calculating dashboard analytics:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

export async function getChildHeatmapData(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const sessions = await fetchSessionsForChild(childId);
    console.log(`[DEBUG] Final Fetch Found: ${sessions.length} sessions for heatmap`);

    const heatmapData: { [key: string]: number } = {};
    
    // Calculate full year threshold in memory
    const fullYearAgo = new Date();
    fullYearAgo.setDate(fullYearAgo.getDate() - 370);
    const fullYearAgoStr = fullYearAgo.toISOString();

    sessions.forEach((data: Session) => {
      // Filter by time in memory for safety
      const startTime = data.start_time || (data as Session & { startTime?: string }).startTime;
      if (typeof startTime === 'string' && startTime < fullYearAgoStr) return;
      if (typeof data.start_time !== 'string' && (data.start_time as { toDate(): Date } | undefined)?.toDate && (data.start_time as { toDate(): Date }).toDate() < fullYearAgo) return;

      let dateStr: string | null = null;
      if (typeof data.start_time !== 'string' && (data.start_time as { toDate(): Date } | undefined)?.toDate) {
        const d = (data.start_time as { toDate(): Date }).toDate();
        dateStr = d.getFullYear() + "-" + 
                  String(d.getMonth() + 1).padStart(2, '0') + "-" + 
                  String(d.getDate()).padStart(2, '0');
      } else {
        const rawDate = data.start_time || (data as Session & { startTime?: string }).startTime;
        if (typeof rawDate === 'string') {
          dateStr = rawDate.split('T')[0];
        }
      }
      
      if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      }
    });

    return { success: true, heatmapData };
    

  } catch (error: unknown) {
    console.error("Error calculating heatmap data:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}
