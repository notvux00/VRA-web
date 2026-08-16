# KẾ HOẠCH TRIỂN KHAI: NHẬT KÝ LÂM SÀNG (SOAP NOTES)

Tính năng này sẽ được xây dựng trên **một trang riêng biệt**, hoàn toàn không làm ảnh hưởng hay thay đổi cấu trúc của trang "Lịch sử" (History) và trang "Báo cáo VR" (Reports) hiện tại.

## 1. Cập nhật Type Definitions
Bổ sung cấu trúc dữ liệu cho SOAP.

**File:** `src/types/index.ts`
- Định nghĩa interface `SoapNote` với 4 trường: `subjective`, `objective`, `assessment`, `plan`.
- Thêm trường `soap_notes?: SoapNote` vào interface `Session`.

## 2. Server Action
Tạo hàm xử lý cập nhật dữ liệu lên Firestore.

**File:** `src/actions/history.ts`
- Viết thêm hàm `saveSessionSoapNote(sessionId: string, soapNote: SoapNote)`:
  - Kiểm tra quyền truy cập (chỉ expert phụ trách hoặc admin mới được sửa).
  - Cập nhật trường `soap_notes` vào document của session tương ứng.

## 3. Tạo Trang SOAP Notes Riêng Biệt (Mới)
Tạo một màn hình hoàn toàn mới dành riêng cho việc ghi chép lâm sàng của chuyên gia.

**File (Mới):** `src/app/dashboard/expert/reports/soap/page.tsx`
*(Hoặc có thể đặt tại `src/app/dashboard/expert/history/soap/page.tsx` tùy kiến trúc route bạn muốn)*
- Lấy `sessionId` từ URL params.
- Giao diện (UI) bao gồm:
  - Header nhỏ hiển thị tên bài học và nút "Quay lại Lịch sử".
  - 4 ô Textarea lớn cho S (Subjective), O (Objective), A (Assessment), P (Plan).
  - **Tính năng tự động (Auto-fill)**: Khi trang vừa load (hoặc khi bấm nút), hệ thống tự động trích xuất các số liệu từ session (thời lượng, độ chính xác, số lần mất tập trung...) để tự gen ra một đoạn văn bản thô và điền sẵn vào ô **Objective**.
  - Nút "Lưu Ghi Chú" để gọi hàm action ở bước 2.

## 4. Bổ sung nút điều hướng ở Trang Lịch Sử Cũ
Giữ nguyên giao diện trang lịch sử hiện tại, chỉ thêm một nút bấm để dẫn sang trang SOAP mới.

**File:** `src/app/dashboard/expert/history/page.tsx`
- Tại mỗi block hiển thị 1 buổi học (cạnh nút mũi tên "Chi tiết" đi vào trang Reports), ta thêm một nút phụ: **"Ghi chú SOAP"** (hoặc icon quyển sổ).
- Nút này có link dẫn tới `/dashboard/expert/reports/soap?sessionId={session.id}&childId={childId}`.
