import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Entry = {
  id: string;
  kind: string;
  passage?: string;
  questions?: { n: string; stem: string; answer: string; options?: Record<string, string> }[];
  answer?: number[] | Record<string, number>;
};
type Book = { id: number; sections: { n: number; units: Entry[] }[] };
const read = <T>(path: string): T => JSON.parse(readFileSync(`public/data/${path}.json`, "utf8")) as T;
const units = (book: Book) => book.sections.flatMap((section) => section.units);
const numberOfQuestions = (book: Book) => units(book).reduce((count, unit) => count + (unit.questions?.length || 1), 0);

describe("all-subject question-bank integration (read-only)", () => {
  it("preserves the three English volumes and their 22 restored source questions", () => {
    const one = read<Book>("book1");
    const two = read<Book>("book2");
    const three = read<Book>("book3");
    expect([numberOfQuestions(one), numberOfQuestions(two), numberOfQuestions(three)])
      .toEqual([1601, 1515, 1297]);
    for (const [book, sectionNo, numbers] of [
      [two, 3, [162, 181, 231, 290]],
      [two, 5, [59, 95]],
      [three, 3, [124, 125, 126, 127, 128, 129, 130]],
      [three, 5, [104, 105, 106, 107, 108, 109, 110, 116, 122]],
    ] as const) {
      const section = book.sections.find((s) => s.n === sectionNo);
      const recorded = new Set((section?.units ?? []).flatMap((u) => u.questions?.map((q) => Number(q.n)) ?? []));
      for (const n of numbers) expect(recorded.has(n), `English section ${sectionNo} question ${n}`).toBe(true);
    }
  });

  it("keeps the existing History I bank and includes additional unambiguous original questions", () => {
    const first = read<Book>("history-book1");
    expect(numberOfQuestions(first)).toBe(1892);
    expect(first.sections).toHaveLength(8);
    expect(first.sections.some((section) => section.units.some((unit) => unit.questions?.length))).toBe(true);
  });

  for (const [volume, target, expectedParts] of [
    [3, 1837, [945, 277, 587, 28]],
    [4, 1688, [812, 223, 620, 33]],
  ] as const) {
    it(`Biology volume ${volume}: covers every numbered original exercise exactly once`, () => {
      const names = [
        `bio-book${volume}`,
        `biology-extended-book${volume}`,
        `biology-pending-book${volume}`,
        `biology-last61-book${volume}`,
      ];
      const books = names.map((name) => read<Book>(name));
      const every = books.flatMap(units);
      expect(books.map((book) => units(book).length)).toEqual(expectedParts);
      expect(every).toHaveLength(target);
      const ids = every.map((unit) => unit.id);
      expect(new Set(ids).size).toBe(target);
      const counts = volume === 3
        ? [305, 310, 347, 337, 166, 372]
        : [232, 300, 301, 338, 214, 303];
      for (let chapter = 1; chapter <= counts.length; chapter++) {
        for (let n = 1; n <= counts[chapter - 1]; n++)
          expect(ids).toContain(`bio${volume}-s${chapter}-q${n}`);
      }
      for (const unit of every) {
        if (unit.kind === "mc" || unit.kind === "num") {
          expect(unit.questions?.length, unit.id).toBeGreaterThan(0);
          for (const question of unit.questions ?? []) {
            expect(question.stem.trim(), unit.id).not.toBe("");
            expect(String(question.answer).trim(), unit.id).not.toBe("");
          }
        } else {
          expect(unit.passage?.trim(), unit.id).not.toBe("");
          expect(unit.answer, unit.id).toBeDefined();
        }
      }
    });
  }

  it("keeps the 9 syntax diagram tasks tied to the original Armenian section", () => {
    const corrections = read<{
      volume: number;
      section: number;
      items: Record<string, { answer: string; pdfPage: number; diagramOptions: Record<string, { nodes: unknown[] }> }>;
    }>("armenian-official-1-diagrams");
    expect(corrections.volume).toBe(1);
    expect(corrections.section).toBe(4);
    expect(Object.keys(corrections.items).sort()).toEqual(["89", "90", "91", "92", "93", "94", "95", "97", "98"]);
    for (const item of Object.values(corrections.items)) {
      expect(["1", "2", "3", "4"]).toContain(item.answer);
      expect(Object.values(item.diagramOptions)).toHaveLength(4);
      for (const diagram of Object.values(item.diagramOptions)) expect(diagram.nodes.length).toBeGreaterThan(0);
    }
  });
});
