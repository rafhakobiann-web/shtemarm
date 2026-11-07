#!/usr/bin/env node
/** Book III: validate staged playable + review-only coverage without a PDF. */
import { readFileSync } from "node:fs";

const read = path => JSON.parse(readFileSync(path, "utf8"));
const fail = message => { throw Error(`Biology III completion gate: ${message}`); };
const requireTrue = (test, message) => { if (!test) fail(message); };

const index = read("public/data/biology-original-volume3-index.json");
const core = read("public/data/bio-book3.json");
const supplemental = read("public/data/biology-extended-book3.json");
const next500 = read("docs/biology-next-500-source-queue.json").entries;
const final500 = read("docs/biology-final-500-source-queue.json").entries;
requireTrue(index.volume === 3 && index.totalPages === 384, "wrong source edition");
requireTrue(index.chapters.length === 6, "expected six chapters");
requireTrue(index.chapters.reduce((sum, ch) => sum + ch.questionCount, 0) === 1837,
  "expected 1837 numbered tasks");

const playable = new Map();
for (const bank of [core, supplemental]) {
  for (const section of bank.sections) {
    for (const unit of section.units) {
      const number = Number(unit.label);
      requireTrue(Number.isInteger(number) && number > 0, "invalid playable number");
      const key = `${section.n}:${number}`;
      requireTrue(!playable.has(key), `duplicate playable task ${key}`);
      requireTrue(typeof unit.id === "string" && unit.id.length > 0, `missing stable ID ${key}`);
      playable.set(key, unit);
    }
  }
}
const pending = new Map();
for (const row of [...next500, ...final500]) {
  const [volume, chapter, number, page, answerStart, answerEnd] = row;
  if (volume !== 3) continue;
  const key = `${chapter}:${number}`;
  requireTrue(!pending.has(key), `duplicate pending task ${key}`);
  requireTrue(!playable.has(key), `pending task is already playable: ${key}`);
  const sourceChapter = index.chapters.find(c => c.id === chapter);
  requireTrue(sourceChapter && number >= 1 && number <= sourceChapter.questionCount,
    `invalid source identity ${key}`);
  let indexedPage = sourceChapter.startPage;
  for (const [start, p] of sourceChapter.pageRuns) {
    if (start > number) break;
    indexedPage = p;
  }
  requireTrue(page === indexedPage, `wrong pending source page ${key}`);
  requireTrue(answerStart === sourceChapter.answerPages[0]
    && answerEnd === sourceChapter.answerPages[1], `wrong key-page range ${key}`);
  pending.set(key, row);
}
requireTrue(playable.size === 1222, `expected 1222 playable tasks, saw ${playable.size}`);
requireTrue(pending.size === 615, `expected 615 pending tasks, saw ${pending.size}`);
const chapters = [];
for (const chapter of index.chapters) {
  let playableCount = 0, pendingCount = 0;
  for (let number = 1; number <= chapter.questionCount; number++) {
    const key = `${chapter.id}:${number}`;
    const found = Number(playable.has(key)) + Number(pending.has(key));
    requireTrue(found === 1, `unassigned or duplicated printed task ${key}`);
    playableCount += Number(playable.has(key));
    pendingCount += Number(pending.has(key));
  }
  chapters.push({ chapter: chapter.id, playable: playableCount, pending: pendingCount });
}
console.log(JSON.stringify({
  volume: 3, indexed: 1837, stagedPlayable: playable.size,
  reviewOnly: pending.size, chapters, isComplete: pending.size === 0,
}, null, 2));
