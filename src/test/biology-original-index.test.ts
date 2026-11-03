import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  answerForBiologyChoice, biologyAutoGradedCount, biologyIndexedCount,
  pageForBiologyQuestion, validateBiologyOriginalIndex,
  type BiologyOriginalIndex, type BiologyVolume,
} from "@/lib/biology-source";

const read = (volume: BiologyVolume): BiologyOriginalIndex =>
  validateBiologyOriginalIndex(JSON.parse(readFileSync(
    `public/data/biology-original-volume${volume}-index.json`, "utf8"
  )), volume);

describe("Biology III and IV source-page mapping (not text transcription)", () => {
  for (const [volume, pages, total, correct, lengths] of [
    [3, 384, 1837, 945, [305, 310, 347, 337, 166, 372]],
    [4, 392, 1688, 812, [232, 300, 301, 338, 214, 303]],
  ] as const) {
    it(`volume ${volume}: locks edition, question pages and contiguous 1-of-4 keys`, () => {
      const source = read(volume);
      expect(source.totalPages).toBe(pages);
      expect(source.editionYear).toBe(2018);
      expect(source.sourceName).toBe(`kensab-${volume}.pdf`);
      expect(source.sourceSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(source.chapters.map(c => c.questionCount)).toEqual(lengths);
      expect(biologyIndexedCount(source)).toBe(total);
      expect(biologyAutoGradedCount(source)).toBe(correct);
      for (const ch of source.chapters) {
        const actualPages = Array.from({ length: ch.questionCount }, (_, i) => pageForBiologyQuestion(ch, i + 1));
        expect(actualPages[0]).toBe(ch.startPage);
        expect(actualPages.at(-1)).toBe(ch.endPage);
        expect(actualPages.every((p, i) => p >= ch.startPage && p <= ch.endPage
          && (!i || p >= actualPages[i-1]!))).toBe(true);
        for (let number = 1; number <= ch.questionCount; number++) {
          const expected = answerForBiologyChoice(ch, number);
          expect(number <= ch.choiceKeys.length ? /^[1-4]$/.test(expected ?? "") : expected === null).toBe(true);
        }
        expect(ch.answerPages[0]).toBeGreaterThan(ch.endPage);
      }
      expect(source.chapters[5]!.choiceKeys).toBe("");
    });
  }

  it("keeps the original 36 authored Biology III tasks separate from scanned originals", () => {
    const pending = JSON.parse(readFileSync("public/data/biology-pending-books.json", "utf8"));
    const p3 = pending.books.find((b: { part: number }) => b.part === 3);
    const p4 = pending.books.find((b: { part: number }) => b.part === 4);
    expect(p3.originalPracticeQuestions).toBe(36);
    expect(p3.verifiedQuestions).toBe(35);
    expect(p4.verifiedQuestions).toBe(41);
    expect(p3.sourceIndexedQuestions).toBe(1837);
    expect(p4.sourceIndexedQuestions).toBe(1688);
  });

  it("preserves source identity for exceptional original-number print layouts", () => {
    expect(read(3).chapters[4]!.manualNumberingChecks).toEqual([128]);
    expect(pageForBiologyQuestion(read(3).chapters[4]!, 128)).toBe(284);
    expect(read(4).chapters[3]!.manualNumberingChecks).toEqual([50]);
    expect(pageForBiologyQuestion(read(4).chapters[3]!, 50)).toBe(191);
  });

  it("does not silently allow invalid question numbers, volume IDs or missing page runs", () => {
    const source = read(3);
    expect(() => pageForBiologyQuestion(source.chapters[0]!, 0)).toThrow(RangeError);
    expect(() => pageForBiologyQuestion(source.chapters[0]!, 306)).toThrow(RangeError);
    expect(() => validateBiologyOriginalIndex({ ...source, volume: 4 }, 3)).toThrow();
    expect(() => validateBiologyOriginalIndex({ ...source, chapters: [] }, 3)).toThrow();
  });

  it("publishes only indexes and an optional local-PDF reader, not source scans or copied book text", () => {
    const component = readFileSync("src/components/BiologyOriginalPractice.tsx", "utf8");
    const lib = readFileSync("src/lib/biology-source.ts", "utf8");
    const route = readFileSync("src/routes/biology_.original.tsx", "utf8");
    const hub = readFileSync("src/components/BiologyWorkspace.tsx", "utf8");
    expect(route).toMatch(/createFileRoute\("\/biology_?\/original"\)/);
    expect(component).toContain("<h1");
    expect(component).toContain("verifyBiologySourcePdf");
    expect(component).not.toContain("<iframe");
    expect(component).not.toContain("<canvas");
    expect(component).toContain("recordAnswer(key, selected === answer)");
    expect(lib).toContain('crypto.subtle.digest("SHA-256"');
    expect(lib).toContain('indexedDB.open');
    expect(hub).toContain('to="/biology/original"');
  });
});
