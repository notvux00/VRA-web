"use server";

import { adminDb } from "@/lib/firebase/admin";
import { Session, ChildProfile } from "@/types";

export async function getCenterReportsData(centerId: string) {
  try {
    const childrenSnap = await adminDb.collection("child_profiles")
      .where("centerId", "==", centerId)
      .get();
    
    if (childrenSnap.empty) {
      return { success: true, data: getEmptyReportData() };
    }

    const childIds = childrenSnap.docs.map(doc => doc.id);

    const sessions: Session[] = [];
    for (let i = 0; i < childIds.length; i += 10) {
      const chunk = childIds.slice(i, i + 10);
      const sessionSnap = await adminDb.collection("sessions")
        .where("child_profile_id", "in", chunk)
        .get();
      
      sessionSnap.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() } as unknown as Session);
      });
    }

    if (sessions.length === 0) {
      return { success: true, data: getEmptyReportData() };
    }

    // --- Process Real Data ---
    const frequencyMap = new Map<string, number>();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
      frequencyMap.set(dateStr, 0);
    }

    const lessonStats = new Map<string, { name: string, uses: number, completions: number, totalTime: number }>();
    let totalScore = 0;
    
    sessions.forEach(session => {
      // 1. Frequency
      if (session.start_time) {
        const sessionDate = new Date(session.start_time as string);
        const diffTime = today.getTime() - sessionDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays >= 0 && diffDays <= 6) {
          const dateStr = sessionDate.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
          if (frequencyMap.has(dateStr)) {
            frequencyMap.set(dateStr, frequencyMap.get(dateStr)! + 1);
          }
        }
      }

      // 2. Lessons
      const lId = session.lesson_id || "unknown";
      if (!lessonStats.has(lId)) {
        lessonStats.set(lId, { name: session.lesson_name || "Kịch bản VR", uses: 0, completions: 0, totalTime: 0 });
      }
      
      const stats = lessonStats.get(lId)!;
      stats.uses += 1;
      
      // Better completion logic (fallback to score > 0 if status is weird)
      const statusStr = String(session.completion_status || "").toLowerCase();
      const isCompleted = 
        statusStr.includes("complet") || 
        statusStr.includes("success") || 
        statusStr.includes("pass") || 
        statusStr.includes("hoàn thành") || 
        (session.score && session.score > 0);
      const oldStatus = (session as any).status;
        
      if (isCompleted) {
        stats.completions += 1;
      }
      
      stats.totalTime += (session.duration || 0);
      
      // 3. Goal
      totalScore += (session.score || 0);
    });

    const frequencyData = Array.from(frequencyMap.entries()).map(([date, sessions]) => ({ date, sessions }));
    
    const lessonData = Array.from(lessonStats.entries()).map(([id, stats]) => {
      const compRate = stats.uses > 0 ? Math.round((stats.completions / stats.uses) * 100) : 0;
      
      // If duration was stored in seconds, dividing by 60 gets minutes.
      // If duration was stored in minutes, dividing by 60 makes it 0.
      // Let's assume duration is in seconds.
      const avgTimeValue = stats.uses > 0 ? Math.round(stats.totalTime / stats.uses) : 0;
      
      let avgTimeStr = "0 giây";
      if (avgTimeValue >= 60) {
        const mins = Math.floor(avgTimeValue / 60);
        const secs = avgTimeValue % 60;
        avgTimeStr = secs > 0 ? `${mins} phút ${secs} giây` : `${mins} phút`;
      } else {
        avgTimeStr = `${avgTimeValue} giây`;
      }
      
      return {
        id,
        name: stats.name,
        uses: stats.uses,
        completionRate: compRate,
        averageTime: avgTimeStr
      };
    }).sort((a, b) => b.uses - a.uses).slice(0, 5);

    const avgScore = sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;
    
    let completedSessions = 0;
    sessions.forEach(session => {
      const statusStr = String(session.completion_status || (session as any).status || "").toLowerCase();
      const isCompleted = 
        statusStr.includes("complet") || 
        statusStr.includes("success") || 
        statusStr.includes("pass") || 
        statusStr.includes("hoàn thành") || 
        (session.score && session.score > 0);
      if (isCompleted) completedSessions++;
    });
    
    const completionRate = sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 0;
    
    const goalData = [
      { category: "Điểm trung bình", achieved: avgScore > 100 ? 100 : avgScore, total: 100 },
      { category: "Tỷ lệ Hoàn thành", achieved: completionRate, total: 100 },
    ];

    return {
      success: true,
      data: {
        frequencyData,
        lessonData,
        goalData
      }
    };

  } catch (error: unknown) {
    console.error("Error fetching report data:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

function getEmptyReportData() {
  const frequencyData = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
    frequencyData.push({ date: dateStr, sessions: 0 });
  }

  return {
    frequencyData,
    lessonData: [],
    goalData: [
      { category: "Điểm trung bình", achieved: 0, total: 100 },
      { category: "Tỷ lệ Hoàn thành", achieved: 0, total: 100 }
    ]
  };
}
