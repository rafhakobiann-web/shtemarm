import { describe, expect, it } from "vitest";
import { buildAssessment, printablePrompt, printableAnswer, ASSESSMENT_SOURCES } from "@/lib/assessment-builder";
import { normalizeBiologyFirstBook, normalizeBiologySecondBook, type Book } from "@/lib/books";
import { historyBookEntries } from "@/lib/history";
import { TRUE_FALSE_ITEMS, MATCH_PAIRS } from "@/components/AdditionalMiniGames";
import { translate } from "@/lib/lang";
import { readFileSync } from "node:fs";

const book:Book={id:31,sections:[
  {n:1,title:"Բջջաբանություն",instr_hy:"",instr_en:"",units:[{id:"a",label:"1",kind:"mc",passage:"",questions:[
    {n:"1",stem:"Ո՞ր օրգանոիդն է պատասխանատու ԱԵՖ-ի արտադրության համար։",options:{"1":"Միտոքոնդրիում","2":"Ռիբոսոմ"},answer:"1"},
    {n:"2",stem:"Բջջի ո՞ր մասն է հիմնականում պահպանում ԴՆԹ-ն։",options:{"1":"Կորիզ","2":"Լիզոսոմ"},answer:"1"},
  ]}]},
  {n:2,title:"Ժառանգականություն",instr_hy:"",instr_en:"",units:[{id:"b",label:"2",kind:"mc",passage:"",questions:[
    {n:"3",stem:"Ո՞ր մոլեկուլն է կրում ժառանգական տեղեկությունը։",options:{"1":"ԴՆԹ","2":"Ջուր"},answer:"1"},
  ]}]},
]};
describe("Thematic and summative assessment generator",()=>{
  const entries=historyBookEntries(book,31);
  it("draws unique questions only from selected chapters for a thematic paper",()=>{
    const paper=buildAssessment(entries,{
      subject:"biology",kind:"thematic",sections:["Գիրք 31 · Բջջաբանություն"],count:2,random:()=>0,
    });
    expect(paper.units).toHaveLength(2);
    expect(new Set(paper.units.map(u=>u.id)).size).toBe(2);
    expect(paper.units.every(u=>u.label.includes("1"))).toBe(true);
    expect(paper.title).toContain("Թեմատիկ աշխատանք");
    expect(printablePrompt(paper.units[0]!)).toContain("1)");
    expect(printableAnswer(paper.units[0]!)).toContain("1");
  });
  it("summative covers the available bank and rejects impossible or zero lengths",()=>{
    const paper=buildAssessment(entries,{subject:"biology",kind:"summative",sections:[],count:3,random:()=>0});
    expect(paper.units).toHaveLength(3);
    expect(new Set(paper.units.map(u=>u.id)).size).toBe(3);
    expect(()=>buildAssessment(entries,{subject:"biology",kind:"summative",sections:[],count:4})).toThrow();
    expect(()=>buildAssessment(entries,{subject:"biology",kind:"summative",sections:[],count:0})).toThrow();
    expect(()=>buildAssessment(entries,{subject:"biology",kind:"thematic",sections:[],count:61})).toThrow();
    expect(ASSESSMENT_SOURCES.map(x=>x.key)).toContain("russian");
  });
  it("never rewrites the original answer keys when formatting Biology material",()=>{
    const first=normalizeBiologyFirstBook(book);
    expect(first.sections[0].units[0].kind).toBe("mc");
    const second=normalizeBiologySecondBook(book);
    expect(second.sections[0].units).toHaveLength(2);
    expect(second.sections[0].units[0].kind).toBe("mc");
    if(first.sections[0].units[0].kind==="mc")expect(first.sections[0].units[0].questions[0].answer).toBe("1");
  });
  it("cleans known Biology import artifacts without inventing replacement answers",()=>{
    const data=JSON.parse(readFileSync("public/data/bio-book2.json","utf8"));
    const loaded=normalizeBiologySecondBook(data);
    const first=loaded.sections[0].units.flatMap((u:any)=>u.questions??[]);
    expect(first.find((q:any)=>q.n==="3")?.options["2"]).not.toContain("   tc");
  });
});
describe("Mini-game bank and locale integrity",()=>{
  it("all true/false exercises contain a justified boolean answer",()=>{
    expect(TRUE_FALSE_ITEMS.length).toBeGreaterThanOrEqual(10);
    expect(TRUE_FALSE_ITEMS.every(x=>typeof x.truth==="boolean"&&x.reason.length>10)).toBe(true);
  });
  it("matching pairs have unique, unambiguous answer labels",()=>{
    expect(MATCH_PAIRS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(MATCH_PAIRS.map(x=>x.left)).size).toBe(MATCH_PAIRS.length);
    expect(new Set(MATCH_PAIRS.map(x=>x.right)).size).toBe(MATCH_PAIRS.length);
  });
  it("supports Russian navigation and retains Armenian source texts as fallback",()=>{
    expect(translate("ru","Մաթեմատիկա")).toBe("Математика");
    expect(translate("ru","Հայոց պատմություն")).toBe("История Армении");
    expect(translate("ru","Ոչ ստանդարտ տեքստ")).toBe("Ոչ ստանդարտ տեքստ");
  });
});
