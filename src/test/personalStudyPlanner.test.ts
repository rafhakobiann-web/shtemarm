import {describe,expect,it} from "vitest";
import {normalizePlannerDays,weeklyPersonalPlan} from "@/lib/personalStudyPlanner";
describe("personal study planner",()=>{
  it("normalizes weekday choices and preserves rest days",()=>{
    expect(normalizePlannerDays([1,1,7,-1,0])).toEqual([0,1]);
    expect(normalizePlannerDays("bad")).toHaveLength(7);
    expect(normalizePlannerDays([])).toEqual([]);
  });
  it("builds an optional week with no tasks on rest days",()=>{
    const result=weeklyPersonalPlan({answers:{}},[],{subjects:["math"],minutes:25,activeDays:[1,3]}, {},new Date(2026,10,2,12));
    expect(result).toHaveLength(7);
    expect(result[0].isRestDay).toBe(false);
    expect(result[1].isRestDay).toBe(true);
    expect(result[1].tasks).toEqual([]);
    expect(result[2].tasks.length).toBeGreaterThan(0);
  });
  it("tracks only explicitly completed tasks",()=>{
    const settings={subjects:["math"] as const,minutes:25,activeDays:[1]};
    const first=weeklyPersonalPlan({answers:{}},[],{...settings,subjects:[...settings.subjects]}, {},new Date(2026,10,2,12));
    const day=first[0].day,id=first[0].tasks[0].id;
    const next=weeklyPersonalPlan({answers:{}},[],{...settings,subjects:[...settings.subjects]}, {[day]:[id]},new Date(2026,10,2,12));
    expect(next[0].completed).toBe(1);
    expect(next[1].completed).toBe(0);
  });
});
