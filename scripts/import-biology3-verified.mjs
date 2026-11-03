#!/usr/bin/env node
/**
 * Apply a rights-cleared, source-verified Biology III transcription patch.
 * No PDF, book text, or question answers are bundled with this tool.
 *
 * Usage:
 *   node scripts/import-biology3-verified.mjs --check
 *   node scripts/import-biology3-verified.mjs --manifest > biology3-review-metadata.json
 *   node scripts/import-biology3-verified.mjs --dry-run /path/to/verified-patch.json
 *   node scripts/import-biology3-verified.mjs --apply /path/to/verified-patch.json
 *
 * A patch needs volume=3, sourceSha256, rightsConfirmed=true and questions[].
 * Each entry needs chapter, number, sourcePage, kind, verifiedText=true,
 * verifiedAnswer=true, plus type-specific answer content. The source PDF
 * itself is not distributed or uploaded by students.
 */
import fs from "node:fs";
import path from "node:path";

const base = process.cwd();
const files = {
  book: "public/data/bio-book3.json",
  coverage: "public/data/biology-volume3-coverage.json",
  index: "public/data/biology-original-volume3-index.json",
  summary: "public/data/biology-backlog-summary.json",
  pending: "public/data/biology-pending-books.json",
};
const read = (name) => JSON.parse(fs.readFileSync(path.resolve(base, files[name]), "utf8"));
const write = (name, value) => fs.writeFileSync(path.resolve(base, files[name]), JSON.stringify(value, null, 2) + "\n");
function assert(ok, message) { if (!ok) throw new Error(message); }
const clean = (x, cap = 8000) => typeof x === "string" && x.trim().length > 0 && x.length <= cap;
function printedPage(ch, n) {
  let page;
  for (const run of ch.pageRuns) {
    if (run[0] > n) break;
    page = run[1];
  }
  return page;
}
function sourceNumber(unit) {
  const n = unit.kind === "mc"
    ? Number(unit.questions?.[0]?.n) : Number(unit.label);
  assert(Number.isInteger(n), "Imported unit is missing a printed question number: " + unit.id);
  if (unit.kind === "mc" || unit.kind === "num")
    assert(unit.questions.length >= 1, "Expected a source-checked question: " + unit.id);
  return n;
}
function audit(book, coverage, index) {
  assert(book.id === 33 && index.volume === 3 && coverage.volume === 3, "Not Biology III");
  assert(book.source?.kind === "source-transcription" && book.source?.sha256 === index.sourceSha256, "Book/source mismatch");
  assert(coverage.sourceSha256 === index.sourceSha256, "Coverage/source mismatch");
  const total = index.chapters.reduce((v, ch) => v + ch.questionCount, 0);
  assert(coverage.indexedQuestions === total, "Indexed total mismatch");
  let importedTotal = 0;
  for (const ch of index.chapters) {
    const section = book.sections.find(s => s.n === ch.id);
    const covered = coverage.chapters.find(s => s.id === ch.id);
    assert(covered, "Missing coverage chapter " + ch.id);
    const imported = new Set();
    for (const unit of section?.units ?? []) {
      const n = sourceNumber(unit);
      assert(n >= 1 && n <= ch.questionCount && !imported.has(n), "Duplicate/invalid source number " + ch.id + ":" + n);
      imported.add(n);
      assert(unit.sourcePage === printedPage(ch,n), "Wrong source page at " + ch.id + ":" + n);
      if (unit.kind === "mc") {
        const answer = ch.choiceKeys.charAt(n - 1);
        assert(answer && unit.questions[0].answer === answer, "Official answer key mismatch at " + ch.id + ":" + n);
      }
    }
    const pending = new Set();
    for (const item of covered.excluded) {
      assert(Number.isInteger(item.n) && item.n >= 1 && item.n <= ch.questionCount, "Invalid pending source number");
      assert(!imported.has(item.n) && !pending.has(item.n), "Duplicate/present pending question " + ch.id + ":" + item.n);
      pending.add(item.n);
    }
    assert(imported.size + pending.size === ch.questionCount, "Coverage gap in chapter " + ch.id);
    assert(covered.imported === imported.size, "Imported count mismatch in chapter " + ch.id);
    importedTotal += imported.size;
  }
  assert(importedTotal === coverage.importedQuestions, "Global imported count mismatch");
  return { indexed: total, imported: importedTotal, pending: total - importedTotal };
}
function unitFromPatch(entry, ch) {
  const n = entry.number, payload = entry.payload;
  const id = "bio3-s" + entry.chapter + "-q" + n;
  const label = String(n);
  const sourcePage = entry.sourcePage;
  assert(payload && typeof payload === "object", "Missing typed question payload");
  const passage = typeof payload.passage === "string" ? payload.passage : "";
  switch(entry.kind) {
    case "mc": {
      assert(clean(payload.stem) && payload.options && typeof payload.options === "object", "Invalid multiple-choice question");
      assert(["1","2","3","4"].every(k => clean(payload.options[k], 1500)), "Question needs four nonempty options");
      assert(ch.choiceKeys.charAt(n - 1) === payload.answer && /^[1-4]$/.test(payload.answer), "Answer must match official choice key");
      return { id, label, sourcePage, kind: "mc", passage, questions: [{ n: label, stem: payload.stem, options: Object.fromEntries(["1","2","3","4"].map(k=>[k,payload.options[k]])), answer: payload.answer }] };
    }
    case "num": {
      const questions = Array.isArray(payload.questions) ? payload.questions :
        [{n:label,stem:payload.stem,answer:payload.answer}];
      assert(questions.length > 0 && questions.length <= 20, "Invalid number of numeric subtasks");
      const seen = new Set();
      for (const q of questions) {
        assert(clean(q.stem) && clean(q.answer, 120), "Invalid numeric subtask or answer");
        assert(typeof q.n === "string" && (q.n === label || q.n.startsWith(label + ".")) && !seen.has(q.n), "Invalid or duplicate numeric subtask number");
        seen.add(q.n);
      }
      return { id, label, sourcePage, kind: "num", passage, questions };
    }
    case "set":
    case "seq": {
      assert(clean(passage) && Array.isArray(payload.answer) && payload.answer.length <= 40 &&
        payload.answer.every(n=>Number.isInteger(n) && n >= 1 && n <= 100), "Invalid list/sequence task");
      if (entry.kind === "set") assert(new Set(payload.answer).size === payload.answer.length, "Repeated set answer");
      return { id, label, sourcePage, kind: entry.kind, passage, answer: payload.answer, count: Math.max(1, payload.answer.length) };
    }
    case "match": {
      assert(clean(passage) && payload.answer && typeof payload.answer === "object" && !Array.isArray(payload.answer), "Invalid matching task");
      const items = Object.entries(payload.answer);
      assert(items.length > 0 && items.length <= 30 && items.every(([k,v])=>/^[A-Z]$/.test(k) && Number.isInteger(v) && v >= 1 && v <= 30), "Invalid matching answers");
      return { id, label, sourcePage, kind: "match", passage, answer: payload.answer };
    }
    default: throw new Error("Unsupported task type: " + entry.kind);
  }
}
function applyPatch(state, patch) {
  const { book, coverage, index, summary, pending } = state;
  assert(patch.volume === 3 && patch.sourceSha256 === index.sourceSha256, "Patch has a different book/source hash");
  assert(patch.rightsConfirmed === true, "Rights to publish question text must be confirmed");
  assert(Array.isArray(patch.questions) && patch.questions.length > 0, "Patch has no questions");
  const seen = new Set();
  for (const entry of patch.questions) {
    const n = entry.number, chapter = entry.chapter;
    const ch = index.chapters.find(x=>x.id===chapter);
    const covered = coverage.chapters.find(x=>x.id===chapter);
    assert(ch && covered && Number.isInteger(n) && n >= 1 && n <= ch.questionCount, "Invalid question chapter/number");
    const key = chapter + ":" + n;
    assert(!seen.has(key), "Patch duplicates question " + key);
    seen.add(key);
    assert(entry.sourcePage === printedPage(ch, n), "Printed PDF page mismatch at " + key);
    assert(entry.verifiedText === true && entry.verifiedAnswer === true, "Source text and answer require review: " + key);
    const at = covered.excluded.findIndex(item=>item.n===n);
    assert(at >= 0, "Question already imported, or not on pending list: " + key);
    const reason = covered.excluded[at].reason;
    const hasPrintedChoiceKey = !!ch.choiceKeys.charAt(n - 1);
    assert((entry.kind === "mc") === hasPrintedChoiceKey, "Preserve the printed answer format: " + key);
    if (reason === "figure-review") assert(entry.figureReviewed === true && entry.equivalentTextChecked === true, "Essential figure needs a verified complete text equivalent: " + key);
    if (reason === "formula-review") assert(entry.formulaReviewed === true, "Formula must be manually reviewed: " + key);
    if (reason === "incomplete-text") assert(entry.textRechecked === true, "Text must be manually rechecked: " + key);
    const unit = unitFromPatch(entry, ch);
    let section = book.sections.find(s=>s.n===chapter);
    if (!section) {
      section = {n: chapter, label: ch.title, instr_en:"", instr_hy:"", units: []};
      book.sections.push(section);
    }
    section.units.push(unit);
    covered.excluded.splice(at, 1);
    covered.imported++;
  }
  book.sections.sort((a,b)=>a.n-b.n);
  for (const section of book.sections) section.units.sort((a,b)=>sourceNumber(a)-sourceNumber(b));
  coverage.importedQuestions = coverage.chapters.reduce((sum,c)=>sum+c.imported,0);
  const board = summary.books.find(b=>b.volume===3);
  assert(board && board.sourceSha256 === index.sourceSha256, "Backlog/source mismatch");
  board.imported = coverage.importedQuestions;
  board.pending = board.indexed - board.imported;
  const byReason = {};
  for (const ch of coverage.chapters) {
    const reasons = {};
    for (const item of ch.excluded) reasons[item.reason]=(reasons[item.reason]??0)+1;
    const row = board.chapters.find(r=>r.chapter===ch.id);
    assert(row, "Missing backlog chapter " + ch.id);
    row.imported = ch.imported;
    row.pending = row.indexed - ch.imported;
    row.byReason = reasons;
    for (const [k,v] of Object.entries(reasons)) byReason[k]=(byReason[k]??0)+v;
  }
  board.byReason = byReason;
  const item = pending.books.find(b=>b.part===3);
  assert(item, "Missing Biology III pending manifest");
  item.transcribedQuestions = board.imported;
  item.remainingQuestions = board.pending;
  return audit(book,coverage,index);
}
function main() {
  const state=Object.fromEntries(Object.keys(files).map(k=>[k,read(k)]));
  const before=audit(state.book,state.coverage,state.index);
  const command=process.argv[2] ?? "--check";
  if (command==="--check") { console.log(JSON.stringify(before)); return; }
  if (command==="--manifest") {
    const chapters=state.coverage.chapters.map(ch=>({
      chapter:ch.id,
      printedTitle:state.index.chapters.find(x=>x.id===ch.id).title,
      imported:ch.imported,
      pending:ch.excluded.map(item=>({
        number:item.n,
        page:item.page??printedPage(state.index.chapters.find(x=>x.id===ch.id),item.n),
        reason:item.reason
      }))
    }));
    console.log(JSON.stringify({volume:3, sourceSha256:state.index.sourceSha256, ...before, chapters},null,2));
    return;
  }
  assert(command==="--dry-run" || command==="--apply", "Usage: --check, --manifest, --dry-run patch.json or --apply patch.json");
  assert(process.argv[3], "Supply a verified patch JSON file");
  const patch=JSON.parse(fs.readFileSync(path.resolve(process.argv[3]),"utf8"));
  const after=applyPatch(state,patch);
  if (command==="--apply") for (const name of ["book","coverage","summary","pending"]) write(name,state[name]);
  console.log(JSON.stringify({mode:command, added:after.imported-before.imported, before, after}));
}
main();
