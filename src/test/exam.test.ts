import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildExam, buildCustom, EXAM_BLUEPRINT, unitPoints, type Book } from "@/lib/books";

const load = (n: number) => {
  const filePath = resolve(process.cwd(), `public/data/book${n}.json`);
  return JSON.parse(readFileSync(filePath, "utf8")) as Book;
};

describe("exam structure and points", () => {
  it.each([1, 2, 3])("book %i follows all 2026 quotas and totals exactly 80 tasks", (id) => {
    for (let attempt = 0; attempt < 20; attempt++) {
      const book = load(id);
      const items = buildExam(book);
      expect(items.reduce((sum, i) => sum + unitPoints(i.unit), 0)).toBe(80);
      expect(EXAM_BLUEPRINT.map(([section]) => items.filter(i => i.section === section).reduce((sum, i) => sum + unitPoints(i.unit), 0))).toEqual([10,16,11,5,8,5,1,5,1,5,5,4,4]);
      const order = book.sections.flatMap(s => s.units.map(u => u.id));
      const positions = items.map(i => order.indexOf(i.unit.id));
      expect(positions).toEqual([...positions].sort((a,b) => a-b));
    }
  });
  it("uses exactly one complete reading passage with ten questions", () => {
    const reading = buildExam(load(1)).filter(i => i.section === 1);
    expect(reading).toHaveLength(1);
    expect(unitPoints(reading[0]?.unit as Book["sections"][number]["units"][number])).toBe(10);
  });
  it("fails clearly when the book cannot supply the required exam", () => {
    expect(() => buildExam({ id: 99, sections: [] })).toThrow();
  });

  it("custom test respects chosen sections and limits", () => {
    const items = buildCustom(load(1), [3], 20);
    expect(items.every((i) => i.section === 3)).toBe(true);
    expect(items.length).toBe(20);
  });
  it("custom tests do not exceed the requested count for grouped passages", () => {
    const items = buildCustom(load(1), [1], 7);
    expect(items.reduce((sum, i) => sum + unitPoints(i.unit), 0)).toBe(7);
    expect(items.every(i => i.unit.passage.length > 0)).toBe(true);
  });
  it("keeps expanded multi-question items in original book and question order", () => {
    const question = (n: string) => ({ n, stem: `Question ${n}`, options: { A: "A", B: "B" }, answer: "A" });
    const book: Book = {
      id: 99,
      sections: [{
        n: 1, instr_en: "Choose", instr_hy: "Ընտրեք",
        units: [
          { id: "first", label: "First", kind: "mc", passage: "", questions: [question("1"), question("2")] },
          { id: "second", label: "Second", kind: "mc", passage: "", questions: [question("1"), question("2")] },
        ],
      }],
    };
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    try {
      const items = buildCustom(book, [1], 3);
      const ids = items.map((item) => item.unit.id);
      expect(ids).toEqual(["first-q2", "second-q1", "second-q2"]);
    } finally {
      random.mockRestore();
    }
  });
});
