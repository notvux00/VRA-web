"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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

function getRoomId(uid1: string, uid2: string, childId: string) {
  // If childId is missing (legacy), fallback to old roomId
  if (!childId) return [uid1, uid2].sort().join("_");
  return [uid1, uid2, childId].sort().join("_");
}

export async function getConversationPartners() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    if (session.role === "parent") {
      // Find all children of this parent
      const childrenSnapshot = await adminDb
        .collection("child_profiles")
        .where("parentUid", "==", session.uid)
        .get();

      if (childrenSnapshot.empty) return { success: true, partners: [] };

      // Map children to their experts
      const partnersList: any[] = [];
      const expertIds = Array.from(new Set(childrenSnapshot.docs.map(doc => doc.data().expertUid).filter(Boolean)));
      
      if (expertIds.length === 0) return { success: true, partners: [] };

      // Batch fetch experts for efficiency
      const expertsSnapshot = await adminDb
        .collection("experts")
        .where("__name__", "in", expertIds)
        .get();

      const expertMap = new Map();
      expertsSnapshot.docs.forEach(doc => {
        expertMap.set(doc.id, doc.data());
      });

      // Build partners list: One for each child
      childrenSnapshot.docs.forEach(doc => {
        const childData = doc.data();
        const expertData = expertMap.get(childData.expertUid);
        
        if (expertData) {
          partnersList.push({
            id: childData.expertUid,
            name: expertData.name || "Chuyên gia",
            childId: doc.id,
            childName: childData.name || "Trẻ",
            role: "expert",
            avatar: "", 
          });
        }
      });

      return { success: true, partners: partnersList };
    } else if (session.role === "expert" || session.role === "therapist") {
      // Find all children assigned to this expert
      const childrenSnapshot = await adminDb
        .collection("child_profiles")
        .where("expertUid", "==", session.uid)
        .get();

      if (childrenSnapshot.empty) return { success: true, partners: [] };

      // Map children to their parents
      const partnersList: any[] = [];
      const parentIds = Array.from(new Set(childrenSnapshot.docs.map(doc => doc.data().parentUid).filter(Boolean)));
      
      if (parentIds.length === 0) return { success: true, partners: [] };

      // Batch fetch parents
      const parentsSnapshot = await adminDb
        .collection("parents")
        .where("__name__", "in", parentIds)
        .get();

      const parentMap = new Map();
      parentsSnapshot.docs.forEach(doc => {
        parentMap.set(doc.id, doc.data());
      });

      // Build partners list: One for each child
      childrenSnapshot.docs.forEach(doc => {
        const childData = doc.data();
        const parentData = parentMap.get(childData.parentUid);
        
        if (parentData) {
          partnersList.push({
            id: childData.parentUid,
            name: parentData.name || "Phụ huynh",
            childId: doc.id,
            childName: childData.name || "Trẻ",
            role: "parent",
            avatar: "",
          });
        }
      });

      return { success: true, partners: partnersList };
    }

    return { success: false, error: "Access denied" };
  } catch (error: any) {
    console.error("Error fetching message partners:", error);
    return { success: false, error: error.message };
  }
}

export async function sendMessage(receiverId: string, content: string, childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const roomId = getRoomId(session.uid, receiverId, childId);
    const messageData = {
      roomId,
      participants: [session.uid, receiverId],
      senderId: session.uid,
      receiverId,
      childId: childId || null, // Store child context in metadata
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    await adminDb.collection("messages").add(messageData);
    
    revalidatePath("/dashboard/parent/messages");
    revalidatePath("/dashboard/expert/messages");
    return { success: true };
  } catch (error: any) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
}

export async function getMessages(partnerId: string, childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const roomId = getRoomId(session.uid, partnerId, childId);
    const messagesSnapshot = await adminDb
      .collection("messages")
      .where("roomId", "==", roomId)
      .orderBy("timestamp", "asc")
      .get();

    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, messages };
  } catch (error: any) {
    console.error("Error fetching messages via RoomId:", error);
    return { success: false, error: error.message };
  }
}

export async function markMessagesAsRead(partnerId: string, childId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const roomId = getRoomId(session.uid, partnerId, childId);
    const unreadSnapshot = await adminDb
      .collection("messages")
      .where("roomId", "==", roomId)
      .where("receiverId", "==", session.uid)
      .where("read", "==", false)
      .get();

    if (unreadSnapshot.empty) return { success: true };

    const batch = adminDb.batch();
    unreadSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
    revalidatePath("/dashboard/parent/messages");
    revalidatePath("/dashboard/expert/messages");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    return { success: false, error: error.message };
  }
}
