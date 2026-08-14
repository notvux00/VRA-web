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

async function runMigration() {
  console.log("=================================================");
  console.log("🚀 STEP 1: Migrating child_profiles quick_phrases to Arrays...");
  console.log("=================================================");
  const childSnap = await db.collection('child_profiles').get();
  let childCount = 0;

  for (const childDoc of childSnap.docs) {
    const data = childDoc.data();
    const quickPhrasesMap = data.quick_phrases || {};
    const newQuickPhrases = {};

    let needsUpdate = false;
    for (const [lessonId, lessonVal] of Object.entries(quickPhrasesMap)) {
      if (lessonVal && typeof lessonVal === 'object' && !Array.isArray(lessonVal)) {
        const questList = [];
        for (const [questName, phrases] of Object.entries(lessonVal)) {
          questList.push({
            quest_name: questName,
            phrases: phrases
          });
        }
        newQuickPhrases[lessonId] = questList;
        needsUpdate = true;
      } else {
        newQuickPhrases[lessonId] = lessonVal;
      }
    }

    if (needsUpdate) {
      await childDoc.ref.update({
        quick_phrases: newQuickPhrases,
        updatedAt: new Date().toISOString()
      });
      childCount++;
      console.log(`  ✅ Migrated child profile: ${childDoc.id}`);
    } else {
      console.log(`  ℹ️ Child profile ${childDoc.id} already up to date.`);
    }
  }

  console.log("\n=================================================");
  console.log("🚀 STEP 2: Removing 'id' field inside 'quests' array in lessons collection...");
  console.log("=================================================");
  const lessonsSnap = await db.collection('lessons').get();
  let lessonCount = 0;

  for (const doc of lessonsSnap.docs) {
    const data = doc.data();
    if (Array.isArray(data.quests)) {
      let modified = false;
      const updatedQuests = data.quests.map(quest => {
        if (quest && typeof quest === 'object' && 'id' in quest) {
          const { id, ...cleanQuest } = quest;
          modified = true;
          return cleanQuest;
        }
        return quest;
      });

      if (modified) {
        await doc.ref.update({
          quests: updatedQuests,
          updatedAt: new Date().toISOString()
        });
        lessonCount++;
        console.log(`  ✅ Cleaned 'id' in quests for lesson: ${doc.id}`);
      } else {
        console.log(`  ℹ️ Lesson ${doc.id} already clean.`);
      }
    }
  }

  console.log("\n=================================================");
  console.log(`🎉 ALL MIGRATIONS COMPLETED!`);
  console.log(`- Updated ${childCount}/${childSnap.size} child profiles`);
  console.log(`- Updated ${lessonCount}/${lessonsSnap.size} lessons`);
  console.log("=================================================");
  process.exit(0);
}

runMigration().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
