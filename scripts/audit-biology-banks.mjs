import fs from "node:fs";
const result={books:[],critical:[],warnings:[]};
for(const number of [1,2]){
  const file="public/data/bio-book"+number+".json";
  const book=JSON.parse(fs.readFileSync(file,"utf8"));
  let questions=0,units=0;
  const ids=new Set();
  const invalid=[];
  for(const section of book.sections){
    if(!section.units?.length) result.warnings.push({book:number,section:section.n,reason:"empty_section"});
    for(const unit of section.units??[]){
      units++;
      const id=section.n+":"+unit.id;
      if(ids.has(id))invalid.push({id,reason:"duplicate_unit_id"});
      ids.add(id);
      if(unit.kind==="mc"){
        for(const q of unit.questions??[]){
          questions++;
          if(!q.stem?.trim())invalid.push({id,q:q.n,reason:"empty_stem"});
          if(!q.answer || !q.options?.[q.answer])invalid.push({id,q:q.n,reason:"invalid_answer"});
          if(Object.keys(q.options??{}).length<2)invalid.push({id,q:q.n,reason:"missing_options"});
          if(Object.values(q.options??{}).some(v=>/\s{5,}(tc|TC)\b/.test(v)))result.warnings.push({book:number,id,q:q.n,reason:"import_artifact"});
        }
      }else if(unit.kind==="num"){
        for(const q of unit.questions??[]){
          questions++;
          if(!q.stem?.trim()||!q.answer?.trim())invalid.push({id,q:q.n,reason:"missing_number_question"});
        }
      }else questions++;
    }
  }
  result.books.push({number,sectionCount:book.sections.length,units,questions,issues:invalid.length});
  result.critical.push(...invalid.map(x=>({book:number,...x})));
}
const pending=JSON.parse(fs.readFileSync("public/data/biology-pending-books.json","utf8"));
result.pendingBooks=pending.books.map(x=>({part:x.part,status:x.status,verifiedQuestions:x.verifiedQuestions}));
console.log(JSON.stringify(result,null,2));
if(result.critical.length)process.exitCode=1;
