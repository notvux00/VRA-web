# ĐỀ XUẤT: BIỂU ĐỒ DÒNG THỜI GIAN HÀNH VI (BEHAVIORAL TIMELINE)

Dữ liệu `auto_alerts` chứa đựng các thông tin vô giá về **thời điểm** trẻ gặp vấn đề trong phiên học. Thay vì chỉ tính tổng điểm như biểu đồ Radar, biểu đồ Dòng thời gian sẽ giúp chuyên gia nhìn thấy "nhịp sinh học" của trẻ trong suốt 10-20 phút tập luyện.

## 1. Dữ liệu sử dụng (Data Source)
Mỗi bản ghi trong `auto_alerts` có:
*   `type`: Loại hành vi (distraction, idle, freeze, stimming).
*   `time_offset`: Thời điểm xảy ra (giây thứ bao nhiêu kể từ lúc bắt đầu).
*   `duration_sec`: Thời lượng của hành vi đó.

## 2. Hình thức hiển thị đề xuất
*   **Loại biểu đồ**: **Scatter Chart (Biểu đồ phân tán)** hoặc **Timeline Bar**.
*   **Trục X**: Thời gian của phiên học (phút:giây).
*   **Trục Y**: Các nhóm hành vi (Xao nhãng, Đứng ỳ, Kích thích, Căng thẳng).
*   **Điểm biểu diễn (Markers)**:
    *   Các vòng tròn/bong bóng xuất hiện tại đúng `time_offset`.
    *   Kích thước bong bóng tỉ lệ thuận với `duration_sec` (Càng to nghĩa là hành vi kéo dài càng lâu).

## 3. Giá trị mang lại cho Chuyên gia
1.  **Phát hiện sự mệt mỏi**: Nếu các cảnh báo tập trung dày đặc vào cuối phiên, trẻ có thể đang bị mệt (fatigue) và cần rút ngắn thời gian tập.
2.  **Xác định tác nhân gây lo âu**: Nếu cảnh báo xảy ra ngay sau một nhiệm vụ cụ thể, nhiệm vụ đó có thể là tác nhân (trigger) gây lo âu.
3.  **Tương quan với nhiệm vụ**: Giúp chuyên gia đối chiếu: "Tại sao ở nhiệm vụ Rửa tay trẻ lại xao nhãng nhiều hơn nhiệm vụ Chào hỏi?".

## 4. Kế hoạch triển khai
*   **Bước 1**: Chuyển đổi dữ liệu `auto_alerts` thành định dạng tọa độ `(x: time, y: category, z: duration)`.
*   **Bước 2**: Sử dụng `ScatterChart` từ `recharts`.
*   **Bước 3**: Tùy chỉnh `ZAxis` để điều chỉnh kích thước bong bóng và `YAxis` để hiển thị tên các loại hành vi tiếng Việt.
