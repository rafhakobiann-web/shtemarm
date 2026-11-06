import fs from "node:fs";
import assert from "node:assert/strict";

const index=JSON.parse(fs.readFileSync("public/data/math-books-index.json","utf8"));
const bank=JSON.parse(fs.readFileSync("public/data/math-text-questions.json","utf8"));
const cache=new Map();
const diagrams=new Set(["194-688","203-704","284-961","285-966","289-981","290-985"]);
let questions=0,native=0,blocks=0;
const counts={};
function checkBlock(b) {
  blocks++;
  assert.ok(Number.isFinite(b.width)&&b.width>0);
  assert.ok(Number.isFinite(b.height)&&b.height>0);
  assert.ok(b.runs.length>0 || b.diagrams?.length>0);
  assert.equal(b.images,undefined,"Text layouts must not embed source screenshots");
  for (const [text,x,y,size,flags,width] of b.runs) {
    assert.equal(typeof text,"string");
    assert.ok(!/[\uE000-\uF8FF\uFFFD]/u.test(text),`Unmapped source glyph: ${text}`);
    assert.ok(Number.isFinite(y)&&Number.isFinite(size)&&size>0&&size<100);
    assert.ok(Number.isFinite(flags)&&(Array.isArray(width)?width.every(Number.isFinite):Number.isFinite(width)));
    for(const v of Array.isArray(x)?x:[x]) assert.ok(Number.isFinite(v)&&v>=-1&&v<b.width+2);
    assert.ok(y>=-2&&y<b.height+15);
  }
  for(const [d,w] of b.paths) {assert.equal(typeof d,"string");assert.ok(!/NaN|Infinity/.test(d));assert.ok(Number.isFinite(w));}
  for(const [id] of b.diagrams??[]) assert.ok(diagrams.has(id),`Unknown diagram ${id}`);
}
for(const [book,bd] of Object.entries(index.books)) {
  let done=0;
  for(const sec of bd.sections) for(const task of sec.tasks) {
    assert.equal(task.answer_type,sec.chapter===1?"choice":sec.chapter===2?"open":"tf");
    const sk=`${sec.chapter}-${sec.section}`;
    const rows=bank[book]?.[sk]?.[task.task];
    assert.equal(rows?.length,task.sub_count,`${book}/${sk}/${task.task}: question count`);
    for(let i=0;i<task.sub_count;i++) {
      const q=rows[i]??task.questions?.[i];
      assert.ok(q?.prompt?.trim(),`${book}/${sk}/${task.task}/${i+1}: empty prompt`);
      assert.ok(!/դեռ մշակվում|being processed|www\.atc/.test(q.prompt));
      assert.ok(!/[\uE000-\uF8FF\uFFFD]/u.test(q.prompt));
      if(q.transcription) {
        native++;
        const r=q.transcription;
        assert.deepEqual([r.book,r.section,r.task,r.sub],[book,sk,task.task,i+1]);
        const key=`${book}/${sk}`;
        if(!cache.has(key))cache.set(key,JSON.parse(fs.readFileSync(`public/data/math-transcriptions/${key}.json`,"utf8")));
        const nt=cache.get(key).tasks[task.task];
        assert.ok(nt);
        assert.equal(nt.questions.length,task.sub_count);
        assert.ok(nt.questions[i]?.length);
        if(i===0)nt.stem.forEach(checkBlock);
        nt.questions[i].forEach(checkBlock);
      }
      questions++;done++;
    }
  }
  counts[book]=done;
}
assert.equal(questions,5676);
assert.equal(native,3532);
console.table(counts);
console.log(`${questions} questions have text; ${native} new transcriptions; ${blocks} native text blocks; zero missing questions.`);


// Regression checks against the original PDF's four tiny rasterized math glyphs.
// These image glyphs must be transcribed as positioned SVG text rather than
// silently omitted. Original PDF hashes are in math-transcriptions/audit.json.
const sourceGlyphs = [
  { book:"matem-1", section:"2-8", task:39, sub:1, glyph:"n", x:43.14, y:17.4, sourcePage:230 },
  { book:"matem-1", section:"3-2", task:8, sub:4, glyph:"°", x:174.08, y:34.02, sourcePage:249 },
  { book:"matem-2", section:"3-4", task:40, sub:6, glyph:"f", x:2, y:16.55, sourcePage:293 },
  { book:"matem-2", section:"3-5", task:29, sub:0, glyph:"K", x:321.64, y:91.07, sourcePage:306 },
];
for (const item of sourceGlyphs) {
  const key = item.book+"/"+item.section;
  if (!cache.has(key)) cache.set(key,JSON.parse(fs.readFileSync("public/data/math-transcriptions/"+key+".json","utf8")));
  const task = cache.get(key).tasks[item.task];
  assert.ok(task, "Missing source task "+key+"/"+item.task);
  const blocks = item.sub ? task.questions[item.sub-1] : task.stem;
  assert.ok(blocks?.some(block => block.runs.some(([glyph,x,y]) =>
    glyph === item.glyph &&
    Math.abs((Array.isArray(x) ? x[0] : x)-item.x) < 0.12 &&
    Math.abs(y-item.y) < 0.12
  )), "Missing PDF glyph '"+item.glyph+"' on page "+item.sourcePage+" ("+key+"/"+item.task+"/"+item.sub+")");
}


// PDF-verified formula-rich explanation text must not regress to unordered
// PDF glyph extraction. These checks guard the exact question conditions,
// not the answer-key values or whether statements are true.
const sourceFormulaPrompts = [
  {book:"matem-1",section:"2-8",task:"39",sub:0,fragments:["$n$","$P_n=720$"]},
  {book:"matem-1",section:"3-2",task:"8",fragments:["$f(x)=e^x(-x^2+x+1)$"],extras:[
    "$Oy$", "$Ox$", "կրիտիկական", "$45^\\circ$", "$[-1;2]$", "$f(\\cos(\\pi/10))>f(\\cos(\\pi/9))$"
  ]},
  {book:"matem-2",section:"3-4",task:"40",fragments:["$f(x)=x\\lvert x\\rvert$"],extras:[
    "$D(f)=[0;+\\infty)$", "համաչափ", "աճող", "$g(x)=\\operatorname{ctg}x$", "$f'(x)=2x$", "շոշափողը"
  ]},
];
for (const source of sourceFormulaPrompts) {
  const rows = bank[source.book]?.[source.section]?.[source.task];
  assert.ok(rows, "Missing restored formula task: "+source.book+"/"+source.section+"/"+source.task);
  for (const [index,row] of rows.entries()) {
    const expected = [...source.fragments, ...(source.extras ? [source.extras[index]] : [])];
    for (const fragment of expected) {
      assert.ok(row?.prompt?.includes(fragment),
        "Missing formula in "+source.book+"/"+source.section+"/"+source.task+"/"+(index+1)+": "+fragment);
    }
  }
}
