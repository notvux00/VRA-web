# 🚀 Hướng dẫn khởi tạo dữ liệu mẫu (Bản Chốt 100% Dữ liệu thực & Draw.io)

Tài liệu này là "nguyên bản" dữ liệu từ hệ thống của bạn, được trình bày để bạn có thể nhập liệu chính xác nhất.

---

## 📂 Cấu trúc dữ liệu
- **Collection `sessions`**: Document chứa các trường thông tin phẳng, mảng `quest_logs` và mảng `auto_alerts`.

---

## 🛠 Bước 1: Tạo tài liệu Session chính
Trong collection `sessions`, tạo một tài liệu mới và nhập chính xác các trường sau:

| Tên trường (Field) | Kiểu dữ liệu | Giá trị mẫu | Ghi chú |
| :--- | :--- | :--- | :--- |
| `session_id` | String | `4666a25c-4f32-4302-afa1-b4f72081b78c` | ID buổi học |
| `child_profile_id` | String | `Ihos1XxanJQZgLVlxzuB` | ID trẻ |
| `hosted_by` | String | `wCQwZYdgkVQhjv4RvYRPfctJjIT2` | ID giáo viên |
| `device_id` | String | `5cc9e74edcd6071f2cf3...` | ID kính VR |
| `lesson_id` | String | `WashingHand_1` | ID bài học |
| `lesson_name` | String | `Bài học rửa tay` | Tên bài học |
| `level_index` | **Number** | `0` | Cấp độ (0, 1, 2...) |
| `level_name` | String | `Chỉ dẫn và có mẫu` | Tên cấp độ |
| `score` | **Number** | `85` | Điểm (0-100) |
| `duration` | **Number** | `21.29` | Thời gian (giây) |
| `start_time` | String | `2026-04-18T10:31:12` | Giờ bắt đầu (ISO) |
| `finish_time` | String | `2026-04-18T10:32:05` | Giờ kết thúc (ISO) |
| `completion_status`| String | `success` | `success`/`aborted` |
| `type` | String | `theoretical` | `practical`/`theoretical` |
| `video_url` | String | `null` | Link video (nếu có) |
| **`quest_logs`** | **Array** | *(Xem Bước 2)* | Mảng các bước nhiệm vụ |
| **`auto_alerts`** | **Array** | *(Xem Bước 3)* | Mảng cảnh báo tự động |

---

## 🛠 Bước 2: Tạo mảng `quest_logs`
Tại trường `quest_logs`, thêm các phần tử kiểu **Map**. Dưới đây là 6 bước đầy đủ cho bài học Rửa tay (`WashingHand_1`):

```json
[
  { "index": 0, "quest_name": "Bật vòi nước", "response_time": 1.93, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0 },
  { "index": 1, "quest_name": "Làm ướt tay", "response_time": 6.19, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0 },
  { "index": 2, "quest_name": "Xịt xà phòng", "response_time": 1.22, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0 },
  { "index": 3, "quest_name": "Rửa tay", "response_time": 4.07, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0 },
  { "index": 4, "quest_name": "Tắt vòi nước", "response_time": 1.88, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0 },
  { "index": 5, "quest_name": "Lau tay với khăn", "response_time": 5.97, "completion_status": "success", "hints_verbal": 0, "hints_visual": 0, "hints_physical": 0 }
]
```

---

## 🛠 Bước 3: Tạo mảng `auto_alerts`
Tại trường `auto_alerts` trong tài liệu Session trên, thêm các phần tử kiểu **Map** (Dùng để vẽ biểu đồ Radar).

Một mẫu alert đầy đủ:

```json
{
  "type": "distraction",
  "group": "distraction",
  "severity": "medium",
  "duration_sec": 10.5,
  "time_offset": 45.2,
  "quest_index": 1,
  "auto_detected": true,
  "suppressed": false
}
```

---

## 🧪 Dữ liệu Test nhanh (5 Documents)
Để dễ dàng phân biệt với dữ liệu thật, các `session_id` dưới đây sử dụng tiền tố **`TEST_`**.

**Thông tin chung cho 5 bản ghi:**
- **Child ID**: `XrtGTcnPz4yZPFwUKBiE`
- **Host ID**: `NzIspIBjNtRdH0l92IQ1rUyft272`

| STT | `session_id` | `start_time` | `score` | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `TEST_SESSION_001` | `2026-04-15T08:00:00` | 90 | Buổi học sáng |
| 2 | `TEST_SESSION_002` | `2026-04-16T10:30:00` | 75 | Có một vài cảnh báo |
| 3 | `TEST_SESSION_003` | `2026-04-17T14:00:00` | 88 | Tiến bộ tốt |
| 4 | `TEST_SESSION_004` | `2026-04-18T16:15:00` | 92 | Đạt điểm cao |
| 5 | `TEST_SESSION_005` | `2026-04-19T19:00:00` | 80 | Buổi tối, hơi xao nhãng |

---

## 📄 Chi tiết JSON 5 tài liệu mẫu (Copy-Paste)
Dưới đây là nội dung đầy đủ để bạn có thể copy vào Firestore (chọn chế độ JSON hoặc Map).

### 1. `TEST_SESSION_001` (Sáng - Hoàn thành tốt)
```json
{
  "session_id": "TEST_SESSION_001",
  "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
  "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
  "lesson_id": "WashingHand_1",
  "lesson_name": "Bài học rửa tay",
  "level_index": 0,
  "score": 90,
  "duration": 45,
  "start_time": "2026-04-15T08:00:00",
  "finish_time": "2026-04-15T08:00:45",
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
}
```

### 2. `TEST_SESSION_002` (Sáng - Có xao nhãng)
```json
{
  "session_id": "TEST_SESSION_002",
  "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
  "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
  "lesson_id": "WashingHand_1",
  "lesson_name": "Bài học rửa tay",
  "level_index": 0,
  "score": 75,
  "duration": 60,
  "start_time": "2026-04-16T10:30:00",
  "finish_time": "2026-04-16T10:31:00",
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
}
```

### 3. `TEST_SESSION_003` (Chiều - Tập trung tốt)
```json
{
  "session_id": "TEST_SESSION_003",
  "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
  "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
  "lesson_id": "WashingHand_1",
  "lesson_name": "Bài học rửa tay",
  "level_index": 1,
  "score": 88,
  "duration": 40,
  "start_time": "2026-04-17T14:00:00",
  "finish_time": "2026-04-17T14:00:40",
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
}
```

### 4. `TEST_SESSION_004` (Chiều - Xuất sắc)
```json
{
  "session_id": "TEST_SESSION_004",
  "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
  "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
  "lesson_id": "WashingHand_1",
  "lesson_name": "Bài học rửa tay",
  "level_index": 2,
  "score": 92,
  "duration": 35,
  "start_time": "2026-04-18T16:15:00",
  "finish_time": "2026-04-18T16:15:35",
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
}
```

### 5. `TEST_SESSION_005` (Tối - Mệt mỏi/Chậm)
```json
{
  "session_id": "TEST_SESSION_005",
  "child_profile_id": "XrtGTcnPz4yZPFwUKBiE",
  "hosted_by": "NzIspIBjNtRdH0l92IQ1rUyft272",
  "lesson_id": "WashingHand_1",
  "lesson_name": "Bài học rửa tay",
  "level_index": 1,
  "score": 80,
  "duration": 55,
  "start_time": "2026-04-19T19:00:00",
  "finish_time": "2026-04-19T19:00:55",
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
}
```

> [!TIP]
> Sử dụng tiền tố `TEST_` cho `session_id` giúp bạn dễ dàng lọc bỏ các bản ghi này khi thực hiện báo cáo hoặc phân tích dữ liệu thực tế sau này.

---
*Dữ liệu trên đã được kiểm duyệt khớp hoàn toàn với thực tế và thiết kế hệ thống VRA.*
