# 📜 Hướng dẫn triển khai: Danh sách Lịch sử bài học VR

Tài liệu này cung cấp toàn bộ logic và mã nguồn mẫu để hiển thị lịch sử bài học của trẻ, khớp 100% với dữ liệu thực tế (`sessions`).

---

## 1. Logic Truy vấn (Server Action)

**File đề xuất:** `src/actions/history.ts`

Hàm này sẽ lấy toàn bộ danh sách buổi học của một đứa trẻ, sắp xếp theo thời gian mới nhất.

```typescript
import { adminDb } from "@/lib/firebase/admin";

export async function getChildSessionHistory(childId: string) {
  try {
    const snapshot = await adminDb.collection("sessions")
      .where("child_profile_id", "==", childId)
      // Lưu ý: Nếu start_time là String ISO, Firestore sẽ sort theo Alphabet (vẫn đúng thứ tự thời gian)
      .orderBy("start_time", "desc") 
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
}
```

---

## 2. Thiết kế Giao diện (UI Design)

**File đề xuất:** `src/app/dashboard/expert/history/page.tsx`

Sử dụng phong cách **Card-based** với các thành phần của Tailwind CSS:

### A. Định dạng thông số
- **Thời gian**: Trích xuất từ `start_time` (VD: `start_time.split('T')[0]`).
- **Trạng thái**: 
  - `success` -> Xanh (Emerald).
  - `aborted` / `timeout` -> Đỏ (Rose).
- **Điểm số**: Hiển thị nổi bật với font `font-black`.

### B. Cấu trúc Component Card
Mỗi buổi học sẽ được hiển thị trong một thẻ:
- **Header**: Tên bài học (`lesson_name`) + Badge trạng thái.
- **Body**: Thời lượng (`duration`), Cấp độ (`level_name`).
- **Footer**: Nút "Xem báo cáo" (Link tới trang biểu đồ chi tiết).

---

## 3. Các bước thực hiện cho AI (Dành cho lần sau)

Khi người dùng yêu cầu "Triển khai lịch sử bài học", hãy thực hiện các bước sau:
1. **Cập nhật Types**: Thêm các trường dữ liệu thực tế vào interface `Session` trong `@/types/index.ts`.
2. **Tạo Server Action**: Sử dụng code mẫu ở mục 1.
3. **Refactor UI**: Thay thế giao diện "Empty State" hiện tại ở trang `/history` bằng vòng lặp `.map()` qua danh sách sessions.
4. **Kiểm tra**: Đảm bảo icon của mỗi bài học hiển thị đúng (Sử dụng các icon từ `lucide-react` như `Gamepad2`, `CheckCircle2`, `Clock`).

---
*Tài liệu này là "hợp đồng triển khai" cho tính năng Lịch sử của VRA-Web.*
