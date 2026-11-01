import { useQuery } from "@tanstack/react-query";
import { fetchBookResponse } from "@/lib/fetch-book-response";

export type MathTranscriptionRef = { book: string; section: string; task: number; sub: number };
export type MathQuestion = { prompt: string; options: string[]; transcription?: MathTranscriptionRef | undefined };
export type MathSegment = { page: number; y0: number; y1: number };
export type MathBookTask = {
  task: number; segments: MathSegment[]; answers: string[] | null; sub_count: number;
  answer_type?: "choice" | "open" | "tf";
  sub_segments?: MathSegment[][]; questions?: (MathQuestion | null)[];
};
export type MathBookSection = { chapter: number; section: number; title: string; pages: [number, number]; tasks: MathBookTask[] };
export type MathBookIndex = { books: Record<string, { title: string; sections: MathBookSection[] }> };
type TextBank = Record<string, Record<string, Record<string, (MathQuestion | null)[]>>>;

export function mergeMathQuestions(index: MathBookIndex, bank: TextBank) {
  for (const [bookId, sections] of Object.entries(bank)) {
    for (const [key, tasks] of Object.entries(sections)) {
      const target = index.books[bookId]?.sections.find(s => `${s.chapter}-${s.section}` === key);
      if (!target) continue;
      for (const task of target.tasks) {
        const rows = tasks[String(task.task)];
        if (rows) task.questions = Array.from({ length: task.sub_count }, (_, i) => rows[i] ?? task.questions?.[i] ?? null);
      }
    }
  }
  return index;
}

/** The request deadline covers both response headers and the complete JSON body. */
async function readMathJson<T>(url: string): Promise<T> {
  return fetchBookResponse(url, async (response) => {
    if (!response.ok) throw new Error(`Math question bank HTTP ${response.status}: ${url}`);
    const mime = response.headers.get("content-type") ?? "";
    if (mime && !/json|text\/plain|octet-stream/i.test(mime)) {
      throw new Error(`Math question bank returned ${mime} instead of JSON: ${url}`);
    }
    return response.json() as Promise<T>;
  });
}

export async function loadMathBookIndex(): Promise<MathBookIndex> {
  const [index, bank] = await Promise.all([
    readMathJson<MathBookIndex>("/data/math-books-index.json"),
    readMathJson<TextBank>("/data/math-text-questions.json"),
  ]);
  if (!index || typeof index !== "object" || !index.books || typeof index.books !== "object" ||
      !bank || typeof bank !== "object") {
    throw new Error("Math question bank has an invalid data structure");
  }
  mergeMathQuestions(index, bank);
  return index;
}

export function useMathBookIndex() {
  return useQuery({
    queryKey: ["math-books-index", "complete-text-v2"],
    queryFn: loadMathBookIndex,
    staleTime: Infinity,
  });
}
