import type {
  LessonVoiceQuestV2,
  QuestPhraseAdditionsV2,
  ResolvedVoiceQuestV2,
} from "@/types/voice-phrases";

export const MAX_PHRASE_LENGTH = 240;
export const MAX_ADDITIONS_PER_BINDING = 50;

export function normalizePhrase(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const phrase = value.trim();
  if (!phrase || phrase.length > MAX_PHRASE_LENGTH) return null;
  return phrase;
}

export function dedupePhrases(values: readonly unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const phrase = normalizePhrase(value);
    if (!phrase) continue;
    const key = phrase.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(phrase);
  }
  return result;
}

export function validateAdditions(
  quests: readonly LessonVoiceQuestV2[],
  additions: readonly QuestPhraseAdditionsV2[],
): void {
  const bindings = new Set<string>();
  for (const quest of quests) {
    if (!quest.binding_id || bindings.has(quest.binding_id)) {
      throw new Error(`duplicate_or_missing_binding:${quest.binding_id || ""}`);
    }
    bindings.add(quest.binding_id);
    if (!quest.goal || !Array.isArray(quest.default_phrases)) {
      throw new Error(`invalid_lesson_quest:${quest.binding_id}`);
    }
  }

  const seenAdditionBindings = new Set<string>();
  for (const addition of additions) {
    if (!bindings.has(addition.binding_id)) {
      throw new Error(`unknown_binding:${addition.binding_id}`);
    }
    if (seenAdditionBindings.has(addition.binding_id)) {
      throw new Error(`duplicate_addition_binding:${addition.binding_id}`);
    }
    seenAdditionBindings.add(addition.binding_id);
    if (!Array.isArray(addition.phrases) || addition.phrases.length > MAX_ADDITIONS_PER_BINDING) {
      throw new Error(`addition_limit:${addition.binding_id}`);
    }
    if (addition.phrases.some((phrase) => normalizePhrase(phrase) === null)) {
      throw new Error(`invalid_phrase:${addition.binding_id}`);
    }
  }
}

export function resolveEffectivePhrases(
  quests: readonly LessonVoiceQuestV2[],
  additions: readonly QuestPhraseAdditionsV2[],
): readonly ResolvedVoiceQuestV2[] {
  validateAdditions(quests, additions);
  const additionsByBinding = new Map(additions.map((entry) => [entry.binding_id, entry.phrases]));
  return quests.map((quest) => ({
    binding_id: quest.binding_id,
    title: quest.title,
    goal: quest.goal,
    phrases: dedupePhrases([
      ...(quest.default_phrases || []),
      ...(additionsByBinding.get(quest.binding_id) || []),
    ]),
  }));
}
