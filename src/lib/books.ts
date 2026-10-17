import cover1 from "@/assets/cover-1.webp.asset.json";
import cover2 from "@/assets/cover-2.webp.asset.json";
import cover3 from "@/assets/cover-3.webp.asset.json";

export type MCQuestion = { n: string; stem: string; options: Record<string, string>; answer: string };
export type Unit =
  | { id: string; label: string; kind: "mc"; passage: string; questions: MCQuestion[] }
  | { id: string; label: string; kind: "set" | "seq"; passage: string; answer: number[] }
  | { id: string; label: string; kind: "match"; passage: string; answer: Record<string, number> };
export type Section = { n: number; title?: string; instr_en: string; instr_hy: string; units: Unit[] };
export const secNum = (n: number) => (n > 70 ? 7 : n);
export const secTitle = (s: { n: number; title?: string }) => (s.title ? `Բաժին ${s.title}` : `Բաժին ${s.n}`);
export type Book = { id: number; sections: Section[] };

export const BOOKS = [
  { id: 1, title: "Շտեմարան 1", sub: "Մաս I · 2017", cover: cover1.url },
  { id: 2, title: "Շտեմարան 2", sub: "Մաս II · 2017", cover: cover2.url },
  { id: 3, title: "Շտեմարան 3", sub: "Մաս III · 2018", cover: cover3.url },
] as const;

const cache = new Map<number, Promise<Book>>();
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
    cache.set(
      id,
      fetch(`/data/book${id}.json`).then((r) => {
        if (!r.ok) throw new Error("Չհաջողվեց բեռնել գիրքը");
        return r.json();
      }),
    );
  }
  return cache.get(id)!;
}

export function unitPoints(u: Unit) {
  return u.kind === "mc" ? u.questions.length : 1;
}

export const KIND_HY: Record<Unit["kind"], string> = {
  mc: "Ընտրել ճիշտ տարբերակը",
  set: "Ընտրել ճիշտ համարները",
  seq: "Տեղադրել համարները ըստ բացթողումների",
  match: "Համապատասխանեցնել",
};

export function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = b[i]!;
    b[i] = b[j]!;
    b[j] = t;
  }
  return b;
}

/** Pick units from a section until reaching `points` (each MC sub-question = 1 point). */
function pickPoints(sec: Section | undefined, points: number, filter?: (u: Unit) => boolean): Unit[] {
  if (!sec) return [];
  const out: Unit[] = [];
  let total = 0;
  for (const u of shuffle(sec.units.filter(filter ?? (() => true)))) {
    const p = unitPoints(u);
    if (total + p > points && total > 0) continue;
    out.push(u);
    total += p;
    if (total >= points) break;
  }
  return out;
}

/** Exam blueprint: 80 tasks following the book's 13 task types, in the same order as the real exam. */
export const EXAM_BLUEPRINT: [number, number][] = [
  [1, 15], [2, 10], [3, 18], [4, 5], [5, 10], [6, 3], [7, 1], [72, 1], [8, 3], [9, 2], [10, 3], [11, 3], [12, 3], [13, 3],
];

/** Sort picked items into the order they appear in the book. */
function inBookOrder(book: Book, items: { section: number; unit: Unit }[]) {
  const pos = new Map<string, number>();
  let i = 0;
  for (const s of book.sections) for (const u of s.units) pos.set(u.id, i++);
  return [...items].sort((a, b) => (pos.get(a.unit.id) ?? 0) - (pos.get(b.unit.id) ?? 0));
}

export function buildExam(book: Book) {
  const items: { section: number; unit: Unit }[] = [];
  for (const [n, pts] of EXAM_BLUEPRINT) {
    const sec = book.sections.find((s) => s.n === n);
    let filter: ((u: Unit) => boolean) | undefined;
    if (n === 1) {
      // one long (10-question) text + one short (5-question) text
      const long = pickPoints(sec, 10, (u) => u.kind === "mc" && u.questions.length >= 10);
      const short = pickPoints(sec, 5, (u) => u.kind === "mc" && u.questions.length <= 5);
      [...long, ...short].forEach((unit) => items.push({ section: n, unit }));
      continue;
    }
    pickPoints(sec, pts, filter).forEach((unit) => items.push({ section: n, unit }));
  }
  return inBookOrder(book, items);
}

export function buildCustom(book: Book, sections: number[], count: number) {
  const pool = book.sections.filter((s) => sections.includes(s.n));
  const all = shuffle(pool.flatMap((s) => s.units.map((unit) => ({ section: s.n, unit }))));
  const out: { section: number; unit: Unit }[] = [];
  let pts = 0;
  for (const it of all) {
    if (pts >= count) break;
    out.push(it);
    pts += unitPoints(it.unit);
  }
  return inBookOrder(book, out);
}
