import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { GTC_BLUEPRINTS, answerSlots, assertBlueprint } from "@/lib/gtc-blueprints";
import { isGtcClaimsBundle, scoreUnit, type UnitAnswer } from "@/components/UnitCard";
import type { Unit } from "@/lib/books";
import { makeWorkbookExam, workbookEntries } from "@/lib/workbook-exams";

const example: Unit = {
  id: "sample-45", label: "Առաջադրանք 45",
  kind: "mc", passage: "Տրված վեց պնդումներից յուրաքանչյուրի համար ընտրեք պատասխանը։",
  questions: Array.from({ length: 6 }, (_, i) => ({
    n: "45." + (i + 1), stem: "Պնդում " + (i + 1),
    options: { "1": "Ճիշտ է", "2": "Սխալ է" }, answer: "1",
  })),
};
const attempt = (marks: string[]): UnitAnswer => ({
  mc: Object.fromEntries(marks.map((x, i) => ["45." + (i + 1), x])),
});

describe("GTC 2027 source-verified blueprints", () => {
  it("separates numbered tasks, claims bundles and raw points", () => {
    for (const spec of Object.values(GTC_BLUEPRINTS)) {
      expect(assertBlueprint(spec)).toBe(true);
      expect(answerSlots(spec)).toHaveLength(spec.taskCount);
      expect(spec.maxPoints).toBe(80);
    }
    expect(GTC_BLUEPRINTS.armenian.taskCount).toBe(70);
    expect(GTC_BLUEPRINTS.history.taskCount).toBe(70);
    expect(GTC_BLUEPRINTS.biology.taskCount).toBe(70);
    expect(GTC_BLUEPRINTS.geography.taskCount).toBe(70);
    expect(GTC_BLUEPRINTS.russian.taskCount).toBe(80);
    expect(GTC_BLUEPRINTS.armenian.parts.map((part) => part.slots.reduce((a,s)=>a+s.count,0))).toEqual([45,25]);
    expect(GTC_BLUEPRINTS.armenian.parts.map((part) => part.points)).toEqual([50,30]);
  });
  it("scores six-claim units with penalties only within that unit", () => {
    expect(isGtcClaimsBundle(example)).toBe(true);
    expect(scoreUnit(example, attempt(["1","1","1","1","1","1"])).got).toBe(6);
    expect(scoreUnit(example, attempt(["1","1","1","1","2","3"])).got).toBe(3);
    expect(scoreUnit(example, attempt(["2","2","2","2","2","2"])).got).toBe(0);
    expect(scoreUnit(example, attempt(["3","3","3","3","3","3"])).got).toBe(0);
  });
  it("official Armenian task count differs from current practice-bank points", () => {
    const book = JSON.parse(readFileSync("public/data/armenian-book1.json", "utf8"));
    const exam = makeWorkbookExam([book], "armenian", "all", "full", workbookEntries([book]), 70, false);
    expect(exam.units).toHaveLength(70);
    expect(exam.units.every((u) => u.kind === "mc" && u.questions.length === 1)).toBe(true);
    expect(exam.units.reduce((n,u)=>n+(u.kind==="mc"?u.questions.length:1),0)).toBe(70);
  });
  it("the four new banks have original, non-official provenance and valid answers", () => {
    for (const id of ["physics","chemistry","geography","russian"]) {
      const bank = JSON.parse(readFileSync("public/data/original-" + id + ".json", "utf8"));
      expect(bank.provenance).toContain("NOT official");
      expect(bank.sections.flatMap((s:any)=>s.units)).toHaveLength(12);
      const questions = bank.sections.flatMap((s:any)=>s.units.flatMap((u:any)=>u.questions ?? []));
      expect(questions.every((q:any)=>q.stem && q.options[q.answer])).toBe(true);
      expect(new Set(bank.sections.flatMap((s:any)=>s.units.map((u:any)=>u.id))).size).toBe(12);
    }
  });
});
