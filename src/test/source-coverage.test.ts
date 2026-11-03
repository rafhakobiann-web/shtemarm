import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { historyBookEntries } from "@/lib/history";
import type { Book } from "@/lib/books";

const getBook = (name: string) =>
  JSON.parse(readFileSync(`public/data/${name}.json`, "utf8")) as Book;

/**
 * These are regression counts of existing records, NOT proof that every
 * question has been checked against a printed edition or licensed for reuse.
 * A source-proofreading task is required before claiming book completion.
 */
describe("English and Armenian History source-data retention", () => {
  it("preserves all 4,391 currently indexed English answerable records", () => {
    const expected = [1601, 1509, 1281];
    const missingSourceChoiceText: string[] = [];
    for (let part = 1; part <= 3; part++) {
      const book = getBook(`book${part}`);
      const count = book.sections.flatMap((s) => s.units).reduce((n, unit) =>
        n + (unit.kind === "mc" || unit.kind === "num" ? unit.questions.length : 1), 0);
      expect(count, `English book ${part}`).toBe(expected[part - 1]);
      for (const section of book.sections) for (const unit of section.units) {
        if (unit.kind !== "mc" && unit.kind !== "num") continue;
        for (const question of unit.questions) {
          // Empty per-question stems occur in source passages / gap-fill groups.
          expect(Boolean(question.stem?.trim() || unit.passage?.trim()),
            `English ${part} / ${unit.id} / ${question.n}`).toBe(true);
          expect(Boolean(question.answer?.trim())).toBe(true);
          if (unit.kind === "mc") {
            const options = (question as { options?: Record<string, string> }).options ?? {};
            expect(Object.hasOwn(options, question.answer),
              `English ${part} / ${unit.id} / ${question.n}`).toBe(true);
            if (!options[question.answer]?.trim()) {
              missingSourceChoiceText.push(`${part}:${unit.id}:${question.n}`);
            }
          }
        }
      }
    }
    // Exact unresolved data defects. Do not replace them with invented text;
    // use original page images + answer-key verification to resolve these.
    expect(missingSourceChoiceText.sort()).toEqual([
      "2:2-1-Text5:1",
      "3:3-5-136:136",
    ]);
  });

  it("does not skip any of 3,449 currently indexed Armenian History tasks", () => {
    // Count the current checked-in records, not independently verified printed questions.
    const expected = [1657, 1187, 605];
    for (let part = 1; part <= 3; part++) {
      const book = getBook(`history-book${part}`);
      const entries = historyBookEntries(book, part);
      expect(entries.length, `History book ${part}`).toBe(expected[part - 1]);
      expect(new Set(entries.map((entry) => entry.unit.id)).size).toBe(entries.length);
    }
  });

  it("rejects incomplete imported tasks instead of silently losing question numbers", () => {
    const make = (stem: string, passage: string): Book => ({
      id: 21,
      sections: [{
        n: 1, instr_en: "", instr_hy: "",
        units: [{ id: "u1", kind: "mc", label: "1", passage,
          questions: [{ n: "5", stem, answer: "1", options: { "1": "Option A", "2": "Option B" } }],
        }],
      }],
    });
    expect(() => historyBookEntries(make("", ""), 1)).toThrow("Թերի առաջադրանք");
    expect(historyBookEntries(make("", "A source passage for the question"), 1)).toHaveLength(1);
    const duplicate = make("Question", "");
    duplicate.sections[0]!.units.push({ ...duplicate.sections[0]!.units[0]! });
    expect(() => historyBookEntries(duplicate, 1)).toThrow("Կրկնվող");
  });
});
