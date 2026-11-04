import { ALL_BOOKS, loadBook, questionAnswerKey, type Book, type Unit } from "@/lib/books";
import type { UnitAnswer } from "@/components/UnitCard";
import { loadMathBookIndex } from "@/lib/math-bank";
import { getMathMistakes, recordMathMistake } from "@/lib/mathMistakes";
import { isRight as isMathRight, isOpenTask } from "@/lib/math-progress";
import { subjectForBookId } from "@/lib/unitMistakes";

const STATE_KEY = "shtemarm:legacy-mistakes-state:v1";
export const LEGACY_MISTAKES_CHANGED = "shtemarm:legacy-mistakes-changed";
type SavedStatus = "mastered" | "removed";
type Statuses = Record<string, SavedStatus>;
export type RecoveredMistake = {
  key: string;
  id: string;
  subject: string;
  section: string;
  unit: Unit;
  chosen: UnitAnswer;
  mastered: boolean;
  updatedAt: number;
};
export type SourceBook = { bookId: number; book: Book };

function safeObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
export function readOldAnswers(key: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const data = safeObject(JSON.parse(localStorage.getItem(key) ?? "{}"));
    return Object.fromEntries(Object.entries(safeObject(data.answers))
      .filter(([id, value]) => id.length < 256 && typeof value === "string" && value.length <= 200)) as Record<string, string>;
  } catch { return {}; }
}
function statuses(): Statuses {
  if (typeof window === "undefined") return {};
  try {
    const data = safeObject(JSON.parse(localStorage.getItem(STATE_KEY) ?? "{}"));
    return Object.fromEntries(Object.entries(data).filter(([id, status]) =>
      id.length < 300 && (status === "mastered" || status === "removed"))) as Statuses;
  } catch { return {}; }
}
export function legacyMistakeStatus(key: string): SavedStatus | undefined {
  return statuses()[key];
}
function setStatus(key: string, status: SavedStatus) {
  if (typeof window === "undefined") return;
  try {
    const next = { ...statuses(), [key]: status };
    localStorage.setItem(STATE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(LEGACY_MISTAKES_CHANGED));
  } catch { /* The browser may disable local storage. */ }
}
export function markRecoveredMastered(key: string) { setStatus(key, "mastered"); }
export function removeRecoveredMistake(key: string) { setStatus(key, "removed"); }
export function ignoreRecoveredMathMistake(id: string) { setStatus("math:" + id, "removed"); }

function unanswered(unit: Unit): UnitAnswer {
  return unit.kind === "mc" || unit.kind === "num" ? { mc: {} }
    : unit.kind === "match" ? { match: {} } : { nums: [] };
}
function fingerprint(bookId: number, id: string) {
  return "book:" + bookId + ":" + id;
}
type Candidate = { legacyId: string; entry: RecoveredMistake };
/**
 * Restore questions known to have been wrong in the old progress ledger.
 * Old records store the *last result*, not the chosen answer or all attempts.
 * Do not invent that answer. Skip ambiguous IDs that refer to multiple books.
 */
export function matchHistoricalBookMistakes(
  sourceBooks: SourceBook[],
  results: Record<string, 0 | 1>,
  oldHistoryAnswers: Record<string, string> = {},
): RecoveredMistake[] {
  const wants = new Set(Object.entries(results).filter(([, value]) => value === 0).map(([key]) => key));
  const historyWants = new Set(Object.keys(oldHistoryAnswers));
  const byLegacyId = new Map<string, RecoveredMistake[]>();
  const historicalHistory = new Map<string, RecoveredMistake[]>();

  function offer(map: Map<string, RecoveredMistake[]>, legacyId: string, entry: RecoveredMistake) {
    if (!legacyId || !(map === byLegacyId ? wants : historyWants).has(legacyId)) return;
    const existing = map.get(legacyId) ?? [];
    if (!existing.some(row => row.key === entry.key)) existing.push(entry);
    map.set(legacyId, existing);
  }
  for (const { bookId, book } of sourceBooks) {
    const isHistory = bookId >= 21 && bookId <= 23;
    const subject = subjectForBookId(bookId);
    for (const section of book.sections) {
      const sectionTitle = section.title ?? section.label ?? "Բաժին " + section.n;
      for (const unit of section.units) {
        if (unit.kind === "mc" || unit.kind === "num") {
          for (let i = 0; i < unit.questions.length; i++) {
            const q = unit.questions[i];
            if (!q) continue;
            const qKey = questionAnswerKey(unit, i);
            const id = unit.id + ":" + qKey;
            let one: Unit;
            if (unit.kind === "mc") {
              const question = unit.questions[i];
              if (!question) continue;
              one = { ...unit, id, questions: [question] };
            } else {
              one = { ...unit, id, questions: [q] };
            }
            const entry: RecoveredMistake = {
              key: fingerprint(bookId, id), id, subject, section: sectionTitle,
              unit: one, chosen: unanswered(one), mastered: false, updatedAt: 0,
            };
            offer(byLegacyId, id, entry);
            // Earlier exam code used printed numbers, rather than collision-safe response keys.
            if (qKey === q.n) offer(byLegacyId, unit.id + ":" + q.n, entry);
            if (isHistory && typeof oldHistoryAnswers[id] === "string" &&
                oldHistoryAnswers[id] !== q.answer) {
              offer(historicalHistory, id, {
                ...entry, chosen: { mc: { [q.n]: oldHistoryAnswers[id]! } },
              });
            }
          }
        } else {
          const entry: RecoveredMistake = {
            key: fingerprint(bookId, unit.id), id: unit.id, subject,
            section: sectionTitle, unit, chosen: unanswered(unit), mastered: false, updatedAt: 0,
          };
          offer(byLegacyId, unit.id, entry);
        }
      }
    }
  }
  const unique = new Map<string, RecoveredMistake>();
  for (const candidates of byLegacyId.values()) {
    if (candidates.length === 1) unique.set(candidates[0]!.key, candidates[0]!);
  }
  for (const candidates of historicalHistory.values()) {
    if (candidates.length === 1) unique.set(candidates[0]!.key, candidates[0]!);
  }
  const saved = statuses();
  return [...unique.values()].filter(entry => saved[entry.key] !== "removed")
    .map(entry => ({ ...entry, mastered: saved[entry.key] === "mastered" }));
}

/** Load only when older wrong results exist; cache lives in loadBook for this page session. */
export async function recoverHistoricalBookMistakes(
  results: Record<string, 0 | 1>,
): Promise<{ entries: RecoveredMistake[]; unavailable: number }> {
  const oldHistoryAnswers = readOldAnswers("history-progress-v1");
  if (!Object.values(results).some(value => value === 0) && !Object.keys(oldHistoryAnswers).length)
    return { entries: [], unavailable: 0 };
  const sourceBooks: SourceBook[] = [];
  let unavailable = 0;
  // Loading in batches prevents dozens of large question-bank requests on mobile.
  for (let i = 0; i < ALL_BOOKS.length; i += 4) {
    const group = ALL_BOOKS.slice(i, i + 4);
    const loaded = await Promise.allSettled(group.map(async item => ({
      bookId: item.id, book: await loadBook(item.id),
    })));
    loaded.forEach(result => {
      if (result.status === "fulfilled") sourceBooks.push(result.value);
      else unavailable++;
    });
  }
  return { entries: matchHistoricalBookMistakes(sourceBooks, results, oldHistoryAnswers), unavailable };
}

/** Earlier math practice preserved the chosen answer, but not a notebook item.
 * Promote only verifiably wrong, fully answer-keyed subquestions.
 */
export async function recoverHistoricalMathMistakes(): Promise<number> {
  const old = readOldAnswers("math-progress-v1");
  if (!Object.keys(old).length) return 0;
  const index = await loadMathBookIndex();
  const saved = statuses();
  const existing = new Set(getMathMistakes().map(item => item.id));
  let restored = 0;
  for (const [bookId, book] of Object.entries(index.books)) {
    if (bookId !== "matem-1" && bookId !== "matem-2") continue;
    for (const section of book.sections) for (const task of section.tasks) {
      const total = task.answers?.length ?? 0;
      for (let i = 0; i < total; i++) {
        const id = [bookId, section.chapter, section.section, task.task, i + 1].join(":");
        const chosen = old[id], correct = task.answers?.[i];
        if (!chosen?.trim() || !correct?.trim() || existing.has(id) ||
            saved["math:" + id] === "removed" || isMathRight(correct, chosen)) continue;
        const q = task.questions?.[i];
        const kind = isOpenTask(task) ? "open" : correct === "T" || correct === "F" ? "tf" : "choice";
        recordMathMistake({
          id, book: bookId, chapter: section.chapter, section: section.section,
          task: task.task, sub: i + 1, kind, chosen, correct,
          ...(q?.prompt ? { prompt: q.prompt } : {}),
          ...(q?.options ? { options: q.options } : {}),
        });
        existing.add(id);
        restored++;
      }
    }
  }
  return restored;
}
