import { describe, expect, it } from "vitest";
import { buildExplanationSteps } from "@/lib/explanation-steps";

describe("AI explanation step segmentation", () => {
  it("turns four numbered paragraphs into four navigable steps", () => {
    const input = "1. Given values\n2. Apply $a^2+b^2=c^2$\n3. Check the answer\n4. Common mistake";
    const steps = buildExplanationSteps([{kind:"text",value:input}]);
    expect(steps).toHaveLength(4);
    expect(steps.map(step=>step.value)).toEqual([
      "Given values","Apply $a^2+b^2=c^2$","Check the answer","Common mistake"
    ]);
  });

  it("supports Armenian, Russian and English numbering without blank lines", () => {
    const steps = buildExplanationSteps([{kind:"text",value:
      "Քայլ 1. Տրված է կողմը\nШаг 2. Используем формулу\nStep 3. We check the result"
    }]);
    expect(steps.map(s=>s.value)).toEqual([
      "Տրված է կողմը","Используем формулу","We check the result"
    ]);
  });

  it("retains introductions, paragraphs, LaTeX and every fenced diagram/code block", () => {
    const blocks = [
      {kind:"text" as const,value:"Important idea\n\n1. Solve the equation\n$\\frac{a}{b}$\n2. Verify the result"},
      {kind:"diagram" as const,value:'{"type":"triangle","labels":["A","B","C"]}'},
      {kind:"code" as const,value:"not executable code"},
    ];
    const steps=buildExplanationSteps(blocks);
    expect(steps).toHaveLength(5);
    expect(steps[0].value).toBe("Important idea");
    expect(steps[1].value).toContain("$\\frac{a}{b}$");
    expect(steps[2].value).toBe("Verify the result");
    expect(steps[3].kind).toBe("diagram");
    expect(steps[4].kind).toBe("code");
  });

  it("does not treat decimals or numbers inside formulas as step boundaries", () => {
    const steps=buildExplanationSteps([{kind:"text",value:"Use 1.25 as the factor\nThen compute 3.14 × 2"}]);
    expect(steps).toHaveLength(1);
    expect(steps[0].value).toContain("1.25");
  });

  it("keeps spaced-out supporting calculations on the numbered step instead of creating extra pages", () => {
    const steps = buildExplanationSteps([{kind:"text",value:
      "1. Find the unknown\\n\\nUse $x + 2 = 5$\\n\\nSubtract two from both sides\\n2. Verify\\n\\nSubstitute the answer"
    }]);
    expect(steps).toHaveLength(2);
    expect(steps[0].value).toContain("Subtract two from both sides");
    expect(steps[1].value).toContain("Substitute the answer");
  });

  it("omits empty paragraphs but never fabricates content", () => {
    expect(buildExplanationSteps([{kind:"text",value:"\n\n"}])).toEqual([]);
    expect(buildExplanationSteps([{kind:"text",value:"Only one paragraph"}])).toEqual([
      {kind:"text",value:"Only one paragraph"}
    ]);
  });
});
