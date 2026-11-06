import type { Progress } from "@/lib/progress";
import { getMistakes } from "@/lib/mistakeNotebook";
import { getMathMistakes } from "@/lib/mathMistakes";
import { getUnitMistakes } from "@/lib/unitMistakes";

export type DailyQuest = {
  id: "answer-5" | "answer-15" | "review-3";
  goal: number;
  count: number;
};
export type Achievement = {
  id: "first-steps" | "fifty-questions" | "hundred-questions" | "five-hundred-xp" | "week-streak";
  unlocked: boolean;
};
const KEY = "shtemarm:daily-quest-history:v1";
export type QuestHistory = Record<string, { answered: string[]; reviewed: string[] }>;
export const QUESTS_CHANGED = "shtemarm:quests-changed";

export function localDay(date = new Date()): string {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
}
export function parseQuestHistory(raw: string | null): QuestHistory {
  try {
    const value: unknown = JSON.parse(raw ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([date, entry]) =>
      /^\d{4}-\d{2}-\d{2}$/.test(date) && !!entry && typeof entry === "object" &&
      Array.isArray((entry as {answered?:unknown}).answered) && Array.isArray((entry as {reviewed?:unknown}).reviewed)
    ).slice(-31).map(([date, entry]) => {
      const e = entry as {answered:unknown[]; reviewed:unknown[]};
      const safe = (items:unknown[]) => [...new Set(items.filter((x):x is string => typeof x === "string" && x.length <= 256))].slice(-500);
      return [date, {answered:safe(e.answered), reviewed:safe(e.reviewed)}];
    })) as QuestHistory;
  } catch { return {}; }
}
export function getQuestHistory(): QuestHistory {
  if (typeof window === "undefined") return {};
  try { return parseQuestHistory(localStorage.getItem(KEY)); } catch { return {}; }
}
export function recordQuestActivity(id: string, kind: "answered" | "reviewed", day = localDay()) {
  if (typeof window === "undefined" || !id || id.length > 256) return;
  try {
    const history = getQuestHistory();
    const entry = history[day] ?? { answered: [], reviewed: [] };
    if (entry[kind].includes(id)) return;
    entry[kind] = [...entry[kind], id].slice(-500);
    history[day] = entry;
    const dates = Object.keys(history).sort().slice(-31);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(dates.map(date => [date,history[date]]))));
    window.dispatchEvent(new Event(QUESTS_CHANGED));
  } catch { /* private browsing or storage limits must not interrupt studying */ }
}
export function dailyQuests(history: QuestHistory, day = localDay()): DailyQuest[] {
  const entry = history[day] ?? {answered:[],reviewed:[]};
  return [
    {id:"answer-5",goal:5,count:Math.min(5,entry.answered.length)},
    {id:"answer-15",goal:15,count:Math.min(15,entry.answered.length)},
    {id:"review-3",goal:3,count:Math.min(3,entry.reviewed.length)},
  ];
}
export type WeeklyChallenge = { id: "answer-20" | "answer-50" | "review-10"; goal: number; count: number; selected: boolean };
const WEEKLY_KEY = "shtemarm:weekly-challenge-selection:v1";
export function weekStart(day = new Date()): string {
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return localDay(d);
}
export function getWeeklySelections(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(WEEKLY_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((v): v is string => ["answer-20","answer-50","review-10"].includes(v)).slice(0, 3) : [];
  } catch { return []; }
}
export function setWeeklySelections(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WEEKLY_KEY, JSON.stringify([...new Set(ids.filter(id => ["answer-20","answer-50","review-10"].includes(id)))].slice(0, 3)));
    window.dispatchEvent(new Event(QUESTS_CHANGED));
  } catch { /* storage may be disabled */ }
}
export function weeklyChallenges(history: QuestHistory, selected: readonly string[], now = new Date()): WeeklyChallenge[] {
  const start = weekStart(now);
  const dates = Object.entries(history).filter(([date]) => date >= start && date <= localDay(now));
  const answered = new Set(dates.flatMap(([,entry]) => entry.answered));
  const reviewed = new Set(dates.flatMap(([,entry]) => entry.reviewed));
  return [
    {id:"answer-20",goal:20,count:Math.min(20,answered.size),selected:selected.includes("answer-20")},
    {id:"answer-50",goal:50,count:Math.min(50,answered.size),selected:selected.includes("answer-50")},
    {id:"review-10",goal:10,count:Math.min(10,reviewed.size),selected:selected.includes("review-10")},
  ];
}
export function achievements(progress: Pick<Progress,"answers" | "xp" | "streak">): Achievement[] {
  const total = Object.keys(progress.answers).length;
  return [
    {id:"first-steps",unlocked:total >= 1},
    {id:"fifty-questions",unlocked:total >= 50},
    {id:"hundred-questions",unlocked:total >= 100},
    {id:"five-hundred-xp",unlocked:progress.xp >= 500},
    {id:"week-streak",unlocked:progress.streak >= 7},
  ];
}
export function pendingMistakeCount() {
  if (typeof window === "undefined") return 0;
  return getMistakes().filter(m => !m.mastered).length +
    getMathMistakes().filter(m => !m.mastered).length +
    getUnitMistakes().filter(m => !m.mastered).length;
}
