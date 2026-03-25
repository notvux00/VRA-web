# 🧠 HỆ THỐNG TÀI KHOẢN & PHÂN QUYỀN (VR THERAPY PLATFORM)

## 1. 🎯 Tổng quan kiến trúc

Hệ thống được thiết kế theo mô hình **Role-Based Access Control (RBAC)** với 4 vai trò chính:
* **Admin (System Owner)**
* **Center (Trung tâm)**
* **Therapist (Chuyên gia)**
* **Parent (Phụ huynh)**

> ⚠️ **Child KHÔNG phải là tài khoản**
> → Child chỉ là một **thực thể dữ liệu (data entity)** được quản lý bởi therapist và liên kết với parent.

---

## 2. 🏗️ Mô hình phân cấp

```
Admin
   ↓
Center
   ↓
Therapist
   ↓
Child (data only)
   ↑
Parent
```

---

## 3. 👥 Vai trò & quyền hạn

### 🧑‍💼 Admin (Cấp cao nhất)
* Quản lý toàn bộ hệ thống (Highest Authority).
* Cấp / Tạo tài khoản cho các **Center** (Trung tâm).
* Xem được danh sách tất cả các Center, trạng thái hoạt động (Active/Inactive), và thống kê tổng quan toàn nền tảng.

### 🏢 Center (Trung tâm)
* Được Admin cấp tài khoản.
* Có quyền Cấp / Tạo tài khoản cho các **Therapist** (Chuyên gia/Bác sĩ) trực thuộc trung tâm của mình.
* Xem được danh sách các Therapist và toàn bộ **Child** đang được quản lý bởi trung tâm này.
* **Phân bổ (Assignment/Reassignment)**: Có quyền gán một hoặc **nhiều Therapist** cùng phụ trách điều trị cho một Child. Có quyền thuyên chuyển, cắt quyền của Therapist khỏi Child (VD: khi bác sĩ nghỉ việc hoặc đổi ca).
* **Cách ly dữ liệu (Data Isolation)**: Giữa các trung tâm khác nhau tuyệt đối không thể xem được dữ liệu (Therapist/Child/Sessions) của nhau. Phân chia ranh giới rõ ràng.

### 🧑‍⚕️ Therapist (Chuyên gia - core role)
* Được Center tạo và cấp tài khoản.
* Chỉ xem được danh sách những **Child** mà mình được phân công chịu trách nhiệm trực tiếp (Một Child có thể được theo dõi bởi nhiều Therapist).
* Xem được thông tin **Parent** (Phụ huynh) của những đứa trẻ đó để tiện trao đổi.
* Tạo và điều hành VR session, đánh giá tiến trình trị liệu.
* **Quản lý Alert:** Cấu hình **Alert Profile** (ngưỡng cảnh báo hành vi) cho từng Child và giám sát, điều khiển trực tiếp qua **Alert Control Panel** trong Live Session.
* **Ghi nhận & Can thiệp thủ công (Manual Logging):** Chủ động gửi lệnh can thiệp (Intervention) vào môi trường VR và ghi chép lại các biểu hiện tâm lý/hành vi đặc thù (Behavior Log) của trẻ.

### 👨👩👧 Parent (Phụ huynh)
* Xem dữ liệu của Child (con của mình)
* Xem lịch sử session
* Xem thống kê, biểu đồ tiến bộ
* Không được chỉnh sửa dữ liệu chuyên môn

### 🧒 Child (KHÔNG có account)
* Không đăng nhập
* Không tương tác trực tiếp với hệ thống auth
* Là đối tượng dữ liệu được quản lý

---

## 4. 🔐 Nguyên tắc phân quyền
* **Admin**: Xem toàn hệ thống.
* **Center**: Chỉ gọi dữ liệu (Therapist, Child) có gắn `center_id` của mình. Không thể query chéo sang Center khác.
* **Therapist**: Chỉ gọi dữ liệu (Child, Parent) có gắn `therapist_id` của mình.
* **Parent**: Chỉ truy cập Child đã liên kết thành công qua `link_code`.
👉 Không có quyền nào được cấp vượt cấp hoặc truy cập chéo (Cross-tenant access).

---

## 5. 🔗 Liên kết Parent - Child (Core Flow)

### ✅ Cơ chế chính: "Mã liên kết" (Link Code Lifecycle & Security)

### 🧑‍⚕️ Bước 1: Therapist / Center tạo Child
* Nhập thông tin: Tên, Tuổi, Tình trạng (ví dụ: ASD, ADHD)
* Hệ thống tạo: `child_id` và **link_code (mã liên kết)**.
* ⚠️ **Vòng đời mã liên kết (Lifecycle):** Mã code này được thiết kế theo dạng **One-Time-Use (Dùng 1 lần)** và có **Thời hạn sống (Expiration TTL)** (Ví dụ: tự hủy sau 48h). Quá hạn hoặc đã dùng rồi, mã sẽ rác, bắt buộc Therapist phải tạo mã mơí nếu cần. Nếu Child có 2 phụ huynh cùng muốn theo dõi, Therapist sẽ gen ra 2 mã riêng biệt.

### 👨‍👩‍👧 Bước 2: Parent đăng ký tài khoản
* Đăng ký bằng email + password hoặc Google Login.

### 🔑 Bước 3: Parent nhập mã liên kết
* Parent nhập `link_code`
* Hệ thống kiểm tra: Code hợp lệ, Còn hạn, Chưa bị sử dụng.
→ Nếu đúng: Gắn Parent vào Child, Parent bắt đầu thấy dữ liệu của Child. Đồng thời mã liên kết lập tức chuyển trạng thái **Đã sử dụng (Used/Revoked)**.
* 🛑 **Quyền ngắt kết nối (Unlink):** Center hoặc Therapist có nút "Thu hồi quyền truy cập". Cho phép "đá" (Suspend/Unlink) tài khoản Parent ra khỏi Child ngay lập tức nhằm bảo mật thông tin (Ví dụ: cha mẹ ly hôn cấm quyền, tranh chấp pháp lý...).

---

## 6. 🔐 Flow đăng ký / đăng nhập
* **Admin**: Tạo thủ công (seed trong hệ thống)
* **Center**: Đăng ký → Admin duyệt hoặc Admin tạo trực tiếp
* **Therapist**: Do Center tạo account, không tự đăng ký
* **Parent**: Tự đăng ký, sau đó nhập mã liên kết

---

## 7. 🔄 Flow đăng nhập
Tất cả user dùng chung 1 hệ thống login (Email + Password). Sau khi login, rẽ nhánh theo Role:
* Admin → `/dashboard/admin`
* Center → `/dashboard/center`
* Therapist → `/dashboard/therapist`
* Parent → `/dashboard/parent`

---

## 8. 📊 Dashboard theo vai trò
* **Admin**: Quản lý center, Thống kê toàn hệ thống
* **Center**: Danh sách therapist/child, Tổng quan tiến trình
* **Therapist**: Danh sách child, Tạo session VR, Theo dõi tiến trình chi tiết
* **Parent**: Danh sách con, Biểu đồ tiến bộ, Lịch sử session, Thông tin đơn giản dễ hiểu

---

## 9. 🎮 VR Session Flow & Chế độ Ghép nối (Pairing)
**"Session không cần account"**: Trẻ và thiết bị VR tuyệt đối không cần tài khoản đăng nhập để tránh UX phức tạp và dễ triển khai hàng loạt. Thay vào đó, nền tảng sử dụng cơ chế **PIN-Pairing (giống Smart TV)** để kết nối:

1. **Khởi động VR:** App VR bật lên, tự động hiển thị mốc `Mã kết nối: ABC-123` và đứng ở trạng thái chờ. Kính tự đẩy mã này lên hệ thống Firebase.
2. **Khởi động Web Dashboard:** Therapist (hoặc Parent) đăng nhập Web, chọn hồ sơ Child tương ứng -> Bấm "Bắt đầu bài học".
3. **Quét / Nhập mã:** Web yêu cầu nhập mã PIN. Người thao tác gõ `ABC-123` đang hiển thị trên kính VR.
4. **Kết nối thành công:** Hệ thống ghép đôi (Link) `vr_device_id` vật lý vào `session_id` phần mềm. Kính VR tự động tải cấu hình (`session_config`) tương ứng của Child đó và khởi chạy không gian ảo.

---

## 10. ⚡ Kiến trúc Mạng & Phân bổ Dữ liệu (Real-time & Telemetry)
Để trải nghiệm trên Dashboard đạt **độ trễ siêu thấp (Zero-Latency)** đồng thời tối ưu hóa triệt để rủi ro phình to chi phí Server (Cloud Billing), hệ thống áp dụng kiến trúc Hybrid:

*   **Streaming Hình ảnh (WebRTC P2P):** Hình ảnh POV thực tế từ kính VR được stream thẳng qua Web của Therapist bằng **WebRTC trên mạng nội bộ (Local LAN/Wifi)**. Cách thiết lập này không đi vòng qua Internet nên độ trễ gần như bằng 0 và không tốn phí băng thông máy chủ.
*   **Tín hiệu Điều khiển (Signaling & Commands):** Các lệnh Manual Logging (Intervention), thông số Alert toggle được truyền qua **Firebase Realtime Database** để đảm bảo tính ổn định và đồng bộ qua lại hai chiều.
*   **Tối ưu Chi phí Đo lường (Telemetry Cost Saving):** Quá trình đo data thô của buổi học (tọa độ mắt, tốc độ, vị trí...) diễn ra ở tần suất rất lớn. Nhằm tránh "bão Write Request" bào mòn ngân sách trên Firestore, kính VR gom chung data vào RAM/Realtime DB tạm. Chỉ khi **Session chính thức kết thúc**, một Data file (JSON) tổng hợp duy nhất mới được ghi (Write 1 lần) lên Cloud Firestore để lưu vĩnh viễn hành trình học liệu.

---

## 11. 🚨 Hệ thống Alert Control (Dành cho Therapist)

Hệ thống hỗ trợ chuyên gia (Therapist) quản lý các cảnh báo hành vi tự động trong suốt buổi học VR. Hệ thống bao gồm 2 thành phần chính kết nối với nhau:

*   **Alert Profile (Cấu hình trước Session)**: Là bộ thông số được thiết lập riêng cho từng trẻ (Child). Nó lưu trữ các ngưỡng (threshold) của các chỉ số hành vi, cũng như trạng thái bật/tắt (Enable/Disable) mặc định của từng nhóm cảnh báo sao cho phù hợp nhất với trạng thái của trẻ đó.
*   **Alert Control Panel (Trong Live Session)**: Là giao diện UI tích hợp ngay trên màn hình theo dõi (Live Session view). Cung cấp khả năng giúp Therapist linh hoạt bật/tắt (toggle) các nhóm cảnh báo theo thời gian thực (real-time) tùy biến vào diễn biến thực tế của buổi học lúc đó.

---

## 12. 📝 Hệ thống Manual Logging (Dành cho Therapist)

Hệ thống cho phép Chuyên gia (Giáo viên) tương tác trực tiếp vào buổi học VR của trẻ và ghi chép lại các hành vi mang tính chủ quan. Hệ thống xoay quanh 2 hành động chính:

*   **Intervention (Can thiệp):** Thao tác chủ động gửi lệnh phản hồi từ Web vào Kính VR của trẻ (Ví dụ: "Giảm độ khó", "Phát âm thanh gợi ý"). Kính VR sẽ thay đổi môi trường ngay lập tức, và hệ thống lưu lại log thao tác.
*   **Behavior Log (Ghi nhận hành vi):** Thao tác chốt lại các biểu hiện trạng thái tâm lý/hành vi của trẻ bằng mắt thường mà các thuật toán AI (Auto Alerts) không thể nhận biết được (Ví dụ: "Trẻ la hét", "Trẻ tự vỗ đầu").

---

## 13. 🔒 Nguyên tắc thiết kế quan trọng
* Child ≠ User
* Role được cấp từ hệ thống, KHÔNG do user tự chọn
* Mọi truy cập phải kiểm tra quyền
* Data access flow: Parent → Child, Therapist → Child, Center → tất cả Child của họ.
* **Nguyên tắc AI (Human-in-the-Loop):** AI chỉ có vai trò phân tích, ghi nhận, cảnh báo và đề xuất. AI KHÔNG BAO GIỜ tự động tương tác/can thiệp trực tiếp vào trẻ thay cho giáo viên.

---

## 14. 📌 Mục tiêu thiết kế
* Dễ scale, dễ maintain
* Phù hợp workflow trị liệu thực tế
* Tối ưu UX cho phụ huynh và trẻ nhỏ
