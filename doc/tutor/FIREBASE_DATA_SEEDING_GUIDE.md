# 🚀 Hướng dẫn khởi tạo dữ liệu mẫu (Bản Chốt 100% Dữ liệu thực & Draw.io)

Tài liệu này là "nguyên bản" dữ liệu từ hệ thống của bạn, được trình bày để bạn có thể nhập liệu chính xác nhất.

---

## 📂 Cấu trúc dữ liệu
- **Collection `sessions`**: Document chứa các trường thông tin phẳng và mảng `quest_logs`.
- **Sub-collection `auto_alerts`**: Nằm bên trong mỗi Session document (Dùng để tính biểu đồ Radar).

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
| `duration` | **Number** | `21.98` | Thời gian (giây) |
| `start_time` | String | `2026-04-12T18:44:04` | Giờ bắt đầu (ISO) |
| `finish_time` | String | `2026-04-12T18:44:57` | Giờ kết thúc (ISO) |
| `completion_status`| String | `success` | `success`/`aborted` |
| `type` | String | `theoretical` | `practical`/`theoretical` |
| `video_url` | String | `null` | Link video (nếu có) |
| **`quest_logs`** | **Array** | *(Xem Bước 2)* | Mảng các bước nhiệm vụ |

---

## 🛠 Bước 2: Tạo mảng `quest_logs`
Tại trường `quest_logs`, thêm các phần tử kiểu **Map**. Một mẫu bước đầy đủ:

```json
{
  "index": 0,
  "quest_name": "Bật vòi nước",
  "response_time": 1.78,
  "completion_status": "success",
  "hints_verbal": 0,
  "hints_visual": 0,
  "hints_physical": 0
}
```

---

## 🛠 Bước 3: Tạo Sub-collection `auto_alerts`
Dùng để vẽ biểu đồ Radar. Nhấn "Start collection" trong tài liệu Session trên và nhập tên: `auto_alerts`.

| Tên trường (Field) | Kiểu dữ liệu | Giá trị mẫu | Trục Radar |
| :--- | :--- | :--- | :--- |
| `type` | String | `distraction` | **Tập trung** |
| `group` | String | `distraction` | |
| `severity` | String | `medium` | (Tính điểm phạt) |
| `duration_sec` | **Number** | `10.5` | |
| `time_offset` | **Number** | `45.2` | |
| `quest_index` | **Number** | `1` | |
| `auto_detected` | **Boolean** | `true` | |
| `suppressed` | **Boolean** | `false` | |

---
*Dữ liệu trên đã được kiểm duyệt khớp hoàn toàn với thực tế và thiết kế hệ thống VRA.*
