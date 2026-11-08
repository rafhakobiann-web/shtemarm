import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { armenianSourceChapters } from "@/lib/armenian-source-outline";

describe("Armenian II–IV original Shtemarm topic-practice expansion", () => {
  for (const volume of [2,3,4] as const) {
    it(`volume ${volume}: keeps the original starter unit and adds 21 clearly authored tasks`, () => {
      const book = JSON.parse(readFileSync(`public/data/armenian-book${volume}.json`, "utf8"));
      const source = armenianSourceChapters(volume);
      expect(book.id).toBe(40+volume);
      expect(book.sections).toHaveLength(8);
      const original = book.sections[0];
      expect(original.units[0].id).toBe(`${40+volume}-1`);
      expect(original.units[0].questions).toHaveLength(10);
      expect(original.instr_hy).toContain("Հեղինակային");
      const ids = new Set<string>(original.units.map((u: {id:string}) => u.id));
      for (const section of book.sections.slice(1)) {
        expect(section.title).toBe(source[section.n-1].title);
        expect(section.instr_hy).toContain("պաշտոնական բնօրինակի առաջադրանքներ չեն");
        expect(section.units).toHaveLength(1);
        const unit = section.units[0];
        expect(unit.id).toBe(`ar${volume}-authored-topic-${section.n}`);
        expect(unit.kind).toBe("mc");
        expect(unit.questions).toHaveLength(3);
        expect(ids.has(unit.id)).toBe(false);
        ids.add(unit.id);
        const nums = new Set<string>();
        for (const question of unit.questions) {
          expect(question.stem.length).toBeGreaterThan(10);
          expect(Object.keys(question.options)).toEqual(["1","2","3","4"]);
          expect(new Set(Object.values(question.options)).size).toBe(4);
          expect(question.options[question.answer]).toBeTruthy();
          expect(nums.has(question.n)).toBe(false);
          nums.add(question.n);
        }
      }
      expect(book.sections.flatMap((s: {units: {questions: unknown[]}[]}) =>
        s.units.flatMap(u => u.questions))).toHaveLength(31);
      expect(ids.size).toBe(8);
    });
  }

  it("the three books do not silently reuse the same new question IDs or first prompts", () => {
    const ids: string[] = [];
    const firstStems: string[] = [];
    for (const v of [2,3,4]) {
      const book = JSON.parse(readFileSync(`public/data/armenian-book${v}.json`,"utf8"));
      for (const sec of book.sections.slice(1)) {
        ids.push(sec.units[0].id);
        firstStems.push(sec.units[0].questions[0].stem);
      }
    }
    expect(new Set(ids).size).toBe(21);
    expect(new Set(firstStems).size).toBe(21);
  });
});
