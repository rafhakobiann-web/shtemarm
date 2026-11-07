import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildCustom, isGtcClaimsBundle, type Book } from "@/lib/books";
import { mergeBiologyExtended } from "@/lib/biology-extended";
import { scoreUnit } from "@/components/UnitCard";

/**
 * Checks the automatically transcribed 2018 source-data draft. Automated
 * structural integrity is NOT manual proofreading or publishing permission.
 */
const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const source = read("public/data/biology-original-volume4-index.json");
const draft = read("public/data/biology4-223-gtc-claims.json") as Book & {
  source: { sha256: string; complete: boolean; verification: string };
};
const core = read("public/data/bio-book4.json") as Book;
const extra = read("public/data/biology-extended-book4.json") as Book;
const pending = read("docs/biology4-type-review-queue.json");
const units = draft.sections.flatMap(section => section.units.map(unit => ({ section, unit })));
const questionCount = units.reduce((sum, { unit }) => sum + (unit.kind === "mc" ? unit.questions.length : 0), 0);
const indexedPages = (chapter: any, questionNumber: number) => {
  let page = chapter.startPage;
  for (const [first, p] of chapter.pageRuns) {
    if (first > questionNumber) break;
    page = p;
  }
  return page;
};

describe("Biology IV 223 original six-statement source-review candidate tasks", () => {
  it("preserves 223 unique original printed IDs and six statements per task", () => {
    expect(draft.id).toBe(34);
    expect(draft.source?.sha256).toBe(source.sourceSha256);
    expect(draft.source?.complete).toBe(false);
    expect(draft.source?.verification).toMatch(/automated/);
    expect(units).toHaveLength(223);
    expect(questionCount).toBe(1338);
    const ids = new Set<string>();
    const sourceReviewIDs = new Set<string>(
      pending.entries.filter((r: any) => r[5] === "three-state-six-claims")
        .map((r: any) => "bio4-s" + r[0] + "-q" + r[1]),
    );
    for (const { section, unit } of units) {
      expect(unit.kind).toBe("mc");
      if (unit.kind !== "mc") throw Error("Wrong Biology IV draft kind");
      expect(isGtcClaimsBundle(unit)).toBe(true);
      expect(unit.grading).toBe("gtc-claims");
      expect(unit.questions).toHaveLength(6);
      expect(unit.id).toBe("bio4-s" + section.n + "-q" + unit.label);
      expect(ids.has(unit.id)).toBe(false);
      ids.add(unit.id);
      const chapter = source.chapters.find((ch: any) => ch.id === section.n);
      expect(chapter).toBeDefined();
      const sourced = unit as typeof unit & { sourcePage: number; sourceAnswerPage: number };
      expect(sourced.sourcePage).toBe(indexedPages(chapter, Number(unit.label)));
      expect(sourced.sourceAnswerPage).toBeGreaterThanOrEqual(chapter.answerPages[0]);
      expect(sourced.sourceAnswerPage).toBeLessThanOrEqual(chapter.answerPages[1]);
      for (const [index, question] of unit.questions.entries()) {
        expect(question.n).toBe(String(index + 1));
        expect(question.stem.trim().length).toBeGreaterThan(8);
        expect(Object.keys(question.options).sort()).toEqual(["1", "2", "3"]);
        expect(question.options["3"]).toBe("Չգիտեմ");
        expect(["1", "2"]).toContain(question.answer);
        expect(question.answer).not.toBe("3");
      }
    }
    expect(ids).toEqual(sourceReviewIDs);
  });

  it("merges all 223 preview units without overwriting existing playable task IDs", () => {
    const baseline = mergeBiologyExtended(core, extra);
    expect(baseline.sections.reduce((n, s) => n + s.units.length, 0)).toBe(1035);
    const preview = mergeBiologyExtended(baseline, draft);
    expect(preview.sections.reduce((n, s) => n + s.units.length, 0)).toBe(1258);
    const taskIDs = preview.sections.flatMap(section => section.units.map(unit => unit.id));
    expect(new Set(taskIDs).size).toBe(1258);
    expect(() => mergeBiologyExtended(preview, draft)).toThrow("Duplicate Biology task");
  });

  it("preserves GTC three-state scoring for every draft task", () => {
    for (const { unit } of units) {
      if (unit.kind !== "mc") throw Error("Wrong source kind");
      const correct = { mc: Object.fromEntries(unit.questions.map(q => [q.n, q.answer])) };
      expect(scoreUnit(unit, correct).got, unit.id).toBe(6);
      const first = unit.questions[0];
      const allCorrectButUnknown = { mc: { ...correct.mc, [first.n]: "3" } };
      expect(scoreUnit(unit, allCorrectButUnknown).got, unit.id).toBe(5);
      const wrong = first.answer === "1" ? "2" : "1";
      expect(scoreUnit(unit, { mc: { ...correct.mc, [first.n]: wrong } }).got, unit.id).toBe(4);
    }
  });

  it("keeps a whole claim bundle in the custom-exam selection", () => {
    const first = units[0];
    const single: Book = {
      id: 34,
      sections: [{ ...first.section, units: [first.unit] }],
    };
    const exam = buildCustom(single, [first.section.n], 6);
    expect(exam).toHaveLength(1);
    expect(exam[0].unit.id).toBe(first.unit.id);
  });
});
