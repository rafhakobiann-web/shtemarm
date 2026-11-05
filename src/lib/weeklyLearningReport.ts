import { localDay, weekStart, type QuestHistory } from "@/lib/gamification";
import type { UnitMistake } from "@/lib/unitMistakes";
import type { OnboardingSubject } from "@/lib/onboarding";

export type WeeklyReport = {
  start: string; end: string; answered: number; reviewed: number; activeDays: number;
  daily: { day: string; answered: number; reviewed: number }[];
  subjects: { subject: OnboardingSubject; pending: number }[];
  suggestions: { subject: OnboardingSubject; pending: number }[];
};

/** Device-local activity only. No inferred per-subject accuracy, XP history or mastery. */
export function weeklyLearningReport(
  history: QuestHistory,
  mistakes: readonly Pick<UnitMistake, "subject" | "mastered">[],
  selected: readonly OnboardingSubject[],
  now = new Date(),
): WeeklyReport {
  const start = weekStart(now);
  const end = localDay(now);
  const daily: WeeklyReport["daily"] = [];
  const cursor = new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  cursor.setDate(cursor.getDate() - ((cursor.getDay()+6)%7));
  for (let n=0;n<7;n++) {
    const day=localDay(cursor);
    if (day>end) break;
    const entry=history[day] ?? {answered:[],reviewed:[]};
    daily.push({day,answered:new Set(entry.answered).size,reviewed:new Set(entry.reviewed).size});
    cursor.setDate(cursor.getDate()+1);
  }
  const subjects=[...new Set(selected)].map(subject=>({
    subject,pending:mistakes.filter(m=>m.subject===subject && !m.mastered).length,
  })).sort((a,b)=>b.pending-a.pending);
  return {
    start,end,daily,
    answered:daily.reduce((n,d)=>n+d.answered,0),
    reviewed:daily.reduce((n,d)=>n+d.reviewed,0),
    activeDays:daily.filter(d=>d.answered+d.reviewed>0).length,
    subjects,
    suggestions:subjects.filter(s=>s.pending>0).slice(0,3),
  };
}
