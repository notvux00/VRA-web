# Refactor<!-- Updated: 2026-09-01 — no-explicit-any COMPLETE (244→0) -->

Ngay cap nhat: 2026-07-05

Tai lieu nay ghi lai cac van de con ton tai sau dot refactor nho dau tien. Muc tieu la de cac lan refactor sau co the xu ly theo nhom, tranh sua tran lan va tranh lam thay doi hanh vi nghiep vu ngoai y muon.

## Trang thai hien tai

- `npm.cmd run build`: pass.
- `npm.cmd run lint`: fail.
- Tong lint hien tai: 0 problems.
- Errors: 0.
- Warnings: 0.
- Luu y moi truong:
  - PowerShell dang chan `npm.ps1`, nen dung `npm.cmd`.
  - Git co canh bao `dubious ownership`; co the dung tam `git -c safe.directory=D:/Github/VRA-web ...` khi can xem status.

## Tong hop theo rule

| Rule | So luong | Muc do | Y nghia |
| --- | ---: | --- | --- |
| `@typescript-eslint/no-explicit-any` | 216 | Cao | Type domain chua ro, de che mat loi runtime khi doc Firestore/RTDB/API. |
| `@typescript-eslint/no-unused-vars` | 146 | Trung binh | Code prototype/import thua, lam kho doc va co the che dau logic da bo quen. |
| `react/no-unescaped-entities` | 20 | Thap | JSX text co dau nhay kep chua escape. De sua, it rui ro. |
| `react-hooks/exhaustive-deps` | 11 | Cao | `useEffect` thieu dependency, co the dung du lieu cu hoac khong reload dung luc. |
| `react-hooks/set-state-in-effect` | 8 | Cao | React Compiler canh bao set state dong bo trong effect, co the gay render cascade. |
| `@next/next/no-img-element` | 4 | Thap/Trung binh | Nen dung `next/image` de toi uu anh. Can can nhac domain anh remote. |
| `react/no-children-prop` | 3 | Thap | Dang truyen `children` qua prop thay vi nest JSX. |
| `react-hooks/purity` | 2 | Trung binh | Goi ham impure nhu `Date.now()` trong render/init expression. |
| `@typescript-eslint/ban-ts-comment` | 1 | Trung binh | Co `@ts-ignore`, nen doi sang `@ts-expect-error` hoac sua type goc. |

## Khu vuc nen uu tien

### 1. Server actions va domain types

Day la cum no lon nhat. Cac file trong `src/actions/*` dang dung nhieu `any`, nhat la khi doc Firestore va tra data ve UI. Nen xu ly bang cach tao type domain ro rang truoc, sau do thay `any` theo tung action.

| File | Errors | Warnings | Ghi chu |
| --- | ---: | ---: | --- |
| `src/actions/parent.ts` | 28 | 7 | Nang nhat. Gom analytics, chart data, session summaries, child profile data. Nen tach type cho chart/session/goal. |
| `src/actions/center.ts` | 17 | 1 | Nhieu Firestore document data dang untyped. Can type cho center, parent, expert, child. |
| `src/actions/expert.ts` | 15 | 1 | Nhieu session/child/lesson data. Can dong bo voi type `Session`, `ChildProfile`, `Lesson`. |
| `src/actions/auth.ts` | 12 | 6 | Co import thua va `any` trong error handling / profile data. Can type ket qua auth action. |
| `src/actions/analytics.ts` | 10 | 0 | Nen type cac ham tinh average/chart metrics. |
| `src/actions/ai-recommendations.ts` | 7 | 1 | Dang co `Record<string, any>` cho Gemini payload va session/lesson input. Can type payload rieng. |
| `src/actions/messaging.ts` | 6 | 1 | Can type message, thread, participant. |
| `src/actions/history.ts` | 5 | 1 | Can type session history row/detail. |
| `src/actions/schedule.ts` | 4 | 0 | Can type schedule/session booking. |
| `src/actions/lessons.ts` | 2 | 0 | Can type lesson document. |
| `src/actions/user.ts` | 2 | 0 | Can type user profile result. |
| `src/actions/chatbot.ts` | 1 | 0 | Can type chatbot response/error. |

Huong refactor de xuat:

1. Tao hoac tach type domain trong `src/types/`, vi du:
   - `src/types/domain.ts`
   - `src/types/session.ts`
   - `src/types/lesson.ts`
   - `src/types/analytics.ts`
   - `src/types/messaging.ts`
2. Tao helper doc parser cho Firestore:
   - `toChildProfile(doc)`
   - `toSession(doc)`
   - `toLesson(doc)`
   - `toCenter(doc)`
3. Doi `catch (err: any)` thanh `catch (error: unknown)` va dung helper:
   - `getErrorMessage(error)`
4. Xu ly tung action file, bat dau tu `parent.ts`, `center.ts`, `expert.ts`, `auth.ts`.

### 2. Expert session page

| File | Errors | Warnings | Ghi chu |
| --- | ---: | ---: | --- |
| `src/app/dashboard/expert/session/[id]/page.tsx` | 13 | 19 | Vua nhieu `any`, vua nhieu import/icon khong dung. Day la man hinh phuc tap, nen refactor sau khi type session/telemetry da ro. |

Huong refactor de xuat:

1. Tao type cho telemetry, command, behavior log, alert, session detail.
2. Don import lucide khong dung.
3. Tach UI panel hoac state logic neu file qua dai.
4. Chay lai build sau moi dot nho.

### 3. Charts va reports

| File | Errors | Warnings | Ghi chu |
| --- | ---: | ---: | --- |
| `src/app/dashboard/expert/charts/page.tsx` | 5 | 2 | Chart data dang dung `any`. |
| `src/app/dashboard/expert/stats/page.tsx` | 6 | 3 | Co `any`, unused vars, unescaped quotes. |
| `src/app/dashboard/expert/reports/page.tsx` | 5 | 3 | Co `set-state-in-effect`, `any`, unescaped quotes. |
| `src/app/dashboard/expert/reports/alerts/page.tsx` | 4 | 4 | Co `set-state-in-effect`, unescaped quotes, unused vars. |
| `src/app/dashboard/expert/reports/behavior/page.tsx` | 4 | 1 | Co `set-state-in-effect`, unescaped quotes. |
| `src/app/dashboard/parent/_components/ChildIntensityChart.tsx` | 4 | 0 | Chart props/data dang `any`. |
| `src/app/dashboard/parent/_components/ChildRadarChart.tsx` | 4 | 0 | Chart props/data dang `any`, co unescaped quotes. |
| `src/app/dashboard/parent/_components/ChildChartsContainer.tsx` | 2 | 0 | Props chart dang `any`. |
| `src/app/dashboard/parent/_components/ChildIndependenceChart.tsx` | 2 | 0 | Props/data dang `any`. |
| `src/app/dashboard/parent/_components/ChildProgressChart.tsx` | 1 | 0 | Props/data dang `any`. |

Huong refactor de xuat:

1. Tao type chung cho chart points:
   - `TimeSeriesPoint`
   - `RadarMetricPoint`
   - `CompletionPoint`
   - `SessionMetricSummary`
2. Sua action layer tra ve typed data truoc, sau do UI chi nhan props typed.
3. Tranh convert data lap lai trong tung component chart.

### 4. Live telemetry, WebRTC, simulation hooks

| File | Errors | Warnings | Ghi chu |
| --- | ---: | ---: | --- |
| `src/app/dashboard/expert/_hooks/useLiveTelemetry.ts` | 2 | 1 | Co `Date.now()` trong render init va missing dependency `mutedGroups`. |
| `src/app/dashboard/expert/_hooks/useSimulatedSession.ts` | 2 | 1 | Co `Date.now()` trong render init va missing dependency threshold. |
| `src/app/dashboard/expert/_hooks/useWebRTCViewer.ts` | 1 | 0 | `initPeerConnection()` trong effect bi React Compiler canh bao set state in effect. |
| `src/lib/firebase/rtdb.ts` | 2 | 0 | RTDB telemetry snapshot va remote command param dang `any`. |

Huong refactor de xuat:

1. Tao type cho:
   - `TelemetrySnapshot`
   - `VrHandshakeState`
   - `RemoteCommand`
   - `WebRtcSignal`
2. Doi `useRef(Date.now())` thanh lazy init an toan hon, vi du khoi tao trong effect hoac guard `if (ref.current === null)`.
3. Kiem tra dependency effect bang logic nghiep vu, khong them dependency may moc neu no lam reset subscription ngoai y muon.

## Chi tiet cac loi React Hooks

### `react-hooks/exhaustive-deps`

| File | Line | Van de |
| --- | ---: | --- |
| `src/app/dashboard/_components/ChatInterface.tsx` | 107 | `useEffect` thieu `selectedPartner`. |
| `src/app/dashboard/_components/VraChatbot.tsx` | 46 | `useEffect` thieu `SpeechRecognition`. |
| `src/app/dashboard/admin/centers/[id]/page.tsx` | 36 | `useEffect` thieu `fetchData`. |
| `src/app/dashboard/center/children/[id]/page.tsx` | 46 | `useEffect` thieu `fetchData`. |
| `src/app/dashboard/center/children/page.tsx` | 41 | `useEffect` thieu `fetchData`. |
| `src/app/dashboard/center/experts/[id]/page.tsx` | 39 | `useEffect` thieu `fetchData`. |
| `src/app/dashboard/center/experts/page.tsx` | 32 | `useEffect` thieu `fetchData`. |
| `src/app/dashboard/center/page.tsx` | 51 | `useEffect` thieu `fetchData`. |
| `src/app/dashboard/center/parents/page.tsx` | 37 | `useEffect` thieu `fetchData`. |
| `src/app/dashboard/expert/_hooks/useLiveTelemetry.ts` | 173 | `useEffect` thieu `mutedGroups`. |
| `src/app/dashboard/expert/_hooks/useSimulatedSession.ts` | 146 | `useEffect` thieu `thresholds.deviation_angle_deg`. |

### `react-hooks/set-state-in-effect`

| File | Line | Van de |
| --- | ---: | --- |
| `src/app/dashboard/_components/VraChatbot.tsx` | 60 | Goi `setMessages` dong bo trong effect khi open chatbot. |
| `src/app/dashboard/admin/centers/[id]/page.tsx` | 36 | Goi `fetchData()` trong effect, ben trong co set state dong bo. |
| `src/app/dashboard/admin/centers/page.tsx` | 27 | Goi `fetchCenters()` trong effect, ben trong co set state dong bo. |
| `src/app/dashboard/admin/page.tsx` | 29 | Goi `fetchData()` trong effect, ben trong co set state dong bo. |
| `src/app/dashboard/expert/_hooks/useWebRTCViewer.ts` | 125 | Goi `initPeerConnection()` trong effect, ben trong co set state. |
| `src/app/dashboard/expert/reports/alerts/page.tsx` | 32 | Goi `setLoading(true)` dong bo trong effect. |
| `src/app/dashboard/expert/reports/behavior/page.tsx` | 31 | Goi `setLoading(true)` dong bo trong effect. |
| `src/app/dashboard/expert/reports/page.tsx` | 51 | Goi `setLoading(true)` dong bo trong effect. |

Ghi chu: khong nen sua bang cach tat rule. Nen xem lai luong data fetching. Neu day la fetch du lieu client-side, co the can tach loading state khoi effect sync, hoac dung pattern async/callback on subscription dung hon.

### `react-hooks/purity`

| File | Line | Van de |
| --- | ---: | --- |
| `src/app/dashboard/expert/_hooks/useLiveTelemetry.ts` | 39 | `useRef<number>(Date.now())` goi impure function trong render/init expression. |
| `src/app/dashboard/expert/_hooks/useSimulatedSession.ts` | 43 | `useRef<number>(Date.now())` goi impure function trong render/init expression. |

## Chi tiet JSX/UI lint

### `react/no-unescaped-entities`

| File | Line | Ghi chu |
| --- | ---: | --- |
| `src/app/dashboard/_components/Header.tsx` | 137 | Text JSX co dau `"` chua escape. |
| `src/app/dashboard/expert/_components/stats/GoalSettingsEditor.tsx` | 188 | Text JSX co dau `"` chua escape. |
| `src/app/dashboard/expert/_components/stats/LessonParametersEditor.tsx` | 248 | Text JSX co dau `"` chua escape. |
| `src/app/dashboard/expert/reports/alerts/page.tsx` | 141 | Text JSX co dau `"` chua escape. |
| `src/app/dashboard/expert/reports/behavior/page.tsx` | 134 | Text JSX co dau `"` chua escape. |
| `src/app/dashboard/expert/reports/page.tsx` | 479 | Text JSX co dau `"` chua escape. |
| `src/app/dashboard/expert/session/_components/SessionSummaryModal.tsx` | 142 | Text JSX co dau `"` chua escape. |
| `src/app/dashboard/expert/stats/page.tsx` | 127 | Text JSX co dau `"` chua escape. |
| `src/app/dashboard/parent/_components/ChildRadarChart.tsx` | 143 | Text JSX co dau `"` chua escape. |
| `src/app/dashboard/parent/_components/ExpertNote.tsx` | 28 | Text JSX co dau `"` chua escape. |

Huong sua: doi `"` thanh `&quot;`, hoac dua chuoi vao string expression neu phu hop.

### `react/no-children-prop`

| File | Line | Van de |
| --- | ---: | --- |
| `src/app/dashboard/center/children/page.tsx` | 84 | Dang truyen `children` nhu prop. |
| `src/app/dashboard/center/page.tsx` | 97 | Dang truyen `children` nhu prop. |
| `src/app/dashboard/center/parents/page.tsx` | 80 | Dang truyen `children` nhu prop. |

Huong sua: doi tu `<Component children={...} />` sang `<Component>...</Component>`.

### `@next/next/no-img-element`

| File | Line | Van de |
| --- | ---: | --- |
| `src/app/dashboard/expert/lessons/_components/LessonCard.tsx` | 41 | Dang dung `<img>`. |
| `src/app/dashboard/expert/lessons/_components/LessonsList.tsx` | 241 | Dang dung `<img>`. |
| `src/app/dashboard/expert/suggestions/_components/RecommendationCard.tsx` | 48 | Dang dung `<img>`. |
| `src/app/dashboard/expert/suggestions/_components/RecommendationCard.tsx` | 130 | Dang dung `<img>`. |

Huong sua: doi sang `next/image`. Truoc khi doi, can kiem tra anh local hay remote. Neu remote, can them domain/pattern vao `next.config.ts`.

### `@typescript-eslint/ban-ts-comment`

| File | Line | Van de |
| --- | ---: | --- |
| `src/app/dashboard/expert/_components/stats/LessonParametersEditor.tsx` | 51 | Dang dung `@ts-ignore`. |

Huong sua: uu tien sua type goc. Neu can suppress tam thoi, doi sang `@ts-expect-error` va them ly do ngan.

## File co lint cao nhat

| File | Errors | Warnings |
| --- | ---: | ---: |
| `src/actions/parent.ts` | 28 | 7 |
| `src/actions/center.ts` | 17 | 1 |
| `src/actions/expert.ts` | 15 | 1 |
| `src/app/dashboard/expert/session/[id]/page.tsx` | 13 | 19 |
| `src/actions/auth.ts` | 12 | 6 |
| `src/actions/analytics.ts` | 10 | 0 |
| `src/actions/ai-recommendations.ts` | 7 | 1 |
| `src/app/dashboard/expert/stats/page.tsx` | 6 | 3 |
| `src/actions/messaging.ts` | 6 | 1 |
| `src/app/dashboard/expert/reports/page.tsx` | 5 | 3 |
| `src/app/dashboard/_components/VraChatbot.tsx` | 5 | 2 |
| `src/app/dashboard/center/page.tsx` | 5 | 2 |
| `src/app/dashboard/expert/charts/page.tsx` | 5 | 2 |
| `src/actions/history.ts` | 5 | 1 |
| `src/app/dashboard/expert/_components/stats/LessonParametersEditor.tsx` | 5 | 0 |
| `src/app/dashboard/expert/reports/alerts/page.tsx` | 4 | 4 |
| `src/app/dashboard/center/children/page.tsx` | 4 | 3 |
| `src/app/dashboard/expert/reports/behavior/page.tsx` | 4 | 1 |
| `src/app/dashboard/_components/ChatInterface.tsx` | 4 | 1 |
| `src/app/dashboard/_components/Header.tsx` | 4 | 1 |
| `src/app/dashboard/expert/_components/live/NPCChatPanel.tsx` | 4 | 0 |
| `src/app/dashboard/parent/_components/ChildIntensityChart.tsx` | 4 | 0 |
| `src/app/dashboard/parent/_components/ChildRadarChart.tsx` | 4 | 0 |
| `src/actions/schedule.ts` | 4 | 0 |
| `src/app/dashboard/center/children/[id]/page.tsx` | 3 | 5 |
| `src/app/dashboard/expert/session/_components/SessionSummaryModal.tsx` | 3 | 4 |
| `src/app/dashboard/center/_components/ChildList.tsx` | 3 | 3 |
| `src/app/dashboard/expert/_components/stats/GoalSettingsEditor.tsx` | 3 | 1 |
| `src/app/dashboard/center/parents/page.tsx` | 3 | 1 |
| `src/app/dashboard/admin/centers/[id]/page.tsx` | 3 | 1 |
| `src/components/shared/AlertProfileEditor.tsx` | 3 | 0 |

## Thu tu refactor de xuat

### Dot 1: Don loi nhanh, it rui ro

Muc tieu: giam nhieu warning de output lint de doc hon.

1. Sua `react/no-unescaped-entities`.
2. Sua `react/no-children-prop`.
3. Don unused import/vars trong cac component leaf, dac biet icon lucide khong dung.
4. Doi `@ts-ignore` thanh type fix hoac `@ts-expect-error`.

Kiem tra sau dot nay:

```powershell
npm.cmd run lint
npm.cmd run build
```

### Dot 2: Hooks va React Compiler

Muc tieu: xu ly cac loi co kha nang anh huong behavior.

1. Sua `react-hooks/exhaustive-deps` theo tung file.
2. Sua `react-hooks/set-state-in-effect` o reports/admin/chatbot/webrtc.
3. Sua `react-hooks/purity` trong telemetry/simulation hooks.

Can test thu cong:

1. Login tung role.
2. Mo dashboard admin/center/expert/parent.
3. Mo expert reports voi `sessionId`.
4. Test live telemetry/simulated session neu co data.

### Dot 3: Domain types cho actions

Muc tieu: giam `any` co he thong.

1. Dinh nghia type Firestore document va UI DTO.
2. Tao parser/helper mapping document data.
3. Sua `src/actions/parent.ts`, `center.ts`, `expert.ts`, `auth.ts` truoc.
4. Sua chart components sau khi action return type da on.

Can can than:

- Firestore data co the thieu field cu. Type nen cho phep optional/default o parser.
- Khong nen cast truc tiep `as Type` neu chua normalize data.
- Nen giu response shape hien tai de khong pha UI.

### Dot 4: Image optimization

Muc tieu: doi `<img>` sang `next/image`.

1. Kiem tra image URL trong lessons/recommendations la local hay remote.
2. Neu remote, cap nhat `next.config.ts` voi `images.remotePatterns`.
3. Doi tung component va test layout.

## Command huu ich

Chay build:

```powershell
npm.cmd run build
```

Chay lint toan repo:

```powershell
npm.cmd run lint
```

Chay lint mot nhom file:

```powershell
npx.cmd eslint src\actions\parent.ts src\actions\center.ts
```

Thong ke lint theo rule:

```powershell
$json = & npx.cmd eslint -f json
$results = $json | ConvertFrom-Json
$results.messages | Group-Object ruleId | Sort-Object Count -Descending | Select-Object Count,Name
```

Thong ke lint theo file:

```powershell
$json = & npx.cmd eslint -f json
$results = $json | ConvertFrom-Json
$results | Where-Object { $_.errorCount -or $_.warningCount } | Select-Object filePath,errorCount,warningCount
```

