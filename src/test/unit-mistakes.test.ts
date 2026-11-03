import { beforeEach, describe, expect, it } from "vitest";
import { questionAnswerKey, type Unit } from "@/lib/books";
import {
  getUnitMistakes, isUnitRetryCorrect, markUnitMistakeMastered,
  recordUnitMistakes, removeUnitMistake, subjectForBookId,
} from "@/lib/unitMistakes";

const multipleChoice: Unit = {
  id: "book-1:2:exercise-4",
  kind: "mc",
  label: "4",
  passage: "Source passage",
  questions: [
    { n: "7", stem: "First printed 7", options: { "1": "A", "2": "B" }, answer: "2" },
    { n: "7", stem: "Second printed 7", options: { "1": "C", "2": "D" }, answer: "1" },
  ],
};
const numeric: Unit = {
  id: "bio3:6:42", kind: "num", label: "42", passage: "",
  questions: [{ n: "1", stem: "Calculate", answer: "1200" }],
};
const match: Unit = {
  id: "history:4:match", kind: "match", label: "11", passage: "Match terms",
  answer: { A: 1, B: 2 },
};

describe("Shared mistake notebook for subject practice and exams", () => {
  beforeEach(() => window.localStorage.clear());

  it("records only answered wrong MC items, preserving duplicate printed numbers", () => {
    const first = questionAnswerKey(multipleChoice as Extract<Unit, {kind:"mc"}>, 0);
    const second = questionAnswerKey(multipleChoice as Extract<Unit, {kind:"mc"}>, 1);
    expect(first).not.toBe(second);
    recordUnitMistakes("english", [multipleChoice], {
      [multipleChoice.id]: { mc: { [first]: "1", [second]: "1" } },
    });
    const recorded = getUnitMistakes();
    expect(recorded).toHaveLength(1);
    expect(recorded[0]?.id).toContain(first);
    expect(recorded[0]?.attempts).toBe(1);
    expect(recorded[0]?.unit.kind).toBe("mc");
  });

  it("does not save an unanswered question as a mistake", () => {
    recordUnitMistakes("biology", [numeric], {});
    recordUnitMistakes("biology", [numeric], { [numeric.id]: { mc: {} } });
    expect(getUnitMistakes()).toHaveLength(0);
  });

  it("supports numeric answer normalization, failed retries, mastery and removal", () => {
    recordUnitMistakes("biology", [numeric], { [numeric.id]: { mc: { "1": "200" } } });
    const item = getUnitMistakes()[0]!;
    expect(markUnitMistakeMastered(item.id, item.subject, { mc: { "1": "3" } })).toBe(false);
    expect(getUnitMistakes()[0]?.mastered).toBe(false);
    expect(markUnitMistakeMastered(item.id, item.subject, { mc: { "1": "1 200" } })).toBe(true);
    expect(getUnitMistakes()[0]?.mastered).toBe(true);
    removeUnitMistake(item.id, item.subject);
    expect(getUnitMistakes()).toHaveLength(0);
  });

  it("reviews compound questions as one answerable task", () => {
    recordUnitMistakes("history", [match], { [match.id]: { match: { A: 2, B: 1 } } });
    expect(getUnitMistakes()).toHaveLength(1);
    expect(isUnitRetryCorrect(match, { match: { A: 1, B: 2 } })).toBe(true);
    recordUnitMistakes("history", [match], { [match.id]: { match: { A: 1, B: 2 } } });
    expect(getUnitMistakes()[0]?.mastered).toBe(true);
  });

  it("maps book subjects independently of translated display titles", () => {
    expect(subjectForBookId(1)).toBe("english");
    expect(subjectForBookId("22")).toBe("history");
    expect(subjectForBookId(34)).toBe("biology");
    expect(subjectForBookId(41)).toBe("armenian");
    expect(subjectForBookId(61)).toBe("physics");
  });
});
