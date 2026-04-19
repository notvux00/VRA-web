"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { getChildAlertStats as getRadarData } from "./analytics";

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
  quest_logs?: any[];
  auto_alerts?: any[];
  [key: string]: any;
}

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
    if (!childDoc.exists) return { success: false, error: "Child not found" };
    
    const childData = childDoc.data();
    const isParent = childData?.parentUid === session.uid;
    const isExpert = childData?.expertUid === session.uid;

    if (!isParent && !isExpert) {
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
      start_time: doc.data().start_time?.toDate?.()?.toISOString() || doc.data().startTime || doc.data().start_time || new Date().toISOString(),
      finish_time: doc.data().finish_time?.toDate?.()?.toISOString() || doc.data().endTime || doc.data().finish_time || new Date().toISOString(),
    } as SessionData));

    return { success: true, sessions };
  } catch (error: any) {
    console.error("Error fetching child sessions:", error);
    return { success: false, error: error.message };
  }
}

// Utility to fetch sessions across multiple field names and potential index issues
async function fetchSessionsForChild(childId: string) {
  const targetId = childId.trim();
  
  // Attempt aggressive scan first for reliability if dataset is manageable
  // In a real production app with millions of sessions, we would use indexes,
  // but for this implementation, a scan of recent sessions is safer to avoid silent failures.
  const snapshot = await adminDb.collection("sessions").orderBy("start_time", "desc").limit(500).get();
  
  const matches = snapshot.docs.filter(doc => {
    const data = doc.data();
    return data.child_profile_id === targetId || data.child_id === targetId || data.childId === targetId;
  });

  return matches.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const totalDurationSeconds = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalDurationMinutes = totalDurationSeconds / 60;
    const avgScore = totalSessions > 0 
      ? sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSessions 
      : 0;

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
      }
    ];

    const formatDate = (date: Date) => {
      return date.getFullYear() + "-" + 
             String(date.getMonth() + 1).padStart(2, '0') + "-" + 
             String(date.getDate()).padStart(2, '0');
    };

    const sessionDates = sessions
      .map(s => {
        const rawDate = s.start_time || s.startTime;
        if (!rawDate) return null;
        
        const d = (typeof rawDate === 'object' && rawDate.toDate) 
          ? rawDate.toDate() 
          : new Date(rawDate);
          
        return formatDate(d);
      })
      .filter(d => d !== null) as string[];

    const uniqueDates = Array.from(new Set(sessionDates)).sort((a, b) => b.localeCompare(a));

    let streak = 0;
    if (uniqueDates.length > 0) {
      const now = new Date();
      
      // We start checking from TODAY
      let checkDate = new Date(now);
      let todayStr = formatDate(checkDate);
      
      // If no session today, we check if it starts from YESTERDAY
      if (!uniqueDates.includes(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        let yesterdayStr = formatDate(checkDate);
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

export async function getChildDashboardAnalytics(childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const sessions = await fetchSessionsForChild(childId);
    if (sessions.length === 0) return { success: true, radarData: [], trendData: [] };

    // 1. Calculate Radar Data
    let totalQuests = 0;
    let successfulQuests = 0;
    let zeroHintQuests = 0;
    let totalResponseTime = 0;
    let totalScore = 0;

    sessions.forEach(s => {
      const logs = s.quest_logs || [];
      totalQuests += logs.length;
      totalScore += (s.score || 0);
      
      logs.forEach((log: any) => {
        if (log.completion_status === "success") successfulQuests++;
        if ((log.hints_physical || 0) + (log.hints_verbal || 0) + (log.hints_visual || 0) === 0) {
          zeroHintQuests++;
        }
        totalResponseTime += (log.response_time || 0);
      });
    });

    const avgAccuracy = totalQuests > 0 ? (successfulQuests / totalQuests) * 100 : 0;
    const avgIndependence = totalQuests > 0 ? (zeroHintQuests / totalQuests) * 100 : 0;
    const avgResponseTime = totalQuests > 0 ? totalResponseTime / totalQuests : 0;
    const avgCompletion = totalScore / sessions.length;
    
    // 1. Calculate Radar Data (Strictly follow RADAR_CHART_METRICS.md - Focus on LAST 5 SESSIONS)
    const recentSessions = sessions.slice(0, 5);
    const totalRecent = recentSessions.length || 1;
    let totalPenalties = { chudoong: 0, tutin: 0, taptrung: 0, ondinh: 0, binhtinh: 0 };

    recentSessions.forEach(s => {
      const alerts = s.auto_alerts || [];
      
      // 1. CHỦ ĐỘNG (idle - Low: -30đ mỗi 5s, max -100đ)
      const idleDur = alerts.filter((a: any) => a.type === 'idle').reduce((acc: number, a: any) => acc + (a.duration_sec || 0), 0);
      totalPenalties.chudoong += Math.min(100, Math.floor(idleDur / 5) * 30);

      // 2. TỰ TIN (hesitation - Low: -60đ/lần, max -100đ)
      const hesitationCount = alerts.filter((a: any) => a.type === 'hesitation').length;
      totalPenalties.tutin += Math.min(100, hesitationCount * 60);

      // 3. TẬP TRUNG (distraction - Medium: -50đ mỗi 5s, max -100đ)
      const distractionDur = alerts.filter((a: any) => a.type === 'distraction').reduce((acc: number, a: any) => acc + (a.duration_sec || 0), 0);
      totalPenalties.taptrung += Math.min(100, Math.floor(distractionDur / 5) * 50);

      // 4. ỔN ĐỊNH (stimming_proxy - Medium: -80đ/lần, max -100đ)
      const stimmingCount = alerts.filter((a: any) => a.type === 'stimming_proxy').length;
      totalPenalties.ondinh += Math.min(100, stimmingCount * 80);

      // 5. BÌNH TĨNH (freeze/meltdown - High: -150đ/lần, max -100đ)
      const stressCount = alerts.filter((a: any) => 
        a.type === 'freeze' || a.type === 'meltdown_proxy' || a.group === 'stress_overwhelm'
      ).length;
      totalPenalties.binhtinh += Math.min(100, stressCount * 150);
    });

    const radarData = [
      { subject: 'TẬP TRUNG', A: Math.max(0, 100 - (totalPenalties.taptrung / totalRecent)), fullMark: 100 },
      { subject: 'BÌNH TĨNH', A: Math.max(0, 100 - (totalPenalties.binhtinh / totalRecent)), fullMark: 100 },
      { subject: 'CHỦ ĐỘNG', A: Math.max(0, 100 - (totalPenalties.chudoong / totalRecent)), fullMark: 100 },
      { subject: 'TỰ TIN', A: Math.max(0, 100 - (totalPenalties.tutin / totalRecent)), fullMark: 100 },
      { subject: 'ỔN ĐỊNH', A: Math.max(0, 100 - (totalPenalties.ondinh / totalRecent)), fullMark: 100 },
    ];

    // 2. Trend Data (Last 10 sessions)
    const trendData = sessions.slice(0, 10).reverse().map(s => {
      let dateStr = "";
      if (s.start_time?.toDate) {
        dateStr = s.start_time.toDate().toLocaleDateString("vi-VN", { day: 'numeric', month: 'short' });
      } else {
        const rawDate = s.start_time || s.startTime;
        if (typeof rawDate === 'string') {
          const [y, m, d] = rawDate.split('T')[0].split('-');
          dateStr = `${d} thg ${m}`;
        }
      }
      return {
        date: dateStr || "---",
        score: s.score || 0,
        duration: Math.round((s.duration || 0) / 60)
      };
    });

    return { success: true, radarData, trendData };
  } catch (error: any) {
    console.error("Error calculating dashboard analytics:", error);
    return { success: false, error: error.message };
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

    sessions.forEach(data => {
      // Filter by time in memory for safety
      const startTime = data.start_time || data.startTime;
      if (typeof startTime === 'string' && startTime < fullYearAgoStr) return;
      if (data.start_time?.toDate && data.start_time.toDate() < fullYearAgo) return;

      let dateStr: string | null = null;
      if (data.start_time?.toDate) {
        const d = data.start_time.toDate();
        dateStr = d.getFullYear() + "-" + 
                  String(d.getMonth() + 1).padStart(2, '0') + "-" + 
                  String(d.getDate()).padStart(2, '0');
      } else {
        const rawDate = data.start_time || data.startTime;
        if (typeof rawDate === 'string') {
          dateStr = rawDate.split('T')[0];
        }
      }
      
      if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      }
    });

    return { success: true, heatmapData };
    

  } catch (error: any) {
    console.error("Error calculating heatmap data:", error);
    return { success: false, error: error.message };
  }
}
