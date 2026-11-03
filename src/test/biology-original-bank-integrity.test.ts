import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  pageForBiologyQuestion, validateBiologyOriginalIndex,
  type BiologyOriginalChapter, type BiologyVolume,
} from "@/lib/biology-source";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));

describe("Biology III/IV original-book text and source-answer integrity", () => {
  for (const [volume, expected] of [[3, 911], [4, 777]] as const) {
    it(`book ${volume}: validates every published stem, printed key, source page and distinct ID`, () => {
      const book = read(`public/data/bio-book${volume}.json`);
      const original = validateBiologyOriginalIndex(read(`public/data/biology-original-volume${volume}-index.json`), volume as BiologyVolume);
      const coverage = read(`public/data/biology-volume${volume}-coverage.json`);
      expect(book.id).toBe(30 + volume);
      expect(book.source.kind).toBe("source-transcription");
      expect(book.source.complete).toBe(false);
      expect(book.source.sha256).toBe(original.sourceSha256);
      expect(coverage.sourceSha256).toBe(original.sourceSha256);
      expect(book.sections.length).toBeGreaterThanOrEqual(5);

      let count = 0;
      const seen = new Set<string>();
      for (const section of book.sections) {
        const source: BiologyOriginalChapter = original.chapters.find(ch => ch.id === section.n)!;
        expect(source).toBeDefined();
        let sectionCount = 0;
        for (const unit of section.units) {
          const questionNumber = Number(unit.kind === "mc" ? unit.questions[0].n : unit.label);
          const identity = `${section.n}:${questionNumber}`;
          expect(seen.has(identity), `Duplicate printed ID ${identity}`).toBe(false);
          seen.add(identity);
          expect(Number.isInteger(questionNumber), identity).toBe(true);
          expect(questionNumber).toBeGreaterThanOrEqual(1);
          expect(questionNumber).toBeLessThanOrEqual(source.questionCount);
          expect(["mc", "num", "set", "seq", "match"]).toContain(unit.kind);
          expect(unit.sourcePage, identity).toBe(pageForBiologyQuestion(source, questionNumber));
          if (unit.kind === "mc") {
            expect(unit.questions).toHaveLength(1);
            const question = unit.questions[0];
            expect(questionNumber).toBeLessThanOrEqual(source.choiceKeys.length);
            expect(question.stem?.trim().length, identity).toBeGreaterThan(8);
            expect(Object.keys(question.options ?? {}).sort()).toEqual(["1", "2", "3", "4"]);
            expect(Object.values(question.options).every(value => typeof value === "string" && value.trim().length > 0), identity).toBe(true);
            expect(question.answer, identity).toBe(source.choiceKeys[questionNumber - 1]);
          } else if (unit.kind === "num") {
            expect(unit.questions.length).toBeGreaterThan(0);
            expect(unit.questions.every((q: { stem: string; answer: string }) =>
              q.stem.trim().length > 0 && q.answer.trim().length > 0), identity).toBe(true);
          } else {
            expect(unit.passage?.trim().length, identity).toBeGreaterThan(0);
            expect(unit.kind === "match" ? Object.keys(unit.answer).length > 0 : Array.isArray(unit.answer), identity).toBe(true);
          }
          sectionCount++;
          count++;
        }
        expect(sectionCount).toBe(coverage.chapters.find(c => c.id === section.n).imported);
        const excluded = new Set(coverage.chapters.find(c => c.id === section.n).excluded.map(x => x.n));
        for (const identity of seen) {
          const [ch, n] = identity.split(":").map(Number);
          if (ch === section.n) expect(excluded.has(n), identity).toBe(false);
        }
      }
      expect(count).toBeGreaterThanOrEqual(expected);
      expect(coverage.importedQuestions).toBe(count);
    });
  }
});
