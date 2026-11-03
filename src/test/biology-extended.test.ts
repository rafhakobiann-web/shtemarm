import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { mergeBiologyExtended } from '@/lib/biology-extended';
import { historyBookEntries, selectHistoryUnits } from '@/lib/history';
import { scoreUnit } from '@/components/UnitCard';
import type { Book, Unit } from '@/lib/books';
const read=(p:string)=>JSON.parse(readFileSync(`public/data/${p}.json`,'utf8'));
describe('500 additional original Biology tasks',()=>{
  let total=0;
  for(const [v,expected] of [[3,277],[4,223]]) {
    const base=read(`bio-book${v}`) as Book;
    const extra=read(`biology-extended-book${v}`) as Book;
    const coverage=read('biology-extended-coverage').books.find((b:any)=>b.volume===v);
    const units=extra.sections.flatMap(s=>s.units);total+=units.length;
    it(`volume ${v}: merges unique printed IDs and retains every existing task`,()=>{
      const snapshot=JSON.stringify(base);
      const merged=mergeBiologyExtended(base,extra);
      expect(JSON.stringify(base)).toBe(snapshot);
      expect(units).toHaveLength(expected);
      const entries=historyBookEntries(merged,30+v);
      expect(entries).toHaveLength(coverage.totalPlayableTasks);
      expect(selectHistoryUnits(entries,70,false)).toHaveLength(70);
      expect(coverage.totalPlayableTasks+coverage.remainingTasks).toBe(v===3?1837:1688);
      const pending=read(`biology-volume${v}-coverage`);
      for(const section of extra.sections) for(const u of section.units){
        expect(pending.chapters.find((c:any)=>c.id===section.n).excluded.some((e:any)=>e.n===Number(u.label))).toBe(true);
        expect(u.id).toBe(`bio${v}-s${section.n}-q${u.label}`);
      }
      expect(()=>mergeBiologyExtended(merged,extra)).toThrow('Duplicate Biology task');
    });
    it(`volume ${v}: scores every source answer and rejects unanswered tasks`,()=>{
      for(const u of units){
        const answer=u.kind==='mc'||u.kind==='num'?{mc:{[u.questions[0].n]:u.questions[0].answer}}:
          u.kind==='set'||u.kind==='seq'?{nums:u.answer}:{};
        expect(scoreUnit(u,answer).got,u.id).toBe(1);
        expect(scoreUnit(u,undefined).got,u.id).toBe(0);
        if(u.kind==='seq')expect(scoreUnit(u,{nums:[...u.answer].reverse()}).got,u.id).toBe(0);
        if(u.kind==='set')expect(scoreUnit(u,{nums:[]}).got,u.id).toBe(0);
      }
    });
    it(`volume ${v}: has complete numbered alternatives and source-key evidence`,()=>{
      for(const s of extra.sections)for(const u of s.units){
        const row=coverage.entries.find((e:any)=>e.chapter===s.n&&e.number===Number(u.label));
        expect(row).toBeDefined();expect(row.answerPage).toBeGreaterThan(row.page);
        expect(JSON.stringify(u)).not.toMatch(/www\.|atc\.am|\ufffd/);
        if(u.kind==='set'||u.kind==='seq'){
          const numbers=[...u.passage.matchAll(/^([0-9]+)\. /gm)].map(m=>Number(m[1]));
          expect(numbers).toEqual(Array.from({length:u.count!},(_,i)=>i+1));
          expect(u.answer).toEqual(row.answer);
          expect(u.answer.every(n=>numbers.includes(n))).toBe(true);
          if(u.kind==='seq')expect([...u.answer].sort((a,b)=>a-b)).toEqual(numbers);
        }else if(u.kind==='mc'||u.kind==='num'){
          expect(u.questions).toHaveLength(1);expect(u.questions[0].answer).toBe(row.answer);
          if(u.kind==='mc')expect(Object.keys(u.questions[0].options)).toEqual(['1','2','3','4']);
        }
      }
    });
  }
  it('adds 500 whole printed tasks, rather than counting statements as separate tasks',()=>expect(total).toBe(500));
});
