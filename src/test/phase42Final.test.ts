import {describe,expect,it} from "vitest";
import {filterPracticeHistory,practiceHistory} from "@/lib/practiceHistory";
import {learningInsights} from "@/lib/learningInsights";
describe("Phase 4.2 saved-data insights",()=>{
 it("does not invent dates, attempts or unknown subject",()=>{
  const entries=practiceHistory({answers:{"unknown-id":0,"matem-1:1":1}},{"2026-11-05":{answered:["matem-1:1"]}});
  expect(entries.find(e=>e.id==="unknown-id")).toMatchObject({day:null,subject:null,correct:false});
  expect(entries.find(e=>e.id==="matem-1:1")).toMatchObject({day:"2026-11-05",subject:"math",correct:true});
  expect(filterPracticeHistory(entries,"matem","math","correct")).toHaveLength(1);
 });
 it("reports explicit evidence without fabricated mastery",()=>{
  const data=learningInsights({answers:{"matem-1:1":1,"unknown-id":0}},{"2026-11-05":{answered:["matem-1:1"],reviewed:[]}});
  expect(data).toMatchObject({answered:2,correct:1,accuracy:50,activeDays:1,unattributed:1});
  expect(data.subjectResults).toEqual([{subject:"math",answered:1,correct:1}]);
 });
 it("returns null accuracy for no saved answers",()=>{
  expect(learningInsights({answers:{}},{}).accuracy).toBeNull();
 });
});
