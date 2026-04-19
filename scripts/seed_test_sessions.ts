import admin from "firebase-admin";
import * as path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Check if admin is initialized safely
if (!admin.apps || admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
          : undefined,
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error", error);
    process.exit(1);
  }
}

const db = admin.firestore();

const testSessions = [
  {
    "session_id": "TEST_SESSION_001",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 0,
    "score": 90,
    "duration": 480, // 8 minutes
    "start_time": "2026-04-15T08:00:00",
    "finish_time": "2026-04-15T08:08:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 1.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 5.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 1.2, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 15.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 1.8, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 10.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0}
    ],
    "auto_alerts": []
  },
  {
    "session_id": "TEST_SESSION_002",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 0,
    "score": 75,
    "duration": 720, // 12 minutes
    "start_time": "2026-04-16T10:30:00",
    "finish_time": "2026-04-16T10:42:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 3.5, "completion_status": "success", "hints_verbal": 1, "hints_visual": 0, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 8.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 1, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 2.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 20.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 0, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 2.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 15.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0}
    ],
    "auto_alerts": [
      {"type": "distraction", "group": "distraction", "severity": "medium", "duration_sec": 8.0, "time_offset": 15.0, "quest_index": 0, "auto_detected": true, "suppressed": false}
    ]
  },
  {
    "session_id": "TEST_SESSION_003",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 1,
    "score": 88,
    "duration": 300, // 5 minutes
    "start_time": "2026-04-17T14:00:00",
    "finish_time": "2026-04-17T14:05:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 1.2, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 5.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 1.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 12.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 1.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 8.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0}
    ],
    "auto_alerts": []
  },
  {
    "session_id": "TEST_SESSION_004",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 2,
    "score": 92,
    "duration": 900, // 15 minutes
    "start_time": "2026-04-18T16:15:00",
    "finish_time": "2026-04-18T16:30:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 1.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 4.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 1.1, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 10.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 1.2, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 7.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0}
    ],
    "auto_alerts": []
  },
  {
    "session_id": "TEST_SESSION_005",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 1,
    "score": 80,
    "duration": 1080, // 18 minutes
    "start_time": "2026-04-19T19:00:00",
    "finish_time": "2026-04-19T19:18:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 2.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 1, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 7.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 2.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 1},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 18.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 0, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 2.2, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 12.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 1, "hints_physical": 0}
    ],
    "auto_alerts": [
      {"type": "hesitation", "group": "execution_difficulty", "severity": "low", "duration_sec": 5.0, "time_offset": 10.0, "quest_index": 0, "auto_detected": true, "suppressed": false}
    ]
  },
  {
    "session_id": "TEST_SESSION_006",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 2,
    "score": 95,
    "duration": 600, // 10 minutes
    "start_time": "2026-04-20T09:00:00",
    "finish_time": "2026-04-20T09:10:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 0.8, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 4.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 0.9, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 8.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 1.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 5.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0}
    ],
    "auto_alerts": []
  },
  {
    "session_id": "TEST_SESSION_007",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 2,
    "score": 70,
    "duration": 1200, // 20 minutes
    "start_time": "2026-04-21T11:00:00",
    "finish_time": "2026-04-21T11:20:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 5.0, "completion_status": "success", "hints_verbal": 2, "hints_visual": 1, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 12.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 2, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 4.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 1},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 25.0, "completion_status": "success", "hints_verbal": 2, "hints_visual": 0, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 5.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 20.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 1, "hints_physical": 1}
    ],
    "auto_alerts": [
      {"type": "distraction", "group": "distraction", "severity": "high", "duration_sec": 30.0, "time_offset": 60.0, "quest_index": 1, "auto_detected": true, "suppressed": false}
    ]
  },
  {
    "session_id": "TEST_SESSION_008",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 1,
    "score": 85,
    "duration": 420, // 7 minutes
    "start_time": "2026-04-22T15:30:00",
    "finish_time": "2026-04-22T15:37:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 1.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 5.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 1.2, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 12.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 1, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 1.8, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 8.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0}
    ],
    "auto_alerts": []
  },
  {
    "session_id": "TEST_SESSION_009",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 2,
    "score": 100,
    "duration": 360,
    "start_time": "2026-04-23T10:00:00",
    "finish_time": "2026-04-23T10:06:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 0.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 3.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 0.7, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 6.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 0.8, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 4.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0}
    ],
    "auto_alerts": []
  },
  {
    "session_id": "TEST_SESSION_010",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 2,
    "score": 65,
    "duration": 900,
    "start_time": "2026-04-24T10:00:00",
    "finish_time": "2026-04-24T10:15:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 5.0, "completion_status": "success", "hints_verbal": 2, "hints_visual": 1, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 12.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 3.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 1},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 25.0, "completion_status": "success", "hints_verbal": 2, "hints_visual": 1, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 4.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 15.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 1, "hints_physical": 0}
    ],
    "auto_alerts": [
      {"type": "distraction", "duration_sec": 45, "time_offset": 60, "auto_detected": true},
      {"type": "distraction", "duration_sec": 30, "time_offset": 120, "auto_detected": true},
      {"type": "idle", "duration_sec": 20, "time_offset": 180, "auto_detected": true}
    ]
  },
  {
    "session_id": "TEST_SESSION_011",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 2,
    "score": 75,
    "duration": 600,
    "start_time": "2026-04-24T15:00:00",
    "finish_time": "2026-04-24T15:10:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 2.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 1, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 8.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 2.2, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 15.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 1, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 2.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 10.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0}
    ],
    "auto_alerts": [
      {"type": "hesitation", "count": 3, "time_offset": 30, "auto_detected": true},
      {"type": "hesitation", "count": 2, "time_offset": 90, "auto_detected": true}
    ]
  },
  {
    "session_id": "TEST_SESSION_012",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 1,
    "score": 45,
    "duration": 1500,
    "start_time": "2026-04-25T09:00:00",
    "finish_time": "2026-04-25T09:25:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 10.0, "completion_status": "success", "hints_verbal": 2, "hints_visual": 2, "hints_physical": 1},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 20.0, "completion_status": "success", "hints_verbal": 3, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 8.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 1, "hints_physical": 1},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 40.0, "completion_status": "failed", "hints_verbal": 3, "hints_visual": 2, "hints_physical": 1},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 12.0, "completion_status": "success", "hints_verbal": 1, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 30.0, "completion_status": "success", "hints_verbal": 2, "hints_visual": 2, "hints_physical": 0}
    ],
    "auto_alerts": [
      {"type": "freeze", "count": 1, "time_offset": 100, "auto_detected": true},
      {"type": "stimming_proxy", "count": 4, "time_offset": 200, "auto_detected": true},
      {"type": "idle", "duration_sec": 50, "time_offset": 300, "auto_detected": true}
    ]
  },
  {
    "session_id": "TEST_SESSION_013",
    "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
    "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
    "lesson_id": "WashingHand_1",
    "lesson_name": "Bài học rửa tay",
    "level_index": 3,
    "score": 98,
    "duration": 480,
    "start_time": "2026-04-25T16:00:00",
    "finish_time": "2026-04-25T16:08:00",
    "completion_status": "success",
    "quest_logs": [
      {"index": 0, "quest_name": "Bật vòi nước", "response_time": 0.4, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 1, "quest_name": "Làm ướt tay", "response_time": 2.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 2, "quest_name": "Xịt xà phòng", "response_time": 0.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 3, "quest_name": "Rửa tay", "response_time": 5.0, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 4, "quest_name": "Tắt vòi nước", "response_time": 0.6, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0},
      {"index": 5, "quest_name": "Lau tay với khăn", "response_time": 3.5, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0}
    ],
    "auto_alerts": [
      {"type": "hesitation", "count": 1, "time_offset": 50, "auto_detected": true}
    ]
  }
];

async function seedTestSessions() {
  console.log("🚀 Đang bắt đầu đẩy dữ liệu test vào collection 'sessions'...");
  let count = 0;

  for (const session of testSessions) {
    try {
      // Use session_id as the document ID for easy identification
      await db.collection("sessions").doc(session.session_id).set(session);
      console.log(`✅ Đã thêm: ${session.session_id}`);
      count++;
    } catch (error) {
      console.error(`❌ Lỗi khi thêm ${session.session_id}:`, error);
    }
  }

  console.log(`\n🎉 Hoàn tất! Đã thêm thành công ${count}/${testSessions.length} tài liệu test.`);
}

seedTestSessions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Lỗi chạy script:", err);
    process.exit(1);
  });
