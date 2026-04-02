import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/gm, "\n"),
    }),
  });
}

const adminDb = admin.firestore();

async function sync() {
  const centersSnap = await adminDb.collection("centers").get();
  for (const centerDoc of centersSnap.docs) {
    const centerId = centerDoc.id;
    const expertsCount = await adminDb.collection("experts").where("centerId", "==", centerId).count().get();
    const childrenCount = await adminDb.collection("child_profiles").where("centerId", "==", centerId).count().get();
    
    const expN = expertsCount.data().count;
    const chiN = childrenCount.data().count;
    
    await centerDoc.ref.update({
      expertCount: expN,
      totalChildren: chiN,
      // Just in case UI uses Uppercase in some old cached version? (Unlikely but for safety)
      ExpertCount: expN, 
      updatedAt: new Date().toISOString()
    });
    console.log(`Center ${centerId}: ${expN} experts, ${chiN} children`);
  }
}

sync().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
