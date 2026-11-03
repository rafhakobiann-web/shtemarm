import { beforeEach, describe, expect, it } from "vitest";
import type { Book } from "@/lib/books";
import {
  legacyMistakeStatus, markRecoveredMastered, matchHistoricalBookMistakes,
  readOldAnswers, removeRecoveredMistake,
} from "@/lib/legacyMistakeRecovery";

const book = (id: number, unitId: string): Book => ({
  id, sections: [{
    n: 2, title: "Source section", instr_en: "", instr_hy: "",
    units: [{
      id: unitId, label: "Question", kind: "mc", passage: "Text from the original book",
      questions: [{ n: "1", stem: "Original question", options: {"1": "wrong", "2": "right"}, answer: "2" }],
    }],
  }],
});

describe("Recovery of pre-notebook wrong answers", () => {
  beforeEach(() => window.localStorage.clear());

  it("reconstructs an old wrong result with the original question without inventing an answer", () => {
    const found = matchHistoricalBookMistakes(
      [{ bookId: 1, book: book(1, "1-2-Text7") }],
      { "1-2-Text7:1": 0, "unrelated": 0, "1-2-Text7:2": 1 },
    );
    expect(found).toHaveLength(1);
    expect(found[0]?.subject).toBe("english");
    expect(found[0]?.unit.kind).toBe("mc");
    expect(found[0]?.chosen).toEqual({ mc: {} });
    expect(found[0]?.mastered).toBe(false);
  });

  it("does not claim which book a globally ambiguous old question ID belongs to", () => {
    const same = "1-2";
    expect(matchHistoricalBookMistakes([
      { bookId: 31, book: book(31, same) },
      { bookId: 32, book: book(32, same) },
    ], { "1-2:1": 0 })).toEqual([]);
  });

  it("keeps previously mastered and removed old mistakes from reappearing", () => {
    const books = [{ bookId: 21, book: book(21, "1-2-Ա-1") }];
    const results = { "1-2-Ա-1:1": 0 as const };
    const first = matchHistoricalBookMistakes(books, results);
    expect(first).toHaveLength(1);
    markRecoveredMastered(first[0]!.key);
    expect(legacyMistakeStatus(first[0]!.key)).toBe("mastered");
    expect(matchHistoricalBookMistakes(books, results)[0]?.mastered).toBe(true);
    removeRecoveredMistake(first[0]!.key);
    expect(matchHistoricalBookMistakes(books, results)).toHaveLength(0);
  });

  it("reads only actual legacy answer maps", () => {
    localStorage.setItem("history-progress-v1", JSON.stringify({
      answers: { "old:question": "3", "empty": null },
    }));
    expect(readOldAnswers("history-progress-v1")).toEqual({ "old:question": "3" });
  });

  it("does not count a correct recorded answer as an old error", () => {
    expect(matchHistoricalBookMistakes(
      [{ bookId: 1, book: book(1, "1-2-Text7") }], { "1-2-Text7:1": 1 },
    )).toHaveLength(0);
  });
});
