import { describe, expect, it } from "vitest";
import { englishTokens, translationKey } from "@/lib/translation";
import { selectLevelQuestions, ENGLISH_LEVELS, LEVEL_TEST_QUESTIONS } from "@/lib/levelTests";

describe("English learning translations", () => {
  it("preserves English words, contractions, punctuation and Armenian content", () => {
    const text = "I don't know. Հայերեն, well-known!";
    expect(englishTokens(text).join("")).toBe(text);
    expect(englishTokens(text)).toContain("don't");
    expect(englishTokens(text)).toContain("well-known");
  });
  it("does not share cached translations between word senses or full passages", async () => {
    const word = { text: "bank", kind: "word" as const, context: "river bank" };
    expect(await translationKey(word)).not.toBe(await translationKey({ ...word, context: "bank account" }));
    expect(await translationKey(word)).not.toBe(await translationKey({ ...word, kind: "passage" }));
    expect(await translationKey(word)).toBe(await translationKey(word));
  });
});

describe("configurable English level tests", () => {
  it.each(ENGLISH_LEVELS.map(level => level.id))("%s uses the requested count without duplicates or reordering", level => {
    const bank = LEVEL_TEST_QUESTIONS[level] ?? [];
    for (const count of [1, 4, 8]) {
      const selected = selectLevelQuestions(level, count);
      expect(selected).toHaveLength(count);
      expect(new Set(selected.map(q => q.id)).size).toBe(count);
      expect(selected).toEqual(bank.slice(0, count));
    }
  });
  it("rejects counts outside the available question bank", () => {
    expect(() => selectLevelQuestions("a1", 9)).toThrow();
    expect(() => selectLevelQuestions("a1", 0)).toThrow();
    expect(() => selectLevelQuestions("a1", 1.5)).toThrow();
  });
});