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

  it("recovers two genuinely missing English exercises and matches the printed answer key", () => {
    const second = englishQuestion(2, "2-3-162", "162");
    expect(second.stem).toBe("Tommy told _________ lie. He was ashamed of himself.");
    expect(second.options).toEqual({ a: "the", b: "a", c: "an", d: "-" });
    expect(second.answer).toBe("b");
    const third = englishQuestion(3, "3-3-124", "124");
    expect(third.stem).toContain("I suggest that we _____ to the disco.");
    expect(third.options).toEqual({ a: "gone", b: "will go", c: "go", d: "going" });
    expect(third.answer).toBe("c");
  });

  it("restores printed English II section 3 item 181 and English III item 125", () => {
    const second = englishQuestion(2, "2-3-181", "181");
    expect(second.stem).toContain("very proud and happy when I graduated");
    expect(second.options).toEqual({a: "being", b: "to be", c: "was I", d: "I was being"});
    expect(second.answer).toBe("a"); // English II printed answer table p. 326
    expect(second.source_page).toBe(144);

    const third = englishQuestion(3, "3-3-125", "125");
    expect(third.stem).toContain("the wrong paper");
    expect(third.options).toEqual({a: "same", b: "the same", c: "such an", d: "that"});
    expect(third.answer).toBe("b"); // English III printed answer table p. 295
    expect(third.source_page).toBe(107);
  });

  it("restores remaining English II section 3 questions 231 and 290", () => {
    const q231 = englishQuestion(2, "2-3-231", "231");
    expect(q231.stem).toContain("when Colin asked me");
    expect(q231.options).toEqual({
      a: "had sat hard down", b: "had sat down hardly",
      c: "had hardly sat down", d: "had hard sat down",
    });
    expect(q231.answer).toBe("c"); // English II printed answer table p. 327
    expect(q231.source_page).toBe(154);

    const q290 = englishQuestion(2, "2-3-290", "290");
    expect(q290.stem).toContain("post office");
    expect(q290.options).toEqual({
      a: "to ask", b: "asking", c: "to be asked", d: "being asked",
    });
    expect(q290.answer).toBe("a"); // English II printed answer table p. 327
    expect(q290.source_page).toBe(166);
  });

  it("recovers English III section 3 printed questions 126–130 from page 108", () => {
    const expected: Record<string, { answer: string; options: Record<string, string> }> = {
      "126": { answer: "d", options: {a:"I shall be able", b:"I will be able", c:"will be able I", d:"shall I be able"} },
      "127": { answer: "b", options: {a:"to put", b:"putting", c:"being put", d:"to have put"} },
      "128": { answer: "a", options: {a:"Where else", b:"When else", c:"Where other", d:"What other place"} },
      "129": { answer: "c", options: {a:"little", b:"some little", c:"a little", d:"a few"} },
      "130": { answer: "d", options: {a:"on radio", b:"with the radio", c:"by the radio", d:"on the radio"} },
    };
    for (const [n, check] of Object.entries(expected)) {
      const q = englishQuestion(3, `3-3-${n}`, n);
      expect(q.source_page).toBe(108);
      expect(q.answer).toBe(check.answer);
      expect(q.options).toEqual(check.options);
      expect(q.stem).toMatch(/_{4,}/);
    }
  });

  it("restores all 11 printed English Section 5 questions using the supplied original PDFs", () => {
    // Printed sources: angl-2.pdf pp. 195, 202; angl-3.pdf pp. 172–175.
    // Printed answer tables: angl-2.pdf p. 329, angl-3.pdf p. 297.
    const restored = [
      { volume: 2, number: 59, page: 195, answer: "d", correct: "whose" },
      { volume: 2, number: 95, page: 202, answer: "c", correct: "Despite" },
      { volume: 3, number: 104, page: 172, answer: "d", correct: "What I want to know is" },
      { volume: 3, number: 105, page: 172, answer: "a", correct: "No one else but me" },
      { volume: 3, number: 106, page: 172, answer: "c", correct: "that is typed with only the left hand" },
      { volume: 3, number: 107, page: 172, answer: "b", correct: "in order to reach it" },
      { volume: 3, number: 108, page: 173, answer: "a", correct: "who lived in Utah" },
      { volume: 3, number: 109, page: 173, answer: "d", correct: "in order to buy a couple of gallons of gasoline" },
      { volume: 3, number: 110, page: 173, answer: "c", correct: "Although the Chumash were good fishers" },
      { volume: 3, number: 116, page: 174, answer: "d", correct: "in order that everyone should know" },
      { volume: 3, number: 122, page: 175, answer: "b", correct: "I didn’t get the job I had applied for" },
    ];
    expect(restored).toHaveLength(11);
    for (const row of restored) {
      const question = englishQuestion(row.volume, `${row.volume}-5-${row.number}`, String(row.number));
      expect(question, `Book ${row.volume} / Section 5 / ${row.number}`).toBeDefined();
      expect(question.n).toBe(String(row.number));
      expect(question.source_page).toBe(row.page);
      expect(question.answer).toBe(row.answer);
      expect(Object.keys(question.options)).toEqual(["a", "b", "c", "d"]);
      expect(question.options[question.answer]).toBe(row.correct);
      expect(question.stem.trim()).not.toBe("");
      expect(Object.values(question.options).every((choice: any) => typeof choice === "string" && choice.trim().length > 0)).toBe(true);
    }
    for (const volume of [2, 3]) {
      const section = book(`book${volume}.json`).sections.find((s: any) => s.n === 5);
      const ids = section.units.flatMap((u: any) => u.questions?.map((q: any) => Number(q.n)) ?? []);
      expect(ids).toEqual(Array.from({ length: 160 }, (_, i) => i + 1));
      expect(new Set(ids).size).toBe(160);
    }
  });

  it("fixes Math I task 7 subquestion 3: opposite, not reciprocal", () => {
    const q = math["matem-1"]["1-1"]["7"][2];
    const indexTask = mathIndex.books["matem-1"].sections
      .find((s: any) => s.chapter === 1 && s.section === 1)
      .tasks.find((t: any) => t.task === 7);
    expect(q.prompt).toContain("առաջին թվի հակադիրի");
    expect(q.prompt).not.toContain("առաջին թվի հակադարձի");
    expect(q.options[3]).toBe("6"); // -12 + 18 = 6
    expect(indexTask.answers[2]).toBe("4");
  });

  it("records the remaining numbering gaps in linear English sections", () => {
    const expected = {
      "book2-3": [],
      "book2-5": [],
      "book3-3": [],
      "book3-5": [],
    };
    const actual: Record<string, number[]> = {};
    for (const volume of [2, 3]) {
      const data = book(`book${volume}.json`);
      for (const sectionNumber of [3, 5]) {
        const section = data.sections.find((s: any) => s.n === sectionNumber);
        const used = new Set<number>(section.units.flatMap((unit: any) =>
          (unit.kind === "mc" || unit.kind === "num")
            ? unit.questions.map((q: any) => Number(q.n)) : [],
        ));
        const max = sectionNumber === 3 ? 300 : 160;
        actual[`book${volume}-${sectionNumber}`] =
          Array.from({ length: max }, (_, i) => i + 1).filter((n) => !used.has(n));
      }
    }
    expect(actual).toEqual(expected);
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

  it("restores both mixed-fraction choices in Math II task 4, printed page 7", () => {
    const task = math["matem-2"]["1-1"]["4"];
    expect(task[0].options).toEqual(["6", "14", "12 2/3", "2"]);
    expect(task[3].options).toEqual(["10 2/3", "6", "6 2/3", "1/15"]);
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
    expect(counts).toEqual([1601, 1515, 1297]);
    for (const volume of volumes) for (const section of volume.sections)
      for (const unit of section.units) if (unit.kind === "mc")
        for (const q of unit.questions) {
          expect(q.options).toHaveProperty(q.answer);
          expect(q.options[q.answer]?.trim(), `${unit.id}#${q.n}`).toBeTruthy();
        }
  });
});
