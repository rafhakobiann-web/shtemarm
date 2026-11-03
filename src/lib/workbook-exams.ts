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

/** Deduplicate repeated authored Armenian MCQs across volumes by question content.
 * Keep the first entry's original ID so saved progress remains valid. Do not
 * deduplicate English passages or compound question formats by their wording.
 * This is not official-source validation; it only avoids repeated practice.
 */
export function uniqueArmenianPracticeEntries(entries: readonly HistoryEntry[]): HistoryEntry[] {
  const seen = new Set<string>();
  return entries.filter(({ unit }) => {
    if (unit.kind !== "mc" || unit.questions.length !== 1) return true;
    const question = unit.questions[0];
    const fingerprint = [question.stem, ...["1", "2", "3", "4"].map((key) => question.options[key] ?? "")]
      .map((value) => value.trim().toLocaleLowerCase("hy"))
      .join("\u241f");
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint);
    return true;
  });
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
      units: selectHistoryUnits(subject === "armenian" ? uniqueArmenianPracticeEntries(pool) : pool, count, random),
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
    const perBook = (source === "all" ? choices : [selected]).map(book => workbookEntries([book]));
    const practicePool: HistoryEntry[] = [];
    const maximum = Math.max(...perBook.map(entries => entries.length));
    // In original-book order, round-robin keeps all four selected books
    // represented instead of taking 70 questions exclusively from Part I.
    for (let index = 0; index < maximum; index++) {
      for (const entries of perBook) {
        const item = entries[index];
        if (item) practicePool.push(item);
      }
    }
    const distinctPractice = uniqueArmenianPracticeEntries(practicePool);
    if (distinctPractice.length < 70) {
      throw new Error("Ընտրված գրքում դեռ բավարար՝ 70 վարժություն չկա։ Ընտրիր բոլոր մասերը կամ անհատական թեստը։");
    }
    return { units: selectHistoryUnits(distinctPractice, 70, random), bookId: source === "all" ? 41 : selected.id };
  }
  const items = buildExam(selected, selected.id);
  return {
    units: items.map(({ unit }) => ({ ...unit, id: `exam-${selected.id}:${unit.id}` })),
    bookId: selected.id,
  };
}
