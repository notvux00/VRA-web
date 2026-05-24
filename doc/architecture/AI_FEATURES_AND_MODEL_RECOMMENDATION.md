# De xuat tich hop AI cho he thong VRA

Ngay lap: 2026-05-20

## 1. Muc tieu

Tai lieu nay de xuat cac chuc nang AI phu hop voi he thong VRA hien tai, tap trung vao:

- Phan tich du lieu phien hoc cua tre.
- Goi y bai hoc va muc do can thiep tiep theo.
- Ho tro chuyen gia tao nhan xet, bao cao, va ke hoach hoc tap.
- Lua chon model AI phu hop theo tung tac vu, co can nhac chi phi, toc do, do tin cay va an toan du lieu tre em.

He thong hien tai da co nhieu dau vao quan trong cho AI:

- `ChildProfile`: tuoi, tinh trang, do nhay cam am thanh, thoi luong chu y, tac nhan gay lo lang, ghi chu chan doan.
- `Session`: diem, thoi luong, bai hoc, trang thai hoan thanh, nhan xet.
- `quest_logs`: thoi gian phan hoi, so hint vat ly, loi noi, hinh anh, ket qua tung nhiem vu.
- `auto_alerts`: idle, hesitation, distraction, stimming_proxy, freeze, meltdown_proxy.
- `behavior_logs`: ghi nhan hanh vi tu chuyen gia.
- `lessons`: kho bai hoc VR voi ten bai, level, mo ta, do tuoi toi thieu, thoi luong.

## 2. Co so khoa hoc va tai lieu tham khao

### 2.1. AI + VR/AR cho giao duc ca nhan hoa tre tu ky

Nguon nen tang nen dua vao la bai bao:

Gadzhimusieva et al. (2026), "Development and pilot evaluation of an AI-driven LMS for personalized education for autistic students", Education and Information Technologies.  
Link: https://link.springer.com/article/10.1007/s10639-025-13888-9

Ly do phu hop:

- Bai bao mo ta mot he thong AI-driven LMS cho hoc sinh tu ky, co ket hop AI, VR/AR, ho so hoc sinh, theo doi tien bo va phoi hop giao vien/phu huynh.
- Huong tiep can cua bai bao gan voi bai toan VRA: dung AI de ca nhan hoa noi dung hoc tap, phan tich hanh vi, va tao phan hoi cho nguoi cham soc/chuyen gia.
- Bai bao ung ho cach trien khai AI nhu mot cong cu ho tro quyet dinh, khong thay the vai tro cua giao vien/chuyen gia.

### 2.2. Learning Analytics va ca nhan hoa hoc tap

Khor & K (2024), "A Systematic Literature Review on Learning Analytics in Online Learning: Research Trends and Pedagogical Implications", Education Sciences.  
Link: https://www.mdpi.com/2227-7102/14/1/51

Gia tri tham khao:

- Learning Analytics co the ho tro ca nhan hoa hoc tap bang cach thu thap du lieu tien bo, phan loai ho so hoc sinh, du doan hieu suat va tao vong phan hoi lien tuc.
- Phu hop voi cac du lieu ma VRA da co: diem, thoi gian, hanh vi, canh bao, muc do hoan thanh bai hoc.

### 2.3. He thong goi y trong giao duc

Askarbekuly & Lukovic (2024), "Evaluating the Effectiveness of Recommender Systems in Online Learning".  
Link: https://arxiv.org/abs/2407.09500

Gia tri tham khao:

- Can danh gia he thong goi y khong chi bang muc do "goi y dung", ma bang tac dong len ket qua hoc tap va muc do phu hop voi nguoi hoc.
- VRA nen luu lai viec chuyen gia chap nhan/bo qua/chinh sua goi y de cai thien prompt va quy tac goi y sau nay.

### 2.4. XR/VR cho tre tu ky

Roberts et al. (2023), "Immersive Virtual Reality Technology for Autistic Children: A Scoping Review", Review Journal of Autism and Developmental Disorders.  
Link: https://link.springer.com/article/10.1007/s40489-022-00320-y

Gia tri tham khao:

- VR co tiem nang trong can thiep va huan luyen ky nang cho tre tu ky, nhung can than trong ve tinh khat quat hoa, tac dong dai han va nguy co gay kho chiu/qua tai.
- VRA nen co AI canh bao qua tai cam giac/cam xuc, nhung can de chuyen gia xac nhan truoc khi dieu chinh ke hoach.

### 2.5. Nguyen tac an toan AI cho tre em va giao duc

UNESCO (2023), "Guidance for generative AI in education and research".  
Link: https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research?hub=67098

UNICEF, "Policy guidance on AI for children".  
Link: https://www.unicef.org/globalinsight/reports/policy-guidance-ai-children

Gia tri tham khao:

- AI trong giao duc can co giam sat cua con nguoi, bao ve quyen rieng tu, minh bach ve muc dich su dung va tranh dua ra quyet dinh gay anh huong den tre ma khong co nguoi co trach nhiem xac nhan.
- VRA nen trien khai AI theo mo hinh human-in-the-loop: AI goi y, chuyen gia quyet dinh.

## 3. Cac chuc nang AI de xuat

### 3.1. Goi y bai hoc ca nhan hoa cho chuyen gia

Mo ta:

- AI phan tich 5-10 phien hoc gan nhat cua mot tre.
- AI doc ho so tre va kho bai hoc.
- AI tra ve 3-5 bai hoc phu hop nhat, kem ly do chuyen mon, muc do uu tien va muc tieu can thiep.

Dau vao:

- Ho so tre: tuoi, tinh trang, do nhay cam am thanh, thoi luong chu y, trigger lo lang.
- Phien hoc gan nhat: score, duration, completion_status, lesson_id.
- `quest_logs`: response_time, hints_physical, hints_verbal, hints_visual.
- `auto_alerts`: distraction, hesitation, idle, freeze, meltdown_proxy, stimming_proxy.
- Danh sach bai hoc tu collection `lessons`.

Dau ra de xuat:

```json
{
  "recommendations": [
    {
      "lessonId": "WashingHand_1",
      "priority": "high",
      "confidence": 0.82,
      "targetSkill": "Tap trung va hoan thanh chuoi hanh dong ngan",
      "reason": "Tre co nhieu canh bao distraction trong 5 phien gan nhat va can nhieu visual hints. Bai hoc nay ngan, co muc do de, phu hop de on dinh lai kha nang tap trung.",
      "expectedBenefit": "Giam thoi gian mat tap trung va tang ty le hoan thanh nhiem vu.",
      "specialistNotes": "Nen bat dau voi thoi luong ngan va dung visual prompt neu tre cham phan hoi."
    }
  ]
}
```

Gia tri:

- Giam thoi gian chuyen gia phan tich thu cong.
- Tang tinh nhat quan khi chon bai hoc.
- Tao duoc ly do ro rang cho moi goi y.

Uu tien trien khai: Rat cao.

### 3.2. Tom tat phien hoc bang AI

Mo ta:

- Sau moi phien hoc, AI tao tom tat ngan cho chuyen gia.
- Noi dung gom: diem noi bat, kho khan, dau hieu can theo doi, goi y cho phien sau.

Dau ra de xuat:

```json
{
  "summary": "Tre hoan thanh bai hoc nhung can nhieu visual hints o nhiem vu cuoi.",
  "positiveSignals": ["Thoi gian phan hoi giam o 2 nhiem vu dau", "Khong co meltdown_proxy"],
  "concerns": ["Tang distraction o nua sau phien hoc"],
  "nextSessionSuggestion": "Giu cung level, giam thoi luong phien va chen nghi ngan sau nhiem vu thu 2."
}
```

Gia tri:

- Bien du lieu thuan ky thuat thanh nhan xet de doc.
- Ho tro trang lich su phien hoc va bao cao phu huynh.

Uu tien trien khai: Cao.

### 3.3. Canh bao nguy co qua tai cam giac/cam xuc

Mo ta:

- AI ket hop rule-based scoring voi LLM explanation.
- Neu nhieu tin hieu nhu `freeze`, `meltdown_proxy`, `stimming_proxy`, duration cao, score giam, response_time tang, AI canh bao chuyen gia.

Khuyen nghi:

- Phan tinh diem rui ro nen lam bang rule-based de on dinh.
- LLM chi nen giai thich ly do va de xuat cach dieu chinh.

Vi du dau ra:

```json
{
  "riskLevel": "medium",
  "signals": ["2 lan freeze", "response_time tang 35%", "duration vuot muc trung binh"],
  "recommendation": "Giam kich thich am thanh va rut ngan phien tiep theo.",
  "requiresSpecialistReview": true
}
```

Gia tri:

- Tang an toan khi dung VR.
- Giup chuyen gia phat hien som dau hieu qua tai.

Uu tien trien khai: Cao.

### 3.4. Bao cao phu huynh bang ngon ngu de hieu

Mo ta:

- AI chuyen du lieu phien hoc thanh bao cao ngan cho phu huynh.
- Chuyen gia duyet va chinh sua truoc khi gui.

Noi dung bao cao:

- Tre da lam tot dieu gi.
- Tre dang gap kho khan o dau.
- Phu huynh co the ho tro o nha nhu the nao.
- Dieu can tranh, vi du am thanh lon hoac phien hoc qua dai.

Gia tri:

- Cai thien giao tiep giua chuyen gia va phu huynh.
- Giam tai viec viet bao cao lap lai.

Uu tien trien khai: Trung binh-cao.

### 3.5. Ke hoach can thiep tuan toi

Mo ta:

- AI de xuat lich 3-5 buoi tiep theo dua tren muc tieu, tien bo va muc do qua tai.
- Moi buoi gom: bai hoc, level, thoi luong, muc tieu, tieu chi thanh cong, tieu chi dung/giam tai.

Khuyen nghi:

- Chi hien thi cho chuyen gia.
- Khong tu dong gan lich cho tre neu chuyen gia chua xac nhan.

Uu tien trien khai: Trung binh.

## 4. Chon model AI mien phi phu hop

Pham vi cua phan nay chi tinh cac lua chon co the dung mien phi:

- Free tier API: co han muc mien phi, phu hop MVP/demo/thuyet trinh.
- Local open models: model tai ve va chay tren may/server cua minh, khong ton tien API nhung ton phan cung.
- Free routed models: model mien phi qua nen tang trung gian, can kiem tra quota va chinh sach du lieu.

Bo qua cac model tra phi/mac dinh ton tien API. Neu sau nay dua vao production co du lieu tre em that, can uu tien local model hoac hop dong API co dieu khoan bao ve du lieu ro rang.

Nguon can kiem tra lai truoc khi trien khai vi quota free co the thay doi:

- Google Gemini API models va pricing/free tier: https://ai.google.dev/gemini-api/docs/models va https://ai.google.dev/gemini-api/docs/pricing
- Ollama local models: https://ollama.com/library
- Ollama structured outputs: https://ollama.com/blog/structured-outputs
- OpenRouter free models: https://openrouter.ai/models?max_price=0
- Groq model docs/pricing: https://console.groq.com/docs/models va https://groq.com/pricing/

### 4.1. Khuyen nghi chinh cho MVP: Gemini 2.5 Flash free tier

Nen chon `gemini-2.5-flash` cho MVP neu can API mien phi, de tich hop nhanh:

- Goi y bai hoc.
- Tom tat phien hoc.
- Tao ban nhap bao cao phu huynh.
- Giai thich canh bao.

Ly do:

- Gemini API co free tier cho mot so model, phu hop demo va giai doan nghien cuu.
- Toc do tot, kha nang doc context dai tot, de dua vao danh sach bai hoc + lich su phien hoc.
- He sinh thai Google phu hop voi du an dang dung Firebase.

Luu y quan trong:

- Free tier thuong co quota gioi han va co the khong phu hop production.
- Can doc ky dieu khoan xu ly du lieu cua free tier. Voi du lieu tre em, nen an danh hoa truoc khi gui len API.
- Khong nen gui ten that, ghi chu chan doan day du, hay thong tin dinh danh khong can thiet.

Thiet lap de xuat:

- Model: `gemini-2.5-flash`
- Output: JSON schema bat buoc.
- Cache: `childId + latestSessionId + lessonCatalogVersion`.
- Fallback: neu het quota, hien thi rule-based recommendation hoac yeu cau thu lai sau.

### 4.2. Lua chon local mien phi va rieng tu hon: Ollama + Qwen/Gemma/Llama

Neu muon khong ton tien API va khong gui du lieu tre em ra ben ngoai, nen chay local model bang Ollama.

Model nen thu theo thu tu:

1. `qwen3:8b`
   - Phu hop tac vu reasoning nhe, phan tich JSON, goi y bai hoc.
   - Yeu cau phan cung vua phai hon cac model lon.

2. `gemma3:12b` hoac ban nho hon neu may yeu
   - Phu hop tom tat, viet bao cao ngan, giai thich bang ngon ngu than thien.
   - La dong open model cua Google, co san tren Ollama.

3. `llama3.1:8b`
   - Lua chon on dinh, pho bien, de chay local.
   - Phu hop phan loai behavior log va tom tat ngan.

Ly do nen can nhac local:

- Khong ton tien theo request.
- Kiem soat du lieu tot hon vi du lieu khong roi khoi server noi bo.
- Phu hop moi truong demo offline hoac trung tam co yeu cau bao mat.

Han che:

- Chat luong co the kem hon model API manh.
- Can server co RAM/VRAM du.
- Toc do phu thuoc phan cung.
- Can test nghiem ngat vi local model de sai schema hon API model manh.

Thiet lap de xuat:

- Runtime: Ollama.
- Model mac dinh local: `qwen3:8b`.
- Output: structured JSON, validate bang Zod o server.
- Temperature: 0.1-0.3 de giam output bay bong.
- Fallback: neu JSON sai, retry 1 lan voi prompt sua loi schema.

### 4.3. Lua chon free qua OpenRouter

OpenRouter co danh sach model gia `0`, co the dung de thu nghiem nhanh nhieu model mien phi ma khong can tu host.

Ung dung phu hop:

- So sanh chat luong model trong giai doan nghien cuu.
- Demo khong co server GPU.
- Chay cac tac vu nho nhu tom tat, phan loai, goi y don gian.

Luu y:

- Model free co the thay doi, bi gioi han quota hoac khong on dinh.
- Day la nen tang trung gian, can xem ky chinh sach du lieu truoc khi gui du lieu nhay cam.
- Khong nen dung du lieu dinh danh cua tre tren free routed models.

### 4.4. Lua chon Groq free/dev tier

Groq co cac model open-weight chay rat nhanh va thuong co free/dev tier theo quota.

Ung dung phu hop:

- Phan loai behavior log.
- Tom tat phien hoc ngan.
- Tao nhan xet nhanh cho dashboard.

Luu y:

- Can kiem tra quota va model free tai thoi diem dang ky.
- Phu hop speed test va MVP, nhung production can xem lai gia va dieu khoan du lieu.

## 5. Bang map tinh nang - model mien phi

| Tinh nang | Model mien phi khuyen nghi | Ly do |
| --- | --- | --- |
| Goi y bai hoc ca nhan hoa | `gemini-2.5-flash` free tier hoac `qwen3:8b` local | Gemini de tich hop nhanh; Qwen local tot hon ve rieng tu |
| Tom tat phien hoc | `gemini-2.5-flash` free tier hoac `gemma3:12b` local | Can output ngan, ngon ngu de hieu |
| Bao cao phu huynh | `gemini-2.5-flash` free tier hoac `gemma3:12b` local | Can van phong than thien, co the chinh sua truoc khi gui |
| Canh bao qua tai | Rule-based + `qwen3:8b` local | Rui ro nen tinh bang rule; model chi giai thich |
| Lap ke hoach tuan | `gemini-2.5-flash` free tier, fallback `qwen3:8b` local | Can context dai hon va suy luan nhieu buoc |
| Phan loai behavior log | `llama3.1:8b` local hoac Groq free/dev tier | Tac vu nho, can nhanh va re |
| Phan tich tong hop trung tam | Nen de sau; thu `gemini-2.5-flash` free tier | Tac vu nang, free tier co the khong du on dinh |

## 6. Kien truc trien khai de xuat

### 6.1. Server Actions moi

Nen tao cac action sau:

- `src/actions/ai-recommendations.ts`
  - `getAIRecommendations(childId: string)`
  - `refreshAIRecommendations(childId: string)`

- `src/actions/ai-session-summary.ts`
  - `generateSessionSummary(sessionId: string)`

- `src/actions/ai-parent-report.ts`
  - `draftParentReport(childId: string, dateRange: DateRange)`

### 6.2. Firestore collections de xuat

`ai_recommendations`

```json
{
  "childId": "child_001",
  "generatedAt": "2026-05-20T10:00:00.000Z",
  "model": "gemini-2.5-flash",
  "inputHash": "hash_child_latest_sessions_lessons",
  "status": "draft",
  "recommendations": [],
  "reviewedBy": "expert_uid",
  "reviewStatus": "accepted | edited | rejected"
}
```

`ai_session_summaries`

```json
{
  "sessionId": "session_001",
  "childId": "child_001",
  "generatedAt": "2026-05-20T10:00:00.000Z",
  "model": "gemini-2.5-flash",
  "summary": "",
  "positiveSignals": [],
  "concerns": [],
  "nextSessionSuggestion": "",
  "reviewStatus": "draft"
}
```

### 6.3. Luong xu ly goi y bai hoc

1. Expert mo trang `/dashboard/expert/suggestions`.
2. Server lay ho so tre, 5-10 session gan nhat, lesson catalog.
3. He thong tao compact input, loai bo thong tin khong can thiet.
4. Kiem tra cache theo `inputHash`.
5. Neu co cache, tra ve ket qua cu.
6. Neu khong co cache, goi model.
7. Validate JSON schema.
8. Luu ket qua vao Firestore voi trang thai `draft`.
9. UI hien thi goi y va nut: Chap nhan, Chinh sua, Bo qua.
10. Log lai hanh dong cua chuyen gia de danh gia chat luong AI.

## 7. Nguyen tac prompt va output

Prompt nen ep model:

- Chi chon bai hoc co trong lesson catalog.
- Khong tu tao chan doan moi.
- Khong dua ra loi khuyen y khoa khang dinh.
- Luon neu du lieu nao da duoc dung de suy luan.
- Neu thieu du lieu, phai tra ve `insufficientData: true`.
- Output phai la JSON theo schema.

Vi du system instruction:

```text
You are an AI assistant supporting a clinical/educational specialist.
You do not diagnose. You do not replace the specialist.
Use only the provided child profile, session history, alerts, behavior logs, and lesson catalog.
Recommend only lessons that exist in the lesson catalog.
Return valid JSON only.
If evidence is weak or missing, mark insufficientData=true and explain what data is missing.
```

## 8. Bao mat va an toan du lieu

Bat buoc:

- Khong gui ten day du cua tre neu khong can; dung `childId` hoac pseudonym.
- Chi gui cac truong can thiet cho model.
- Khong dua API key ra client; chi goi AI tu Server Actions.
- Luu audit log: ai goi, luc nao, model nao, inputHash nao.
- Tat ca ket qua AI phai o trang thai draft cho den khi chuyen gia duyet.
- Hien thi disclaimer trong UI: "Goi y AI chi mang tinh ho tro, can duoc chuyen gia xac nhan."

Nen co:

- Cache ket qua de giam chi phi.
- Rate limit theo expert/center.
- Timeout va fallback neu model loi.
- Kiem tra schema truoc khi render.
- Red-team prompt injection: khong cho behavior log/notes dieu khien system prompt.

## 9. Danh gia chat luong AI

Nen do cac chi so:

- Ty le goi y duoc chuyen gia chap nhan.
- Ty le goi y bi chinh sua.
- Ly do bo qua goi y.
- Muc do cai thien cua tre sau khi ap dung bai hoc duoc goi y.
- Thoi gian chuyen gia tiet kiem khi tao bao cao.
- So lan AI tra ve `insufficientData`.

Nen co form feedback don gian:

- "Phu hop"
- "Can chinh sua"
- "Khong phu hop"
- Ly do: sai muc tieu, sai do kho, qua dai, qua nhieu kich thich, thieu du lieu, khac.

## 10. Lo trinh trien khai

### Phase 1: AI lesson recommendation MVP

- Tao `ai-recommendations.ts`.
- Dung `gemini-2.5-flash` free tier cho MVP hoac `qwen3:8b` local neu uu tien rieng tu.
- Lay 5 session gan nhat + lesson catalog.
- Tra ve JSON schema.
- UI hien thi goi y tren `/dashboard/expert/suggestions`.
- Co cache va review status.

### Phase 2: AI session summary

- Tao tom tat sau phien hoc.
- Hien thi trong lich su phien va trang chi tiet session.
- Cho phep chuyen gia chinh sua.

### Phase 3: Parent report draft

- Tao ban nhap bao cao phu huynh.
- Yeu cau chuyen gia duyet truoc khi gui.

### Phase 4: Risk-aware weekly plan

- Dung `gemini-2.5-flash` free tier cho lap ke hoach ban dau; neu can khong gui du lieu ra ngoai, dung `qwen3:8b` local va gioi han dau vao gon hon.
- Ket hop risk score rule-based.
- Them tieu chi dung/giam tai cho tung buoi.

## 11. Ket luan

Huong tich hop AI phu hop nhat cho VRA la "AI clinical/educational copilot": AI phan tich, tom tat va goi y; chuyen gia van la nguoi quyet dinh. MVP nen bat dau bang goi y bai hoc ca nhan hoa vi tan dung truc tiep du lieu hien co va trang `/dashboard/expert/suggestions` da duoc chuan bi.

Model mien phi khuyen nghi:

- MVP nhanh, de tich hop: `gemini-2.5-flash` free tier.
- Uu tien rieng tu va khong ton API: Ollama + `qwen3:8b`.
- Bao cao/ngon ngu than thien chay local: Ollama + `gemma3:12b`.
- Phan loai nho, tan suat cao: Ollama + `llama3.1:8b` hoac Groq free/dev tier.
- Thu nghiem so sanh model: OpenRouter free models.
