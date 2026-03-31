"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { getCollectionName } from "@/lib/utils/roles";

/**
 * Fetch stats for the Center Dashboard
 */
export async function getCenterStats(centerId: string) {
  try {
    // 1. Total Experts (expert)
    const expertSnap = await adminDb.collection("experts")
      .where("centerId", "==", centerId)
      .count()
      .get();
    
    // 2. Total Children
    const childrenSnap = await adminDb.collection("child_profiles")
      .where("centerId", "==", centerId)
      .count()
      .get();
    
    // 3. Active Sessions (Placeholder until sessions are fully implemented)
    const sessionsSnap = await adminDb.collection("sessions")
      .where("centerId", "==", centerId)
      .where("status", "==", "in-progress")
      .count()
      .get();

    return {
      success: true,
      stats: {
        totalExpert: expertSnap.data().count,
        totalChildren: childrenSnap.data().count,
        activeSessions: sessionsSnap.data().count,
      }
    };
  } catch (error: any) {
    console.error("Error fetching center stats:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all Experts belonging to this center
 */
export async function getCenterExperts(centerId: string) {
  try {
    const snapshot = await adminDb.collection("experts")
      .where("centerId", "==", centerId)
      .get();
    
    const experts = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    
    return { success: true, experts };
  } catch (error: any) {
    console.error("Error fetching center experts:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new Expert account
 */
export async function createExpert(centerId: string, data: { name: string, email: string, password: string, specialization?: string }) {
  try {
    // 1. Create User in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });

    const uid = userRecord.uid;

    // 2. Set Custom Claims for Auth Security
    await adminAuth.setCustomUserClaims(uid, { 
      role: "Expert", 
      centerId: centerId 
    });

    // 3. Create User Document in Firestore
    await adminDb.collection("experts").doc(uid).set({
      uid: uid,
      name: data.name,
      email: data.email,
      role: "expert",
      centerId: centerId,
      specialization: data.specialization || "General",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Active"
    });

    revalidatePath("/dashboard/center");
    return { success: true, uid };
  } catch (error: any) {
    console.error("Error creating Expert:", error);
    return { success: false, error: error.message || "Failed to create Expert" };
  }
}

/**
 * Fetch all children managed by this center
 */
export async function getCenterChildren(centerId: string) {
  try {
    const snapshot = await adminDb.collection("child_profiles")
      .where("centerId", "==", centerId)
      .orderBy("createdAt", "desc")
      .get();
    
    const children = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, children };
  } catch (error: any) {
    console.error("Error fetching center children:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new Child Profile
 */
export async function createChildProfile(centerId: string, data: { name: string, age: number, condition: string, gender: string }) {
  try {
    // 1. Generate a One-Time Link Code (6 capital letters/numbers)
    const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 2. Create Child Document
    const childRef = adminDb.collection("child_profiles").doc();
    const childId = childRef.id;

    await childRef.set({
      id: childId,
      name: data.name,
      age: data.age,
      gender: data.gender,
      condition: data.condition,
      centerId: centerId,
      expert.ids: [], // No Experts initially
      linkCode: linkCode,
      linkCodeExpires: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h TTL
      linkCodeUsed: false,
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessionCount: 0
    });

    revalidatePath("/dashboard/center");
    return { success: true, childId, linkCode };
  } catch (error: any) {
    console.error("Error creating child profile:", error);
    return { success: false, error: error.message || "Failed to create child profile" };
  }
}

/**
 * Assign a Expert to a Child
 */
export async function assignExpertToChild(childId: string, expertUid: string) {
  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    const childDoc = await childRef.get();
    
    if (!childDoc.exists) return { success: false, error: "Child not found" };

    const currentExperts = childDoc.data()?.expertUids || [];
    
    if (currentExperts.includes(expertUid)) {
      return { success: false, error: "Chuyên gia này đã được phân công cho trẻ rồi." };
    }

    await childRef.update({
      expertUids: [...currentExperts, expertUid],
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/center");
    return { success: true };
  } catch (error: any) {
    console.error("Error assigning Expert:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Unassign a Expert from a Child
 */
export async function unassignExpertFromChild(childId: string, expertUid: string) {
  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    const childDoc = await childRef.get();
    
    if (!childDoc.exists) return { success: false, error: "Child not found" };

    const currentExperts = childDoc.data()?.expertUids || [];
    
    await childRef.update({
      expertUids: currentExperts.filter((uid: string) => uid !== expertUid),
      updatedAt: new Date().toISOString()
    });

    revalidatePath(`/dashboard/center/children/${childId}`);
    revalidatePath("/dashboard/center");
    return { success: true };
  } catch (error: any) {
    console.error("Error unassigning Expert:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle Status for expert (Active/Inactive)
 */
export async function toggleExpertStatus(uid: string, currentStatus: string) {
  try {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    await adminDb.collection("experts").doc(uid).update({
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });
    revalidatePath("/dashboard/center");
    revalidatePath(`/dashboard/center/experts/${uid}`);
    return { success: true, status: nextStatus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Toggle Status for Child (Active/Inactive)
 */
export async function toggleChildStatus(childId: string, currentStatus: string) {
  try {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    await adminDb.collection("child_profiles").doc(childId).update({
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });
    revalidatePath("/dashboard/center");
    revalidatePath(`/dashboard/center/children/${childId}`);
    return { success: true, status: nextStatus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get Child Detail with full info
 */
export async function getChildDetail(childId: string) {
  try {
    const doc = await adminDb.collection("child_profiles").doc(childId).get();
    if (!doc.exists) return { success: false, error: "Child not found" };
    return { success: true, child: { id: doc.id, ...doc.data() } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get Expert Detail with full info
 */
export async function getExpertDetail(uid: string) {
  try {
    const doc = await adminDb.collection("experts").doc(uid).get();
    if (!doc.exists) return { success: false, error: "Expert not found" };
    
    // Also get children assigned to this expert
    const childrenSnap = await adminDb.collection("child_profiles")
      .where("expert.ids", "array-contains", uid)
      .get();
    
    const assignedChildren = childrenSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return { 
      success: true, 
      expert: { uid: doc.id, ...doc.data() },
      assignedChildren
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
