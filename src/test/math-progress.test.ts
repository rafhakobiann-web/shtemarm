import { describe, expect, it } from "vitest";
import { isOpenTask, isOptionAnswer, isRight } from "@/lib/math-progress";

describe("math answer handling", () => {
  it("normalizes numeric formatting without changing the value", () => {
    expect(isRight("1 200", "1200")).toBe(true);
    expect(isRight("1,5", "1.5")).toBe(true);
    expect(isRight("−3", "-3")).toBe(true);
    expect(isRight("1,5", "1.6")).toBe(false);
  });

  it("accepts statement selections in any order", () => {
    expect(isRight("1,3,5", "5, 3, 1")).toBe(true);
    expect(isRight("1,2,3,6", "6,3,2,1")).toBe(true);
  });

  it("rejects missing or repeated statement selections", () => {
    expect(isRight("1,3,5", "1,3")).toBe(false);
    expect(isRight("1,3,5", "1,3,3,5")).toBe(false);
    expect(isRight("1,3,5", "1,3,4")).toBe(false);
  });

  it("keeps option labels distinct from typed-answer tasks", () => {
    expect(isOptionAnswer("2")).toBe(true);
    expect(isOptionAnswer("T")).toBe(true);
    expect(isOptionAnswer("45")).toBe(false);
    expect(isOpenTask({ answers: ["1", "2", "3"] })).toBe(false);
    expect(isOpenTask({ answers: ["1", "45", "3"] })).toBe(true);
    expect(isOpenTask({ answers: null })).toBe(false);
  });
});
