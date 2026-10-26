import { useQuery } from "@tanstack/react-query";

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

export function useMathBookIndex() {
  return useQuery({
    queryKey: ["math-books-index", "complete-text-v1"],
    queryFn: async (): Promise<MathBookIndex> => {
      const [indexResponse, textResponse] = await Promise.all([
        fetch("/data/math-books-index.json", { signal: AbortSignal.timeout(20000) }),
        fetch("/data/math-text-questions.json", { signal: AbortSignal.timeout(20000) }),
      ]);
      if (!indexResponse.ok || !textResponse.ok) throw new Error("Math question bank could not be loaded");
      const index: MathBookIndex = await indexResponse.json();
      mergeMathQuestions(index, await textResponse.json());
      return index;
    },
    staleTime: Infinity,
  });
}
