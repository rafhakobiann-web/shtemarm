import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PHYSICS_BOOKS, ALL_BOOKS, type Book, unitPoints } from "@/lib/books";
import { GTC_BLUEPRINTS, assertBlueprint } from "@/lib/gtc-blueprints";
import { isGtcClaimsBundle, normNum, scoreUnit } from "@/components/UnitCard";
import { PHYSICS_BOOK_IDS, PHYSICS_SOURCE, checkPhysicsBook, makePhysicsModel,
  physicsEntries, physicsSlotType } from "@/lib/physics";
import { ASSESSMENT_SOURCES } from "@/lib/assessment-builder";

const books:Book[]=PHYSICS_BOOK_IDS.map(id=>JSON.parse(readFileSync(
  "public/data/physics-book"+(id-60)+".json","utf8"
)) as Book);

describe("two independent Shtemarm physics practice volumes",()=>{
  it("registers both volumes as real in-app books and connects assessments",()=>{
    expect(PHYSICS_BOOKS.map(x=>x.id)).toEqual([61,62]);
    expect(books.map(b=>b.id)).toEqual([61,62]);
    expect(PHYSICS_BOOKS.every(meta=>ALL_BOOKS.some(b=>b.id===meta.id))).toBe(true);
    expect(ASSESSMENT_SOURCES.find(x=>x.key==="physics")?.books).toEqual([61,62,63,64]);
    expect(PHYSICS_SOURCE.part1).toMatch(/^https:\/\/shtemaran\.am\//);
    expect(PHYSICS_SOURCE.part2).toMatch(/^https:\/\/shtemaran\.am\//);
  });
  it("contains original clearly-labelled practice questions, not falsely copied GTC book text",()=>{
    for(const book of books){
      const raw=JSON.parse(readFileSync("public/data/physics-book"+(book.id-60)+".json","utf8"));
      expect(raw.provenance).toContain("ORIGINAL");
      expect(raw.provenance).toContain("Not reproduced");
      expect(book.sections).toHaveLength(4);
      const stats=checkPhysicsBook(book);
      expect(stats).toEqual({
        taskCount:55,choice:40,shortGroups:13,shortSlots:28,
        claims:2,maxPoints:80,answerSlots:70,
      });
      for(const s of book.sections){
        expect(s.title?.trim().length).toBeGreaterThan(5);
        expect(s.units.length).toBeGreaterThan(10);
        for(const u of s.units){
          expect(u.passage!==undefined).toBe(true);
          if(u.kind==="mc")for(const q of u.questions){
            expect(q.stem.trim().length).toBeGreaterThan(12);
            expect(q.explanation?.trim().length).toBeGreaterThan(10);
            expect(q.options[q.answer]).toBeTruthy();
          }
          if(u.kind==="num")for(const q of u.questions){
            expect(q.stem).toMatch(/Պատասխանում|Որքա՞ն|Քանի՞/);
            expect(q.explanation?.trim().length).toBeGreaterThan(10);
            expect(Number(q.answer)).toBeGreaterThanOrEqual(0);
            expect(Number(q.answer)).toBeLessThanOrEqual(9999);
          }
        }
      }
    }
  });
  it("maintains 2027 official task class quotas on standalone book mocks",()=>{
    expect(assertBlueprint(GTC_BLUEPRINTS.physics)).toBe(true);
    for(const source of ["61","62"]){
      const result=makePhysicsModel(books,source,false);
      expect(result.mainTasks).toBe(55);
      expect(result.answerSlots).toBe(70);
      expect(result.totalPoints).toBe(80);
      expect(result.units).toHaveLength(55);
      expect(result.units.filter(u=>physicsSlotType(u)==="choice")).toHaveLength(40);
      expect(result.units.filter(u=>physicsSlotType(u)==="short")).toHaveLength(13);
      expect(result.units.filter(u=>physicsSlotType(u)==="claims")).toHaveLength(2);
      expect(result.units.reduce((sum,u)=>sum+unitPoints(u),0)).toBe(80);
      const ids=result.units.map(u=>u.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(result.units.slice(0,40).map(u=>u.label)).toEqual(Array.from({length:40},(_,i)=>String(i+1)));
      expect(result.units.at(-2)?.label).toBe("69");
      expect(result.units.at(-1)?.label).toBe("70");
      for(const u of result.units.filter(u=>physicsSlotType(u)==="claims")){
        expect(isGtcClaimsBundle(u)).toBe(true);
        expect(u.kind).toBe("mc");
        if(u.kind==="mc"){
          const picks=Object.fromEntries(u.questions.map(q=>[q.n,q.answer]));
          expect(scoreUnit(u,{mc:picks}).got).toBe(6);
          const wrong=Object.fromEntries(u.questions.map(q=>[q.n,q.answer==="1"?"2":"1"]));
          expect(scoreUnit(u,{mc:wrong}).got).toBe(0);
        }
      }
    }
  });
  it("creates a correctly numbered mixed-paper model with either source, never repeated tasks",()=>{
    for(let attempt=0;attempt<12;attempt++){
      const mixed=makePhysicsModel(books,"all",true);
      expect(mixed.units).toHaveLength(55);
      expect(new Set(mixed.units.map(u=>u.id)).size).toBe(55);
      const allShort=mixed.units.filter(u=>u.kind==="num").flatMap(u=>u.kind==="num"?u.questions.map(q=>Number(q.n)):[]);
      expect(allShort).toEqual(Array.from({length:28},(_,i)=>41+i));
      expect(mixed.units.reduce((sum,u)=>sum+unitPoints(u),0)).toBe(80);
      expect(mixed.bookId).toBe(60);
    }
  });
  it("exposes each question for thematic testing without losing six-claim groups",()=>{
    const all=physicsEntries(books);
    expect(all).toHaveLength(140);
    expect(new Set(all.map(e=>e.unit.id)).size).toBe(140);
    const original=physicsEntries([books[0]!]);
    expect(original).toHaveLength(70);
    expect(original.filter(e=>physicsSlotType(e.unit)==="claims")).toHaveLength(2);
    expect(original.filter(e=>physicsSlotType(e.unit)==="short")).toHaveLength(28);
    expect(original.filter(e=>physicsSlotType(e.unit)==="choice")).toHaveLength(40);
  });
  it("includes known manually verifiable calculations and answer codes",()=>{
    const first=books[0]!;
    const motion=first.sections[0]!.units.find(u=>u.id==="physics-1-short-1");
    expect(motion?.kind).toBe("num");
    if(motion?.kind==="num")expect(motion.questions.map(q=>q.answer)).toEqual(["48","20"]);
    const second=books[1]!;
    const gas=second.sections[0]!.units.find(u=>u.id==="physics-2-short-3");
    expect(gas?.kind).toBe("num");
    if(gas?.kind==="num")expect(gas.questions.map(q=>q.answer)).toEqual(["2400","3200","1200"]);
    const lens=second.sections[3]!.units.find(u=>u.id==="physics-2-short-11");
    expect(lens?.kind).toBe("num");
    if(lens?.kind==="num")expect(lens.questions.map(q=>q.answer)).toEqual(["4","3"]);
    expect(normNum("1000")).toBe("1000");
  });
  it("rejects corrupted numeric and structural data instead of silently inventing answers",()=>{
    const corrupt:Book=JSON.parse(JSON.stringify(books[0]));
    const group=corrupt.sections[0]!.units.find(u=>u.kind==="num");
    if(group?.kind!=="num")throw Error("Numeric group missing");
    group.questions[0]!.answer="8.5";
    expect(()=>checkPhysicsBook(corrupt)).toThrow(/0–9999/);
  });
});
