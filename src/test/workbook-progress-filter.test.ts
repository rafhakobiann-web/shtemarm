import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { matchesWorkbookProgressFilter, sectionProgressStatus } from "@/lib/workbook-progress-filter";

describe("workbook study priorities", () => {
  it("calculates progress from original answer IDs without modifying them", () => {
    const ids = ["section:1", "section:2", "section:3"];
    const answers = { "section:1": 1, "section:2": 0 } as const;
    const before = JSON.stringify(answers);
    const result = sectionProgressStatus(ids, answers);
    expect(result).toEqual({ total: 3, answered: 2, correct: 1, needsReview: true });
    expect(JSON.stringify(answers)).toBe(before);
    expect(ids).toEqual(["section:1", "section:2", "section:3"]);
  });

  it("shows unfinished only when there are unanswered questions", () => {
    const empty = sectionProgressStatus([], {});
    expect(matchesWorkbookProgressFilter(empty, "unfinished")).toBe(false);
    expect(matchesWorkbookProgressFilter(empty, "review")).toBe(false);
    const started = sectionProgressStatus(["a", "b"], { a: 1 });
    expect(matchesWorkbookProgressFilter(started, "all")).toBe(true);
    expect(matchesWorkbookProgressFilter(started, "unfinished")).toBe(true);
    expect(matchesWorkbookProgressFilter(started, "review")).toBe(false);
    const done = sectionProgressStatus(["a", "b"], { a: 0, b: 1 });
    expect(matchesWorkbookProgressFilter(done, "unfinished")).toBe(false);
    expect(matchesWorkbookProgressFilter(done, "review")).toBe(true);
  });

  it("ignores malformed values and inherited properties in progress input", () => {
    const inherited = Object.create({ a: 1 }) as Record<string, 0 | 1>;
    inherited.b = 0;
    expect(sectionProgressStatus(["a", "b"], inherited)).toEqual({
      total: 2, answered: 1, correct: 0, needsReview: true,
    });
    const malformed = { a: 4, b: 1 } as unknown as Record<string, 0 | 1>;
    expect(sectionProgressStatus(["a", "b"], malformed)).toEqual({
      total: 2, answered: 1, correct: 1, needsReview: false,
    });
  });

  it("retains original book routes, progress IDs, and reset controls", () => {
    const page = readFileSync("src/routes/book.$bookId.tsx", "utf8");
    expect(page).toContain("sectionAnswerIds");
    expect(page).toContain("sectionProgressStatus(ids, p.answers)");
    expect(page).toContain('aria-pressed={sectionFilter === choice}');
    expect(page).toContain('className="sht-book-progress-filter"');
    expect(page).toContain('to="/study/$bookId/$sectionId"');
    expect(page).toContain('setSectionFilter("all")');
  });
});
