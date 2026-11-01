import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Independent, bounded comparison with user-supplied original 2018 English
 * question-book PDFs and their printed Section 5 answer-key pages.
 * English II: printed pages 195, 202, 329.
 * English III: printed pages 172-175, 297.
 * These 34 keyed rows are not proof that the rest of the books were verified.
 */
const originals = [
  {
    volume: 2,
    ranges: [
      { page: 195, first: 57, keys: "bddbc" },
      { page: 202, first: 93, keys: "adcda" },
    ],
  },
  {
    volume: 3,
    ranges: [
      { page: 172, first: 102, keys: "bbdacb" },
      { page: 173, first: 108, keys: "adcdcb" },
      { page: 174, first: 114, keys: "bbdabb" },
      { page: 175, first: 120, keys: "dabcdc" },
    ],
  },
] as const;

describe("English originals: 34 printed Section 5 answer keys", () => {
  it("preserves every checked source number, option set and printed answer", () => {
    let checked = 0;
    for (const original of originals) {
      const book = JSON.parse(readFileSync(`public/data/book${original.volume}.json`, "utf8"));
      const section = book.sections.find((row: { n: number }) => row.n === 5);
      expect(section, `English volume ${original.volume}, section 5`).toBeDefined();
      const questions = section.units.flatMap(
        (unit: { questions?: { n: string; answer: string; options: Record<string, string>; stem: string; source_page?: number }[] }) =>
          unit.questions ?? [],
      );
      for (const range of original.ranges) {
        for (let index = 0; index < range.keys.length; index++) {
          const n = range.first + index;
          const matching = questions.filter((q: { n: string }) => q.n === String(n));
          expect(matching, `Volume ${original.volume}, page ${range.page}, question ${n}`).toHaveLength(1);
          const q = matching[0]!;
          expect(q.answer, `Printed key, volume ${original.volume}, question ${n}`).toBe(range.keys[index]);
          expect(Object.keys(q.options).sort()).toEqual(["a", "b", "c", "d"]);
          expect(q.options[q.answer]?.trim()).toBeTruthy();
          expect(q.stem.trim()).not.toBe("");
          if (q.source_page !== undefined) {
            expect(q.source_page).toBe(range.page);
          }
          checked++;
        }
      }
    }
    expect(checked).toBe(34);
  });
});
