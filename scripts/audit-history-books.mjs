#!/usr/bin/env node
/** Static integrity audit, not a historical fact check against original scans. */
import { readFileSync } from "node:fs";
const failures=[];
const reports=[];
for(const bookId of [21,22,23]){
 const book=JSON.parse(readFileSync("public/data/history-book"+(bookId-20)+".json","utf8"));
 const seen=new Set();
 const stats={bookId,sections:book.sections.length,units:0,questions:0,missingAnswers:0,duplicateIds:0,missingText:0,emptySections:0,unsupported:0};
 for(const section of book.sections){
  if(!section.units.length)stats.emptySections++;
  for(const unit of section.units){
   stats.units++;
   if(seen.has(unit.id)){stats.duplicateIds++;failures.push("Book "+bookId+" duplicate unit "+unit.id);}
   seen.add(unit.id);
   if(unit.kind==="mc"){
    for(const q of unit.questions){
     stats.questions++;
     if(!q.stem?.trim())stats.missingText++;
     if(!q.options || !Object.hasOwn(q.options,String(q.answer)) || !String(q.options[q.answer]).trim()){
      stats.missingAnswers++;failures.push("Book "+bookId+" missing choice "+unit.id+" #"+q.n);
     }
    }
   }else if(unit.kind==="num"){
    for(const q of unit.questions){
     stats.questions++;
     if(!q.stem?.trim()&&!unit.passage?.trim())stats.missingText++;
     if(q.answer===null||q.answer===undefined||!String(q.answer).trim())stats.missingAnswers++;
    }
   }else if(unit.kind==="set"||unit.kind==="seq"){
    stats.questions++;
    if(!Array.isArray(unit.answer)||!unit.answer.length)stats.missingAnswers++;
   }else if(unit.kind==="match"){
    stats.questions++;
    if(!unit.answer||!Object.keys(unit.answer).length)stats.missingAnswers++;
   }else{stats.unsupported++;failures.push("Unsupported history unit kind "+unit.kind);}
  }
 }
 reports.push(stats);
}
console.log(JSON.stringify({audit:"History book data integrity (not source verification)",reports,failures:failures.slice(0,25)},null,2));
if(failures.length||reports.some(r=>r.missingAnswers||r.missingText||r.emptySections||r.duplicateIds||r.unsupported)){
 console.error("History bank needs review; no answer keys were changed.");
 process.exitCode=1;
}
