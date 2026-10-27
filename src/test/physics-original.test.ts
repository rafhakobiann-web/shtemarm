import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {scoreUnit} from "@/components/UnitCard";
import {validatePhysicsOriginalBank,sourceAsUnit,sourceQuestionsForVolume,
 type PhysicsTranscriptionBank} from "@/lib/physics-original";

const real=JSON.parse(readFileSync("public/data/physics-original-transcribed.json","utf8")) as PhysicsTranscriptionBank;
describe("real source-linked text exercises from uploaded physics PDFs",()=>{
  it("keeps both source books and no synthetic practice exercises in the verified bank",()=>{
    expect(validatePhysicsOriginalBank(real)).toBeGreaterThanOrEqual(30);
    expect(sourceQuestionsForVolume(real,61).length).toBeGreaterThanOrEqual(15);
    expect(sourceQuestionsForVolume(real,62).length).toBeGreaterThanOrEqual(15);
    expect(real.provenance).toMatch(/2017|scanned|source/i);
    expect(real.items.every(q=>q.id.startsWith("physics-original-"))).toBe(true);
    expect(real.items.every(q=>q.section.includes("Կինեմատիկա"))).toBe(true);
  });
  it("scores source-checked answers by printed exercise number and one of four alternatives",()=>{
    for(const question of real.items){
      const u=sourceAsUnit(question);
      expect(u.kind).toBe("mc");
      expect(u.label).toBe(String(question.number));
      expect(Object.values(question.options).every(Boolean)).toBe(true);
      expect(scoreUnit(u,{mc:{[String(question.number)]:question.answer}}).got).toBe(1);
      const other=String(Number(question.answer)%4+1);
      expect(scoreUnit(u,{mc:{[String(question.number)]:other}}).got).toBe(0);
    }
  });
  it("provides original PDF page and actual printed answer-key page for every item",()=>{
    for(const q of real.items){
      expect(q.page).toBeLessThan(60);
      expect(q.page).toBeGreaterThanOrEqual(5);
      expect(q.answerKeyPage).toBe(q.book===61?406:409);
      expect(q.status).toBe("source-reviewed");
    }
    const [a,b]=[sourceQuestionsForVolume(real,61),sourceQuestionsForVolume(real,62)];
    expect(a[0]?.number).toBe(1);
    expect(b[0]?.number).toBe(1);
    expect(a[0]?.answer).toBe("2");
    expect(b[0]?.answer).toBe("2");
    expect(a.find(q=>q.number===25)?.answer).toBe("1");
    expect(b.find(q=>q.number===24)?.answer).toBe("3");
  });
  it("rejects duplicates, swapped answer key editions, incomplete options and empty stems",()=>{
    const damaged=JSON.parse(JSON.stringify(real)) as PhysicsTranscriptionBank;
    damaged.items.push({...damaged.items[0]!,id:"different",answer:"1"});
    expect(()=>validatePhysicsOriginalBank(damaged)).toThrow(/Վնասված/);
    const missing=JSON.parse(JSON.stringify(real)) as PhysicsTranscriptionBank;
    missing.items[0]!.options["2"]="";
    expect(()=>validatePhysicsOriginalBank(missing)).toThrow(/Վնասված/);
    const wrong=JSON.parse(JSON.stringify(real)) as PhysicsTranscriptionBank;
    wrong.items[0]!.answerKeyPage=409;
    expect(()=>validatePhysicsOriginalBank(wrong)).toThrow(/Վնասված/);
  });
  it("offers a live task-solving route distinct from the independently authored 2027 practice bank",()=>{
    expect(readFileSync("src/routes/physics.original.tsx","utf8")).toContain("/physics/original");
    const app=readFileSync("src/components/PhysicsOriginalWorkspace.tsx","utf8");
    expect(app).toContain("scoreUnit");
    expect(app).toContain("sourceAsUnit");
    expect(app).toContain("/physics/books");
    expect(app).toContain("answer");
    expect(readFileSync("src/components/PhysicsWorkspace.tsx","utf8")).toContain("/physics/original");
    const script=readFileSync("scripts/digitize-physics-scans.py","utf8");
    expect(script).toContain("ocr-needs-manual-review");
    expect(script).toContain("hash mismatch");
    expect(script).toContain("verifiedAnswer");
  });
});
