import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { enhanceMathText, splitMath, RichText, MathContent } from "@/components/MathText";
import { readDiagram, MathDiagram } from "@/components/MathDiagram";
import { splitExplanation } from "@/components/RichExplanation";

describe("Math explanations + LaTeX renderer", () => {
  it("splits all four TeX delimiter styles without eating Armenian text", () => {
    const parts = splitMath("Գտիր $x^2$ և $$\\frac{a}{b}$$ կամ \\(\\sqrt{5}\\) և \\[x=3\\]");
    expect(parts.filter(p => p.math).map(p => p.text)).toEqual(["x^2","\\frac{a}{b}","\\sqrt{5}","x=3"]);
    expect(parts.filter(p=>p.math).map(p=>p.display)).toEqual([false,true,false,true]);
  });
  it("converts readable legacy math fractions and powers without changing the rest", () => {
    expect(enhanceMathText("Հաշվել 2/3 և x²")).toContain("$\\frac{2}{3}$");
    expect(enhanceMathText("Հաշվել x²")).toContain("$x^{2}$");
    expect(enhanceMathText("√(9)")).toContain("$\\sqrt{9}$");
  });
  it("retains plain legible fallback before KaTeX loads", () => {
    const output=renderToStaticMarkup(<MathContent text="x² և 1/2"/>);
    expect(output).toContain("x^{2}");
    const other=renderToStaticMarkup(<RichText text="$$\\sqrt{5}$$" katex={null}/>);
    expect(other).toContain("\\sqrt{5}");
  });
  it("renders safe diagrams as SVG without inserting AI HTML", () => {
    for (const input of [
      '{"type":"function","shape":"quadratic","a":1,"b":0,"c":-4}',
      '{"type":"triangle","labels":["A","B","C"]}',
      '{"type":"circle","radius":"r"}',
    ]) {
      const spec=readDiagram(input);
      expect(spec).not.toBeNull();
      const html=renderToStaticMarkup(<MathDiagram spec={spec!}/>);
      expect(html).toContain("<svg");
      expect(html).not.toContain("<script");
    }
    expect(readDiagram('{"type":"function","shape":"other","a":1,"b":2,"c":3}')).toBeNull();
    expect(readDiagram('{"type":"circle","radius":"<script>alert(1)</script>"}')).toBeNull();
    expect(readDiagram('{"type":"function","shape":"linear","a":1000000,"b":0,"c":0}')).toBeNull();
  });
  it("detects explanation diagrams but never trusts arbitrary markup", () => {
    const ticks=String.fromCharCode(96).repeat(3);
    const txt="1. Գտիր արմատները.\n\n" + ticks + "diagram\n" +
      '{"type":"function","shape":"linear","a":2,"b":1,"c":0}' + "\n" + ticks;
    const blocks=splitExplanation(txt);
    expect(blocks).toHaveLength(2);
    expect(blocks[1].kind).toBe("diagram");
    expect(splitExplanation(ticks+"text\n<script>alert(1)</script>\n"+ticks)[0].kind).toBe("code");
  });
});
