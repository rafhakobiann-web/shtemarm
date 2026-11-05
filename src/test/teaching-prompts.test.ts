import { describe, expect, it } from "vitest";
import { buildMathTeachingPrompt, buildSubjectTeachingPrompt, mathTeachingCacheParts } from "@/lib/teaching-prompts";
const subject = {instruction:"Read the passage",passage:"A cell contains organelles.",question:"What does it contain?",correct:"Organelles",chosen:"private learner choice"};
const math = {item:"matem-1:1:1:1:1",kind:"choice" as const,task:"Find x",question:"3x + 5 = 14",options:["2","3","4"],correct:"2",pages:[]};
describe("Localized, grounded teaching prompts",()=>{
  it.each([["hy","literary Armenian"],["en","English"],["ru","Russian"]] as const)("uses %s for both explanation paths",(locale,name)=>{
    expect(buildSubjectTeachingPrompt({...subject,locale})).toContain("in "+name);
    expect(buildMathTeachingPrompt({...math,locale})).toContain("in "+name);
  });
  it("preserves actual LaTeX command backslashes without control characters",()=>{
    const prompt=buildMathTeachingPrompt(math);
    for(const command of ["\\frac","\\sqrt","\\begin{aligned}"])expect(prompt).toContain(command);
    expect(prompt).not.toMatch(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/);
  });
  it("does not send personal choices to a shared prompt or force a conflicting key",()=>{
    const prompt=buildSubjectTeachingPrompt(subject);
    expect(prompt).not.toContain(subject.chosen);
    expect(prompt).toContain("independently check");
    expect(prompt).toContain("state the conflict");
    expect(prompt).toContain("never invent a quotation or line number");
    const source=JSON.parse(prompt.split("Quoted study material (JSON):\n")[1]);
    expect(source.question).toBe(subject.question);
  });
  it("isolates cache keys for language, task, options and source images",()=>{
    const key=JSON.stringify(mathTeachingCacheParts(math));
    for(const change of [{locale:"en" as const},{task:"Find y"},{options:["3","2","4"]},{pages:["image-one"]},{correct:"1"},{question:"3x + 5 = 20"}]){
      expect(JSON.stringify(mathTeachingCacheParts({...math,...change}))).not.toBe(key);
    }
  });
});

import { tutorOfflineReply } from "@/lib/tutor-offline";
describe("Offline teacher language",()=>{
  it.each(["en","ru"] as const)("localizes greeting, grammar, equation and generic help in %s",locale=>{
    for(const question of ["hello","since or for grammar","solve the equation","biology"]){
      const answer=tutorOfflineReply(question,locale);
      expect(answer.length).toBeGreaterThan(40);
      expect(answer).not.toMatch(/[\u0531-\u0587]/);
    }
  });
});
