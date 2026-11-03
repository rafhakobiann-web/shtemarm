import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

const route = readFileSync("src/routes/book.$bookId.tsx", "utf8");
const core = JSON.parse(readFileSync("public/data/bio-book4.json", "utf8"));
const extra = JSON.parse(readFileSync("public/data/biology-extended-book4.json", "utf8"));
const coverage = JSON.parse(readFileSync("public/data/biology-extended-coverage.json", "utf8"));

describe("Biology IV native study without student PDF uploads", () => {
  it("uses the existing book, study and exam routes instead of a PDF upload panel", () => {
    expect(route).toContain('id === 34 && book?.sections.some(');
    expect(route).toContain('to="/study/$bookId/$sectionId"');
    expect(route).toContain('search={{ mode: "classic" }}');
    expect(route).toContain('to="/biology" search={{ book: id }}');
    expect(route).not.toMatch(/BiologySourcePractice568|sourcePracticeOpen|<input[^>]*type="file"/);
    expect(existsSync("src/components/BiologySourcePractice568.tsx")).toBe(false);
    expect(existsSync("public/data/biology-source-practice-568.json")).toBe(false);
  });

  it("has native, answerable tasks in the existing biology IV data bank", () => {
    const units = [...core.sections, ...extra.sections].flatMap(section => section.units);
    const baseUnits = core.sections.flatMap(section => section.units);
    const supplementalUnits = extra.sections.flatMap(section => section.units);
    const b4 = coverage.books.find(row => row.volume === 4);
    expect(baseUnits.length).toBe(b4.baseTasks);
    expect(supplementalUnits.length).toBe(b4.additionalTasks);
    expect(units.length).toBe(b4.totalPlayableTasks);
    expect(units.length).toBe(1035);
    expect([...new Set(units.map(unit => unit.id))].length).toBe(units.length);
    for (const unit of units) {
      expect(["mc", "num", "set", "seq", "match"]).toContain(unit.kind);
      if (unit.kind === "mc" || unit.kind === "num") {
        expect(unit.questions.length).toBeGreaterThan(0);
      } else {
        expect(unit.answer).toBeDefined();
      }
    }
  });

  it("does not claim the original 568 source references are graded or complete", () => {
    expect(coverage.books.find(row => row.volume === 4).remainingTasks).toBe(653);
    expect(coverage.books.reduce((n,book) => n + book.remainingTasks, 0)).toBe(1268);
    expect(route).toContain("Մնացած առաջադրանքները կավելանան միայն լրացուցիչ ստուգվելուց հետո։");
  });
});
