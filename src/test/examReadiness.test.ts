import {describe,expect,it} from "vitest";
import {examReadiness} from "@/lib/examReadiness";
describe("exam readiness evidence",()=>{
  it("does not invent a readiness percentage without results",()=>{
    expect(examReadiness({answers:{},exams:[]},[],["math"])).toMatchObject({accuracy:null,examAverage:null,evidence:"insufficient",validExams:0});
  });
  it("uses only valid known-book exams",()=>{
    const result=examReadiness({answers:{a:1,b:0},exams:[
      {book:1,date:"2026-11-05",score:18,total:20},
      {book:9999,date:"2026-11-05",score:10,total:10},
      {book:2,date:"2026-11-05",score:25,total:20},
    ]},[],["english"]);
    expect(result).toMatchObject({answered:2,correct:1,accuracy:50,validExams:1,examAverage:90,evidence:"partial"});
  });
  it("reports only explicit subject-tagged pending mistakes",()=>{
    const result=examReadiness({answers:{},exams:[]},[
      {subject:"math",mastered:false},{subject:"biology",mastered:false},{subject:"math",mastered:true},
    ],["math"]);
    expect(result.pendingMistakes).toBe(2);
    expect(result.subjectPriorities).toEqual([{subject:"math",pending:1}]);
    expect(result.nextSteps).toContain("review");
  });
});
