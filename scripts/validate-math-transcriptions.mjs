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
