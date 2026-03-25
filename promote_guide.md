# 🚀 Admin Promotion Script

Dành cho bạn để tự cấp quyền Admin cho tài khoản của mình một cách nhanh nhất.

## Cách thực hiện:
1. Tạo một file mới tên là `promote.js` ở thư mục gốc của dự án.
2. Dán đoạn code sau vào:

```javascript
// promote.js
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json'); // Đường dẫn tới file JSON key của bạn

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = 'EMAIL_CỦA_BẠN@GMAIL.COM'; // THAY EMAIL CỦA BẠN VÀO ĐÂY

async function grantAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`Successfully granted admin role to ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

grantAdmin();
```

3. **Quan trọng:** Bạn cần tải file JSON Key từ Firebase Console (Project Settings -> Service Accounts -> Generate new private key) và lưu tên là `service-account.json`.
4. Chạy lệnh sau trong terminal:
   ```bash
   node promote.js
   ```

Sau đó, bạn chỉ cần Đăng xuất và Đăng nhập lại trên Web là sẽ vào được Dashboard Admin!
