"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb, admin } from "@/lib/firebase/admin";
import { canonicalVoiceQuests, normalizeAdditions, validateAdditions } from "@/lib/voice-phrases";
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
    const canonical = await adminDb.collection("lessons").doc(lessonId).get();
    const quests = canonicalVoiceQuests(canonical.data());
    const lesson = readLessonSet(lessonSnap.data(), childId, lessonId);
    const general = readGeneralSet(generalSnap.data(), childId);
    return { success: true as const, lesson, general, quests };

  } catch (error: unknown) {
    return { success: false as const, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function saveChildLessonPhraseSetV2(input: SaveChildLessonPhraseSetV2) {
  try {
    const session = await assertChildAccess(input.childId);
    assertRevision(input.expectedRevision);
    const ref = adminDb.collection("child_phrase_sets").doc(`${input.childId}__${input.lessonId}`);
    const revision = await adminDb.runTransaction(async (transaction) => {
      const child = await transaction.get(adminDb.collection("child_profiles").doc(input.childId));
      assertAssigned(child.data(), session.uid);
      const canonical = await transaction.get(adminDb.collection("lessons").doc(input.lessonId));
      const quests = canonicalVoiceQuests(canonical.data());
      validateAdditions(quests, input.questAdditions);
      const questAdditions = input.questAdditions.map(entry => {
        const defaults = new Set(quests.find(quest => quest.binding_id === entry.binding_id)!.default_phrases.map(value => value.toLowerCase()));
        return { binding_id: entry.binding_id, phrases: normalizeAdditions(entry.phrases).filter(value => !defaults.has(value.toLowerCase())) };
      });
      const current = await transaction.get(ref);
      const currentRevision = readLessonSet(current.data(), input.childId, input.lessonId).revision;
      if (currentRevision !== input.expectedRevision) throw new Error("revision_conflict");
      const nextRevision = currentRevision + 1;
      transaction.set(ref, {
        schema_version: 2,
        scope: "lesson",
        child_id: input.childId,
        lesson_id: input.lessonId,
        revision: nextRevision,
        quest_additions: questAdditions,
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
    assertRevision(input.expectedRevision);
    const phrases = normalizeAdditions(input.phrases);
    const ref = adminDb.collection("child_phrase_sets").doc(`${input.childId}__general`);
    const revision = await adminDb.runTransaction(async (transaction) => {
      const child = await transaction.get(adminDb.collection("child_profiles").doc(input.childId));
      assertAssigned(child.data(), session.uid);
      const current = await transaction.get(ref);
      const currentRevision = readGeneralSet(current.data(), input.childId).revision;
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


function assertRevision(value: unknown): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error("invalid_revision");
}

function assertAssigned(child: FirebaseFirestore.DocumentData | undefined, uid: string) {
  if (!child || (child.expertUid !== uid && (!Array.isArray(child.expertUids) || !child.expertUids.includes(uid)))) throw new Error("Unauthorized: You are not assigned to this child");
}

function readLessonSet(data: FirebaseFirestore.DocumentData | undefined, childId: string, lessonId: string): ChildLessonPhraseSetV2 {
  if (!data) return emptyLessonSet(childId, lessonId);
  if (data.schema_version !== 2 || data.scope !== "lesson" || data.child_id !== childId || data.lesson_id !== lessonId || !Array.isArray(data.quest_additions)) throw new Error("invalid_child_phrase_set");
  assertRevision(data.revision);
  const seen = new Set<string>();
  const quest_additions = data.quest_additions.map((entry: QuestPhraseAdditionsV2) => {
    if (!entry || typeof entry.binding_id !== "string" || !entry.binding_id.trim() || seen.has(entry.binding_id)) throw new Error("duplicate_or_missing_binding");
    seen.add(entry.binding_id);
    return { binding_id: entry.binding_id, phrases: normalizeAdditions(entry.phrases) };
  });
  return { ...emptyLessonSet(childId, lessonId), revision: data.revision, quest_additions };
}

function readGeneralSet(data: FirebaseFirestore.DocumentData | undefined, childId: string): ChildGeneralPhraseSetV2 {
  if (!data) return emptyGeneralSet(childId);
  if (data.schema_version !== 2 || data.scope !== "general" || data.child_id !== childId) throw new Error("invalid_general_phrase_set");
  assertRevision(data.revision);
  return { ...emptyGeneralSet(childId), revision: data.revision, phrases: normalizeAdditions(data.phrases) };
}
