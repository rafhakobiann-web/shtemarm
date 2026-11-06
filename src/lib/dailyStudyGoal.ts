import { localDay, weekStart, type QuestHistory } from "@/lib/gamification";

const KEY = "shtemarm:daily-study-goal:v1";
export const DAILY_GOAL_CHANGED = "shtemarm:daily-goal-changed";
export type DailyGoalSettings = { answers: number; reviews: number };
export const DEFAULT_DAILY_GOAL: DailyGoalSettings = { answers: 10, reviews: 3 };

export function normalizeDailyGoal(value: unknown): DailyGoalSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...DEFAULT_DAILY_GOAL };
  const v = value as Record<string, unknown>;
  const valid = (n: unknown, fallback: number, max: number) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= max ? n : fallback;
  const answers = valid(v.answers, DEFAULT_DAILY_GOAL.answers, 100);
  const reviews = valid(v.reviews, DEFAULT_DAILY_GOAL.reviews, 30);
  return answers + reviews > 0 ? {answers,reviews} : { ...DEFAULT_DAILY_GOAL };
}

export function getDailyGoal(): DailyGoalSettings {
  if (typeof window === "undefined") return { ...DEFAULT_DAILY_GOAL };
  try { return normalizeDailyGoal(JSON.parse(localStorage.getItem(KEY) ?? "null")); }
  catch { return { ...DEFAULT_DAILY_GOAL }; }
}
export function setDailyGoal(settings: DailyGoalSettings): DailyGoalSettings {
  const normalized = normalizeDailyGoal(settings);
  if (typeof window !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(normalized)); } catch { /* local storage may be blocked */ }
    window.dispatchEvent(new Event(DAILY_GOAL_CHANGED));
  }
  return normalized;
}
export function dailyGoalProgress(history: QuestHistory, settings: DailyGoalSettings, day = localDay()) {
  const goal = normalizeDailyGoal(settings);
  const entry = history[day] ?? {answered:[],reviewed:[]};
  const answered = new Set(entry.answered).size;
  const reviewed = new Set(entry.reviewed).size;
  const completed = Math.min(answered,goal.answers) + Math.min(reviewed,goal.reviews);
  const total = goal.answers + goal.reviews;
  return {answered,reviewed,goal,completed,total,percent:Math.round(100*completed/total),done:completed>=total};
}
/** The suggestion is optional and never changes a student's saved goal. */
export function suggestDailyGoal(history: QuestHistory, day = localDay()): DailyGoalSettings {
  const prior = Object.entries(history).filter(([date]) => date < day).sort(([a],[b])=>b.localeCompare(a)).slice(0,7);
  if (!prior.length) return { ...DEFAULT_DAILY_GOAL };
  const avg = prior.reduce((sum,[,entry])=>sum+new Set(entry.answered).size,0)/prior.length;
  const reviews = prior.reduce((sum,[,entry])=>sum+new Set(entry.reviewed).size,0)/prior.length;
  return {answers:Math.min(30,Math.max(5,Math.round(avg))),reviews:Math.min(10,Math.max(1,Math.round(reviews)))};
}
export function weeklyGoalSummary(history: QuestHistory, settings: DailyGoalSettings, now = new Date()) {
  const start = weekStart(now);
  const end = localDay(now);
  const days = Object.keys(history).filter(date => date >= start && date <= end);
  const completedDays = days.filter(date => dailyGoalProgress(history,settings,date).done).length;
  const answered = days.reduce((sum,date)=>sum+new Set(history[date].answered).size,0);
  const reviewed = days.reduce((sum,date)=>sum+new Set(history[date].reviewed).size,0);
  return {completedDays,answered,reviewed,activeDays:days.length};
}
