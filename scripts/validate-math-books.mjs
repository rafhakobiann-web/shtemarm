import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const index = JSON.parse(await readFile(path.join(root, "public/data/math-books-index.json"), "utf8"));
const expectedPages = { "matem-1": 288, "matem-2": 320 };
const errors = [];
const report = {};

function issue(message) {
  errors.push(message);
}

assert.ok(index.books?.["matem-1"], "Missing Part 1 in math-books-index.json");
assert.ok(index.books?.["matem-2"], "Missing Part 2 in math-books-index.json");

for (const [bookId, book] of Object.entries(index.books)) {
  const sectionKeys = new Set();
  let taskCount = 0;
  let subquestionCount = 0;

  for (const section of book.sections ?? []) {
    const sectionKey = `${section.chapter}:${section.section}`;
    if (sectionKeys.has(sectionKey)) issue(`${bookId}: duplicate section ${sectionKey}`);
    sectionKeys.add(sectionKey);
    if (!section.title?.trim()) issue(`${bookId} ${sectionKey}: missing section title`);

    const taskIds = new Set();
    for (const task of section.tasks ?? []) {
      taskCount++;
      if (taskIds.has(task.task)) issue(`${bookId} ${sectionKey}: duplicate task ${task.task}`);
      taskIds.add(task.task);

      if (!Array.isArray(task.answers)) {
        issue(`${bookId} ${sectionKey} task ${task.task}: missing answer array`);
        continue;
      }
      if (task.answers.length !== task.sub_count) {
        issue(`${bookId} ${sectionKey} task ${task.task}: ${task.answers.length} answers for ${task.sub_count} sub-questions`);
      }
      if (task.answers.some((answer) => typeof answer !== "string" || !answer.trim())) {
        issue(`${bookId} ${sectionKey} task ${task.task}: blank or invalid answer`);
      }
      if (!Array.isArray(task.segments) || task.segments.length === 0) {
        issue(`${bookId} ${sectionKey} task ${task.task}: missing image segments`);
      }

      const allSegments = [
        ...(task.segments ?? []),
        ...(task.sub_segments ?? []).flat(),
      ];
      if (task.sub_segments && task.sub_segments.length !== task.sub_count) {
        issue(`${bookId} ${sectionKey} task ${task.task}: sub-segment count does not match sub-question count`);
      }
      for (const segment of allSegments) {
        if (!Number.isInteger(segment.page) || segment.page < 1 || segment.page > expectedPages[bookId]) {
          issue(`${bookId} ${sectionKey} task ${task.task}: invalid source page ${segment.page}`);
        }
        if (![segment.y0, segment.y1].every(Number.isFinite) || segment.y0 < 0 || segment.y1 <= segment.y0 || segment.y1 > 650.4) {
          issue(`${bookId} ${sectionKey} task ${task.task}: invalid crop coordinates`);
        }
      }
      subquestionCount += task.sub_count;
    }
  }
  report[bookId] = { sections: sectionKeys.size, tasks: taskCount, subquestions: subquestionCount };
}

if (errors.length) {
  console.error(`Math-book data validation failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  if (errors.length > 100) console.error(`...and ${errors.length - 100} more`);
  process.exitCode = 1;
} else {
  console.log("Math-book metadata validation passed.");
  console.table(report);
  console.log("Note: this checks data structure and answer-key completeness, not the mathematical correctness of each answer.");
}
