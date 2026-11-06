import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Guard against presenting the three short, authored practice sets as
 * complete transcriptions of the official 2018 Armenian question books.
 * The source PDFs each have eight main sections and a separate answer key.
 */
describe("Armenian volumes II–IV provenance and completeness", () => {
  for (const volume of [2, 3, 4]) {
    it(`labels volume ${volume} as sample practice until verified`, () => {
      const book = JSON.parse(
        readFileSync(`public/data/armenian-book${volume}.json`, "utf8"),
      );
      expect(book.id).toBe(40 + volume);
      expect(book.sections.length).toBeGreaterThan(0);
      for (const section of book.sections) {
        expect(section.instr_hy).toContain("պաշտոնական շտեմարանի բառացի թվայնացում չեն");
        expect(section.units.length).toBeGreaterThan(0);
        for (const unit of section.units) {
          expect(unit.questions.length).toBeGreaterThan(0);
          for (const question of unit.questions) {
            expect(question.stem?.trim().length).toBeGreaterThan(0);
            expect(Object.keys(question.options ?? {})).toContain(String(question.answer));
          }
        }
      }
    });
  }
});
