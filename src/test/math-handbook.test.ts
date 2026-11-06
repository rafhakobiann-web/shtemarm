import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  MATH_HANDBOOK_SECTIONS, MATH_HANDBOOK_TOPICS,
  findMathSection, categoriesForMathSection, mathTopicsForSection,
  mathBookUrl, mathGameUrl,
} from "@/lib/mathHandbook";
import { getMathMistakes, recordMathMistake, markMathMistakeMastered, removeMathMistake } from "@/lib/mathMistakes";

type Source = {books:Record<string,{sections:{chapter:number;section:number;title:string;pages:[number,number];tasks:unknown[]}[]}>};
const source=JSON.parse(readFileSync("public/data/math-books-index.json","utf8")) as Source;

describe("Math handbook source alignment",()=>{
  it("covers every actual section in both books with matching titles and task counts",()=>{
    const sourceSections=Object.values(source.books).reduce((n,b)=>n+b.sections.length,0);
    expect(MATH_HANDBOOK_SECTIONS).toHaveLength(sourceSections);
    expect(MATH_HANDBOOK_SECTIONS).toHaveLength(46);
    for (const [book,data] of Object.entries(source.books)){
      for (const s of data.sections){
        const handbook=findMathSection(book,s.chapter,s.section);
        expect(handbook,book+":"+s.chapter+"-"+s.section).toBeDefined();
        expect(handbook?.title).toBe(s.title);
        expect(handbook?.pages).toEqual(s.pages);
        expect(handbook?.tasks).toBe(s.tasks.length);
        expect(categoriesForMathSection(s.title).length).toBeGreaterThan(0);
        expect(mathTopicsForSection(handbook!).length).toBeGreaterThan(0);
      }
    }
  });
  it("opens original math exercise, game and test for the same book/chapter/section",()=>{
    for (const section of MATH_HANDBOOK_SECTIONS){
      expect(mathBookUrl(section)).toBe(`/math/books?book=${section.book}&sec=${section.chapter}-${section.section}`);
      expect(mathGameUrl(section)).toContain(`sec=${section.chapter}-${section.section}&mode=play`);
      expect(mathGameUrl(section,"test")).toContain("mode=test");
      if(section.chapter===3) expect(mathTopicsForSection(section).some(t=>t.id==="true-false-check")).toBe(true);
    }
  });
  it("links derivative, tangent, absolute-value and extrema rules to both function chapters",()=>{
    const required=["derivative-power","derivative-product-exponential","tangent-equation","absolute-value-derivative","derivative-extrema"];
    const first=findMathSection("matem-1",2,5)!;
    const second=findMathSection("matem-2",2,4)!;
    for(const section of [first,second]){
      const ids=new Set(mathTopicsForSection(section).map(t=>t.id));
      for(const id of required)expect(ids.has(id),section.book+" missing "+id).toBe(true);
    }
    const expr=findMathSection("matem-2",1,2)!;
    expect(mathTopicsForSection(expr).some(t=>t.id==="logarithm-properties")).toBe(true);
  });
  it("keeps TeX formulas delimited and ensures complete multilingual calculus lessons",()=>{
    expect(MATH_HANDBOOK_TOPICS.length).toBeGreaterThanOrEqual(53);
    for(const topic of MATH_HANDBOOK_TOPICS){
      if(topic.formula.includes("\\"))expect(topic.formula,topic.id).toContain("$");
      expect((topic.formula.match(/\\$/g)??[]).length%2,topic.id).toBe(0);
    }
    const ids=["derivative-power","derivative-product-exponential","tangent-equation","absolute-value-derivative","derivative-extrema","logarithm-properties"];
    for(const id of ids){
      const topic=MATH_HANDBOOK_TOPICS.find(item=>item.id===id);
      expect(topic,id).toBeDefined();
      for(const lang of ["hy","en","ru"] as const)expect(topic!.steps[lang]).toHaveLength(3);
    }
  });
  it("has complete multilingual manually worked lessons and no topic ID collisions",()=>{
    expect(MATH_HANDBOOK_TOPICS.length).toBeGreaterThanOrEqual(36);
    expect(new Set(MATH_HANDBOOK_TOPICS.map(t=>t.id)).size).toBe(MATH_HANDBOOK_TOPICS.length);
    for (const topic of MATH_HANDBOOK_TOPICS){
      expect(topic.formula).toBeTruthy();
      expect(topic.answer).toBeTruthy();
      for(const lang of ["hy","en","ru"] as const){
        expect(topic.title[lang].length).toBeGreaterThan(4);
        expect(topic.summary[lang].length).toBeGreaterThan(25);
        expect(topic.problem[lang].length).toBeGreaterThan(8);
        expect(topic.steps[lang].length).toBeGreaterThanOrEqual(3);
        for (const step of topic.steps[lang])expect(step.trim().length).toBeGreaterThan(2);
        expect(topic.mistake[lang].length).toBeGreaterThan(20);
      }
      expect(topic.title.hy).not.toBe(topic.title.en);
      expect(topic.title.ru).not.toBe(topic.title.en);
    }
  });
});
describe("Math mistake review",()=>{
  beforeEach(()=>window.localStorage.clear());
  const sample={id:"matem-1:1:3:1:2",book:"matem-1" as const,chapter:1,section:3,task:1,sub:2,kind:"open" as const,correct:"1.5",chosen:"2.5",prompt:"3x=4.5"};
  it("records wrong answers and deduplicates immediate double taps",()=>{
    recordMathMistake(sample);
    recordMathMistake(sample);
    expect(getMathMistakes()).toHaveLength(1);
    expect(getMathMistakes()[0]?.attempts).toBe(1);
    expect(getMathMistakes()[0]?.mastered).toBe(false);
  });
  it("marks mastered only after a mathematically correct retry",()=>{
    recordMathMistake(sample);
    expect(markMathMistakeMastered(sample.id,"1.4")).toBe(false);
    expect(getMathMistakes()[0]?.mastered).toBe(false);
    expect(markMathMistakeMastered(sample.id,"1,5")).toBe(true);
    expect(getMathMistakes()[0]?.mastered).toBe(true);
    removeMathMistake(sample.id);
    expect(getMathMistakes()).toHaveLength(0);
  });
  it("never records correct answers as mistakes",()=>{
    recordMathMistake({...sample,chosen:"1,5"});
    expect(getMathMistakes()).toHaveLength(0);
  });
  it("survives malformed saved JSON without crashing",()=>{
    localStorage.setItem("shtemarm:math-mistakes:v1","{not-json");
    expect(getMathMistakes()).toEqual([]);
    recordMathMistake(sample);
    expect(getMathMistakes()).toHaveLength(1);
  });
});
