import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditHistorySourceGaps, REVIEWED_UNITS } from "./audit-history-source-gaps.mjs";

test("History I source audit identifies gaps without distributing original text", () => {
  const book = JSON.parse(readFileSync("public/data/history-book1.json", "utf8"));
  const bank = JSON.parse(readFileSync("public/data/history-bank-book1.json", "utf8"));
  const result = auditHistorySourceGaps(book, bank);
  assert.equal(result.sourceBank, "public/data/history-bank-book1.json");
  assert.equal(result.target, "public/data/history-book1.json");
  assert.equal(result.inventoryOnly, true);
  assert.equal(result.includesQuestionText, false);
  assert.ok(result.existingAnswerableCount >= 1657);
  assert.ok(result.mappings.length >= 15);
  assert.ok(result.candidateCount > 0);
  assert.equal(result.candidateCount,
    result.mappings.reduce((n, unit) => n + unit.candidates.length, 0));
  assert.equal(result.blockedCount,
    result.mappings.reduce((n, unit) => n + unit.blocked.length, 0));
  for (const unit of result.mappings) {
    assert.ok(REVIEWED_UNITS.includes(unit.unit));
    assert.ok(unit.sharedStemCount >= 3);
    assert.ok(unit.matchedRunPurity >= 0.95);
    const existing = book.sections.flatMap(s => s.units).find(u => u.id === unit.unit);
    assert.ok(existing);
    const occupied = new Set(existing.questions.map(q => String(q.n)));
    const newlyDiscovered = new Set();
    for (const q of unit.candidates) {
      assert.equal(typeof q.number, "number");
      assert.ok(Number.isInteger(q.page) && q.page >= 4 && q.page <= 448);
      assert.equal(occupied.has(String(q.number)), false);
      assert.equal(newlyDiscovered.has(String(q.number)), false);
      newlyDiscovered.add(String(q.number));
    }
  }
  const report = JSON.stringify(result);
  assert.equal(/"(?:stem|options|passage|answer)"\s*:/.test(report), false);
});

test("History I audit refuses a different source book", () => {
  const book = JSON.parse(readFileSync("public/data/history-book1.json", "utf8"));
  const bank = JSON.parse(readFileSync("public/data/history-bank-book1.json", "utf8"));
  assert.throws(() => auditHistorySourceGaps({ ...book, id: 22 }, bank), /edition mismatch/);
  assert.throws(() => auditHistorySourceGaps(book, { ...bank, book: "patm-2" }), /edition mismatch/);
});
