import { describe, expect, it } from "vitest";
import { englishTokens, translationKey } from "@/lib/translation";
import { selectLevelQuestions, selectPlacementQuestions, ENGLISH_LEVELS, LEVEL_TEST_QUESTIONS, LEVEL_TEST_LENGTH, PLACEMENT_TEST_LENGTH } from "@/lib/levelTests";

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

describe("fixed English CEFR placement and level tests", () => {
  it("always uses 15 questions for a level without duplicate ids", () => {
    for (const level of ENGLISH_LEVELS) {
      const bank = LEVEL_TEST_QUESTIONS[level.id] ?? [];
      expect(bank).toHaveLength(20);
      const selected = selectLevelQuestions(level.id);
      expect(selected).toHaveLength(LEVEL_TEST_LENGTH);
      expect(LEVEL_TEST_LENGTH).toBe(15);
      expect(new Set(selected.map(q => q.id)).size).toBe(selected.length);
      expect(selected.every(q => bank.includes(q))).toBe(true);
    }
  });
  it("balances 25 placement items evenly across A1 to C1", () => {
    const questions = selectPlacementQuestions();
    expect(questions).toHaveLength(PLACEMENT_TEST_LENGTH);
    expect(PLACEMENT_TEST_LENGTH).toBe(25);
    expect(new Set(questions.map(q => q.id)).size).toBe(25);
    for (const level of ENGLISH_LEVELS) {
      expect(questions.filter(q => q.id.startsWith(level.id + "-"))).toHaveLength(5);
    }
  });
  it("supports new shuffled attempts with the same fixed length", () => {
    const first = selectLevelQuestions("b2", () => 0);
    const second = selectLevelQuestions("b2", () => 0.99);
    expect(first).toHaveLength(15);
    expect(second).toHaveLength(15);
    expect(first.map(q => q.id)).not.toEqual(second.map(q => q.id));
  });
  it("keeps complete answer keys and explanations for every authored practice item", () => {
    const all = ENGLISH_LEVELS.flatMap(level => LEVEL_TEST_QUESTIONS[level.id] ?? []);
    expect(all).toHaveLength(100);
    expect(new Set(all.map(q=>q.id)).size).toBe(all.length);
    for (const q of all) {
      expect(q.prompt.trim().length).toBeGreaterThan(10);
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThan(4);
      expect(q.explanation.trim().length).toBeGreaterThan(12);
    }
  });
});
