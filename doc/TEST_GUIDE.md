# 🧪 Tài liệu Hướng dẫn Kiểm thử (Test Guide) - VRA System

Tài liệu này cung cấp các kịch bản kiểm thử (Test Cases) để bạn xác minh lại toàn bộ hệ thống sau đợt "Đại tu" (Refactor) vừa qua. Đợt refactor đã thay đổi rất nhiều cấu trúc dữ liệu bên dưới (đặc biệt là typecasting và data channels), vì vậy việc test tích hợp giữa Web và Unity là **cực kỳ quan trọng**.

---

## 🛠 1. Chuẩn bị Môi trường

1. **Khởi động Web:** 
   - Chạy lệnh `npm run dev` trên terminal.
   - Truy cập `http://localhost:3000` và đăng nhập bằng tài khoản Chuyên gia (Expert).
2. **Khởi động Unity:** 
   - Mở project VRA trong Unity Editor (hoặc build ra kính VR).
   - Đảm bảo thiết bị VR có kết nối Internet cùng mạng hoặc có thể truy cập được Firebase RTDB & LiveKit.

> [!TIP]
> **Dev Mode Bypass:** Nếu bạn chưa kịp cài Unity mà vẫn muốn test giao diện Web, hãy vào màn hình **Bắt đầu bài học** trên web -> Bật công tắc `[Dev Mode]` -> Hệ thống sẽ giả lập mã PIN và cho phép bạn vào thẳng màn hình Live Session.

---

## 🔄 2. Kịch bản 1: Luồng Ghép nối (Pairing)

**Mục tiêu:** Đảm bảo Web và Kính VR nhận diện được nhau thông qua Firebase Realtime Database.

- **Bước 1:** Trong Unity VR, khởi động ứng dụng. Ứng dụng sẽ sinh ra một **Mã PIN (6 số)** hiện lên màn hình chờ của kính.
- **Bước 2:** Trên Web, vào **Dashboard Chuyên gia > Quản lý Bài học**.
- **Bước 3:** Chọn một bài học và một Trẻ, bấm **Bắt đầu Session**.
- **Bước 4:** Nhập mã PIN (từ kính VR) vào popup trên Web và xác nhận.
- **Kỳ vọng (Expected Result):** 
  - Kính VR nhận tín hiệu bắt đầu, chuyển sang Scene bài học.
  - Web tự động chuyển hướng (redirect) sang màn hình `Live Session (/dashboard/expert/session/[id])`.

---

## 📡 3. Kịch bản 2: Live Session & Telemetry

**Mục tiêu:** Đảm bảo luồng dữ liệu thời gian thực (Heart rate, Focus, Stress) bắn từ VR lên Web không bị lỗi do ép kiểu (type casting).

- **Bước 1:** Trong lúc bài học đang diễn ra, quan sát màn hình Web.
- **Bước 2:** Nhìn vào các biểu đồ và chỉ số sinh tồn (Telemetry).
- **Kỳ vọng:**
  - Nhịp tim, Mức độ tập trung, Mức độ căng thẳng nảy số liên tục (nếu VR đang gửi data).
  - Không có cảnh báo lỗi UI đỏ (React error boundary) nào xuất hiện.

---

## 💬 4. Kịch bản 3: Tương tác NPC (LiveKit DataChannel)

**Mục tiêu:** Kiểm tra Panel thay đổi nhiều nhất trong đợt refactor - hệ thống gửi lệnh từ Web xuống VR (DataChannel).

- **Bước 1:** Nhìn sang panel **NPC Chat** bên phải màn hình Live Session.
- **Bước 2:** Bấm vào các câu lệnh gợi ý (Quick Phrases) hoặc tự gõ câu lệnh vào ô chat rồi bấm `Gửi`.
- **Bước 3:** (Trong Unity) Kiểm tra log hoặc nghe xem nhân vật NPC có phát ra giọng nói/hành động tương ứng không.
- **Bước 4:** Bấm thử nút **Verbal Hint** (Gợi ý bằng lời).
- **Kỳ vọng:**
  - Chữ hiển thị đúng theo "Nhiệm vụ hiện tại" (Current Quest).
  - Web gửi data thành công (bạn có thể check F12 Console trên Web xem có log `[LiveKitDataChannel] Sent SPEAK_SCRIPT`).
  - Unity nhận được packet và xử lý mà không bị crash.

---

## 🛑 5. Kịch bản 4: Kết thúc Session & Lưu Báo cáo

**Mục tiêu:** Đảm bảo dữ liệu session được lưu chính xác vào Firestore.

- **Bước 1:** Trên Web, bấm nút **Kết thúc Session** (End Session) màu đỏ.
- **Bước 2:** Điền các thông tin vào **Popup Tóm tắt** (Ghi chú của chuyên gia, Đánh giá nhiệm vụ, Đánh giá hành vi).
- **Bước 3:** Bấm Lưu và hoàn tất.
- **Bước 4:** Vào menu **Lịch sử (History)** và **Báo cáo (Reports)**.
- **Kỳ vọng:**
  - Session vừa chơi hiển thị đúng trên trang History.
  - Các thống kê (thời gian, điểm số) hiển thị không bị `undefined` hay `[object Object]`.
  - Biểu đồ hành vi (Behavior) hiển thị đầy đủ các log tự động (nếu có nhịp tim vượt ngưỡng) và log thủ công.

---

> [!IMPORTANT]
> **Checklist phòng ngừa rủi ro:** 
> Do chúng ta đã loại bỏ rất nhiều kiểu `any`, nếu dữ liệu từ Firebase gửi lên bị thiếu trường (ví dụ thiếu `time_offset` hoặc `quest_name`), code có thể báo lỗi hoặc hiển thị không trọn vẹn. Hãy mở F12 Console khi test để đảm bảo không có lỗi ngầm.

Chúc bạn có một buổi test mượt mà với Unity vào ngày mai! Cứ thoải mái ném lỗi cho tôi nếu Unity hoặc Web có bất kỳ sự cố nào.
