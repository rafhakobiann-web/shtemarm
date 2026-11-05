import { describe, expect, it } from "vitest";
import { recommendLearningPath } from "@/lib/learningPath";

describe("learning path recommendations", () => {
  const progress = {answers:{"q1":0 as const},exams:[]};
  it("prioritizes saved mistakes in selected subjects without guessing from IDs", () => {
    expect(recommendLearningPath(["math","english"],progress,[{subject:"math",mastered:false},{subject:"history",mastered:false}]))
      .toEqual([{id:"review",subject:"math",reason:"saved-mistakes"},{id:"practice",subject:"math",reason:"student-choice"}]);
  });
  it("preserves student choice and avoids claiming AI personalization", () => {
    expect(recommendLearningPath(["english","math","english"],{...progress,exams:[{date:"2026-11-05",book:1,score:1,total:2}]},[]))
      .toEqual([{id:"practice",subject:"english",reason:"student-choice"},{id:"exam",subject:"english",reason:"exam-goal"}]);
  });
  it("asks for subject selection when none is chosen", () => {
    expect(recommendLearningPath([],progress,[{subject:"math",mastered:false}]))
      .toEqual([{id:"choose",subject:null,reason:"choose-subject"}]);
  });
});
