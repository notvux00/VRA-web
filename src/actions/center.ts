"use server";

import { adminAuth, adminDb, admin } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
// import { getCollectionName } from "@/lib/utils/roles"; // Unused


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

    // 4. Total Parents
    const parentsSnap = await adminDb.collection("parents")
      .where("centerId", "==", centerId)
      .count()
      .get();

    return {
      success: true,
      stats: {
        totalExpert: expertSnap.data().count,
        totalChildren: childrenSnap.data().count,
        totalParents: parentsSnap.data().count,
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
      role: "expert", 
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
    // 4. Update parent center stats (expertCount)
    await adminDb.collection("centers").doc(centerId).update({
      expertCount: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date().toISOString()
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
      // .orderBy("createdAt", "desc") // Temporarily disabled for index issues
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
export async function createChildProfile(
  centerId: string, 
  data: { 
    name: string, 
    age: number, 
    condition: string, 
    gender: string,
    height_cm?: number,
    weight_kg?: number,
    sound_sensitivity?: number,
    attention_span_min?: number,
    anxiety_triggers?: string[],
    diagnosis_notes?: string
  }
) {
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
      height_cm: data.height_cm || 0,
      weight_kg: data.weight_kg || 0,
      sound_sensitivity: data.sound_sensitivity || 3,
      attention_span_min: data.attention_span_min || 15,
      anxiety_triggers: data.anxiety_triggers || [],
      diagnosis_notes: data.diagnosis_notes || "",
      centerId: centerId,
      expertUid: "", // No Expert initially
      linkCode: linkCode,
      linkCodeExpires: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h TTL
      linkCodeUsed: false,
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessionCount: 0
    });
 
    // 3. Update parent center stats (totalChildren)
    await adminDb.collection("centers").doc(centerId).update({
      totalChildren: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/center");
    revalidatePath("/dashboard/center/children");
    return { success: true, childId, linkCode };
  } catch (error: any) {
    console.error("Error creating child profile:", error);
    return { success: false, error: error.message || "Failed to create child profile" };
  }
}

export async function assignExpertToChild(childId: string, expertUid: string) {
  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    
    await childRef.update({
      expertUid: expertUid,
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/center");
    return { success: true };
  } catch (error: any) {
    console.error("Error assigning Expert:", error);
    return { success: false, error: error.message };
  }
}

export async function unassignExpertFromChild(childId: string, expertUid: string) {
  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    
    await childRef.update({
      expertUid: "",
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
      .where("expertUid", "==", uid)
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

/**
 * Fetch all Parents belonging to this center
 */
export async function getCenterParents(centerId: string) {
  try {
    const snapshot = await adminDb.collection("parents")
      .where("centerId", "==", centerId)
      // Removing orderBy temporarily to avoid index issues. 
      // Re-add later after creating composite index in Firebase Console.
      .get();
    
    const parents = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    
    return { success: true, parents };
  } catch (error: any) {
    console.error("Error fetching center parents:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new Parent account
 */
export async function createParent(centerId: string, data: { name: string, email: string, password: string }) {
  try {
    // 1. Create User in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });

    const uid = userRecord.uid;

    // 2. Set Custom Claims
    await adminAuth.setCustomUserClaims(uid, { 
      role: "parent", 
      centerId: centerId 
    });

    // 3. Create User Document in Firestore
    await adminDb.collection("parents").doc(uid).set({
      uid: uid,
      name: data.name,
      email: data.email,
      role: "parent",
      centerId: centerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Active"
    });

    revalidatePath("/dashboard/center");
    revalidatePath("/dashboard/center/parents");
    return { success: true, uid };
  } catch (error: any) {
    console.error("Error creating Parent:", error);
    return { success: false, error: error.message || "Failed to create Parent account" };
  }
}

/**
 * Link a Parent to a Child Profile
 */
export async function linkParentToChild(childId: string, parentUid: string) {
  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    
    await childRef.update({
      parentUid: parentUid,
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/center/parents");
    revalidatePath("/dashboard/center/children");
    revalidatePath(`/dashboard/center/children/${childId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error linking Parent:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get Recent Sessions for a Center
 */
export async function getCenterSessions(centerId: string, limit: number = 10) {
  try {
    const snapshot = await adminDb.collection("sessions")
      .where("centerId", "==", centerId)
      .orderBy("startTime", "desc")
      .limit(limit)
      .get();
    
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, sessions };
  } catch (error: any) {
    console.error("Error fetching center sessions:", error);
    return { success: false, error: error.message };
  }
}
