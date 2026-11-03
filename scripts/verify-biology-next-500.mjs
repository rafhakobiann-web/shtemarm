#!/usr/bin/env node
/**
 * Check the next 500 Biology source references against existing playable banks
 * and the separate preceding 268-reference queue. This audit does not convert
 * unverified printed questions into playable or published website questions.
 */
import {readFileSync} from "node:fs";
const read=(p)=>JSON.parse(readFileSync(p,"utf8"));
function assert(ok,msg){if(!ok)throw new Error(msg)}
const batch=read("docs/biology-next-500-source-queue.json");
const prev=read("docs/biology-next-268-source-review.json");
const supplement=read("public/data/biology-extended-coverage.json");
assert(batch.schemaVersion===1&&batch.selected===500,"Expected 500 Biology source entries");
assert(batch.entries.length===500&&batch.distribution["3"]===200&&batch.distribution["4"]===300,"Unexpected batch counts");
assert(prev.entries.length===268&&batch.previousUnrestoredQueue===268,"Previous review batch has changed");
assert(batch.currentPlayable===2257&&batch.currentBacklog===1268&&batch.pendingIfPrior268ThenThis500Validated===500,"Stale coverage baseline");
assert(supplement.books.reduce((n,b)=>n+b.totalPlayableTasks,0)===batch.currentPlayable,"Playable baseline changed");
assert(supplement.books.reduce((n,b)=>n+b.remainingTasks,0)===batch.currentBacklog,"Backlog baseline changed");
const preceding=new Set(prev.entries.map(e=>`4:${e.chapter}:${e.printedNumber}`));
const visited=new Set();
const counts={3:0,4:0};
for(const volume of [3,4]){
 const idx=read(`public/data/biology-original-volume${volume}-index.json`);
 const coverage=read(`public/data/biology-volume${volume}-coverage.json`);
 const core=read(`public/data/bio-book${volume}.json`);
 const extra=read(`public/data/biology-extended-book${volume}.json`);
 const playable=new Set([core,extra].flatMap(b=>b.sections.flatMap(s=>s.units.map(u=>`${s.n}:${Number(u.label)}`))));
 assert(idx.sourceSha256===batch.sourceSha256[String(volume)],`Incorrect fingerprint for ${volume}`);
 for(const row of batch.entries.filter(x=>x[0]===volume)){
  const [v,c,n,p,answerFirst,answerLast,reason]=row;
  counts[volume]++;
  const key=`${v}:${c}:${n}`;
  assert(!visited.has(key)&&!preceding.has(key),`Duplicate selected source: ${key}`);
  visited.add(key);
  assert(!playable.has(`${c}:${n}`),`Already playable: ${key}`);
  const chapter=idx.chapters.find(ch=>ch.id===c),record=coverage.chapters.find(ch=>ch.id===c);
  assert(chapter&&record&&n>0&&n<=chapter.questionCount,`Invalid printed task: ${key}`);
  assert(record.excluded.some(x=>x.n===n&&x.reason===reason),`Source task is not pending: ${key}`);
  let expectedPage=chapter.startPage;
  for(const [first,page] of chapter.pageRuns){if(first>n)break;expectedPage=page}
  assert(expectedPage===p,`Incorrect source page: ${key}`);
  assert(chapter.answerPages[0]===answerFirst&&chapter.answerPages[1]===answerLast,`Incorrect key pages: ${key}`);
 }
}
assert(counts[3]===200&&counts[4]===300&&visited.size===500,"Non-unique or incomplete selection");
assert(batch.currentBacklog-prev.entries.length-batch.entries.length===500,"Cannot claim 500 pending after both queues");
console.log(JSON.stringify({selected:visited.size,byVolume:counts,overlapWithPriorQueue:0,
 currentPlayable:batch.currentPlayable,currentBacklog:batch.currentBacklog,
 remainingIfAll768ReviewedAndImported:500,status:"source_reference_queue_not_playable"},null,2));
