"use server";

import { adminDb } from "@/lib/firebase/admin";

// Utility to fetch sessions across multiple field names
async function fetchSessionsForChild(childId: string) {
  const targetId = childId.trim();
  const snapshot = await adminDb.collection("sessions").orderBy("start_time", "desc").limit(500).get();
  
  const matches = snapshot.docs.filter(doc => {
    const data = doc.data();
    return data.child_profile_id === targetId || data.child_id === targetId || data.childId === targetId;
  });

  return matches.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Shared Analytics Action for both Parent and Expert Dashboards
 * Focuses on the LAST 5 SESSIONS with high-sensitivity weights
 */
export async function getChildAlertStats(childId: string) {
  try {
    const sessions = await fetchSessionsForChild(childId);
    
    // Focus on LAST 5 SESSIONS for maximum responsiveness
    const recentSessions = sessions.slice(0, 5);
    const totalRecent = recentSessions.length || 1;
    let totalPenalties = { chudoong: 0, tutin: 0, taptrung: 0, ondinh: 0, binhtinh: 0 };

    recentSessions.forEach(s => {
      const alerts = s.auto_alerts || [];
      
      // 1. CHỦ ĐỘNG (idle - Low: -30đ mỗi 5s, max -100đ)
      const idleDuration = alerts.filter((a: any) => a.type === 'idle').reduce((acc: number, a: any) => acc + (a.duration_sec || 0), 0);
      totalPenalties.chudoong += Math.min(100, Math.floor(idleDuration / 5) * 30);

      // 2. TỰ TIN (hesitation - Low: -60đ/lần, max -100đ)
      const hesitationCount = alerts.filter((a: any) => a.type === 'hesitation').length;
      totalPenalties.tutin += Math.min(100, hesitationCount * 60);

      // 3. TẬP TRUNG (distraction - Medium: -50đ mỗi 5s, max -100đ)
      const distractionDuration = alerts.filter((a: any) => a.type === 'distraction').reduce((acc: number, a: any) => acc + (a.duration_sec || 0), 0);
      totalPenalties.taptrung += Math.min(100, Math.floor(distractionDuration / 5) * 50);

      // 4. ỔN ĐỊNH (stimming_proxy - Medium: -80đ/lần, max -100đ)
      const stimmingCount = alerts.filter((a: any) => a.type === 'stimming_proxy').length;
      totalPenalties.ondinh += Math.min(100, stimmingCount * 80);

      // 5. BÌNH TĨNH (freeze/meltdown - High: -150đ/lần, max -100đ -> thực tế là vế trái sẽ bị cap ở 100)
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

    return { success: true, radarData };
  } catch (error: any) {
    console.error("Error fetching child alert stats:", error);
    return { success: false, error: error.message };
  }
}
