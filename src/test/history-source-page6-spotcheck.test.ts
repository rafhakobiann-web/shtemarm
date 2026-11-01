import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Choice = { n?: string; num?: number; page?: number; source_run?: number; stem: string; options: Record<string, string>; answer: string };
const bank = JSON.parse(readFileSync("public/data/history-bank-book1.json", "utf8")) as { questions: Choice[] };
const sourceBook = JSON.parse(readFileSync("public/data/history-book1.json", "utf8")) as {
  sections: { units: { id: string; questions?: Choice[] }[] }[];
};

/** Short spot check from the user-provided patm-1.pdf, printed page 6.
 * Printed options and names were checked; answers are checked for internal
 * agreement only, not certified against the printed answer-key pages.
 */
describe("Armenian History I source transcription: printed p.6", () => {
  const unit = sourceBook.sections.flatMap(s => s.units).find(u => u.id === "1-1-Ա-1");
  const question = (n: number) => unit?.questions?.find(q => q.n === String(n));
  const imported = (n: number) => bank.questions.find(q => q.source_run === 0 && q.num === n);

  it("keeps the ruler's numeral and corrects the line-wrap split", () => {
    const text = question(21)?.stem ?? "";
    expect(imported(21)?.page).toBe(6);
    expect(text).toContain("Դարեհ III Կոդոմանոսը");
    expect(text).toContain("ողջ Աքեմենյան");
    expect(text).not.toContain("ող ջ");
    expect(text).toBe(imported(21)?.stem);
    expect(question(21)?.options["3"]).toBe("Ք. ա. 336 թ.");
  });

  it("restores the printed IV numeral while keeping source answers unchanged", () => {
    expect(imported(29)?.page).toBe(6);
    expect(question(29)?.stem).toContain("Անտիոքոս IV թագավորին");
    expect(question(29)?.stem).toBe(imported(29)?.stem);
    for (const n of [21, 29]) {
      expect(question(n)?.options).toEqual(imported(n)?.options);
      expect(question(n)?.answer).toBe(imported(n)?.answer);
    }
  });
});
