import { describe,expect,it } from "vitest";
import { weeklyLearningReport } from "@/lib/weeklyLearningReport";

describe("weekly learning report",()=>{
  const now=new Date(2026,10,5);
  it("uses local week and counts distinct questions per day",()=>{
    const report=weeklyLearningReport({
      "2026-11-01":{answered:["old"],reviewed:[]},
      "2026-11-02":{answered:["a","a","b"],reviewed:["x"]},
      "2026-11-03":{answered:["a"],reviewed:[]},
    },[],[],now);
    expect(report).toMatchObject({start:"2026-11-02",end:"2026-11-05",answered:3,reviewed:1,activeDays:2});
    expect(report.daily).toHaveLength(4);
  });
  it("only attributes explicitly tagged pending mistakes to selected subjects",()=>{
    const report=weeklyLearningReport({},[
      {subject:"math",mastered:false},{subject:"math",mastered:true},
      {subject:"english",mastered:false},{subject:"biology",mastered:false},
    ],["math","english"],now);
    expect(report.subjects).toEqual([{subject:"math",pending:1},{subject:"english",pending:1}]);
    expect(report.suggestions).toHaveLength(2);
  });
  it("never invents progress when no activity is saved",()=>{
    expect(weeklyLearningReport({},[],["math"],now)).toMatchObject({answered:0,reviewed:0,activeDays:0,suggestions:[]});
  });
});
