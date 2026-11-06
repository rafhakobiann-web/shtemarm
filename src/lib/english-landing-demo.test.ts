import { describe, expect, it } from "vitest";
import type { Book } from "./books";
import { drawEnglishDemoQuestions, englishDemoQuestions } from "./english-landing-demo";

const book: Book = { id: 1, sections: [
  { n: 3, instr_en: "", instr_hy: "", units: [{ id: "3-1", label: "1", kind: "mc", passage: "", questions: [
    { n: "1", stem: "She ___ everyday.", options: { a: "read", b: "reads", c: "reading", d: "reader" }, answer: "b" },
  ] }] },
  { n: 5, instr_en: "", instr_hy: "", units: [{ id: "5-1", label: "1", kind: "mc", passage: "", questions: [
    { n: "1", stem: "___ the rain, we played.", options: { a: "Even", b: "Despite", c: "Although", d: "Because" }, answer: "b" },
  ] }] },
  { n: 8, instr_en: "", instr_hy: "", units: [{ id: "8-1", label: "1", kind: "set", passage: "1. Correct?\n2. Wrong?\n3. Correct too?\n4. Not correct?\n5. Fine?", answer: [1,3,5] }] },
  { n: 11, instr_en: "", instr_hy: "", units: [{ id: "11-1", label: "1", kind: "set", passage: "1. It was made.\n2. It made been.\n3. He was seen.\n4. Was he do?\n5. It is known.", answer: [1,3,5] }] },
]};
describe("landing English question book demo", () => {
  it("uses bank answer keys and preserves multi-select sets", () => {
    const items = englishDemoQuestions([book]);
    expect(items).toHaveLength(4);
    expect(items.find(q => q.section === 3)?.correct).toEqual([1]);
    expect(items.find(q => q.section === 8)).toMatchObject({multiple:true,correct:[0,2,4]});
    expect(items.find(q => q.section === 11)?.options).toHaveLength(5);
  });
  it("samples each requested section, without duplicates", () => {
    const items = drawEnglishDemoQuestions(englishDemoQuestions([book]),4,()=>0);
    expect(items.map(q => q.section)).toEqual([3,5,8,11]);
    expect(new Set(items.map(q => q.id)).size).toBe(4);
  });
  it("rejects passage-dependent MC items", () => {
    const b: Book = {id:1,sections:[{n:3,instr_en:"",instr_hy:"",units:[{id:"x",label:"x",kind:"mc",passage:"context",questions:[{n:"1",stem:"What?",options:{a:"a",b:"b",c:"c",d:"d"},answer:"a"}]}]}]};
    expect(englishDemoQuestions([b])).toEqual([]);
  });
});
