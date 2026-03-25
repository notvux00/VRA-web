import "server-only";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    // Determine the most robust way to initialize:
    // Some platforms inject FIREBASE_CONFIG, otherwise we use env vars.
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines with actual newlines
        // Useful when keeping key in vercel/local env files
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
          : undefined,
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error", error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
