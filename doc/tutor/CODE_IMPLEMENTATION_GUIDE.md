# 💻 Hướng dẫn lập trình Logic (Chuẩn hóa theo Dữ liệu Thực tế)

Tài liệu này hướng dẫn cách viết code truy vấn dữ liệu từ Firestore, tuân thủ chính xác cấu trúc **Mảng (Array)** cho Quest Logs mà bạn đang sử dụng.

---

## 1. Cấu trúc Interface (TypeScript)

Vui lòng cập nhật Interface để khớp với dữ liệu thực tế của bạn:

```typescript
// QuestLog nằm trong mảng quest_logs của Session
export interface QuestLog {
  index: number;
  quest_name: string;
  response_time: number;
  completion_status: string;
  hints_verbal: number;
  hints_visual: number;
  hints_physical: number;
}

// Session Document
export interface Session {
  id: string; // Document ID
  session_id: string; // Trường session_id bên trong
  child_profile_id: string;
  lesson_name: string;
  score: number;
  duration: number;
  start_time: string;
  finish_time: string;
  quest_logs: QuestLog[]; // Đây là mảng (Array)
}

// Sub-collection riêng
export interface AutoAlert {
  type: string;
  group: string;
  severity: string;
  duration_sec: number;
  time_offset: number;
}
```

---

## 2. Truy vấn dữ liệu

Vì `quest_logs` đã nằm sẵn trong Session, bạn chỉ cần fetch thêm `auto_alerts` từ sub-collection:

```typescript
import { db } from "@/lib/firebase/client";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export const getSessionAnalytics = async (docId: string) => {
  // 1. Lấy dữ liệu Session (đã có sẵn quest_logs bên trong)
  const sessionRef = doc(db, "sessions", docId);
  const sessionSnap = await getDoc(sessionRef);
  
  if (!sessionSnap.exists()) return null;
  const sessionData = sessionSnap.data() as Session;

  // 2. Lấy dữ liệu Auto Alerts từ Sub-collection
  const alertsRef = collection(db, "sessions", docId, "auto_alerts");
  const alertsSnap = await getDocs(alertsRef);
  const alerts = alertsSnap.docs.map(doc => doc.data() as AutoAlert);

  return { 
    session: sessionData, 
    questLogs: sessionData.quest_logs, // Lấy trực tiếp từ mảng
    alerts 
  };
};
```

---

## 3. Logic xử lý dữ liệu biểu đồ

- **Tiến trình điểm số**: Truy cập `session.score`.
- **Chỉ số Độc lập**: Duyệt mảng `session.quest_logs` và cộng tổng các trường `hints_*`.
- **Biểu đồ Radar**: Duyệt danh sách `alerts` và phân loại theo `group`.

---
*Tài liệu đã được đồng bộ hóa hoàn toàn với cấu trúc mảng và dữ liệu thực tế.*
