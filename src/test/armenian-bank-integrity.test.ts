import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const load = (part: number) => JSON.parse(readFileSync(`public/data/armenian-book${part}.json`, "utf8"));
describe("Armenian authored practice: exhaustive answer integrity", () => {
  const counts = [96, 10, 10, 10];
  for(let part=1;part<=4;part++) it(`verifies all answers in volume ${part}`,()=>{
    const bank=load(part);
    expect(bank.id).toBe(40+part);
    const sectionNumbers=new Set<number>(),unitIds=new Set<string>(),answerIds=new Set<string>();
    let count=0;
    for(const section of bank.sections){
      expect(sectionNumbers.has(section.n)).toBe(false);
      sectionNumbers.add(section.n);
      expect(section.title.trim().length).toBeGreaterThan(4);
      for(const unit of section.units){
        expect(unit.kind).toBe("mc");
        expect(unitIds.has(unit.id)).toBe(false);
        unitIds.add(unit.id);
        expect(unit.questions.length).toBeGreaterThan(0);
        for(const q of unit.questions){
          const key=unit.id+":"+q.n;
          expect(answerIds.has(key)).toBe(false);
          answerIds.add(key);
          expect(q.stem.trim().length).toBeGreaterThan(8);
          expect(Object.keys(q.options).sort()).toEqual(["1","2","3","4"]);
          for(const choice of Object.values(q.options) as string[])expect(choice.trim().length).toBeGreaterThan(0);
          expect(["1","2","3","4"]).toContain(String(q.answer));
          expect(q.options[String(q.answer)]).toBeTruthy();
          count++;
        }
      }
    }
    expect(count).toBe(counts[part-1]);
    expect(answerIds.size).toBe(count);
  });
  it("keeps the 126 authored exercises separate from official PDF question banks",()=>{
    const meta=JSON.parse(readFileSync("public/data/armenian-books-index.json","utf8"));
    expect(meta.officialDigitizedBooks).toBe(0);
    const count=[1,2,3,4].reduce((n,part)=>n+load(part).sections.reduce((a:number,s:{units:{questions:unknown[]}[]})=>a+s.units.reduce((b,u)=>b+u.questions.length,0),0),0);
    expect(count).toBe(126);
  });
});
