import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const SOURCES = {
  history: { name: "Հայոց պատմություն", catalog: "public/data/history-official-catalog.json" },
  biology: { name: "Կենսաբանություն", catalog: "public/data/biology-official-catalog.json" },
};
const PAGE = "https://dimord.am/public/tests";
const decode = (s) => s.replace(/&#x([a-f0-9]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const clean = (s) => decode(s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());

/** Only HTTPS links hosted by the official testing authority are allowed. */
export function officialUrl(href) {
  try {
    const url = new URL(decode(href), PAGE);
    if (url.protocol !== "https:" || !["dimord.am", "www.dimord.am", "atc.am", "www.atc.am"].includes(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function parseOfficialRows(html) {
  const result = { history: null, biology: null };
  for (const row of html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? []) {
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1]);
    if (cells.length < 4) continue;
    const subjectCellIndex = cells.findIndex((cell) => Object.values(SOURCES).some((item) => clean(cell) === item.name));
    if (subjectCellIndex < 0) continue;
    const subject = Object.keys(SOURCES).find((key) => clean(cells[subjectCellIndex]) === SOURCES[key].name);
    const date = cells.map(clean).find((value) => /^\d{1,2}\/\d{1,2}\/20\d\d$/.test(value));
    if (!subject || !date) continue;
    const [day, month, year] = date.split("/").map(Number);
    if (!day || day > 31 || !month || month > 12) continue;
    const htmlLinks = cells.slice(subjectCellIndex + 1).join(" ");
    const links = [];
    for (const m of htmlLinks.matchAll(/<a\b[^>]*href\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>([\s\S]*?)<\/a>/gi)) {
      const url = officialUrl(m[1] ?? m[2] ?? "");
      if (!url || links.some((x) => x.url === url)) continue;
      const label = clean(m[3]) || "Թեստ";
      links.push({ title: label, url, kind: /պատասխան/i.test(label) ? "answers" : "paper" });
    }
    result[subject] = {
      id: "gtc-remote-" + year,
      date: year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0"),
      title: String(year) + " · Հեռակա ընդունելության քննություն",
      sourceUrl: PAGE, sourceLabel: "ԳԹԿ · dimord.am",
      status: links.length ? "published" : "pending",
      links,
    };
  }
  return result;
}

export function mergedCatalog(existing, latest) {
  const papers = [...existing.papers];
  const index = papers.findIndex((item) => item.id === latest.id);
  const previous = index < 0 ? null : papers[index];
  const item = previous?.status === "published" && latest.status === "pending" ? previous : latest;
  if (index >= 0) papers[index] = item;
  else papers.unshift(item);
  papers.sort((a, b) => b.date.localeCompare(a.date));
  const next = { ...existing, papers };
  return JSON.stringify(next.papers) === JSON.stringify(existing.papers)
    ? existing : { ...next, updatedAt: new Date().toISOString() };
}

export async function syncOfficialExams(fetcher = fetch) {
  const response = await fetcher(PAGE, {
    headers: { "User-Agent": "Shtemarm-OfficialExamMonitor/1.0 (+https://github.com/rafhakobiann-web/shtemarm)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error("Official source HTTP " + response.status);
  const rows = parseOfficialRows(await response.text());
  if (!rows.history || !rows.biology) throw new Error("Official source format changed or subject rows absent; refusing changes");
  const updated = [];
  for (const [subject, settings] of Object.entries(SOURCES)) {
    const old = JSON.parse(await readFile(settings.catalog, "utf8"));
    const next = mergedCatalog(old, rows[subject]);
    if (next === old) continue;
    await writeFile(settings.catalog, JSON.stringify(next, null, 2) + "\n");
    updated.push(subject);
  }
  return updated;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  syncOfficialExams().then((updated) => {
    console.log(updated.length ? "Updated: " + updated.join(", ") : "No new official exam materials");
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
