import type { Progress } from "@/lib/progress";

export const STUDY_PLAN_SUBJECTS = ["english", "math", "armenian", "history", "biology", "physics", "chemistry", "geography", "russian"] as const;
export type StudyPlanSubject = typeof STUDY_PLAN_SUBJECTS[number];
export type StudyPlanTask = {
  id: string; subject: StudyPlanSubject; kind: "mistakes" | "practice";
  count: number; priority: number; reason: "mistakes" | "weak" | "start" | "continue";
};
export type PlanMistake = { id: string; subject: string; section: string; mastered: boolean };
const SUBJECT_BOOKS: Record<StudyPlanSubject, number[]> = {
  english: [1,2,3], math: [], armenian: [41,42,43,44], history: [21,22,23],
  biology: [31,32,33,34], physics: [51,61,62,63,64], chemistry: [52], geography: [53], russian: [54],
};
const BOOK_PREFIXES = new Map<number, StudyPlanSubject>(
  Object.entries(SUBJECT_BOOKS).flatMap(([subject, ids]) => ids.map(id => [id, subject as StudyPlanSubject] as const)),
);
export function normalizePlanSubject(value: string): StudyPlanSubject | undefined {
  const lower = value.trim().toLowerCase();
  if ((STUDY_PLAN_SUBJECTS as readonly string[]).includes(lower)) return lower as StudyPlanSubject;
  if (lower === "mathematics") return "math";
  if (lower === "armenian-language") return "armenian";
  return undefined;
}
export function subjectForProgressId(id: string): StudyPlanSubject | undefined {
  const math = /^matem-[12]:/.test(id);
  if (math) return "math";
  const sourceBook = /^book-(\d+):/.exec(id);
  if (sourceBook) {
    const number = Number(sourceBook[1]);
    // History book-1/2/3 IDs are ambiguous with English: do not guess.
    if (number >= 21) return BOOK_PREFIXES.get(number);
    return undefined;
  }
  const start = /^(\d+)-/.exec(id);
  if (start) {
    const n = Number(start[1]);
    if (n >= 21) return BOOK_PREFIXES.get(n);
    // Earlier English and Biology shared numeric unit IDs; do not guess.
  }
  if (/^bio[34]:/.test(id)) return "biology";
  if (/^physics-/.test(id)) return "physics";
  return undefined;
}
export function buildStudyPlan(
  progress: Pick<Progress, "answers">,
  mistakes: PlanMistake[],
  subjects: StudyPlanSubject[],
  dailyMinutes: number,
): StudyPlanTask[] {
  const selected = [...new Set(subjects.filter(s => STUDY_PLAN_SUBJECTS.includes(s)))];
  const minutes = Number.isFinite(dailyMinutes) ? Math.max(10, Math.min(120, dailyMinutes)) : 25;
  const limit = minutes < 25 ? 1 : minutes < 50 ? 2 : 3;
  const countBySubject = new Map<StudyPlanSubject, number>();
  for (const m of mistakes) {
    if (m.mastered) continue;
    const subject = normalizePlanSubject(m.subject);
    if (subject && selected.includes(subject))
      countBySubject.set(subject, (countBySubject.get(subject) ?? 0) + 1);
  }
  const progressBySubject = new Map<StudyPlanSubject, { correct: number; wrong: number }>();
  for (const [id, result] of Object.entries(progress.answers)) {
    const subject = subjectForProgressId(id);
    if (!subject || !selected.includes(subject)) continue;
    const counts = progressBySubject.get(subject) ?? { correct: 0, wrong: 0 };
    if (result === 0) counts.wrong++;
    if (result === 1) counts.correct++;
    progressBySubject.set(subject, counts);
  }
  const options = selected.flatMap(subject => {
    const wrong = countBySubject.get(subject) ?? 0;
    const attempts = progressBySubject.get(subject);
    const answered = (attempts?.correct ?? 0) + (attempts?.wrong ?? 0);
    const errorRate = answered ? (attempts?.wrong ?? 0) / answered : 0;
    const tasks: StudyPlanTask[] = [];
    if (wrong) tasks.push({
      id: subject + ":mistakes", subject, kind: "mistakes",
      count: Math.min(wrong, minutes < 25 ? 5 : 12),
      priority: 100 + Math.min(wrong, 30) + errorRate * 20,
      reason: "mistakes",
    });
    tasks.push({
      id: subject + ":practice", subject, kind: "practice",
      count: minutes < 25 ? 5 : 10,
      priority: (answered ? 25 : 45) + errorRate * 35 + Math.min(attempts?.wrong ?? 0, 15),
      reason: answered ? (errorRate >= .4 ? "weak" : "continue") : "start",
    });
    return tasks;
  });
  const result: StudyPlanTask[] = [];
  const used = new Set<StudyPlanSubject>();
  for (const task of options.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))) {
    if (result.length >= limit) break;
    if (used.has(task.subject)) continue;
    result.push(task);
    used.add(task.subject);
  }
  return result;
}
