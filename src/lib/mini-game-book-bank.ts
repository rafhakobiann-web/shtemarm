import { useEffect, useMemo, useState } from "react";
import { QUICK_QUIZ_ITEMS, type GameSubject, type GameSubjectId, type QuizItem } from "./mini-game-data";

/** Only self-contained, answered four-option questions are suitable for a quick game. */
const SOURCES: Partial<Record<GameSubject, string[]>> = {
  english: ["book1.json", "book2.json", "book3.json"],
  armenian: ["armenian-book1.json"],
  biology: ["bio-book1.json", "bio-book2.json"],
  history: ["history-book1.json", "history-book2.json", "history-book3.json"],
  physics: ["physics-book1.json", "physics-book2.json", "physics-original-book1.json", "physics-original-book2.json"],
  chemistry: ["original-chemistry.json"],
  russian: ["original-russian.json"],
  math: [],
};
const files = [...new Set(Object.values(SOURCES).flat())];
const subjects = Object.entries(SOURCES) as [GameSubject, string[]][];
const validText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
function extract(data: unknown, filename: string): QuizItem[] {
  if (!data || typeof data !== "object" || !("sections" in data) || !Array.isArray(data.sections)) return [];
  const subject = subjects.find(([, paths]) => paths.includes(filename))?.[0];
  if (!subject) return [];
  const result: QuizItem[] = [];
  for (const section of data.sections) {
    if (!section || !Array.isArray(section.units)) continue;
    for (const unit of section.units) {
      if (unit?.kind !== "mc" || !Array.isArray(unit.questions)) continue;
      // Passage-dependent and illustrated exercises cannot be answered in isolation.
      if (validText(unit.passage) || unit.image || unit.diagram) continue;
      for (const question of unit.questions) {
        const options = question?.options;
        if (!options || typeof options !== "object" || !validText(question.stem)) continue;
        const keys = ["1", "2", "3", "4"];
        if (!keys.every(key => validText(options[key]))) continue;
        const answerKey = String(question.answer ?? "");
        if (!keys.includes(answerKey)) continue;
        const choices = keys.map(key => options[key].trim()) as [string, string, string, string];
        if (new Set(choices).size !== 4 || question.image || question.diagram || question.figure) continue;
        result.push({
          id: "book:" + filename + ":" + section.n + ":" + unit.id + ":" + question.n,
          subject, prompt: question.stem.trim(), choices,
          answer: options[answerKey].trim(),
          explanation: validText(question.explanation) ? question.explanation.trim() : "",
        });
      }
    }
  }
  return result;
}
let cached: QuizItem[] | null = null;
let pending: Promise<QuizItem[]> | null = null;
async function load(): Promise<QuizItem[]> {
  if (cached) return cached;
  if (!pending) pending = Promise.all(files.map(async filename => {
    try {
      const response = await fetch("/data/" + filename);
      if (!response.ok) return [];
      return extract(await response.json(), filename);
    } catch { return []; }
  })).then(groups => {
    const seen = new Set<string>();
    cached = [...QUICK_QUIZ_ITEMS, ...groups.flat()].filter(q => {
      if (seen.has(q.id)) return false;
      seen.add(q.id); return true;
    });
    return cached;
  }).finally(() => { pending = null; });
  return pending;
}
export function useMiniGameQuestionBank(subject: GameSubjectId): { questions: QuizItem[]; loading: boolean; count: number } {
  const [all, setAll] = useState<QuizItem[]>(cached ?? QUICK_QUIZ_ITEMS);
  const [loading, setLoading] = useState(!cached);
  useEffect(() => {
    let active = true;
    void load().then(items => { if (active) { setAll(items); setLoading(false); } });
    return () => { active = false; };
  }, []);
  const questions = useMemo(() => all.filter(q => subject === "mixed" || q.subject === subject), [all, subject]);
  return { questions, loading, count: questions.length };
}
