"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb, admin } from "@/lib/firebase/admin";
import { resolveEffectivePhrases } from "@/lib/voice-phrases";
import type {
  ChildGeneralPhraseSetV2,
  ChildLessonPhraseSetV2,
  LessonVoiceQuestV2,
  QuestPhraseAdditionsV2,
  SaveChildGeneralPhraseSetV2,
  SaveChildLessonPhraseSetV2,
} from "@/types/voice-phrases";

async function getExpertSession() {
  const value = (await cookies()).get("session")?.value;
  if (!value) return null;
  try {
    return await adminAuth.verifySessionCookie(value);
  } catch {
    return null;
  }
}

async function assertChildAccess(childId: string) {
  const session = await getExpertSession();
  if (!session) throw new Error("Unauthorized");
  const child = await adminDb.collection("child_profiles").doc(childId).get();
  if (!child.exists) throw new Error("Child profile not found");
  const data = child.data();
  if (data?.expertUid !== session.uid && !data?.expertUids?.includes(session.uid)) {
    throw new Error("Unauthorized: You are not assigned to this child");
  }
  return session;
}

function emptyLessonSet(childId: string, lessonId: string): ChildLessonPhraseSetV2 {
  return { schema_version: 2, scope: "lesson", child_id: childId, lesson_id: lessonId, revision: 0, quest_additions: [] };
}

function emptyGeneralSet(childId: string): ChildGeneralPhraseSetV2 {
  return { schema_version: 2, scope: "general", child_id: childId, revision: 0, phrases: [] };
}

export async function getChildPhraseSetsV2(childId: string, lessonId: string) {
  try {
    await assertChildAccess(childId);
    const collection = adminDb.collection("child_phrase_sets");
    const [lessonSnap, generalSnap] = await Promise.all([
      collection.doc(`${childId}__${lessonId}`).get(),
      collection.doc(`${childId}__general`).get(),
    ]);
    const lesson = lessonSnap.exists ? lessonSnap.data() as Partial<ChildLessonPhraseSetV2> : emptyLessonSet(childId, lessonId);
    const general = generalSnap.exists ? generalSnap.data() as Partial<ChildGeneralPhraseSetV2> : emptyGeneralSet(childId);
    return {
      success: true as const,
      lesson: { ...emptyLessonSet(childId, lessonId), ...lesson, quest_additions: lesson.quest_additions || [] },
      general: { ...emptyGeneralSet(childId), ...general, phrases: general.phrases || [] },
    };
  } catch (error: unknown) {
    return { success: false as const, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function saveChildLessonPhraseSetV2(input: SaveChildLessonPhraseSetV2) {
  try {
    const session = await assertChildAccess(input.childId);
    resolveEffectivePhrases(input.lessonQuests, input.questAdditions);
    const ref = adminDb.collection("child_phrase_sets").doc(`${input.childId}__${input.lessonId}`);
    const revision = await adminDb.runTransaction(async (transaction) => {
      const current = await transaction.get(ref);
      const currentRevision = current.exists && typeof current.data()?.revision === "number" ? current.data()?.revision as number : 0;
      if (currentRevision !== input.expectedRevision) throw new Error("revision_conflict");
      const nextRevision = currentRevision + 1;
      transaction.set(ref, {
        schema_version: 2,
        scope: "lesson",
        child_id: input.childId,
        lesson_id: input.lessonId,
        revision: nextRevision,
        quest_additions: input.questAdditions,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_by: session.uid,
      });
      return nextRevision;
    });
    return { success: true as const, revision };
  } catch (error: unknown) {
    return { success: false as const, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function saveChildGeneralPhraseSetV2(input: SaveChildGeneralPhraseSetV2) {
  try {
    const session = await assertChildAccess(input.childId);
    const phrases = input.phrases.map((value) => value.trim()).filter(Boolean);
    const ref = adminDb.collection("child_phrase_sets").doc(`${input.childId}__general`);
    const revision = await adminDb.runTransaction(async (transaction) => {
      const current = await transaction.get(ref);
      const currentRevision = current.exists && typeof current.data()?.revision === "number" ? current.data()?.revision as number : 0;
      if (currentRevision !== input.expectedRevision) throw new Error("revision_conflict");
      const nextRevision = currentRevision + 1;
      transaction.set(ref, {
        schema_version: 2,
        scope: "general",
        child_id: input.childId,
        revision: nextRevision,
        phrases,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_by: session.uid,
      });
      return nextRevision;
    });
    return { success: true as const, revision };
  } catch (error: unknown) {
    return { success: false as const, error: error instanceof Error ? error.message : String(error) };
  }
}

export type { QuestPhraseAdditionsV2, LessonVoiceQuestV2 };
