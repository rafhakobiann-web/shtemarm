import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Timer, RefreshCw, Trophy, ListChecks } from "lucide-react";
import { useMathProgress, isRight, isOpenSection } from "@/lib/math-progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { z } from "zod";
import { MathExplain, taskPages } from "@/components/MathExplain";
import { MathTools } from "@/components/MathTools";
import { cn } from "@/lib/utils";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/math/")({
  validateSearch: z.object({ mode: z.enum(["exam", "custom"]).optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Մաթեմատիկա · Թեստ · Շտեմարան" },
      { name: "description", content: "Մաթեմատիկայի թեստ՝ կազմված մաթեմատիկայի գրքերից" },
    ],
  }),
  component: MathPage,
});

type Segment = { page: number; y0: number; y1: number };
type BookTask = { task: number; segments: Segment[]; answers: string[] | null; sub_count: number; sub_segments?: Segment[][] };
type IndexSection = { chapter: number; section: number; title: string; tasks: BookTask[] };
type Index = { books: Record<string, { title: string; sections: IndexSection[] }> };
type Kind = "choice" | "tf" | "open";
type Item = {
  id: string;
  book: string;
  chapter: number;
  section: number;
  task: number;
  sub: number;
  subs: number;
  segments: Segment[];
  split?: boolean;
  answer: string;
  kind: Kind;
};

const PAGE_W = 467.76;
const EXAM_SIZE = 65;
const LAST_KEY = "math-exam-last-ids";
const BOOK_IDS = ["matem-1", "matem-2"] as const;
const BOOK_NAMES: Record<string, string> = { "matem-1": "Մաթեմատիկա · Մաս 1", "matem-2": "Մաթեմատիկա · Մաս 2" };

const SECTION_TITLES: Record<string, Record<string, string>> = {
  "matem-1": {
    "1:1": "Թվաբանական առաջադրանքներ",
    "1:2": "Արտահայտությունների ձևափոխություններ և արժեքների հաշվում",
    "1:3": "Հավասարումներ",
    "1:4": "Անհավասարումներ",
    "1:5": "Տեքստային խնդիրներ",
    "1:6": "Պրոգրեսիաներ",
    "1:7": "Ֆունկցիաներ",
    "1:8": "Հարթաչափություն",
    "1:9": "Տարածաչափություն",
    "1:10": "Կոորդինատների մեթոդ, վեկտորներ",
    "2:1": "Արտահայտությունների ձևափոխություններ և արժեքների հաշվում",
    "2:2": "Հավասարումներ և անհավասարումներ",
    "2:3": "Տեքստային խնդիրներ",
    "2:4": "Պրոգրեսիաներ",
    "2:5": "Ֆունկցիաներ",
    "2:6": "Հարթաչափություն",
    "2:7": "Տարածաչափություն",
    "2:8": "Միացություններ",
    "3:1": "Հավասարումներ և անհավասարումներ",
    "3:2": "Ֆունկցիաներ",
    "3:3": "Հարթաչափություն",
    "3:4": "Տարածաչափություն",
  },
  "matem-2": {
    "1:1": "Թվաբանական առաջադրանքներ",
    "1:2": "Արտահայտությունների ձևափոխություններ և արժեքների հաշվում",
    "1:3": "Հավասարումներ",
    "1:4": "Անհավասարումներ",
    "1:5": "Տեքստային խնդիրներ",
    "1:6": "Պրոգրեսիաներ",
    "1:7": "Ֆունկցիաներ",
    "1:8": "Հարթաչափություն",
    "1:9": "Տարածաչափություն",
    "1:10": "Կոորդինատների մեթոդ, վեկտորներ",
    "2:1": "Արտահայտությունների ձևափոխություններ և արժեքների հաշվում",
    "2:2": "Հավասարումներ և անհավասարումներ",
    "2:3": "Տեքստային խնդիրներ",
    "2:4": "Ֆունկցիաներ",
    "2:5": "Հարթաչափություն",
    "2:6": "Տարածաչափություն",
    "2:7": "Կոորդինատների մեթոդ, վեկտորներ",
    "2:8": "Միացություններ",
    "3:1": "Թվաբանական առաջադրանքներ",
    "3:2": "Հավասարումներ և անհավասարումներ",
    "3:3": "Պրոգրեսիաներ",
    "3:4": "Ֆունկցիաներ",
    "3:5": "Հարթաչափություն",
    "3:6": "Տարածաչափություն",
  },
};
function sectionTitle(bookId: string, chapter: number, section: number) {
  return SECTION_TITLES[bookId]?.[`${chapter}:${section}`] ?? `Բաժին ${section}`;
}


// The official math-exam structure has not been verified against a math sample paper.
// Keep this as a 65-question practice test drawn from both source books, not an asserted official blueprint.

function useIndex() {
  return useQuery({
    queryKey: ["math-books-index"],
    queryFn: async (): Promise<Index> => {
      const r = await fetch("/data/math-books-index.json");
      if (!r.ok) throw new Error("load failed");
      return r.json();
    },
    staleTime: Infinity,
  });
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const taskKey = (x: Pick<Item, "book" | "chapter" | "section" | "task">) => `${x.book}:${x.chapter}:${x.section}:${x.task}`;
const sectionKey = (bookId: string, sec: IndexSection) => `${bookId}:${sec.chapter}:${sec.section}`;
const bookNo = (bookId: string) => Number(bookId.split("-")[1]);

/** Expand each source task into sub-questions. Infer answer mode per task, never across a whole section. */
function sectionItems(bookId: string, sec: IndexSection): Item[] {
  const out: Item[] = [];
  for (const t of sec.tasks) {
    const open = isOpenSection([t]);
    const subs = t.answers ? t.answers.length : t.sub_count;
    for (let i = 0; i < subs; i++) {
      const answer = t.answers?.[i];
      if (answer === undefined) continue;
      const kind: Kind = answer === "T" || answer === "F" ? "tf" : open ? "open" : "choice";
      out.push({
        id: `${bookId}:${sec.chapter}:${sec.section}:${t.task}:${i + 1}`,
        book: bookId,
        chapter: sec.chapter,
        section: sec.section,
        task: t.task,
        sub: i + 1,
        subs,
        segments: t.sub_segments?.[i] ?? t.segments,
        split: !!t.sub_segments,
        answer,
        kind,
      });
    }
  }
  return out;
}

function byBookOrder(a: Item, b: Item) {
  return (
    bookNo(a.book) - bookNo(b.book) ||
    a.chapter - b.chapter ||
    a.section - b.section ||
    a.task - b.task ||
    a.sub - b.sub
  );
}

/** Build a balanced 65-question practice exam: 32 from one book and 33 from the other. */
function pickSample(index: Index, excluded: Set<string>): Item[] {
  const targets = shuffle([
    { bookId: BOOK_IDS[0], count: 32 },
    { bookId: BOOK_IDS[1], count: 33 },
  ]);
  const picked: Item[] = [];

  for (const { bookId, count } of targets) {
    const sections = index.books[bookId]?.sections ?? [];
    const keys = new Set(sections.map((sec) => sectionKey(bookId, sec)));
    const groups = shuffle(selectedGroups(index, [bookId], keys));
    const freshGroups = groups.filter((group) => group.some((item) => !excluded.has(item.id)));
    const orderedGroups = [...freshGroups, ...groups.filter((group) => !freshGroups.includes(group))];
    const bookPicked: Item[] = [];

    for (const group of orderedGroups) {
      if (bookPicked.length >= count) break;
      const freshItems = group.filter((item) => !excluded.has(item.id));
      const candidates = freshItems.length ? freshItems : group;
      const room = count - bookPicked.length;
      bookPicked.push(...candidates.slice(0, room));
    }

    if (bookPicked.length !== count) {
      throw new Error(`Math book ${bookId} needs ${count} answerable questions; found ${bookPicked.length}.`);
    }
    picked.push(...bookPicked);
  }

  if (picked.length !== EXAM_SIZE || new Set(picked.map((item) => item.id)).size !== EXAM_SIZE) {
    throw new Error(`Math exam must contain exactly ${EXAM_SIZE} unique questions.`);
  }
  return shuffle(picked);
}
/** Items of the chosen sections, grouped by task so a task's sub-questions are picked together. */
function selectedGroups(index: Index, books: string[], keys: Set<string>): Item[][] {
  const groups: Item[][] = [];
  for (const bookId of books) {
    for (const sec of index.books[bookId]?.sections ?? []) {
      if (!keys.has(sectionKey(bookId, sec))) continue;
      const byTask = new Map<number, Item[]>();
      for (const it of sectionItems(bookId, sec)) {
        if (!byTask.has(it.task)) byTask.set(it.task, []);
        byTask.get(it.task)!.push(it);
      }
      groups.push(...byTask.values());
    }
  }
  return groups;
}

/** Custom test: whole tasks while they fit, then the first sub-questions of the next task to reach `count` exactly. */
function buildCustom(index: Index, books: string[], keys: Set<string>, count: number): Item[] {
  const out: Item[] = [];
  for (const g of shuffle(selectedGroups(index, books, keys))) {
    const room = count - out.length;
    if (room <= 0) break;
    out.push(...g.slice(0, room));
  }
  return out.sort(byBookOrder);
}

/** Sections of one book grouped by chapter, in book order. */
function byChapter(sections: IndexSection[]) {
  const map = new Map<number, IndexSection[]>();
  for (const s of sections) {
    if (!map.has(s.chapter)) map.set(s.chapter, []);
    map.get(s.chapter)!.push(s);
  }
  return [...map.entries()];
}

function readLast(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LAST_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}
function writeLast(ids: string[]) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable: the exam still works, just not deduplicated across reloads */
  }
}

/** Consecutive items of the same task share one picture. */
function groupItems(items: Item[]) {
  const groups: { key: string; first: Item; rows: Item[] }[] = [];
  for (const it of items) {
    const key = it.split ? `${taskKey(it)}#${it.sub}` : taskKey(it);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.rows.push(it);
    else groups.push({ key, first: it, rows: [it] });
  }
  return groups;
}

function TaskCrop({ book, segments }: { book: string; segments: Segment[] }) {
  const tx = useTx();
  return (
    <div className="space-y-3">
      {segments.map((s, i) => {
        const h = s.y1 - s.y0;
        if (h <= 0) return null;
        const src = `/math/books/${book}/p-${String(s.page).padStart(3, "0")}.jpg`;
        return (
          <div key={i} className="space-y-1">
            <div className="relative w-full overflow-hidden rounded-xl border bg-white" style={{ aspectRatio: `${PAGE_W} / ${h}` }}>
              <img
                src={src}
                alt=""
                decoding="async"
                className="block w-full max-w-none"
                style={{ marginTop: `-${(s.y0 / PAGE_W) * 100}%` }}
              />
            </div>
            <a href={src} target="_blank" rel="noreferrer" className="inline-flex text-xs font-medium text-blue-700 underline underline-offset-2">
              {tx("Բացել ամբողջ էջը")} ↗
            </a>
          </div>
        );
      })}
    </div>
  );
}

function answerLabel(item: Item, tx: ReturnType<typeof useTx>) {
  if (item.kind === "tf") return item.answer === "T" ? tx("Ճիշտ է") : tx("Սխալ է");
  if (item.kind === "choice") return `${item.answer})`;
  return item.answer;
}

function AnswerRow({
  item,
  n,
  value,
  submitted,
  onPick,
}: {
  item: Item;
  n: number;
  value: string | undefined;
  submitted: boolean;
  onPick: (v: string) => void;
}) {
  const tx = useTx();
  const answered = value !== undefined && value !== "";
  const ok = submitted && answered && isRight(item.answer, value!);
  const options: [string, string][] =
    item.kind === "tf" ? [["T", "Ճիշտ է"], ["F", "Սխալ է"]] : [["1", "1)"], ["2", "2)"], ["3", "3)"], ["4", "4)"]];

  return (
    <div className="space-y-2 rounded-2xl border p-3">
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{n}</span>
        <span className="text-xs text-muted-foreground">{tx("Առաջադրանք {n}, կետ {m}/{k}", { n: item.task, m: item.sub, k: item.subs })}</span>
      </div>

      {item.kind === "open" ? (
        <input
          type="text"
          inputMode="decimal"
          disabled={submitted}
          value={value ?? ""}
          onChange={(e) => onPick(e.target.value)}
          placeholder={tx("Պատասխան")}
          className="h-12 w-full rounded-2xl border-2 border-border bg-card px-4 text-base focus:border-blue-700 focus:outline-none disabled:opacity-80"
        />
      ) : (
        <div className={cn("grid gap-2", item.kind === "tf" ? "grid-cols-2" : "grid-cols-4")}>
          {options.map(([opt, text]) => {
            const selected = value === opt;
            const isRightBtn = submitted && item.answer === opt;
            const isWrong = submitted && selected && !isRightBtn;
            return (
              <button
                key={opt}
                type="button"
                disabled={submitted}
                onClick={() => onPick(opt)}
                className={cn(
                  "h-12 rounded-xl border-2 px-2 text-sm font-bold transition",
                  isRightBtn ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : isWrong ? "border-red-500 bg-red-50 text-red-700"
                  : selected ? "border-blue-700 bg-blue-50 text-blue-800"
                  : "border-border bg-card hover:bg-muted",
                )}
              >
                {tx(text)}
              </button>
            );
          })}
        </div>
      )}

      {submitted && (
        <p className={cn("text-sm font-bold", ok ? "text-emerald-700" : "text-red-700")}>
          {ok ? tx("Ճիշտ է ✓") : tx("Ճիշտ պատասխանը՝ {answer}", { answer: answerLabel(item, tx) })}
        </p>
      )}
      {submitted && (
        <MathExplain
          item={item.id}
          bookId={item.book}
          pages={taskPages(item.segments)}
          kind={item.kind === "tf" ? "tf" : item.kind === "open" ? "open" : "choice"}
          task={tx("Առաջադրանք {task}, հարց {sub}", { task: item.task, sub: item.sub })}
          correct={item.answer}
          chosen={value ?? null}
        />
      )}
    </div>
  );
}

function MathPage() {
  const q = useIndex();
  const { progress, addExam } = useMathProgress();
  const tx = useTx();

  // Setup
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"exam" | "custom">(initialMode ?? "exam");
  const [books, setBooks] = useState<string[]>([...BOOK_IDS]);
  const [keys, setKeys] = useState<Set<string> | null>(null);
  const [count, setCount] = useState(20);

  // Running test
  const [exam, setExam] = useState<Item[] | null>(null);
  const [examError, setExamError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

  useEffect(() => {
    if (!timerOn) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  // Every section is selected by default.
  const allKeys = useMemo(() => {
    const out = new Set<string>();
    if (!q.data) return out;
    for (const bookId of BOOK_IDS) for (const sec of q.data.books[bookId]?.sections ?? []) out.add(sectionKey(bookId, sec));
    return out;
  }, [q.data]);
  const selectedKeys = keys ?? allKeys;

  const available = useMemo(() => {
    if (!q.data) return 0;
    return selectedGroups(q.data, books, selectedKeys).reduce((n, g) => n + g.length, 0);
  }, [q.data, books, selectedKeys]);
  const maxCount = Math.max(1, Math.min(100, available));
  const shownCount = Math.min(count, maxCount);

  if (q.isLoading) return <p className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {tx("Բեռնվում է…")}</p>;
  if (q.error || !q.data) return <p className="p-6 text-destructive">{tx("Չհաջողվեց բեռնել թեստը։")}</p>;
  const index = q.data;

  function begin(items: Item[]) {
    setExamError(null);
    setExam(items);
    setAnswers({});
    setSubmitted(false);
    setSeconds(0);
    setTimerOn(true);
  }

  function start() {
    setExamError(null);
    try {
      if (mode === "exam") {
        const picked = pickSample(index, readLast());
        writeLast(picked.map((p) => p.id));
        begin(picked);
      } else {
        const picked = buildCustom(index, books, selectedKeys, shownCount);
        if (picked.length !== shownCount) {
          setExamError(tx("Ընտրված բաժիններում բավարար պատասխանելի հարցեր չկան։ Փոխիր բաժինները կամ հարցերի քանակը։"));
          return;
        }
        begin(picked);
      }
    } catch {
      setExamError(tx("Չհաջողվեց կազմել 65 հարցից բաղկացած թեստը։ Ստուգիր երկու մաթեմատիկայի գրքերի հարցերի տվյալները։"));
    }
  }

  function finish() {
    if (!exam) return;
    setSubmitted(true);
    setTimerOn(false);
    addExam(exam.filter(correctOf).length, exam.length);
  }

  const correctOf = (x: Item) => answers[x.id] !== undefined && answers[x.id] !== "" && isRight(x.answer, answers[x.id]);
  const correct = exam ? exam.filter(correctOf).length : 0;
  const answeredCount = exam ? exam.filter((x) => answers[x.id] !== undefined && answers[x.id] !== "").length : 0;
  const numbers = new Map((exam ?? []).map((it, i) => [it.id, i + 1]));

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4 lg:max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {tx("Գլխավոր էջ")}
        </Link>
        <Link to="/math/books" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">{tx("Գրքեր")} →</Link>
      </div>

      {!exam ? (
        <>
          <h1 className="text-2xl font-black sm:text-3xl">{tx("Մաթեմատիկայի թեստ")}</h1>
          {examError && <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive">{examError}</p>}
          {progress.exams[0] && (
            <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              {tx("Վերջին արդյունքը՝ {c} / {t}", { c: progress.exams[0].correct, t: progress.exams[0].total })}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ["exam", <Trophy key="t" />, "Փորձնական թեստ ({n})", "Երկու մաթեմատիկայի շտեմարաններից"],
              ["custom", <ListChecks key="l" />, "Ըստ բաժինների", "Ընտրիր շտեմարանները, բաժինները և քանակը"],
            ] as const).map(([k, icon, title, desc]) => (
              <button
                key={k}
                type="button"
                onClick={() => setMode(k)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-2xl border-2 bg-card p-4 text-left",
                  mode === k ? "border-primary" : "border-border hover:border-primary/40",
                )}
              >
                <span className="text-primary">{icon}</span>
                <span className="font-bold">{tx(title, { n: EXAM_SIZE })}</span>
                <span className="text-xs text-muted-foreground">{tx(desc)}</span>
              </button>
            ))}
          </div>

          <section className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5" aria-labelledby="math-pdf-books">
            <div className="space-y-1">
              <h2 id="math-pdf-books" className="text-lg font-bold">{tx("Բնօրինակ շտեմարանները՝ PDF ձևաչափով")}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{tx("Այս երկու ամբողջական PDF-երը հենց կայքում պահված են։ Կարող ես բացել կամ ներբեռնել դրանք՝ առանց արտաքին կայք վերահղվելու։ Թեստի հարցերն ընտրվում են նույն գրքերի առաջադրանքներից։")}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <a href="/math/books/matem-1.pdf" target="_blank" rel="noreferrer" className="group rounded-xl border p-4 transition-colors hover:border-primary/50 hover:bg-muted/40">
                <span className="block font-semibold">{tx("Մաթեմատիկա · Մաս 1")}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{tx("Ամբողջական PDF · 288 էջ")}</span>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">{tx("Բացել PDF-ը")} ↗</span>
              </a>
              <a href="/math/books/matem-2.pdf" target="_blank" rel="noreferrer" className="group rounded-xl border p-4 transition-colors hover:border-primary/50 hover:bg-muted/40">
                <span className="block font-semibold">{tx("Մաթեմատիկա · Մաս 2")}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{tx("Ամբողջական PDF · 320 էջ")}</span>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">{tx("Բացել PDF-ը")} ↗</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground">{tx("Յուրաքանչյուր առաջադրանք թեստում ցուցադրվում է բնօրինակ գրքի էջից, իսկ պատասխանը ստուգվում է գրքի պատասխանների հիման վրա։")}</p>
          </section>

          <div className="shadow-card space-y-5 rounded-2xl border bg-card p-5">
            {mode === "exam" ? (
              <p className="text-sm leading-relaxed">
                {tx("{n} հարց՝ պատահական ընտրված երկու մաթեմատիկայի շտեմարաններից։ Սա փորձնական թեստ է, ոչ թե հաստատված պաշտոնական քննության կառուցվածքի պատճեն։", { n: EXAM_SIZE })}
                {tx("Յուրաքանչյուր նոր թեստում հարցերը տարբեր են նախորդից։")}
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">{tx("Շտեմարաններ")}</p>
                  <div className="flex flex-wrap gap-2">
                    {BOOK_IDS.map((id) => {
                      const on = books.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setBooks((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]))}
                          className={cn(
                            "h-10 rounded-xl border-2 px-4 text-sm font-bold",
                            on ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                          )}
                        >
                          {tx(BOOK_NAMES[id])}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{tx("Բաժիններ")}</p>
                    <div className="flex gap-2 text-xs font-semibold">
                      <button type="button" className="text-primary hover:underline" onClick={() => setKeys(new Set(allKeys))}>{tx("Ընտրել բոլորը")}</button>
                      <button type="button" className="text-muted-foreground hover:underline" onClick={() => setKeys(new Set())}>{tx("Մաքրել")}</button>
                    </div>
                  </div>
                  {books.map((bookId) => (
                    <div key={bookId} className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{tx(BOOK_NAMES[bookId])}</p>
                      {byChapter(index.books[bookId]?.sections ?? []).map(([chapter, secs]) => (
                      <div key={chapter} className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">{tx("Գլուխ {n}", { n: chapter })}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {secs.map((sec) => {
                          const k = sectionKey(bookId, sec);
                          const n = sectionItems(bookId, sec).length;
                          return (
                            <label key={k} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 hover:bg-muted/50">
                              <input
                                type="checkbox"
                                className="mt-1 size-4 accent-primary"
                                checked={selectedKeys.has(k)}
                                onChange={() => {
                                  const next = new Set(selectedKeys);
                                  if (next.has(k)) next.delete(k);
                                  else next.add(k);
                                  setKeys(next);
                                }}
                              />
                              <span className="min-w-0 text-sm">
                                <b>{tx("Բաժին {n}", { n: sec.section })}</b> <span className="text-muted-foreground">· {n}</span>
                                <span className="block text-xs leading-snug text-muted-foreground">{tx(sectionTitle(bookId, sec.chapter, sec.section))}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold">
                    {tx("Հարցերի քանակը՝ {n}", { n: shownCount })} <span className="font-normal text-muted-foreground">· {tx("հասանելի է՝ {n}", { n: available })}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[5, 10, 20, 40, 65].filter((n) => n <= maxCount).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCount(n)}
                        className={cn(
                          "h-10 min-w-12 rounded-xl border-2 px-3 text-sm font-bold",
                          shownCount === n ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <Slider min={1} max={maxCount} step={1} value={[shownCount]} onValueChange={(v) => setCount(v[0] ?? 20)} disabled={available === 0} />
                </div>
              </>
            )}

            {mode === "custom" && available === 0 && (
              <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">{tx("Ընտրիր առնվազն մեկ բաժին՝ թեստը սկսելու համար։")}</p>
            )}
            <Button
              className="h-12 w-full rounded-2xl"
              disabled={mode === "custom" && available === 0}
              onClick={start}
            >
              {tx("Սկսել · {n} հարց", { n: mode === "custom" ? shownCount : EXAM_SIZE })}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="sticky top-2 z-10 flex items-center justify-between gap-3 rounded-2xl border bg-background/95 p-4 shadow-md backdrop-blur">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{tx("Թեստ · Մաթեմատիկա")}</p>
              <p className="text-xs text-muted-foreground">
                {submitted ? tx("Արդյունք՝ {c} / {t}", { c: correct, t: exam.length }) : tx("{n} / {t} հարց պատասխանված", { n: answeredCount, t: exam.length })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono text-sm">
                <Timer className="size-4" />
                {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
              </span>
              {!submitted ? (
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={finish}>{tx("Ավարտել")}</Button>
              ) : (
                <Button variant="outline" onClick={() => setExam(null)}>
                  <RefreshCw className="mr-1 size-4" /> {tx("Նոր թեստ")}
                </Button>
              )}
            </div>
          </div>

          <MathTools />

          {groupItems(exam).map((g) => (
            <section key={g.key} className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {tx("{book} · Գլուխ {c} · Բաժին {s} · Առաջադրանք {t}", { book: tx(BOOK_NAMES[g.first.book]), c: g.first.chapter, s: g.first.section, t: g.first.task })}
              </p>
              <TaskCrop book={g.first.book} segments={g.first.segments} />
              <div className="space-y-3">
                {g.rows.map((it) => (
                  <AnswerRow
                    key={it.id}
                    item={it}
                    n={numbers.get(it.id) ?? 0}
                    value={answers[it.id]}
                    submitted={submitted}
                    onPick={(v) => setAnswers((a) => ({ ...a, [it.id]: v }))}
                  />
                ))}
              </div>
            </section>
          ))}

          {!submitted && (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={finish}>{tx("Ավարտել")}</Button>
          )}
          {submitted && (
            <p className="rounded-2xl bg-muted/60 p-4 text-center text-sm font-semibold">{tx("Արդյունք՝ {c} / {t}", { c: correct, t: exam.length })}</p>
          )}
        </>
      )}
    </div>
  );
}
