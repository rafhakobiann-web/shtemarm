import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mergeBiologyExtended } from "@/lib/biology-extended";
import { isGtcClaimsBundle, type Book, type Unit } from "@/lib/books";
import { scoreUnit } from "@/components/UnitCard";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const core = read("public/data/bio-book4.json") as Book;
const extra = read("public/data/biology-extended-book4.json") as Book;
const draft = read("src/lib/biology4-completion-653.review.json") as Book & {
  source: { sha256: string; complete: boolean; verification: string }
};
const source = read("public/data/biology-original-volume4-index.json");
const queue = read("docs/biology4-type-review-queue.json");
const list = draft.sections.flatMap(section => section.units.map(unit => ({ section: section.n, unit })));
const indexedPage = (chapter: typeof source.chapters[number], printed: number): number => {
  let found = chapter.startPage;
  for (const [first, page] of chapter.pageRuns) {
    if (first > printed) break;
    found = page;
  }
  return found;
};

describe("Biology IV 653 source drafts safely merged", () => {
  it("reconciles all 653 non-overlapping original task identities and indexed source pages", () => {
    expect(draft.id).toBe(34);
    expect(draft.source.sha256).toBe(source.sourceSha256);
    expect(draft.source.complete).toBe(false);
    expect(draft.source.verification).toMatch(/automated/);
    expect(list).toHaveLength(653);
    expect(queue.entries).toHaveLength(653);
    const queued = new Map<string, any[]>(queue.entries.map((r: any[]) => [r[0] + ":" + r[1], r]));
    const found = new Set<string>();
    for (const { section, unit } of list) {
      const num = Number(unit.label);
      expect(unit.id).toBe(`bio4-s${section}-q${num}`);
      const key = `${section}:${num}`;
      expect(found.has(key), unit.id).toBe(false);
      found.add(key);
      const row = queued.get(key);
      expect(row, unit.id).toBeDefined();
      const chapter = source.chapters.find((c: any) => c.id === section);
      expect(chapter).toBeDefined();
      expect((unit as Unit & {sourcePage:number}).sourcePage).toBe(indexedPage(chapter, num));
      expect((unit as Unit & {sourceAnswerPage:number}).sourceAnswerPage).toBeGreaterThanOrEqual(row![3]);
      expect((unit as Unit & {sourceAnswerPage:number}).sourceAnswerPage).toBeLessThanOrEqual(row![4]);
    }
    expect(found.size).toBe(queued.size);
    expect([...found].every(id => queued.has(id))).toBe(true);
  });

  it("combines 1035 baseline tasks and 653 new drafts into exactly 1688 distinct original IDs", () => {
    const base = mergeBiologyExtended(core, extra);
    expect(base.sections.flatMap(s => s.units)).toHaveLength(1035);
    const merged = mergeBiologyExtended(base, draft);
    const unitIds = merged.sections.flatMap(section => section.units.map(u => u.id));
    expect(unitIds).toHaveLength(1688);
    expect(new Set(unitIds).size).toBe(1688);
    for (const chapter of source.chapters) {
      const units = merged.sections.find(s => s.n === chapter.id)?.units ?? [];
      expect(units).toHaveLength(chapter.questionCount);
      expect(units.map(u => Number(u.label))).toEqual(
        Array.from({ length: chapter.questionCount }, (_, i) => i + 1),
      );
    }
    expect(() => mergeBiologyExtended(merged, draft)).toThrow(/Duplicate Biology task/);
  });

  it("corrects the six source-format discrepancies before preview", () => {
    const get = (chapter: number, number: number) => list.find(
      ({ section, unit }) => section === chapter && Number(unit.label) === number,
    )!.unit;
    for (const n of [276, 279]) expect(get(4, n).kind).toBe("set");
    for (const [n, count] of [[149,9],[151,9],[154,9],[161,7]]) {
      const u = get(2, n);
      expect(u.kind).toBe("seq");
      if (u.kind === "seq") {
        expect(u.answer).toHaveLength(count);
        expect(u.count).toBe(count);
      }
    }
  });

  it("retains 223 six-statement tasks with three-state scoring", () => {
    const claims = list.map(x => x.unit).filter(u => u.kind === "mc");
    expect(claims).toHaveLength(223);
    for (const u of claims) {
      expect(isGtcClaimsBundle(u)).toBe(true);
      if (u.kind !== "mc") continue;
      expect(u.questions).toHaveLength(6);
      const answer = { mc: Object.fromEntries(u.questions.map(q => [q.n, q.answer])) };
      expect(scoreUnit(u, answer).got, u.id).toBe(6);
      const first = u.questions[0];
      expect(scoreUnit(u, { mc: { ...answer.mc, [first.n]: "3" } }).got, u.id).toBe(5);
    }
  });

  it("grades all 245 numeric problems individually while retaining 146 multipart problem IDs", () => {
    const problems = list.map(x => x.unit).filter(u => u.kind === "num");
    expect(problems).toHaveLength(245);
    expect(problems.filter(u => u.kind === "num" && u.questions.length > 1)).toHaveLength(146);
    for (const u of problems) {
      if (u.kind !== "num") continue;
      const answer = { mc: Object.fromEntries(u.questions.map(q => [q.n, q.answer])) };
      expect(scoreUnit(u, answer).got, u.id).toBe(u.questions.length);
      if (u.questions.length > 1) expect(u.grouping).toBe("printed-problem");
    }
  });

  it("validates all 185 remaining selection, matching and ordering source answers", () => {
    const others = list.map(x => x.unit).filter(u => !["num", "mc"].includes(u.kind));
    expect(others).toHaveLength(185);
    for (const u of others) {
      const answer = u.kind === "match"
        ? { match: u.answer }
        : u.kind === "set" || u.kind === "seq" ? { nums: u.answer } : {};
      expect(scoreUnit(u, answer).got, u.id).toBe(1);
      if (u.kind === "seq") expect(u.count).toBe(u.answer.length);
      if (u.kind === "set") expect(Math.max(...u.answer)).toBeLessThanOrEqual(u.count ?? 5);
    }
  });

  it("does not serve unpublished original question text from public data or production loader", () => {
    for (const file of [
      "public/data/biology-completion-book4-gtc.json",
      "public/data/biology-completion-book4-other.json",
      "public/data/biology-completion-book4-problems.json",
    ]) expect(existsSync(file), file).toBe(false);
    const loader = readFileSync("src/lib/books.ts", "utf8");
    expect(loader).toContain("!import.meta.env.DEV");
    expect(loader).toContain('import("./biology4-completion-653.review.json")');
  });
});
