"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(uid: string, data: { name: string }) {
  try {
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
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserPassword(uid: string, newPassword: string) {
  try {
    // Firebase Admin allows updating password without re-authentication
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    return { success: true, message: "Đổi mật khẩu thành công" };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return { success: false, error: error.message };
  }
}
