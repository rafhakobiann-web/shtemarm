#!/usr/bin/env node
/**
 * Read-only inventory of all old/new Shtemarm book banks.
 * Structural coverage != PDF transcription accuracy.
 * Usage: node scripts/audit-all-book-coverage.mjs [--strict]
 */
import fs from "node:fs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const exists = (p) => fs.existsSync(p);
const books = [];
const blockers = [];
const record = (subject, volume, path, {status = "needs-source-review", expectedOriginal = false} = {}) => {
  if (!exists(path)) {
    books.push({subject, volume, path, present: false, entries: 0, status: "missing-file"});
    if (expectedOriginal) blockers.push({subject, volume, reason: "original-bank-file-missing", path});
    return;
  }
  const data = read(path);
  const sections = data.sections ?? [];
  let entries = 0, units = 0, blankStems = 0, invalidAnswers = 0, duplicateUnits = 0;
  const seen = new Set();
  for (const section of sections) {
    for (const unit of section.units ?? []) {
      units++;
      const key = String(section.n) + ":" + String(unit.id);
      if (seen.has(key)) duplicateUnits++;
      seen.add(key);
      if (Array.isArray(unit.questions)) {
        for (const q of unit.questions) {
          entries++;
          if (!String(q.stem ?? "").trim() && !String(unit.passage ?? "").trim()) blankStems++;
          if (q.answer == null || (Array.isArray(q.answer) && !q.answer.length) ||
            (typeof q.answer === "string" && !q.answer.trim()) ||
            (unit.kind === "mc" && (!q.options || !Object.hasOwn(q.options, String(q.answer)))))
            invalidAnswers++;
        }
      } else {
        entries++;
        if (unit.answer == null || (Array.isArray(unit.answer) && !unit.answer.length)) invalidAnswers++;
      }
    }
  }
  books.push({subject, volume, path, present: true, sections: sections.length, units, entries, blankStems, invalidAnswers, duplicateUnits, status});
  if (blankStems || invalidAnswers || duplicateUnits) blockers.push({subject, volume, reason: "structural-integrity-review", blankStems, invalidAnswers, duplicateUnits});
};
for (const n of [1,2,3]) record("english", n, `public/data/book${n}.json`, {status:"indexed-unverified-against-full-pdf"});
for (const n of [1,2,3]) record("history", n, `public/data/history-book${n}.json`, {status:"indexed-unverified-against-full-pdf"});
for (const n of [1,2,3,4]) record("biology", n, `public/data/bio-book${n}.json`, {status:n>=3?"authored-practice-not-original":"indexed-unverified-against-full-pdf"});
for (const n of [1,2,3,4]) record("armenian", n, `public/data/armenian-book${n}.json`, {status:"authored-practice-not-original"});
for (const n of [1,2]) record("physics", n, `public/data/physics-original-book${n}.json`, {status:"partly-source-reviewed-original"});
const math = read("public/data/math-books-index.json");
const text = read("public/data/math-text-questions.json");
for (const n of [1,2]) {
  const key = `matem-${n}`, b = math.books[key];
  let indexed = 0, answered = 0, withPrompt = 0, missing = 0;
  for (const section of b.sections ?? []) {
    for (const task of section.tasks ?? []) {
      const count = Number.isInteger(task.sub_count) ? task.sub_count : (task.answers?.length ?? 0);
      indexed += count;
      answered += task.answers?.filter(x => x !== null && x !== undefined && String(x).trim()).length ?? 0;
      for (let i=0; i<count; i++) {
        const q = text[key]?.[`${section.chapter}-${section.section}`]?.[String(task.task)]?.[i] ?? task.questions?.[i];
        if (String(q?.prompt ?? "").trim()) withPrompt++; else missing++;
      }
    }
  }
  books.push({subject:"math",volume:n,path:"public/data/math-books-index.json",indexed,answered,withPrompt,missing,status:"indexed-unverified-against-full-pdf"});
  if (missing || answered !== indexed) blockers.push({subject:"math",volume:n,reason:"missing-prompt-or-answer",missing,answered,indexed});
}
const pending = read("public/data/biology-pending-books.json");
for (const b of pending.books) {
  if (b.verifiedQuestions === 0) blockers.push({subject:"biology",volume:b.part,reason:"zero-verified-official-questions",authoredPractice:b.originalPracticeQuestions ?? 0});
}
const armenianIndex = read("public/data/armenian-books-index.json");
if (armenianIndex.officialDigitizedBooks === 0) blockers.push({subject:"armenian",reason:"zero-official-digitized-volumes"});
const summary = {audit:"All Shtemarm question banks; structural inventory only; not a PDF source or copyright review",books,blockers};
console.log(JSON.stringify(summary,null,2));
if (process.argv.includes("--strict") && blockers.some(x => ["missing-prompt-or-answer","original-bank-file-missing"].includes(x.reason))) process.exitCode=1;
