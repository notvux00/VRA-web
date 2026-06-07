# Kế hoạch Triển khai AI Lesson Recommender Prototype

**Ngày lập:** 2026-05-24

---

## 1. Mục tiêu

Xây dựng bản thử nghiệm (prototype) tính năng gợi ý bài học thông minh bằng AI cho chuyên gia trị liệu trên hệ thống VRA-web.

### Prototype sẽ thực hiện:
- Đọc dữ liệu thật từ Firebase Firestore.
- Phân tích hồ sơ trẻ và 3 buổi học gần nhất.
- Đọc danh mục bài học hiện có trong collection `lessons`.
- Gọi Google Gemini 2.5 Flash để đề xuất 3-5 bài học phù hợp tiếp theo.
- Hiển thị kết quả thành các thẻ bài học gợi ý trên trang `/dashboard/expert/suggestions`.
- Cho phép chuyên gia chủ động bấm nút tạo mới hoặc làm mới gợi ý AI.

### Không thực hiện trong Phase 1:
- Không làm chatbot.
- Không tự động gán bài học cho trẻ.
- Không khởi động (launch) bài học vào môi trường VR.
- Không làm tính năng accept/reject/edit phản hồi của chuyên gia.
- Không huấn luyện (training) mô hình AI riêng.

---

## 2. Nguyên tắc sản phẩm

Tính năng này được thiết kế theo dạng **giao diện đề xuất (Recommendation UI)**, không phải giao diện trò chuyện (Chat UI).

### Luồng người dùng chính:
```text
AI phân tích dữ liệu Firebase 
-> Trả về danh sách bài học gợi ý có cấu trúc 
-> UI hiển thị thành các thẻ bài học (Cards) 
-> Chuyên gia xem xét và quyết định
```

Tính năng trò chuyện (Chat) với AI có thể được bổ sung sau này như một công cụ hỗ trợ phụ, ví dụ:
- *"Tại sao AI gợi ý bài học này?"*
- *"Có bài học nào ít kích thích âm thanh hơn không?"*
- *"Giải thích gợi ý này cho phụ huynh dễ hiểu hơn."*

Tuy nhiên, nhân lõi của tính năng vẫn luôn là hệ thống đề xuất bài học có cấu trúc.

---

## 3. Mô hình và Thư viện

* **Mô hình mặc định:** `gemini-2.5-flash`
* **Thư viện đề xuất:** `@google/generative-ai`

```bash
npm install @google/generative-ai
```

### Lý do chọn thư viện chính thức thay vì REST API trực tiếp:
- Dễ dàng mở rộng cho tính năng chat AI sau này.
- Mã nguồn rõ ràng, dễ bảo trì khi quản lý mô hình, prompts và phản hồi.
- Phù hợp nếu sau này tách thành một AI Service dùng chung cho cả bộ đề xuất, bộ tạo báo cáo và bộ chat.

### Biến môi trường cần thêm:
```env
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
```

---

## 4. Dữ liệu đầu vào

### 4.1. Hồ sơ trẻ
Lấy dữ liệu từ collection: `child_profiles/{childId}`

**Chỉ gửi các trường thông tin cần thiết sang Gemini:**
```ts
{
  id,
  age,
  gender,
  condition,
  sound_sensitivity,
  attention_span_min,
  anxiety_triggers,
  diagnosis_notes,
  sessionCount
}
```

**Tuyệt đối KHÔNG gửi các thông tin định danh cá nhân:**
```ts
{
  name,
  display_name,
  parentUid,
  expertUid,
  linkCode,
  email
}
```

### 4.2. Lịch sử học gần nhất
Lấy tối đa 3 sessions gần nhất của trẻ từ collection `sessions` theo điều kiện:
```text
where child_profile_id == childId
order by finish_time desc hoặc start_time desc
limit 3
```

**Dữ liệu gửi sang Gemini:**
```ts
{
  id,
  lesson_id,
  lesson_name,
  level_name,
  type,
  score,
  completion_status,
  duration,
  quest_logs,
  auto_alerts,
  behavior_logs,
  evaluation,
  notes,
  start_time,
  finish_time
}
```

*Lưu ý:* Nếu trẻ có ít hơn 3 sessions, hệ thống vẫn cho phép tạo gợi ý, nhưng yêu cầu Gemini thiết lập:
```json
{
  "insufficientData": true
}
```

### 4.3. Danh mục bài học
Lấy dữ liệu từ collection: `lessons`

**Dữ liệu gửi sang Gemini:**
```ts
{
  id,
  lesson_id,
  lesson_name,
  level_name,
  type,
  description,
  min_age,
  duration_min
}
```
*Ràng buộc:* Gemini chỉ được phép chọn các bài học tồn tại trong danh mục được cung cấp này.

---

## 5. Luồng xử lý kỹ thuật

```text
Expert mở trang /dashboard/expert/suggestions?childId=xxx
        |
        v
Trang đọc dữ liệu cache từ ai_recommendations/{childId} nếu có
        |
        v
Nếu chưa có gợi ý: Hiển thị nút "Tạo gợi ý AI"
Nếu đã có gợi ý: Hiển thị danh sách card gợi ý + nút "Làm mới gợi ý AI"
        |
        v
Expert bấm nút khởi tạo / làm mới gợi ý
        |
        v
Server Action xác thực quyền truy cập của Expert đối với childId
        |
        v
Truy vấn Firestore lấy: child profile + 3 sessions gần nhất + lessons catalog
        |
        v
Ẩn danh hóa và rút gọn (compact) dữ liệu
        |
        v
Gửi Prompt và dữ liệu sang Gemini 2.5 Flash
        |
        v
Kiểm tra tính hợp lệ của cấu trúc JSON và đối chiếu tồn tại của lessonId
        |
        v
Lưu kết quả hợp lệ vào ai_recommendations/{childId}
        |
        v
UI render kết quả thành 3-5 thẻ bài học gợi ý trực quan
```

---

## 6. Bộ nhớ đệm Firestore (Cache)

Phase 1 sử dụng cơ chế cache thủ công để tối ưu chi phí hiệu năng và không tự động gọi Gemini khi chuyên gia chỉ tải lại trang.

* **Collection:** `ai_recommendations`
* **Document ID:** `ai_recommendations/{childId}`

**Cấu trúc Schema tài liệu cache:**
```json
{
  "childId": "child_001",
  "model": "gemini-2.5-flash",
  "generatedAt": "2026-05-24T00:00:00.000Z",
  "generatedBy": "expert_uid",
  "basedOnSessionIds": ["session_3", "session_2", "session_1"],
  "status": "draft",
  "insufficientData": false,
  "summary": "AI đã phân tích 3 buổi gần nhất và nhận thấy trẻ cần hỗ trợ thêm về khả năng tập trung và tự phục vụ.",
  "recommendations": []
}
```

### Cơ chế hoạt động:
- Khi chuyên gia mở trang, hệ thống chỉ đọc dữ liệu từ cache (nếu có).
- Nếu chưa có dữ liệu cache, hiển thị nút **"Tạo gợi ý AI"**.
- Nếu dữ liệu cache tồn tại, hiển thị ngay các gợi ý đã lưu trước đó.
- Nếu danh sách 3 sessions mới nhất của trẻ có sự thay đổi so với trường `basedOnSessionIds` trong cache, hiển thị cảnh báo tế nhị: *"Đã có dữ liệu buổi học mới của trẻ. Bạn có thể làm mới gợi ý AI."*
- Hệ thống chỉ gọi API Gemini khi chuyên gia chủ động bấm nút **"Làm mới gợi ý AI"**.
- **Cố định thứ tự mảng `basedOnSessionIds` trong Cache:** Quy định rõ trong Server Action: mảng `basedOnSessionIds` luôn được trích xuất từ 3 sessions đã sắp xếp theo `finish_time` giảm dần (mới nhất lên đầu) trước khi ghi đè hoặc so khớp cache để tránh lệch thứ tự do Firestore truy vấn.

---

## 7. Định dạng đầu ra từ Gemini (Output Schema)

Gemini bắt buộc phải trả về chuỗi JSON hợp lệ, không chứa ký tự định dạng markdown (như ```json) hay bất kỳ văn bản tự do nào ngoài khối JSON.

**Cấu trúc Schema bắt buộc:**
```json
{
  "insufficientData": false,
  "summary": "Tóm tắt ngắn gọn những xu hướng quan trọng từ 3 session gần nhất.",
  "recommendations": [
    {
      "lessonId": "WashingHand_1",
      "lessonTitle": "Washing Hand",
      "levelName": "Level 1",
      "type": "practical",
      "targetSkill": "Tự phục vụ",
      "priority": "high",
      "confidence": 0.86,
      "reason": "Phù hợp vì trẻ cần luyện chuỗi hành động ngắn, có cấu trúc rõ và ít kích thích âm thanh.",
      "expectedBenefit": "Giúp trẻ tăng khả năng hoàn thành nhiệm vụ theo trình tự.",
      "specialistNotes": "Nên bắt đầu với thời lượng ngắn và dùng visual hint nếu trẻ chậm phản hồi."
    }
  ]
}
```

**Các giá trị hợp lệ quy định:**
- `priority`: Chỉ nhận giá trị `"high" | "medium" | "low"`
- `confidence`: Giá trị kiểu số thực nằm trong khoảng `0` đến `1`
- `recommendations`: Trả về danh sách chứa từ `3` đến `5` bài học gợi ý.

---

## 8. Nguyên tắc xây dựng Prompt (Prompt Rules)

Hệ thống prompt và cấu hình mô hình bắt buộc phải ràng buộc Gemini chặt chẽ:
- Bạn đóng vai trò là một trợ lý AI giàu kinh nghiệm lâm sàng hỗ trợ chuyên gia trị liệu/giáo dục đặc biệt.
- Tuyệt đối KHÔNG tự ý đưa ra chẩn đoán y khoa mới.
- Tuyệt đối KHÔNG thay thế vai trò chuyên môn của chuyên gia lâm sàng.
- Chỉ sử dụng duy nhất dữ liệu ẩn danh được cung cấp trong ngữ cảnh.
- Chỉ được gợi ý các bài học có trong danh sách bài học (`lessons`) được gửi kèm. Tuyệt đối KHÔNG tự tạo ra bài học mới.
- Đưa ra lý giải chuyên môn chặt chẽ dựa trên bằng chứng dữ liệu thực tế từ hồ sơ trẻ và lịch sử 3 sessions gần nhất.
- Nếu dữ liệu lịch sử quá ít hoặc thiếu độ tin cậy, thiết lập `"insufficientData": true` trong kết quả.
- Đầu ra bắt buộc phải là một đối tượng JSON chuẩn, không có giải thích thừa bên ngoài.
- **Ràng buộc ngôn ngữ phản hồi chuyên sâu:** Tất cả các trường văn bản tự do trong JSON đầu ra bao gồm `summary`, `targetSkill`, `reason`, `expectedBenefit`, `specialistNotes` bắt buộc phải được viết bằng tiếng Việt có dấu, sử dụng văn phong lâm sàng chuẩn mực, ôn hòa và dễ hiểu đối với trị liệu viên Việt Nam.

---

## 9. Cấu trúc Server Action đề xuất

* **Đường dẫn tệp:** `src/actions/ai-recommendations.ts`
* **Các hàm cốt lõi:**
  - `getCachedAIRecommendations(childId: string)`: Đọc dữ liệu cache từ Firestore.
  - `generateAIRecommendations(childId: string)`: Hàm chính thực hiện gọi Gemini, validate dữ liệu và lưu cache.

**Kiểu dữ liệu trả về của Server Action:**
```ts
{
  success: boolean;
  source: "cache" | "gemini";
  childId?: string;
  generatedAt?: string;
  basedOnSessionIds?: string[];
  hasNewSessionData?: boolean;
  summary?: string;
  recommendations?: AILessonRecommendation[];
  insufficientData?: boolean;
  error?: string;
}
```

---

## 10. Giao diện Người dùng (UI Phase 1)

* **Đường dẫn trang:** `src/app/dashboard/expert/suggestions/page.tsx`

### Yêu cầu hiển thị:
- Tên trẻ đang được chọn để phân tích.
- Hiển thị trạng thái dữ liệu linh hoạt:
  - Chưa từng khởi tạo gợi ý AI trước đây.
  - Đã có dữ liệu gợi ý AI trong bộ nhớ cache.
  - Phát hiện có buổi học mới sau lần gợi ý gần nhất để nhắc nhở làm mới.
- Hệ thống nút bấm:
  - Nút **"Tạo gợi ý AI"** (khi chưa có cache).
  - Nút **"Làm mới gợi ý AI"** (khi đã có cache).
- Đoạn văn bản tóm tắt phân tích tổng quan của AI.
- Grid danh sách hiển thị các thẻ bài học gợi ý.
- **Tải bất đồng bộ phía Giao diện:** Sử dụng hook `useTransition` của React 19 trong Client Component của nút bấm để quản lý trạng thái `isPending`. Khi đang gọi Action:
  - Nút bấm sẽ bị vô hiệu hóa (disabled), hiển thị biểu tượng loading (spinner).
  - Giao diện bên dưới sẽ hiển thị hiệu ứng xương cá (Skeleton Loading) chạy mượt mà để tăng trải nghiệm chuyên nghiệp: *"AI đang suy luận chẩn đoán..."*.

### Mỗi thẻ bài học gợi ý (Card) hiển thị:
- Tên bài học.
- Cấp độ bài học (Level) & Loại bài học.
- Mức độ ưu tiên (`priority` - có badge màu tương ứng).
- Điểm tin cậy (`confidence` chuyển thành dạng %).
- Kỹ năng mục tiêu.
- Lý do AI đề xuất.
- Lợi ích kỳ vọng mang lại.
- Lưu ý lâm sàng đặc biệt cho chuyên gia.
- *Lưu ý:* Phase 1 không tích hợp nút bấm bắt đầu bài học (launch VR) hay chuyển trang.

---

## 11. Cơ chế Xác thực Đầu ra trên Server (Validation)

Ngay sau khi nhận kết quả phản hồi từ Gemini API, Server Action bắt buộc phải thực hiện kiểm tra cấu trúc nghiêm ngặt trước khi ghi nhận vào cơ sở dữ liệu:
- Kiểm tra trường `recommendations` có thực sự là một mảng (Array).
- Đối chiếu từng `lessonId` trong danh sách đề xuất của AI. Mọi `lessonId` bắt buộc phải tồn tại trong bộ sưu tập `lessons` của hệ thống.
- Nếu phát hiện bài học nào AI gợi ý sai lệch hoặc không tồn tại trong danh mục bài học thật, Server Action sẽ tự động loại bỏ (filter out) bài học đó.
- Kiểm tra tính hợp lệ của trường `confidence` (phải là số thực từ 0 đến 1) và `priority` (phải thuộc nhóm `"high" | "medium" | "low"`).
- Trường hợp sau khi lọc bỏ các lỗi ảo giác của AI mà số lượng bài học hợp lệ còn lại bằng 0, Server Action sẽ hủy bỏ lưu cache và trả về thông báo lỗi chi tiết cho giao diện UI.

---

## 12. Xử lý lỗi (Error Handling)

Hệ thống phải bắt và xử lý trơn tru các tình huống ngoại lệ sau:
- Thiếu cấu hình `GEMINI_API_KEY` trong môi trường.
- Gemini API gặp sự cố quá tải, timeout hoặc mất kết nối.
- Dữ liệu JSON do Gemini trả về bị sai lệch định dạng cú pháp (parse error).
- Trẻ chưa có bất kỳ dữ liệu buổi học (`sessions`) nào trong cơ sở dữ liệu.
- Cơ sở dữ liệu Firestore trống không có danh mục bài học (`lessons`).
- Chuyên gia cố tình truy cập trái phép hồ sơ trẻ không được phân công quản lý.

### Các kịch bản xử lý cụ thể:
- Khi thiếu khóa `GEMINI_API_KEY`, giao diện Suggestions sẽ hiển thị thông báo lỗi rõ ràng và trực quan hướng dẫn lập trình viên/quản trị viên cấu hình.
- **Graceful Degradation khi thiếu API Key:** Để nâng cao trải nghiệm người dùng trong môi trường phát triển: Nếu phát hiện thiếu `GEMINI_API_KEY`, thay vì làm sập trang, Server Action vẫn chạy bình thường nhưng trả về một cờ `isDemo: true` kèm danh mục bài học gợi ý giả lập (mocking) chất lượng cao dựa trên chính hồ sơ thật của trẻ. Trên UI sẽ hiển thị một Banner thông tin trang nhã: *"Hệ thống đang chạy ở chế độ giả lập (Demo Mode). Hãy cấu hình GEMINI_API_KEY trong .env.local để kích hoạt AI thật"*. Điều này giúp việc chạy thử và thuyết trình prototype cực kỳ an toàn và thuận tiện!

---

## 13. Kế hoạch kiểm thử (Testing Plan)

### 13.1. Kiểm thử kỹ thuật (Technical Test)
1. Cài đặt thư viện bằng `npm install`.
2. Tạo file `.env.local` và thêm khóa `GEMINI_API_KEY` của bạn.
3. Chạy môi trường dev bằng `npm run dev`.
4. Đảm bảo ứng dụng Next.js compile thành công không có lỗi TypeScript hay ESLint.
5. Kiểm tra Server Action hoạt động ổn định, đọc đúng dữ liệu từ Firebase.
6. Xác minh dữ liệu đề xuất của Gemini được lưu chính xác vào collection `ai_recommendations` trên Firebase Firestore.

### 13.2. Kiểm thử giao diện (UI/UX Test)
Truy cập đường dẫn: `/dashboard/expert/suggestions?childId=<MÃ_SỐ_TRẺ>` và kiểm tra các kịch bản:
- **Trường hợp Trẻ chưa từng có gợi ý:** UI hiển thị trạng thái trống và hiển thị nút **"Tạo gợi ý AI"**.
- **Kịch bản Bấm nút Khởi tạo:** Giao diện lập tức chuyển sang trạng thái Skeleton Loading mượt mà, sau khi Server Action phản hồi thành công, hiển thị các thẻ bài học đẹp mắt.
- **Trường hợp Trẻ đã có gợi ý lưu cache:** Tải trang tức thì, các gợi ý được hiển thị ngay lập tức từ bộ nhớ cache mà không cần đợi API của Gemini.
- **Kịch bản Có dữ liệu mới:** Khi chuyên gia ghi nhận thêm 1 session mới cho trẻ, quay lại trang suggestions phải nhìn thấy cảnh báo dữ liệu mới và nút **"Làm mới gợi ý AI"**.
- **Kịch bản Gemini API lỗi/Không có Key:** Giao diện hiển thị Banner báo lỗi chi tiết hoặc chuyển sang Demo Mode trơn tru, không làm sập toàn bộ trang Dashboard.

---

## 14. Lộ trình phát triển tương lai (Post-Prototype Roadmap)

### Phase 2:
- Tích hợp tính năng chuyên gia gửi phản hồi: accept/reject/edit gợi ý bài học.
- Lưu trữ lịch sử feedback của chuyên gia để ghi nhận dữ liệu lâm sàng thực tế.
- Bổ sung nút **"Chọn bài này cho buổi tiếp theo"** để gán trực tiếp bài học đề xuất vào lộ trình học tập của trẻ.
- Kết nối trực tiếp bài học được chọn với luồng khởi động kính VR (VR Pairing).

### Phase 3:
- Tích hợp trợ lý chatbot bổ trợ ngay bên cạnh danh sách đề xuất.
- Cho phép chuyên gia hỏi đáp nhanh: *"Tại sao AI lại chọn bài này mà không chọn bài nông trại?"*, *"Có bài học nào có mức kích thích giác quan nhẹ hơn cho bé không?"*.
- Tự động biên dịch tóm tắt tiến trình thành phiên bản báo cáo đơn giản, thân thiện dành riêng cho Phụ huynh.

### Phase 4:
- Tận dụng dữ liệu phản hồi (chấp nhận/từ chối/chỉnh sửa) của các chuyên gia trong quá khứ để tinh chỉnh prompt hoặc chấm điểm xếp hạng (hybrid scoring) bài học chính xác hơn.
- Thử nghiệm tích hợp thêm các mô hình y tế chuyên biệt khác thông qua Hugging Face hoặc OpenRouter để so sánh hiệu năng.
