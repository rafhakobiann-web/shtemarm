import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "public/data/math-books-index.json");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const textQuestionsPath = path.join(root, "public/data/math-text-questions.json");
const textQuestions = JSON.parse(fs.readFileSync(textQuestionsPath, "utf8"));
const failures = [];
const summary = [];

for (const [bookId, book] of Object.entries(index.books ?? {})) {
  let taskCount = 0;
  let questionCount = 0;
  let answerCount = 0;
  let pageRefs = new Set();
  let invalidAnswers = 0;
  let missingAnswers = 0;
  let missingSegments = 0;
  let duplicateTaskIds = 0;
  let textPrompts = 0;
  let completeChoiceSets = 0;
  let missingTextPrompts = 0;
  const missingPromptExamples = [];
  const seenTasks = new Set();

  for (const section of book.sections ?? []) {
    const numbers = [];
    for (const task of section.tasks ?? []) {
      taskCount++;
      numbers.push(task.task);
      const id = `${section.chapter}:${section.section}:${task.task}`;
      if (seenTasks.has(id)) duplicateTaskIds++;
      seenTasks.add(id);

      const expected = Number.isInteger(task.sub_count) ? task.sub_count : (task.answers?.length ?? 0);
      questionCount += expected;
      const sectionKey = `${section.chapter}-${section.section}`;
      const taskQuestions = textQuestions[bookId]?.[sectionKey]?.[String(task.task)] ?? task.questions ?? [];
      for (let sub = 0; sub < expected; sub++) {
        const question = taskQuestions[sub];
        if (typeof question?.prompt === "string" && question.prompt.trim()) {
          textPrompts++;
          if (Array.isArray(question.options) && question.options.length >= 4) completeChoiceSets++;
        } else {
          missingTextPrompts++;
          if (missingPromptExamples.length < 12) missingPromptExamples.push(`${section.chapter}.${section.section} task ${task.task}, subquestion ${sub + 1}`);
        }
      }
      if (!Array.isArray(task.answers) || task.answers.length !== expected) {
        missingAnswers += Math.max(1, expected - (task.answers?.length ?? 0));
        failures.push(`${bookId} ${id}: expected ${expected} answers, found ${task.answers?.length ?? 0}`);
      }
      for (const answer of task.answers ?? []) {
        answerCount++;
        if (typeof answer !== "string" || answer.trim() === "") invalidAnswers++;
      }
      if (!Array.isArray(task.segments) || task.segments.length === 0) {
        missingSegments++;
        failures.push(`${bookId} ${id}: no source PDF crop segments`);
      }
      for (const segment of task.segments ?? []) {
        if (!Number.isInteger(segment.page) || !Number.isFinite(segment.y0) || !Number.isFinite(segment.y1) || segment.y1 <= segment.y0) {
          failures.push(`${bookId} ${id}: invalid crop segment`);
          continue;
        }
        pageRefs.add(segment.page);
        const image = path.join(root, "public/math/books", bookId, `p-${String(segment.page).padStart(3, "0")}.jpg`);
        if (!fs.existsSync(image)) failures.push(`${bookId} ${id}: missing source page image ${path.relative(root, image)}`);
      }
    }
    numbers.sort((a, b) => a - b);
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] !== numbers[i - 1] + 1) {
        failures.push(`${bookId} chapter ${section.chapter}, section ${section.section}: task numbering gap ${numbers[i - 1]} -> ${numbers[i]}`);
      }
    }
  }

  if (invalidAnswers) failures.push(`${bookId}: ${invalidAnswers} blank or non-string answers`);
  if (duplicateTaskIds) failures.push(`${bookId}: ${duplicateTaskIds} duplicate task IDs`);
  summary.push({ bookId, sections: book.sections?.length ?? 0, tasks: taskCount, subquestions: questionCount, answers: answerCount, textPrompts, completeChoiceSets, missingTextPrompts, missingPromptExamples, sourcePages: pageRefs.size, missingAnswers, missingSegments, duplicateTaskIds });
}

console.table(summary);
if (failures.length) {
  console.error(`Math bank audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Math bank structure passed: answer counts, task numbering, source crop references, and source page images are complete.");
  console.log("Text-prompt coverage is reported separately. Missing text prompts still display the original source crop in the practice UI; they are not counted as completed transcriptions.");
}
