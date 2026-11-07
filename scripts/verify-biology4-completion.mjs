#!/usr/bin/env node
/**
 * Verify original Book IV task ownership without claiming missing tasks playable.
 * No PDF/book text, answer values or original images are included.
 */
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(path, "utf8"));
const check = (ok, message) => { if (!ok) throw Error("Biology IV: " + message); };
const source = read("public/data/biology-original-volume4-index.json");
const base = read("public/data/bio-book4.json");
const extra = read("public/data/biology-extended-book4.json");
const first = read("docs/biology-next-268-source-review.json");
const second = read("docs/biology-next-500-source-queue.json");
const third = read("docs/biology-final-500-source-queue.json");
const effective = read("public/data/biology-extended-coverage.json").books.find(b => b.volume === 4);
const chapters = [232, 300, 301, 338, 214, 303];
check(source.volume === 4 && source.totalPages === 392, "invalid original PDF index");
check(source.chapters.length === 6, "expected six original chapters");
check(chapters.every((n, i) => source.chapters[i].questionCount === n), "chapter source count changed");
check(source.sourceSha256 === "9e0ec096451705d5a5b80da9c0c4ca405f888a7a39c6572b5f63aac180ce597e",
  "unexpected original edition fingerprint");
const ready = new Map();
for (const book of [base, extra]) for (const section of book.sections) for (const unit of section.units) {
  const num = Number(unit.label);
  const key = section.n + ":" + num;
  check(Number.isInteger(num) && num > 0, "non-numeric playable label " + key);
  check(!ready.has(key), "duplicate playable " + key);
  check(unit.id === "bio4-s" + section.n + "-q" + num, "unstable task ID " + key);
  ready.set(key, unit);
}
const queued = new Map();
const add = (chapter, num, page, name) => {
  const key = chapter + ":" + num;
  check(!queued.has(key), "duplicate pending " + key + " in " + name);
  check(!ready.has(key), "pending already playable " + key);
  queued.set(key, { page, queue: name });
};
for (const row of first.entries) add(row.chapter, row.printedNumber, row.sourcePage, "first-268");
for (const row of second.entries) if (row[0] === 4) add(row[1], row[2], row[3], "next-500");
for (const row of third.entries) if (row[0] === 4) add(row[1], row[2], row[3], "final-500");
check(ready.size === 1035 && queued.size === 653, "expected 1035 staged playable + 653 pending");
check(effective.totalPlayableTasks === ready.size && effective.remainingTasks === queued.size,
  "combined coverage manifest diverges");
let wrongPages = 0;
const summary = [];
for (const chapter of source.chapters) {
  const runs = new Map(chapter.pageRuns);
  let currentPage = chapter.startPage, present = 0, pending = 0;
  for (let n = 1; n <= chapter.questionCount; n++) {
    const key = chapter.id + ":" + n;
    currentPage = runs.get(n) ?? currentPage;
    check(Number(ready.has(key)) + Number(queued.has(key)) === 1, "unassigned " + key);
    if (ready.has(key)) present++;
    if (queued.has(key)) {
      pending++;
      if (queued.get(key).page !== currentPage) wrongPages++;
    }
  }
  summary.push({ chapter: chapter.id, indexed: chapter.questionCount, stagedPlayable: present, pending });
}
check(wrongPages === 0, wrongPages + " incorrect source pages");
const threeState = [
  ...Array.from({ length: 8 }, (_, n) => [1, 225 + n]),
  ...Array.from({ length: 99 }, (_, n) => [2, 202 + n]),
  ...Array.from({ length: 50 }, (_, n) => [3, 252 + n]),
  ...Array.from({ length: 49 }, (_, n) => [4, 170 + n]),
  ...[140, 141, 142, 143, 144, 146, 162, 163, 171, 184, 185, 188, 189, 191, 203, 204, 205]
    .map(n => [5, n]),
];
check(threeState.length === 223 && new Set(threeState.map(([c,n]) => c+":"+n)).size === 223,
  "three-state source inventory changed");
for (const [chapter, number] of threeState)
  check(queued.has(chapter + ":" + number), "three-state task missing review gate " + chapter + ":" + number);
check(summary[5].pending === 245, "Chapter VI still has 245 unimported problems");
const review = read("docs/biology4-type-review-queue.json");
check(review.volume === 4 && review.sourceSha256 === source.sourceSha256,
  "typed review inventory does not match source edition");
check(review.entries.length === queued.size && review.counts.total === queued.size,
  "typed review inventory size changed");
const threeStateIds = new Set(threeState.map(([c, n]) => c + ":" + n));
const reviewed = new Set(), actualTypes = {};
for (const [chapter, number, page, keyStart, keyEnd, reviewType] of review.entries) {
  const key = chapter + ":" + number;
  check(!reviewed.has(key) && queued.has(key), "invalid or duplicate typed entry " + key);
  reviewed.add(key);
  const ch = source.chapters[chapter - 1];
  check(queued.get(key).page === page && ch.answerPages[0] === keyStart
    && ch.answerPages[1] === keyEnd, "wrong source/key page for typed entry " + key);
  const expected = chapter === 6
    ? ["multipart-problem", "single-answer-problem"]
    : threeStateIds.has(key) ? ["three-state-six-claims"] : ["requires-format-key-review"];
  check(expected.includes(reviewType), "incorrect review category " + key);
  actualTypes[reviewType] = (actualTypes[reviewType] ?? 0) + 1;
}
check(reviewed.size === queued.size, "typed review inventory misses source IDs");
for (const [name, count] of Object.entries({
  "requires-format-key-review": 185,
  "three-state-six-claims": 223,
  "multipart-problem": 146,
  "single-answer-problem": 99,
})) check(actualTypes[name] === count && review.counts[name] === count, "type count mismatch: " + name);

console.log(JSON.stringify({
  volume: 4, indexed: 1688, stagedPlayable: ready.size, pending: queued.size,
  threeStateAwaitingVerifiedSourceKeys: 223, chapter6ProblemsAwaitingImport: 245,
  chapters: summary, completed: queued.size === 0
}, null, 2));
