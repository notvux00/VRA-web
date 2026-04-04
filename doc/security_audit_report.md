# Báo cáo Lỗ hổng Bảo mật & Kế hoạch Tối ưu (Security & Optimization Audit)

Tài liệu này ghi lại các vấn đề nghiêm trọng phát hiện trong buổi rà soát dự án ngày 04/04/2026. Các đề xuất này cần được thực hiện trước khi triển khai hệ thống lên môi trường Global/Production.

---

## 🚨 1. Lỗ hổng Bảo mật Nghiêm trọng (CRITICAL)

### Vấn đề: Thiếu Authorization Check trong Server Actions
Các hàm trong `src/actions/auth.ts` hiện tại chỉ kiểm tra xem người dùng có đăng nhập hay không, nhưng **không kiểm tra quyền hạn (Role)** của người dùng đó.

**Các hàm bị ảnh hưởng:**
- `updateUserRole(uid, role)`
- `deleteCenter(centerId)`
- `createCenter(centerData)`
- `addCenterManager(centerId, managerData)`
- `updateCenterStatus(centerId, status)`
- `syncAllCenterStats()`

**Rủi ro:** Một người dùng bất kỳ (ví dụ: một Phụ huynh) nếu biết cách gọi API Server Action của Next.js có thể tự nâng quyền mình lên `admin` hoặc xóa toàn bộ dữ liệu trung tâm.

**Giải pháp đề xuất:**
1. Tạo một helper function `isAdmin()` trong `src/actions/auth.ts`.
2. Kiểm tra `session.role === 'admin'` trước khi thực hiện bất kỳ thao tác nhạy cảm nào.

```typescript
// Ví dụ sửa lỗi:
export async function deleteCenter(centerId: string) {
  const session = await getSession(); // Hoặc logic lấy session hiện tại
  if (!session || session.role !== 'admin') {
    return { success: false, error: "Unauthorized: Admin access required" };
  }
  // ... code xóa center
}
```

---

## ⚠️ 2. Cải thiện Hiệu năng & Độ tin cậy (Reliability)

### Vấn đề: Cơ chế tạo ID không an toàn
Trong `createCenter`, ID được tạo bằng `Math.random()`:
`const centerId = "CT-" + Math.random().toString(36).substring(2, 7).toUpperCase();`

**Rủi ro:** Xác suất trùng lặp ID (collision) rất cao khi hệ thống có hàng trăm trung tâm.

**Giải pháp:** Sử dụng thư viện `nanoid` hoặc `crypto.randomUUID()` để đảm bảo tính duy nhất.

### Vấn đề: Render Blocking (Sequential Data Fetching)
Trong `src/app/dashboard/expert/page.tsx`, các lệnh `await` đang chạy tuần tự:
```typescript
const { children } = await getAssignedChildren();
const { stats } = await getExpertStats();
```

**Giải pháp:** Sử dụng `Promise.all` để chạy song song, giảm 50% thời gian chờ tải trang.
```typescript
const [childrenRes, statsRes] = await Promise.all([
  getAssignedChildren(),
  getExpertStats()
]);
```

---

## 🧹 3. Vệ sinh Mã nguồn (Code Quality)

### Các lỗi ESLint còn tồn tại:
- Cần xóa các biến không sử dụng (unused variables) như `UserCheck` trong các component để quá trình Build CI/CD không bị lỗi.
- Đã thực hiện xóa các tệp rác boilerplate (`public/*.svg`) và các component dư thừa (`src/components/shared`). Tránh tạo lại các thành phần trùng lặp trong tương lai.

---
*Tài liệu này được tạo tự động bởi Antigravity để hỗ trợ quá trình bảo trì hệ thống.*
