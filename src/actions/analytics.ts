"use server";

import { adminDb } from "@/lib/firebase/admin";
import { Session, AutoAlert } from "@/types";

/**
 * Shared Analytics Action for both Parent and Expert Dashboards.
 * Uses .where(child_profile_id) directly — no full-collection scan.
 */
export async function getChildAlertStats(childId: string) {
  try {
    const snapshot = await adminDb
      .collection("sessions")
      .where("child_profile_id", "==", childId.trim())
      .orderBy("start_time", "desc")
      .limit(5)
      .get();

    const sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Session));
    const total = sessions.length || 1;
    const p = { chudoong: 0, tutin: 0, taptrung: 0, ondinh: 0, binhtinh: 0 };

    sessions.forEach((s) => {
      const alerts = (s.auto_alerts || []) as AutoAlert[];
      const logs = (s.quest_logs || []) as any[];
      
      let verbal = 0, visual = 0, physical = 0, failures = 0;
      logs.forEach(log => {
        verbal += log.hints_verbal || 0;
        visual += log.hints_visual || 0;
        physical += log.hints_physical || 0;
        if (log.completion_status !== "success") failures++;
      });

      const dur = (a: AutoAlert) => (a.duration_sec as number) || 0;
      const idleSec = alerts.filter(a => a.type === "idle").reduce((acc, a) => acc + dur(a), 0);
      
      // Proactiveness: penalized by idle time and verbal hints
      p.chudoong  += Math.min(100, Math.floor(idleSec / 5) * 30 + (verbal * 15) + (failures * 10));
      
      // Confidence: penalized by hesitation and physical hints
      p.tutin     += Math.min(100, alerts.filter(a => a.type === "hesitation").length * 60 + (physical * 20));
      
      // Focus: penalized by distraction and visual hints
      const distSec = alerts.filter(a => a.type === "distraction").reduce((acc, a) => acc + dur(a), 0);
      p.taptrung  += Math.min(100, Math.floor(distSec / 5) * 50 + (visual * 15));
      
      // Stability: penalized by stimming and low overall score
      const lowScorePenalty = s.score && s.score < 60 ? (60 - s.score) : 0;
      p.ondinh    += Math.min(100, alerts.filter(a => a.type === "stimming_proxy").length * 80 + lowScorePenalty);
      
      // Calmness: penalized by meltdowns, freezes, and low overall score
      p.binhtinh  += Math.min(100, alerts.filter(a => a.type === "freeze" || a.type === "meltdown_proxy" || a.group === "stress_overwhelm").length * 150 + lowScorePenalty);
    });

    const radarData = [
      { subject: "TẬP TRUNG", A: Math.max(0, 100 - p.taptrung / total), fullMark: 100 },
      { subject: "BÌNH TĨNH", A: Math.max(0, 100 - p.binhtinh / total), fullMark: 100 },
      { subject: "CHỦ ĐỘNG",  A: Math.max(0, 100 - p.chudoong / total),  fullMark: 100 },
      { subject: "TỰ TIN",   A: Math.max(0, 100 - p.tutin / total),   fullMark: 100 },
      { subject: "ỔN ĐỊNH",  A: Math.max(0, 100 - p.ondinh / total),  fullMark: 100 },
    ];

    return { success: true, radarData };
  } catch (error: unknown) {
    console.error("Error fetching child alert stats:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
