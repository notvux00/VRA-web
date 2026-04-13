# Thiết Kế Biểu Đồ Radar Phân Tích Hành Vi (5 Axis Radar Metrics)

> **Trạng thái:** Đã validate, chuẩn bị implement
> **Mục đích:** Đặc tả 5 chỉ số phân tích trên biểu đồ Radar Dashboard
> **Lưu ý:** Dữ liệu hoàn toàn tự động lấy từ cơ sở dữ liệu cảnh báo `auto_alerts`, không cần chuyên gia nhập liệu tay. Xem thêm tại [Alert System Design](./ALERT_SYSTEM_DESIGN.md).

---

## Nguyên lý hoạt động chung
*   Hình dáng biểu đồ: **Hình ngũ giác (5 trục)**.
*   Thang điểm: **0 - 100 điểm** cho mỗi trục. Điểm càng gần 100 nghĩa là trẻ biểu hiện càng hoàn hảo ở kỹ năng đó.
*   Định hướng sử dụng: Biểu đồ này phục vụ mục đích **Thống kê Toàn diện (Profile-level)**, gom dữ liệu trên **TOÀN BỘ LỊCH SỬ HỌC** của trẻ để phác họa năng lực tổng quan nhất.
*   Công thức gốc (Tính trung bình lịch sử): `Điểm trục = MAX(0, 100 - ( [Tổng lỗi / Tổng số buổi học] × Trọng số Severity ))`
    *   *Khóa an toàn (Trần phạt tối đa):* Để tránh việc 1 ngày tồi tệ khiến trẻ bị trừ sạch bách điểm, mỗi trục có một lượng "Trần phạt" (Penalty Cap) tối đa cho mỗi buổi học. Dù trẻ có mắc lỗi bao nhiêu lần đi nữa, điểm cũng không bị trừ lố qua mức này.
    *   **Trọng số 🟢 Low:** Phạt -1 đ/lỗi. **Tối đa trừ 20đ/buổi.** (Trẻ ngập ngừng hoài thì tệ nhất vẫn giữ được 80đ).
    *   **Trọng số 🟡 Medium:** Phạt -3 đ/lỗi. **Tối đa trừ 30đ/buổi.** (Trẻ mất tập trung nhiều nhất cũng chỉ rớt còn 70đ).
    *   **Trọng số 🔴 High:** Phạt -10 đ/lỗi. **Tối đa trừ 40đ/buổi.** (Bùng nổ hoảng sợ thảm hoạ nhất, trẻ vẫn còn 60đ Bình tĩnh mang về nhà).
---

## Đặc tả 5 Nhóm Chỉ Số Đo Lường

### 1. Chỉ số CHỦ ĐỘNG
*Đánh giá sự tự giác của trẻ trong việc bắt đầu tương tác vào các mục tiêu của bài học.*

*   **Dữ liệu lõi từ `AUTO_ALERTS`:**
    *   **`type`**: `idle` (Không có bất kỳ sự kiện tương tác nào xảy ra).
    *   **`group`**: `execution_difficulty`
    *   **`severity`**: 🟢 Low
*   **Ý nghĩa:** 
    *   *Chuyên môn:* Khả năng "Task Initiation" (Khởi xướng mục tiêu) của não bộ bị đình trệ. Trẻ rơi vào trạng thái bị động, chờ đợi hoặc lạc lối.
    *   *Phụ huynh:* Trẻ có tự giác làm bài không, hay đứng ỳ một chỗ đợi thầy cô nhắc nhở.
*   **Ví dụ thực tế:** 
    *   Bóng rơi ra sàn, nhưng trẻ cứ đứng nhìn quả bóng suốt 15 giây mà không hề đưa tay ra nhặt. Hệ thống văng ra 1 Alert loại `idle`.
*   **Cơ chế tính toán đề xuất:** 
    *   Mức vi phạm `Low`.
    *   Trừ điểm dựa trên tổng thời lượng (`duration_sec`) trẻ rơi vào trạng thái idle. Ví dụ: Cứ 5 giây `idle` trừ 2 điểm.

---

### 2. Chỉ số TỰ TIN
*Đánh giá độ dứt khoát và mạnh dạn khi trẻ thực hiện một động tác vận động.*

*   **Dữ liệu lõi từ `AUTO_ALERTS`:**
    *   **`type`**: `hesitation` (Ngập ngừng).
    *   **`group`**: `execution_difficulty`
    *   **`severity`**: 🟢 Low
*   **Ý nghĩa:** 
    *   *Chuyên môn:* Phản xạ vận động (Motor Execution) bị gãy nhịp. Trẻ đã nhận diện được mục tiêu nhưng thiếu dứt khoát để hoàn tất pha tương tác (sợ sai, run rẩy).
    *   *Phụ huynh:* Trẻ có ngập ngừng, lưỡng lự khi làm nhiệm vụ hay không, thao tác có nhanh nhẹn dứt điểm không.
*   **Ví dụ thực tế:** 
    *   Đứa bé đưa tay ra định cầm cốc nước, tay đã nằm trong vùng `near_object=true`, tay lại rụt về. Hành động rụt rè này lặp lại 3 lần liên tiếp sinh ra 1 alert `hesitation`.
*   **Cơ chế tính toán đề xuất:** 
    *   Mức vi phạm `Low`.
    *   Trừ điểm dựa trên **số lần (count)** xuất hiện alert `hesitation` trong suốt bài học. Ví dụ: Cada 1 lần ngập ngừng trừ 5 điểm.

---

### 3. Chỉ số TẬP TRUNG
*Đánh giá khả năng duy trì góc nhìn vào khu vực chứa nội dung bài học.*

*   **Dữ liệu lõi từ `AUTO_ALERTS`:**
    *   **`type`**: `distraction` (Xoay đầu lệch góc quá ngưỡng 30 độ kéo dài).
    *   **`group`**: `distraction`
    *   **`severity`**: 🟡 Medium
*   **Ý nghĩa:** 
    *   *Chuyên môn:* Năng lực định hướng ánh nhìn (Visual Focus). Đánh giá sự phân tâm bởi các yếu tố phụ của môi trường hoặc vì trẻ mất đi sự tập trung nội tại.
    *   *Phụ huynh:* Trẻ có nhìn thẳng vào bài học không hay mắt cứ láo liên tìm kiếm, ngó dọc ngó ngang linh tinh.
*   **Ví dụ thực tế:** 
    *   Thay vì nhìn vào mặt NPC đang nói chuyện, bé cứ xoay đầu liên tục nhìn lên vòm trần nhà hoặc phía sau lưng. Sau 8 giây, hệ thống quăng 1 alert `distraction`.
*   **Cơ chế tính toán đề xuất:** 
    *   Mức vi phạm `Medium` (nghiêm trọng vừa).
    *   Hệ thống trừ điểm tích lũy dựa vào tổng thời gian mất tập trung (`duration_sec`). Cứ 5 giây không nhìn vào mục tiêu bị trừ 5 điểm.

---

### 4. Chỉ số ỔN ĐỊNH
*Đánh giá sự thư giãn của cơ thể, khả năng tránh các hành vi tự kích thích bù trừ (Self-Stimming).*

*   **Dữ liệu lõi từ `AUTO_ALERTS`:**
    *   **`type`**: `stimming_proxy` (Vận tốc góc xoay đầu dao động có tính lặp lại lặp lại chu kỳ).
    *   **`group`**: `distraction`
    *   **`severity`**: 🟡 Medium
*   **Ý nghĩa:** 
    *   *Chuyên môn:* Tình trạng mất điều hòa giác quan (Sensory dysregulation) khiến trẻ bắt đầu phát sinh các hành vi dập khuôn vô thức (Stimming) nhằm cố gắng xoa dịu stress trong bản thân.
    *   *Phụ huynh:* Tay chân, người ngợm, đầu cổ của trẻ có bình thường không hay bé đang liên tục vẫy tay, lắc đầu qua lại vô thức.
*   **Ví dụ thực tế:** 
    *   Vào bài học đếm số hơi dài, trẻ chán hoặc mơ hồ nên liên tục gật lắc đầu dữ dội như cành cây đong đưa. Biểu hiện này được nhận dạng và văng ra Alert `stimming_proxy`.
*   **Cơ chế tính toán đề xuất:** 
    *   Mức vi phạm `Medium` (nghiêm trọng vừa).
    *   Trừ điểm ngay lập tức (-10 điểm/lần) khi phát hiện mảng chu kỳ bất thường này. Thể hiện cơ thể trẻ đang mất đi sự ổn định vật lý.

---

### 5. Chỉ số BÌNH TĨNH
*Đánh giá năng lực chống đỡ với áp lực sợ hãi và tính quá tải trầm trọng.*

*   **Dữ liệu lõi từ `AUTO_ALERTS`:**
    *   **`type`**: `freeze` (Bất động hoàn toàn > 10s) VÀ `meltdown_proxy` (Bất động + không một phản ứng khi gọi tên/hỏi).
    *   **`group`**: `stress_overwhelm`
    *   **`severity`**: 🔴 High
*   **Ý nghĩa:** 
    *   *Chuyên môn:* Shutdown/Meltdown. Hệ thần kinh giao cảm bị sụp đổ trước kích thích đầu vào, rơi vào trạng thái "Fright/Freeze" (Tê liệt vì sợ hoặc quá tải). Đây là cờ đỏ (Red flag) nguy hiểm nhất của một phiên học tự kỷ.
    *   *Phụ huynh:* Trẻ có khóc ré lên, hoảng sợ bị đơ người, cúp máy từ chối mọi cái chạm hoặc câu gọi từ môi trường xung quanh không.
*   **Ví dụ thực tế:** 
    *   VR giả lập môi trường ngã tư đường quá nhiều tiếng xe cộ còi rít. Trẻ co rúm người lại, đứng đơ ra không nhúc nhích tay chân > 10s, mặc cho cô giáo (qua NPC) hỏi liên tục. Sinh ra Alert cấp `high`.
*   **Cơ chế tính toán đề xuất:** 
    *   Mức vi phạm Rất Nghiêm Trọng (`High`). 
    *   Điểm trên trục này sẽ rớt thê thảm nếu mắc phải. Ví dụ mỗi lần xuất hiện `freeze` trừ đi 25 điểm. Một phiên học xảy ra 3 lần `freeze` thì điểm Bình tĩnh gần như rớt về 0. Bác sĩ nhìn vào sẽ thấy ngay lỗ hổng cực lớn này.
