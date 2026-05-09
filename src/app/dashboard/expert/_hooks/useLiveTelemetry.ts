"use client";

import { useState, useEffect, useRef } from "react";
import { subscribeToTelemetry } from "@/lib/firebase/rtdb";

export interface Alert {
  id: string;
  type: "freeze" | "distraction" | "hesitation" | "stimming" | "idle";
  severity: "high" | "medium" | "low";
  timestamp: number;
  message: string;
}

export function useLiveTelemetry(sessionId: string | null, isActive: boolean) {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentQuest, setCurrentQuest] = useState<string>("Đang đợi dữ liệu...");

  const startTimeRef = useRef<number>(Date.now());
  const distractionCounterRef = useRef<number>(0);
  const hesitationCounterRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive || !sessionId) return;
    startTimeRef.current = Date.now();

    const unsubscribe = subscribeToTelemetry(sessionId, (tsStr, snapshot) => {
      setTelemetry(snapshot);
      
      if (snapshot.expected_target && snapshot.expected_target !== "None") {
        setCurrentQuest(snapshot.expected_target);
      }

      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setSessionTime(elapsed);

      // --- RULE-BASED ENGINE ---
      const newAlerts: Alert[] = [];
      const now = Date.now();

      // 1. Stimming Detection (Lắc đầu quá mạnh hoặc vung tay liên tục)
      if (snapshot.ang_vel_y_peak > 150 || snapshot.ang_vel_x_peak > 150) {
        newAlerts.push({
          id: `stimming_${tsStr}`,
          type: "stimming",
          severity: "high",
          timestamp: now,
          message: "Lắc đầu mạnh (Stimming / Meltdown)"
        });
      }

      // 2. Distraction Detection (Không nhìn vào vật thể nhiệm vụ trên 6s)
      if (snapshot.focus_ratio < 0.3) {
        distractionCounterRef.current += 2; // Snapshot mỗi 2s
        if (distractionCounterRef.current >= 6) {
          newAlerts.push({
            id: `distraction_${tsStr}`,
            type: "distraction",
            severity: "medium",
            timestamp: now,
            message: "Xao nhãng (Không nhìn mục tiêu > 6s)"
          });
          distractionCounterRef.current = 0; // Báo xong thì reset
        }
      } else {
        distractionCounterRef.current = 0; // Trẻ đã tập trung lại
      }

      // 3. Hesitation (Chần chừ, tay gần vật nhưng không chạm vào)
      if (snapshot.hand_near_ratio > 0.3 && snapshot.min_hand_dist > 0.05) {
        hesitationCounterRef.current += 2;
        if (hesitationCounterRef.current >= 6) {
          newAlerts.push({
            id: `hesitation_${tsStr}`,
            type: "hesitation",
            severity: "low",
            timestamp: now,
            message: "Chần chừ (Để tay quanh vật > 6s)"
          });
          hesitationCounterRef.current = 0;
        }
      } else if (snapshot.min_hand_dist <= 0.05) {
        // Trẻ đã chạm dứt điểm
        hesitationCounterRef.current = 0;
      }

      if (newAlerts.length > 0) {
        setActiveAlerts(prev => [...prev, ...newAlerts]);
      }
    });

    return () => unsubscribe();
  }, [isActive, sessionId]);

  return { telemetry, activeAlerts, sessionTime, currentQuest };
}
