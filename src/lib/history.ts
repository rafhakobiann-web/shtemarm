import { loadBook, shuffle, type Book, type Unit } from "@/lib/books";
import { fetchBookResponse } from "@/lib/fetch-book-response";

export type HistoryTest = { id: number; tasks: Unit[] };
export type HistoryData = { subject: string; title: string; tests: HistoryTest[] };
export type HistoryEntry = { unit: Unit; section: string; source: string };
export type HistoryQuestion = {
  book: string;
  source_run: number;
  num: number;
  section: string;
  stem: string;
  options: Record<string, string>;
  answer: string;
};

async function get<T>(path: string): Promise<T> {
  return fetchBookResponse(path, async (response) => {
    if (!response.ok) throw new Error("Չհաջողվեց բեռնել հարցերը։ Փորձիր կրկին։");
    return response.json() as Promise<T>;
  });
}
export function loadHistoryTests() {
  return get<HistoryData>("/data/history-tests.json");
}
export async function loadHistoryBank(): Promise<HistoryEntry[]> {
  const data = await get<{ questions: HistoryQuestion[] }>("/data/history-bank-book1.json");
  if (!Array.isArray(data.questions)) throw new Error("Հայոց պատմության հարցաշարի ձևաչափը սխալ է։");
  const seen = new Set<string>();
  return data.questions.map((q) => {
    const id = `${q.book}:${q.source_run}:${q.num}`;
    if (seen.has(id) || !q.stem?.trim() || !q.options?.[q.answer]?.trim()) {
      throw new Error(`Հայոց պատմության հարցաշարի անվավեր կամ կրկնվող առաջադրանք՝ ${id}`);
    }
    seen.add(id);
    return {
      source: "bank",
      section: `${q.source_run}: ${q.section}`,
      unit: {
        id,
        label: `${q.section} · ${q.num}`,
        kind: "mc",
        passage: "",
        questions: [{ n: String(q.num), stem: q.stem, options: q.options, answer: q.answer }],
      },
    };
  });
}
/** Keep each individually answerable multiple-choice/numeric question available.
 * Compound ordering, matching and selection tasks remain intact.
 * IDs include source + location, so combining all three books cannot skip collisions.
 */
export function historyBookEntries(book: Book, bookNumber: number): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  const seen = new Set<string>();
  for (const section of book.sections) {
    const name = `Գիրք ${bookNumber} · ${section.title ?? section.label ?? `Բաժին ${section.n}`}`;
    for (const unit of section.units) {
      const id = `book-${bookNumber}:${section.n}:${unit.id}`;
      if (seen.has(id)) throw new Error(`Կրկնվող բնօրինակ առաջադրանք՝ ${id}`);
      seen.add(id);
      if (unit.kind === "mc" || unit.kind === "num") {
        unit.questions.forEach((question, index) => {
          // A source passage may contain the whole stem; do not silently drop
          // a question just because its individual stem field is empty.
          const number = question.n;
          if ((!question.stem?.trim() && !unit.passage?.trim()) ||
              !question.answer?.trim() ||
              (unit.kind === "mc" && !question.options?.[question.answer]?.trim())) {
            throw new Error(`Թերի առաջադրանք՝ ${id} · ${number}`);
          }
          entries.push({
            source: `book-${bookNumber}`, section: name,
            unit: { ...unit, id: `${id}:q${index}`, label: `${unit.label} · ${question.n}`, questions: [question] } as Unit,
          });
        });
      } else {
        if (!unit.answer || (Array.isArray(unit.answer)
          ? unit.answer.length === 0 : Object.keys(unit.answer).length === 0)) {
          throw new Error(`Թերի առաջադրանքի պատասխան՝ ${id}`);
        }
        entries.push({ source: `book-${bookNumber}`, section: name, unit: { ...unit, id } });
      }
    }
  }
  return entries;
}

export async function loadHistoryBooks(): Promise<HistoryEntry[]> {
  const books = await Promise.all([1, 2, 3].map((n) => loadBook(20 + n)));
  return books.flatMap((book, i) => historyBookEntries(book, i + 1));
}

export function selectHistoryUnits(
  entries: HistoryEntry[],
  count: number,
  random: boolean,
): Unit[] {
  const unique = [...new Map(entries.map((e) => [e.unit.id, e.unit])).values()];
  if (!Number.isInteger(count) || count < 1 || count > unique.length)
    throw new Error("Ընտրիր հասանելի առաջադրանքների քանակը։");
  return (random ? shuffle(unique) : unique).slice(0, count);
}
