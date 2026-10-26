import { shuffle, type Book, type Unit } from "@/lib/books";

export const HISTORY_SECTION_NAMES = [
  "Տարեթվեր",
  "Փաստեր և երևույթներ",
  "Աշխատանք սկզբնաղբյուրների հետ",
  "Պատմական տերմիններ և հասկացություններ",
  "Իրադարձությունների պատճառներ և հետևանքներ",
  "Իրադարձությունների ժամանակագրություն",
  "Համապատասխանեցում",
  "Փաստարկներ և պնդումներ",
] as const;

export type HistoryExamQuestion = {
  id: string;
  bookId: number;
  section: number;
  unit: Unit;
  instruction: string;
};

export type HistoryExamOptions = {
  books: number[];
  sections: number[];
  count: number;
  order?: "random" | "book";
};

const isValid = (unit: Unit): boolean => {
  if (unit.kind === "mc") {
    return unit.questions.length === 1 && unit.questions.every((q) =>
      !!q.stem?.trim() && !!q.answer && !!q.options?.[q.answer]?.trim(),
    );
  }
  if (unit.kind === "num") {
    return unit.questions.length === 1 && unit.questions.every((q) => !!q.stem?.trim() && !!q.answer?.trim());
  }
  if (!unit.passage?.trim()) return false;
  if (unit.kind === "set" || unit.kind === "seq") {
    return unit.answer.length > 0 && unit.answer.every((n) => Number.isInteger(n) && n > 0);
  }
  return Object.keys(unit.answer).length > 0;
};

/** Expand multi-question groups into individual answerable tasks, preserving their passage. */
export function historyPool(books: Book[], bookIds: number[], sections: number[]): HistoryExamQuestion[] {
  const allowedBooks = new Set(bookIds);
  const allowedSections = new Set(sections);
  const seen = new Set<string>();
  const out: HistoryExamQuestion[] = [];

  for (const book of books) {
    if (!allowedBooks.has(book.id)) continue;
    for (const section of book.sections) {
      if (!allowedSections.has(section.n)) continue;
      for (const unit of section.units) {
        const parts: Unit[] = unit.kind === "mc" || unit.kind === "num"
          ? unit.questions.map((q, i) => ({ ...unit, id: `${unit.id}-q${i}`, questions: [q] }))
          : [unit];
        for (const part of parts) {
          const id = `${book.id}:${section.n}:${part.id}`;
          if (seen.has(id) || !isValid(part)) continue;
          seen.add(id);
          out.push({ id, bookId: book.id, section: section.n, unit: part, instruction: section.instr_hy });
        }
      }
    }
  }
  return out;
}

/** Exact count or an error: never silently shorten or skip a requested exam. */
export function buildHistoryExam(books: Book[], options: HistoryExamOptions): HistoryExamQuestion[] {
  if (!Number.isSafeInteger(options.count) || options.count < 1) {
    throw new Error("Ընտրեք հարցերի վավեր քանակ։");
  }
  const available = historyPool(books, options.books, options.sections);
  if (available.length < options.count) {
    throw new Error(`Ընտրված գրքերում և բաժիններում հասանելի է միայն ${available.length} հարց։ Փոքրացրեք քանակը կամ ընտրեք ավելի շատ բաժիններ։`);
  }
  const sampled = shuffle(available).slice(0, options.count);
  if (options.order === "book") {
    const positions = new Map(available.map((q, i) => [q.id, i]));
    return sampled.sort((a, b) => (positions.get(a.id) ?? 0) - (positions.get(b.id) ?? 0));
  }
  return sampled;
}
