import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { unitPoints, type Book } from "@/lib/books";
import { workbookEntries, makeWorkbookExam } from "@/lib/workbook-exams";

const getBook = (id: number) => JSON.parse(
  readFileSync(id === 41 ? "public/data/armenian-book1.json" : "public/data/book" + id + ".json", "utf8"),
) as Book;
const english = [1, 2, 3].map(getBook);
const armenian = [getBook(41)];

describe("unified exam builder: content and answer integrity", () => {
  it("keeps all English source IDs unique across three books", () => {
    const entries = workbookEntries(english);
    expect(entries.length).toBeGreaterThan(1500);
    expect(new Set(entries.map((e) => e.unit.id)).size).toBe(entries.length);
    const chosen = makeWorkbookExam(english, "english", "all", "custom", entries, 40, true);
    expect(chosen.units).toHaveLength(40);
    expect(new Set(chosen.units.map((u) => u.id)).size).toBe(40);
  });

  it("retains the existing English 13-section 80-point template per book", () => {
    for (const book of english) {
      const exam = makeWorkbookExam(english, "english", String(book.id), "full", [], 0, true);
      expect(exam.bookId).toBe(book.id);
      expect(exam.units.reduce((n, u) => n + unitPoints(u), 0)).toBe(80);
      expect(new Set(exam.units.map((u) => u.id)).size).toBe(exam.units.length);
    }
  });

  it("correctly splits all 96 Armenian source questions into independent selectable tasks", () => {
    const entries = workbookEntries(armenian);
    expect(entries).toHaveLength(96);
    expect(entries.every((entry) => entry.unit.kind === "mc" && entry.unit.questions.length === 1)).toBe(true);
    expect(makeWorkbookExam(armenian, "armenian", "all", "custom", entries, 20, false).units).toHaveLength(20);
    const full = makeWorkbookExam(armenian, "armenian", "all", "full", entries, 0, true);
    expect(full.bookId).toBe(41);
    expect(full.units.reduce((n, u) => n + unitPoints(u), 0)).toBe(70); // 70 practice items; official GTC maximum is 80 points with special bundles
  });

  it("rejects impossible custom counts rather than silently padding with repeats", () => {
    const pool = workbookEntries(armenian).slice(0, 3);
    expect(() => makeWorkbookExam(armenian, "armenian", "all", "custom", pool, 4, true)).toThrow();
  });
});
