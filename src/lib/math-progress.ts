import { useCallback, useEffect, useState } from "react";

const KEY = "math-progress-v1";

export type ExamResult = { date: string; correct: number; total: number };
export type MathProgress = {
  /** key: `${bookId}:${chapter}:${section}:${task}:${sub}` → chosen value ("1".."4" or "T"/"F") */
  answers: Record<string, string>;
  exams: ExamResult[];
};

const EMPTY: MathProgress = { answers: {}, exams: [] };

function read(): MathProgress {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return { answers: parsed.answers ?? {}, exams: Array.isArray(parsed.exams) ? parsed.exams : [] };
  } catch {
    return EMPTY;
  }
}

function write(p: MathProgress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable (private mode / quota): progress stays for this visit only */
  }
}

export function useMathProgress() {
  const [progress, setProgress] = useState<MathProgress>(EMPTY);

  useEffect(() => {
    setProgress(read());
  }, []);

  /** Records the first answer for a sub-question; later taps on the same sub-question are ignored. */
  const setAnswer = useCallback((id: string, value: string) => {
    setProgress((prev) => {
      if (prev.answers[id] !== undefined) return prev;
      const next = { ...prev, answers: { ...prev.answers, [id]: value } };
      write(next);
      return next;
    });
  }, []);

  const addExam = useCallback((correct: number, total: number) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        exams: [{ date: new Date().toISOString(), correct, total }, ...prev.exams].slice(0, 20),
      };
      write(next);
      return next;
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

/** A task uses typed answers if any answer is not a choice/true-false label. Call per task, not for the whole section. */
export function isOpenTask(task: { answers: string[] | null }) {
  return task.answers?.some((answer) => isShortAnswer(answer)) ?? false;
}

function normalizeNumber(v: string) {
  return v
    .trim()
    .replace(/\s+/g, "")
    .replace(/[−–]/g, "-")
    .replace(",", ".")
    .replace(/%$/, "");
}

/**
 * Checks a chosen/typed value against the book's answer. Numbers are compared by value (1,5 = 1.5),
 * so a typed "2" matches an answer of "2" even though "2" is also an option label.
 */
export function isRight(answer: string, value: string) {
  const a = normalizeNumber(answer);
  const v = normalizeNumber(value);
  if (a === v) return true;

  // Multi-select statement answers (e.g. "1,3,5") are sets, not sequences.
  // Accept any order, but reject repeated selections such as "1,3,3,5".
  const answerParts = a.split(",").map((part) => part.trim());
  const valueParts = v.split(",").map((part) => part.trim());
  if (answerParts.length > 1 && valueParts.length > 1) {
    const isValidSet = (parts: string[]) =>
      parts.every((part) => part !== "") &&
      new Set(parts).size === parts.length &&
      parts.every((part) => Number.isFinite(Number(part)));
    if (isValidSet(answerParts) && isValidSet(valueParts)) {
      return answerParts.length === valueParts.length &&
        [...answerParts].sort().every((part, i) => part === [...valueParts].sort()[i]);
    }
  }

  const na = Number(a);
  const nv = Number(v);
  return a !== "" && v !== "" && !Number.isNaN(na) && !Number.isNaN(nv) && Math.abs(na - nv) < 1e-9;
}
