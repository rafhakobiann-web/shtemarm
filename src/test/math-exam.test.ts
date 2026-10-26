import { describe, expect, it } from "vitest";
import { buildCustom, pickSample, type Index } from "@/routes/math.index";

function makeIndex(tasksPerBook = 80): Index {
  const makeBook = (bookId: string) => ({
    title: bookId,
    sections: [{
      chapter: 1,
      section: 1,
      title: "Թեստային բաժին",
      tasks: Array.from({ length: tasksPerBook }, (_, i) => ({
        task: i + 1,
        segments: [{ page: 1, y0: 1, y1: 20 }],
        answers: ["1"],
        sub_count: 1,
      })),
    }],
  });
  return {
    books: {
      "matem-1": makeBook("matem-1"),
      "matem-2": makeBook("matem-2"),
    },
  };
}

describe("math exam construction", () => {
  it("creates exactly 65 unique questions with 32 from Part 1 and 33 from Part 2", () => {
    const exam = pickSample(makeIndex(), new Set());
    expect(exam).toHaveLength(65);
    expect(new Set(exam.map((item) => item.id)).size).toBe(65);
    expect(exam.filter((item) => item.book === "matem-1")).toHaveLength(32);
    expect(exam.filter((item) => item.book === "matem-2")).toHaveLength(33);
  });

  it("avoids repeating questions from the previous exam when enough alternatives exist", () => {
    const index = makeIndex(80);
    const first = pickSample(index, new Set());
    const second = pickSample(index, new Set(first.map((item) => item.id)));
    const previousIds = new Set(first.map((item) => item.id));
    expect(second).toHaveLength(65);
    expect(second.every((item) => !previousIds.has(item.id))).toBe(true);
  });

  it("builds custom tests from selected sections and returns them in book order", () => {
    const index = makeIndex(12);
    const custom = buildCustom(index, ["matem-1"], new Set(["matem-1:1:1"]), 5);
    expect(custom).toHaveLength(5);
    expect(custom.every((item) => item.book === "matem-1")).toBe(true);
    const tasks = custom.map((item) => item.task);
    expect(tasks).toEqual([...tasks].sort((a, b) => a - b));
  });

  it("returns only the questions available in selected sections", () => {
    const index = makeIndex(2);
    const custom = buildCustom(index, ["matem-1"], new Set(["matem-1:1:1"]), 5);
    expect(custom).toHaveLength(2);
  });

  it("fails clearly when either book cannot supply its required exam quota", () => {
    expect(() => pickSample(makeIndex(10), new Set())).toThrow();
  });
});
