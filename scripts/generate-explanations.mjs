#!/usr/bin/env node
/**
 * Offline generator for stored answer explanations.
 *
 * Reads a question bank under public/data, asks an AI provider (Gemini first,
 * Groq as fallback) for an Armenian explanation of each question's OFFICIAL
 * answer key, and writes public/data/explanations/<bank>.json keyed by
 * "<unitId>:<questionNumber>".
 *
 * Keys are read only from your own environment variables. Nothing is committed:
 *   GEMINI_API_KEY=...  GROQ_API_KEY=...  node scripts/generate-explanations.mjs \
 *       --bank book1.json [--limit 20] [--dry-run]
 *
 * The script is resumable: questions already stored in the output file are skipped.
 * Review generated text before publishing; the official key remains the authority.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, "..", "public", "data");
const outDir = path.join(dataDir, "explanations");

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (!arg.startsWith("--")) continue;
  const next = process.argv[i + 1];
  args[arg.slice(2)] = next && !next.startsWith("--") ? next : true;
}

const bank = typeof args.bank === "string" ? args.bank : null;
if (!bank) {
  console.error("Usage: node scripts/generate-explanations.mjs --bank <file.json> [--limit N] [--dry-run] [--delay-ms 2500]");
  process.exit(1);
}
const limit = Number(args.limit ?? Infinity);
const delayMs = Number(args["delay-ms"] ?? 2500);
const dryRun = Boolean(args["dry-run"]);
const geminiKey = process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;
if (!dryRun && !geminiKey && !groqKey) {
  console.error("Set GEMINI_API_KEY and/or GROQ_API_KEY in your environment first.");
  process.exit(1);
}

const PROMPT_HEAD = `Դու փորձառու ուսուցիչ ես, որը հայ աշակերտներին օգնում է պատրաստվել քննությանը։
Տրված ճիշտ պատասխանը վերցված է պաշտոնական բանալուց։ Հիմնավորիր այն՝ ոչ թե պարզապես կրկնիր բանալին։
Գրիր ԳՐԱԿԱՆ ՀԱՅԵՐԵՆՈՎ՝ 120–260 բառ։ Օգտագործիր կարճ, համարակալված քայլեր՝
1. Հարցի իմաստը, 2. Ինչն է պահանջվում, 3. Ինչու է ճիշտը ճիշտ, 4. Ինչու մյուս տարբերակները սխալ են։
Եթե հարցը անգլերենի քերականության մասին է, բեր կանոն և մեկ օրինակ։
Մի հորինիր փաստեր և մի փոխիր տրված ճիշտ պատասխանը։`;

function buildPrompt({ passage, stem, options, correct, label }) {
  const opts = Object.entries(options ?? {}).map(([k, v]) => `${k}) ${v}`).join("\n");
  return [
    PROMPT_HEAD,
    label ? `Բաժին՝ ${label}` : "",
    passage ? `Տեքստ՝\n${passage}` : "",
    `Հարց՝ ${stem}`,
    opts ? `Տարբերակներ՝\n${opts}` : "",
    `Ճիշտ պատասխան (պաշտոնական բանալի)՝ ${correct}`,
  ].filter(Boolean).join("\n\n");
}

async function askGemini(prompt) {
  const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];
  for (const model of models) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1300 } }),
    });
    if (res.status === 401 || res.status === 403) throw new Error("Gemini key rejected");
    if (!res.ok) continue;
    const json = await res.json();
    const text = (json.candidates?.[0]?.content?.parts ?? []).filter(p => !p.thought).map(p => p.text ?? "").join("").trim();
    if (text) return { text, provider: "Gemini " + model };
  }
  return null;
}

async function askGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: { Authorization: "Bearer " + groqKey, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: prompt }], max_completion_tokens: 1600, stream: false }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("Groq key rejected");
  if (!res.ok) return null;
  const json = await res.json();
  const text = String(json.choices?.[0]?.message?.content ?? "").trim();
  return text ? { text, provider: "Groq openai/gpt-oss-120b" } : null;
}

async function generate(prompt) {
  if (geminiKey) { const r = await askGemini(prompt); if (r) return r; }
  if (groqKey) { const r = await askGroq(prompt); if (r) return r; }
  return null;
}

/** Flatten a bank into one record per question. Supports units with questions[] or a single stem. */
function flatten(json, bankName) {
  const records = [];
  for (const section of json.sections ?? []) {
    for (const unit of section.units ?? []) {
      const label = [section.title ?? `Բաժին ${section.n ?? ""}`, unit.label].filter(Boolean).join(" · ");
      const list = unit.questions ?? [{ n: unit.n ?? "1", stem: unit.stem, options: unit.options, answer: unit.answer }];
      for (const q of list) {
        if (!q || !q.answer || !q.stem) continue;
        records.push({
          id: `${unit.id}:${q.n}`,
          bank: bankName,
          label,
          passage: unit.kind === "mc" && unit.passage ? unit.passage : "",
          stem: q.stem,
          options: q.options ?? null,
          correct: String(q.answer),
        });
      }
    }
  }
  return records;
}

async function main() {
  const src = path.join(dataDir, bank);
  const json = JSON.parse(await readFile(src, "utf8"));
  const records = flatten(json, bank);
  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, bank);
  let stored = {};
  try { stored = JSON.parse(await readFile(outFile, "utf8")); } catch { /* first run */ }

  const todo = records.filter(r => !stored[r.id]);
  console.log(`${bank}: ${records.length} questions, ${records.length - todo.length} already stored, ${todo.length} to do.`);
  if (dryRun) {
    console.log("Dry run: nothing sent. Example prompt:\n");
    if (todo[0]) console.log(buildPrompt(todo[0]));
    return;
  }

  let done = 0, failed = 0;
  for (const rec of todo.slice(0, limit)) {
    try {
      const result = await generate(buildPrompt(rec));
      if (!result) { failed++; console.warn("no answer for", rec.id); }
      else {
        stored[rec.id] = {
          text: result.text,
          correct: rec.correct,
          provider: result.provider,
          generatedAt: new Date().toISOString(),
          reviewed: false,
        };
        done++;
        await writeFile(outFile, JSON.stringify(stored, null, 1), "utf8");
      }
    } catch (err) {
      console.error("stopping:", err.message);
      break;
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  console.log(`Saved ${done} explanations to ${path.relative(process.cwd(), outFile)}; ${failed} failed.`);
}

main().catch(err => { console.error(err); process.exit(1); });
