import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Timer, RefreshCw } from "lucide-react";
import { useMathProgress, isRight, isShortAnswer } from "@/lib/math-progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/math/")({
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
type BookSection = { chapter: number; section: number; pages: [number, number]; tasks: BookTask[] };
type Index = { books: Record<string, { title: string; sections: BookSection[] }> };

type PoolItem = {
  id: string;
  book: string;
  chapter: number;
  section: number;
  task: number;
  sub: number;
  segments: Segment[];
  answer: string;
};

const PAGE_W = 467.76;
const EXAM_SIZE = 65;
const LAST_KEY = "math-exam-last-ids";
const BOOK_NAMES: Record<string, string> = { "matem-1": "Մաթեմատիկա · Մաս 1", "matem-2": "Մաթեմատիկա · Մաս 2" };

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

function buildPool(index: Index): PoolItem[] {
  const pool: PoolItem[] = [];
  for (const [bookId, book] of Object.entries(index.books)) {
    for (const sec of book.sections) {
      // choice-type sections only (4 sub-questions with answers 1-4)
      for (const t of sec.tasks) {
        if (!t.answers || t.sub_count !== 4) continue;
        t.answers.forEach((ans, i) => {
          if (!["1", "2", "3", "4"].includes(ans)) return;
          pool.push({
            id: `${bookId}:${sec.chapter}:${sec.section}:${t.task}:${i + 1}`,
            book: bookId,
            chapter: sec.chapter,
            section: sec.section,
            task: t.task,
            sub: i + 1,
            segments: t.segments,
            answer: ans,
          });
        });
      }
    }
  }
  return pool;
}

// Structure of the sample test (9_1.pdf): 65 questions, each slot drawn from the matching book section.
// Questions 1–40 are the topics of chapter 1 sections 1–10 (4 each); 41–65 are short-answer questions from chapter 2.
const rep = (c: number, s: number, n: number): [number, number][] => Array.from({ length: n }, () => [c, s] as [number, number]);
const SAMPLE_STRUCTURE: [number, number][] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((s) => rep(1, s, 4)), // 1–40
  ...rep(2, 2, 4),  // 41–44 inequalities
  ...rep(2, 5, 1),  // 45 functions
  ...rep(2, 3, 4),  // 46–49 text problems
  ...rep(2, 6, 4),  // 50–53 planar geometry
  ...rep(2, 1, 4),  // 54–57 expressions
  ...rep(2, 5, 4),  // 58–61 functions
  ...rep(2, 8, 2),  // 62–63 combinatorics
  ...rep(2, 2, 1),  // 64 equations
  ...rep(2, 7, 1),  // 65 solid geometry
];

function allSubs(index: Index, bookId: string, chapter: number, section: number): PoolItem[] {
  const sec = index.books[bookId]?.sections.find((x) => x.chapter === chapter && x.section === section);
  if (!sec) return [];
  const out: PoolItem[] = [];
  for (const t of sec.tasks) {
    const subs = t.answers ? t.answers.length : t.sub_count;
    for (let i = 0; i < subs; i++) {
      const ans = t.answers?.[i];
      if (ans === undefined) continue;
      out.push({ id: `${bookId}:${chapter}:${section}:${t.task}:${i + 1}`, book: bookId, chapter, section, task: t.task, sub: i + 1, segments: t.segments, answer: ans });
    }
  }
  return out;
}

function pickSample(index: Index, excluded: Set<string>): PoolItem[] {
  const usedTasks = new Set<string>();
  const picked: PoolItem[] = [];
  SAMPLE_STRUCTURE.forEach(([chapter, section], slot) => {
    // Sample questions 41–65 are short-answer questions, so those slots use short-answer items only.
    const wantShort = slot >= 40;
    const all = allSubs(index, "matem-1", chapter, section).filter((x) => !usedTasks.has(`${x.chapter}:${x.section}:${x.task}`));
    const shortOnly = all.filter((x) => isShortAnswer(x.answer));
    const candidates = wantShort && shortOnly.length ? shortOnly : all;
    const fresh = candidates.filter((x) => !excluded.has(x.id));
    const pool = fresh.length ? fresh : candidates;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    usedTasks.add(`${pick.chapter}:${pick.section}:${pick.task}`);
    picked.push(pick);
  });
  return picked;
}

function pickRandom(pool: PoolItem[], count: number, excluded: Set<string>): PoolItem[] {
  // one sub-question per task so that the same task never appears twice
  const byTask = new Map<string, PoolItem[]>();
  for (const p of pool) {
    const key = `${p.book}:${p.chapter}:${p.section}:${p.task}`;
    if (!byTask.has(key)) byTask.set(key, []);
    byTask.get(key)!.push(p);
  }
  const fresh: PoolItem[] = [];
  const stale: PoolItem[] = [];
  for (const items of byTask.values()) {
    const pick = items[Math.floor(Math.random() * items.length)];
    (excluded.has(pick.id) ? stale : fresh).push(pick);
  }
  const shuffle = <T,>(a: T[]) => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
  return [...shuffle(fresh), ...shuffle(stale)].slice(0, count);
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
    /* storage unavailable: exam still works, just not deduplicated across reloads */
  }
}

type CropSegment = Segment & { src: string };

function TaskCrop({ segments }: { segments: CropSegment[] }) {
  return (
    <div className="space-y-2">
      {segments.map((s, i) => {
        const h = s.y1 - s.y0;
        if (h <= 0) return null;
        return (
          <div
            key={i}
            className="relative w-full overflow-hidden rounded-xl border bg-white"
            style={{ aspectRatio: `${PAGE_W} / ${h}` }}
          >
            <img
              src={`/math/books/${s.src}`}
              alt=""
              loading="lazy"
              className="block w-full max-w-none"
              style={{ marginTop: `-${(s.y0 / PAGE_W) * 100}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function MathPage() {
  const q = useIndex();
  const pool = useMemo(() => (q.data ? buildPool(q.data) : []), [q.data]);
  const [exam, setExam] = useState<PoolItem[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const { progress, addExam } = useMathProgress();

  useEffect(() => {
    if (!running || submitted) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running, submitted]);

  function generate() {
    const picked = q.data ? pickSample(q.data, readLast()) : [];
    writeLast(picked.map((p) => p.id));
    setExam(picked);
    setAnswers({});
    setSubmitted(false);
    setSeconds(0);
    setRunning(true);
  }

  if (q.isLoading) return <p className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Բեռնվում է…</p>;
  if (q.error || !q.data) return <p className="p-6 text-destructive">Չհաջողվեց բեռնել թեստը։</p>;

  const correctOf = (x: PoolItem) => answers[x.id] !== undefined && isRight(x.answer, answers[x.id]);
  const correct = exam ? exam.filter(correctOf).length : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Գլխավոր էջ
      </Link>
      <Link to="/math/books" className="ml-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">Գրքեր →</Link>

      <div className="sticky top-2 z-10 flex items-center justify-between gap-3 rounded-2xl border bg-background/95 p-4 shadow-md backdrop-blur">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">Թեստ · Մաթեմատիկա</p>
          <p className="text-xs text-muted-foreground">
            {!exam ? "Նոր թեստ՝ պատահական հարցերով" : submitted ? `Արդյունք՝ ${correct} / ${exam.length}` : `${Object.keys(answers).length} / ${exam.length} հարց պատասխանված`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {exam && running && <span className="flex items-center gap-1 font-mono text-sm"><Timer className="size-4" />{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>}
          {!exam ? (
            <Button onClick={generate}>Սկսել</Button>
          ) : !submitted ? (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setSubmitted(true); setRunning(false); if (exam) addExam(exam.filter(correctOf).length, exam.length); }}>Ավարտել</Button>
          ) : (
            <Button variant="outline" onClick={generate}><RefreshCw className="mr-1 size-4" /> Նոր թեստ</Button>
          )}
        </div>
      </div>

      {!exam && progress.exams[0] && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Վերջին արդյունքը՝ {progress.exams[0].correct} / {progress.exams[0].total}</p>}
      {!exam && <p className="rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed">Թեստը կազմվում է մաթեմատիկայի գրքերի հարցերից։ Յուրաքանչյուր նոր թեստում հարցերը տարբեր են նախորդից։</p>}

      {exam && exam.map((item, idx) => {
        const given = answers[item.id];
        const ok = submitted && isRight(item.answer, given ?? "");
        return (
          <section key={item.id} className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{idx + 1}</span>
              <span className="text-xs text-muted-foreground">
                {BOOK_NAMES[item.book]} · Գլուխ {item.chapter} · Բաժին {item.section} · Առաջադրանք {item.task}, կետ {item.sub}
              </span>
            </div>
            <TaskCrop segments={item.segments.map((s) => ({ ...s, src: `${item.book}/p-${String(s.page).padStart(3, "0")}.jpg` }))} />
            {isShortAnswer(item.answer) ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    disabled={submitted}
                    value={answers[item.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [item.id]: e.target.value }))}
                    placeholder="Պատասխան"
                    className="h-12 flex-1 rounded-2xl border-2 border-stone-300 bg-white px-4 text-base focus:border-blue-700 focus:outline-none"
                  />
                </div>
                {submitted && <p className={`text-sm font-bold ${correctOf(item) ? "text-emerald-700" : "text-red-700"}`}>{correctOf(item) ? "Ճիշտ է ✓" : `Ճիշտ պատասխանը՝ ${item.answer}`}</p>}
              </div>
            ) : (
            <>
            <div className="grid grid-cols-4 gap-2">
              {["1", "2", "3", "4"].map((opt) => {
                const selected = given === opt;
                const rightBtn = submitted && item.answer === opt;
                const isWrong = submitted && selected && !rightBtn;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [item.id]: opt }))}
                    className={`h-12 rounded-xl border-2 text-base font-bold transition ${
                      rightBtn ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : isWrong ? "border-red-500 bg-red-50 text-red-700"
                      : selected ? "border-blue-700 bg-blue-50 text-blue-800"
                      : "border-stone-300 bg-white hover:bg-stone-50"}`}
                  >
                    {opt})
                  </button>
                );
              })}
            </div>
            {submitted && <p className={`text-sm ${ok ? "text-emerald-700" : "text-red-700"}`}>{ok ? "Ճիշտ է ✓" : `Ճիշտ պատասխանը՝ ${item.answer})`}</p>}
            </>
            )}
          </section>
        );
      })}
    </div>
  );
}
