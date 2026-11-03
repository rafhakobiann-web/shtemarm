import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { pageForBiologyQuestion } from "@/lib/biology-source";

const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));

describe("Biology III: 34 clearly identified adapted exercises", () => {
  const book = read("public/data/bio-book3.json");
  const index = read("public/data/biology-original-volume3-index.json");
  const coverage = read("public/data/biology-volume3-coverage.json");
  const pending = read("public/data/biology-pending-books.json").books.find((b: { part: number }) => b.part === 3);
  const summary = read("public/data/biology-backlog-summary.json").books.find((b: { volume: number }) => b.volume === 3);

  it("adds exactly 34 playable, reworded MCQs with distinct printed IDs and original answer positions", () => {
    const adapted = book.sections.flatMap((s: any) => s.units.map((unit: any) => ({ chapter: s.n, unit })))
      .filter((item: any) => item.unit.sourceAlignedAdapted === true);
    expect(adapted).toHaveLength(34);
    const seen = new Set<string>();
    for (const { chapter, unit } of adapted) {
      const ch = index.chapters.find((x: { id: number }) => x.id === chapter);
      const number = Number(unit.label);
      expect(seen.has(`${chapter}:${number}`)).toBe(false);
      seen.add(`${chapter}:${number}`);
      expect(unit.id).toBe(`bio3-s${chapter}-q${number}`);
      expect(unit.sourcePage).toBe(pageForBiologyQuestion(ch, number));
      expect(unit.kind).toBe("mc");
      expect(unit.questions).toHaveLength(1);
      const q = unit.questions[0];
      expect(q.n).toBe(String(number));
      expect(q.answer).toBe(ch.choiceKeys[number - 1]);
      expect(Object.keys(q.options)).toEqual(["1", "2", "3", "4"]);
      expect(Object.values(q.options).every(v => typeof v === "string" && v.trim().length >= 3)).toBe(true);
      expect(q.stem.length).toBeGreaterThan(20);
      expect(unit.passage).toContain("Բնագրի բառացի վերարտադրություն չէ");
    }
    expect(book.source.sourceAlignedAdaptedCount).toBe(34);
    expect(book.source.complete).toBe(false);
  });

  it("keeps the 911 original transcriptions distinct from the 34 adapted tasks", () => {
    const all = book.sections.flatMap((s: any) => s.units);
    expect(all.length).toBe(945);
    expect(all.filter((unit: any) => !unit.sourceAlignedAdapted).length).toBe(911);
    expect(pending.transcribedQuestions).toBe(911);
    expect(pending.sourceAlignedAdaptedQuestions).toBe(34);
    expect(pending.remainingQuestions).toBe(892);
  });

  it("removes all 34 old figure/formula/incomplete-text flags without hiding 892 pending tasks", () => {
    expect(coverage.importedQuestions).toBe(945);
    expect(coverage.chapters.map((ch: any) => ch.imported)).toEqual([182, 210, 227, 218, 108, 0]);
    const excluded = coverage.chapters.flatMap((ch: any) => ch.excluded);
    expect(excluded).toHaveLength(892);
    expect(excluded.every((item: any) => item.reason === "answer-type-pending")).toBe(true);
    expect(summary.imported).toBe(945);
    expect(summary.pending).toBe(892);
    expect(summary.byReason).toEqual({ "answer-type-pending": 892 });
  });
});
