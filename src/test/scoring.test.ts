import { describe, expect, it } from "vitest";
import { normNum, scoreUnit, type UnitAnswer } from "@/components/UnitCard";
import type { Unit } from "@/lib/books";

describe("answer scoring", () => {
  it("scores each multiple-choice question against its keyed answer", () => {
    const unit: Unit = {
      id: "mc-1", label: "Choose", kind: "mc", passage: "",
      questions: [
        { n: "1", stem: "Q1", options: { A: "One", B: "Two" }, answer: "A" },
        { n: "2", stem: "Q2", options: { A: "One", B: "Two" }, answer: "B" },
      ],
    };
    expect(scoreUnit(unit, { mc: { "1": "A", "2": "A" } })).toEqual({
      got: 1, total: 2, per: [true, false],
    });
  });

  it("treats spaces in numeric answers as formatting, not value", () => {
    expect(normNum("1 200")).toBe("1200");
    const unit: Unit = {
      id: "num-1", label: "Enter", kind: "num", passage: "",
      questions: [{ n: "1", stem: "Enter the number", answer: "1 200" }],
    };
    expect(scoreUnit(unit, { mc: { "1": "1200" } }).got).toBe(1);
    expect(scoreUnit(unit, { mc: { "1": "1201" } }).got).toBe(0);
  });

  it("scores selected sets regardless of selection order, but not duplicates", () => {
    const unit: Unit = { id: "set-1", label: "Set", kind: "set", passage: "", answer: [2, 4], count: 5 };
    expect(scoreUnit(unit, { nums: [4, 2] }).got).toBe(1);
    expect(scoreUnit(unit, { nums: [2, 2, 4] }).got).toBe(0);
  });

  it("requires sequence answers in the exact order", () => {
    const unit: Unit = { id: "seq-1", label: "Sequence", kind: "seq", passage: "", answer: [2, 1] };
    expect(scoreUnit(unit, { nums: [2, 1] }).got).toBe(1);
    expect(scoreUnit(unit, { nums: [1, 2] }).got).toBe(0);
  });

  it("requires every matching pair to be correct", () => {
    const unit: Unit = { id: "match-1", label: "Match", kind: "match", passage: "", answer: { A: 2, B: 1 } };
    expect(scoreUnit(unit, { match: { A: 2, B: 1 } }).got).toBe(1);
    expect(scoreUnit(unit, { match: { A: 2, B: 3 } }).got).toBe(0);
  });
});
