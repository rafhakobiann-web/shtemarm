import type { Book, Unit } from "./books";

/** Landing only uses genuinely answerable English book questions, never fabricated options. */
export const ENGLISH_DEMO_SECTIONS = [3, 5, 8, 11] as const;
export type EnglishDemoQuestion = {
  id: string; bookId: number; section: number; prompt: string;
  options: string[]; correct: number[]; explanation?: string; multiple: boolean;
};
const clean = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const LETTERS = ["a", "b", "c", "d"] as const;
function fromUnit(bookId: number, section: number, unit: Unit): EnglishDemoQuestion[] {
  if (unit.kind === "mc") {
    // A passage-based item cannot be shown without the passage.
    if (clean(unit.passage)) return [];
    return unit.questions.flatMap((q, index) => {
      if (!clean(q.stem) || q.diagram || /<img|!\[|\\includegraphics/i.test(q.stem)) return [];
      const keys = LETTERS.filter(k => clean(q.options[k]));
      if (keys.length !== 4 || !keys.includes(q.answer as typeof LETTERS[number])) return [];
      const options = keys.map(k => q.options[k].trim());
      if (new Set(options).size !== options.length) return [];
      return [{
        id: `${bookId}:${section}:${unit.id}:${index}`, bookId, section,
        prompt: q.stem.trim(), options, correct: [keys.indexOf(q.answer as typeof LETTERS[number])],
        explanation: clean(q.explanation) ? q.explanation.trim() : undefined, multiple: false,
      }];
    });
  }
  if (unit.kind !== "set" || !clean(unit.passage)) return [];
  // These sections are five-statement multi-select sets, not single-answer quizzes.
  const statements = [...unit.passage.matchAll(/(?:^|\n)\s*([1-5])[.)]\s*([\s\S]*?)(?=\n\s*[1-5][.)]\s*|$)/g)]
    .map(m => ({ number: Number(m[1]), text: m[2].replace(/\s+/g, " ").trim() }));
  if (statements.length !== 5 || statements.some((s, i) => s.number !== i + 1 || !s.text)) return [];
  if (!Array.isArray(unit.answer) || !unit.answer.length ||
      unit.answer.some(n => !Number.isInteger(n) || n < 1 || n > 5)) return [];
  return [{
    id: `${bookId}:${section}:${unit.id}`, bookId, section,
    prompt: section === 8 ? "Choose the correctly formulated questions." : "Choose the correctly formulated Passive constructions.",
    options: statements.map(s => s.text), correct: [...new Set(unit.answer)].map(n => n - 1).sort(),
    multiple: true,
  }];
}
export function englishDemoQuestions(books: Book[]): EnglishDemoQuestion[] {
  return books.flatMap(book => book.sections
    .filter(s => (ENGLISH_DEMO_SECTIONS as readonly number[]).includes(s.n))
    .flatMap(section => section.units.flatMap(unit => fromUnit(book.id, section.n, unit))));
}
export function drawEnglishDemoQuestions(questions: EnglishDemoQuestion[], count = 4, random: () => number = Math.random): EnglishDemoQuestion[] {
  const remaining = [...questions];
  const selected: EnglishDemoQuestion[] = [];
  // Ensure variety across the four requested sections, without repeating an item in a round.
  for (const section of ENGLISH_DEMO_SECTIONS) {
    if (selected.length >= count) break;
    const candidates = remaining.filter(q => q.section === section);
    if (!candidates.length) continue;
    const chosen = candidates[Math.floor(random() * candidates.length)];
    selected.push(chosen);
    remaining.splice(remaining.indexOf(chosen), 1);
  }
  while (selected.length < count && remaining.length) {
    selected.push(remaining.splice(Math.floor(random() * remaining.length), 1)[0]);
  }
  return selected;
}
