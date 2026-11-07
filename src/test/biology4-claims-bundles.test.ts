import { describe, expect, it } from "vitest";
import { buildCustom, isGtcClaimsBundle, type Book, type Unit } from "@/lib/books";
import { scoreUnit, type UnitAnswer } from "@/components/UnitCard";

/** Invented test statements: no original book wording or answer key is copied. */
const bundle: Unit = {
  id: "bio4-source-format-fixture", label: "225", kind: "mc",
  grading: "gtc-claims", passage: "Six source-verified statements",
  questions: Array.from({ length: 6 }, (_, i) => ({
    n: String(i + 1), stem: "Example claim " + (i + 1),
    options: { "1": "Ճիշտ է", "2": "Սխալ է" },
    answer: i % 2 === 0 ? "1" : "2",
  })),
};
const book: Book = {
  id: 34,
  sections: [{ n: 1, label: "Test fixture", instr_en: "", instr_hy: "", units: [bundle] }],
};

describe("Biology IV 3-state and grouped problem readiness", () => {
  it("preserves the entire printed six-claim unit in custom tests", () => {
    expect(isGtcClaimsBundle(bundle)).toBe(true);
    const test = buildCustom(book, [1], 6);
    expect(test).toHaveLength(1);
    expect(test[0].unit.id).toBe(bundle.id);
    expect(test[0].unit.kind).toBe("mc");
    expect(test[0].unit.kind === "mc" && test[0].unit.questions).toHaveLength(6);
  });

  it("recognizes three-choice wording and never treats ordinary MC sets as GTC bundles", () => {
    const withPrintedInstruction: Unit = {
      ...bundle, grading: undefined,
      passage: "Յուրաքանչյուրի համար ընտրել «Ճիշտ է», «Սխալ է», «Չգիտեմ»։",
    };
    expect(isGtcClaimsBundle(withPrintedInstruction)).toBe(true);
    expect(isGtcClaimsBundle({ ...bundle, grading: undefined, passage: "Choose an answer" })).toBe(false);
  });

  it("keeps a reviewed multi-part numeric problem together with independent answer fields", () => {
    const numeric: Unit = {
      id: "bio4-source-numeric-fixture", label: "1", kind: "num",
      grouping: "printed-problem",
      passage: "Invented shared scenario for two calculations",
      questions: [
        { n: "1.1", stem: "First calculated value", answer: "12" },
        { n: "1.2", stem: "Second calculated value", answer: "8" },
      ],
    };
    const b: Book = { id: 34, sections: [
      { n: 6, label: "Problems", instr_hy: "", instr_en: "", units: [numeric] },
    ] };
    const exam = buildCustom(b, [6], 2);
    expect(exam).toHaveLength(1);
    expect(exam[0].unit.id).toBe(numeric.id);
    expect(exam[0].unit.kind === "num" && exam[0].unit.questions).toHaveLength(2);
    expect(scoreUnit(numeric, { mc: { "1.1": "12", "1.2": "8" } }))
      .toMatchObject({ got: 2, total: 2 });
    expect(scoreUnit(numeric, { mc: { "1.1": "12", "1.2": "5" } }))
      .toMatchObject({ got: 1, total: 2 });
  });

  it("uses +1 correct / -1 wrong / 0 don't know, clamped inside the whole unit", () => {
    const correct: UnitAnswer = { mc: Object.fromEntries(
      bundle.kind === "mc" ? bundle.questions.map(q => [q.n, q.answer]) : [],
    ) };
    const all = scoreUnit(bundle, correct);
    expect(all).toMatchObject({ got: 6, total: 6 });
    expect(all.per).toEqual([true, true, true, true, true, true]);

    const wrong: UnitAnswer = { mc: { ...correct.mc, "1": "2" } };
    expect(scoreUnit(bundle, wrong)).toMatchObject({ got: 4, total: 6 });

    const unknown: UnitAnswer = { mc: { ...correct.mc, "1": "3" } };
    expect(scoreUnit(bundle, unknown)).toMatchObject({ got: 5, total: 6 });

    expect(scoreUnit(bundle, { mc: { "1": "3", "2": "3", "3": "3" } }))
      .toMatchObject({ got: 0, total: 6 });
  });
});
