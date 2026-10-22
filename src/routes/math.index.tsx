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
type BookTask = { task: number; segments: Segment[]; answers: string[] | null; sub_count: number };
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
  answer: string;
  kind: Kind;
};

const PAGE_W = 467.76;
const EXAM_SIZE = 65;
const LAST_KEY = "math-exam-last-ids";
const BOOK_IDS = ["matem-1", "matem-2"] as const;
const BOOK_NAMES: Record<string, string> = { "matem-1": "Մաթեմատիկա · Մաս 1", "matem-2": "Մաթեմատիկա · Մաս 2" };

// Structure of the sample exam: 65 questions, each slot drawn from the matching section of Part 1.
// Questions 1–40 are chapter 1 sections 1–10 (4 each); 41–65 are typed-answer questions from chapter 2.
const rep = (c: number, s: number, n: number): [number, number][] => Array.from({ length: n }, () => [c, s] as [number, number]);
const SAMPLE_STRUCTURE: [number, number][] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((s) => rep(1, s, 4)), // 1–40
  ...rep(2, 2, 4), // 41–44 inequalities
  ...rep(2, 5, 1), // 45 functions
  ...rep(2, 3, 4), // 46–49 text problems
  ...rep(2, 6, 4), // 50–53 planar geometry
  ...rep(2, 1, 4), // 54–57 expressions
  ...rep(2, 5, 4), // 58–61 functions
  ...rep(2, 8, 2), // 62–63 combinatorics
  ...rep(2, 2, 1), // 64 equations
  ...rep(2, 7, 1), // 65 solid geometry
];

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

/** Every sub-question of one section, with its answer kind decided per section (see isOpenSection). */
function sectionItems(bookId: string, sec: IndexSection): Item[] {
  const open = isOpenSection(sec.tasks);
  const out: Item[] = [];
  for (const t of sec.tasks) {
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
        segments: t.segments,
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

/** Sample exam: one question per slot, drawn from the matching section of Part 1, never repeating a task. */
function pickSample(index: Index, excluded: Set<string>): Item[] {
  const usedTasks = new Set<string>();
  const picked: Item[] = [];
  const sections = index.books["matem-1"]?.sections ?? [];
  SAMPLE_STRUCTURE.forEach(([chapter, section], slot) => {
    const sec = sections.find((x) => x.chapter === chapter && x.section === section);
    if (!sec) return;
    const wantOpen = slot >= 40;
    const all = sectionItems("matem-1", sec).filter((x) => !usedTasks.has(taskKey(x)));
    const typed = all.filter((x) => x.kind === "open");
    const candidates = wantOpen && typed.length ? typed : all;
    const fresh = candidates.filter((x) => !excluded.has(x.id));
    const pool = fresh.length ? fresh : candidates;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    usedTasks.add(taskKey(pick));
    picked.push(pick);
  });
  return picked;
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
    const key = taskKey(it);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.rows.push(it);
    else groups.push({ key, first: it, rows: [it] });
  }
  return groups;
}

function TaskCrop({ book, segments }: { book: string; segments: Segment[] }) {
  return (
    <div className="space-y-2">
      {segments.map((s, i) => {
        const h = s.y1 - s.y0;
        if (h <= 0) return null;
        return (
          <div key={i} className="relative w-full overflow-hidden rounded-xl border bg-white" style={{ aspectRatio: `${PAGE_W} / ${h}` }}>
            <img
              src={`/math/books/${book}/p-${String(s.page).padStart(3, "0")}.jpg`}
              alt=""
              decoding="async"
              className="block w-full max-w-none"
              style={{ marginTop: `-${(s.y0 / PAGE_W) * 100}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function answerLabel(item: Item) {
  if (item.kind === "tf") return item.answer === "T" ? "Ճիշտ է" : "Սխալ է";
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
  const answered = value !== undefined && value !== "";
  const ok = submitted && answered && isRight(item.answer, value!);
  const options: [string, string][] =
    item.kind === "tf" ? [["T", "Ճիշտ է"], ["F", "Սխալ է"]] : [["1", "1)"], ["2", "2)"], ["3", "3)"], ["4", "4)"]];

  return (
    <div className="space-y-2 rounded-2xl border p-3">
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{n}</span>
        <span className="text-xs text-muted-foreground">Առաջադրանք {item.task}, կետ {item.sub}/{item.subs}</span>
      </div>

      {item.kind === "open" ? (
        <input
          type="text"
          inputMode="decimal"
          disabled={submitted}
          value={value ?? ""}
          onChange={(e) => onPick(e.target.value)}
          placeholder="Պատասխան"
          className="h-12 w-full rounded-2xl border-2 border-stone-300 bg-white px-4 text-base focus:border-blue-700 focus:outline-none disabled:opacity-80"
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
                  : "border-stone-300 bg-white hover:bg-stone-50",
                )}
              >
                {text}
              </button>
            );
          })}
        </div>
      )}

      {submitted && (
        <p className={cn("text-sm font-bold", ok ? "text-emerald-700" : "text-red-700")}>
          {ok ? "Ճիշտ է ✓" : `Ճիշտ պատասխանը՝ ${answerLabel(item)}`}
        </p>
      )}
      {submitted && (
        <MathExplain
          item={item.id}
          bookId={item.book}
          pages={taskPages(item.segments)}
          kind={item.kind === "tf" ? "tf" : item.kind === "open" ? "open" : "choice"}
          task={`Առաջադրանք ${item.task}, հարց ${item.sub}`}
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

  // Setup
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"exam" | "custom">(initialMode ?? "exam");
  const [books, setBooks] = useState<string[]>([...BOOK_IDS]);
  const [keys, setKeys] = useState<Set<string> | null>(null);
  const [count, setCount] = useState(20);

  // Running test
  const [exam, setExam] = useState<Item[] | null>(null);
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

  if (q.isLoading) return <p className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Բեռնվում է…</p>;
  if (q.error || !q.data) return <p className="p-6 text-destructive">Չհաջողվեց բեռնել թեստը։</p>;
  const index = q.data;

  function begin(items: Item[]) {
    setExam(items);
    setAnswers({});
    setSubmitted(false);
    setSeconds(0);
    setTimerOn(true);
  }

  function start() {
    if (mode === "exam") {
      const picked = pickSample(index, readLast());
      writeLast(picked.map((p) => p.id));
      begin(picked);
    } else {
      begin(buildCustom(index, books, selectedKeys, shownCount));
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
          <ArrowLeft className="size-4" /> Գլխավոր էջ
        </Link>
        <Link to="/math/books" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">Գրքեր →</Link>
      </div>

      {!exam ? (
        <>
          <h1 className="text-2xl font-black sm:text-3xl">Մաթեմատիկայի թեստ</h1>
          {progress.exams[0] && (
            <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              Վերջին արդյունքը՝ {progress.exams[0].correct} / {progress.exams[0].total}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ["exam", <Trophy key="t" />, `Քննություն (${EXAM_SIZE})`, "Քննության կառուցվածքով, Մաս 1-ից"],
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
                <span className="font-bold">{title}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </button>
            ))}
          </div>

          <div className="shadow-card space-y-5 rounded-2xl border bg-card p-5">
            {mode === "exam" ? (
              <p className="text-sm leading-relaxed">
                {EXAM_SIZE} հարց՝ քննության իրական կառուցվածքով։ Առաջին 40-ը՝ առաջին գլխի բաժիններից, մնացածը՝ երկրորդ գլխից՝ բաց պատասխաններով։
                Յուրաքանչյուր նոր թեստում հարցերը տարբեր են նախորդից։
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Շտեմարաններ</p>
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
                          {BOOK_NAMES[id]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Բաժիններ</p>
                    <div className="flex gap-2 text-xs font-semibold">
                      <button type="button" className="text-primary hover:underline" onClick={() => setKeys(new Set(allKeys))}>Ընտրել բոլորը</button>
                      <button type="button" className="text-muted-foreground hover:underline" onClick={() => setKeys(new Set())}>Մաքրել</button>
                    </div>
                  </div>
                  {books.map((bookId) => (
                    <div key={bookId} className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{BOOK_NAMES[bookId]}</p>
                      {byChapter(index.books[bookId]?.sections ?? []).map(([chapter, secs]) => (
                      <div key={chapter} className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Գլուխ {chapter}</p>
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
                                <b>Բաժին {sec.section}</b> <span className="text-muted-foreground">· {n}</span>
                                <span className="block text-xs leading-snug text-muted-foreground">{sec.title}</span>
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
                    Հարցերի քանակը՝ {shownCount} <span className="font-normal text-muted-foreground">· հասանելի է՝ {available}</span>
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
              <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Ընտրիր առնվազն մեկ բաժին՝ թեստը սկսելու համար։</p>
            )}
            <Button
              className="h-12 w-full rounded-2xl"
              disabled={mode === "custom" && available === 0}
              onClick={start}
            >
              Սկսել{mode === "custom" ? ` · ${shownCount} հարց` : ` · ${EXAM_SIZE} հարց`}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="sticky top-2 z-10 flex items-center justify-between gap-3 rounded-2xl border bg-background/95 p-4 shadow-md backdrop-blur">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Թեստ · Մաթեմատիկա</p>
              <p className="text-xs text-muted-foreground">
                {submitted ? `Արդյունք՝ ${correct} / ${exam.length}` : `${answeredCount} / ${exam.length} հարց պատասխանված`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono text-sm">
                <Timer className="size-4" />
                {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
              </span>
              {!submitted ? (
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={finish}>Ավարտել</Button>
              ) : (
                <Button variant="outline" onClick={() => setExam(null)}>
                  <RefreshCw className="mr-1 size-4" /> Նոր թեստ
                </Button>
              )}
            </div>
          </div>

          <MathTools />

          {groupItems(exam).map((g) => (
            <section key={g.key} className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {BOOK_NAMES[g.first.book]} · Գլուխ {g.first.chapter} · Բաժին {g.first.section} · Առաջադրանք {g.first.task}
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
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={finish}>Ավարտել</Button>
          )}
          {submitted && (
            <p className="rounded-2xl bg-muted/60 p-4 text-center text-sm font-semibold">Արդյունք՝ {correct} / {exam.length}</p>
          )}
        </>
      )}
    </div>
  );
}
