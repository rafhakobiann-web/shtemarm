import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BIO_BOOKS } from "@/lib/books";

describe("Biology volume III original practice foundation", () => {
  it("is visibly marked as original practice and unlocked", () => {
    const book = BIO_BOOKS.find(item => item.id === 33);
    expect(book?.locked).toBe(false);
    expect(book?.sub).toContain("հեղինակային");
  });
  it("has valid, nonduplicate answerable questions", () => {
    const bank = JSON.parse(readFileSync("public/data/bio-book3.json", "utf8"));
    expect(bank.id).toBe(33);
    expect(bank.sourceStatus).toBe("original-practice-aligned-to-2018-pdf-chapters");
    expect(bank.sections).toHaveLength(6);
    const seen = new Set<string>();
    let count = 0;
    for (const section of bank.sections) for (const unit of section.units) {
      expect(unit.kind).toBe("mc");
      for (const q of unit.questions) {
        expect(q.stem.trim().length).toBeGreaterThan(10);
        expect(Object.keys(q.options)).toEqual(["1", "2", "3", "4"]);
        expect(q.options[q.answer]).toBeTruthy();
        const key = q.stem.trim();
        expect(seen.has(key)).toBe(false);
        seen.add(key);
        count++;
      }
    }
    expect(count).toBe(36);
  });
  it("matches the six chapter boundaries of the provided 2018 source", () => {
    const index = JSON.parse(readFileSync("public/data/biology-book3-source-index.json", "utf8"));
    expect(index.pages).toBe(384);
    expect(index.sections.map((section: { startPage: number }) => section.startPage)).toEqual([5, 62, 125, 192, 263, 296]);
    expect(index.answers.startPage).toBe(362);
    expect(index.verification.officialQuestionsTranscribed).toBe(0);
  });
  it("does not misrepresent original practice as verified source transcription", () => {
    const pending = JSON.parse(readFileSync("public/data/biology-pending-books.json", "utf8"));
    const volume = pending.books.find((b: { id: number }) => b.id === 33);
    expect(volume.verifiedQuestions).toBe(0);
    expect(volume.originalPracticeQuestions).toBe(36);
  });
});
