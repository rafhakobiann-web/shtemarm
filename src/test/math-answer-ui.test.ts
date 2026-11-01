import { describe, expect, it } from "vitest";
import { canChangeMathAnswer, isMathAnswerRevealed } from "@/lib/math-answer-ui";

describe("math exam answer presentation", () => {
  it("allows changing a multiple-choice answer until the exam is submitted", () => {
    expect(isMathAnswerRevealed("2", false, true)).toBe(false);
    expect(canChangeMathAnswer("2", false, true)).toBe(true);
    expect(isMathAnswerRevealed("2", true, true)).toBe(true);
    expect(canChangeMathAnswer("2", true, true)).toBe(false);
  });

  it("does not prematurely grade numeric drafts, including an empty draft", () => {
    expect(isMathAnswerRevealed("1200", false, true)).toBe(false);
    expect(canChangeMathAnswer("1200", false, true)).toBe(true);
    expect(isMathAnswerRevealed("", false, true)).toBe(false);
    expect(isMathAnswerRevealed(undefined, true, true)).toBe(true);
  });

  it("preserves immediate game-mode feedback and lock-after-answer behavior", () => {
    expect(isMathAnswerRevealed(undefined, false, false)).toBe(false);
    expect(canChangeMathAnswer(undefined, false, false)).toBe(true);
    expect(isMathAnswerRevealed("T", false, false)).toBe(true);
    expect(canChangeMathAnswer("T", false, false)).toBe(false);
  });
});
