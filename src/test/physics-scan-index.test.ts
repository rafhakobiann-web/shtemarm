import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  PHYSICS_SCAN_INDEX, physicsIndexedQuestions, lookupPhysicsIndexedQuestion,
  physicsScanRound, scorePhysicsScan,
} from "@/lib/physics-scan-index";
import { PHYSICS_SOURCES } from "@/lib/physics-source";
import type { PhysicsTranscriptionBank } from "@/lib/physics-original";

const verifiedTextBank=JSON.parse(readFileSync(
  "public/data/physics-original-transcribed.json","utf8",
)) as PhysicsTranscriptionBank;

describe("Physics originals: first 250 source-linked problems",()=>{
  it("has 125 printed question identifiers from each of the two 2017 PDF scans",()=>{
    expect(PHYSICS_SCAN_INDEX).toHaveLength(250);
    expect(new Set(PHYSICS_SCAN_INDEX.map(q=>q.id)).size).toBe(250);
    for(const volume of [61,62] as const){
      const indexed=physicsIndexedQuestions(volume);
      expect(indexed).toHaveLength(125);
      expect(indexed.map(q=>q.number)).toEqual(Array.from({length:125},(_,i)=>i+1));
      for(const q of indexed){
        expect(q.id).toBe("physics-scan-"+volume+"-"+q.number);
        expect(q.volume).toBe(volume);
        expect(q.source).toBe("original-scan");
        expect(q.type).toBe("choice");
        expect(["1","2","3","4"]).toContain(q.answer);
        expect(q.page).toBeGreaterThanOrEqual(5);
        expect(q.page).toBeLessThan(PHYSICS_SOURCES[volume].answersStart);
        expect(q.keyPage).toBe(PHYSICS_SOURCES[volume].answersStart);
      }
    }
  });
  it("preserves physically verified source-page boundaries",()=>{
    expect([1,5,6,10,11,15,16,20,21,25,26,30,31,35,36,39,40,44,45,49,50,53,54,58,59,62,63,68,69,70,71,74,75,78,79,81,82,86,87,91,92,93,94,98,99,103,104,107,108,112,113,118,119,124,125].map(n=>lookupPhysicsIndexedQuestion(61,n)?.page))
      .toEqual([5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,30,30,31,31,32]);
    expect([1,4,5,9,10,14,15,20,21,24,25,28,29,32,33,36,37,40,41,46,47,51,52,55,56,60,61,66,67,70,71,73,74,79,80,83,84,88,89,93,94,99,100,105,106,110,111,115,116,121,122,124,125].map(n=>lookupPhysicsIndexedQuestion(62,n)?.page))
      .toEqual([5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,30,30,31]);
  });
  it("agrees with EVERY prior manually reviewed text transcription answer and source page",()=>{
    expect(verifiedTextBank.items.length).toBeGreaterThanOrEqual(50);
    for(const q of verifiedTextBank.items){
      const indexed=lookupPhysicsIndexedQuestion(q.book,q.number);
      expect(indexed,q.id).not.toBeNull();
      expect(indexed!.answer,q.id+" printed answer code").toBe(q.answer);
      expect(indexed!.page,q.id+" original PDF page").toBe(q.page);
    }
  });
  it("tests manual answer-table spot checks, including non-transcribed questions",()=>{
    const examples=[
      [61,1,"2"],[61,35,"1"],[61,36,"1"],[61,53,"3"],
      [61,74,"2"],[61,75,"2"],[61,100,"4"],[61,125,"3"],
      [62,1,"2"],[62,32,"2"],[62,36,"4"],[62,53,"4"],
      [62,74,"2"],[62,75,"2"],[62,100,"2"],[62,125,"4"],
    ] as const;
    for(const [volume,num,expected] of examples){
      expect(lookupPhysicsIndexedQuestion(volume,num)?.answer,String(volume)+"/"+String(num)).toBe(expected);
    }
  });
  it("keeps randomized rounds unique and scores only answered items",()=>{
    const round=physicsScanRound(61,91,20,false);
    expect(round.map(q=>q.number)).toEqual(Array.from({length:20},(_,i)=>91+i));
    const shuffled=physicsScanRound(62,10,40,true,()=>0);
    expect(shuffled).toHaveLength(40);
    expect(new Set(shuffled.map(q=>q.number)).size).toBe(40);
    const all=physicsScanRound(62,120,125,false);
    expect(all.map(q=>q.number)).toEqual([120,121,122,123,124,125]);
    expect(scorePhysicsScan(round,{})).toEqual({correct:0,answered:0,total:20});
    expect(scorePhysicsScan(round,{[round[0]!.id]:round[0]!.answer,
      [round[1]!.id]:round[1]!.answer==="1"?"2":"1"}))
      .toEqual({correct:1,answered:2,total:20});
    expect(lookupPhysicsIndexedQuestion(61,0)).toBeNull();
    expect(lookupPhysicsIndexedQuestion(62,126)).toBeNull();
    expect(()=>physicsScanRound(61,0,20)).toThrow();
  });
  it("forces exact matching of learner-owned PDFs BEFORE graded answers",()=>{
    const source=readFileSync("src/components/PhysicsScanPractice.tsx","utf8");
    expect(source).toContain("confirmPhysicsSourcePdf");
    expect(source).toContain('status!=="verified"');
    expect(source).toContain("getLocalPhysicsPdf");
    expect(source).toContain("putLocalPhysicsPdf");
    expect(source).toContain("URL.createObjectURL");
    expect(source).toContain("iframe");
    expect(source).not.toContain("fetch(source.webPdf)");
    expect(readFileSync("src/routes/physics.scan-practice.tsx","utf8")).toContain("/physics/scan-practice");
  });
});
