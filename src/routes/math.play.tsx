import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MathExplain, taskPages } from "@/components/MathExplain";
import { MathTools } from "@/components/MathTools";
import { useMathProgress, isRight, isShortAnswer, isOpenSection } from "@/lib/math-progress";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/math/play")({
  head: () => ({
    meta: [
      { title: "Մաթեմատիկա · Խաղ · Shtemarm" },
      { name: "description", content: "Մաթեմատիկայի բաժնի խաղ և թեստ" },
    ],
  }),
  component: PlayPage,
});

type Segment = { page: number; y0: number; y1: number };
type BookTask = { task: number; segments: Segment[]; answers: string[] | null; sub_count: number; sub_segments?: Segment[][]; questions?: { prompt: string; options: string[] }[] };
type BookSection = { chapter: number; section: number; title: string; tasks: BookTask[] };
type Index = { books: Record<string, { title: string; sections: BookSection[] }> };
type Item = { id: string; bookId: string; task: number; sub: number; subs: number; segments: Segment[]; answer: string | undefined; open: boolean; prompt?: string; options?: string[] };

const PAGE_W = 467.76;
const TEST_SIZE = 20;
const LIVES = 3;

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

function sectionItems(index: Index, bookId: string, chapter: number, section: number) {
  const book = index.books[bookId];
  const sec = book?.sections.find((s) => s.chapter === chapter && s.section === section);
  if (!sec) return { title: "", items: [] as Item[] };
  // Determine answer format per task, not per section: sections may contain both
  // multiple-choice tasks and typed-answer tasks. A numeric typed answer such as "2"
  // must remain typed input when another sub-answer in that same task is numeric.
  const items: Item[] = [];
  for (const t of sec.tasks) {
    const subs = t.answers ? t.answers.length : t.sub_count;
    const open = isOpenSection([t]);
    for (let i = 0; i < subs; i++) {
      items.push({
        id: `${bookId}:${chapter}:${section}:${t.task}:${i + 1}`,
        bookId,
        task: t.task,
        sub: i + 1,
        subs,
        segments: t.sub_segments?.[i] ?? t.segments,
        answer: t.answers?.[i],
        open,
        prompt: t.questions?.[i]?.prompt,
        options: t.questions?.[i]?.options,
      });
    }
  }
  return { title: sec.title, items };
}

function Crop({ bookId, segments }: { bookId: string; segments: Segment[] }) {
  return (
    <div className="space-y-2">
      {segments.map((s, i) => {
        const h = s.y1 - s.y0;
        if (h <= 0) return null;
        return (
          <div key={i} className="relative w-full overflow-hidden rounded-xl border bg-white" style={{ aspectRatio: `${PAGE_W} / ${h}` }}>
            <img
              src={`/math/books/${bookId}/p-${String(s.page).padStart(3, "0")}.jpg`}
              alt=""
              className="block w-full max-w-none"
              style={{ marginTop: `-${(s.y0 / PAGE_W) * 100}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Answer control for one sub-question. Options are lettered like the English game (1) 2) 3) 4)). */
function AnswerBlock({ item, value, locked, onAnswer }: { item: Item; value?: string; locked: boolean; onAnswer: (v: string) => void }) {
  const tx = useTx();
  const [draft, setDraft] = useState("");
  const correct = item.answer;
  const short = item.open || correct === undefined || isShortAnswer(correct);
  const answered = value !== undefined;
  const ok = answered && correct !== undefined && isRight(correct, value);

  if (short) {
    if (!answered && !locked) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && draft.trim() && onAnswer(draft.trim())}
            placeholder={tx("Պատասխան")}
            className="h-12 flex-1 rounded-2xl border-2 border-border bg-card px-4 text-base focus:border-blue-700 focus:outline-none"
          />
          <Button className="h-12 rounded-2xl px-6" disabled={!draft.trim()} onClick={() => onAnswer(draft.trim())}>{tx("Ստուգել")}</Button>
        </div>
      );
    }
    return (
      <p className={`rounded-2xl border-2 p-4 text-base font-bold ${ok ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-red-500 bg-red-50 text-red-700"}`}>
        {value ?? "—"} {ok ? "✓" : tx("✗ · ճիշտ՝ {c}", { c: correct ?? "—" })}
      </p>
    );
  }

  const choices = correct === "T" || correct === "F" ? [["T", "Ճիշտ է"], ["F", "Սխալ է"]] : [["1", item.options?.[0] ?? "1)"], ["2", item.options?.[1] ?? "2)"], ["3", item.options?.[2] ?? "3)"], ["4", item.options?.[3] ?? "4)"]];
  return (
    <div className="space-y-3">
      {choices.map(([c, label]) => {
        const isCorrectBtn = answered && correct === c;
        const isWrongBtn = value === c && correct !== c;
        return (
          <button
            key={c}
            type="button"
            disabled={locked || answered}
            onClick={() => onAnswer(c)}
            className={`flex w-full items-center gap-4 rounded-2xl border-2 bg-card px-5 py-4 text-left text-base transition ${
              isCorrectBtn ? "border-emerald-600 bg-emerald-50 text-emerald-800"
              : isWrongBtn ? "border-red-500 bg-red-50 text-red-700"
              : "border-stone-300 hover:bg-muted"}`}
          >
            <span className="w-8 shrink-0 text-lg font-semibold text-stone-500">{c === "T" || c === "F" ? "" : tx(label)}</span>
            <span className="font-medium">{c === "T" || c === "F" ? tx(label) : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

function PlayPage() {
  const q = useIndex();
  const { progress, setAnswer, addExam } = useMathProgress();
  const tx = useTx();
  const [params, setParams] = useState<{ book: string; chapter: number; section: number; mode: string } | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const [ch, se] = (sp.get("sec") ?? "1-1").split("-").map(Number);
    setParams({ book: sp.get("book") ?? "matem-1", chapter: ch, section: se, mode: sp.get("mode") ?? "play" });
  }, []);

  const section = useMemo(() => {
    if (!q.data || !params) return { title: "", items: [] as Item[] };
    return sectionItems(q.data, params.book, params.chapter, params.section);
  }, [q.data, params]);

  const isTest = params?.mode === "test";
  const [round, setRound] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [streak, setStreak] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!section.items.length) return;
    setRound(isTest ? shuffle(section.items).slice(0, TEST_SIZE) : section.items);
    setIndex(0);
    setLives(LIVES);
    setStreak(0);
    setTestAnswers({});
    setSubmitted(false);
  }, [section.items, isTest]);

  if (q.isLoading || !params) return <p className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {tx("Բեռնվում է…")}</p>;
  if (q.error || !q.data) return <p className="p-6 text-destructive">{tx("Չհաջողվեց բեռնել բաժինը։")}</p>;
  if (!section.items.length) return <p className="p-6 text-destructive">{tx("Բաժինը չի գտնվել։")}</p>;

  const sectionHref = `/math/books?book=${params.book}&sec=${params.chapter}-${params.section}`;
  const bookTitle = q.data.books[params.book]?.title ?? "";
  const correctOf = (it: Item, v: string | undefined) => v !== undefined && it.answer !== undefined && isRight(it.answer, v);

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <a href={sectionHref} className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4 shrink-0" />
        <span className="truncate">{bookTitle} · {tx("Բաժին {n}", { n: params.section })}</span>
      </a>
      {!isTest && (
        <div className="flex rounded-2xl bg-muted/70 p-1 text-sm font-bold">
          <span className="rounded-xl bg-card px-4 py-2 shadow-sm">{tx("Խաղային")}</span>
          <a href={sectionHref} className="rounded-xl px-4 py-2 text-muted-foreground">{tx("Դասական")}</a>
        </div>
      )}
    </div>
  );

  if (isTest) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4 lg:max-w-3xl">
        {header}
        <MathTools />
        <p className="text-sm font-bold">{tx("Թեստ · {n} հարց", { n: round.length })} · {tx(section.title)}</p>
        {round.map((it, idx) => (
          <section key={it.id} className="space-y-3 rounded-2xl border bg-card p-3 shadow-sm sm:rounded-3xl sm:p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{tx("Առաջադրանք {t} • Հարց {n} / {k} • {i} / {r}", { t: it.task, n: it.sub, k: it.subs, i: idx + 1, r: round.length })}</p>
            {it.prompt ? <div className="rounded-xl bg-muted/40 p-3 text-[15px] leading-relaxed sm:p-4 sm:text-base"><p className="font-semibold">{it.prompt}</p></div> : <Crop bookId={it.bookId} segments={it.segments} />}
            <AnswerBlock item={it} value={testAnswers[it.id]} locked={submitted} onAnswer={(v) => setTestAnswers((a) => ({ ...a, [it.id]: v }))} />
          </section>
        ))}
        {!submitted ? (
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => {
            setSubmitted(true);
            addExam(round.filter((x) => correctOf(x, testAnswers[x.id])).length, round.length);
          }}>{tx("Ավարտել")}</Button>
        ) : (
          <p className="rounded-2xl bg-muted/60 p-4 text-center text-sm font-semibold">{tx("Արդյունք՝ {c} / {t}", { c: round.filter((x) => correctOf(x, testAnswers[x.id])).length, t: round.length })}</p>
        )}
      </div>
    );
  }

  // Խաղային (game) mode, laid out like the English game screen
  const it = round[index];
  const answeredCount = round.filter((x) => progress.answers[x.id] !== undefined).length;
  const current = it ? progress.answers[it.id] : undefined;
  const gameOver = lives <= 0;
  const finished = !it || (index === round.length - 1 && current !== undefined);
  const short = it ? it.open || it.answer === undefined || isShortAnswer(it.answer) : false;

  const onAnswer = (v: string) => {
    if (!it || current !== undefined) return;
    setAnswer(it.id, v);
    if (correctOf(it, v)) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
      setLives((l) => l - 1);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4 lg:max-w-3xl">
      {header}
      <MathTools />

      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: LIVES }, (_, i) => (
            <Heart key={i} className={`size-7 ${i < lives ? "fill-red-500 text-red-500" : "text-stone-300"}`} />
          ))}
        </div>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${round.length ? (answeredCount / round.length) * 100 : 0}%` }} />
        </div>
        <span className="flex items-center gap-1 text-sm font-black text-amber-600">
          <Zap className="size-5" /> ×{streak}
        </span>
      </div>

      {gameOver || finished ? (
        <section className="space-y-3 rounded-3xl border bg-card p-6 text-center shadow-sm">
          <p className="text-xl font-black">{gameOver ? tx("Կյանքերն ավարտվեցին") : tx("Խաղն ավարտված է")}</p>
          <p className="text-sm text-muted-foreground">
            {tx("Ճիշտ՝ {c} / {t}", { c: round.filter((x) => correctOf(x, progress.answers[x.id])).length, t: answeredCount })}
          </p>
          <Button className="w-full" onClick={() => {
            setIndex(0); setLives(LIVES); setStreak(0);
            setRound(section.items);
          }}>{tx("Նորից")}</Button>
        </section>
      ) : (
        <section className="space-y-4 rounded-3xl border bg-card p-5 shadow-sm">
          <div className="space-y-1">
            <p className="text-base font-bold text-blue-700">
              {short ? tx("Գրել պատասխանը:") : tx("Ընտրել ճիշտ տարբերակը:")}
            </p>
            <p className="text-sm italic text-muted-foreground">
              {short ? "Write the answer." : "Choose the right answer."}
            </p>
          </div>

          <Crop bookId={it.bookId} segments={it.segments} />

          <div className="space-y-4 rounded-2xl border bg-card p-3 sm:rounded-3xl sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{it.sub}</span>
              <p className="font-bold">{tx("Առաջադրանք {t} · Հարց {n} / {k}", { t: it.task, n: it.sub, k: it.subs })}</p>
            </div>
            <AnswerBlock item={it} value={current} locked={lives <= 0} onAnswer={onAnswer} />
            {current !== undefined && (
              <MathExplain
                item={it.id}
                bookId={it.bookId}
                pages={taskPages(it.segments)}
                kind={it.open ? "open" : it.answer === "T" || it.answer === "F" ? "tf" : "choice"}
                task={tx("Առաջադրանք {task}, հարց {sub}", { task: it.task, sub: it.sub })}
                correct={it.answer ?? ""}
                chosen={current}
              />
            )}
            {current !== undefined && (
              <Button className="h-12 w-full rounded-2xl" onClick={() => setIndex((i) => i + 1)}>{tx("Հաջորդը")}</Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">{index + 1} / {round.length}</p>
        </section>
      )}
    </div>
  );
}
