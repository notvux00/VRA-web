"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export interface Schedule {
  id?: string;
  childId: string;
  expertUid: string;
  lessonId: string;
  dayOfWeek: number;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getSchedules(childId: string): Promise<{ success: boolean; schedules?: Schedule[]; error?: string }> {
  try {
    const snapshot = await adminDb
      .collection("schedules")
      .where("childId", "==", childId)
      .get();

    const schedules: Schedule[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Schedule[];

    return { success: true, schedules };
  } catch (error: any) {
    console.error("Error fetching schedules:", error);
    return { success: false, error: error.message };
  }
}

export async function createSchedule(data: Omit<Schedule, "id" | "createdAt" | "updatedAt">): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = await adminDb.collection("schedules").add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/dashboard/expert/schedule");
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error creating schedule:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSchedule(id: string, data: Partial<Schedule>): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection("schedules").doc(id).update({
      ...data,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/dashboard/expert/schedule");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating schedule:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSchedule(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection("schedules").doc(id).delete();
    
    revalidatePath("/dashboard/expert/schedule");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting schedule:", error);
    return { success: false, error: error.message };
  }
}
