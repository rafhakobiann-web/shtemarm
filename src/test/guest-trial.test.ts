import { describe, expect, it } from "vitest";
import {
  GUEST_TRIAL_LIMIT,
  isGuestTrialExhausted,
  recordGuestAnswer,
  sanitizeGuestTrial,
  sectionTrialKey,
} from "../lib/guest-trial-core";

describe("guest section trial", () => {
  it("allows two answered questions per section", () => {
    expect(GUEST_TRIAL_LIMIT).toBe(2);
  });

  it("keys each book section separately", () => {
    expect(sectionTrialKey("31", "4")).toBe("31:4");
    expect(sectionTrialKey("31", "4")).not.toBe(sectionTrialKey("31", "5"));
  });

  it("counts answers and is exhausted exactly at the limit", () => {
    const key = sectionTrialKey("31", "4");
    let counts = {};
    counts = recordGuestAnswer(counts, key);
    counts = recordGuestAnswer(counts, key);
    expect(isGuestTrialExhausted(counts, key)).toBe(true);
  });

  it("never counts past the limit", () => {
    const key = "33:1";
    let counts: Record<string, number> = {};
    for (let i = 0; i < 10; i += 1) counts = recordGuestAnswer(counts, key);
    expect(counts[key]).toBe(GUEST_TRIAL_LIMIT);
  });

  it("does not affect other sections", () => {
    const counts = recordGuestAnswer({}, sectionTrialKey("31", "1"));
    expect(isGuestTrialExhausted(counts, sectionTrialKey("31", "2"))).toBe(false);
  });

  it("does not mutate the previous counts", () => {
    const before = { "31:1": 1 };
    recordGuestAnswer(before, "31:1");
    expect(before).toEqual({ "31:1": 1 });
  });

  it("ignores tampered or malformed stored values", () => {
    expect(sanitizeGuestTrial(null)).toEqual({});
    expect(sanitizeGuestTrial([1, 2])).toEqual({});
    expect(sanitizeGuestTrial("x")).toEqual({});
    expect(
      sanitizeGuestTrial({ a: -1, b: 1.5, c: "2", d: Number.NaN, e: 2, f: 99 }),
    ).toEqual({ e: 2, f: GUEST_TRIAL_LIMIT });
  });
});
