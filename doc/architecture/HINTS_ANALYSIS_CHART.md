# ĐỀ XUẤT: BIỂU ĐỒ PHÂN TÍCH MỨC ĐỘ TRỢ GIÚP (HINTS ANALYSIS)

Dựa trên dữ liệu hiện có trong các buổi tập VR, chúng ta có thể trích xuất thông tin về số lần chuyên gia/hệ thống phải can thiệp trợ giúp trẻ. Việc bổ sung biểu đồ này sẽ giúp chuyên gia nhận diện được trẻ đang gặp khó khăn ở bước nào và cần loại hình tác động nào nhất.

## 1. Dữ liệu sử dụng (Data Source)
Mỗi nhiệm vụ (`QuestLog`) trong `quest_logs` của một `Session` đều chứa 3 chỉ số quan trọng:
*   `hints_visual`: Số lần trợ giúp bằng hình ảnh/chỉ dẫn trực quan.
*   `hints_verbal`: Số lần nhắc nhở bằng lời nói.
*   `hints_physical`: Số lần hỗ trợ vật lý (nếu có ghi nhận).

## 2. Hình thức hiển thị đề xuất
*   **Loại biểu đồ**: **Stacked Bar Chart (Biểu đồ cột chồng)**.
*   **Trục X**: Tên nhiệm vụ (Q1, Q2, Q3...).
*   **Trục Y**: Tổng số lần trợ giúp.
*   **Phân màu (Stack)**:
    *   🔵 **Visual**: Màu xanh dương (tượng trưng cho quan sát).
    *   🟡 **Verbal**: Màu vàng/cam (tượng trưng cho âm thanh/lời nói).
    *   🔴 **Physical**: Màu đỏ/hồng (tượng trưng cho tác động vật lý).

## 3. Giá trị mang lại cho Chuyên gia
1.  **Xác định điểm nghẽn**: Nhiệm vụ nào có cột cao nhất là nơi trẻ gặp khó khăn nhất.
2.  **Phân tích phong cách học tập**: Nếu trẻ chủ yếu cần `Visual Hints`, chuyên gia có thể điều chỉnh giáo án theo hướng trực quan hơn.
3.  **Đo lường sự độc lập**: Qua các buổi học, nếu tổng chiều cao của các cột giảm dần, đó là minh chứng rõ rệt nhất cho sự tiến bộ về tính tự lập của trẻ.

## 4. Kế hoạch triển khai
*   **Bước 1**: Cập nhật hàm xử lý dữ liệu để tính toán `totalHints` cho mỗi nhiệm vụ.
*   **Bước 2**: Sử dụng component `BarChart` từ thư viện `recharts` đã có sẵn trong dự án.
*   **Bước 3**: Tích hợp biểu đồ mới ngay bên cạnh hoặc bên dưới biểu đồ Phản xạ hiện tại.
