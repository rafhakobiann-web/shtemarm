#!/usr/bin/env node
/**
 * English source-integrity preflight.
 * This is a structural audit, NOT proof that wording or answer keys match PDFs.
 * Never auto-correct or invent book questions.
 */
import { readFileSync } from "node:fs";

const report = [];
const blockers = [];
for (const bookId of [1, 2, 3]) {
  const book = JSON.parse(readFileSync(`public/data/book${bookId}.json`, "utf8"));
  const seenUnits = new Set();
  const summary = { book: bookId, sections: book.sections.length, units: 0, entries: 0, duplicateUnitIds: 0, duplicateQuestionNumbers: 0, missingAnswers: 0, missingAnswerOptions: 0, emptyStemsWithPassage: 0, emptyStemsWithoutPassage: 0 };
  for (const section of book.sections) {
    for (const unit of section.units ?? []) {
      summary.units++;
      if (seenUnits.has(unit.id)) {
        summary.duplicateUnitIds++;
        blockers.push({ book: bookId, section: section.n, unit: unit.id, reason: "duplicate-unit-id" });
      }
      seenUnits.add(unit.id);
      if (!Array.isArray(unit.questions)) {
        summary.entries++;
        if (unit.answer == null || (Array.isArray(unit.answer) && !unit.answer.length)) summary.missingAnswers++;
        continue;
      }
      // A shared passage may contain numbered blanks while the importer has
      // fewer question/option records. Report the discrepancy without guessing
      // which missing answers belong to which original source blanks.
      const passage = String(unit.passage ?? "");
      const gaps = [...passage.matchAll(/\((\d+)\)\s*_{2,}/g)].map(m => Number(m[1]));
      if (gaps.length > 0) {
        const uniqueGaps = [...new Set(gaps)];
        const provided = unit.questions.map(q => String(q.n ?? "").trim());
        if (uniqueGaps.length !== unit.questions.length || uniqueGaps.some(n => !provided.includes(String(n)))) {
          blockers.push({
            book: bookId, section: section.n, unit: unit.id,
            reason: "gap-question-mapping-needs-source-verification",
            passageGapNumbers: uniqueGaps, importedQuestionNumbers: provided,
          });
        }
      }
      const numbers = new Set();
      for (const question of unit.questions) {
        summary.entries++;
        const n = String(question.n);
        if (numbers.has(n)) {
          summary.duplicateQuestionNumbers++;
          blockers.push({ book: bookId, section: section.n, unit: unit.id, question: n, reason: "duplicate-question-number" });
        }
        numbers.add(n);
        if (!String(question.stem ?? "").trim()) {
          if (String(unit.passage ?? "").trim()) summary.emptyStemsWithPassage++;
          else summary.emptyStemsWithoutPassage++;
        }
        if (question.answer == null || String(question.answer).trim() === "") summary.missingAnswers++;
        if (unit.kind === "mc" && (!question.options || !Object.hasOwn(question.options, String(question.answer)))) summary.missingAnswerOptions++;
      }
    }
  }
  report.push(summary);
}
console.log(JSON.stringify({ audit: "English books structural preflight — not PDF source verification", report, blockers }, null, 2));
if (blockers.length || report.some(b => b.duplicateUnitIds || b.missingAnswers || b.missingAnswerOptions || b.emptyStemsWithoutPassage)) {
  console.error("English question bank has unresolved structural issues. Do not publish as source-verified.");
  process.exitCode = 1;
}
