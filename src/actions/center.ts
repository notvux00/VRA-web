"use server";

import { adminAuth, adminDb, admin } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { Expert, ChildProfile, Parent, Session } from "@/types";
import { requireRole } from "@/lib/auth-guard";


/**
 * Fetch stats for the Center Dashboard
 */
export async function getCenterStats(centerId: string) {
  await requireRole("center", "admin");
  try {
    // Chạy song song 4 queries thay vì tuần tự
    const [expertSnap, childrenSnap, childrenForSum, parentsSnap] = await Promise.all([
      // 1. Total Experts
      adminDb.collection("experts").where("centerId", "==", centerId).count().get(),
      // 2. Total Children
      adminDb.collection("child_profiles").where("centerId", "==", centerId).count().get(),
      // 3. Sum sessionCount — chỉ lấy field cần, không lấy full doc
      adminDb.collection("child_profiles")
        .where("centerId", "==", centerId)
        .select("sessionCount")
        .get(),
      // 4. Total Parents
      adminDb.collection("parents").where("centerId", "==", centerId).count().get(),
    ]);

    let totalSessions = 0;
    childrenForSum.forEach(doc => {
      totalSessions += (doc.data().sessionCount || 0);
    });

    return {
      success: true,
      stats: {
        totalExpert: expertSnap.data().count,
        totalChildren: childrenSnap.data().count,
        totalParents: parentsSnap.data().count,
        totalSessions,
      }
    };
  } catch (error: unknown) {
    console.error("Error fetching center stats:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}


/**
 * Fetch all Experts belonging to this center
 */
export async function getCenterExperts(centerId: string) {
  await requireRole("center", "admin");
  try {
    const snapshot = await adminDb.collection("experts")
      .where("centerId", "==", centerId)
      .orderBy("name")
      .limit(100)
      .get();
    
    const experts = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as Expert));
    
    return { success: true, experts };
  } catch (error: unknown) {
    console.error("Error fetching center experts:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

/**
 * Create a new Expert account
 */
export async function createExpert(centerId: string, data: { name: string, email: string, password: string, specialization?: string }) {
  await requireRole("center", "admin");
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
  } catch (error: unknown) {
    console.error("Error creating Expert:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to create Expert" };
  }
}

/**
 * Fetch all children managed by this center
 */
export async function getCenterChildren(centerId: string) {
  await requireRole("center", "admin");
  try {
    const snapshot = await adminDb.collection("child_profiles")
      .where("centerId", "==", centerId)
      .limit(200)
      .get();
    
    const children = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChildProfile));
    
    return { success: true, children };
  } catch (error: unknown) {
    console.error("Error fetching center children:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
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
  await requireRole("center", "admin");
  try {
    // 1. Generate a One-Time Link Code (6 capital letters/numbers)
    const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    // 2. Fetch all lessons to get their default phrases for child profile initialization
    const lessonsSnap = await adminDb.collection("lessons").get();
    const defaultPhrasesMap: Record<string, unknown> = {
      general: [
        "Con làm tốt lắm!",
        "Tuyệt vời!",
        "Cố lên con!"
      ]
    };
    lessonsSnap.docs.forEach((doc) => {
      const lessonData = doc.data();
      if (lessonData?.quests) {
        const questList: Array<{ quest_name: string; phrases: string[] }> = [];
        lessonData.quests.forEach((q: { title?: string; name?: string; id?: string; default_phrases?: string[] }) => {
          const questName = q.title || q.name || q.id || "";
          questList.push({
            quest_name: questName,
            phrases: q.default_phrases || []
          });
        });
        defaultPhrasesMap[doc.id] = questList;
      }
    });

    // 3. Create Child Document
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
      sessionCount: 0,
      quick_phrases: defaultPhrasesMap
    });
 
    // 3. Update parent center stats (totalChildren)
    await adminDb.collection("centers").doc(centerId).update({
      totalChildren: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/center");
    revalidatePath("/dashboard/center/children");
    return { success: true, childId, linkCode };
  } catch (error: unknown) {
    console.error("Error creating child profile:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to create child profile" };
  }
}

export async function assignExpertToChild(childId: string, expertUid: string) {
  await requireRole("center", "admin");
  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    
    await childRef.update({
      expertUid: expertUid,
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/center");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error assigning Expert:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

export async function unassignExpertFromChild(childId: string, expertUid: string) {
  await requireRole("center", "admin");
  try {
    const childRef = adminDb.collection("child_profiles").doc(childId);
    
    await childRef.update({
      expertUid: "",
      updatedAt: new Date().toISOString()
    });

    revalidatePath(`/dashboard/center/children/${childId}`);
    revalidatePath("/dashboard/center");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error unassigning Expert:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

/**
 * Toggle Status for expert (Active/Inactive)
 */
export async function toggleExpertStatus(uid: string, currentStatus: string) {
  await requireRole("center", "admin");
  try {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    await adminDb.collection("experts").doc(uid).update({
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });
    revalidatePath("/dashboard/center");
    revalidatePath(`/dashboard/center/experts/${uid}`);
    return { success: true, status: nextStatus };
  } catch (error: unknown) {
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

/**
 * Toggle Status for Child (Active/Inactive)
 */
export async function toggleChildStatus(childId: string, currentStatus: string) {
  await requireRole("center", "admin");
  try {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    await adminDb.collection("child_profiles").doc(childId).update({
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });
    revalidatePath("/dashboard/center");
    revalidatePath(`/dashboard/center/children/${childId}`);
    return { success: true, status: nextStatus };
  } catch (error: unknown) {
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

/**
 * Get Child Detail with full info
 */
export async function getChildDetail(childId: string) {
  await requireRole("center", "admin");
  try {
    const doc = await adminDb.collection("child_profiles").doc(childId).get();
    if (!doc.exists) return { success: false, error: "Child not found" };
    return { success: true, child: { id: doc.id, ...doc.data() } as ChildProfile };
  } catch (error: unknown) {
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

/**
 * Get Expert Detail with full info
 */
export async function getExpertDetail(uid: string) {
  await requireRole("center", "admin");
  try {
    const doc = await adminDb.collection("experts").doc(uid).get();
    if (!doc.exists) return { success: false, error: "Expert not found" };
    
    // Also get children assigned to this expert
    const childrenSnap = await adminDb.collection("child_profiles")
      .where("expertUid", "==", uid)
      .get();
    
    const assignedChildren = childrenSnap.docs.map(d => ({ id: d.id, ...d.data() } as ChildProfile));

    return { 
      success: true, 
      expert: { uid: doc.id, ...doc.data() } as Expert,
      assignedChildren
    };
  } catch (error: unknown) {
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

/**
 * Fetch all Parents belonging to this center
 */
export async function getCenterParents(centerId: string) {
  await requireRole("center", "admin");
  try {
    const snapshot = await adminDb.collection("parents")
      .where("centerId", "==", centerId)
      // Removing orderBy temporarily to avoid index issues. 
      // Re-add later after creating composite index in Firebase Console.
      .get();
    
    const parents = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as Parent));
    
    return { success: true, parents };
  } catch (error: unknown) {
    console.error("Error fetching center parents:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

/**
 * Create a new Parent account
 */
export async function createParent(centerId: string, data: { name: string, email: string, password: string }) {
  await requireRole("center", "admin");
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
  } catch (error: unknown) {
    console.error("Error creating Parent:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to create Parent account" };
  }
}

/**
 * Link a Parent to a Child Profile
 */
export async function linkParentToChild(childId: string, parentUid: string) {
  await requireRole("center", "admin");
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
  } catch (error: unknown) {
    console.error("Error linking Parent:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

/**
 * Get Recent Sessions for a Center
 */
export async function getCenterSessions(centerId: string, limit: number = 10) {
  await requireRole("center", "admin");
  try {
    const snapshot = await adminDb.collection("sessions")
      .where("centerId", "==", centerId)
      .orderBy("startTime", "desc")
      .limit(limit)
      .get();
    
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Session));
    
    return { success: true, sessions };
  } catch (error: unknown) {
    console.error("Error fetching center sessions:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}
