import { shuffle, type Unit } from "@/lib/books";

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
  const response = await fetch(path, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error("Չհաջողվեց բեռնել հարցերը։ Փորձիր կրկին։");
  return response.json();
}
export function loadHistoryTests() {
  return get<HistoryData>("/data/history-tests.json");
}
export async function loadHistoryBank(): Promise<HistoryEntry[]> {
  const data = await get<{ questions: HistoryQuestion[] }>("/data/history-bank-book1.json");
  return data.questions.map((q) => ({
    source: "bank",
    section: `${q.source_run}: ${q.section}`,
    unit: {
      id: `${q.book}:${q.source_run}:${q.num}`,
      label: `${q.section} · ${q.num}`,
      kind: "mc",
      passage: "",
      questions: [{ n: String(q.num), stem: q.stem, options: q.options, answer: q.answer }],
    },
  }));
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
