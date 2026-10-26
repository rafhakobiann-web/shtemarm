import { useCallback, useEffect, useState } from "react";

const KEY = "history-progress-v1";

export type ExamResult = { date: string; correct: number; total: number };
export type HistoryProgress = {
  /** key: `${bookId}:${chapter}:${section}:${task}:${sub}` → chosen value ("1".."4" or "T"/"F") */
  answers: Record<string, string>;
  exams: ExamResult[];
};

const EMPTY: HistoryProgress = { answers: {}, exams: [] };
let memory = EMPTY;
const UPDATED = "history-progress-updated";

function read(): HistoryProgress {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    if (!raw) return memory;
    const parsed = JSON.parse(raw);
    return {
      answers: parsed.answers ?? {},
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
    };
  } catch {
    return memory;
  }
}

function write(p: HistoryProgress) {
  memory = p;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable (private mode / quota): progress stays for this visit only */
  }
  window.dispatchEvent(new Event(UPDATED));
}

export function useHistoryProgress() {
  const [progress, setProgress] = useState<HistoryProgress>(EMPTY);

  useEffect(() => {
    const refresh = () => setProgress(read());
    const sync = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) {
        memory = EMPTY;
        refresh();
      }
    };
    refresh();
    window.addEventListener(UPDATED, refresh);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(UPDATED, refresh);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setAnswer = useCallback((id: string, value: string) => {
    const prev = read();
    if (prev.answers[id] !== undefined) return;
    write({ ...prev, answers: { ...prev.answers, [id]: value } });
  }, []);

  const addExam = useCallback((correct: number, total: number) => {
    const prev = read();
    write({
      ...prev,
      exams: [{ date: new Date().toISOString(), correct, total }, ...prev.exams].slice(0, 20),
    });
  }, []);

  return { progress, setAnswer, addExam };
}

/** Option answers: "1".."4" (choice), "T"/"F" (true/false). Anything else is a short answer. */
export function isOptionAnswer(answer: string) {
  return answer === "T" || answer === "F" || ["1", "2", "3", "4"].includes(answer);
}

export function isShortAnswer(answer: string) {
  return !isOptionAnswer(answer);
}

/** A section is typed-answer if any of its answers is not an option label; such sections never show choice buttons. */
export function isOpenSection(tasks: { answers: string[] | null }[]) {
  return tasks.some((t) => t.answers?.some((a) => isShortAnswer(a)) ?? false);
}

function normalizeNumber(v: string) {
  return v.trim().replace(/\s+/g, "").replace(/[−–]/g, "-").replace(",", ".").replace(/%$/, "");
}

/**
 * Checks a chosen/typed value against the book's answer. Numbers are compared by value (1,5 = 1.5),
 * so a typed "2" matches an answer of "2" even though "2" is also an option label.
 */
export function isRight(answer: string, value: string) {
  const a = normalizeNumber(answer);
  const v = normalizeNumber(value);
  if (a === v) return true;
  const na = Number(a);
  const nv = Number(v);
  return a !== "" && v !== "" && !Number.isNaN(na) && !Number.isNaN(nv) && Math.abs(na - nv) < 1e-9;
}
