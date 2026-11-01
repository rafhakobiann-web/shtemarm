import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { questionAnswerKey, type Book, type Unit } from "@/lib/books";
import { isAnswered, scoreUnit } from "@/components/UnitCard";

const files = ["book2.json", "history-book1.json", "history-book2.json", "history-book3.json"] as const;

describe("source numbering versus internal response identity", () => {
  it("independently grades every repeated printed number without rewriting source data", () => {
    let repeatedUnits = 0;
    for (const file of files) {
      const book = JSON.parse(readFileSync(`public/data/${file}`, "utf8")) as Book;
      for (const section of book.sections) for (const unit of section.units) {
        if (unit.kind !== "mc" && unit.kind !== "num") continue;
        const originalNumbers = unit.questions.map(q => q.n);
        if (new Set(originalNumbers).size === originalNumbers.length) continue;
        repeatedUnits++;
        const keys = unit.questions.map((_, index) => questionAnswerKey(unit, index));
        expect(new Set(keys).size, `${file}: ${unit.id} answer keys`).toBe(keys.length);
        const answers = Object.fromEntries(unit.questions.map((q, i) => [keys[i], q.answer]));
        const response = { mc: answers };
        expect(isAnswered(unit, response), `${file}: ${unit.id} completion`).toBe(true);
        expect(scoreUnit(unit, response).got, `${file}: ${unit.id} score`).toBe(unit.questions.length);
        expect(unit.questions.map(q => q.n)).toEqual(originalNumbers);

        // Omitting one occurrence must not borrow the response from its
        // equally numbered sibling.
        const firstKey = keys[0]!;
        const missing = { ...answers };
        delete missing[firstKey];
        expect(isAnswered(unit, { mc: missing })).toBe(false);
        expect(scoreUnit(unit, { mc: missing }).got).toBeLessThan(unit.questions.length);
      }
    }
    expect(repeatedUnits).toBeGreaterThanOrEqual(4);
  });

  it("retains legacy response keys for units with unique printed numbers", () => {
    const unit: Extract<Unit, { kind: "mc" }> = {
      id: "example", label: "Example", kind: "mc", passage: "",
      questions: [
        { n: "1", stem: "First", options: { "1": "A", "2": "B" }, answer: "1" },
        { n: "2", stem: "Second", options: { "1": "A", "2": "B" }, answer: "2" },
      ],
    };
    expect(unit.questions.map((_, i) => questionAnswerKey(unit, i))).toEqual(["1", "2"]);
    expect(scoreUnit(unit, { mc: { "1": "1", "2": "2" } }).got).toBe(2);
  });
});
