import type { Progress } from "@/lib/progress";
import { level, levelFloor } from "@/lib/progress";

/** XP is activity, not a claim of mastery. Last recorded answers are a limited signal. */
export function learningLevel(progress: Pick<Progress, "xp" | "answers">) {
  const xp = Math.max(0, Number.isFinite(progress.xp) ? progress.xp : 0);
  const current = level(xp);
  const start = levelFloor(current);
  const next = levelFloor(current + 1);
  const values = Object.values(progress.answers);
  const correct = values.filter(v => v === 1).length;
  const answered = values.length;
  return {
    level: current,
    xp,
    nextLevelXp: next,
    xpProgress: next > start ? Math.min(100, Math.max(0, Math.round((xp - start) / (next - start) * 100))) : 0,
    answered,
    correct,
    accuracy: answered ? Math.round(correct / answered * 100) : null,
    // A last-answer accuracy is not verified mastery or per-subject competence.
    mastery: "not-assessed" as const,
  };
}

/** Only explicit, validated subject metadata can be used for subject levels.
 * Do not guess subjects from legacy question IDs. */
export function subjectLearningLevel(progress: Pick<Progress, "answers">, questionIds: readonly string[]) {
  const unique = new Set(questionIds.filter(id => typeof id === "string" && id.length > 0));
  const answers = [...unique].map(id => progress.answers[id]).filter((v): v is 0 | 1 => v === 0 || v === 1);
  const correct = answers.filter(v => v === 1).length;
  return { answered: answers.length, correct, accuracy: answers.length ? Math.round(correct / answers.length * 100) : null, mastery: "not-assessed" as const };
}
