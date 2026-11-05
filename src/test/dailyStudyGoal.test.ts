import { describe, expect, it } from "vitest";
import { dailyGoalProgress, normalizeDailyGoal, suggestDailyGoal, weeklyGoalSummary } from "@/lib/dailyStudyGoal";

describe("personal daily study goals", () => {
  const history = {
    "2026-11-02": {answered:["a","a","b"],reviewed:["x"]},
    "2026-11-03": {answered:["c","d","e"],reviewed:["y","z"]},
  };
  it("counts unique activities and keeps answers and reviews separate", () => {
    expect(dailyGoalProgress(history,{answers:2,reviews:1},"2026-11-02"))
      .toMatchObject({answered:2,reviewed:1,completed:3,total:3,percent:100,done:true});
  });
  it("does not allow empty or excessive goals", () => {
    expect(normalizeDailyGoal({answers:0,reviews:0})).toEqual({answers:10,reviews:3});
    expect(normalizeDailyGoal({answers:101,reviews:-1})).toEqual({answers:10,reviews:3});
  });
  it("suggests from prior saved days without overwriting student choices", () => {
    expect(suggestDailyGoal(history,"2026-11-04")).toEqual({answers:5,reviews:2});
    expect(suggestDailyGoal({},"2026-11-04")).toEqual({answers:10,reviews:3});
  });
  it("summarizes only current-week saved activity", () => {
    expect(weeklyGoalSummary(history,{answers:2,reviews:1},new Date(2026,10,5)))
      .toMatchObject({completedDays:2,answered:5,reviewed:3,activeDays:2});
  });
});
