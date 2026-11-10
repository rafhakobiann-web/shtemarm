import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mergeBiologyExtended } from "@/lib/biology-extended";
import type { Book } from "@/lib/books";

const load = (name: string) =>
  JSON.parse(readFileSync(`public/data/${name}.json`, "utf8"));
const countQuestions = (book: Book) =>
  book.sections.reduce((count, section) => count +
    section.units.reduce((n, unit) => n + (unit.kind === "mc" || unit.kind === "num" ? unit.questions.length : 1), 0), 0);

describe("integrated question banks from all subjects", () => {
  it("retains the three English original books and 22 restored questions", () => {
    expect([1, 2, 3].map(n => countQuestions(load(`book${n}`)))).toEqual([1601, 1515, 1297]);
    const ii = load("book2") as Book;
    const iii = load("book3") as Book;
    expect(ii.sections.some(s => s.units.some(u => u.id === "2-3-162"))).toBe(true);
    expect(iii.sections.some(s => s.units.some(u => u.id === "3-3-124"))).toBe(true);
  });

  it("preserves History I while integrating unique source-restored records", () => {
    const books = [1, 2, 3].map(n => load(`history-book${n}`) as Book);
    expect(books).toHaveLength(3);
    expect(countQuestions(books[0])).toBe(1901);
    expect(countQuestions(books[1])).toBe(1187);
    expect(countQuestions(books[2])).toBe(605);
  });

  it("merges all 3525 original Biology III/IV task IDs", () => {
    for (const { volume, total, perSection } of [
      { volume: 3, total: 1837, perSection: [305, 310, 347, 337, 166, 372] },
      { volume: 4, total: 1688, perSection: [232, 300, 301, 338, 214, 303] },
    ]) {
      const bankNames = ["bio", "biology-extended-", "biology-pending-", "biology-last61-"];
      const banks = bankNames.map((name, i) =>
        load(i === 0 ? `bio-book${volume}` : `${name}book${volume}`) as Book);
      const merged = banks.slice(1).reduce((book, supplement) =>
        mergeBiologyExtended(book, supplement), banks[0]);
      const units = merged.sections.flatMap(s => s.units);
      expect(units).toHaveLength(total);
      expect(new Set(units.map(u => u.id)).size).toBe(total);
      for (const section of merged.sections) {
        const n = perSection[section.n - 1];
        expect(section.units).toHaveLength(n);
        expect(new Set(section.units.map(u => u.id))).toEqual(
          new Set(Array.from({ length: n }, (_, i) => `bio${volume}-s${section.n}-q${i + 1}`)));
      }
    }
  });

  it("does not replace original Physics and existing independent practice subjects", () => {
    expect(countQuestions(load("physics-original-book1"))).toBe(26);
    expect(countQuestions(load("physics-original-book2"))).toBe(25);
    for (const subject of ["chemistry", "geography", "russian"]) {
      expect(countQuestions(load(`original-${subject}`))).toBe(12);
    }
  });
});
