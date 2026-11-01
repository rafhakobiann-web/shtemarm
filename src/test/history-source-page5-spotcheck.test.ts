import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Choice = { n?: string; num?: number; page?: number; source_run?: number; stem: string; options: Record<string, string>; answer: string };

const source = JSON.parse(readFileSync("public/data/history-bank-book1.json", "utf8")) as { questions: Choice[] };
const book = JSON.parse(readFileSync("public/data/history-book1.json", "utf8")) as {
  sections: { units: { id: string; questions?: Choice[] }[] }[];
};

/** Manually compared question wording and options to the user-supplied
 * patm-1.pdf, printed p.5. This does NOT verify the printed answer key or
 * every page of the book: test keys only agree across repository files.
 */
describe("Armenian History I: original PDF p.5 import spot check", () => {
  const unit = book.sections.flatMap(s => s.units).find(u => u.id === "1-1-Ա-1");
  const bankItem = (n: number) => source.questions.find(q => q.source_run === 0 && q.num === n);
  const bookItem = (n: number) => unit?.questions?.find(q => q.n === String(n));

  it("keeps both line-wrapped words intact in source and book copies", () => {
    for (const n of [10, 12]) {
      const fromBank = bankItem(n);
      const fromBook = bookItem(n);
      expect(fromBank?.page, `source page of #${n}`).toBe(5);
      expect(fromBook?.stem, `wording of #${n}`).toBe(fromBank?.stem);
      expect(fromBook?.options, `choices of #${n}`).toEqual(fromBank?.options);
      expect(fromBook?.answer, `repository key of #${n}`).toBe(fromBank?.answer);
    }
    expect(bookItem(10)?.stem).toContain("Վանի թագավորության");
    expect(bookItem(10)?.stem).not.toContain("թագա վորության");
    expect(bookItem(12)?.stem).toContain("անհաջողություն");
    expect(bookItem(12)?.stem).not.toContain("անհաջողու թյուն");
  });

  it("preserves two independently checked printed choice snippets", () => {
    expect(bookItem(10)?.options["1"]).toBe("Ք. ա. 743 թ.");
    expect(bookItem(12)?.options["4"]).toBe("Ք. ա. 714 թ.");
  });
});
