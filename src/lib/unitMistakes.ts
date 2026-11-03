import { recordQuestActivity } from "@/lib/gamification";
import { questionAnswerKey, type Unit } from "@/lib/books";
import type { UnitAnswer } from "@/components/UnitCard";

const STORAGE_KEY = "shtemarm:unit-mistakes:v1";
export const UNIT_MISTAKES_CHANGED = "shtemarm:unit-mistakes-changed";

export type UnitMistake = {
  id: string;
  subject: string;
  section: string;
  unit: Unit;
  chosen: UnitAnswer;
  attempts: number;
  updatedAt: number;
  mastered: boolean;
};

/** Separate store from the existing math/level-test notebooks to preserve all previous mistakes. */
export function getUnitMistakes(): UnitMistake[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is UnitMistake =>
      !!entry && typeof entry === "object" && typeof entry.id === "string" &&
      typeof entry.subject === "string" && typeof entry.section === "string" &&
      !!entry.unit && typeof entry.unit === "object" &&
      typeof entry.unit.id === "string" && typeof entry.unit.kind === "string" &&
      !!entry.chosen && typeof entry.chosen === "object");
  } catch {
    return [];
  }
}

function save(entries: UnitMistake[]) {
  if (typeof window === "undefined") return;
  try {
    // Bound device storage. Most-recent mistakes are kept first.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 300)));
    window.dispatchEvent(new Event(UNIT_MISTAKES_CHANGED));
  } catch {
    // Storage can be full or disabled. Never interrupt an exam.
  }
}

function sameNumbers(a: number[], b: number[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isUnitRetryCorrect(unit: Unit, answer: UnitAnswer | undefined): boolean {
  if (!answer) return false;
  if (unit.kind === "mc") {
    return unit.questions.every((q, i) => answer.mc?.[questionAnswerKey(unit, i)] === q.answer);
  }
  if (unit.kind === "num") {
    return unit.questions.every((q, i) =>
      (answer.mc?.[questionAnswerKey(unit, i)] ?? "").replace(/\s/g, "") === q.answer.replace(/\s/g, ""));
  }
  if (unit.kind === "match") {
    return Object.entries(unit.answer).every(([key, value]) => answer.match?.[key] === value);
  }
  if (unit.kind === "seq") {
    return sameNumbers(answer.nums ?? [], unit.answer);
  }
  const given = (answer.nums ?? []).filter((v): v is number => v != null).sort((a, b) => a - b);
  return (answer.none === true && given.length === 0 || given.length > 0 && answer.none !== true)
    && sameNumbers(given, [...unit.answer].sort((a, b) => a - b));
}

type Candidate = Pick<UnitMistake, "id" | "subject" | "section" | "unit" | "chosen">;

/**
 * Record only answered, incorrectly solved source questions (never unanswered skips).
 * Split multi-question MC/numeric units so every missed question is reviewed separately.
 * Previously missed questions answered correctly in a subsequent exam become mastered.
 */
export function recordUnitMistakes(subject: string, units: Unit[], answers: Record<string, UnitAnswer>) {
  if (typeof window === "undefined") return;
  const previous = getUnitMistakes();
  const byKey = new Map(previous.map(item => [item.subject + ":" + item.id, item]));
  let changed = false;
  const now = Date.now();

  function consider(item: Candidate) {
    const key = item.subject + ":" + item.id;
    const old = byKey.get(key);
    const correct = isUnitRetryCorrect(item.unit, item.chosen);
    if (correct) {
      if (old && !old.mastered) {
        byKey.set(key, { ...old, mastered: true });
        changed = true;
      }
    } else {
      byKey.set(key, { ...item, attempts: (old?.attempts ?? 0) + 1, updatedAt: now, mastered: false });
      changed = true;
    }
  }

  for (const unit of units) {
    const answer = answers[unit.id];
    if (!answer) continue;
    if (unit.kind === "mc" || unit.kind === "num") {
      for (let i = 0; i < unit.questions.length; i++) {
        const question = unit.questions[i]!;
        const key = questionAnswerKey(unit, i);
        const chosen = answer.mc?.[key];
        if (!chosen?.trim() || !question.answer?.trim()) continue;
        const id = unit.id + ":" + key;
        // Use the original printed number in the single-question snapshot.
        const one: Unit = unit.kind === "mc"
          ? { ...unit, id, questions: [unit.questions[i]!] }
          : { ...unit, id, questions: [unit.questions[i]!] };
        consider({ id, subject, section: unit.label, unit: one, chosen: { mc: { [question.n]: chosen } } });
      }
    } else {
      const hasAnswer = unit.kind === "match"
        ? Object.keys(answer.match ?? {}).length > 0
        : answer.none === true || (answer.nums ?? []).some(n => n != null);
      if (hasAnswer) consider({ id: unit.id, subject, section: unit.label, unit, chosen: answer });
    }
  }
  if (changed) {
    save([...byKey.values()].sort((a, b) => b.updatedAt - a.updatedAt));
  }
}

export function markUnitMistakeMastered(id: string, subject: string, answer: UnitAnswer): boolean {
  const entries = getUnitMistakes();
  const found = entries.find(entry => entry.id === id && entry.subject === subject);
  if (!found || !isUnitRetryCorrect(found.unit, answer)) return false;
  save(entries.map(entry => entry.id === id && entry.subject === subject
    ? { ...entry, mastered: true } : entry));
  if (!found.mastered) recordQuestActivity(subject + ":" + id, "reviewed");
  return true;
}

export function removeUnitMistake(id: string, subject: string) {
  save(getUnitMistakes().filter(entry => entry.id !== id || entry.subject !== subject));
}

/** Stable subject IDs across translations and the different textbook routes. */
export function subjectForBookId(bookId: number | string): string {
  const id = Number(bookId);
  if ([1, 2, 3].includes(id)) return "english";
  if (id >= 21 && id <= 23) return "history";
  if (id >= 31 && id <= 34) return "biology";
  if (id >= 41 && id <= 44) return "armenian";
  if (id === 51 || (id >= 61 && id <= 64)) return "physics";
  if (id === 52) return "chemistry";
  if (id === 53) return "geography";
  if (id === 54) return "russian";
  return "book-" + String(bookId);
}
