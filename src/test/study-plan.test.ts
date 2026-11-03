import { describe, expect, it } from "vitest";
import { buildStudyPlan, subjectForProgressId } from "@/lib/studyPlan";
describe("Personal daily study plan", () => {
  it("prioritizes actual pending mistakes over generic practice", () => {
    const tasks = buildStudyPlan({answers:{}},[
      {id:"e1",subject:"english",section:"A",mastered:false},
      {id:"e2",subject:"english",section:"B",mastered:true},
    ],["english","math"],25);
    expect(tasks[0]).toMatchObject({subject:"english",kind:"mistakes",count:1});
    expect(tasks).toHaveLength(2);
  });
  it("does not include mastered mistakes or unselected subjects", () => {
    const tasks = buildStudyPlan({answers:{}},[
      {id:"a",subject:"biology",section:"",mastered:false},
      {id:"b",subject:"english",section:"",mastered:true},
    ],["english"],15);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.kind).toBe("practice");
  });
  it("respects a short daily limit and removes duplicate subjects", () => {
    expect(buildStudyPlan({answers:{}},[],["math","math","english"],15)).toHaveLength(1);
    expect(buildStudyPlan({answers:{}},[],[],60)).toHaveLength(0);
  });
  it("does not misattribute ambiguous old book question IDs", () => {
    expect(subjectForProgressId("1-2-Text1:1")).toBeUndefined();
    expect(subjectForProgressId("matem-1:1:2:3:1")).toBe("math");
    expect(subjectForProgressId("bio3:6:42")).toBe("biology");
  });
});
