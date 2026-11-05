import { describe, expect, it } from "vitest";
import { isRevisionDue, nextRevisionAt, summarizeRevision } from "@/lib/revisionSchedule";
const DAY = 86_400_000;
describe("Smart revision schedule", () => {
  it("starts with one day and increases spacing for repeated mistakes", () => {
    expect(nextRevisionAt({ attempts: 1, updatedAt: 100, mastered: false })).toBe(100 + DAY);
    expect(nextRevisionAt({ attempts: 2, updatedAt: 100, mastered: false })).toBe(100 + 3*DAY);
    expect(nextRevisionAt({ attempts: 3, updatedAt: 100, mastered: false })).toBe(100 + 7*DAY);
    expect(nextRevisionAt({ attempts: 99, updatedAt: 100, mastered: false })).toBe(100 + 14*DAY);
  });
  it("does not schedule mastered items or count them as due", () => {
    const items = [
      { subject: "english", attempts: 1, updatedAt: 0, mastered: false },
      { subject: "english", attempts: 2, updatedAt: 0, mastered: false },
      { subject: "math", attempts: 1, updatedAt: 0, mastered: true },
    ];
    expect(nextRevisionAt(items[2]!)).toBeNull();
    expect(isRevisionDue(items[0]!, DAY)).toBe(true);
    expect(isRevisionDue(items[1]!, DAY)).toBe(false);
    expect(summarizeRevision(items, DAY)).toEqual({ pending: 2, due: 1, mastered: 1, bySubject: [["english", 2]] });
  });
});
