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
