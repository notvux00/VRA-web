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

function getRoomId(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join("_");
}

export async function getConversationPartners() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    if (session.role === "parent") {
      // Tìm các chuyên gia phụ trách các trẻ của phụ huynh này
      const childrenSnapshot = await adminDb
        .collection("child_profiles")
        .where("parentUid", "==", session.uid)
        .get();

      const expertIds = Array.from(new Set(childrenSnapshot.docs.map(doc => doc.data().expertUid).filter(Boolean)));
      
      if (expertIds.length === 0) return { success: true, partners: [] };

      const expertsSnapshot = await adminDb
        .collection("experts")
        .where("__name__", "in", expertIds)
        .get();

      const partners = expertsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "Chuyên gia",
        role: "expert",
        avatar: "", 
      }));

      return { success: true, partners };
    } else if (session.role === "expert" || session.role === "therapist") {
      // Tìm các phụ huynh của các trẻ mà chuyên gia này đang phụ trách
      const childrenSnapshot = await adminDb
        .collection("child_profiles")
        .where("expertUid", "==", session.uid)
        .get();

      const parentIds = Array.from(new Set(childrenSnapshot.docs.map(doc => doc.data().parentUid).filter(Boolean)));
      if (parentIds.length === 0) return { success: true, partners: [] };

      const parentsSnapshot = await adminDb
        .collection("parents")
        .where("__name__", "in", parentIds)
        .get();

      const partners = parentsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "Phụ huynh",
        role: "parent",
        description: "Phụ huynh trẻ",
        avatar: "",
      }));

      return { success: true, partners };
    }

    return { success: false, error: "Access denied" };
  } catch (error: any) {
    console.error("Error fetching message partners:", error);
    return { success: false, error: error.message };
  }
}

export async function sendMessage(receiverId: string, content: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const roomId = getRoomId(session.uid, receiverId);
    const messageData = {
      roomId,
      participants: [session.uid, receiverId],
      senderId: session.uid,
      receiverId,
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

export async function getMessages(partnerId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const roomId = getRoomId(session.uid, partnerId);
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
    // If getting index error or similar, fallback to old method for safety
    console.error("Error fetching messages via RoomId:", error);
    
    // Fallback logic
    const sentSnapshot = await adminDb
      .collection("messages")
      .where("senderId", "==", session.uid)
      .where("receiverId", "==", partnerId)
      .get();

    const receivedSnapshot = await adminDb
      .collection("messages")
      .where("senderId", "==", partnerId)
      .where("receiverId", "==", session.uid)
      .get();

    const messages = [
      ...sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return { success: true, messages };
  }
}

export async function markMessagesAsRead(partnerId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const roomId = getRoomId(session.uid, partnerId);
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
