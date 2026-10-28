export type GrammarLanguage = "hy" | "en" | "ru";
export type GrammarLevel = "A1" | "A2" | "B1" | "B2" | "C1";
export type GrammarCategory = "grammar" | "reading" | "vocabulary" | "strategy";
export type GrammarLocalized = { summary: string; why: string };
/** Sections are the actual 1–13 question-book sections, not CEFR units. */
export type GrammarTopic = {
  id: string;
  title: string;
  level: GrammarLevel;
  category: GrammarCategory;
  sections: number[];
  formula: string;
  correct: string;
  incorrect: string;
  content: Record<GrammarLanguage, GrammarLocalized>;
};
