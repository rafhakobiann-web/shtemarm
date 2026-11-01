import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  questionAnswerKey,
  sectionAnswerIds,
  type Book,
  type Section,
} from "@/lib/books";

describe("book section progress matches recorded study answers", () => {
  it("counts identical printed question numbers separately, without changing their text", () => {
    const section: Section = {
      n: 1,
      instr_en: "",
      instr_hy: "",
      units: [{
        id: "source-unit",
        label: "1",
        kind: "mc",
        passage: "Original passage",
        questions: [
          { n: "1", stem: "First", options: { a: "A", b: "B" }, answer: "a" },
          { n: "1", stem: "Second", options: { a: "A", b: "B" }, answer: "b" },
          { n: "2", stem: "Third", options: { a: "A", b: "B" }, answer: "a" },
        ],
      }],
    };
    const ids = sectionAnswerIds(section);
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
    expect(ids[2]).toBe("source-unit:2");
    const recorded = { [ids[0]!]: 1 as const, [ids[1]!]: 0 as const };
    expect(ids.filter((key) => key in recorded)).toHaveLength(2);
    expect(ids.filter((key) => recorded[key as keyof typeof recorded] === 1)).toHaveLength(1);
    expect(section.units[0].kind === "mc" && section.units[0].questions.map((q) => q.n))
      .toEqual(["1", "1", "2"]);
  });

  it("retains stable legacy IDs for uniquely numbered and non-question units", () => {
    const section: Section = {
      n: 2, instr_en: "", instr_hy: "", units: [
        { id: "math-2", kind: "num", label: "2", passage: "", questions: [
          { n: "7", stem: "Find x", answer: "2" },
        ] },
        { id: "set-3", kind: "set", label: "3", passage: "", answer: [1, 3] },
      ],
    };
    expect(sectionAnswerIds(section)).toEqual(["math-2:7", "set-3"]);
  });

  it("supports the duplicate-number units already imported in English book 2", () => {
    const book = JSON.parse(readFileSync("public/data/book2.json", "utf8")) as Book;
    let duplicateGroups = 0;
    for (const section of book.sections) {
      const ids = sectionAnswerIds(section);
      const total = section.units.reduce((sum, unit) =>
        sum + (unit.kind === "mc" || unit.kind === "num" ? unit.questions.length : 1), 0);
      expect(ids.length, `Section ${section.n} count`).toBe(total);
      for (const unit of section.units) {
        if (unit.kind !== "mc" && unit.kind !== "num") continue;
        if (new Set(unit.questions.map(q => q.n)).size === unit.questions.length) continue;
        duplicateGroups++;
        const responseIds = unit.questions.map((_, index) => `${unit.id}:${questionAnswerKey(unit, index)}`);
        expect(new Set(responseIds).size).toBe(responseIds.length);
        for (const id of responseIds) expect(ids).toContain(id);
      }
    }
    expect(duplicateGroups).toBeGreaterThan(0);
  });
});
