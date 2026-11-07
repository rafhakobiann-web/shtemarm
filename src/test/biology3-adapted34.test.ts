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
    expect(pending.remainingQuestions).toBe(926);
  });

  it("keeps 34 adapted exercises distinct from 926 pending original source tasks", () => {
    expect(coverage.importedQuestions).toBe(911);
    expect(coverage.chapters.map((ch: any) => ch.imported)).toEqual([178, 204, 214, 207, 108, 0]);
    const excluded = coverage.chapters.flatMap((ch: any) => ch.excluded);
    expect(excluded).toHaveLength(926);
    expect(excluded.filter((item: any) => item.reason === "answer-type-pending")).toHaveLength(892);
    expect(excluded.filter((item: any) => item.reason === "adapted-not-source")).toHaveLength(34);
    expect(summary.imported).toBe(911);
    expect(summary.pending).toBe(926);
    expect(summary.byReason).toEqual({ "answer-type-pending": 892, "adapted-not-source": 34 });
  });
});
