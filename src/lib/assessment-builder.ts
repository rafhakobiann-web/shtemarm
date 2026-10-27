import type { Unit, Book } from "@/lib/books";
import { historyBookEntries, type HistoryEntry } from "@/lib/history";

export const ASSESSMENT_SOURCES = [
  { key: "english", label: "Անգլերեն", books: [1,2,3] },
  { key: "armenian", label: "Հայոց լեզու և գրականություն", books: [41] },
  { key: "history", label: "Հայոց պատմություն", books: [21,22,23] },
  { key: "biology", label: "Կենսաբանություն", books: [31,32] },
  { key: "physics", label: "Ֆիզիկա", books: [61, 62] },
  { key: "chemistry", label: "Քիմիա", books: [52] },
  { key: "geography", label: "Աշխարհագրություն", books: [53] },
  { key: "russian", label: "Ռուսաց լեզու", books: [54] },
] as const;
export type AssessmentSubject = (typeof ASSESSMENT_SOURCES)[number]["key"];
export type AssessmentKind = "thematic" | "summative";
export type Assessment = {
  title: string; kind: AssessmentKind; subject: AssessmentSubject;
  units: Unit[]; sections: string[]; createdAt: number;
};

/** Thematic work uses the selected topics. Summative uses all book sections.
 * All tasks are from existing verified/clearly-labelled bank data; no AI
 * fabricates answers and no item is duplicated within an assessment.
 */
export function assessmentEntries(book: Book, id: number): HistoryEntry[] {
  return historyBookEntries(book,id);
}
export function buildAssessment(
  entries: readonly HistoryEntry[],
  options: { kind: AssessmentKind; subject: AssessmentSubject; sections: readonly string[]; count: number; random?: () => number },
): Assessment {
  const scoped = entries.filter(entry => options.kind === "summative" ||
    !options.sections.length || options.sections.includes(entry.section));
  const unique = [...new Map(scoped.map(entry => [entry.unit.id, entry.unit])).values()];
  const count = options.count;
  if (!Number.isInteger(count) || count < 1 || count > 60 || count > unique.length)
    throw new Error("Ընտրված թեմաներում բավարար ստուգված առաջադրանքներ չկան։ Ընտրիր ավելի քիչ հարցեր կամ այլ բաժիններ։");
  const random = options.random ?? Math.random;
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.max(0,Math.min(i,Math.floor(random()*(i+1))));
    [unique[i],unique[j]]=[unique[j]!,unique[i]!];
  }
  const name=ASSESSMENT_SOURCES.find(item=>item.key===options.subject)?.label ?? options.subject;
  return {
    subject:options.subject, kind:options.kind,
    title:name+" · "+(options.kind==="thematic"?"Թեմատիկ աշխատանք":"Ամփոփիչ աշխատանք"),
    units:unique.slice(0,count),
    sections:options.kind==="summative" ? [...new Set(entries.map(e=>e.section))] : [...options.sections],
    createdAt:Date.now(),
  };
}
export function printableAnswer(unit: Unit): string {
  if (unit.kind==="mc" || unit.kind==="num") return unit.questions.map(q=>q.n+". "+q.answer).join(" · ");
  if (Array.isArray(unit.answer)) return unit.answer.join(", ");
  return Object.entries(unit.answer).map(([a,b])=>a+" → "+b).join(" · ");
}
export function printablePrompt(unit: Unit): string {
  if (unit.kind==="mc") return [
    unit.passage, ...unit.questions.map(q=>q.stem+"\n"+Object.entries(q.options).map(([k,v])=>k+") "+v).join("\n")),
  ].filter(Boolean).join("\n");
  if (unit.kind==="num") return [unit.passage,...unit.questions.map(q=>q.stem)].filter(Boolean).join("\n");
  return unit.passage || unit.label;
}
