import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getOfflineEnglishExplanation } from "./englishSectionOneMultilingual";

type SourceBook = { sections: { n: number; units: { id: string; questions?: { n: string }[] }[] }[] };
const source = JSON.parse(readFileSync("public/data/book1.json", "utf8")) as SourceBook;
const first25 = source.sections.find(section => section.n === 1)?.units.slice(0, 25) ?? [];

describe("Offline English section one explanations", () => {
  it("covers every existing question in Texts 1–25 for all supported languages", () => {
    expect(first25).toHaveLength(25);
    for (const unit of first25) {
      expect(unit.questions).toHaveLength(5);
      for (const question of unit.questions ?? []) {
        for (const lang of ["hy", "en", "ru"] as const) {
          const explanation = getOfflineEnglishExplanation(unit.id, question.n, lang);
          expect(explanation, unit.id + ":" + question.n + " " + lang).toBeTruthy();
          expect(explanation?.length).toBeGreaterThan(20);
        }
      }
    }
  });
  it("has separate translations rather than identical fallback text", () => {
    const hy = getOfflineEnglishExplanation("1-1-Text8", "2", "hy");
    const en = getOfflineEnglishExplanation("1-1-Text8", "2", "en");
    const ru = getOfflineEnglishExplanation("1-1-Text8", "2", "ru");
    expect(new Set([hy, en, ru]).size).toBe(3);
  });
  it("does not invent explanations for unreviewed questions", () => {
    expect(getOfflineEnglishExplanation("1-1-Text26", "1", "hy")).toBeUndefined();
  });
});
