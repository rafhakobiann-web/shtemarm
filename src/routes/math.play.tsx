import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMathProgress, isRight, isShortAnswer } from "@/lib/math-progress";

export const Route = createFileRoute("/math/play")({
  head: () => ({
    meta: [
      { title: "Մաթեմատիկա · Բաժին · Շտեմարան" },
      { name: "description", content: "Մաթեմատիկայի բաժնի խաղ և թեստ" },
    ],
  }),
  component: PlayPage,
});

type Segment = { page: number; y0: number; y1: number };
type BookTask = { task: number; segments: Segment[]; answers: string[] | null; sub_count: number };
type BookSection = { chapter: number; section: number; title: string; tasks: BookTask[] };
type Index = { books: Record<string, { title: string; sections: BookSection[] }> };
type Item = { id: string; bookId: string; chapter: number; section: number; title: string; task: number; sub: number; subs: number; segments: Segment[]; answer: string | undefined };

const PAGE_W = 467.76;
const TEST_SIZE = 20;

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

function sectionItems(index: Index, bookId: string, chapter: number, section: number): Item[] {
  const book = index.books[bookId];
  const sec = book?.sections.find((s) => s.chapter === chapter && s.section === section);
  if (!sec) return [];
  const out: Item[] = [];
  for (const t of sec.tasks) {
    const subs = t.answers ? t.answers.length : t.sub_count;
    for (let i = 0; i < subs; i++) {
      out.push({
        id: `${bookId}:${chapter}:${section}:${t.task}:${i + 1}`,
        bookId,
        chapter,
        section,
        title: sec.title,
        task: t.task,
        sub: i + 1,
        subs,
        segments: t.segments,
        answer: t.answers?.[i],
      });
    }
  }
  return out;
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

function Answer({ item, value, onAnswer, locked }: { item: Item; value?: string; onAnswer: (v: string) => void; locked: boolean }) {
  const [draft, setDraft] = useState("");
  const correct = item.answer;
  const short = correct !== undefined && isShortAnswer(correct);
  if (short || correct === undefined) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {value === undefined && !locked ? (
          <>
            <input
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Պատասխան"
              className="h-10 w-28 rounded-xl border-2 border-stone-300 bg-white px-3 text-sm focus:border-blue-700 focus:outline-none"
            />
            <Button disabled={!draft.trim() || correct === undefined} onClick={() => onAnswer(draft.trim())}>Ստուգել</Button>
          </>
        ) : (
          <span className={`text-sm font-bold ${value !== undefined && correct !== undefined && isRight(correct, value) ? "text-emerald-700" : "text-red-700"}`}>
            {value ?? "—"} {correct !== undefined && value !== undefined && isRight(correct, value) ? "✓" : `✗ · ճիշտ՝ ${correct ?? "—"}`}
          </span>
        )}
      </div>
    );
  }
  const choices = correct === "T" || correct === "F" ? ["T", "F"] : ["1", "2", "3", "4"];
  return (
    <div className="grid grid-cols-4 gap-2">
      {choices.map((c) => {
        const label = c === "T" ? "Ճիշտ է" : c === "F" ? "Սխալ է" : `${c})`;
        const isRightBtn = value !== undefined && correct === c;
        const isWrongBtn = value === c && correct !== c;
        return (
          <button
            key={c}
            type="button"
            disabled={locked || value !== undefined}
            onClick={() => onAnswer(c)}
            className={`h-12 rounded-xl border-2 text-sm font-bold transition ${
              isRightBtn ? "border-emerald-600 bg-emerald-50 text-emerald-800"
              : isWrongBtn ? "border-red-500 bg-red-50 text-red-700"
              : "border-stone-300 bg-white hover:bg-stone-50"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function PlayPage() {
  const q = useIndex();
  const { progress, setAnswer, addExam } = useMathProgress();
  const [params, setParams] = useState<{ book: string; chapter: number; section: number; mode: string } | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const [ch, se] = (sp.get("sec") ?? "1-1").split("-").map(Number);
    setParams({ book: sp.get("book") ?? "matem-1", chapter: ch, section: se, mode: sp.get("mode") ?? "play" });
  }, []);

  const items = useMemo(() => {
    if (!q.data || !params) return [];
    return sectionItems(q.data, params.book, params.chapter, params.section);
  }, [q.data, params]);

  const [mode, setMode] = useState<"play" | "test">("play");
  const [round, setRound] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!params) return;
    setMode(params.mode === "test" ? "test" : "play");
  }, [params]);

  useEffect(() => {
    if (!items.length) return;
    const fresh = shuffle(items).slice(0, mode === "test" ? TEST_SIZE : items.length);
    setRound(fresh);
    setIndex(0);
    setTestAnswers({});
    setSubmitted(false);
  }, [items, mode]);

  if (q.isLoading || !params) return <p className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Բեռնվում է…</p>;
  if (q.error || !q.data) return <p className="p-6 text-destructive">Չհաջողվեց բեռնել բաժինը։</p>;
  if (!items.length) return <p className="p-6 text-destructive">Բաժինը չի գտնվել։</p>;

  const backHref = `/math/books?book=${params.book}&sec=${params.chapter}-${params.section}`;
  const correctOf = (it: Item, v: string | undefined) => v !== undefined && it.answer !== undefined && isRight(it.answer, v);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4">
      <a href={backHref} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Հետ
      </a>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">Բաժին {params.section}. {items[0].title}</p>
          <p className="text-xs text-muted-foreground">{mode === "test" ? `Թեստ · ${round.length} հարց` : `Խաղ · ${round.length} հարց`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === "play" ? "default" : "outline"} onClick={() => setMode("play")}>Խաղալ</Button>
          <Button variant={mode === "test" ? "default" : "outline"} onClick={() => setMode("test")}>Թեստ</Button>
        </div>
      </div>

      {mode === "play" && round[index] && (() => {
        const it = round[index];
        const saved = progress.answers[it.id];
        return (
          <section className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Առաջադրանք {it.task} • Հարց {it.sub} / {it.subs} • {index + 1} / {round.length}
            </p>
            <Crop bookId={it.bookId} segments={it.segments} />
            <Answer
              item={it}
              value={saved}
              locked={false}
              onAnswer={(v) => setAnswer(it.id, v)}
            />
            {saved !== undefined && (
              <Button className="w-full" onClick={() => setIndex((i) => Math.min(i + 1, round.length - 1))} disabled={index >= round.length - 1}>
                Հաջորդը
              </Button>
            )}
          </section>
        );
      })()}

      {mode === "play" && round.length > 0 && index >= round.length - 1 && progress.answers[round[round.length - 1].id] !== undefined && (
        <p className="rounded-2xl bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-800">Խաղն ավարտված է։</p>
      )}

      {mode === "test" && (
        <>
          {round.map((it, idx) => (
            <section key={it.id} className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Առաջադրանք {it.task} • Հարց {it.sub} / {it.subs} • {idx + 1} / {round.length}
              </p>
              <Crop bookId={it.bookId} segments={it.segments} />
              <Answer
                item={it}
                value={testAnswers[it.id]}
                locked={submitted}
                onAnswer={(v) => setTestAnswers((a) => ({ ...a, [it.id]: v }))}
              />
            </section>
          ))}
          {!submitted ? (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => {
              setSubmitted(true);
              addExam(round.filter((x) => correctOf(x, testAnswers[x.id])).length, round.length);
            }}>
              Ավարտել
            </Button>
          ) : (
            <p className="rounded-2xl bg-muted/60 p-4 text-center text-sm font-semibold">
              Արդյունք՝ {round.filter((x) => correctOf(x, testAnswers[x.id])).length} / {round.length}
            </p>
          )}
        </>
      )}
    </div>
  );
}
