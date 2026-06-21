const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
        : undefined,
    }),
  });
}

const db = admin.firestore();

const DEFAULT_LESSON_PHRASES = {
  "WashingHand_1": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Cố lên con!"],
    "Wet Hands": ["Con hãy bước lại gần bồn rửa tay đi con.", "Hãy mở vòi nước để làm ướt tay nhé."],
    "Apply Soap": ["Con hãy nhấn vòi để lấy xà phòng đi con.", "Nhớ xoa đều xà phòng khắp bàn tay nhé con."],
    "Scrub & Rinse": ["Hãy rửa sạch xà phòng dưới vòi nước nào.", "Hãy lau khô tay vào khăn nhé con."]
  },
  "WashingHand_2": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Cố lên con!"],
    "Wet Hands": ["Con hãy tự làm ướt tay nhé con.", "Mở vòi nước đi con."],
    "Apply Soap": ["Con tự lấy xà phòng và xoa tay nhé.", "Xoa đều xà phòng khắp hai bàn tay nào."],
    "Scrub & Rinse": ["Hãy tự rửa sạch tay dưới vòi nước đi con.", "Tự lau khô tay vào khăn nhé con."]
  },
  "Intro_1": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Tự tin lên con!"],
    "Walk to Stage": ["Con hãy đi lên bục giảng nào.", "Bước lên phía trước đi con."],
    "Greet Class": ["Con hãy chào thầy cô và các bạn đi.", "Cúi đầu chào mọi người nào con."],
    "Say Name": ["Con hãy tự tin nói to tên mình nhé.", "Nói tên của con đi nào."],
    "Say Age & Hobbies": ["Hãy giới thiệu tuổi và sở thích của con đi nào.", "Nói cho các bạn biết con thích gì nhé."]
  },
  "Intro_2": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Con tự tin lắm!"],
    "Walk to Stage": ["Con tự đi lên bục giảng giới thiệu nhé.", "Hãy đứng trước lớp học đi con."],
    "Greet Class": ["Hãy tự chào cả lớp nào con.", "Chào thầy cô và các bạn đi con."],
    "Say Name": ["Con tự giới thiệu tên mình cho mọi người biết nhé.", "Hãy nói to tên con đi."],
    "Say Age & Hobbies": ["Hãy chia sẻ tuổi và sở thích của con với lớp nào.", "Nói về những điều con yêu thích nhé."]
  },
  "Greet_1": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Rất thân thiện!"],
    "Walk to Friend": ["Con hãy tiến lại gần bạn mới đi nào.", "Đi lại gần bạn nào con."],
    "Wave Hand": ["Hãy vẫy tay chào bạn nhé con.", "Vẫy tay nào con."],
    "Say Hello": ["Con hãy nói xin chào bạn đi.", "Chào bạn đi con."],
    "Ask Name": ["Con thử hỏi tên bạn là gì đi con.", "Hỏi tên của bạn đi con."],
    "Shake Hand": ["Con hãy bắt tay bạn thật thân thiện nào.", "Bắt tay bạn đi con."]
  },
  "Farm_1": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Đúng rồi con!"],
    "Explore": ["Con có biết đây là con vật gì không?", "Hãy lắng nghe tiếng kêu của con vật này nhé.", "Con vật này sống ở đâu thế con?", "Hãy chỉ vào con vật theo yêu cầu nào."]
  },
  "Farm_Quiz_1": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Chính xác!"],
    "Quiz": ["Hãy trả lời câu hỏi đố vui nào con.", "Chọn đáp án đúng đi con.", "Con vật này kêu thế nào nhỉ?"]
  },
  "Grassland_1": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Đúng rồi con!"],
    "Explore": ["Con có nhìn thấy sư tử đang ở đâu không?", "Con vật này có đặc điểm gì đặc biệt thế con?", "Hãy chỉ tay vào con ngựa vằn nào.", "Con voi đang đi về hướng nào vậy con?"]
  },
  "Grassland_Quiz_1": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Chính xác!"],
    "Explore": ["Chọn con vật sống trên đồng cỏ hoang mạc nào.", "Con vật này ăn gì thế con?", "Hãy hoàn thành câu đố nhé con."]
  },
  "Ocean_1": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Đẹp quá con nhỉ!"],
    "Explore": ["Con cá heo đang bơi ở đâu thế con?", "Con rùa biển có màu gì vậy con?", "Hãy quan sát thật kỹ các sinh vật biển xung quanh nhé.", "Con cá mập đang ở xa hay ở gần con vậy?"]
  },
  "Ocean_Quiz_1": {
    "general": ["Con làm tốt lắm!", "Tuyệt vời!", "Chính xác!"],
    "Explore": ["Con vật nào bơi nhanh nhất dưới biển nhỉ?", "Chọn sinh vật biển theo yêu cầu đi con.", "Hãy trả lời câu hỏi trắc nghiệm dưới đại dương nào."]
  }
};

async function main() {
  console.log("=== 1. Seeding default phrases to lessons collection ===");
  for (const [lessonId, phrases] of Object.entries(DEFAULT_LESSON_PHRASES)) {
    const lessonRef = db.collection('lessons').doc(lessonId);
    const doc = await lessonRef.get();
    if (doc.exists) {
      await lessonRef.update({
        default_phrases: phrases,
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated lesson defaults for: ${lessonId}`);
    } else {
      console.log(`WARNING: Lesson document not found in DB: ${lessonId}`);
    }
  }

  console.log("\n=== 2. Updating existing children profiles with default phrases ===");
  const childSnap = await db.collection('child_profiles').get();
  for (const childDoc of childSnap.docs) {
    const childData = childDoc.data();
    const existingPhrases = childData.quick_phrases || {};
    const updatedPhrases = { ...existingPhrases };
    
    let needsUpdate = false;
    for (const [lessonId, defaultPhrases] of Object.entries(DEFAULT_LESSON_PHRASES)) {
      if (!updatedPhrases[lessonId]) {
        updatedPhrases[lessonId] = defaultPhrases;
        needsUpdate = true;
      }
    }
    
    if (!updatedPhrases.general) {
      updatedPhrases.general = ["Con làm tốt lắm!", "Tuyệt vời!", "Cố lên con!"];
      needsUpdate = true;
    }

    if (needsUpdate) {
      await db.collection('child_profiles').doc(childDoc.id).update({
        quick_phrases: updatedPhrases,
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated quick_phrases for child: ${childData.name || childDoc.id}`);
    } else {
      console.log(`Child ${childData.name || childDoc.id} already up to date.`);
    }
  }

  console.log("\n=== Seeding completed successfully ===");
  process.exit(0);
}

main().catch(error => {
  console.error("Migration error:", error);
  process.exit(1);
});
