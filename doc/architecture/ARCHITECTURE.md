# 🧠 HỆ THỐNG TÀI KHOẢN, PHÂN QUYỀN & KIẾN TRÚC MÁY CHỦ (VR THERAPY PLATFORM)

> **Tài liệu tham khảo liên quan:**
> - [DATABASE_SCHEMA_DESIGN.md](./DATABASE_SCHEMA_DESIGN.md)
> - [SYSTEM_ARCHITECTURE_DIAGRAMS.md](./SYSTEM_ARCHITECTURE_DIAGRAMS.md)
> - [ALERT_SYSTEM_DESIGN.md](./ALERT_SYSTEM_DESIGN.md)
> - [WEB_DASHBOARD_IDEAS.md](./WEB_DASHBOARD_IDEAS.md)

---

## 1. 🎯 Tổng quan kiến trúc B2B (Doanh nghiệp)

Hệ thống được thiết kế theo mô hình **B2B Strict Role-Based Access Control (RBAC)** với 4 vai trò chính:
* **System Admin (Hệ thống)**
* **Center Manager (Quản lý Trung tâm)**
* **Expert (Chuyên gia/Giáo viên)**
* **Parent (Phụ huynh)**

> ⚠️ **Child KHÔNG phải là tài khoản:**
> Child (Trẻ) chỉ là một **thực thể dữ liệu (data entity)** được quản lý bởi Expert và liên kết với Parent. Trẻ tuyệt đối không tương tác với hệ thống Auth hay quy trình đăng nhập.

---

## 2. 🏗️ Mô hình phân cấp

```text
System Admin
   ↓
Center Manager
   ↓
Expert  ──┬──  Parent
          │
      Child (Data Profile)
```

---

## 3. 👥 Vai trò & quyền hạn chính

### 🧑‍💼 System Admin (Cấp cao nhất)
* Quản lý toàn bộ hệ thống (Highest Authority).
* Khởi tạo các **Center (Trung tâm)**.
* Khởi tạo tài khoản **Center Manager** làm đại diện cho mỗi Center.
* Xem được toàn bộ danh sách Center, trạng thái hoạt động và thống kê chung. (Không xem dữ liệu lâm sàng của trẻ).

### 🏢 Center Manager (Quản lý Trung tâm)
* Đại diện cho một `center_id` cụ thể, do System Admin cấp.
* Có quyền Cấp / Tạo tài khoản cho các **Expert** (Chuyên gia) và **Parent** (Phụ huynh) trực thuộc cấu trúc trung tâm của mình. (TUYỆT ĐỐI không có Public Sign-up từ bên ngoài).
* Khai báo hồ sơ `Child Profiles` mới.
* **Phân bổ (Assignment)**: Gán Child cho Expert cụ thể (Chuyên gia được chỉ định theo dõi) và gán Child vào tài khoản Parent.
* **Cách ly dữ liệu (Data Isolation)**: Giữa các trung tâm khác nhau tuyệt đối không thể xem được dữ liệu (Experts/Child/Sessions) của nhau nhờ Firestore Security Rules.

### 🧑‍⚕️ Expert (Chuyên gia - Core Role)
* Được Center Manager khởi tạo tài khoản.
* Chỉ xem và tương tác được với những **Child** mà mình được phân công trực tiếp.
* Xem được thông tin **Parent** (Phụ huynh) của những đứa trẻ đó.
* Điều khiển và khởi chạy live VR session, đánh giá tiến trình học tập lâm sàng.
* **Quản lý Alert:** Cấu hình **Alert Profile** cho trẻ ở chế độ tĩnh và theo dõi **Alert Control Panel** trong lúc chạy Live Session. 
* **Ghi nhận & Can thiệp (Manual Logging):** Chủ động gửi lệnh can thiệp (Interventions - ví dụ: thay đổi level, phát gợi ý) vào môi trường VR và ghi chép Behavior Logs.

### 👨‍👩‍👧 Parent (Phụ huynh)
* Được Center Manager khởi tạo tài khoản.
* Chỉ xem báo cáo và lịch sử session của **Child (Con của mình)** thông qua dashboard trực quan.
* Không được phép chỉnh sửa dữ liệu chuyên môn, cấu hình hay can thiệp vào buổi học.

---

## 4. 🔗 Khởi tạo tài khoản & Liên kết kết nối (Provisioning Flow)

Áp dụng mô hình **No Public Sign-up**:

1. **Tạo mạng lưới Trung tâm:** System Admin vào Super Admin Panel tạo Center và account Center Manager (Gán Claim `{ "role": "center_manager" }`).
2. **Khởi tạo Nhân sự & Khách hàng:** Center Manager đăng nhập vào Web Dashboard, gửi lệnh gọi Cloud Functions tạo Auth User cho Expert (Chuyên gia) và Parent.
3. **Khai báo & Phân công Hồ sơ:** Center Manager tạo các bản ghi `Child_Profiles`. Sau đó tiến hành gán (Assign) Child cho 1 `Expert` (chủ trị) và 1 `Parent` (theo dõi). 
4. **Bảo mật truy cập:** Firestore Rule & Firebase Custom Claims sẽ kiểm tra `uid` và `center_id` để quyết định ai có quyền đọc/ghi dữ liệu lên Child Profile.

---

## 5. 🗄️ Kiến trúc Dữ liệu Đám mây (Hybrid Database)

Nhằm đáp ứng khả năng scale quy mô lớn và tối ưu chi phí (Cloud Billing) cũng như hiệu năng Real-time siêu tốc, hệ thống sử dụng kết hợp 2 loại Database:

### A. Cloud Firestore (Dữ liệu cố định / Bền vững)
- **Công dụng:** Lưu Database chính của hệ thống. Dễ scale, query filter siêu linh hoạt.
- **Mô hình Flat:** Collection `users`, `centers`, `child_profiles`, `lessons`, `sessions` đứng tách bạch ngang hàng nhau, tham chiếu qua ID.
- **Dữ liệu Lưu trữ:** 
  - Tài khoản, Roles.
  - Thông tin bệnh án, Alert Profile.
  - Thông số tổng kết buổi học (Sessions, Intervention_Logs, Behavior_Logs, Auto_Alerts) sau khi đã đánh theo khối (Batch/Bulk write ở cuối buổi).

### B. Firebase Realtime Database (Volatile / Tạm thời)
- **Công dụng:** Relay server lưu lượng dữ liệu siêu tốc, độ trễ tiệm cận không. Dữ liệu sẽ tự huỷ sau khi session kết thúc (Tránh tính phí số lượng Doc Write).
- **Dữ liệu Lưu trữ:**
  - `pairing_codes`: Mã PIN Pairing (Tuổi thọ 5 phút).
  - `live_sessions/commands`: Lệnh của giáo viên bắn vào Kính VR.
  - `behavior_snapshots`: Data Telemetry (Góc quay đầu, vị trí tay) được bắn lên liên tục 2s/lần từ Kính VR để Web lấy stream làm nguồn detect cảnh báo tự động.

> 👉 Xin tham khảo: `DATABASE_SCHEMA_DESIGN.md` để xem Cấu trúc JSON chi tiết toàn hệ thống.

---

## 6. 🔄 Phân luồng Dashboard theo Vai trò

Người dùng chung 1 hệ thống login hệ thống: Nhập Email + Password. Tùy theo Custom Claim, UI sẽ route vào trang khác nhau:
* System Admin $\rightarrow$ `/dashboard/admin`
* Center Manager $\rightarrow$ `/dashboard/center`
* Expert $\rightarrow$ `/dashboard/expert`
* Parent $\rightarrow$ `/dashboard/parent`

---

## 7. 🎮 VR Session & Chế độ Ghép nối (PIN-Pairing)

**Trẻ và thiết bị VR tuyệt đối không cần tài khoản đăng nhập** để tránh phiền phức về UX và rò rỉ quyền trên thiết bị. Thay vào đó, nền tảng sử dụng cơ chế **PIN-Pairing (như Smart TV)**:

1. **Khởi động VR:** App VR sinh ngẫu nhiên mã kết nối (VD: `ABC-123`). Kính tự đẩy mã này lên mạng Firebase RTDB nhánh `pairing_codes` và đứng đợi.
2. **Khởi động Web Dashboard:** Expert mở hồ sơ Child trên Web, chọn "Bắt đầu bài học".
3. **Nhập PIN Code:** Expert nhập `ABC-123` vào Browser.
4. **Kết nối:** RTDB chốt trạng thái `paired`. Kính VR tự động tải cấu hình Lesson và khởi chạy không gian 3D của `child_id` tương ứng. Giao diện Web chuyển sang chế độ Remote Control.

---

## 8. ⚡ Kiến trúc Mạng & Phân bổ Truyền Tải (Telepresence)

Khi chạy Live Session cùng chung địa điểm (Co-located Setup), luồng Video trực tiếp cũng như thông số cảm biến phải **ổn định cực kỳ với độ trễ 0s**:

*   **Streaming Video POV (WebRTC P2P):** Kính VR bắn Video quay màn hình thẳng vào Web Dashboard thông qua mạng LAN/Wifi, **không cần vòng qua Cloud Firebase**. Điều này ngăn nghẽn băng thông mạng và cắt bỏ 100% cloud cost cho live stream.
*   **Sensor Telemetry (Realtime Database):** Kính xuất tọa độ 3D mỗi 2s/lần lên Firebase RTDB $\rightarrow$ Web Dashboard đón nhận bằng Listener và làm nền tảng nuôi bộ engine nhận dạng hành vi AI.
*   **Batch Logging Session (Firestore):** Chuyên gia kết thúc, thiết bị Web đóng ghim (commit) tất cả manual logs; trong khi VR thiết bị nén raw telemetry JSON file và chỉ Write DUY NHẤT 1 LẦN lên Firestore. Tính năng này chặn rủi ro vỡ quỹ Billing so với log rời từng dòng. 

> 👉 Tham khảo: Biểu đồ kết nối Sequence Diagram tại `SYSTEM_ARCHITECTURE_DIAGRAMS.md`.

---

## 9. 🚨 Hệ thống AI An Toàn (Alert Engine & Logging)

**Nguyên tắc cốt lõi: Human-in-the-Loop.** AI đóng vai trò Đánh giá, Trợ lý đề xuất, Phát hiện lỗi, nhưng **KHÔNG BAO GIỜ can thiệp vòng qua mặt Chuyên Gia** để xử lý trực tiếp lên môi trường 3D của trẻ.

### Alert Control (Detect tự động)
- **Web Alert Engine:** Đón `behavior_snapshots` từ RTDB $\rightarrow$ Suy luận `freeze`, `distraction`, hoặc `hesitation`.
- **Alert Control Panel:** Tích hợp giao diện bên tay phải cho phép Expert gạt công tắc bật tắt tự do (MUTE) các nhóm Alert theo mức độ nghiệm trọng, nhưng luồng backend vẫn ưu tiên lưu log không để sót sự kiện.

### Manual Logging (Chuyên gia can thiệp)
- Chuyên gia có thể ra lệnh (`trigger_hint`, `skip_level`) lên VR qua Firebase DB (Live Commands). Kính VR tiếp nhận và dịch thành Unity Events (Intervention_Log).
- Chuyên gia bấm ghi chú "Cơn Meltdown", "Sự nhạy cảm Cảm giác" $\rightarrow$ Web gom về bộ nhớ tạm (RAM) và chỉ chốt (Behavior_Log) sau cuối giờ.

> 👉 Xin tham khảo: Bảng định nghĩa số liệu Sensor tại `ALERT_SYSTEM_DESIGN.md`.

---

## 10. 📌 Mục tiêu cốt lõi

* Hệ thống hoàn toàn **Scalable cho lượng lớn Clinic Enterprise**, cắt giảm Cloud Budget bằng kiến trúc lai.
* Xây dựng luồng quy trình thực tế lâm sàng (Trẻ học VR $\rightarrow$ Giáo viên soi POV Web $\rightarrow$ Cảnh báo AI nhắc nhở).
* Cô lập dữ liệu mạnh bằng Firestore Isolation Rules dựa trên mô hình phân cấp.
