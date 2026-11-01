import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

type Choice = { n: string; stem: string; options: Record<string, string>; answer: string };
type Unit = { id: string; kind: string; questions?: Choice[] };
type Book = { sections: { units: Unit[] }[] };

function readBook(part: 1 | 2 | 3): Book {
  return JSON.parse(readFileSync(`public/data/book${part}.json`, "utf8"));
}

function getQuestion(part: 1 | 2 | 3, unitId: string, number: string): Choice {
  const unit = readBook(part).sections.flatMap(s => s.units).find(u => u.id === unitId);
  expect(unit, `English book ${part} unit ${unitId}`).toBeDefined();
  const question = unit?.questions?.find(q => q.n === number);
  expect(question, `English book ${part} unit ${unitId} question ${number}`).toBeDefined();
  return question!;
}

describe("original English book option restorations", () => {
  it("restores Book II, Section 1, Text 5, question 1 options in printed order", () => {
    const question = getQuestion(2, "2-1-Text5", "1");
    expect(question.options).toEqual({
      a: "universal",
      b: "ordinary",
      c: "unusual",
      d: "common",
    });
    expect(question.answer).toBe("c");
  });

  it("restores Book III, Section 5, question 136 first alternative to its own option", () => {
    const question = getQuestion(3, "3-5-136", "136");
    expect(question.stem).toMatch(/lose weight.*_+/);
    expect(question.stem).not.toContain("so I'm not going to eat much");
    expect(question.options.a).toBe("so I'm not going to eat much");
    expect(question.answer).toBe("a");
  });

  it("retains valid answer references in every English volume", () => {
    for (const part of [1, 2, 3] as const) {
      const book = readBook(part);
      for (const section of book.sections) for (const unit of section.units) {
        if (unit.kind !== "mc") continue;
        for (const question of unit.questions ?? []) {
          expect(Object.hasOwn(question.options ?? {}, question.answer),
            `Book ${part}, unit ${unit.id}, number ${question.n}`).toBe(true);
        }
      }
    }
  });
});
