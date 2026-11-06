import { describe, expect, it } from "vitest";
import { enhanceMathText, splitMath } from "./MathText";

describe("math formula parsing", () => {
  it("recognizes inline dollar and parenthesized TeX", () => {
    const parts = splitMath("Արժեքը $\\frac{1}{2}$ և \\(x^2\\) է");
    expect(parts.filter(p => p.math).map(p => p.text)).toEqual(["\\frac{1}{2}", "x^2"]);
  });
  it("recognizes both block delimiters", () => {
    const parts = splitMath("$$x^2+1$$\n\\[\\sqrt{9}\\]");
    expect(parts.filter(p => p.math).map(p => p.display)).toEqual([true, true]);
  });
  it("does not alter already delimited formulas", () => {
    expect(splitMath("$x^2$")[0]).toMatchObject({ math: true, text: "x^2" });
  });
  it("upgrades simple plain-text powers, roots and fractions", () => {
    expect(enhanceMathText("x² + √(9) + 1/2")).toContain("$x^{2}$");
    expect(enhanceMathText("√(9)")).toContain("$\\sqrt{9}$");
  });
  it("preserves restored PDF formula expressions for inline rendering", () => {
    const source = "Source: $f(x)=e^x(-x^2+x+1)$; $f(x)=x\\lvert x\\rvert$; $45^\\circ$";
    const formulas = splitMath(source).filter(piece => piece.math).map(piece => piece.text);
    expect(formulas).toEqual(["f(x)=e^x(-x^2+x+1)", "f(x)=x\\lvert x\\rvert", "45^\\circ"]);
  });
});
