import { describe, it, expect } from "vitest";
import { normalizeBiologySecondBook, type Book } from "@/lib/books";
import { historyBookEntries, selectHistoryUnits } from "@/lib/history";

const first = { n: "1", stem: "What is a cell?", options: { "1": "A", "2": "B" }, answer: "1" };
const second = { n: "2", stem: "What is DNA?", options: { "1": "C", "2": "D" }, answer: "2" };
const sample: Book = {
  id: 32,
  sections: [{ n: 1, label: "1", instr_en: "", instr_hy: "", units: [{
    id: "old-group", label: "1", kind: "mc", passage: "", questions: [first, second],
  }] }],
};

describe("Biology source normalization", () => {
  it("preserves each answerable question while repairing book 2 navigation and labels", () => {
    const fixed = normalizeBiologySecondBook(sample);
    expect(sample.sections[0].units).toHaveLength(1);
    expect(fixed.sections[0].label).toBe("Կենդանի օրգանիզմների բազմազանությունը");
    expect(fixed.sections[0].units).toHaveLength(2);
    expect(fixed.sections[0].units.map((u) => u.id)).toEqual(["old-group:q1", "old-group:q2"]);
    expect(fixed.sections[0].units.map((u) => u.kind === "mc" ? u.questions[0].answer : null)).toEqual(["1", "2"]);
  });
  it("both books remain independent and counts never pad with duplicates", () => {
    const fixed = normalizeBiologySecondBook(sample);
    const bank = [...historyBookEntries(fixed, 2), ...historyBookEntries(sample, 1)];
    expect(bank).toHaveLength(4);
    expect(new Set(bank.map((e) => e.unit.id)).size).toBe(4);
    expect(selectHistoryUnits(bank, 3, false)).toHaveLength(3);
    expect(() => selectHistoryUnits(bank, 5, false)).toThrow();
  });
});
