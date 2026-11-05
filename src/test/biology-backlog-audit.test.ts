import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  pageForBiologyQuestion,
  validateBiologyOriginalIndex,
  type BiologyVolume,
} from "@/lib/biology-source";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const summary = read("public/data/biology-backlog-summary.json");

describe("Biology III/IV backlog: every original printed question is accounted for", () => {
  it("has a metadata-only queue and never redistributes original book pages or question wording", () => {
    expect(summary.schemaVersion).toBe(1);
    expect(summary.books).toHaveLength(2);
    const text = JSON.stringify(summary);
    expect(text).not.toContain('"stem":');
    expect(text).not.toContain('"passage":');
    expect(text).not.toContain('"options":');
  });

  for (const volume of [3, 4] as BiologyVolume[]) {
    it(`volume ${volume}: partitions every numbered question between imported and pending exactly once`, () => {
      const book = read(`public/data/bio-book${volume}.json`);
      const coverage = read(`public/data/biology-volume${volume}-coverage.json`);
      const index = validateBiologyOriginalIndex(
        read(`public/data/biology-original-volume${volume}-index.json`), volume,
      );
      const pendingBook = read("public/data/biology-pending-books.json")
        .books.find((entry: { part: number }) => entry.part === volume);
      const board = summary.books.find((entry: { volume: number }) => entry.volume === volume);
      expect(board).toBeDefined();
      expect(coverage.chapters).toHaveLength(6);
      expect(book.source.kind).toBe("source-transcription");
      expect(book.source.complete).toBe(false);
      expect(book.source.sha256).toBe(index.sourceSha256);
      expect(coverage.sourceSha256).toBe(index.sourceSha256);
      expect(pendingBook.sourceIndexedQuestions).toBe(coverage.indexedQuestions);
      expect(pendingBook.transcribedQuestions).toBe(coverage.importedQuestions);\n      // Adapted practice exercises are separate from original source transcriptions.\n      expect(pendingBook.sourceAlignedAdaptedQuestions ?? 0).toBeGreaterThanOrEqual(0);
      expect(pendingBook.remainingQuestions).toBe(coverage.indexedQuestions - coverage.importedQuestions);
      expect(board.sourceSha256).toBe(index.sourceSha256);
      const totalReasons: Record<string, number> = {};
      let indexedTotal = 0;
      let importedTotal = 0;
      let pendingTotal = 0;
      for (const ch of index.chapters) {
        const recorded = coverage.chapters.find((row: { id: number }) => row.id === ch.id);
        const boardChapter = board.chapters.find((row: { chapter: number }) => row.chapter === ch.id);
        expect(recorded, `missing coverage chapter ${ch.id}`).toBeDefined();
        expect(boardChapter).toBeDefined();
        const importedUnits = book.sections.find((s: { n: number }) => s.n === ch.id)?.units ?? [];
        expect(importedUnits.length, `book ${volume} section ${ch.id}`).toBe(recorded.imported);
        const present = new Set<number>();
        for (const unit of importedUnits) {
          expect(unit.kind).toBe("mc");
          expect(unit.questions).toHaveLength(1);
          const n = Number(unit.questions[0].n);
          expect(Number.isInteger(n) && n >= 1 && n <= ch.questionCount).toBe(true);
          expect(present.has(n), `duplicate imported ${volume}:${ch.id}:${n}`).toBe(false);
          present.add(n);
        }
        const missing = new Set<number>();
        const reasons: Record<string, number> = {};
        for (const item of recorded.excluded) {
          expect(Number.isInteger(item.n) && item.n >= 1 && item.n <= ch.questionCount).toBe(true);
          expect(present.has(item.n), `question both imported and pending: ${volume}:${ch.id}:${item.n}`).toBe(false);
          expect(missing.has(item.n), `duplicate pending ${volume}:${ch.id}:${item.n}`).toBe(false);
          missing.add(item.n);
          expect(["answer-type-pending", "figure-review", "formula-review", "encoding-review", "incomplete-text"]).toContain(item.reason);
          if (item.page !== undefined) {
            expect(item.page, `book ${volume} section ${ch.id} question ${item.n}`)
              .toBe(pageForBiologyQuestion(ch, item.n));
          }
          reasons[item.reason] = (reasons[item.reason] ?? 0) + 1;
          totalReasons[item.reason] = (totalReasons[item.reason] ?? 0) + 1;
        }
        expect(present.size + missing.size).toBe(ch.questionCount);
        for (let n = 1; n <= ch.questionCount; n++) {
          expect(present.has(n) || missing.has(n), `unaccounted: ${volume}:${ch.id}:${n}`).toBe(true);
        }
        expect(boardChapter.indexed).toBe(ch.questionCount);
        expect(boardChapter.imported).toBe(present.size);
        expect(boardChapter.pending).toBe(missing.size);
        expect(boardChapter.byReason).toEqual(reasons);
        indexedTotal += ch.questionCount;
        importedTotal += present.size;
        pendingTotal += missing.size;
      }
      expect(board.byReason).toEqual(totalReasons);
      expect(indexedTotal).toBe(coverage.indexedQuestions);
      expect(importedTotal).toBe(coverage.importedQuestions);
      expect(pendingTotal).toBe(indexedTotal - importedTotal);
      expect(board.indexed).toBe(indexedTotal);
      expect(board.imported).toBe(importedTotal);
      expect(board.pending).toBe(pendingTotal);
    });
  }

  it("keeps existing student routes stable: Biology stays Biology, original links stay compatible", () => {
    const route = readFileSync("src/routes/biology.tsx", "utf8");
    const bookPage = readFileSync("src/routes/book.$bookId.tsx", "utf8");
    const original = readFileSync("src/routes/biology_.original.tsx", "utf8");
    expect(route).toContain('createFileRoute("/biology")');
    expect(route).toContain("initialBook={book} initialSection={section}");
    expect(bookPage).toContain('to="/biology" search={{ book: id, section: s.n }}');
    expect(bookPage).toContain('to="/biology" search={{ book: id }}');
    expect(original).toContain('createFileRoute("/biology_/original")');
    expect(original).toContain('search.volume === 4 ? "34" : "33"');
  });

  it("keeps the unsupported sixth chapter out of auto-graded four-choice exams", () => {
    for (const volume of [3, 4] as const) {
      const book = read(`public/data/bio-book${volume}.json`);
      expect(book.sections.some((section: { n: number }) => section.n === 6)).toBe(false);
      const data = summary.books.find((entry: { volume: number }) => entry.volume === volume);
      const sixth = data.chapters.find((entry: { chapter: number }) => entry.chapter === 6);
      expect(sixth.imported).toBe(0);
      expect(sixth.pending).toBeGreaterThan(0);
      expect(sixth.byReason["answer-type-pending"]).toBe(sixth.pending);
    }
  });
});
