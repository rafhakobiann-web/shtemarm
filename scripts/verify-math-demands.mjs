import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const ROOT = path.resolve(process.cwd());
const readJSON = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf8"));
const index = readJSON("public/data/math-books-index.json");
const bank = readJSON("public/data/math-text-questions.json");
const nativeAudit = readJSON("public/data/math-transcriptions/audit.json");
const result = {
  method: "Full source-book PDF hash + indexed task modes + answer counts + transcribed source stems and subquestion references",
  source: "Repository originals: public/math/books/matem-1.pdf and matem-2.pdf",
  books: {},
  errors: [],
  warnings: [],
};
const nativeCache = new Map();
function err(kind, reference, note) { result.errors.push({kind,reference,note}); }
function warn(kind,reference,note) { result.warnings.push({kind,reference,note}); }
function source(book,section) {
  const id=book+"/"+section;
  if(nativeCache.has(id))return nativeCache.get(id);
  const filename="public/data/math-transcriptions/"+id+".json";
  if(!fs.existsSync(filename)){err("missing_native_file",id,filename);return null;}
  const data=readJSON(filename);
  if(data.format!==1||!data.tasks)err("bad_native_format",id,filename);
  nativeCache.set(id,data);
  return data;
}
function sourceText(blocks) {
  return (blocks??[]).flatMap(block=>(block.runs??[]).map(run=>run[0])).join(" ").replace(/\s+/g," ").trim();
}
const expectedMode = ["", "choice", "open", "tf"];
const shape = {choice:/^[1-4]$/,open:/\S/,tf:/^[TF]$/};
for(const book of ["matem-1","matem-2"]) {
  const pdf="public/math/books/"+book+".pdf";
  if(!fs.existsSync(pdf)){err("missing_original_pdf",book,pdf);continue;}
  const sha=createHash("sha256").update(fs.readFileSync(pdf)).digest("hex");
  const expected=nativeAudit.source_sha256[book];
  if(sha!==expected)err("original_pdf_changed",book,"Expected SHA-256 "+expected+", found "+sha);
  const counters={sections:0,tasks:0,questions:0,native:0,legacyText:0,sourceStems:0,missingStems:0,
    choices:0,typedAnswers:0,trueFalse:0,sourceSegments:0};
  const seenSections=new Set();
  for(const sec of index.books?.[book]?.sections??[]) {
    const key=String(sec.chapter)+"-"+String(sec.section);
    if(seenSections.has(key))err("duplicate_section",book+"/"+key,"");
    seenSections.add(key);counters.sections++;
    const mode=expectedMode[sec.chapter];
    if(!mode)err("unknown_chapter",book+"/"+key,"Chapter "+sec.chapter);
    const seenTasks=new Set();
    for(const task of sec.tasks??[]) {
      const id=book+"/"+key+"/"+String(task.task);
      if(seenTasks.has(task.task))err("duplicate_task",id,"");seenTasks.add(task.task);
      counters.tasks++;
      if(task.answer_type!==mode)err("wrong_answer_mode",id,"Expected "+mode+", got "+task.answer_type);
      if(task.answers?.length!==task.sub_count)err("mismatched_answer_count",id,""+task.answers?.length+"/"+task.sub_count);
      if(!task.segments?.length)err("missing_source_crop",id,"");
      for(const segment of task.segments??[]){
        counters.sourceSegments++;
        if(!Number.isInteger(segment.page)||!Number.isFinite(segment.y0)||!Number.isFinite(segment.y1)||segment.y1<=segment.y0)
          err("bad_source_crop",id,JSON.stringify(segment));
      }
      const rows=bank[book]?.[key]?.[String(task.task)];
      if(!Array.isArray(rows)||rows.length!==task.sub_count)
        err("missing_bank_rows",id,"Expected "+task.sub_count+" rows");
      let taskSource=null;
      for(let i=0;i<task.sub_count;i++){
        const ref=id+"/"+String(i+1);
        const answer=task.answers?.[i];
        if(typeof answer!=="string" || !shape[mode]?.test(answer.trim()))
          err("answer_in_wrong_mode",ref,"Mode "+mode+", answer "+JSON.stringify(answer));
        const question=rows?.[i]??task.questions?.[i];
        if(!question?.prompt?.trim())err("empty_prompt",ref,"");
        if(question?.transcription) {
          counters.native++;
          const n=question.transcription;
          if(n.book!==book||n.section!==key||n.task!==task.task||n.sub!==i+1)
            err("mislinked_native_question",ref,JSON.stringify(n));
          const item=source(book,key)?.tasks?.[String(task.task)];
          if(!item){err("missing_native_task",ref,"");continue;}
          if(!item.questions?.[i]?.length)err("missing_native_subquestion",ref,"");
          taskSource=item;
        } else counters.legacyText++;
        counters.questions++;
      }
      if(taskSource){
        if(taskSource.stem?.length){
          const text=sourceText(taskSource.stem);
          if(text || taskSource.stem.some(b=>b.diagrams?.length)) counters.sourceStems++;
          else { counters.missingStems++;warn("empty_source_stem",id,"Image-only or damaged task header; review crop manually");}
        } else {counters.missingStems++;warn("missing_source_stem",id,"Review exact book instruction using source crop");}
      } else {
        // A legacy prompt was authored as plain text rather than source-aligned
        // native task text. Never claim its instruction is authoritatively verified.
        warn("legacy_task_review",id,"Plain transcription; compare against linked source PDF crop");
      }
      if(mode==="choice")counters.choices+=task.sub_count;
      else if(mode==="open")counters.typedAnswers+=task.sub_count;
      else if(mode==="tf")counters.trueFalse+=task.sub_count;
    }
  }
  result.books[book]=counters;
}
result.totals=Object.values(result.books).reduce((total,counts)=>{
  for(const [k,value] of Object.entries(counts))total[k]=(total[k]??0)+value;
  return total;
},{});
if(result.totals.questions!==5676)err("total_count","all","Expected 5676 questions; found "+result.totals.questions);
if(result.totals.native!==3532)err("native_count","all","Expected 3532 PDF-aligned questions; found "+result.totals.native);
const output=process.argv.find(arg=>arg.startsWith("--output="))?.slice(9);
if(output)fs.writeFileSync(output,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({books:result.books,totals:result.totals,errors:result.errors.slice(0,40),
  warningsByType:result.warnings.reduce((out,w)=>(out[w.kind]=(out[w.kind]??0)+1,out),{})},null,2));
if(result.errors.length)process.exitCode=1;
