# 🚀 Hướng Dẫn Deploy VRA-web lên Vercel

> **Nền tảng**: Vercel (Free — Hobby Tier)
> **Framework**: Next.js 16 (App Router)
> **Cập nhật lần cuối**: 2026-09-27

---

## Pre-deploy Checklist

Trước khi bắt đầu, đảm bảo các mục sau:

- [x] `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` có trong `.env.local`
- [x] Hardcoded credentials đã xóa khỏi `src/app/api/livekit-token/route.ts`
- [x] `.env.local` được gitignore (`.env*` trong `.gitignore`)
- [ ] Repo đã được push lên GitHub

---

## Bước 1 — Push Code lên GitHub

```powershell
cd d:\Github\VRA-web

# Commit fix xóa hardcode credentials
git add src/app/api/livekit-token/route.ts
git commit -m "fix: remove hardcoded LiveKit credentials"
git push origin main
```

---

## Bước 2 — Tạo Tài Khoản Vercel

1. Truy cập **https://vercel.com**
2. Bấm **"Sign Up"**
3. Chọn **"Continue with GitHub"**
4. Authorize Vercel quyền truy cập GitHub

---

## Bước 3 — Import Repository

1. Vercel Dashboard → bấm **"Add New Project"**
2. Tìm repo **`VRA-web`** → bấm **"Import"**
3. Framework preset: Vercel tự nhận **Next.js** ✅
4. **Chưa bấm Deploy** — phải set env vars trước ở Bước 4

---

## Bước 4 — Set Environment Variables ⚠️

Trong màn hình import, mở rộng phần **"Environment Variables"** và thêm từng biến:

### Firebase Client (Public)

| Tên biến | Giá trị |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | *(xem `.env.local`)* |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `vra-project-96d9c.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `vra-project-96d9c` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `vra-project-96d9c.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *(xem `.env.local`)* |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | *(xem `.env.local`)* |

### Firebase Admin (Secret)

| Tên biến | Ghi chú |
|---|---|
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@vra-project-96d9c.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Paste nguyên cả key từ `.env.local` — xem note bên dưới ⚠️ |

> ⚠️ **`FIREBASE_PRIVATE_KEY`**: Paste nguyên văn bao gồm `-----BEGIN PRIVATE KEY-----`
> đến `-----END PRIVATE KEY-----`. Vercel Dashboard tự xử lý `\n` đúng cách.

### Session & AI

| Tên biến | Ghi chú |
|---|---|
| `SESSION_SECRET` | Chuỗi random 32+ ký tự — tạo mới, đừng dùng giá trị cũ |
| `GEMINI_API_KEY` | Xem `.env.local` |
| `GEMINI_MODEL` | `gemini-2.5-flash` |

> 💡 Tạo SESSION_SECRET mạnh trên PowerShell:
> ```powershell
> -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
> ```

### LiveKit

| Tên biến | Giá trị |
|---|---|
| `LIVEKIT_URL` | `wss://vra-9jrt51dr.livekit.cloud` |
| `LIVEKIT_API_KEY` | Xem `.env.local` |
| `LIVEKIT_API_SECRET` | Xem `.env.local` |

> **Lưu ý**: `GOOGLE_APPLICATION_CREDENTIALS` và `OPENAI_API_KEY` là dành cho Python Agent
> chạy local — **không cần** thêm vào Vercel.

---

## Bước 5 — Deploy

Bấm **"Deploy"**. Vercel sẽ tự động:

1. Clone repo từ GitHub
2. Chạy `npm install`
3. Chạy `next build`
4. Deploy lên CDN toàn cầu

⏱️ Thường mất **2–4 phút**.

Sau khi xong sẽ có URL dạng: `https://vra-web-xxxx.vercel.app`

---

## Bước 6 — Cấu Hình Firebase Authorized Domain 🔥

> Bỏ qua bước này → đăng nhập sẽ báo lỗi `auth/unauthorized-domain`.

1. Vào **https://console.firebase.google.com**
2. Chọn project **`vra-project-96d9c`**
3. **Authentication** → **Settings** → tab **"Authorized domains"**
4. Bấm **"Add domain"**
5. Nhập: `vra-web-xxxx.vercel.app` *(thay bằng URL thật của bạn)*
6. Bấm **"Add"**

---

## Bước 7 — Kiểm Tra Sau Deploy

```
✅ Trang đăng nhập hiển thị
✅ Đăng nhập bằng tài khoản expert/admin
✅ Redirect đúng dashboard theo role
✅ Dashboard expert → session → kết nối LiveKit
✅ POV Stream nhận video từ VR headset
✅ DataPacket (VERBAL_HINT, SPEAK_SCRIPT) hoạt động
```

---

## Cập Nhật Code Sau Này (Auto Deploy)

Mỗi lần `git push` lên `main`, Vercel tự động redeploy:

```powershell
git add .
git commit -m "feat: ..."
git push origin main
# Vercel tự build & deploy trong ~2 phút
```

---

## Sơ Đồ Kiến Trúc Sau Deploy

```
Meta Quest VR ──────────────────────────────────────┐
      │                                              │
      ▼                                              ▼
Python Voice Agent ────► LiveKit Cloud ◄────── VRA-web (Vercel)
  (local / server)         RTC Room             Next.js SSR
                                │
                   ┌────────────┴────────────┐
                   ▼                         ▼
             Video POV Stream          DataPacket Bus
             (720p @ 30fps)       (SET_ACTIVE_QUEST,
                                   VERBAL_HINT, ...)
                   │
                   ▼
          Firebase Firestore / RTDB
          (Sessions, Lessons, Users)
```

> Vercel không can thiệp vào luồng LiveKit.
> Web client kết nối thẳng đến `wss://vra-9jrt51dr.livekit.cloud`.

---

## Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|---|---|---|
| `auth/unauthorized-domain` | Firebase chưa có domain | Làm lại Bước 6 |
| `LiveKit environment variables not configured` | Thiếu env vars | Kiểm tra Vercel → Settings → Environment Variables |
| Build fail: TypeScript errors | Lỗi type trong code | Chạy `npx tsc --noEmit` local trước khi push |
| `FIREBASE_PRIVATE_KEY` lỗi | Format sai | Paste lại qua Vercel Dashboard UI, không paste qua CLI |
| API timeout `/api/tts` | Google TTS chậm > 10s | Vercel free giới hạn 10s — cần tối ưu hoặc upgrade |
