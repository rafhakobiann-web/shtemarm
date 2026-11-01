import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type SourceChoice = {
  num: number;
  page: number;
  source_run: number;
  options: Record<string, string>;
  answer: string;
};
type BookChoice = {
  n: string;
  options: Record<string, string>;
  answer: string;
};

const source = JSON.parse(readFileSync("public/data/history-bank-book1.json", "utf8")) as {
  questions: SourceChoice[];
};
const book = JSON.parse(readFileSync("public/data/history-book1.json", "utf8")) as {
  sections: { units: { id: string; questions?: BookChoice[] }[] }[];
};

/**
 * Small manual cross-check against user-supplied patm-1.pdf, printed page 4:
 * 2017, sixth revised edition, 448 pages.
 *
 * Only option strings below were independently checked from the PDF page.
 * Answer keys here are compared between the two repository JSON files;
 * their correctness against the printed answer table is NOT established by
 * these tests. Do not call the complete book source-verified.
 */
describe("Armenian History I: original PDF p.4 spot check", () => {
  const unit = book.sections.flatMap(s => s.units).find(u => u.id === "1-1-Ա-1");
  const sourceQuestion = (n: number) =>
    source.questions.find(q => q.source_run === 0 && q.num === n);
  const bookQuestion = (n: number) => unit?.questions?.find(q => q.n === String(n));

  it("preserves the printed question IDs and short verified option snippets", () => {
    const checked: [number, string, string][] = [
      [2, "2", "Ք. ա. XX–XVIII դդ."],
      [5, "2", "Ք. ա. XXI դարում"],
      [6, "1", "Ք. ա. մոտ 835–825 թթ."],
      [7, "4", "Ք. ա. մոտ 825–810 թթ."],
      [8, "4", "Ք. ա. մոտ 810–786 թթ."],
      [9, "4", "Ք. ա. 786–764 թթ."],
    ];
    for (const [n, key, printedOption] of checked) {
      expect(sourceQuestion(n)?.page, `source page for #${n}`).toBe(4);
      expect(sourceQuestion(n)?.options[key], `source option #${n}`).toBe(printedOption);
      expect(bookQuestion(n)?.options[key], `book option #${n}`).toBe(printedOption);
      expect(bookQuestion(n)?.options, `source-bank options #${n}`).toEqual(sourceQuestion(n)?.options);
      expect(bookQuestion(n)?.answer, `imported key #${n}`).toBe(sourceQuestion(n)?.answer);
    }
  });
});
