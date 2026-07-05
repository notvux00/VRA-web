"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

async function getAuthSession() {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    return await adminAuth.verifySessionCookie(cookie);
  } catch {
    return null;
  }
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function chatWithBot(
  childId: string,
  message: string,
  history: ChatMessage[]
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const auth = await getAuthSession();
    if (!auth) return { success: false, error: "Unauthorized" };

    const childDoc = await adminDb.collection("child_profiles").doc(childId).get();
    if (!childDoc.exists) return { success: false, error: "Hồ sơ không tồn tại." };

    const childData = childDoc.data()!;
    
    // Check permission (Expert assigned, or Parent, or Admin)
    const isExpert = childData.expertUid === auth.uid || childData.expertUids?.includes(auth.uid);
    const isParent = childData.parentUid === auth.uid;
    const isAdmin = auth.role === "admin";
    if (!isExpert && !isParent && !isAdmin) {
      return { success: false, error: "Không có quyền truy cập." };
    }

    // Get 5 latest sessions
    const sessionsSnap = await adminDb
      .collection("sessions")
      .where("child_profile_id", "==", childId)
      .get();
      
    const sessions = sessionsSnap.docs
      .map(d => d.data())
      .sort((a, b) => {
        const ta = a.finish_time ? new Date(a.finish_time).getTime() : 0;
        const tb = b.finish_time ? new Date(b.finish_time).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 10)
      .map(s => ({
        lesson_name: s.lesson_name || "Bài học VR",
        level: s.level_name,
        score: s.score,
        duration: s.duration,
        date: s.start_time
      }));

    const childContext = {
      name: childData.name || "Bé",
      age: childData.age || 0,
      condition: childData.condition || "Không có thông tin bệnh lý",
      goals: childData.goals || [],
      totalSessions: sessionsSnap.docs.length,
      recentSessions: sessions
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: true, text: "Đây là tin nhắn tự động từ VRA Chatbot do chưa thiết lập API Key. Dữ liệu bé " + childData.name + " có " + sessions.length + " phiên học gần đây." };
    }

    const systemInstruction = `Bạn là VRA Chatbot, một Trợ lý Trị liệu ảo xuất sắc của hệ thống VRA.
Bạn đang trò chuyện với ${isParent ? "Phụ huynh" : "Chuyên gia trị liệu"} của trẻ.
Lưu ý quan trọng về thời gian: Hôm nay là ngày ${new Date().toLocaleDateString("vi-VN")}. Hãy dùng mốc thời gian này để xác định chính xác các sự kiện xảy ra trong "tuần này", "tháng này" hay "tháng trước".

=== THÔNG TIN TRẺ (NGỮ CẢNH BẮT BUỘC) ===
${JSON.stringify(childContext, null, 2)}

=== NHIỆM VỤ CỦA BẠN ===
- Chỉ trả lời trực tiếp vào câu hỏi hoặc yêu cầu của người dùng.
- Nếu người dùng chỉ chào hỏi, hãy chào lại thân thiện và hỏi xem họ cần hỗ trợ gì. KHÔNG tự động tuôn ra báo cáo tiến độ nếu không được yêu cầu.
- Khi được hỏi về tiến độ, hãy dựa vào dữ liệu trên để phân tích và tóm tắt.
- Đưa ra lời khuyên thiết thực, ngôn từ ấm áp, chuyên nghiệp, thấu hiểu.
- KHÔNG BỊA ĐẶT DỮ LIỆU. Nếu không có thông tin, hãy nói rõ là chưa có dữ liệu.
- Phản hồi NGẮN GỌN (1-2 đoạn), đi thẳng vào trọng tâm vì người dùng có thể đang đọc trên màn hình nhỏ.
- Ngôn ngữ: Tiếng Việt.`;

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction: systemInstruction 
    });

    let formattedHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    // Gemini requires history to start with 'user'
    while (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
      formattedHistory.shift();
    }

    const chatSession = model.startChat({
      history: formattedHistory
    });

    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    return { success: true, text: responseText };

  } catch (error: any) {
    console.error("[Copilot Error]", error);
    return { success: false, error: "Lỗi kết nối AI: " + error.message };
  }
}
