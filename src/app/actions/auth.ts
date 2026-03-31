"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { getCollectionName } from "@/lib/utils/roles";

const SESSION_COOKIE_NAME = "session";
const EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days

// getCollectionName moved to @/lib/utils/roles.ts to satisfy Next.js 15 Server Action async rule.

export async function createSession(idToken: string) {
  try {
    // 1. Verify the token
    const decodedIdToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedIdToken.uid;
    const email = decodedIdToken.email;

    // 2. [RECOVERY] Hardcode Admin Role for specific email
    let role = decodedIdToken.role;
    if (email === "leduyvu27022005@gmail.com") {
      role = "admin";
      await adminDb.collection("system_admins").doc(uid).set({
        role: "admin",
        email: email,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await adminAuth.setCustomUserClaims(uid, { role: "admin" });
    }

    if (!role) role = "parent";
    const collectionName = getCollectionName(role);

    // 3. Sync Roles: Check Firestore first
    let userDoc = await adminDb.collection(collectionName).doc(uid).get();
    
    // Fallback vớt từ users cũ
    if (!userDoc.exists) {
      const oldDoc = await adminDb.collection("users").doc(uid).get();
      if (oldDoc.exists) {
        userDoc = oldDoc;
      }
    }

    if (userDoc.exists) {
      // Use Firestore role as source of truth
      role = userDoc.data()?.role || role;
      const targetCol = getCollectionName(role);
      
      // Sync email
      const updates: any = {};
      if (!userDoc.data()?.email || userDoc.data()?.email !== email) updates.email = email || "";
      
      if (Object.keys(updates).length > 0) {
        await adminDb.collection(targetCol).doc(uid).update(updates);
      }
    } else {
      // Auto-Migration/New User Logic
      await adminDb.collection(collectionName).doc(uid).set({
        role: role,
        email: email || "",
        updatedAt: new Date().toISOString()
      });
    }

    // 4. Update Custom Claims if they don't match Firestore
    if (decodedIdToken.role !== role) {
      await adminAuth.setCustomUserClaims(uid, { role });
    }
    
    // Only process if the user recently signed in
    if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
      // Create session cookie
      const cookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: EXPIRES_IN,
      });

      const options = {
        name: SESSION_COOKIE_NAME,
        value: cookie,
        maxAge: EXPIRES_IN,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      };

      (await cookies()).set(options);
      
      return { success: true, role };
    }
    return { success: false, error: "Recent sign in required" };
  } catch (error) {
    console.error("Session creation error", error);
    return { success: false, error: "Unauthorized" };
  }
}

export async function removeSession() {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return { success: true };

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    await adminAuth.revokeRefreshTokens(decodedClaims.sub);
  } catch (error) {
    // Ignore error if cookie is invalid
  }

  (await cookies()).delete(SESSION_COOKIE_NAME);
  redirect("/");
}

export async function setParentRole(uid: string) {
  try {
    // Update both Firestore and Auth Claims
    const userRef = adminDb.collection("parents").doc(uid);
    const userDoc = await userRef.get();
    
    // If user already has a role (like admin), DON'T overwrite it to parent
    if (userDoc.exists && userDoc.data()?.role) {
      console.log(`User ${uid} already has role ${userDoc.data()?.role}, skipping parent auto-assign.`);
      return { success: true, role: userDoc.data()?.role };
    }

    await userRef.set({
      role: "parent",
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await adminAuth.setCustomUserClaims(uid, { role: "parent" });
    return { success: true, role: "parent" };
  } catch (error) {
    console.error("Error setting custom claim", error);
    return { success: false };
  }
}

export async function updateUserRole(uid: string, role: string) {
  try {
    const colName = getCollectionName(role);
    await adminDb.collection(colName).doc(uid).set({
      role: role,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    await adminAuth.setCustomUserClaims(uid, { role });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return { success: false, error: error.message };
  }
}

export async function assignRoleByEmail(email: string, role: string) {
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });
    return { success: true, message: `Successfully assigned ${role} role to ${email}` };
  } catch (error: any) {
    console.error("Error assigning role:", error);
    return { success: false, error: error.message };
  }
}

// Center Management Actions
export async function createCenter(centerData: { 
  name: string;      // Center Name
  managerName: string; // Manager Person Name
  email: string; 
  password?: string;
  address?: string;
  phone?: string;
  centerEmail?: string;
}) {
  try {
    // 1. Create a unique Center ID
    const centerId = "CT-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    // 2. Check if user exists or create them
    let uid: string;
    try {
      const userRecord = await adminAuth.getUserByEmail(centerData.email);
      uid = userRecord.uid;
    } catch (e) {
      if (!centerData.password) {
        return { success: false, error: "Password is required for new center accounts." };
      }
      const newUser = await adminAuth.createUser({
        email: centerData.email,
        password: centerData.password,
        displayName: centerData.managerName, // Use managerName for auth
      });
      uid = newUser.uid;
    }

    // 3. Assign 'center' role and link to center_id in Firestore
    await adminDb.collection("center_managers").doc(uid).set({
      role: "center",
      email: centerData.email,
      name: centerData.managerName, // Save person name here
      centerId: centerId,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 4. Assign 'center' role in Custom Claims (include centerId for faster access in middleware)
    await adminAuth.setCustomUserClaims(uid, { role: "center", centerId: centerId });

    // 5. Create Center document in Firestore
    const centerRef = adminDb.collection("centers").doc(centerId);
    await centerRef.set({
      name: centerData.name,
      email: centerData.centerEmail || centerData.email,
      address: centerData.address || "",
      phone: centerData.phone || "",
      centerId: centerId,
      ownerUid: uid, // Track the original creator
      managerUids: [uid], // Support multiple managers
      createdAt: new Date().toISOString(),
      status: "Active",
      expertCount: 0,
      sessionCount: 0
    });

    return { success: true, centerId };
  } catch (error: any) {
    console.error("Error creating center:", error);
    return { success: false, error: error.message };
  }
}

export async function addCenterManager(centerId: string, managerData: { name: string; email: string; password?: string }) {
  try {
    // 1. Check if user exists or create them
    let uid: string;
    try {
      const userRecord = await adminAuth.getUserByEmail(managerData.email);
      uid = userRecord.uid;
    } catch (e) {
      if (!managerData.password) {
        return { success: false, error: "Password is required for new manager accounts." };
      }
      const newUser = await adminAuth.createUser({
        email: managerData.email,
        password: managerData.password,
        displayName: managerData.name,
      });
      uid = newUser.uid;
    }

    // 2. Assign 'center' role and link to center_id
    await adminDb.collection("center_managers").doc(uid).set({
      role: "center",
      email: managerData.email,
      name: managerData.name, // Save name here
      centerId: centerId,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await adminAuth.setCustomUserClaims(uid, { role: "center", centerId: centerId });

    // 3. Update Center document: Add to managerUids array
    const centerRef = adminDb.collection("centers").doc(centerId);
    const centerDoc = await centerRef.get();
    
    if (!centerDoc.exists) {
      return { success: false, error: "Center not found." };
    }

    const currentManagers = centerDoc.data()?.managerUids || [];
    if (!currentManagers.includes(uid)) {
      await centerRef.update({
        managerUids: [...currentManagers, uid]
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error adding center manager:", error);
    return { success: false, error: error.message };
  }
}

export async function getCenters() {
  try {
    const snapshot = await adminDb.collection("centers").orderBy("createdAt", "desc").get();
    const centers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, centers };
  } catch (error: any) {
    console.error("Error fetching centers:", error);
    return { success: false, error: error.message };
  }
}

export async function getCenterDetails(centerId: string) {
  try {
    const centerDoc = await adminDb.collection("centers").doc(centerId).get();
    if (!centerDoc.exists) return { success: false, error: "Center not found" };

    const centerData = { id: centerDoc.id, ...centerDoc.data() };
    const managerUids = centerDoc.data()?.managerUids || [];

    // Fetch details for each manager
    const managers = await Promise.all(
      managerUids.map(async (uid: string) => {
        // managers are in center_managers collection
        const userDoc = await adminDb.collection("center_managers").doc(uid).get();
        const userData = userDoc.data();
        return { 
          uid, 
          email: userData?.email, 
          name: userData?.name || "Unknown Manager" 
        };
      })
    );

    return { success: true, center: centerData, managers };
  } catch (error: any) {
    console.error("Error fetching center details:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile(uid: string) {
  try {
    // 1. Phân loại collection theo Role
    const userRecord = await adminAuth.getUser(uid);
    const role = userRecord.customClaims?.role || "parent";
    
    let collectionName = getCollectionName(role);

    // 2. Tìm trong collection mới dựa theo Role
    let userDoc = await adminDb.collection(collectionName).doc(uid).get();
    
    // 3. (Fallback vớt): Tìm trong collection `users` cũ nếu bạn lười/chưa migrate dữ liệu cũ
    if (!userDoc.exists) {
      userDoc = await adminDb.collection("users").doc(uid).get();
      if (!userDoc.exists) return { success: false, error: "User not found" };
    }

    const userData = userDoc.data() || {};
    const profile = {
      role: userData.role || role,
      centerId: userData.centerId || null,
      centerName: null as string | null,
      name: userData.name || userData.displayName || null,
    };

    if (profile.centerId) {
      const centerDoc = await adminDb.collection("centers").doc(profile.centerId).get();
      if (centerDoc.exists) {
        profile.centerName = centerDoc.data()?.name || null;
      }
    }

    return { success: true, profile };
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCenterStatus(centerId: string, status: "Active" | "Inactive") {
  try {
    await adminDb.collection("centers").doc(centerId).update({
      status: status,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating center status:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCenter(centerId: string) {
  try {
    const centerDoc = await adminDb.collection("centers").doc(centerId).get();
    if (!centerDoc.exists) return { success: false, error: "Center not found" };

    const { managerUids = [] } = centerDoc.data() || {};

    // Option 1: Just delete the center and leave users (standard)
    await adminDb.collection("centers").doc(centerId).delete();

    // Option 2: Clean up users - maybe mark them as 'parent' or 'unassigned'
    // For now, let's just delete the center record. 
    // In a real system, you'd handle orphaned users.

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting center:", error);
    return { success: false, error: error.message };
  }
}

export async function getGlobalStats() {
  try {
    // 1. Get Centers Count
    const centersSnap = await adminDb.collection("centers").count().get();
    
    // 2. Lấy thông tin bài học
    const lessonsSnap = await adminDb.collection("lessons").count().get();
    
    // 3. Lấy thông tin VR session (Buổi học)
    const sessionsSnap = await adminDb.collection("sessions").count().get();

    return {
      success: true,
      stats: {
        totalCenters: centersSnap.data().count,
        totalLessons: lessonsSnap.data().count,
        totalSessions: sessionsSnap.data().count
      }
    };
  } catch (error: any) {
    console.error("Error fetching global stats:", error);
    // Fallback to zeros if collections don't exist yet
    return {
      success: true,
      stats: {
        totalCenters: 0,
        totalLessons: 0,
        totalSessions: 0
      }
    };
  }
}
