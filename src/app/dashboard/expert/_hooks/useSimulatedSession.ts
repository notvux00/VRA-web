"use client";

import { useState, useEffect, useRef } from "react";

interface TelemetrySnapshot {
  ts: number;
  quest_id: string;
  quest_state: "in_progress" | "completed" | "idle";
  head: {
    yaw: number;
    pitch: number;
    roll: number;
    angular_velocity: number;
  };
  task_zone: {
    target_yaw: number;
    deviation_deg: number;
  };
  left_hand: {
    velocity: number;
    near_object: boolean;
  };
  right_hand: {
    velocity: number;
    near_object: boolean;
  };
}

interface Alert {
  id: string;
  type: "freeze" | "distraction" | "hesitation" | "idle";
  severity: "high" | "medium" | "low";
  duration_sec: number;
  timestamp: number;
}

export function useSimulatedSession(isActive: boolean, alertProfile: any) {
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Thresholds from profile or defaults
  const thresholds = alertProfile?.thresholds || {
    distraction_threshold_sec: 8,
    freeze_threshold_sec: 10,
    deviation_angle_deg: 30,
    idle_threshold_sec: 12,
    hesitation_count: 3
  };

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setSessionTime(elapsed);

      // 1. Generate Simulated Telemetry
      const targetYaw = 0;
      // Randomly induce "distraction" or "freeze" every once in a while
      const isDistractedSync = (elapsed > 10 && elapsed < 20) || (elapsed > 45 && elapsed < 55);
      const isFreezingSync = (elapsed > 30 && elapsed < 42);

      const yaw = isDistractedSync ? 45 + Math.random() * 10 : (Math.random() * 10 - 5);
      const headVel = isFreezingSync ? 0.01 : (0.5 + Math.random() * 2);
      const handVel = isFreezingSync ? 0.01 : (0.2 + Math.random() * 1);

      const snapshot: TelemetrySnapshot = {
        ts: now,
        quest_id: elapsed < 60 ? "washing_hands_step1" : "washing_hands_step2",
        quest_state: "in_progress",
        head: {
          yaw,
          pitch: Math.random() * 5,
          roll: Math.random() * 2,
          angular_velocity: headVel
        },
        task_zone: {
          target_yaw: targetYaw,
          deviation_deg: Math.abs(yaw - targetYaw)
        },
        left_hand: {
          velocity: handVel,
          near_object: elapsed % 10 < 3
        },
        right_hand: {
          velocity: handVel * 1.1,
          near_object: elapsed % 10 < 4
        }
      };

      setTelemetry(snapshot);

      // 2. Detection Logic (Simplified Alert Engine)
      const newAlerts: Alert[] = [];

      // Freeze Detection
      if (isFreezingSync) {
        newAlerts.push({
          id: "alert_freeze",
          type: "freeze",
          severity: "high",
          duration_sec: elapsed - 30,
          timestamp: now
        });
      }

      // Distraction Detection
      if (snapshot.task_zone.deviation_deg > thresholds.deviation_angle_deg) {
        newAlerts.push({
          id: "alert_distraction",
          type: "distraction",
          severity: "medium",
          duration_sec: isDistractedSync ? (elapsed > 45 ? elapsed - 45 : elapsed - 10) : 2,
          timestamp: now
        });
      }

      // Idle Detection
      if (elapsed > 70 && elapsed % 15 < 5) {
        newAlerts.push({
          id: "alert_idle",
          type: "idle",
          severity: "low",
          duration_sec: 5,
          timestamp: now
        });
      }

      setActiveAlerts(newAlerts);

    }, 2000); // 2 seconds interval as per design

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, alertProfile]);

  return { telemetry, activeAlerts, sessionTime };
}
