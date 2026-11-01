import fs from "node:fs";
import path from "node:path";

/** Audit math task wording against the source PDFs' native text transcriptions.
 * No OCR or guessed replacements. This reports items needing manual verification.
 * Native PDF-positioned stems are preferred by the UI when available.
 */
const root="public/data";
const index=JSON.parse(fs.readFileSync(path.join(root,"math-books-index.json"),"utf8"));
const bank=JSON.parse(fs.readFileSync(path.join(root,"math-text-questions.json"),"utf8"));
const extra=JSON.parse(fs.readFileSync(path.join(root,"math-text-questions-extra.json"),"utf8"));
const allowedVerb=/Գտնել|Գտե՛ք|Հաշվել|Հաշվե՛ք|Լուծել|Լուծե՛ք|Որոշել|Որոշե՛ք|Ընտրել|Կազմել|Պարզեցնել|Գրել|Տրված|Գծել|Ապացուցել|Հայտնել|Քանի|Որքան|Ինչ|Ո՞ր|ո՞ր|Ի՞նչ|գրե|գտնել|հաշվել|համեմատել|Շարունակել|Նշել/i;
const report={
  counts:{sections:0,tasks:0,questions:0,native:0,withStems:0,missingStem:0,missingNativeFiles:0,
    missingNativeTasks:0,missingNativeQuestions:0,missingPlainText:0,
    textOnlyQuestions:0, nativeSectionUnavailableQuestions:0,
    nativeSectionUnlinkedQuestions:0, supplementalTextDifferences:0},
  warnings:[],errors:[],
};
const nativeCache=new Map();
function sourceFor(ref){
  const relative=root+"/math-transcriptions/"+ref.book+"/"+ref.section+".json";
  if(!fs.existsSync(relative)){report.counts.missingNativeFiles++;report.errors.push({kind:"missing_native_file",ref,relative});return null;}
  if(!nativeCache.has(relative))nativeCache.set(relative,JSON.parse(fs.readFileSync(relative,"utf8")));
  return nativeCache.get(relative);
}
for(const [book,meta] of Object.entries(index.books)){
  for(const section of meta.sections){
    report.counts.sections++;
    const key=section.chapter+"-"+section.section;
    for(const task of section.tasks){
      report.counts.tasks++;
      const rows=bank[book]?.[key]?.[String(task.task)]??extra[book]?.[key]?.[String(task.task)]??task.questions??[];
      for(let i=0;i<task.sub_count;i++){
        report.counts.questions++;
        const row=rows[i]??task.questions?.[i];
        const supplement=extra[book]?.[key]?.[String(task.task)]?.[i];
        // Two separately maintained transcriptions can disagree about the
        // source maths. Report the location; never pick wording automatically.
        if (row?.prompt?.trim() && supplement?.prompt?.trim()
            && row.prompt.trim()!==supplement.prompt.trim()) {
          report.counts.supplementalTextDifferences++;
          report.warnings.push({kind:"supplemental_text_difference",book,key,task:task.task,sub:i+1});
        }
        const ref=row?.transcription;
        if(!ref){
          report.counts.textOnlyQuestions++;
          // A native PDF-positioned section may start with task 6 or 9.
          // Its first tasks are still present as plain text, but their exact
          // original maths cannot yet be verified from native geometry.
          const nativeFile=path.join(root,"math-transcriptions",book,key+".json");
          if (fs.existsSync(nativeFile)) {
            const native=sourceFor({book,section:key});
            if (native && !native.tasks?.[String(task.task)]) {
              report.counts.nativeSectionUnlinkedQuestions++;
              report.warnings.push({kind:"native_section_missing_task",book,key,task:task.task,sub:i+1});
            }
          } else {
            // These questions have text in the legacy bank, but no separate
            // PDF-positioned transcription for their section yet.
            report.counts.nativeSectionUnavailableQuestions++;
          }
          if(!row?.prompt?.trim()) {report.counts.missingPlainText++;report.warnings.push({kind:"untranscribed",book,key,task:task.task,sub:i+1});}
          continue;
        }
        report.counts.native++;
        if(ref.book!==book||ref.section!==key||ref.task!==task.task||ref.sub!==i+1){
          report.errors.push({kind:"wrong_native_reference",book,key,task:task.task,sub:i+1,ref});continue;
        }
        const source=sourceFor(ref);if(!source)continue;
        const entry=source.tasks?.[String(task.task)];
        if(!entry){report.counts.missingNativeTasks++;report.errors.push({kind:"missing_native_task",ref});continue;}
        const question=entry.questions?.[i];
        if(!question?.length){report.counts.missingNativeQuestions++;report.errors.push({kind:"missing_native_question",ref});continue;}
        const stem=entry.stem??[];
        if(stem.length){
          report.counts.withStems++;
          const joined=stem.flatMap(b=>b.runs??[]).map(r=>r[0]).join(" ").replace(/\s+/g," ");
          if(!joined.trim()){report.counts.missingStem++;report.warnings.push({kind:"empty_native_stem",ref});}
          else if(!allowedVerb.test(joined)){report.warnings.push({kind:"manual_stem_review",ref,extract:joined.slice(0,100)});}
        }else{
          report.counts.missingStem++;
          report.warnings.push({kind:"stem_within_question_or_missing",ref});
        }
        const prompt=row.prompt?.trim();
        if(prompt && /^([1-9]\)|[1-9]\.|[A-D]\))/.test(prompt))
          report.warnings.push({kind:"check_bare_option_as_prompt",ref,prompt:prompt.slice(0,80)});
      }
    }
  }
}
const output="public/data/math-requirement-audit.json";
fs.writeFileSync(output,JSON.stringify({
  method:"Source PDF-positioned text audit; flagged items need manual source review",
  sourceBooks:["public/math/books/matem-1.pdf","public/math/books/matem-2.pdf"],
  ...report,
},null,2)+"\n");
console.log(JSON.stringify({counts:report.counts,warnings:report.warnings.length,errors:report.errors.length},null,2));
if(report.errors.length)process.exitCode=1;
