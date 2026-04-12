import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Initialize Firebase Admin (Uses default credential if running locally with Google ADC, 
// or you can set GOOGLE_APPLICATION_CREDENTIALS)
// Môi trường dev đang dùng file env local. Ta load file .env.local lên nhé:
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
          : undefined,
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error", error);
  }
}

const db = admin.firestore();

// Function to decode Unity YAML string escapes
function decodeUnityYamlString(str: string): string {
  // Unity Yaml encodes extended ascii as \xNN and unicode as \uNNNN
  let decoded = str.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  return decoded;
}

async function seedLessons() {
  const jsonPath = path.resolve(__dirname, "../lessons_extracted.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("Vui lòng tạo file lessons_extracted.json trước.");
    process.exit(1);
  }

  let rawData = fs.readFileSync(jsonPath, "utf-8");
  if (rawData.charCodeAt(0) === 0xFEFF) {
    rawData = rawData.slice(1);
  }
  const lessons = JSON.parse(rawData);

  console.log(`Tìm thấy ${lessons.length} bài học. Bắt đầu đẩy lên Firestore...`);

  // Bảng ánh xạ: lesson_id (trong ScriptableObject) -> scene_name (tên file .unity thực tế)
  // Vì Unity dùng SceneSO mapping nên lesson_id KHÔNG trùng với scene name!
  const sceneNameMap: Record<string, string> = {
    "WashingHand": "Bathroom",
    "Farm": "Farm",
    "Farm_Quiz": "Farm-Quiz",
    "Grassland": "Grassland",
    "Grassland_Quiz": "Grassland-Quizz",
    "Greet": "HelloFriend",
    "Intro": "LearnToAsk",
    "Ocean": "Ocean",
    "Ocean_Quiz": "Ocean-Quiz",
  };

  let count = 0;
  for (const lesson of lessons) {
    // Decode strings
    const lessonName = decodeUnityYamlString(lesson.lesson_name || "");
    const levelName = decodeUnityYamlString(lesson.level_name || "");

    // Generate Document ID: combine lesson_id + level_id to make it unique 
    const docId = `${lesson.lesson_id}_${lesson.level_id}`;

    // Tra bảng ánh xạ để tìm scene_name thực
    const sceneName = sceneNameMap[lesson.lesson_id] || lesson.lesson_id;

    const firestoreData = {
      lesson_id: lesson.lesson_id,
      scene_name: sceneName, // Tên file .unity thực tế để LoadScene
      lesson_name: lessonName,
      level_name: levelName,
      lesson_index: lesson.lesson_index,
      level_index: lesson.level_index,
      type: lesson.type,
      level_id: lesson.level_id,
      // Metadata phụ thêm cho Web
      description: "Mô tả bài học đang cập nhật...",
      thumbnail_url: "",
      min_age: 3,
      duration_min: 15
    };

    try {
      await db.collection("lessons").doc(docId).set(firestoreData);
      console.log(`✅ Đã tải lên: [${docId}] - ${lessonName} - ${levelName}`);
      count++;
    } catch (err) {
      console.error(`❌ Lỗi khi tải lên [${docId}]:`, err);
    }
  }

  console.log(`\n🎉 Hoàn tất! Đã đẩy thành công ${count}/${lessons.length} bài học lên collection 'lessons'.`);
}

seedLessons().then(() => process.exit(0)).catch((err) => {
  console.error("Chạy tool lỗi:", err);
  process.exit(1);
});
