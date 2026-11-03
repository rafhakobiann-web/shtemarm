import { buildExam, loadBook, type Book, type Unit } from "@/lib/books";
import { historyBookEntries, selectHistoryUnits, type HistoryEntry } from "@/lib/history";

export type WorkbookSubject = "english" | "armenian";
export const WORKBOOK_SOURCES: Record<WorkbookSubject, readonly number[]> = {
  english: [1, 2, 3],
  armenian: [41, 42, 43, 44],
};

export async function loadWorkbookSources(subject: WorkbookSubject): Promise<Book[]> {
  return Promise.all(WORKBOOK_SOURCES[subject].map((id) => loadBook(id)));
}

export function workbookEntries(books: readonly Book[]): HistoryEntry[] {
  return books.flatMap((book) => historyBookEntries(book, book.id));
}

export function makeWorkbookExam(
  books: readonly Book[],
  subject: WorkbookSubject,
  source: string,
  mode: "full" | "custom",
  pool: HistoryEntry[],
  count: number,
  random: boolean,
): { units: Unit[]; bookId: number } {
  if (mode === "custom") {
    return {
      units: selectHistoryUnits(pool, count, random),
      bookId: source === "all" ? (subject === "english" ? 0 : 41) : Number(source),
    };
  }
  // Always use the existing verified structure for an English model paper.
  // Choose one actual book for a full exam; do not mix sections from different
  // books and accidentally break passage/section quotas.
  const choices = books.filter((book) => source === "all" || String(book.id) === source);
  if (!choices.length) throw new Error("Քննության համար հասանելի շտեմարան չկա։");
  const selected = random ? choices[Math.floor(Math.random() * choices.length)] : choices[0];
  if (subject === "armenian") {
    // A 70-question authored PRACTICE set, never an official 80-point exam:
    // the source PDFs contain response types not digitized here. For "all",
    // sample the available questions from all four practice volumes.
    const practicePool = workbookEntries(source === "all" ? choices : [selected]);
    if (practicePool.length < 70) {
      throw new Error("Ընտրված գրքում դեռ բավարար՝ 70 վարժություն չկա։ Ընտրիր բոլոր մասերը կամ անհատական թեստը։");
    }
    return { units: selectHistoryUnits(practicePool, 70, random), bookId: source === "all" ? 41 : selected.id };
  }
  const items = buildExam(selected, selected.id);
  return {
    units: items.map(({ unit }) => ({ ...unit, id: `exam-${selected.id}:${unit.id}` })),
    bookId: selected.id,
  };
}
