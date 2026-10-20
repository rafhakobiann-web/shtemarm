import type { Unit } from "@/lib/books";

export type HistoryTest = { id: number; tasks: Unit[] };
export type HistoryData = { subject: string; title: string; tests: HistoryTest[] };

let cache: Promise<HistoryData> | null = null;

/** Loads the Armenian history sample exams (public/data/history-tests.json). */
export function loadHistoryTests(): Promise<HistoryData> {
  if (!cache) {
    cache = fetch("/data/history-tests.json").then((r) => {
      if (!r.ok) throw new Error("Չհաջողվեց բեռնել թեստը");
      return r.json() as Promise<HistoryData>;
    });
  }
  return cache;
}
