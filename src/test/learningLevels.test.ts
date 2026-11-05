import { describe, expect, it } from "vitest";
import { learningLevel, subjectLearningLevel } from "@/lib/learningLevels";

describe("combined learning levels", () => {
  it("keeps XP separate from accuracy and unverified mastery", () => {
    const result = learningLevel({xp: 200, answers: {a:1,b:0,c:1}});
    expect(result.level).toBe(3);
    expect(result.answered).toBe(3);
    expect(result.accuracy).toBe(67);
    expect(result.mastery).toBe("not-assessed");
    expect(result.xpProgress).toBe(0);
  });
  it("does not infer a subject from question IDs or count duplicate IDs", () => {
    const result = subjectLearningLevel({answers: {"math:1":1, "eng:1":0}}, ["math:1", "math:1"]);
    expect(result).toMatchObject({answered:1,correct:1,accuracy:100,mastery:"not-assessed"});
    expect(subjectLearningLevel({answers:{"math:1":1}},[]).accuracy).toBeNull();
  });
  it("handles empty and invalid XP without false mastery", () => {
    expect(learningLevel({xp: Number.NaN,answers:{}})).toMatchObject({level:1,xp:0,accuracy:null,mastery:"not-assessed"});
  });
});
