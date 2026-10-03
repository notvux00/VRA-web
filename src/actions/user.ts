"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";

async function getSession() {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}

export async function updateUserProfile(uid: string, data: { name: string }) {
  try {
    const session = await getSession();
    if (!session || (session.uid !== uid && session.role !== "admin")) {
      throw new Error("Unauthorized: No session or insufficient privileges");
    }

    // 1. Update Firebase Auth display name
    await adminAuth.updateUser(uid, {
      displayName: data.name,
    });

    // 2. Update Firestore users collection
    await adminDb.collection("users").doc(uid).set(
      {
        name: data.name,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Cập nhật hồ sơ thành công" };
  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

export async function updateUserPassword(uid: string, newPassword: string) {
  try {
    const session = await getSession();
    if (!session || (session.uid !== uid && session.role !== "admin")) {
      throw new Error("Unauthorized: No session or insufficient privileges");
    }

    // Firebase Admin allows updating password without re-authentication
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    return { success: true, message: "Đổi mật khẩu thành công" };
  } catch (error: unknown) {
    console.error("Error updating password:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}
