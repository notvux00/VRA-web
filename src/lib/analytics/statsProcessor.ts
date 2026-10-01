import { Session, AutoAlert, QuestLog } from "@/types";
import { FirestoreTimestamp } from "@/types";

export function calculateRadarData(sessions: Session[]) {
  // Use up to 5 latest sessions
  const recentSessions = sessions.slice(0, 5);
  const totalRecent = recentSessions.length || 1;
  const p = { chudoong: 0, tutin: 0, taptrung: 0, ondinh: 0, binhtinh: 0 };

  recentSessions.forEach((s) => {
    const alerts = (s.auto_alerts || []) as AutoAlert[];
    const logs = (s.quest_logs || []) as QuestLog[];
    
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

  return [
    { subject: 'TẬP TRUNG', A: Math.max(0, 100 - (p.taptrung / totalRecent)), fullMark: 100 },
    { subject: 'BÌNH TĨNH', A: Math.max(0, 100 - (p.binhtinh / totalRecent)), fullMark: 100 },
    { subject: 'CHỦ ĐỘNG',  A: Math.max(0, 100 - (p.chudoong / totalRecent)),  fullMark: 100 },
    { subject: 'TỰ TIN',    A: Math.max(0, 100 - (p.tutin / totalRecent)),    fullMark: 100 },
    { subject: 'ỔN ĐỊNH',   A: Math.max(0, 100 - (p.ondinh / totalRecent)),   fullMark: 100 },
  ];
}

export function calculateTrendData(sessions: Session[]) {
  // 1. Group up to 10 latest sessions by Date string
  const recentSessions = sessions.slice(0, 30); // get more to have enough unique days
  const grouped = new Map<string, { totalScore: number; count: number; totalDuration: number }>();
  
  recentSessions.forEach((s) => {
    let dateStr = "";
    if ((s.start_time as FirestoreTimestamp | undefined) && typeof s.start_time !== 'string' && (s.start_time as { toDate(): Date }).toDate) {
      dateStr = (s.start_time as { toDate(): Date }).toDate().toLocaleDateString("vi-VN", { day: 'numeric', month: 'short' });
    } else {
      const rawDate = s.start_time || (s as Session & { startTime?: string }).startTime;
      if (typeof rawDate === 'string' && rawDate.length >= 10) {
        const [y, m, d] = rawDate.split('T')[0].split('-');
        dateStr = `${d} thg ${m}`;
      }
    }
    
    if (!dateStr) dateStr = "---";
    
    if (!grouped.has(dateStr)) {
      grouped.set(dateStr, { totalScore: 0, count: 0, totalDuration: 0 });
    }
    const dayData = grouped.get(dateStr)!;
    dayData.totalScore += (s.score || 0);
    dayData.count += 1;
    dayData.totalDuration += (s.duration || 0);
  });
  
  // 2. Take the 10 most recent DAYS
  const trendData = Array.from(grouped.entries()).map(([date, data]) => ({
    date: date,
    score: Math.round(data.totalScore / data.count),
    duration: Math.round(data.totalDuration / 60) // convert to minutes
  }));
  
  return trendData.slice(0, 10).reverse();
}
