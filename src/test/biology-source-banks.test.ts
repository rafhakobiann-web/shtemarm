import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { BIO_BOOKS, type Book } from "@/lib/books";
import { historyBookEntries, selectHistoryUnits } from "@/lib/history";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
describe("Biology III and IV use the shared book practice pipeline", () => {
  for (const volume of [3, 4]) {
    it(`volume ${volume} makes source tasks independently selectable without a PDF`, () => {
      const book = read(`public/data/bio-book${volume}.json`) as Book;
      const coverage = read(`public/data/biology-volume${volume}-coverage.json`);
      const entries = historyBookEntries(book, 30 + volume);
      expect(BIO_BOOKS.find(b => b.id === 30 + volume)?.locked).toBe(false);
      expect(entries).toHaveLength(coverage.importedQuestions);
      expect(new Set(entries.map(e => e.unit.id)).size).toBe(entries.length);
      expect(selectHistoryUnits(entries, 70, false)).toHaveLength(70);
      expect(() => selectHistoryUnits(entries, entries.length + 1, false)).toThrow();
      expect(entries.every(e => e.unit.kind === "mc" && e.unit.questions.length === 1)).toBe(true);
    });
  }
});
