import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));

describe("568 source-linked self-practice tasks in Biology IV", () => {
  const practice = read("public/data/biology-source-practice-568.json");
  const queue268 = read("docs/biology-next-268-source-review.json");
  const queue500 = read("docs/biology-next-500-source-queue.json");
  const source = read("public/data/biology-original-volume4-index.json");
  const core = read("public/data/bio-book4.json");
  const supplement = read("public/data/biology-extended-book4.json");
  const coverage = read("public/data/biology-volume4-coverage.json");

  const identity = (c: number, n: number) => c + ":" + n;
  const rows = practice.items as {
    chapter: number; number: number; page: number; answerPages: [number,number];
  }[];
  const keys = rows.map(row => identity(row.chapter,row.number));
  const prior = [
    ...queue268.entries.map((row: { chapter: number; printedNumber: number }) => identity(row.chapter,row.printedNumber)),
    ...queue500.entries.filter((row: number[]) => row[0] === 4).map((row: number[]) => identity(row[1],row[2])),
  ];
  const playable = new Set<string>([core,supplement].flatMap(book =>
    book.sections.flatMap((section: { n: number; units: { label: string }[] }) =>
      section.units.map(unit => identity(section.n,Number(unit.label))))));

  it("has exactly 568 unique original printed task IDs, without rewriting playable questions", () => {
    expect(practice.schemaVersion).toBe(1);
    expect(practice.sourceVolume).toBe(4);
    expect(practice.sourceSha256).toBe(source.sourceSha256);
    expect(practice.questionCount).toBe(568);
    expect(rows).toHaveLength(568);
    expect(new Set(keys).size).toBe(568);
    expect(new Set(prior)).toEqual(new Set(keys));
    for (const key of keys) expect(playable.has(key), key).toBe(false);
    expect(practice.graded).toBe(false);
    expect(practice.originalWordingPublished).toBe(false);
  });

  it("only links to numbered questions marked pending in the original books", () => {
    for (const row of rows) {
      const chapter = source.chapters.find((c: {id:number}) => c.id === row.chapter);
      expect(chapter).toBeDefined();
      expect(row.number).toBeGreaterThan(0);
      expect(row.number).toBeLessThanOrEqual(chapter.questionCount);
      const excluded = coverage.chapters.find((c: {id:number}) => c.id === row.chapter);
      expect(excluded.excluded.some((item: {n:number}) => item.n === row.number)).toBe(true);
      let printedPage = chapter.startPage;
      for (const [first,page] of chapter.pageRuns) {
        if (first > row.number) break;
        printedPage = page;
      }
      expect(row.page).toBe(printedPage);
      expect(row.answerPages).toEqual(chapter.answerPages);
      expect(Object.keys(row).sort()).toEqual(["answerPages","chapter","number","page"]);
    }
  });

  it("never sends source text, a source answer key or invented choices in the practice manifest", () => {
    for (const row of rows) {
      expect("stem" in row).toBe(false);
      expect("options" in row).toBe(false);
      expect("answer" in row).toBe(false);
    }
    expect(rows.filter(r=>r.chapter === 6)).toHaveLength(160);
  });

  it("does not count self-practice as verified graded question bank coverage", () => {
    const full = read("public/data/biology-extended-coverage.json");
    const b4 = full.books.find((item: {volume:number}) => item.volume === 4);
    expect(b4.totalPlayableTasks).toBe(1035);
    expect(b4.remainingTasks).toBe(653);
    expect(b4.totalPlayableTasks + b4.remainingTasks).toBe(1688);
  });
});
