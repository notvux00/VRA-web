const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
      : undefined,
  }),
});

async function main() {
  const snap = await admin.firestore().collection('lessons').get();
  snap.docs.forEach(d => {
    console.log(`[${d.id}] ${d.data().lesson_name}: ${d.data().description || ''}`);
  });
  process.exit(0);
}

main().catch(console.error);
