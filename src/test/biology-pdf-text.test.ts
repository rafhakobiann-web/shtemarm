import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { locatePdfQuestion, normalizeArmenianPdfText } from "@/lib/biology-pdf-text";
import type { BiologyOriginalChapter } from "@/lib/biology-source";

const chapter: BiologyOriginalChapter = {
  id: 1, title: "Sample", startPage: 5, endPage: 7, answerPages: [11,12],
  questionCount: 3, pageRuns: [[1,5],[3,7]], choiceKeys: "123", manualNumberingChecks: [],
};
const item = (str:string, x:number, baseline:number) => ({
  str, width:10, transform:[1,0,0,1,x,baseline],
});

describe("read literal text from a student-supplied official Biology PDF", () => {
  it("decodes ArmSCII-8 glyphs, not invented Armenian replacements", () => {
    expect(normalizeArmenianPdfText("Âí³ñÏí³Í")).toBe("Թվարկված");
    expect(normalizeArmenianPdfText("μÝáñáß")).toBe("բնորոշ");
    expect(normalizeArmenianPdfText("ï»ñ¨Ý»ñ")).toBe("տերևներ");
    expect(normalizeArmenianPdfText("Հայերեն")).toBe("Հայերեն");
  });

  it("extracts the correct source question and all four options without leaking adjacent questions", () => {
    const pageHeight = 689;
    const items = [
      item("1",42.24,550), item(". Âí³ñÏí³Í μÝáñáß",47.8,550),
      item("1) Ù»Ï",59.3,535), item("2) »ñÏáõ",59.3,523),
      item("3) »ñ»ù",59.3,511), item("4) ãáñë",59.3,499),
      item("2",42.24,476), item(". SECOND QUESTION",47.8,476),
      item("1) wrong",59.3,461),
    ];
    const q = locatePdfQuestion(chapter,1,5,488,pageHeight,items);
    expect(q.status).toBe("exact-page");
    expect(q.hasFourChoices).toBe(true);
    expect(q.stem).toContain("Թվարկված");
    expect(q.options).toEqual(["մեկ","երկու","երեք","չորս"]);
    expect(q.text).not.toContain("SECOND");
    expect(q.crop.top).toBeGreaterThan(0);
    expect(q.crop.bottom).toBeLessThan(pageHeight-40);
  });

  it("locates 56.4-point gutter labels on alternate official book pages", () => {
    const items = [
      item("3", 56.42, 533), item(". Âí³ñÏí³Í μÝáñáß", 63.7, 533),
      item("1) Ù»Ï", 70.2, 510), item("2) »ñÏáõ", 70.2, 498),
      item("3) »ñ»ù", 70.2, 486), item("4) ãáñë", 70.2, 474),
    ];
    const found = locatePdfQuestion(chapter, 3, 7, 488, 689, items);
    expect(found.status).toBe("exact-page");
    expect(found.text.startsWith("Թվարկված")).toBe(true);
    expect(found.text).not.toMatch(/^3\\s/);
    expect(found.hasFourChoices).toBe(true);
  });

  it("refuses to guess when printed ID is absent or repeated", () => {
    const items = [item("1",42.24,550),item("1",42.24,550),item("1) option",59.3,535)];
    const q = locatePdfQuestion(chapter,1,5,488,689,items);
    expect(q.status).toBe("unlocated");
    expect(q.sourceVerified).toBe(false);
    expect(q.text).toBe("");
  });

  it("never auto-extracts made-up options from an unrecognized response format", () => {
    const items = [
      item("1",42.24,550),item(". Âí³ñÏí³Í μÝáñáß",47.8,550),
      item("1) Ù»Ï",59.3,535),item("2) »ñÏáõ",59.3,523),
      item("2",42.24,490),
    ];
    const q = locatePdfQuestion(chapter,1,5,488,689,items);
    expect(q.hasFourChoices).toBe(false);
  });

  it("uses a verifiable local PDF and never embeds 3,525 copied texts in a published bank", () => {
    const reader=readFileSync("src/components/BiologyQuestionFromPdf.tsx","utf8");
    const source=readFileSync("src/lib/biology-pdf-text.ts","utf8");
    expect(reader).toContain("openLocalBiologyDocument");
    expect(reader).not.toContain("renderBiologyQuestionCrop");
    expect(reader).not.toContain("<canvas");
    expect(reader).not.toContain("<img");
    expect(reader).toContain("onTextReady");
    expect(reader).toContain("Պատասխանների տարբերակներ");
    expect(source).toContain('await import("pdfjs-dist")');
    expect(source).toContain('pdfjs.getDocument({ data: bytes');
    expect(reader).not.toMatch(/fetch\(/);
  });
});
