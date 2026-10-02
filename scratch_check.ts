import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function checkLessons() {
  const snapshot = await db.collection("lessons").get();
  const types = new Set();
  const lessons: any[] = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    types.add(data.type);
    lessons.push({
      id: doc.id,
      lesson_name: data.lesson_name,
      type: data.type
    });
  });
  
  console.log("Found types:", Array.from(types));
  console.log("Lessons Sample:", lessons.slice(0, 10));
}

checkLessons().catch(console.error);
