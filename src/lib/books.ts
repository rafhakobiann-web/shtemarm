
export type MCQuestion = { n: string; stem: string; options: Record<string, string>; answer: string };
export type Unit =
  | { id: string; label: string; kind: "mc"; passage: string; questions: MCQuestion[] }
  | { id: string; label: string; kind: "set" | "seq"; passage: string; answer: number[]; count?: number }
  | { id: string; label: string; kind: "match"; passage: string; answer: Record<string, number> };
export type Section = { n: number; title?: string; instr_en: string; instr_hy: string; units: Unit[] };
export const secNum = (n: number) => (n > 70 ? 7 : n);
export const secTitle = (s: { n: number; title?: string }) => (s.title ? `Բաժին ${s.title}` : `Բաժին ${s.n}`);
export type Book = { id: number; sections: Section[] };

export const BOOKS = [
  { id: 1, title: "Շտեմարան 1", sub: "Մաս I · 2017", cover: "/covers/en-1.jpg" },
  { id: 2, title: "Շտեմարան 2", sub: "Մաս II · 2017", cover: "/covers/en-2.webp" },
  { id: 3, title: "Շտեմարան 3", sub: "Մաս III · 2018", cover: "/covers/en-3.webp" },
] as const;

/** Armenian history question books. Ids 21–23 map to public/data/history-book{1..3}.json. */
export const HISTORY_BOOKS = [
  { id: 21, title: "Հայոց պատմություն", sub: "Գիրք առաջին", cover: "/covers/hist-1.webp" },
  { id: 22, title: "Հայոց պատմություն", sub: "Գիրք երկրորդ", cover: "/covers/hist-2.webp" },
  { id: 23, title: "Հայոց պատմություն", sub: "Գիրք երրորդ", cover: "/covers/hist-3.webp" },
] as const;

/** Every book page, English and history. */
export const ALL_BOOKS: ReadonlyArray<{ id: number; title: string; sub: string; cover: string }> = [...BOOKS, ...HISTORY_BOOKS];

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
      fetch(id > 20 ? `/data/history-book${id - 20}.json` : `/data/book${id}.json`).then((r) => {
        if (!r.ok) throw new Error("Չհաջողվեց բեռնել գիրքը");
        return r.json();
      }),
    );
  }
  const pending = cache.get(id);
  if (!pending) throw new Error("Չհաջողվեց բեռնել գիրքը");
  return pending;
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
    const t = b[i];
    const other = b[j];
    if (t === undefined || other === undefined) continue;
    b[i] = other;
    b[j] = t;
  }
  return b;
}

/** Pick units from a section until reaching `points` (each MC sub-question = 1 point). */
function pickPoints(sec: Section | undefined, points: number, filter?: (u: Unit) => boolean): Unit[] {
  // Exact subset selection keeps passages intact and never silently overshoots.
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
  throw new Error(`Բաժին ${sec?.n ?? ""}․ բավարար ամբողջական առաջադրանքներ չկան ${points} հարց կազմելու համար։`);
}

/** Exam blueprint: 80 tasks following the book's 13 task types, in the same order as the real exam. */
export const EXAM_BLUEPRINT: [number, number][] = [
  [1, 10], [2, 16], [3, 11], [4, 5], [5, 8], [6, 5], [7, 1], [8, 5], [9, 1], [10, 5], [11, 5], [12, 4], [13, 4],
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
    if (n === 1) {
      // Official 2026 exam: one complete reading passage, exactly ten questions.
      pickPoints(sec, 10, (u) => u.kind === "mc" && u.questions.length === 10).forEach((unit) => items.push({ section: n, unit }));
      continue;
    }
    pickPoints(sec, pts, n === 7 ? (u) => u.kind === "seq" && u.answer.length === 5 && !/^\s*[-–]/m.test(u.passage) : undefined).forEach((unit) => items.push({ section: n, unit }));
  }
  if (items.reduce((sum, item) => sum + unitPoints(item.unit), 0) !== 80) throw new Error("Քննությունը պետք է պարունակի ճիշտ 80 հարց։");
  return inBookOrder(book, items);
}

export function buildCustom(book: Book, sections: number[], count: number) {
  const pool = book.sections.filter((s) => sections.includes(s.n));
  const all = shuffle(pool.flatMap((s) => s.units.map((unit) => ({ section: s.n, unit }))));
  const out: { section: number; unit: Unit }[] = [];
  let pts = 0;
  for (const it of all) {
    if (pts >= count) break;
    const remaining = count - pts;
    const unit = it.unit.kind === "mc" && it.unit.questions.length > remaining
      ? { ...it.unit, questions: it.unit.questions.slice(0, remaining) }
      : it.unit;
    out.push({ ...it, unit });
    pts += unitPoints(unit);
  }
  return inBookOrder(book, out);
}
