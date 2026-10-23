export type MCQuestion = { n: string; stem: string; options: Record<string, string>; answer: string };
export type Unit =
  | { id: string; label: string; kind: "mc"; passage: string; questions: MCQuestion[] }
  | { id: string; label: string; kind: "set" | "seq"; passage: string; answer: number[]; count?: number }
  | { id: string; label: string; kind: "match"; passage: string; answer: Record<string, number> }
  | { id: string; label: string; kind: "num"; passage: string; questions: { n: string; stem: string; answer: string }[] };
export type Section = { n: number; title?: string; label?: string; instr_en: string; instr_hy: string; units: Unit[] };
export const secNum = (n: number) => (n > 70 ? 7 : n);
/** Translator shape of useTx(); the default only fills placeholders in the Armenian text. */
export type Tx = (hy: string, vars?: Record<string, string | number>) => string;
const fillHy: Tx = (hy, vars) => (vars ? hy.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : hy);
/** Pass useTx() as `tx` at render sites so the label follows the selected language. */
export const secTitle = (s: { n: number; title?: string; label?: string }, tx: Tx = fillHy) =>
  s.label ?? (s.title ? tx("Բաժին {n}", { n: s.title }) : tx("Բաժին {n}", { n: s.n }));
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

/** Biology books. Ids 31–34 map to public/data/bio-book{1..4}.json. Only unlocked books are playable. */
export const BIO_BOOKS = [
  { id: 31, title: "Կենսաբանություն", sub: "Մաս առաջին", cover: "/covers/bio-1.webp", locked: false },
  { id: 32, title: "Կենսաբանություն", sub: "Մաս երկրորդ", cover: "/covers/bio-2.webp", locked: false },
  { id: 33, title: "Կենսաբանություն", sub: "Մաս երրորդ", cover: "/covers/bio-3.webp", locked: true },
  { id: 34, title: "Կենսաբանություն", sub: "Մաս չորրորդ", cover: "/covers/bio-4.webp", locked: true },
] as const;

/** Every playable book page, English, history and biology. */
export const ALL_BOOKS: ReadonlyArray<{ id: number; title: string; sub: string; cover: string }> = [
  ...BOOKS,
  ...HISTORY_BOOKS,
  ...BIO_BOOKS.filter((b) => !b.locked),
];

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
      fetch(id > 30 ? `/data/bio-book${id - 30}.json` : id > 20 ? `/data/history-book${id - 20}.json` : `/data/book${id}.json`)
        .then((r) => {
          if (!r.ok) throw new Error(`Book ${id} HTTP ${r.status}`);
          return r.json();
        })
        .catch((error: unknown) => {
          cache.delete(id);
          throw error;
        }),
    );
  }
  const pending = cache.get(id);
  if (!pending) throw new Error("Չհաջողվեց բեռնել գիրքը");
  return pending;
}

export function unitPoints(u: Unit) {
  return u.kind === "mc" || u.kind === "num" ? u.questions.length : 1;
}

export const KIND_HY: Record<Unit["kind"], string> = {
  mc: "Ընտրել ճիշտ տարբերակը",
  set: "Ընտրել ճիշտ համարները",
  seq: "Տեղադրել համարները ըստ բացթողումների",
  match: "Համապատասխանեցնել",
  num: "Գրեք պատասխանի թիվը",
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

/** Pick units for a custom test or exam based on sections and points. */
export function buildCustom(book: Book, sectionNums: number[], totalPoints: number, filter?: (u: Unit) => boolean): Unit[] {
  const targetSections = book.sections.filter((s) => sectionNums.includes(s.n));
  let remaining = totalPoints;
  const result: Unit[] = [];
  
  for (const sec of targetSections) {
    if (remaining <= 0) break;
    const picked = pickPoints(sec, Math.ceil(remaining / targetSections.length), filter);
    for (const u of picked) {
      const pts = unitPoints(u);
      if (remaining >= pts) {
        result.push(u);
        remaining -= pts;
      }
    }
  }
  if (remaining > 0) {
    for (const sec of targetSections) {
      if (remaining <= 0) break;
      const picked = pickPoints(sec, remaining, filter);
      for (const u of picked) {
        if (!result.includes(u)) {
          const pts = unitPoints(u);
          if (remaining >= pts) {
            result.push(u);
            remaining -= pts;
          }
        }
      }
    }
  }
  return result;
}

export function buildExam(book: Book): Unit[] {
  const allUnits: Unit[] = [];
  for (const sec of book.sections) {
    allUnits.push(...shuffle(sec.units));
  }
  return allUnits.slice(0, 40);
}
