import { fetchBookResponse } from "./fetch-book-response";
import { loadArmenianOriginalBook } from "./armenian-original";
import { mergeBiologyExtended } from "./biology-extended";
export type MCQuestion = { n: string; stem: string; options: Record<string, string>; answer: string; explanation?: string; diagram?: { src: string; alt: string } };
export type Unit =
  | { id: string; label: string; kind: "mc"; passage: string; questions: MCQuestion[] }
  | { id: string; label: string; kind: "set" | "seq"; passage: string; answer: number[]; count?: number }
  | { id: string; label: string; kind: "match"; passage: string; answer: Record<string, number> }
  | { id: string; label: string; kind: "num"; passage: string; questions: { n: string; stem: string; answer: string; explanation?: string }[] };
export type Section = { n: number; title?: string; label?: string; instr_en: string; instr_hy: string; units: Unit[] };

/**
 * Printed question numbers can repeat within a single imported unit (seen in
 * English II and Armenian History I–III). Keep printed numbers unchanged, but
 * use distinct internal response keys so answers and scoring never collide.
 * Cache the mapping: Biology II may contain hundreds of questions per unit.
 */
type QuestionUnit = Extract<Unit, { kind: "mc" | "num" }>;
const responseKeys = new WeakMap<QuestionUnit, string[]>();

function keysFor(unit: QuestionUnit): string[] {
  const cached = responseKeys.get(unit);
  if (cached) return cached;
  const counts = new Map<string, number>();
  for (const question of unit.questions)
    counts.set(question.n, (counts.get(question.n) ?? 0) + 1);
  const reserved = new Set(unit.questions.map((question) => question.n));
  const keys = unit.questions.map((question, index) => {
    if ((counts.get(question.n) ?? 0) < 2) return question.n;
    let key = `__duplicate_${index}:${question.n}`;
    while (reserved.has(key)) key = `_${key}`;
    reserved.add(key);
    return key;
  });
  responseKeys.set(unit, keys);
  return keys;
}

export function questionAnswerKey(unit: QuestionUnit, index: number): string {
  return keysFor(unit)[index] ?? "";
}

export function questionForAnswerKey(unit: QuestionUnit, key: string) {
  const index = keysFor(unit).indexOf(key);
  return index < 0 ? undefined : unit.questions[index];
}

/** Use the same answer identities as the study/score screens when counting
 * completed section questions. Printed numbers can repeat within a source unit;
 * a plain `unit.id:question.n` would collapse those distinct answers.
 * Never change the original printed numbers or answer keys.
 */
export function sectionAnswerIds(section: Section): string[] {
  return section.units.flatMap((unit) =>
    unit.kind === "mc" || unit.kind === "num"
      ? unit.questions.map((_, index) => `${unit.id}:${questionAnswerKey(unit, index)}`)
      : [unit.id],
  );
}
export const secNum = (n: number) => (n > 70 ? 7 : n);
/** Translator shape of useTx(); the default only fills placeholders in the Armenian text. */
export type Tx = (hy: string, vars?: Record<string, string | number>) => string;
const fillHy: Tx = (hy, vars) => (vars ? hy.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : hy);
/** Pass useTx() as `tx` at render sites so the label follows the selected language. */
export const secTitle = (s: { n: number; title?: string; label?: string }, tx: Tx = fillHy) =>
  s.label ?? (s.title ? tx("Բաժին {n}", { n: s.title }) : tx("Բաժին {n}", { n: s.n }));
export type Book = { id: number; sections: Section[] };

export const BOOKS = [
  { id: 1, title: "Շտեմարան 1", sub: "Մաս I · 2017", cover: "/covers/english-1.svg" },
  { id: 2, title: "Շտեմարան 2", sub: "Մաս II · 2017", cover: "/covers/english-2.svg" },
  { id: 3, title: "Շտեմարան 3", sub: "Մաս III · 2018", cover: "/covers/english-3.svg" },
] as const;

/** Armenian history question books. Ids 21–23 map to public/data/history-book{1..3}.json. */
export const HISTORY_BOOKS = [
  { id: 21, title: "Հայոց պատմություն", sub: "Գիրք առաջին", cover: "/covers/history-1.svg" },
  { id: 22, title: "Հայոց պատմություն", sub: "Գիրք երկրորդ", cover: "/covers/history-2.svg" },
  { id: 23, title: "Հայոց պատմություն", sub: "Գիրք երրորդ", cover: "/covers/history-3.svg" },
] as const;

/** Biology books. Ids 31–34 map to public/data/bio-book{1..4}.json. Only unlocked books are playable. */
export const BIO_BOOKS = [
  { id: 31, title: "Կենսաբանություն", sub: "Մաս առաջին", cover: "/covers/bio-1.svg", locked: false },
  { id: 32, title: "Կենսաբանություն", sub: "Մաս երկրորդ", cover: "/covers/bio-2.svg", locked: false },
  { id: 33, title: "Կենսաբանություն", sub: "Մաս III · 1 837 բնօրինակ առաջադրանք · սրբագրման փուլ", cover: "/covers/bio-3.svg", locked: false },
  { id: 34, title: "Կենսաբանություն", sub: "Մաս IV · 1 688 բնօրինակ առաջադրանք · սրբագրման փուլ", cover: "/covers/bio-4.svg", locked: false },
] as const;

/** Volume I loads PDF-transcribed source material; volumes II–IV remain
 * separately labeled Shtemarm-authored practice until transcribed. */
export const ARMENIAN_BOOKS = [
  { id: 41, title: "Հայոց լեզու և հայ գրականություն", sub: "Մաս I · բնօրինակ առաջադրանքներ · ստուգման փուլ", cover: "/covers/armenian-language.svg" },
  { id: 42, title: "Հայոց լեզու և հայ գրականություն", sub: "Մաս II · 2018 թ. քննության շտեմարանի կառուցվածք · ուսումնական վարժանքներ", cover: "/covers/armenian-language.svg" },
  { id: 43, title: "Հայոց լեզու և հայ գրականություն", sub: "Մաս III · 2018 թ. քննության շտեմարանի կառուցվածք · ուսումնական վարժանքներ", cover: "/covers/armenian-language.svg" },
  { id: 44, title: "Հայոց լեզու և հայ գրականություն", sub: "Մաս IV · 2018 թ. քննության շտեմարանի կառուցվածք · ուսումնական վարժանքներ", cover: "/covers/armenian-language.svg" },
] as const;

/** Two playable original physics practice volumes, corresponding to the two
 * major GTC question-book parts. Their questions are NOT official transcriptions.
 */
export const PHYSICS_BOOKS = [
  { id: 61, title: "Ֆիզիկա", sub: "Մաս I · 55 ուսումնական առաջադրանք", cover: "/covers/physics-1.svg" },
  { id: 62, title: "Ֆիզիկա", sub: "Մաս II · 55 ուսումնական առաջադրանք", cover: "/covers/physics-2.svg" },
] as const;

/** First source-reviewed text transcriptions from the two actual scanned GTC
 * books supplied by the user. These are partial; do not conflate with our 61–62
 * newly authored study questions.
 */
export const PHYSICS_SOURCE_BOOKS = [
  { id: 63, title: "Ֆիզիկա · Բնօրինակ շտեմարան", sub: "Մաս I · թվայնացված 26 առաջադրանք · շարունակվում է", cover: "/covers/physics-1.svg" },
  { id: 64, title: "Ֆիզիկա · Բնօրինակ շտեմարան", sub: "Մաս II · թվայնացված 25 առաջադրանք · շարունակվում է", cover: "/covers/physics-2.svg" },
] as const;

/** Original Shtemarm starter practice banks; NOT transcriptions of GTC books. */
export const STARTER_SUBJECT_BOOKS = [
  { id: 51, title: "Ֆիզիկա", sub: "Ուսումնական ինքնաստուգում · 12 հարց", cover: "/covers/physics-practice.svg" },
  { id: 52, title: "Քիմիա", sub: "Ուսումնական ինքնաստուգում · 12 հարց", cover: "/covers/chemistry-practice.svg" },
  { id: 53, title: "Աշխարհագրություն", sub: "Ուսումնական ինքնաստուգում · 12 հարց", cover: "/covers/geography-practice.svg" },
  { id: 54, title: "Ռուսաց լեզու", sub: "Ուսումնական ինքնաստուգում · 12 հարց", cover: "/covers/russian-practice.svg" },
] as const;

/** Every playable book page, English, history, biology and Armenian language. */
export const ALL_BOOKS: ReadonlyArray<{ id: number; title: string; sub: string; cover: string }> = [
  ...BOOKS,
  ...HISTORY_BOOKS,
  ...BIO_BOOKS.filter((b) => !b.locked),
  ...ARMENIAN_BOOKS,
  ...PHYSICS_BOOKS,
  ...PHYSICS_SOURCE_BOOKS,
  ...STARTER_SUBJECT_BOOKS,
];

const cache = new Map<number, Promise<Book>>();

/** Explicit user-initiated reload bypasses the resolved promise cache.
 * This is needed when an imported book contains zero sections: simply calling
 * React Query's refetch() otherwise returns the same cached empty response.
 */
export function invalidateBookCache(id: number): void {
  if (id === 0) {
    for (const part of [1, 2, 3]) cache.delete(part);
  } else {
    cache.delete(id);
  }
}

/** id 0 = all books merged section-by-section */
export function loadAny(id: number): Promise<Book> {
  if (id !== 0) return loadBook(id);
  return Promise.all([1, 2, 3].map(loadBook)).then((bs) => {
    const map = new Map<number, Section>();
    for (const b of bs)
      for (const s of b.sections) {
        const cur = map.get(s.n);
        if (cur) cur.units = [...cur.units, ...s.units];
        else map.set(s.n, { ...s, units: [...s.units] });
      }
    return { id: 0, sections: [...map.values()].sort((a, b) => a.n - b.n) };
  });
}

export function loadBook(id: number): Promise<Book> {
  if (!cache.has(id)) {
    // Keep the request identity: an older failed request must not evict a
    // successful newer request started by the user's manual refresh.
    let request: Promise<Book>;
    request = (id === 41 ? loadArmenianOriginalBook() : fetchBookResponse(id === 63 || id === 64 ? `/data/physics-original-book${id - 62}.json` : id === 61 || id === 62 ? `/data/physics-book${id - 60}.json` : id >= 51 && id <= 54 ? `/data/original-${({51:"physics",52:"chemistry",53:"geography",54:"russian"} as Record<number,string>)[id]}.json` : id >= 41 && id <= 44 ? `/data/armenian-book${id - 40}.json` : id > 30 && id < 40 ? `/data/bio-book${id - 30}.json` : id > 20 && id < 30 ? `/data/history-book${id - 20}.json` : `/data/book${id}.json`, async (r) => {
          if (!r.ok) throw new Error(`Book ${id} HTTP ${r.status}`);
          const type = r.headers.get("content-type") ?? "";
          // Some hosting platforms return a successful HTML fallback for
          // missing /data/*.json. Surface a retryable error instead of parsing HTML.
          if (type && !/json|text\/plain|octet-stream/i.test(type)) {
            throw new Error(`Book ${id} returned ${type}, not JSON`);
          }
          const data: unknown = await r.json();
          if (!data || typeof data !== "object" || !("sections" in data) ||
              !Array.isArray(data.sections) ||
              data.sections.some((section: unknown) =>
                !section || typeof section !== "object" ||
                !("units" in section) || !Array.isArray(section.units))) {
            // A 200 OK /data/*.json can still contain incomplete imported data.
            // Reject it here rather than letting the section page crash on .units.
            throw new Error(`Book ${id} has an invalid question-bank format`);
          }
          return data as Book;
        })
        )
        .then(async (book: Book) => {
          if (id !== 33 && id !== 34) return book;
          const files = ["biology-extended", "biology-pending", "biology-last61"];
          const supplements = await Promise.all(files.map((name) =>
            fetchBookResponse(`/data/${name}-book${id - 30}.json`, async (response) => {
              if (!response.ok) throw new Error(`Biology supplement ${name} HTTP ${response.status}`);
              const mime = response.headers.get("content-type") ?? "";
              if (mime && !/json|text|octet-stream/i.test(mime))
                throw new Error(`Biology supplement ${name} returned non-JSON content`);
              return await response.json() as Book;
            })
          ));
          return supplements.reduce((merged, supplement) => mergeBiologyExtended(merged, supplement), book);
        })
        .then((book: Book) => id === 32 ? normalizeBiologySecondBook(book) : id === 31 ? normalizeBiologyFirstBook(book) : book)
        .catch((error: unknown) => {
          if (cache.get(id) === request) cache.delete(id);
          throw error;
        });
    cache.set(id, request);
  }
  const pending = cache.get(id);
  if (!pending) throw new Error("Չհաջողվեց բեռնել գիրքը");
  return pending;
}

/** The imported 2nd Biology book stored hundreds of distinct questions inside
 * one unit per section, which made navigation and mini-games skip nearly all
 * questions. Normalize into separate answerable units while preserving every
 * question, answer, and source passage.
 */
export const BIOLOGY_SECTION_NAMES: Readonly<Record<number, string>> = {
  1: "Կենդանի օրգանիզմների բազմազանությունը",
  2: "Մարդ",
  3: "Կենդանի նյութի քիմիական կազմավորվածությունը",
  4: "Բջջի կենսական փուլերը",
  5: "Էվոլյուցիոն տեսություն",
};

/** Correct display-only source import artifacts without altering answer keys.
 * No speculative rewrite of Biology question wording: ambiguous typos remain
 * available for review against the original published question books.
 */
export function normalizeBiologyText(text: string): string {
  return text.replace(/\\n/g, "\n").replace(/ {3,}tc(?=$|\n)/gi,"").replace(/[ \t]{3,}/g," ").trim();
}
export function normalizeBiologyFirstBook(book: Book): Book {
  return {
    ...book,
    sections: book.sections.map(section=>({
      ...section,
      label: section.title || (!section.label || /^\d+$/.test(section.label) ? "Բաժին "+section.n : section.label),
      instr_hy: section.instr_hy || "Ընտրե՛ք ճիշտ պատասխանը։",
      units: section.units.map(unit=>unit.kind==="mc"?{
        ...unit,
        passage: normalizeBiologyText(unit.passage),
        questions: unit.questions.map(q=>({...q, stem:normalizeBiologyText(q.stem),
          options:Object.fromEntries(Object.entries(q.options).map(([k,v])=>[k,normalizeBiologyText(v)]))})),
      }:unit),
    })),
  };
}

export function normalizeBiologySecondBook(book: Book): Book {
  return {
    ...book,
    sections: book.sections.map((section) => ({
      ...section,
      label: BIOLOGY_SECTION_NAMES[section.n] ?? section.label,
      instr_hy: section.instr_hy || "Ընտրե՛ք ճիշտ պատասխանը։",
      units: section.units.flatMap((unit): Unit[] => {
        if ((unit.kind !== "mc" && unit.kind !== "num") || unit.questions.length <= 1) {
          if(unit.kind !== "mc") return [unit];
          return [{...unit, passage:normalizeBiologyText(unit.passage),
            questions:unit.questions.map(q=>({...q,stem:normalizeBiologyText(q.stem),
              options:Object.fromEntries(Object.entries(q.options).map(([k,v])=>[k,normalizeBiologyText(v)]))}))}];
        }
        if (unit.kind === "mc") {
          return unit.questions.map((question, index) => ({
            ...unit,
            id: `${unit.id}:q${index + 1}`,
            label: question.n,
            passage: normalizeBiologyText(unit.passage),
            questions: [{ ...question, stem: normalizeBiologyText(question.stem),
              options: Object.fromEntries(Object.entries(question.options).map(([k, v]) => [k, normalizeBiologyText(v)])) }],
          }));
        }
        return unit.questions.map((question, index) => ({
          ...unit,
          id: `${unit.id}:q${index + 1}`,
          label: question.n,
          passage: normalizeBiologyText(unit.passage),
          questions: [question],
        }));
      }),
    })),
  };
}

export function unitPoints(u: Unit) {
  return u.kind === "mc" || u.kind === "num" ? u.questions.length : 1;
}

export const KIND_HY: Record<Unit["kind"], string> = {
  mc: "Ընտրե՛ք ճիշտ պատասխանը",
  set: "Ընտրե՛ք ճիշտ համարները",
  seq: "Լրացրե՛ք բացթողումները ըստ հերթականության",
  match: "Համապատասխանեցրե՛ք",
  num: "Գրե՛ք թվային պատասխանը",
};

export function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = b[i];
    const other = b[j];
    if (t === undefined || other === undefined) continue;
    b[i] = other;
    b[j] = t;
  }
  return b;
}

export type ExamItem = { section: number; unit: Unit };

/** Official English exam point quotas by section (total: 80 points). */
export const EXAM_BLUEPRINT: ReadonlyArray<readonly [number, number]> = [
  [1, 10], [2, 16], [3, 11], [4, 5], [5, 8], [6, 5], [7, 1],
  [8, 5], [9, 1], [10, 5], [11, 5], [12, 4], [13, 4],
];

function pickPoints(sec: Section | undefined, points: number, filter?: (u: Unit) => boolean): Unit[] {
  const sums = new Map<number, Unit[]>([[0, []]]);
  for (const unit of shuffle(sec?.units.filter(filter ?? (() => true)) ?? [])) {
    const weight = unitPoints(unit);
    for (const [sum, picked] of [...sums.entries()]) {
      const next = sum + weight;
      if (next <= points && !sums.has(next)) sums.set(next, [...picked, unit]);
    }
    const result = sums.get(points);
    if (result) return result;
  }
  return [];
}

function expandForTest(item: ExamItem): ExamItem[] {
  const unit = item.unit;
  if (unit.kind === "mc" && unit.questions.length > 1) {
    return unit.questions.map((question) => ({
      section: item.section,
      unit: { ...unit, id: `${unit.id}-q${question.n}`, label: question.n, questions: [question] },
    }));
  }
  if (unit.kind === "num" && unit.questions.length > 1) {
    return unit.questions.map((question) => ({
      section: item.section,
      unit: { ...unit, id: `${unit.id}-q${question.n}`, label: question.n, questions: [question] },
    }));
  }
  return [item];
}
function pickItems(items: ExamItem[], points: number): ExamItem[] {
  const sums = new Map<number, ExamItem[]>([[0, []]]);
  for (const item of shuffle(items)) {
    const weight = unitPoints(item.unit);
    for (const [sum, picked] of [...sums.entries()]) {
      const next = sum + weight;
      if (next <= points && !sums.has(next)) sums.set(next, [...picked, item]);
    }
    const result = sums.get(points);
    if (result) return result;
  }
  return [];
}

function ordered(book: Book, items: ExamItem[]): ExamItem[] {
  const unitPositions = new Map<string, number>();
  const questionPositions = new Map<string, number>();
  let position = 0;
  for (const section of book.sections) {
    for (const unit of section.units) {
      unitPositions.set(unit.id, position++);
      if (unit.kind === "mc" || unit.kind === "num") {
        unit.questions.forEach((question, index) => {
          questionPositions.set(`${unit.id}-q${question.n}`, index);
        });
      }
    }
  }
  const sourceId = (id: string) => {
    const questionMarker = id.lastIndexOf("-q");
    return questionMarker > 0 ? id.slice(0, questionMarker) : id;
  };
  return [...items].sort((a, b) => {
    const aSource = sourceId(a.unit.id);
    const bSource = sourceId(b.unit.id);
    const byUnit = (unitPositions.get(aSource) ?? Number.MAX_SAFE_INTEGER) -
      (unitPositions.get(bSource) ?? Number.MAX_SAFE_INTEGER);
    if (byUnit !== 0) return byUnit;
    return (questionPositions.get(a.unit.id) ?? 0) - (questionPositions.get(b.unit.id) ?? 0);
  });
}

/** Build a custom test with an exact point total from the chosen sections. */
export function buildCustom(book: Book, sectionNums: number[], totalPoints: number, filter?: (u: Unit) => boolean): ExamItem[] {
  const sections = book.sections.filter((s) => sectionNums.includes(s.n));
  const pool = sections.flatMap((section) =>
    section.units
      .filter(filter ?? (() => true))
      .flatMap((unit) => expandForTest({ section: section.n, unit })),
  );
  const selected = pickItems(pool, totalPoints);
  if (selected.reduce((sum, item) => sum + unitPoints(item.unit), 0) !== totalPoints) {
    throw new Error("Ընտրված բաժիններում բավարար համապատասխան հարցեր չկան այս քանակի թեստ կազմելու համար։");
  }
  return ordered(book, selected);
}

/** Build an 80-point exam; English uses the published 13-section blueprint. */
export function buildExam(book: Book, requestedBookId = book.id): ExamItem[] {
  if (requestedBookId >= 1 && requestedBookId <= 3) {
    const selected: ExamItem[] = [];
    for (const [sectionNo, points] of EXAM_BLUEPRINT) {
      const section = book.sections.find((s) => s.n === sectionNo);
      // The first section is a single complete reading passage worth ten points.
      const reading = sectionNo === 1
        ? shuffle((section?.units ?? []).filter((unit) => unitPoints(unit) === 10 && unit.passage.trim().length > 0)).slice(0, 1)
        : [];
      const units = sectionNo === 1 && reading.length === 1 ? reading : pickPoints(section, points);
      if (units.reduce((sum, unit) => sum + unitPoints(unit), 0) !== points) {
        throw new Error(`Բաժին ${sectionNo}-ում բավարար հարցեր չկան քննության կառուցվածքը լրացնելու համար։`);
      }
      selected.push(...units.map((unit) => ({ section: sectionNo, unit })));
    }
    return ordered(book, selected);
  }

  const available = book.sections.reduce((sum, section) => sum + section.units.reduce((n, unit) => n + unitPoints(unit), 0), 0);
  const target = requestedBookId === 41 ? Math.min(80, available) : 80;
  if (available < target || target < 1) throw new Error("Այս շտեմարանում դեռ բավարար հարցեր չկան ամբողջական քննություն կազմելու համար։");
  const pool = book.sections.flatMap((section) =>
    section.units.flatMap((unit) => expandForTest({ section: section.n, unit })),
  );
  const selected = pickItems(pool, target);
  if (selected.reduce((sum, item) => sum + unitPoints(item.unit), 0) !== target) {
    throw new Error("Չհաջողվեց կազմել անհրաժեշտ միավորներով քննություն։ Փորձիր մեկ այլ շտեմարան։");
  }
  return ordered(book, selected);
}


