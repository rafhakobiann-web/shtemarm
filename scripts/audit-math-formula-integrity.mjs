import fs from "node:fs";
import path from "node:path";

// Distinguish confirmed structural errors from probable PDF text-order problems.
// Formula reconstruction always requires comparison with the original pages.
const root = process.cwd();
const bank = JSON.parse(fs.readFileSync(path.join(root,"public/data/math-text-questions.json"),"utf8"));
const source = new Map();
const errors = [];
const report = [];
const suspects = [];
const bySection = new Map();
const flattenedFunction = /(?:f\s*x\s*=|[Ss]րված\s+է\s+ֆունկցիան:|x\s+2\s+[ՏS]րված|f\s+cos\s*>)/i;

for (const [book,sections] of Object.entries(bank)) {
  const stats={book,questions:0,native:0,missing:0,brokenDelimiters:0,sourceRefsMissing:0,possibleFlattened:0};
  for (const [section,tasks] of Object.entries(sections)) {
    for (const [task,rows] of Object.entries(tasks)) {
      if (!Array.isArray(rows)) { errors.push(book+"/"+section+"/"+task+" is not an array"); continue; }
      for (let i=0;i<rows.length;i++) {
        stats.questions++;
        const id=book+"/"+section+"/"+task+"/"+(i+1);
        const question=rows[i];
        const prompt=question?.prompt;
        if (typeof prompt!=="string" || !prompt.trim()) {
          stats.missing++;errors.push(id+" has no question text");continue;
        }
        const dollar=(prompt.match(/(?<!\$)\$(?!\$)/g)||[]).length;
        const double=(prompt.match(/\$\$/g)||[]).length;
        const parenOpen=(prompt.match(/\\\(/g)||[]).length;
        const parenClose=(prompt.match(/\\\)/g)||[]).length;
        const blockOpen=(prompt.match(/\\\[/g)||[]).length;
        const blockClose=(prompt.match(/\\\]/g)||[]).length;
        if (dollar%2 || double%2 || parenOpen!==parenClose || blockOpen!==blockClose) {
          stats.brokenDelimiters++;errors.push(id+" has an unbalanced math delimiter");
        }
        const ref=question.transcription;
        if (!ref) continue;
        stats.native++;
        if (ref.book!==book || ref.section!==section || String(ref.task)!==String(task) || ref.sub!==i+1) {
          stats.sourceRefsMissing++;errors.push(id+" has mismatched transcription reference");continue;
        }
        const key=book+"/"+section;
        if (!source.has(key)) {
          const location=path.join(root,"public/data/math-transcriptions",key+".json");
          source.set(key,fs.existsSync(location)?JSON.parse(fs.readFileSync(location,"utf8")):null);
        }
        const native=source.get(key)?.tasks?.[task]?.questions?.[i];
        if (!native?.length) {
          stats.sourceRefsMissing++;errors.push(id+" is missing its native transcription");continue;
        }
        if (flattenedFunction.test(prompt) && !prompt.includes("$f(x)=")) {
          stats.possibleFlattened++;
          bySection.set(key,(bySection.get(key)??0)+1);
          if (suspects.length<20) suspects.push({id,prompt:prompt.slice(0,140)});
        }
      }
    }
  }
  report.push(stats);
}
console.table(report);
console.table([...bySection.entries()].map(([section,candidates])=>({section,candidates})));
console.log("Examples for manual PDF comparison (heuristic; not confirmed errors):");
console.log(JSON.stringify(suspects,null,2));
if (errors.length) {
  console.error("Confirmed structural issues ("+errors.length+"):");
  for (const error of errors.slice(0,40)) console.error("- "+error);
  process.exitCode=1;
} else {
  console.log("Prompt presence, math delimiter balance and native transcription references: structural scan passed.");
  console.log("Possible flattened expressions require manual checking against source PDFs.");
}
