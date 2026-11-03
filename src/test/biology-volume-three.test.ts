import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BIO_BOOKS } from "@/lib/books";
const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
describe("Biology III source bank and archived starter practice", () => {
  it("unlocks the source book with a truthful partial label", () => {
    const book = BIO_BOOKS.find(b => b.id === 33);
    expect(book?.locked).toBe(false);
    expect(book?.sub).toContain("բնօրինակ");
    expect(book?.sub).toContain("լրացվում է");
    expect(read("public/data/bio-book3.json").source.complete).toBe(false);
  });
  it("preserves the 36 authored exercises outside the source dataset", () => {
    const archive = read("public/data/bio-authored-book3.json");
    expect(archive.sourceStatus).toBe("original-practice-aligned-to-2018-pdf-chapters");
    const questions = archive.sections.flatMap((s: any) => s.units.flatMap((u: any) => u.questions));
    expect(questions).toHaveLength(36);
    expect(questions.every((q: any) => q.options[q.answer])).toBe(true);
  });
  it("accounts for imported and remaining tasks without claiming manual completion", () => {
    const pending = read("public/data/biology-pending-books.json").books.find((b: any) => b.id === 33);
    expect(pending.verifiedQuestions).toBe(35);
    expect(pending.transcribedQuestions + pending.remainingQuestions).toBe(1837);
    expect(pending.archivedAuthoredFile).toBe("public/data/bio-authored-book3.json");
  });
});
