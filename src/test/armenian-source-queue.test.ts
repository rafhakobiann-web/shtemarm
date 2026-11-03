import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Range = { pdfPage: number; from: number; to: number };
type Volume = {
  volume: number;
  section: number;
  part: number;
  sourceSha256: string;
  firstPdfPage: number;
  lastPdfPage: number;
  nextPartStartsPdfPage: number;
  taskCount: number;
  pageRanges: Range[];
};

const queue = JSON.parse(readFileSync("docs/armenian-phonetics-source-queue.json", "utf8"));
const source = JSON.parse(readFileSync("public/data/armenian-source-index.json", "utf8"));
const banks = [1, 2, 3, 4].map(n =>
  JSON.parse(readFileSync("public/data/armenian-book" + n + ".json", "utf8")),
);

describe("Original Armenian task marker review queue (NOT playable book imports)", () => {
  it("covers 572 real phonetics Part 1 printed task identifiers in four source PDFs", () => {
    expect(queue.purpose).toBe("maintainer_source_review_queue_not_student_questions");
    expect(queue.status).toBe("numbers_and_pages_only_no_answers_verified");
    expect(queue.volumes).toHaveLength(4);
    expect(queue.sourceTaskMarkers).toBe(572);
    expect(queue.originalQuestionTextsCommitted).toBe(0);
    expect(queue.individuallyVerifiedOfficialAnswers).toBe(0);
    const sizes = [103, 122, 157, 190];
    const starts = [5, 5, 5, 6];
    const finishes = [18, 21, 25, 30];
    const globalIds = new Set<string>();
    for (const [index, volume] of (queue.volumes as Volume[]).entries()) {
      const sourceBook = source.volumes[index];
      expect(volume.volume).toBe(index + 1);
      expect(volume.section).toBe(1);
      expect(volume.part).toBe(1);
      expect(volume.sourceSha256).toBe(sourceBook.sourceSha256);
      expect(volume.taskCount).toBe(sizes[index]);
      expect(volume.firstPdfPage).toBe(starts[index]);
      expect(volume.lastPdfPage).toBe(finishes[index]);
      expect(volume.nextPartStartsPdfPage).toBe(finishes[index] + 1);
      expect(volume.firstPdfPage).toBe(sourceBook.sections[0].pdfPage);
      expect(volume.nextPartStartsPdfPage).toBeLessThanOrEqual(sourceBook.sections[0].lastPdfPage);

      let nextId = 1;
      let nextPage = volume.firstPdfPage;
      for (const range of volume.pageRanges) {
        expect(range.pdfPage).toBe(nextPage);
        expect(range.from).toBe(nextId);
        expect(range.to).toBeGreaterThanOrEqual(range.from);
        for (let n = range.from; n <= range.to; n++) {
          const stableSourceId = "ARM18-V" + volume.volume + "-S1-P1-Q" + String(n).padStart(3, "0");
          expect(globalIds.has(stableSourceId)).toBe(false);
          globalIds.add(stableSourceId);
        }
        nextId = range.to + 1;
        nextPage++;
      }
      expect(nextId - 1).toBe(volume.taskCount);
      expect(nextPage - 1).toBe(volume.lastPdfPage);
      expect(banks[index].officialSourceVerifiedQuestions).toBe(0);
    }
    expect(globalIds.size).toBe(queue.sourceTaskMarkers);
  });

  it("contains source locations but no copied book text, answer options or purported answer keys", () => {
    const forbiddenKeys = new Set([
      "stem", "question", "passage", "options", "answer",
      "answerKey", "text", "explanation", "correctAnswer",
    ]);
    const inspect = (value: unknown): void => {
      if (Array.isArray(value)) return value.forEach(inspect);
      if (!value || typeof value !== "object") return;
      for (const [key, child] of Object.entries(value)) {
        expect(forbiddenKeys.has(key)).toBe(false);
        inspect(child);
      }
    };
    inspect(queue);
    const script = readFileSync("scripts/verify-armenian-source-queue.py", "utf8");
    expect(script).toContain("task_numbers_on_page");
    expect(script).toContain("actual_hash == record");
    expect(script).toContain("actual == required");
  });
});
