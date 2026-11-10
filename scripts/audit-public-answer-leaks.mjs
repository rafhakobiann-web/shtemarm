#!/usr/bin/env node
/**
 * Diagnostic: report answer-bearing JSON accidentally published to /public.
 * Never prints the actual questions or answer keys.
 *
 * Run:
 *   node scripts/audit-public-answer-leaks.mjs
 *   node scripts/audit-public-answer-leaks.mjs --strict
 *
 * Convert --strict to a required CI gate only after full bank storage has
 * moved to authenticated server-only infrastructure.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = "public/data";
const strict = process.argv.includes("--strict");
const answerFields = new Set(["answer", "answers", "answerKey", "answer_key", "correctAnswer", "correct_answer"]);
const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (stat.isFile() && name.endsWith(".json")) files.push(path);
  }
}
walk(root);

function countAnswers(input) {
  if (Array.isArray(input)) return input.reduce((count, item) => count + countAnswers(item), 0);
  if (input === null || typeof input !== "object") return 0;
  let count = 0;
  for (const [key, value] of Object.entries(input)) {
    if (answerFields.has(key) && value !== null && value !== undefined) count += 1;
    count += countAnswers(value);
  }
  return count;
}

let riskyFiles = 0;
let exposedAnswerFields = 0;
for (const file of files) {
  try {
    const fields = countAnswers(JSON.parse(readFileSync(file, "utf8")));
    if (fields === 0) continue;
    riskyFiles += 1;
    exposedAnswerFields += fields;
    console.log(`PUBLIC ANSWER-BEARING DATA: ${relative(".", file)} (${fields} answer fields)`);
  } catch (error) {
    console.error(`Unable to inspect ${relative(".", file)}: ${String(error)}`);
    process.exitCode = 2;
  }
}
console.log(`Audit: ${files.length} public JSON files inspected; ${riskyFiles} with answer fields, ${exposedAnswerFields} answer fields total.`);
if (riskyFiles > 0) {
  console.error("Full public JSON is not protected by route guards, frontend guest limits, robots.txt or CORS.");
  console.error("Move full data and keys outside public/ and use authenticated server access + a tiny guest preview.");
  if (strict) process.exitCode = 1;
}
