#!/usr/bin/env node
/**
 * Check source-index coverage for every numbered Biology III/IV task.
 *
 * Source-only review queues are NOT playable and must never increase the
 * user-visible counts. To make a reviewed task playable, first verify its
 * original text, complete answer form, printed key, and publication rights.
 */
import {readFileSync} from "node:fs";

const read = path => JSON.parse(readFileSync(path, "utf8"));
const demand = (ok, message) => {if (!ok) throw new Error(message);};
const final = read("docs/biology-final-500-source-queue.json");
const preceding = read("docs/biology-next-500-source-queue.json");
const first = read("docs/biology-next-268-source-review.json");
const extended = read("public/data/biology-extended-coverage.json");
demand(final.schemaVersion === 1 && final.finalQueueItems === 500 && final.entries.length === 500,
  "Expected 500 final source references");
demand(first.entries.length === 268 && preceding.entries.length === 500,
  "Preceding queues changed: re-audit before accepting final queue");

const selection = new Map();
const insert = (volume,chapter,number,category) => {
  const key = `${volume}:${chapter}:${number}`;
  demand(!selection.has(key), `Duplicate source task ${key} (${selection.get(key)}, ${category})`);
  selection.set(key, category);
};
for (const row of first.entries) insert(4,row.chapter,row.printedNumber,"first268");
for (const [v,c,n] of preceding.entries) insert(v,c,n,"next500");
for (const [v,c,n] of final.entries) insert(v,c,n,"final500");
demand(selection.size === 1268,"The review batches must contain exactly 1268 unique tasks");

let baseCount=0, supplementCount=0;
for (const volume of [3,4]) {
  const core = read(`public/data/bio-book${volume}.json`);
  const supplement = read(`public/data/biology-extended-book${volume}.json`);
  const coverage = read(`public/data/biology-volume${volume}-coverage.json`);
  const index = read(`public/data/biology-original-volume${volume}-index.json`);
  const counts = extended.books.find(row => row.volume===volume);
  demand(index.sourceSha256===final.sourceSha256[String(volume)],
    `Wrong PDF fingerprint for volume ${volume}`);
  demand(index.chapters.reduce((n,c)=>n+c.questionCount,0)===
    (volume===3 ? final.totalIndexed.volume3 : final.totalIndexed.volume4),
    `Printed total changed for volume ${volume}`);
  const coreKeys=new Set();
  for (const section of core.sections) for (const unit of section.units) {
    const key = `${section.n}:${Number(unit.label)}`;
    demand(!coreKeys.has(key),`Duplicate base task ${volume}:${key}`);
    coreKeys.add(key);
    baseCount++;
  }
  const extraKeys=new Set();
  for (const section of supplement.sections) for (const unit of section.units) {
    const key = `${section.n}:${Number(unit.label)}`;
    demand(!coreKeys.has(key)&&!extraKeys.has(key),`Duplicate playable task ${volume}:${key}`);
    extraKeys.add(key);
    supplementCount++;
  }
  demand(coreKeys.size===counts.baseTasks && extraKeys.size===counts.additionalTasks,
    `Playable counts diverged for volume ${volume}`);
  const pending = new Set();
  for (const chapter of coverage.chapters){
    const indexChapter=index.chapters.find(ch=>ch.id===chapter.id);
    demand(!!indexChapter, `Missing chapter ${volume}:${chapter.id}`);
    for (const exc of chapter.excluded){
      const key=`${volume}:${chapter.id}:${exc.n}`;
      demand(!pending.has(key),`Duplicate exclusion ${key}`);
      pending.add(key);
      const localKey=`${chapter.id}:${exc.n}`;
      demand(!coreKeys.has(localKey),`Base task still marked excluded: ${key}`);
      const isExtra=extraKeys.has(localKey);
      const isQueue=selection.has(key);
      demand(isExtra!==isQueue, `Pending task unassigned or doubly assigned: ${key}`);
    }
    for(let number=1;number<=indexChapter.questionCount;number++){
      const localKey=`${chapter.id}:${number}`;
      const key=`${volume}:${localKey}`;
      const ways=Number(coreKeys.has(localKey))+Number(extraKeys.has(localKey))+Number(selection.has(key));
      demand(ways===1,`Printed question ${key} is uncovered or duplicated`);
    }
  }
  demand([...selection.keys()].filter(k=>k.startsWith(volume+":")).length===counts.remainingTasks,
    `Queue counts differ from remainingTasks for volume ${volume}`);
}
for (const [v,c,n,page,ansStart,ansEnd,reason] of final.entries){
  const index=read(`public/data/biology-original-volume${v}-index.json`);
  const chapter=index.chapters.find(ch=>ch.id===c);
  const coverage=read(`public/data/biology-volume${v}-coverage.json`).chapters.find(ch=>ch.id===c);
  demand(chapter&&coverage&&n>=1&&n<=chapter.questionCount, `Invalid task ${v}:${c}:${n}`);
  demand(coverage.excluded.some(e=>e.n===n&&e.reason===reason),`No matching exclusion ${v}:${c}:${n}`);
  let expected=chapter.startPage;
  for(const [first,p] of chapter.pageRuns){if(first>n)break;expected=p}
  demand(expected===page&&ansStart===chapter.answerPages[0]&&ansEnd===chapter.answerPages[1],
    `Source page or printed answer-page range mismatch for ${v}:${c}:${n}`);
}
demand(baseCount+supplementCount===2257 && selection.size===1268,
  "Expected 2257 playable and 1268 review-only source references");
demand(final.currentPlayable===2257 && final.currentBacklog===1268,
  "Baseline count stale; re-check current PRs");
demand(final.unassignedAfterAllQueues===0 && final.targetRemainingAfterAllQueuesImportedAndVerified===0,
  "Incorrect target accounting");
console.log(JSON.stringify({sourceIndexed:baseCount+supplementCount+selection.size,
 playable:baseCount+supplementCount,reviewOnly:selection.size,
 finalBatch:final.entries.length,unassignedSourceNumbers:0,
 remainingUnimported:selection.size,status:"all_source_references_indexed_not_all_playable"},null,2));
