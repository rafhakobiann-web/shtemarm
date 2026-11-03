#!/usr/bin/env node
/**
 * Source-reference validation for the next 268 Biology IV tasks.
 * This is a REVIEW QUEUE, not a playable supplement. Do not increase question
 * counts until every question/answer format is checked against the original PDF
 * and redistribution rights are established.
 *
 * Usage: node scripts/verify-biology-next-268.mjs [path/to/kensab-4.pdf]
 */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read = path => JSON.parse(readFileSync(path,"utf8"));
const batch = read("docs/biology-next-268-source-review.json");
const idx = read("public/data/biology-original-volume4-index.json");
const core = read("public/data/biology-volume4-coverage.json");
const ext = read("public/data/biology-extended-coverage.json");
const base = read("public/data/bio-book4.json");
const extBook = read("public/data/biology-extended-book4.json");
function assert(condition,message){if(!condition)throw new Error(message)}
const extStats=ext.books.find(b=>b.volume===4);
assert(batch.volume===4 && batch.sourceSha256===idx.sourceSha256,"Wrong Biology IV source");
assert(batch.selectionCount===268 && batch.entries.length===268,"Exactly 268 entries required");
assert(batch.combinedBacklogBefore===1268 && batch.targetCombinedBacklogAfterSuccessfulRestoration===1000,"Incorrect aggregate backlog target");
assert(ext.books.reduce((sum,b)=>sum+b.remainingTasks,0)===1268,"Backlog changed: re-index before import");
assert(extStats.totalPlayableTasks===batch.basePlayable,"Base count changed");
const known=new Set();
for(const bank of [base,extBook])for(const section of bank.sections)for(const unit of section.units)
  known.add(section.n+":"+Number(unit.label));
const unique=new Set();
for(const row of batch.entries){
 const key=row.chapter+":"+row.printedNumber;
 assert(!unique.has(key),"Duplicate selected source task: "+key);unique.add(key);
 assert(!known.has(key),"Selected task already playable: "+key);
 const chapter=idx.chapters.find(x=>x.id===row.chapter);
 const coverage=core.chapters.find(x=>x.id===row.chapter);
 assert(chapter&&coverage,"Chapter not found: "+key);
 assert(coverage.excluded.some(x=>x.n===row.printedNumber&&x.reason==="answer-type-pending"),"Not a pending answer-type task: "+key);
 assert(row.printedNumber>0&&row.printedNumber<=chapter.questionCount,"Printed number out of range: "+key);
 let page=chapter.startPage;
 for(const [first,printedPage] of chapter.pageRuns){if(first>row.printedNumber)break;page=printedPage}
 assert(row.sourcePage===page&&row.answerPageRange.join(",")===chapter.answerPages.join(","),"Incorrect source reference: "+key);
 assert(row.status==="pending-source-and-answer-type-review","Unreviewed task marked playable: "+key);
 assert(!("stem" in row)&&!("options" in row)&&!("answer" in row),"Unreviewed text or answer in public audit manifest");
}
if(process.argv[2]){
 const hash=createHash("sha256").update(readFileSync(process.argv[2])).digest("hex");
 assert(hash===idx.sourceSha256,"Supplied PDF fingerprint is not the locked Biology IV source");
}
console.log(JSON.stringify({sourceVolume:4,selected:unique.size,priorBacklog:1268,backlogAfterAll268Verified:1000,
  status:"review_queue_only_not_playable",sourcePdfVerified:!!process.argv[2]},null,2));
