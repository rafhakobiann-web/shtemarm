import type { Progress } from "@/lib/progress";
import type { OnboardingSubject } from "@/lib/onboarding";

export type LearningPathStep = {
  id: "review" | "practice" | "exam" | "choose";
  subject: OnboardingSubject | null;
  reason: "saved-mistakes" | "student-choice" | "exam-goal" | "choose-subject";
};

/** Deterministic fallback: no AI calls, invented mastery scores, or guessed question subjects. */
export function recommendLearningPath(
  subjects: readonly OnboardingSubject[],
  progress: Pick<Progress, "answers" | "exams">,
  savedMistakes: readonly { subject: string; mastered?: boolean }[],
): LearningPathStep[] {
  const chosen = [...new Set(subjects)];
  const outstanding = savedMistakes.filter(m => !m.mastered && chosen.includes(m.subject as OnboardingSubject));
  const counts = new Map<OnboardingSubject, number>();
  for (const mistake of outstanding) {
    const subject = mistake.subject as OnboardingSubject;
    counts.set(subject, (counts.get(subject) ?? 0) + 1);
  }
  const priority = [...chosen].sort((a,b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));
  const result: LearningPathStep[] = [];
  if (outstanding.length > 0) result.push({id:"review",subject:priority[0] ?? null,reason:"saved-mistakes"});
  if (chosen.length > 0) {
    result.push({id:"practice",subject:chosen[0],reason:"student-choice"});
    if (progress.exams.length > 0) result.push({id:"exam",subject:chosen[0],reason:"exam-goal"});
  } else {
    result.push({id:"choose",subject:null,reason:"choose-subject"});
  }
  return result;
}
