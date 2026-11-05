import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { achievements, dailyQuests, getQuestHistory, parseQuestHistory, recordQuestActivity, weekStart, weeklyChallenges } from "@/lib/gamification";
describe("daily learning quests", () => {
  beforeEach(() => { localStorage.clear(); });
  it("counts distinct questions once per day", () => {
    recordQuestActivity("book:1", "answered", "2026-11-03");
    recordQuestActivity("book:1", "answered", "2026-11-03");
    recordQuestActivity("book:2", "answered", "2026-11-03");
    expect(dailyQuests(getQuestHistory(), "2026-11-03")[0]).toMatchObject({count:2,goal:5});
    expect(dailyQuests(getQuestHistory(), "2026-11-04")[0].count).toBe(0);
  });
  it("counts successful reviews separately from ordinary answers", () => {
    recordQuestActivity("math:1", "reviewed", "2026-11-03");
    expect(dailyQuests(getQuestHistory(), "2026-11-03")[2]).toMatchObject({count:1,goal:3});
    expect(dailyQuests(getQuestHistory(), "2026-11-03")[0].count).toBe(0);
  });
  it("handles corrupt and old data safely", () => {
    expect(parseQuestHistory("not-json")).toEqual({});
    expect(parseQuestHistory('{"bad":{"answered":["1"],"reviewed":[]}}')).toEqual({});
  });
  it("renders saved achievements in the dashboard without claiming unfinished weekly challenges", () => {
    const dashboard = readFileSync("src/components/DashboardFocus.tsx", "utf8");
    expect(dashboard).toContain("achievements(progress).map");
    expect(dashboard).toContain("item.unlocked");
    expect(dashboard).toContain("Optional weekly challenges");
  });
  it("counts weekly answers once and leaves challenges optional", () => {
    const history = { "2026-11-02": { answered: ["a","b"], reviewed: [] }, "2026-11-03": { answered: ["a","c"], reviewed: ["x"] } };
    expect(weekStart(new Date(2026, 10, 5))).toBe("2026-11-02");
    const result = weeklyChallenges(history, ["answer-20"], new Date(2026, 10, 5));
    expect(result[0]).toMatchObject({ count: 3, selected: true });
    expect(result[2]).toMatchObject({ count: 1, selected: false });
  });
  it("uses existing progress for achievement unlocks without resetting XP", () => {
    const result = achievements({answers:{"a":1},xp:510,streak:7});
    expect(result.find(a=>a.id==="first-steps")?.unlocked).toBe(true);
    expect(result.find(a=>a.id==="five-hundred-xp")?.unlocked).toBe(true);
    expect(result.find(a=>a.id==="week-streak")?.unlocked).toBe(true);
    expect(result.find(a=>a.id==="hundred-questions")?.unlocked).toBe(false);
  });
});
