export type MathLocale = "hy" | "en" | "ru";
export type MathText = Record<MathLocale, string>;
export type MathCategory =
  | "arithmetic" | "expressions" | "equations" | "inequalities" | "word-problems"
  | "sequences" | "functions" | "plane-geometry" | "solid-geometry"
  | "coordinates" | "combinatorics";
export type MathTopic = {
  id: string;
  category: MathCategory;
  title: MathText;
  summary: MathText;
  /** TeX expressions are rendered using the existing MathContent renderer. */
  formula: string;
  problem: MathText;
  steps: Record<MathLocale, string[]>;
  answer: string;
  mistake: MathText;
};
/** Matching by normalized section titles is a *topic suggestion*, not a claimed solution of individual questions. */
