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

const STRUCTURED_LESSON_METADATA = {
  "WashingHand_1": {
    quests: [
      { id: "Bật vòi nước", title: "Bật vòi nước", default_phrases: ["Con hãy bật vòi nước đi nào.", "Mở vòi nước đi con."] },
      { id: "Làm ướt tay", title: "Làm ướt tay", default_phrases: ["Hãy cho tay dưới vòi nước để làm ướt nhé.", "Làm ướt hai bàn tay đi con."] },
      { id: "Xịt xà phòng", title: "Xịt xà phòng", default_phrases: ["Con hãy nhấn vòi để lấy xà phòng nhé.", "Thoa đều xà phòng khắp bàn tay nào con."] },
      { id: "Rửa tay", title: "Rửa tay dưới vòi", default_phrases: ["Hãy xoa và rửa sạch xà phòng dưới vòi nước nào.", "Kỳ cọ hai bàn tay cho sạch nhé con."] },
      { id: "Tắt vòi nước", title: "Tắt vòi nước", default_phrases: ["Con nhớ tắt vòi nước sau khi rửa xong nhé.", "Khóa vòi nước lại đi con."] },
      { id: "Lau tay với khăn", title: "Lau tay với khăn", default_phrases: ["Con hãy dùng khăn để lau khô tay nhé.", "Lau tay vào khăn đi con."] }
    ]
  },
  "WashingHand_2": {
    quests: [
      { id: "Bật vòi nước", title: "Bật vòi nước", default_phrases: ["Tự bật vòi nước đi con.", "Bật vòi nước nào."] },
      { id: "Làm ướt tay", title: "Làm ướt tay", default_phrases: ["Con tự làm ướt tay nhé.", "Làm ướt tay đi con."] },
      { id: "Xịt xà phòng", title: "Xịt xà phòng", default_phrases: ["Con tự lấy xà phòng nhé.", "Xoa đều xà phòng đi con."] },
      { id: "Rửa tay", title: "Rửa tay dưới vòi", default_phrases: ["Hãy tự rửa sạch xà phòng đi con.", "Rửa sạch tay dưới vòi nước nào."] },
      { id: "Tắt vòi nước", title: "Tắt vòi nước", default_phrases: ["Tự khóa vòi nước lại nhé con.", "Tắt vòi nước đi con."] },
      { id: "Lau tay với khăn", title: "Lau tay với khăn", default_phrases: ["Con tự lấy khăn lau khô tay nhé.", "Lau tay đi con."] }
    ]
  },
  "Farm_1": {
    quests: [
      { id: "Explore", title: "Khám phá nông trại", default_phrases: ["Con có nhìn thấy con vật nào xung quanh không?", "Lắng nghe tiếng kêu của con vật nhé con.", "Hãy chỉ vào con vật mà con thích đi con."] }
    ]
  },
  "Farm_Quiz_1": {
    quests: [
      { id: "Quiz_Q1", title: "Câu 1: Đây là con vật gì?", default_phrases: ["Con đoán xem đây là con gì nhé.", "Chỉ con vật tương ứng đi con."] },
      { id: "Quiz_Q2", title: "Câu 2: Đây là con vật gì?", default_phrases: ["Đây là con vật gì thế con?", "Con vật này kêu thế nào nhỉ?"] },
      { id: "Quiz_Q3", title: "Câu 3: Đây là con vật gì?", default_phrases: ["Chỉ con vật đúng đi con.", "Nhìn kỹ xem đây là con gì nào."] },
      { id: "Quiz_Q4", title: "Câu 4: Đây là con vật gì?", default_phrases: ["Đố con đây là con vật gì?", "Chọn đáp án đúng đi con."] },
      { id: "Quiz_Q5", title: "Câu 5: Đây là con vật gì?", default_phrases: ["Con vật này sống ở đâu thế con?", "Chỉ vào con vật đi con."] },
      { id: "Quiz_Q6", title: "Câu 6: Con bò có mấy chân?", default_phrases: ["Con đếm xem con bò có mấy chân nhé.", "Chọn số chân của con bò đi con."] },
      { id: "Quiz_Q7", title: "Câu 7: Lông con bò màu gì?", default_phrases: ["Lông của con bò có màu gì vậy con?", "Nhìn kỹ màu lông con bò đi con."] },
      { id: "Quiz_Q8", title: "Câu 8: Con cừu thường ăn gì?", default_phrases: ["Con cừu thích ăn món gì nhất nhỉ?", "Chọn thức ăn cho cừu đi con."] },
      { id: "Quiz_Q9", title: "Câu 9: Bao nhiêu gà con?", default_phrases: ["Con đếm xem có bao nhiêu chú gà con phía trước nhé.", "Có mấy con gà con vậy con?"] },
      { id: "Quiz_Q10", title: "Câu 10: Bao nhiêu con cừu?", default_phrases: ["Con hãy đếm số lượng cừu phía trước nhé.", "Có mấy con cừu vậy con?"] }
    ]
  },
  "Grassland_1": {
    quests: [
      { id: "Explore", title: "Khám phá đồng cỏ", default_phrases: ["Con có nhìn thấy sư tử đang ở đâu không?", "Nghe tiếng gầm của sư tử nhé.", "Chỉ vào con ngựa vằn nào con."] }
    ]
  },
  "Grassland_Quiz_1": {
    quests: [
      { id: "Quiz_Q1", title: "Câu 1: Đây là con vật gì?", default_phrases: ["Con nhìn xem đây là con gì nào.", "Chỉ con vật đúng đi con."] },
      { id: "Quiz_Q2", title: "Câu 2: Đây là con vật gì?", default_phrases: ["Đây là con gì thế con?", "Chọn con vật đúng đi con."] },
      { id: "Quiz_Q3", title: "Câu 3: Đây là con vật gì?", default_phrases: ["Nhìn xem đây là con gì con nhé.", "Chỉ vào con vật đi con."] },
      { id: "Quiz_Q4", title: "Câu 4: Đây là con vật gì?", default_phrases: ["Đố con đây là con gì nào.", "Chọn đáp án đúng đi con."] },
      { id: "Quiz_Q5", title: "Câu 5: Đây là con vật gì?", default_phrases: ["Chỉ con vật đúng trên đồng cỏ nhé.", "Con vật này tên là gì nhỉ?"] },
      { id: "Quiz_Q6", title: "Câu 6: Đặc điểm của thỏ?", default_phrases: ["Thỏ có đôi tai hay cái đuôi như thế nào nhỉ?", "Thỏ có gì đặc biệt thế con?"] },
      { id: "Quiz_Q7", title: "Câu 7: Tiếng gầm sư tử?", default_phrases: ["Tiếng gầm của sư tử nghe thế nào con nhỉ?", "Sư tử gầm to hay nhỏ vậy con?"] },
      { id: "Quiz_Q8", title: "Câu 8: Đặc trưng ngựa vằn?", default_phrases: ["Ngựa vằn có bộ lông sọc màu gì thế con?", "Điểm đặc biệt của ngựa vằn là gì nào?"] },
      { id: "Quiz_Q9", title: "Câu 9: Hươu cao cổ ăn gì?", default_phrases: ["Hươu cao cổ thường ăn lá cây hay ăn thịt con nhỉ?", "Hươu cao cổ thích ăn gì nào?"] },
      { id: "Quiz_Q10", title: "Câu 10: Sư tử săn mồi?", default_phrases: ["Sư tử thường đi săn mồi vào lúc nào con nhỉ?", "Sư tử săn mồi ban ngày hay ban đêm?"] }
    ]
  },
  "Ocean_1": {
    quests: [
      { id: "Explore", title: "Khám phá đại dương", default_phrases: ["Quan sát các sinh vật biển bơi lội xung quanh nhé con.", "Con có thấy con cá heo bơi ở đâu không?", "Con rùa biển có màu gì đẹp quá con nhỉ."] }
    ]
  },
  "Ocean_Quiz_1": {
    quests: [
      { id: "Quiz_Q1", title: "Câu 1: Đây là con vật gì?", default_phrases: ["Nhìn xem sinh vật biển này là con gì nhé con.", "Chỉ con vật đúng đi con."] },
      { id: "Quiz_Q2", title: "Câu 2: Đây là con vật gì?", default_phrases: ["Đây là con gì thế con?", "Chỉ vào con vật dưới biển đi con."] },
      { id: "Quiz_Q3", title: "Câu 3: Đây là con vật gì?", default_phrases: ["Đố con đây là loài cá nào nhé.", "Chọn con vật đúng đi con."] },
      { id: "Quiz_Q4", title: "Câu 4: Đây là con vật gì?", default_phrases: ["Con gì bơi lội trước mặt con vậy?", "Chọn đáp án đúng đi con."] },
      { id: "Quiz_Q5", title: "Câu 5: Đặc điểm rùa biển?", default_phrases: ["Rùa biển dùng bộ phận nào để tự bảo vệ mình vậy con?", "Mai của rùa biển như thế nào con nhỉ?"] },
      { id: "Quiz_Q6", title: "Câu 6: Hàm răng cá mập?", default_phrases: ["Hàm răng của cá mập sắc nhọn hay mềm mại thế con?", "Răng cá mập như thế nào nhỉ?"] },
      { id: "Quiz_Q7", title: "Câu 7: Đặc điểm cá heo?", default_phrases: ["Cá heo là loài vật hung dữ hay thân thiện con nhỉ?", "Con thấy cá heo thế nào?"] },
      { id: "Quiz_Q8", title: "Câu 8: Thân sứa thế nào?", default_phrases: ["Thân của con sứa mềm hay cứng vậy con?", "Sứa biển có màu sắc thế nào nhỉ?"] },
      { id: "Quiz_Q9", title: "Câu 9: Chạm vào sứa?", default_phrases: ["If lỡ chạm vào sứa thì da bé sẽ bị ngứa hoặc đau đó con.", "Có nên chạm vào sứa biển không con?"] },
      { id: "Quiz_Q10", title: "Câu 10: Cá heo sống thế nào?", default_phrases: ["Cá heo sống một mình hay thích đi theo bầy đàn con nhỉ?", "Cá heo thích bơi cùng nhau không con?"] }
    ]
  },
  "Intro_1": {
    quests: [
      { id: "Walk to Stage", title: "Đi lên bục giảng", default_phrases: ["Con hãy đi lên bục giảng nào.", "Bước lên phía trước đi con."] },
      { id: "Greet Class", title: "Chào cả lớp", default_phrases: ["Con hãy chào thầy cô và các bạn đi.", "Cúi đầu chào mọi người nào con."] },
      { id: "Say Name", title: "Giới thiệu tên", default_phrases: ["Con hãy tự tin nói to tên mình nhé.", "Nói tên của con đi nào."] },
      { id: "Say Age & Hobbies", title: "Giới thiệu tuổi & sở thích", default_phrases: ["Hãy giới thiệu tuổi và sở thích của con đi nào.", "Nói cho các bạn biết con thích gì nhé."] }
    ]
  },
  "Intro_2": {
    quests: [
      { id: "Walk to Stage", title: "Đi lên bục giảng", default_phrases: ["Con tự đi lên bục giảng giới thiệu nhé.", "Hãy đứng trước lớp học đi con."] },
      { id: "Greet Class", title: "Chào cả lớp", default_phrases: ["Hãy tự chào cả lớp nào con.", "Chào thầy cô và các bạn đi con."] },
      { id: "Say Name", title: "Giới thiệu tên", default_phrases: ["Con tự giới thiệu tên mình cho mọi người biết nhé.", "Hãy nói to tên con đi."] },
      { id: "Say Age & Hobbies", title: "Giới thiệu tuổi & sở thích", default_phrases: ["Hãy chia sẻ tuổi và sở thích của con với lớp nào.", "Nói về những điều con yêu thích nhé."] }
    ]
  },
  "Greet_1": {
    quests: [
      { id: "Walk to Friend", title: "Đi lại gần bạn", default_phrases: ["Con hãy tiến lại gần bạn mới đi nào.", "Đi lại gần bạn nào con."] },
      { id: "Wave Hand", title: "Vẫy tay chào", default_phrases: ["Hãy vẫy tay chào bạn nhé con.", "Vẫy tay nào con."] },
      { id: "Say Hello", title: "Nói xin chào", default_phrases: ["Con hãy nói xin chào bạn đi.", "Chào bạn đi con."] },
      { id: "Ask Name", title: "Hỏi tên bạn", default_phrases: ["Con thử hỏi tên bạn là gì đi con.", "Hỏi tên của bạn đi con."] },
      { id: "Shake Hand", title: "Bắt tay bạn", default_phrases: ["Con hãy bắt tay bạn thật thân thiện nào.", "Bắt tay bạn đi con."] }
    ]
  }
};

async function main() {
  console.log("=== 1. Updating lessons collection with structured quests ===");
  for (const [lessonId, data] of Object.entries(STRUCTURED_LESSON_METADATA)) {
    const lessonRef = db.collection('lessons').doc(lessonId);
    const doc = await lessonRef.get();
    if (doc.exists) {
      // Set the structured quests array, and delete the legacy default_phrases map
      await lessonRef.update({
        quests: data.quests,
        default_phrases: admin.firestore.FieldValue.delete(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated structured quests metadata for lesson: ${lessonId}`);
    } else {
      console.log(`WARNING: Lesson document not found: ${lessonId}`);
    }
  }

  console.log("\n=== 2. Rebuilding child profiles quick_phrases ===");
  const childSnap = await db.collection('child_profiles').get();
  for (const childDoc of childSnap.docs) {
    const childData = childDoc.data();
    
    // Build the new structured quick_phrases map
    const newQuickPhrases = {
      general: ["Con làm tốt lắm!", "Tuyệt vời!", "Cố lên con!"]
    };

    for (const [lessonId, data] of Object.entries(STRUCTURED_LESSON_METADATA)) {
      newQuickPhrases[lessonId] = {};
      data.quests.forEach(q => {
        newQuickPhrases[lessonId][q.id] = q.default_phrases;
      });
    }

    await db.collection('child_profiles').doc(childDoc.id).update({
      quick_phrases: newQuickPhrases,
      updatedAt: new Date().toISOString()
    });
    console.log(`Re-populated structured quick_phrases for child: ${childData.name || childDoc.id}`);
  }

  console.log("\n=== Structured quests migration completed successfully ===");
  process.exit(0);
}

main().catch(error => {
  console.error("Migration error:", error);
  process.exit(1);
});
