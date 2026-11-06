import type { Progress } from "@/lib/progress";

/** Cheap, pure progress summary for the Dashboard's first paint. */
export function progressSummary(progress: Progress) {
  const answers = Object.values(progress.answers);
  const correct = answers.filter(value => value === 1).length;
  const review = answers.filter(value => value === 0).length;
  return {
    answered: answers.length, correct, review,
    accuracy: answers.length ? Math.round(correct * 100 / answers.length) : null,
    recentExam: progress.exams.at(-1) ?? null,
  };
}
