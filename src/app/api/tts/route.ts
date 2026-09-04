import { NextRequest, NextResponse } from "next/server";
import { admin } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { text, sessionId } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Nội dung văn bản không được để trống" }, { status: 400 });
    }

    if (!sessionId || !sessionId.trim()) {
      return NextResponse.json({ error: "Session ID là bắt buộc" }, { status: 400 });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 200) {
      return NextResponse.json({ error: "Nội dung văn bản không được vượt quá 200 ký tự" }, { status: 400 });
    }

    // Gửi request tới Google Translate TTS public endpoint
    const encodedText = encodeURIComponent(trimmedText);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodedText}`;

    const ttsResponse = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
      },
    });

    if (!ttsResponse.ok) {
      console.error("Google TTS fetch failed with status:", ttsResponse.status);
      return NextResponse.json({ error: "Không thể kết nối với dịch vụ chuyển đổi giọng nói" }, { status: 502 });
    }

    const arrayBuffer = await ttsResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Lấy storage bucket name từ env
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      console.error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is missing");
      return NextResponse.json({ error: "Cấu hình lưu trữ của máy chủ bị lỗi" }, { status: 500 });
    }

    const bucket = admin.storage().bucket(bucketName);
    const destination = `sessions/${sessionId}/tts/${Date.now()}.mp3`;
    const file = bucket.file(destination);

    // Lưu file buffer lên Firebase Storage
    await file.save(buffer, {
      metadata: {
        contentType: "audio/mpeg",
        metadata: {
          originalText: trimmedText,
          sessionId: sessionId,
        },
      },
    });

    // Tạo pre-signed URL có hiệu lực trong 24 giờ cho client Unity tải xuống
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 giờ
    });

    return NextResponse.json({ url: signedUrl });
  } catch (error: unknown) {
    console.error("Lỗi trong API tts:", error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
