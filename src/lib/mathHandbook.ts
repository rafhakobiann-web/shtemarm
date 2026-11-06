import { MATH_FOUNDATIONS } from "./mathHandbookFoundations";
import { MATH_ALGEBRA } from "./mathHandbookAlgebra";
import { MATH_ADDITIONAL_EXPLANATIONS } from "./mathHandbookAdditional";
import { MATH_GEOMETRY } from "./mathHandbookGeometry";
import { MATH_HANDBOOK_CALCULUS } from "./mathHandbookCalculus";
import { MATH_HANDBOOK_SECTIONS, type MathHandbookSection } from "./mathHandbookSections";
import type { MathCategory, MathTopic } from "./mathHandbookTypes";
export type { MathTopic, MathCategory, MathLocale, MathText } from "./mathHandbookTypes";
export { MATH_HANDBOOK_SECTIONS };
export type { MathHandbookSection } from "./mathHandbookSections";

export const MATH_HANDBOOK_TOPICS: readonly MathTopic[] = [
  ...MATH_FOUNDATIONS, ...MATH_ALGEBRA, ...MATH_GEOMETRY, ...MATH_HANDBOOK_CALCULUS, ...MATH_ADDITIONAL_EXPLANATIONS
];

/** Match actual math-book section headings, not guessed per-question keywords. */
export function categoriesForMathSection(title: string): MathCategory[] {
  const t = title.trim().toLocaleUpperCase();
  if (t.includes("ԿՈՈՐԴԻՆԱՏՆԵՐԻ") || t.includes("ՎԵԿՏՈՐ")) return ["coordinates"];
  if (t.includes("ՏԱՐԱԾԱՉԱՓՈՒԹՅՈՒՆ")) return ["solid-geometry"];
  if (t.includes("ՀԱՐԹԱՉԱՓՈՒԹՅՈՒՆ")) return ["plane-geometry"];
  if (t.includes("ՄԻԱՑՈՒԹՅՈՒՆՆԵՐ")) return ["combinatorics"];
  if (t.includes("ՊՐՈԳՐԵՍԻԱՆԵՐ")) return ["sequences"];
  if (t.includes("ՖՈՒՆԿՑԻԱՆԵՐ")) return ["functions"];
  if (t.includes("ՏԵՔՍՏԱՅԻՆ")) return ["word-problems"];
  if (t.includes("ՀԱՎԱՍԱՐՈՒՄՆԵՐ") && t.includes("ԱՆՀԱՎԱՍԱՐՈՒՄՆԵՐ")) return ["equations","inequalities"];
  if (t.includes("ԱՆՀԱՎԱՍԱՐՈՒՄՆԵՐ")) return ["inequalities"];
  if (t.includes("ՀԱՎԱՍԱՐՈՒՄՆԵՐ")) return ["equations"];
  if (t.includes("ԱՐՏԱՀԱՅՏՈՒԹՅՈՒՆՆԵՐԻ")) return ["expressions"];
  if (t.includes("ԹՎԱԲԱՆԱԿԱՆ")) return ["arithmetic"];
  return [];
}
export function findMathSection(book: string, chapter: number, section: number): MathHandbookSection | undefined {
  return MATH_HANDBOOK_SECTIONS.find(s=>s.book===book && s.chapter===chapter && s.section===section);
}
export function mathTopicsForSection(section:MathHandbookSection):MathTopic[] {
  const categories=new Set(categoriesForMathSection(section.title));
  const items=MATH_HANDBOOK_TOPICS.filter(t=>categories.has(t.category));
  // Third chapters test statements; a counterexample strategy applies to all their subjects.
  if (section.chapter===3) {
    const checker=MATH_HANDBOOK_TOPICS.find(t=>t.id==="true-false-check");
    if (checker && !items.some(t=>t.id===checker.id)) items.push(checker);
  }
  return items;
}
export function findMathTopic(id:string):MathTopic|undefined {
  return MATH_HANDBOOK_TOPICS.find(t=>t.id===id);
}
/** Existing route expects these query parameters for both game and book practice. */
export function mathBookUrl(section:MathHandbookSection):string {
  return `/math/books?book=${section.book}&sec=${section.chapter}-${section.section}`;
}
export function mathGameUrl(section:MathHandbookSection, mode:"play"|"test"="play"):string {
  return `/math/play?book=${section.book}&sec=${section.chapter}-${section.section}&mode=${mode}`;
}
