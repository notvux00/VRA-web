"use server";

import { adminDb } from "@/lib/firebase/admin";

export interface QuestMetadata {
  id?: string;
  title: string;
  default_phrases: string[];
}

export interface LessonData {
  /** Document ID trên Firestore (VD: "WashingHand_1") — dùng để truyền cho VR */
  id: string;
  lesson_id: string;
  scene_name: string;
  lesson_name: string;
  level_name: string;
  lesson_index: number;
  level_index: number;
  type: string;
  level_id: string;
  description: string;
  thumbnail_url: string;
  min_age: number;
  duration_min: number;
  quests?: QuestMetadata[];
  /**
   * Mô tả kịch bản thật diễn ra trong VR (các bước, sự kiện, điều kiện hoàn thành).
   * Admin điền thủ công trên Firestore Console.
   * Được đưa vào prompt AI gợi ý để tăng độ chính xác.
   */
  scenario?: string;
}


/**
 * Fetch toàn bộ bài học từ Firestore collection "lessons".
 * Sắp xếp theo lesson_index → level_index để hiển thị đúng thứ tự.
 */
export async function getLessons(): Promise<{ success: boolean; lessons?: LessonData[]; error?: string }> {
  try {
    const snapshot = await adminDb.collection("lessons").get();

    const lessons: LessonData[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        lesson_id: d.lesson_id || "",
        scene_name: d.scene_name || "",
        lesson_name: d.lesson_name || "",
        level_name: d.level_name || "",
        lesson_index: d.lesson_index ?? 0,
        level_index: d.level_index ?? 0,
        type: d.type || "practical",
        level_id: d.level_id || "",
        description: d.description || "",
        thumbnail_url: d.thumbnail_url || "",
        min_age: d.min_age ?? 3,
        duration_min: d.duration_min ?? 15,
        quests: d.quests || [],
        scenario: d.scenario || "",
      };
    });
    // Sắp xếp trong memory (tránh yêu cầu Composite Index trên Firestore)
    lessons.sort((a, b) => a.lesson_index - b.lesson_index || a.level_index - b.level_index);

    return { success: true, lessons };
  } catch (error: any) {
    console.error("Error fetching lessons:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch a specific lesson detail by its document ID
 */
export async function getLessonDetail(lessonId: string): Promise<{ success: boolean; lesson?: LessonData; error?: string }> {
  try {
    const doc = await adminDb.collection("lessons").doc(lessonId).get();
    if (!doc.exists) {
      return { success: false, error: "Lesson not found" };
    }
    
    const d = doc.data();
    const lesson = {
      id: doc.id,
      lesson_id: d?.lesson_id || "",
      scene_name: d?.scene_name || "",
      lesson_name: d?.lesson_name || "",
      level_name: d?.level_name || "",
      lesson_index: d?.lesson_index ?? 0,
      level_index: d?.level_index ?? 0,
      type: d?.type || "practical",
      level_id: d?.level_id || "",
      description: d?.description || "",
      thumbnail_url: d?.thumbnail_url || "",
      min_age: d?.min_age ?? 3,
      duration_min: d?.duration_min ?? 15,
      quests: d?.quests || [],
      scenario: d?.scenario || "",
    };

    return { success: true, lesson };
  } catch (error: any) {
    console.error("Error fetching lesson detail:", error);
    return { success: false, error: error.message };
  }
}

