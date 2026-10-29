import { describe, expect, it } from "vitest";
import { GRAMMAR_DEEP_DIVES } from "@/lib/grammarDeepDives";
import { getGrammarTopic } from "@/lib/grammarHandbook";

describe("step-by-step grammar explanations", () => {
  it("has complete explanations in all supported languages for every deep dive", () => {
    expect(Object.keys(GRAMMAR_DEEP_DIVES).length).toBeGreaterThanOrEqual(8);
    for (const [id, translations] of Object.entries(GRAMMAR_DEEP_DIVES)) {
      expect(getGrammarTopic(id), id).toBeDefined();
      for (const lang of ["hy", "en", "ru"] as const) {
        const detail = translations[lang];
        expect(detail.steps.length).toBeGreaterThanOrEqual(3);
        for (const step of detail.steps) expect(step.length).toBeGreaterThan(25);
        expect(detail.contrast.length).toBeGreaterThan(35);
        expect(detail.caution.length).toBeGreaterThan(35);
      }
    }
  });
});
