import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Book } from "@/lib/books";

const book = (n: number): Book =>
  JSON.parse(readFileSync(`public/data/book${n}.json`, "utf8")) as Book;

/**
 * Original-book numbering and printed-answer-key regression only. Questions
 * came from the source-grounded earlier PR #141 and were reintroduced into
 * the current main dataset without changing existing numbered answers.
 * Presence and indexed counts do not certify the remainder of the book.
 */
const restored = [
  { book: 2, section: 3, key: { 162: "b", 181: "a", 231: "c", 290: "a" } },
  { book: 2, section: 5, key: { 59: "d", 95: "c" } },
  { book: 3, section: 3, key: { 124: "c", 125: "b", 126: "d", 127: "b", 128: "a", 129: "c", 130: "d" } },
  { book: 3, section: 5, key: { 104: "d", 105: "a", 106: "c", 107: "b", 108: "a", 109: "d", 110: "c", 116: "d", 122: "b" } },
] as const;

describe("English II and III original printed-question restoration", () => {
  it("retains every restored question's printed identity, four choices and answer letter", () => {
    let count = 0;
    for (const entry of restored) {
      const section = book(entry.book).sections.find(s => s.n === entry.section);
      expect(section, `Book ${entry.book}, section ${entry.section}`).toBeDefined();
      for (const [number, correctAnswer] of Object.entries(entry.key)) {
        const id = `${entry.book}-${entry.section}-${number}`;
        const unit = section!.units.filter(u => u.id === id);
        expect(unit, id).toHaveLength(1);
        expect(unit[0]?.kind, id).toBe("mc");
        if (unit[0]?.kind !== "mc") throw new Error("Expected source multiple-choice question");
        const q = unit[0].questions[0]!;
        expect(unit[0].questions, id).toHaveLength(1);
        expect(q.n, id).toBe(number);
        expect(q.stem.trim() || unit[0].passage.trim(), id).not.toBe("");
        expect(Object.keys(q.options).sort(), id).toEqual(["a", "b", "c", "d"]);
        for (const value of Object.values(q.options)) expect(value.trim(), id).not.toBe("");
        expect(q.answer, id).toBe(correctAnswer);
        count++;
      }
    }
    expect(count).toBe(22);
  });

  it.each([2, 3])("has contiguous 1–300 Section 3 and 1–160 Section 5 printed numbers in Book %i", (part) => {
    const data = book(part);
    for (const [sectionNumber, expectedTotal] of [[3, 300], [5, 160]] as const) {
      const section = data.sections.find(s => s.n === sectionNumber)!;
      const actual = section.units.flatMap(u => (u.kind === "mc" || u.kind === "num")
        ? u.questions.map(q => Number(q.n))
        : []);
      expect(actual.length, `${part}/${sectionNumber}`).toBe(expectedTotal);
      expect(actual.slice().sort((a, b) => a - b))
        .toEqual(Array.from({ length: expectedTotal }, (_, i) => i + 1));
    }
  });

  it("keeps the two source-corrected options populated", () => {
    const section1 = book(2).sections.find(s => s.n === 1)!;
    const text5 = section1.units.find(u => u.id === "2-1-Text5")!;
    expect(text5.kind).toBe("mc");
    if (text5.kind === "mc") {
      const question = text5.questions.find(q => q.n === "1")!;
      expect(question.answer).toBe("c");
      expect(Object.values(question.options).every(v => v.trim().length > 0)).toBe(true);
    }
    const section5 = book(3).sections.find(s => s.n === 5)!;
    const unit136 = section5.units.find(u => u.id === "3-5-136")!;
    expect(unit136.kind).toBe("mc");
    if (unit136.kind === "mc") {
      const question = unit136.questions[0]!;
      expect(question.answer).toBe("a");
      expect(Object.values(question.options).every(v => v.trim().length > 0)).toBe(true);
    }
  });
});
