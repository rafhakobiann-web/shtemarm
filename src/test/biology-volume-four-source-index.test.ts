import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ALL_BOOKS, BIO_BOOKS } from "@/lib/books";

type SourceIndex = {
  id: number; year: number; pages: number;
  sections: { n: number; startPage: number; endPage: number; title: string }[];
  answers: { startPage: number; endPage: number };
  verification: {
    officialQuestionsTranscribed: number;
    officialAnswersCrossChecked: number;
    originalPracticeQuestions: number;
    playable?: boolean;
  };
};
const source = (part: 3 | 4): SourceIndex =>
  JSON.parse(readFileSync(`public/data/biology-book${part}-source-index.json`, "utf8")) as SourceIndex;

describe("Biology original 2018 volumes III and IV source indices", () => {
  it.each([
    { part: 3 as const, pages: 384, starts: [5, 62, 125, 192, 263, 296], answerAt: 362 },
    { part: 4 as const, pages: 392, starts: [5, 44, 116, 184, 269, 312], answerAt: 374 },
  ])("keeps the original printed page map for volume $part", ({ part, pages, starts, answerAt }) => {
    const index = source(part);
    expect(index.id).toBe(30 + part);
    expect(index.year).toBe(2018);
    expect(index.pages).toBe(pages);
    expect(index.sections.map(s => s.n)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(index.sections.map(s => s.startPage)).toEqual(starts);
    expect(index.sections[0]?.startPage).toBe(5);
    for (let i = 0; i < index.sections.length; i++) {
      const section = index.sections[i]!;
      expect(section.title.trim()).not.toBe("");
      const nextStart = index.sections[i + 1]?.startPage ?? answerAt;
      expect(section.endPage + 1, `Part ${part}, section ${section.n}`).toBe(nextStart);
    }
    expect(index.answers).toEqual({ startPage: answerAt, endPage: pages });
  });

  it("does not misrepresent authored practice as verified original questions", () => {
    const part3 = source(3);
    const part4 = source(4);
    const practice = JSON.parse(readFileSync("public/data/bio-book3.json", "utf8")) as {
      sourceStatus: string;
      sections: { units: { questions?: unknown[] }[] }[];
    };
    const practiceCount = practice.sections.reduce((sum, section) =>
      sum + section.units.reduce((sub, unit) => sub + (unit.questions?.length ?? 0), 0), 0);
    expect(practiceCount).toBe(36);
    expect(practice.sourceStatus).toContain("original-practice");
    expect(part3.verification.officialQuestionsTranscribed).toBe(0);
    expect(part3.verification.originalPracticeQuestions).toBe(36);
    expect(part4.verification.officialQuestionsTranscribed).toBe(0);
    expect(part4.verification.officialAnswersCrossChecked).toBe(0);
    expect(part4.verification.originalPracticeQuestions).toBe(0);
    expect(part4.verification.playable).toBe(false);
    expect(BIO_BOOKS.find(b => b.id === 34)?.locked).toBe(true);
    expect(ALL_BOOKS.some(b => b.id === 34)).toBe(false);
  });
});
