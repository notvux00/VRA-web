# BIỂU ĐỒ RADAR (HỒ SƠ NĂNG LỰC) - ĐẶC TẢ KỸ THUẬT

Tài liệu này định nghĩa logic tính toán và hiển thị cho biểu đồ Radar 5 trục, dùng để đánh giá năng lực hành vi của trẻ dựa trên dữ liệu từ hệ thống VR.

## 1. PHẠM VI DỮ LIỆU (AGGREGATION)
Để đảm bảo tính nhạy bén về mặt lâm sàng và phản ánh đúng phong độ hiện tại của trẻ, hệ thống sử dụng:
*   **Phạm vi**: 05 buổi tập gần nhất (Last 5 Sessions).
*   **Lợi ích**: Giúp biểu đồ thay đổi hình dáng ngay lập tức khi trẻ có tiến bộ hoặc sa sút, tránh việc dữ liệu cũ làm "loãng" các vấn đề mới phát sinh.

---

## 2. TRỌNG SỐ PHẠT (HYPER-BRUTAL WEIGHTS)

Hệ thống sử dụng bộ trọng số "Cực đoan" để mỗi hành vi không mong muốn đều tạo ra tác động thị giác rõ rệt trên biểu đồ.

| Chỉ số | Alert Type | Trọng số phạt (Weight) | Trần phạt (Cap/Session) |
| :--- | :--- | :--- | :--- |
| **CHỦ ĐỘNG** | `idle` | **-30đ** / mỗi 5s đứng ỳ | -100đ |
| **TỰ TIN** | `hesitation` | **-60đ** / mỗi lần ngập ngừng | -100đ |
| **TẬP TRUNG** | `distraction` | **-50đ** / mỗi 5s xao nhãng | -100đ |
| **ỔN ĐỊNH** | `stimming_proxy` | **-80đ** / mỗi lần kích thích | -100đ |
| **BÌNH TĨNH** | `freeze`, `meltdown` | **-150đ** / mỗi lần hoảng sợ | -100đ |

---

## 3. CÔNG THỨC TÍNH TOÁN

Điểm số của mỗi trục (0 - 100) được tính theo công thức:

$$Score = \max\left(0, 100 - \frac{\sum Penalty}{TotalRecentSessions}\right)$$

*Trong đó:*
*   `TotalRecentSessions`: Số lượng buổi tập trong tập dữ liệu (Tối đa 5).
*   `Penalty`: Tổng điểm phạt tích lũy từ 5 buổi học này.

---

## 4. Ý NGHĨA CÁC CHỈ SỐ (LÂM SÀNG)

### A. CHỦ ĐỘNG (Initiation)
*   **Định nghĩa**: Khả năng tự giác bắt đầu tương tác khi có yêu cầu từ bài học.
*   **Mục tiêu**: Giảm thiểu thời gian chờ đợi (Idle time) không cần thiết.

### B. TỰ TIN (Confidence)
*   **Định nghĩa**: Độ dứt khoát trong các thao tác vận động.
*   **Mục tiêu**: Giảm các hành vi ngập ngừng, đưa tay ra rồi rụt lại (Hesitation).

### C. TẬP TRUNG (Attention)
*   **Định nghĩa**: Khả năng duy trì góc nhìn vào khu vực mục tiêu bài học.
*   **Mục tiêu**: Giảm tần suất và thời lượng quay đầu nhìn xung quanh (Distraction).

### D. ỔN ĐỊNH (Stability)
*   **Định nghĩa**: Sự thư giãn của cơ thể và khả năng tự điều chỉnh cảm giác.
*   **Mục tiêu**: Giảm các hành vi tự kích thích bù trừ (Self-Stimming) như vẩy tay, rung lắc.

### E. BÌNH TĨNH (Calmness)
*   **Định nghĩa**: Năng lực chống đỡ áp lực và tránh quá tải cảm giác.
*   **Mục tiêu**: Giảm tình trạng "đóng băng" (Freeze) hoặc bùng nổ cảm xúc (Meltdown).

---

## 5. HIỂN THỊ UI/UX
*   **Hình dáng**: Đồ thị đa giác khép kín. Vùng càng rộng thể hiện năng lực càng tốt.
*   **Màu sắc**: Xanh lục Emerald (Gradient) để tạo cảm giác tích cực và an toàn.
*   **Tương tác**: Click vào biểu tượng **(i)** để xem giải thích chi tiết cho phụ huynh.
