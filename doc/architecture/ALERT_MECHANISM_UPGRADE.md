# Tài Liệu Nâng Cấp Hệ Thống Cảnh Báo (Alert System Upgrade)

Tài liệu này mô tả sự thay đổi từ cơ chế cảnh báo sơ khai sang hệ thống theo dõi hành vi thông minh (Smart Behavior Tracking) trong dự án VR-Autism.

---

## 1. So Sánh Cơ Chế Cũ và Mới

### Xao nhãng (Distraction)
- **Cơ chế cũ:** Hệ thống kiểm tra mỗi 6 giây. Nếu trẻ xao nhãng, bắn ra một thẻ thông báo cố định 6 giây. Nếu trẻ tiếp tục xao nhãng thêm 12 giây nữa, màn hình sẽ hiện ra 3 thẻ giống hệt nhau, gây loãng thông tin.
- **Cơ chế mới:** Khi đạt ngưỡng 6 giây, hệ thống bắn ra 1 thẻ duy nhất. Nếu hành vi tiếp diễn, thẻ này sẽ tự động cập nhật thời lượng (`duration_sec`) liên tục (ví dụ: 6.2s, 8.0s... 25s). Thẻ chỉ dừng lại khi trẻ tập trung trở lại mục tiêu.

### Lắc đầu mạnh (Stimming)
- **Cơ chế cũ:** Cảnh báo tức thì (Event-based). Mỗi lần cảm biến phát hiện cường độ lắc đầu vượt ngưỡng là một thẻ mới hiện ra ngay lập tức. Nếu trẻ lắc đầu liên tục trong 10 giây, giáo viên có thể nhận tới 5-10 thông báo lẻ tẻ.
- **Cơ chế mới:** Sử dụng **Bộ đệm 4 giây (Grace Period)**. Hệ thống sẽ gộp các cơn lắc đầu gần nhau vào một phiên (Session) duy nhất. Nếu trong vòng 4 giây sau lần lắc cuối mà trẻ không lắc nữa, hành vi mới được coi là kết thúc.

### Do dự (Hesitation)
- **Cơ chế cũ:** Yêu cầu trẻ phải để tay gần vật liên tục không ngắt quãng trong 6 giây. Chỉ cần một cú chạm nhẹ vào vật hoặc rụt tay ra trong 0.1 giây là bộ đếm bị Reset về 0 ngay lập tức, khiến việc bắt lỗi do dự trở nên cực kỳ khó khăn và thiếu chính xác.
- **Cơ chế mới:** Sử dụng **Bộ đệm 2 giây (Flicker Handling)**. Hệ thống cho phép các sai số nhỏ (như tay trẻ rung, chạm nhầm cực nhanh) diễn ra trong tối đa 2 giây mà không làm mất bộ đếm chính. Điều này giúp phản ánh đúng bản chất của sự chần chừ.

---

## 2. Giải Thích Cơ Chế "Bộ Đệm" (Grace Period)

Cơ chế này hoạt động dựa trên nguyên tắc **"Chờ xác nhận"** thay vì phản ứng tức thì với dữ liệu thô (Raw Data) vốn luôn có độ nhiễu cao trong môi trường VR.

1. **Trạng thái Active:** Khi hành vi bắt đầu, hệ thống ghi lại `time_offset` (giây thứ bao nhiêu trong buổi học).
2. **Trạng thái Trigger:** Khi hành vi kéo dài đủ ngưỡng lâm sàng (ví dụ 6s), Alert chính thức được hiển thị trên UI.
3. **Trạng thái Grace (Chờ):** Khi dữ liệu cảm biến báo rằng hành vi đã dừng, hệ thống không đóng Alert ngay mà bắt đầu đếm ngược thời gian chờ.
   - Nếu hành vi lặp lại trong khoảng chờ: Tiếp tục cộng dồn thời gian vào Alert cũ.
   - Nếu hết khoảng chờ mà hành vi không lặp lại: Chính thức đóng Alert và lưu trữ.

---

## 3. Ví Dụ Minh Họa

### Ví dụ 1: Cơn Stimming kéo dài
- **02:00:** Trẻ lắc đầu mạnh lần 1. -> Hệ thống hiện Alert "Stimming" (Duration: 2s).
- **02:03:** Trẻ lắc đầu mạnh lần 2. (Cách lần 1 chỉ 3s < 4s bộ đệm). -> Hệ thống cập nhật Alert cũ thành (Duration: 5s).
- **02:10:** Không có thêm lần lắc đầu nào. -> Hệ thống chốt Alert Stimming tại giây thứ 5.
- **Kết quả:** 1 Alert duy nhất thay vì 2 Alert rời rạc.

### Ví dụ 2: Do dự với tay rung
- **01:00:** Trẻ đưa tay gần cục xà phòng (Bắt đầu đếm do dự).
- **01:05:** Tay trẻ vô tình chạm nhẹ vào xà phòng trong 0.5s rồi rụt ra. -> Bộ đệm 2s kích hoạt, giữ nguyên bộ đếm ở giây thứ 5.
- **01:06:** Tay trẻ lại lơ lửng gần xà phòng. -> Hệ thống nhận diện hành vi vẫn tiếp tục, đếm tiếp lên giây thứ 6.
- **01:06:** **Bắn Alert!** (Trẻ đã do dự tổng cộng 6s).
- **Kết quả:** Bắt được lỗi chần chừ dù trẻ có cử động tay không ổn định.

---

## 4. Lợi Ích Về Dữ Liệu

Việc chuyển đổi này giúp cấu hình dữ liệu lưu trữ trở nên tinh gọn:
- **`time_offset`**: Biết chính xác thời điểm bắt đầu để vẽ biểu đồ Timeline.
- **`duration_sec`**: Biết chính xác mức độ nghiêm trọng (thời gian trẻ bị kẹt) của từng hành vi.
- **Performance**: Giảm 80% số lượng bản ghi dư thừa trong cơ sở dữ liệu Firestore.
