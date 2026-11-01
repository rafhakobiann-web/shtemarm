import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

type SourceQuestion = {
  book: string; source_run: number; num: number; page: number;
  stem: string; options: Record<string, string>; answer: string;
};
type RestoredQuestion = {
  n: string; stem: string; options: Record<string, string>; answer: string;
  source_page?: number; source_run?: number;
};

const source = JSON.parse(readFileSync("public/data/history-bank-book1.json", "utf8")) as {
  questions: SourceQuestion[];
};
const volume = JSON.parse(readFileSync("public/data/history-book1.json", "utf8")) as {
  sections: { units: { id: string; kind: string; questions?: RestoredQuestion[] }[] }[];
};

describe("History I — restore actual missing source questions", () => {
  const units = volume.sections.flatMap((section) => section.units);
  const questions = units.flatMap((unit) => unit.kind === "mc" ? unit.questions ?? [] : []);
  const restored = units.flatMap((unit) =>
    (unit.questions ?? []).filter((q) => q.source_page !== undefined)
      .map((q) => ({ unitId: unit.id, question: q })),
  );

  it("restores 266 source-backed questions without deleting existing tasks", () => {
    // Before this restoration: 1,612 answerable tasks, including 1,420 MC.
    expect(restored).toHaveLength(266);
    const count = units.reduce((n, unit) =>
      n + (unit.kind === "mc" || unit.kind === "num"
        ? unit.questions?.length ?? 0 : 1), 0);
    expect(count).toBe(1878);
    expect(questions).toHaveLength(1686);
    expect(new Set(restored.map(({unitId, question}) => `${unitId}:${question.n}`)).size)
      .toBe(266);
  });

  it("matches each restored text, answer, option set, source run and printed page", () => {
    const sourceIndex = new Map(source.questions.map((q) =>
      [`${q.source_run}:${q.num}`, q]));
    for (const { unitId, question } of restored) {
      const key = `${question.source_run}:${question.n}`;
      const original = sourceIndex.get(key);
      expect(original, `Missing original for ${unitId} ${key}`).toBeDefined();
      expect(question.stem).toBe(original?.stem);
      expect(question.answer).toBe(original?.answer);
      expect(question.options).toEqual(original?.options);
      expect(question.source_page).toBe(original?.page);
      expect(Object.hasOwn(question.options, question.answer)).toBe(true);
      expect(question.options[question.answer]?.trim()).toBeTruthy();
    }
  });

  it("places only dated, factual, source-text, terminology and causes questions", () => {
    // Mapping is backed by at least 3 exact existing matches per source run,
    // with matching answers; matching and selection tasks await manual review.
    const allowed = new Set([
      "1-1-Ա-1","1-2-Ա-1","1-3-Ա-1","1-5-Ա-1",
      "1-1-Բ-2","1-2-Բ-2","1-3-Բ-2","1-4-Բ-2","1-5-Բ-2",
      "1-1-Գ-3","1-2-Գ-3","1-3-Գ-3","1-4-Գ-3",
      "1-1-Դ-4","1-2-Դ-4","1-4-Դ-4","1-5-Դ-4",
    ]);
    expect(new Set(restored.map((x) => x.unitId))).toEqual(allowed);
    for (const {unitId, question} of restored) {
      expect(allowed.has(unitId)).toBe(true);
      expect(Number.isInteger(question.source_page)).toBe(true);
      expect(Number.isInteger(question.source_run)).toBe(true);
    }
  });
});
