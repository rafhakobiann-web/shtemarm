import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Compared only question 48 with user-supplied patm-1.pdf, printed page 8.
 * Printed answer-key accuracy and whole-book completeness are not asserted.
 */
describe("Armenian History I source transcription: printed p.8", () => {
  it("rejoins a page-wrapped word without changing choices or imported answer", () => {
    const bank = JSON.parse(readFileSync("public/data/history-bank-book1.json", "utf8")) as {
      questions: { source_run: number; num: number; page: number; stem: string; options: Record<string,string>; answer: string }[];
    };
    const book = JSON.parse(readFileSync("public/data/history-book1.json", "utf8")) as {
      sections: { units: { id: string; questions?: { n: string; stem: string; options: Record<string,string>; answer: string }[] }[] }[];
    };
    const original = bank.questions.find(q => q.source_run === 0 && q.num === 48);
    const imported = book.sections.flatMap(s => s.units)
      .find(u => u.id === "1-1-Ա-1")?.questions?.find(q => q.n === "48");
    expect(original?.page).toBe(8);
    expect(imported?.stem).toContain("հայ–պարթևական պայմանագիրը");
    expect(imported?.stem).not.toContain("պայմա նագիրը");
    expect(imported?.stem).toBe(original?.stem);
    expect(imported?.options).toEqual(original?.options);
    expect(imported?.answer).toBe(original?.answer);
  });
});
