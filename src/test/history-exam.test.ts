import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildHistoryExam, historyPool, HISTORY_SECTION_NAMES } from "@/lib/history-exam-builder";
import { unitPoints, type Book } from "@/lib/books";

const books = [1, 2, 3].map((n) =>
  JSON.parse(readFileSync(resolve(process.cwd(), `public/data/history-book${n}.json`), "utf8")) as Book,
);
const bookIds = [21, 22, 23];
const sections = HISTORY_SECTION_NAMES.map((_, i) => i + 1);

describe("configurable Armenian History exams", () => {
  it("loads all three books with eight sections each", () => {
    expect(books.map((b) => b.id)).toEqual(bookIds);
    for (const book of books) expect(book.sections.map((s) => s.n)).toEqual(sections);
  });

  it("builds exactly the requested number of independently answerable tasks", () => {
    for (const count of [1, 10, 20, 70, 80, 120, 300]) {
      const items = buildHistoryExam(books, { books: bookIds, sections, count });
      expect(items).toHaveLength(count);
      expect(new Set(items.map((q) => q.id)).size).toBe(count);
      expect(items.every((q) => unitPoints(q.unit) === 1)).toBe(true);
    }
  });

  it("only includes questions from selected books and sections", () => {
    const questions = buildHistoryExam(books, { books: [22], sections: [1, 4], count: 15 });
    expect(questions).toHaveLength(15);
    expect(questions.every((q) => q.bookId === 22 && [1, 4].includes(q.section))).toBe(true);
  });

  it("can keep original book order after randomly selecting tasks", () => {
    const pool = historyPool(books, bookIds, sections);
    const index = new Map(pool.map((q, i) => [q.id, i]));
    const selected = buildHistoryExam(books, { books: bookIds, sections, count: 70, order: "book" });
    const positions = selected.map((q) => index.get(q.id) ?? -1);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("never silently skips questions or returns a smaller test", () => {
    expect(() => buildHistoryExam(books, { books: [21], sections: [3], count: 9999 })).toThrow(/հասանելի է միայն/);
    expect(() => buildHistoryExam(books, { books: [], sections, count: 10 })).toThrow();
    expect(() => buildHistoryExam(books, { books: bookIds, sections, count: 0 })).toThrow();
  });

  it("keeps the passage and correct answer attached to each selected question", () => {
    const selected = buildHistoryExam(books, { books: bookIds, sections, count: 200 });
    for (const q of selected) {
      if (q.unit.kind === "mc") {
        const first = q.unit.questions[0];
        expect(first?.options[first.answer]).toBeTruthy();
      } else if (q.unit.kind === "set" || q.unit.kind === "seq") {
        expect(q.unit.passage.trim()).not.toBe("");
        expect(q.unit.answer.length).toBeGreaterThan(0);
      }
    }
  });
});
