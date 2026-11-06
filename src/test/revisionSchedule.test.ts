import { describe, expect, it } from "vitest";
import { isRevisionDue, nextRevisionAt, summarizeRevision } from "@/lib/revisionSchedule";

const DAY = 86_400_000;
const RECENT = Date.UTC(2026, 10, 6);

describe("Smart revision schedule", () => {
  it("starts with one day and increases spacing for repeated mistakes", () => {
    expect(nextRevisionAt({ attempts: 1, updatedAt: RECENT, mastered: false })).toBe(RECENT + DAY);
    expect(nextRevisionAt({ attempts: 2, updatedAt: RECENT, mastered: false })).toBe(RECENT + 3 * DAY);
    expect(nextRevisionAt({ attempts: 3, updatedAt: RECENT, mastered: false })).toBe(RECENT + 7 * DAY);
    expect(nextRevisionAt({ attempts: 99, updatedAt: RECENT, mastered: false })).toBe(RECENT + 14 * DAY);
  });

  it("does not schedule mastered items or count them as due", () => {
    const items = [
      { subject: "english", attempts: 1, updatedAt: RECENT, mastered: false },
      { subject: "english", attempts: 2, updatedAt: RECENT, mastered: false },
      { subject: "math", attempts: 1, updatedAt: RECENT, mastered: true },
    ];
    expect(nextRevisionAt(items[2]!)).toBeNull();
    expect(isRevisionDue(items[0]!, RECENT + DAY)).toBe(true);
    expect(isRevisionDue(items[1]!, RECENT + DAY)).toBe(false);
    expect(summarizeRevision(items, RECENT + DAY)).toEqual({
      pending: 2, due: 1, mastered: 1, bySubject: [["english", 2]],
    });
  });

  it("does not invent 1970 review dates for restored mistakes without timestamps", () => {
    const unknown = [
      { subject: "english", attempts: 1, updatedAt: 0, mastered: false },
      { subject: "math", attempts: 2, updatedAt: Number.NaN, mastered: false },
      { subject: "biology", attempts: 1, updatedAt: 1_762_400_000, mastered: false }, // seconds, not ms
    ];
    for (const entry of unknown) {
      expect(nextRevisionAt(entry)).toBeNull();
      expect(isRevisionDue(entry, RECENT)).toBe(true);
    }
    expect(summarizeRevision(unknown, RECENT)).toEqual({
      pending: 3, due: 3, mastered: 0,
      bySubject: [["english", 1], ["math", 1], ["biology", 1]],
    });
  });

  it("leaves a recovered, already-mastered mistake out of the review queue", () => {
    const recovered = { subject: "history", attempts: 1, updatedAt: 0, mastered: true };
    expect(nextRevisionAt(recovered)).toBeNull();
    expect(isRevisionDue(recovered, RECENT)).toBe(false);
  });
});
