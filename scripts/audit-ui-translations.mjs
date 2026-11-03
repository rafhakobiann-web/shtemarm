/**
 * Run: node scripts/audit-ui-translations.mjs
 * Checks UI text passed to tx("...") across the website.
 * Does not scan or modify original question banks, answer options or answer keys.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sources = ["src/routes", "src/components"];
const dictionaries = ["a", "b", "c", "d", "e"].map((name) =>
  readFileSync(join(root, "src/i18n", name + ".ts"), "utf8"),
);
const russian = readFileSync(join(root, "src/i18n/ru.ts"), "utf8");
const hasKey = (source, key) => source.includes(JSON.stringify(key) + ":") ||
  source.includes(JSON.stringify(key) + " :");
const found = new Map();

function walk(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, item.name);
    if (item.isDirectory()) walk(full);
    else if (/\.(tsx|ts)$/.test(item.name) && !/\.test\./.test(item.name)) {
      const source = readFileSync(full, "utf8");
      for (const match of source.matchAll(/\btx\(\s*"([^"]+)"\s*[,)]/g)) {
        const key = match[1];
        const paths = found.get(key) ?? [];
        paths.push(full.replace(root + "/", ""));
        found.set(key, paths);
      }
    }
  }
}
sources.forEach((path) => walk(join(root, path)));

const missing = [];
for (const [key, paths] of found) {
  const english = !dictionaries.some((dict) => hasKey(dict, key));
  const ru = !hasKey(russian, key);
  if (english || ru) missing.push({ key, missing: [english && "English", ru && "Russian"].filter(Boolean), paths });
}
missing.sort((a, b) => a.paths[0].localeCompare(b.paths[0]));
console.log(JSON.stringify({ checked: found.size, missing: missing.length, entries: missing }, null, 2));
if (missing.length) process.exitCode = 1;
