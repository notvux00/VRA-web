"use client";

import { useState, useEffect, useRef } from "react";
import { subscribeToTelemetry } from "@/lib/firebase/rtdb";

export interface Alert {
  id: string;
  type: "freeze" | "distraction" | "hesitation" | "stimming" | "idle";
  group: "stress_overwhelm" | "distraction" | "execution_difficulty";
  quest_index: number;
  severity: "high" | "medium" | "low";
  timestamp: number;
  time_offset: number;
  duration_sec: number;
  message: string;
  auto_detected: boolean;
  suppressed: boolean;
}

const typeToGroup: Record<Alert["type"], Alert["group"]> = {
  freeze: "stress_overwhelm",
  stimming: "distraction",
  distraction: "distraction",
  hesitation: "execution_difficulty",
  idle: "execution_difficulty",
};

export function useLiveTelemetry(sessionId: string | null, isActive: boolean, mutedGroups: string[] = []) {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentQuest, setCurrentQuest] = useState<string>("Đang đợi dữ liệu...");
  const [questIndex, setQuestIndex] = useState<number>(0);

  const startTimeRef = useRef<number>(Date.now());
  
  // Tracking behavior timing
  const distractionStartOffset = useRef<number | null>(null);
  const activeDistractionAlertId = useRef<string | null>(null);
  
  const hesitationStartOffset = useRef<number | null>(null);
  const activeHesitationAlertId = useRef<string | null>(null);
  const hesitationGraceTimer = useRef<number | null>(null); // To handle flickering
  
  const stimmingStartOffset = useRef<number | null>(null);
  const activeStimmingAlertId = useRef<string | null>(null);
  const lastStimmingPeakTime = useRef<number | null>(null); // For grace period

  useEffect(() => {
    if (!isActive || !sessionId) return;
    startTimeRef.current = Date.now();

    const unsubscribe = subscribeToTelemetry(sessionId, (tsStr, snapshot) => {
      setTelemetry(snapshot);
      
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      setSessionTime(Math.floor(elapsed));

      if (snapshot.expected_target && snapshot.expected_target !== "None") {
        setCurrentQuest(snapshot.expected_target);
        setQuestIndex(snapshot.quest_index || 0);
      }

      // --- RULE-BASED ENGINE ---
      const newAlerts: Alert[] = [];
      const updates: {id: string, duration: number}[] = [];

      // Helper to create alert
      const createAlert = (type: Alert["type"], severity: Alert["severity"], message: string, offset: number, duration: number): Alert => {
        const group = typeToGroup[type];
        return {
          id: `${type}_${now}`,
          type,
          group,
          quest_index: snapshot.quest_index || questIndex,
          severity,
          timestamp: now,
          time_offset: Math.round(offset * 10) / 10,
          duration_sec: Math.round(duration * 10) / 10,
          message,
          auto_detected: true,
          suppressed: mutedGroups.includes(group)
        };
      };

      // 1. Stimming Detection (Improved with 4s Grace Period)
      const isStimmingPeak = snapshot.ang_vel_y_peak > 150 || snapshot.ang_vel_x_peak > 150;
      if (isStimmingPeak) {
        lastStimmingPeakTime.current = elapsed;
        if (stimmingStartOffset.current === null) stimmingStartOffset.current = elapsed;
        
        const duration = Math.max(2, elapsed - stimmingStartOffset.current);
        if (!activeStimmingAlertId.current) {
          const alert = createAlert("stimming", "high", "Lắc đầu mạnh (Stimming / Meltdown)", stimmingStartOffset.current, duration);
          activeStimmingAlertId.current = alert.id;
          newAlerts.push(alert);
        } else {
          updates.push({ id: activeStimmingAlertId.current, duration });
        }
      } else if (stimmingStartOffset.current !== null) {
        // Check if grace period (4s) has passed
        if (elapsed - (lastStimmingPeakTime.current || 0) > 4) {
          stimmingStartOffset.current = null;
          activeStimmingAlertId.current = null;
        }
      }

      // 2. Distraction Detection (Standard 6s threshold)
      if (snapshot.focus_ratio < 0.3) {
        if (distractionStartOffset.current === null) distractionStartOffset.current = elapsed;
        
        const duration = elapsed - distractionStartOffset.current;
        if (duration >= 6) {
          if (!activeDistractionAlertId.current) {
            const alert = createAlert("distraction", "medium", "Xao nhãng (Không nhìn mục tiêu > 6s)", distractionStartOffset.current, duration);
            activeDistractionAlertId.current = alert.id;
            newAlerts.push(alert);
          } else {
            updates.push({ id: activeDistractionAlertId.current, duration });
          }
        }
      } else {
        distractionStartOffset.current = null;
        activeDistractionAlertId.current = null;
      }

      // 3. Hesitation Detection (Improved with 2s Grace Period)
      const isHesitating = snapshot.hand_near_ratio > 0.3 && snapshot.min_hand_dist > 0.05;
      
      if (isHesitating) {
        hesitationGraceTimer.current = null; // Clear grace if back to hesitating
        if (hesitationStartOffset.current === null) hesitationStartOffset.current = elapsed;
        
        const duration = elapsed - hesitationStartOffset.current;
        if (duration >= 6) {
          if (!activeHesitationAlertId.current) {
            const alert = createAlert("hesitation", "low", "Chần chừ (Để tay quanh vật > 6s)", hesitationStartOffset.current, duration);
            activeHesitationAlertId.current = alert.id;
            newAlerts.push(alert);
          } else {
            updates.push({ id: activeHesitationAlertId.current, duration });
          }
        }
      } else if (hesitationStartOffset.current !== null) {
        // Not hesitating currently (either touching or away)
        if (hesitationGraceTimer.current === null) hesitationGraceTimer.current = elapsed;
        
        // If out of hesitation for more than 2s, reset
        if (elapsed - hesitationGraceTimer.current > 2) {
          hesitationStartOffset.current = null;
          activeHesitationAlertId.current = null;
          hesitationGraceTimer.current = null;
        }
      }

      // Apply changes to state
      if (newAlerts.length > 0 || updates.length > 0) {
        setActiveAlerts(prev => {
          let next = [...prev];
          updates.forEach(upd => {
            next = next.map(a => a.id === upd.id ? { ...a, duration_sec: Math.round(upd.duration * 10) / 10 } : a);
          });
          return [...next, ...newAlerts];
        });
      }
    });

    return () => unsubscribe();
  }, [isActive, sessionId, questIndex]);

  return { telemetry, activeAlerts, sessionTime, currentQuest, questIndex };
}


