import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ARMENIAN_BOOKS } from "@/lib/books";

describe("Four Armenian language study volumes", () => {
  it("lists four separately navigable volumes", () => {
    expect(ARMENIAN_BOOKS.map(book => book.id)).toEqual([41, 42, 43, 44]);
  });
  for (let part = 1; part <= 4; part++) {
    it(`validates part ${part} questions and answer keys`, () => {
      const bank = JSON.parse(readFileSync(`public/data/armenian-book${part}.json`, "utf8"));
      expect(bank.id).toBe(40 + part);
      expect(bank.sections.length).toBeGreaterThan(0);
      let count = 0;
      for (const section of bank.sections) for (const unit of section.units) {
        for (const question of unit.questions) {
          expect(question.stem.length).toBeGreaterThan(8);
          expect(Object.keys(question.options).length).toBeGreaterThanOrEqual(4);
          expect(question.options[question.answer]).toBeTruthy();
          count++;
        }
      }
      expect(count).toBeGreaterThanOrEqual(10);
    });
  }
});
