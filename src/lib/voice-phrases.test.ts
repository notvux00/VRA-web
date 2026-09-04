import { describe, expect, it } from "vitest";
import { dedupePhrases, normalizePhrase, resolveEffectivePhrases } from "@/lib/voice-phrases";
import type { LessonVoiceQuestV2 } from "@/types/voice-phrases";

const quests: LessonVoiceQuestV2[] = [
  { binding_id: "q.one", goal: "Ask one", default_phrases: ["A", "B"] },
];

describe("voice phrase resolver", () => {
  it("trims and rejects empty or oversized phrases", () => {
    expect(normalizePhrase("  hello  ")).toBe("hello");
    expect(normalizePhrase("   ")).toBeNull();
    expect(normalizePhrase("x".repeat(241))).toBeNull();
  });

  it("deduplicates case-insensitively while preserving first order", () => {
    expect(dedupePhrases(["A", " a ", "B", "", null])).toEqual(["A", "B"]);
  });

  it("merges defaults before additions", () => {
    expect(resolveEffectivePhrases(quests, [{ binding_id: "q.one", phrases: ["B", "C"] }])[0].phrases)
      .toEqual(["A", "B", "C"]);
  });

  it("rejects unknown and duplicate bindings", () => {
    expect(() => resolveEffectivePhrases(quests, [{ binding_id: "missing", phrases: ["X"] }])).toThrow("unknown_binding");
    expect(() => resolveEffectivePhrases(quests, [
      { binding_id: "q.one", phrases: [] },
      { binding_id: "q.one", phrases: [] },
    ])).toThrow("duplicate_addition_binding");
  });

  it("rejects duplicate lesson bindings and addition limits", () => {
    expect(() => resolveEffectivePhrases([...quests, quests[0]], [])).toThrow("duplicate_or_missing_binding");
    expect(() => resolveEffectivePhrases(quests, [{ binding_id: "q.one", phrases: Array.from({ length: 51 }, (_, i) => String(i)) }]))
      .toThrow("addition_limit");
  });
});
