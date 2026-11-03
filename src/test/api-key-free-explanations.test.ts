import { describe, expect, it } from "vitest";
import { reliableEnglishFallback } from "../lib/reliableEnglishFallback";

const base = {
  instruction: "Choose the correct answer",
  passage: "",
  question: "Which form is correct?",
  correct: "B",
  chosen: "A",
};

describe("API-key-free explanation fallback", () => {
  it("does not invent a question-specific proof when none is verified", () => {
    const text = reliableEnglishFallback(base, "en");
    expect(text).toContain("B");
    expect(text).toContain("not yet available");
    expect(text).toContain("does not match");
  });
  it("supports Armenian, English and Russian", () => {
    for (const locale of ["hy", "en", "ru"] as const) {
      expect(reliableEnglishFallback(base, locale)).toContain("B");
    }
  });
  it("only presents grammar guidance as general, not verified proof", () => {
    const text = reliableEnglishFallback({ ...base, instruction: "Present perfect" }, "en");
    expect(text).toContain("general guidance");
  });
});
