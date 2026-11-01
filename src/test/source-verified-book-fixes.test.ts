import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Page-verified corrections from the 2017 English II / 2018 English III
 * question books, and the 2017 Math I book. These small regressions protect
 * exact source wording; they do NOT certify all other book text or permission
 * to republish those editions.
 *
 * English II printed page 11: https://cdn.shtemaran.am/shtemarans/angl-2.pdf
 * English III printed page 177: https://cdn.shtemaran.am/shtemarans/angl-3.pdf
 * Mathematics I printed page 6; answer table printed page 13:
 * https://cdn.shtemaran.am/shtemarans/matem-1.pdf
 */
const book = (name: string) =>
  JSON.parse(readFileSync(`public/data/${name}`, "utf8"));
const englishQuestion = (volume: number, unitId: string, number: string) =>
  book(`book${volume}.json`).sections.flatMap((s: any) => s.units)
    .find((u: any) => u.id === unitId)?.questions.find((q: any) => q.n === number);
const math = book("math-text-questions.json");
const mathIndex = book("math-books-index.json");

describe("source-verified English and Mathematics book corrections", () => {
  it("restores every choice and the correct answer for English II / Text 5 / question 1", () => {
    const q = englishQuestion(2, "2-1-Text5", "1");
    expect(q.stem).toBe("The word unique in line 5 is closest in meaning to");
    expect(q.options).toEqual({
      a: "universal",
      b: "ordinary",
      c: "unusual",
      d: "common",
    });
    expect(q.answer).toBe("c");
  });

  it("separates English III / section 5 / question 136 from its first choice", () => {
    const q = englishQuestion(3, "3-5-136", "136");
    expect(q.stem).toBe("I'd like to lose weight ________________.");
    expect(q.options).toEqual({
      a: "so I'm not going to eat much",
      b: "if I am going to eat much",
      c: "unless I am not going to eat much",
      d: "because I am going to eat much",
    });
    expect(q.answer).toBe("a");
  });

  it("restores all 4 printed choices where Math I section 1 task 1 was corrupted", () => {
    const rows = math["matem-1"]["1-1"]["1"];
    expect(rows).toHaveLength(4);
    expect(rows[3].options).toEqual([
      "2/5, 3/7, 1/2",
      "3/7, 1/2, 2/5",
      "1/2, 3/7, 2/5",
      "2/5, 1/2, 3/7",
    ]);
    expect(rows[0].prompt).toContain("այնուհետև");
    expect(rows[1].prompt).toContain("9-ի բազմապատիկ");
    expect(rows[3].prompt).toContain("աճման կարգով");
  });

  it("restores decreasing-order choices and the two-prime-factors prompt", () => {
    const task2 = math["matem-1"]["1-1"]["2"];
    const task3 = math["matem-1"]["1-1"]["3"];
    expect(task2[2].options).toEqual([
      "0,75; 2/3; 3/5",
      "3/5; 2/3; 0,75",
      "2/3; 0,75; 3/5",
      "2/3; 3/5; 0,75",
    ]);
    expect(task3[3].prompt).toContain("երկու պարզ թվերի արտադրյալ");
    expect(task3[3].prompt).not.toContain("չի բաժանվում 3-ի");
    expect(task3[3].options).toEqual(["102", "106", "135", "117"]);
  });

  it("retains all 5,676 indexed math questions and official answer columns", () => {
    const counts = Object.fromEntries(Object.entries(mathIndex.books).map(([id, data]: [string, any]) =>
      [id, data.sections.flatMap((s: any) => s.tasks).reduce((n: number, task: any) => n + task.sub_count, 0)]));
    expect(counts).toEqual({ "matem-1": 2640, "matem-2": 3036 });
    const section = mathIndex.books["matem-1"].sections.find((s: any) =>
      s.chapter === 1 && s.section === 1);
    expect(section.tasks.slice(0, 3).map((t: any) => t.answers)).toEqual([
      ["2", "2", "3", "1"],
      ["4", "2", "1", "1"],
      ["3", "4", "4", "2"],
    ]);
  });

  it("preserves all English records and does not allow empty correct choices", () => {
    const volumes = [1, 2, 3].map((id) => book(`book${id}.json`));
    const counts = volumes.map((v: any) => v.sections.flatMap((s: any) => s.units)
      .reduce((n: number, u: any) => n + (u.questions?.length ?? 1), 0));
    expect(counts).toEqual([1601, 1509, 1281]);
    for (const volume of volumes) for (const section of volume.sections)
      for (const unit of section.units) if (unit.kind === "mc")
        for (const q of unit.questions) {
          expect(q.options).toHaveProperty(q.answer);
          expect(q.options[q.answer]?.trim(), `${unit.id}#${q.n}`).toBeTruthy();
        }
  });
});
