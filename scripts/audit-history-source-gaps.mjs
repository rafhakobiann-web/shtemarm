import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/**
 * History Volume I source-reconciliation audit.
 * Reads the existing 2017-edition source bank and indexed book without
 * copying book text into any output. This is a review report, NOT an importer:
 * collisions or uncertain run matches must be checked on the printed pages.
 */
export const REVIEWED_UNITS = Object.freeze([
  "1-1-Ա-1", "1-2-Ա-1", "1-3-Ա-1", "1-5-Ա-1",
  "1-1-Բ-2", "1-2-Բ-2", "1-3-Բ-2", "1-4-Բ-2", "1-5-Բ-2",
  "1-1-Գ-3", "1-2-Գ-3", "1-3-Գ-3", "1-4-Գ-3",
  "1-1-Դ-4", "1-2-Դ-4", "1-4-Դ-4", "1-5-Դ-4",
]);

const norm = value => String(value ?? "")
  .normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase("hy-AM");

const safeChoice = q => Number.isInteger(q.num) && q.num > 0 &&
  Number.isInteger(q.page) && q.page >= 4 && q.page <= 448 &&
  typeof q.stem === "string" && q.stem.trim() &&
  q.options && ["1", "2", "3", "4"].every(k => typeof q.options[k] === "string" && q.options[k].trim()) &&
  ["1", "2", "3", "4"].includes(String(q.answer));

export function auditHistorySourceGaps(book, bank) {
  if (book.id !== 21 || bank.book !== "patm-1" || !Array.isArray(bank.questions)) {
    throw new Error("History Volume I source edition mismatch");
  }
  const byRun = new Map();
  for (const q of bank.questions) {
    const group = byRun.get(q.source_run) ?? [];
    group.push(q);
    byRun.set(q.source_run, group);
  }
  const units = book.sections.flatMap(section =>
    section.units.filter(unit => unit.kind === "mc")
      .map(unit => ({ section: section.n, unit })));
  const reports = [], unmatched = [];
  for (const unitId of REVIEWED_UNITS) {
    const match = units.find(x => x.unit.id === unitId);
    if (!match) {
      unmatched.push({ unit: unitId, reason: "missing_destination_unit" });
      continue;
    }
    const { section, unit } = match;
    const stemSet = new Set(unit.questions.map(q => norm(q.stem)));
    const ranked = [...byRun].map(([sourceRun, questions]) => ({
      sourceRun, questions,
      shared: questions.filter(q => stemSet.has(norm(q.stem))).length,
    })).filter(x => x.shared > 0).sort((a,b) => b.shared - a.shared);
    const top = ranked[0];
    const totalShared = ranked.reduce((sum, run) => sum + run.shared, 0);
    const purity = top ? top.shared / totalShared : 0;
    if (!top || top.shared < 3 || purity < 0.95) {
      unmatched.push({ unit: unitId, reason: "uncertain_source_run", topShared: top?.shared ?? 0, purity });
      continue;
    }
    const sourceQuestions = top.questions;
    const matched = sourceQuestions.filter(q => stemSet.has(norm(q.stem)));
    const conflicts = matched.filter(q =>
      !unit.questions.some(existing =>
        norm(existing.stem) === norm(q.stem) &&
        String(existing.n) === String(q.num) &&
        String(existing.answer) === String(q.answer)));
    if (conflicts.length) {
      unmatched.push({ unit: unitId, reason: "conflicting_existing_answer_or_number", count: conflicts.length });
      continue;
    }

    const existingNumbers = new Set(unit.questions.map(q => String(q.n)));
    const candidates = [], blocked = [];
    const newNumbers = new Set();
    for (const question of sourceQuestions) {
      if (stemSet.has(norm(question.stem))) continue;
      const id = { sourceRun: top.sourceRun, number: question.num, page: question.page };
      if (existingNumbers.has(String(question.num))) {
        blocked.push({ ...id, reason: "printed_number_collision" });
      } else if (!safeChoice(question)) {
        blocked.push({ ...id, reason: "incomplete_source_question" });
      } else if (newNumbers.has(String(question.num))) {
        blocked.push({ ...id, reason: "duplicate_source_number" });
      } else {
        newNumbers.add(String(question.num));
        candidates.push(id);
      }
    }
    reports.push({
      unit: unitId, section,
      sourceRun: top.sourceRun,
      sharedStemCount: top.shared,
      sourceRunQuestionCount: sourceQuestions.length,
      matchedRunPurity: Number(purity.toFixed(4)),
      candidates,
      blocked,
    });
  }
  const candidateCount = reports.reduce((total, x) => total + x.candidates.length, 0);
  const blockedCount = reports.reduce((total, x) => total + x.blocked.length, 0);
  return {
    source: "2017 History Volume I, sixth revised edition",
    sourceBank: "public/data/history-bank-book1.json",
    target: "public/data/history-book1.json",
    inventoryOnly: true,
    includesQuestionText: false,
    existingAnswerableCount: book.sections.reduce((sum, s) =>
      sum + s.units.reduce((value, unit) =>
        value + (unit.kind === "mc" || unit.kind === "num" ? unit.questions.length : 1), 0), 0),
    candidateCount, blockedCount, unmatched,
    mappings: reports,
    caution: "Candidate numbers/page links are not permission to republish: inspect source pages, printed answer keys, edition and rights before importing.",
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const book = JSON.parse(readFileSync("public/data/history-book1.json", "utf8"));
  const bank = JSON.parse(readFileSync("public/data/history-bank-book1.json", "utf8"));
  process.stdout.write(JSON.stringify(auditHistorySourceGaps(book, bank), null, 2) + "\n");
}
