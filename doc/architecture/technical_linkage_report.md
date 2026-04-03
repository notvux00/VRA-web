# 🏗️ Kiến Trúc Hệ Thống: Xác Thực & Liên Kết Dữ Liệu (VRA)

Tài liệu này cung cấp cái nhìn toàn diện về cách VRA vận hành, từ lúc người dùng đăng nhập cho đến khi dữ liệu được liên kết và bảo vệ an toàn giữa các vai trò (Role).

---

## 1. Cơ Chế Xác Thực & Phân Quyền (RBAC)

Đây là "cánh cổng" đầu tiên và quan trọng nhất của hệ thống, sử dụng công nghệ JWT (JSON Web Token) tiên tiến.

### 🔑 Quy trình Đăng nhập (Authentication Flow)
- **Firebase Auth:** Xác thực Email/Password tại Client để lấy `ID Token`.
- **Server Action (`createSession`):**
    - Xác minh Token và kiểm tra Role thực tế trong Firestore (Source of Truth).
    - Đồng bộ quyền hạn vào **Custom Claims** của Firebase Auth.
    - Thiết lập **Session Cookie** (`httpOnly`, `secure`) lưu tại trình duyệt trong 5 ngày.

### 🛡️ Lớp chặn Middleware (Edge Verification)
Sử dụng **Next.js Middleware** kết hợp thư viện `jose` để kiểm soát truy cập tại tầng Edge (tốc độ cao):
- **Xác thực chữ ký số:** Tự động fetch Public Keys từ Google để đảm bảo Cookie không bị giả mạo.
- **Cách biệt phân vùng (Route Protection):**
    - Quản trị viên -> `/dashboard/admin/**`
    - Trung tâm -> `/dashboard/center/**`
    - Chuyên gia -> `/dashboard/expert/**`
    - Phụ huynh -> `/dashboard/parent/**`
- **Điều hướng thông minh:** Tự động "đẩy" người dùng về đúng phân vùng dashboard của họ dựa trên Role trong Token.

---

## 2. Kiến Trúc Dữ Liệu (Firestore Schema)

Hệ thống sử dụng mô hình **NoSQL** tập trung vào hiệu năng truy vấn thông qua các ID tham chiếu.

### 📦 Các Collection chính:

| Thực thể | Key (ID) | Vai trò liên kết |
| :--- | :--- | :--- |
| **Centers** | `docId` | Gốc rễ, chứa `expertCount`, `totalChildren`. |
| **Experts** | `uid` | Chuyên gia thuộc một `centerId`. |
| **Parents** | `uid` | Phụ huynh thuộc một `centerId`. |
| **Child Profiles** | `docId` | Trung tâm kết nối: chứa `centerId`, `expertUids` (mảng), `parentUid`. |

---

## 3. Cơ Chế Liên Kết & Nghiệp Vụ (The Linkage)

Đây là cách hệ thống kết nối con người với dữ liệu thực tế.

### 🧑‍⚕️ Chuyên gia <-> Trẻ (Quan hệ N - N)
- Một trẻ có thể có nhiều chuyên gia (đa trị liệu).
- Sử dụng mảng `expertUids` trong hồ sơ trẻ.
- **Truy vấn:** `.where("expertUids", "array-contains", expertUid)` giúp chuyên gia chỉ thấy trẻ mình phụ trách.

### 👨‍👩‍👧 Phụ huynh <-> Trẻ (Quan hệ 1 - N)
- Sử dụng trường `parentUid` duy nhất trong hồ sơ trẻ.
- Hồ sơ trẻ là "điểm chạm" để phụ huynh theo dõi tiến trình của con mình.

---

## 4. Công Nghệ & Kỹ Thuật Đặc Thù

### ⚡ Server Actions (Next.js 15+)
Toàn bộ logic nghiệp vụ chạy ở Server-side (`"use server"`).
- Bảo vệ an toàn các API Key nhạy cảm.
- Thực thi các thao tác đặc quyền thông qua **Firebase Admin SDK**.

### 🔢 Atomic Operations (Cập nhật nguyên tử)
Đảm bảo tính chính xác của dữ liệu thống kê:
- Sử dụng `admin.firestore.FieldValue.increment(1)` để tránh lỗi sai lệch (Race Condition) khi có hàng trăm người cùng thao tác.

### 🔏 Data Isolation (Cô lập dữ liệu)
Mọi truy vấn bắt buộc phải kèm theo điều kiện lọc theo `centerId`.
> [!IMPORTANT]
> **Quy tắc vàng:** Dữ liệu của Trung tâm A và Trung tâm B luôn được phân tách tuyệt đối, không bao giờ xảy ra tình trạng rò rỉ chéo.

---

## 5. Quy Trình Vận Hành (Workflow)

1. **Admin:** Khởi tạo hệ thống và Trung tâm (`Center`).
2. **Center Manager:** Tạo tài khoản cho Chuyên gia và Phụ huynh.
3. **Phân công:** Manager gắn Chuyên gia vào hồ sơ Trẻ (UID vào Array) và liên kết với Phụ huynh.
4. **Trải nghiệm:** Chuyên gia đăng nhập -> Middleware đưa về Dashboard -> Hệ thống lọc danh sách trẻ dựa trên UID của họ.

---

> [!CAUTION]
> **An toàn tuyệt đối:** Nếu người dùng cố tình can thiệp vào Session Cookie thủ công, chữ ký JWT sẽ bị hỏng. Middleware sẽ ngay lập tức phát hiện, xóa Cookie và yêu cầu đăng nhập lại.
