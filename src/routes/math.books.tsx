import { Fragment, useEffect, useMemo, useState } from "react";
import { useMathProgress, isRight, isShortAnswer, isOpenSection } from "@/lib/math-progress";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookText, ClipboardCheck, Gamepad2, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MathExplain, taskPages } from "@/components/MathExplain";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/math/books")({
  head: () => ({
    meta: [
      { title: "Մաթեմատիկայի գրքեր · Shtemarm" },
      { name: "description", content: "Մաթեմատիկայի հարցաշարեր՝ 2 մաս" },
    ],
  }),
  component: BooksPage,
});

type Segment = { page: number; y0: number; y1: number };
type BookTask = { task: number; segments: Segment[]; answers: string[] | null; sub_count: number; sub_segments?: Segment[][] };
type BookSection = { chapter: number; section: number; title: string; pages: [number, number]; tasks: BookTask[] };
type BookData = { title: string; sections: BookSection[] };
type Index = { books: Record<string, BookData> };

const PAGE_W = 467.76;
const BOOK_IDS = ["matem-1", "matem-2"] as const;
const PAGE_COUNT: Record<string, number> = { "matem-1": 288, "matem-2": 320 };

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

function CropSegment({ src, s }: { src: string; s: Segment }) {
  const tx = useTx();
  const [failed, setFailed] = useState(false);
  const h = s.y1 - s.y0;
  if (h <= 0) return null;
  if (failed) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed bg-muted/40 p-4 text-center text-xs text-muted-foreground">
        {tx("Էջը չի բեռնվել։")} <a className="ml-1 font-semibold underline" href={src} target="_blank" rel="noreferrer">{tx("Բացել էջը")}</a>
      </div>
    );
  }
  return (
    <div className="relative w-full overflow-hidden rounded-xl border bg-white" style={{ aspectRatio: `${PAGE_W} / ${h}` }}>
      <img
        src={src}
        alt=""
        decoding="async"
        onError={() => setFailed(true)}
        className="block w-full max-w-none"
        style={{ marginTop: `-${(s.y0 / PAGE_W) * 100}%` }}
      />
    </div>
  );
}

function TaskCrop({ book, segments }: { book: string; segments: Segment[] }) {
  return (
    <div className="space-y-2">
      {segments.map((s, i) => (
        <CropSegment key={i} s={s} src={`/math/books/${book}/p-${String(s.page).padStart(3, "0")}.jpg`} />
      ))}
    </div>
  );
}

function ShortAnswerRow({ id, n, saved, correct, onAnswer }: { id: string; n: number; saved?: string; correct?: string; onAnswer: (id: string, value: string) => void }) {
  const tx = useTx();
  const [draft, setDraft] = useState("");
  const submitted = saved !== undefined;
  const ok = submitted && correct !== undefined && isRight(correct, saved);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border p-2">
      <span className="grid size-8 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{n}</span>
      {!submitted ? (
        <>
          <input
            type="text"
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) onAnswer(id, draft.trim());
            }}
            placeholder={tx("Պատասխան")}
            className="h-10 w-28 rounded-xl border-2 border-border bg-card px-3 text-sm focus:border-blue-700 focus:outline-none"
          />
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => onAnswer(id, draft.trim())}
            className="h-10 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white disabled:opacity-40"
          >
            {tx("Ստուգել")}
          </button>
        </>
      ) : (
        <span className={`text-sm font-bold ${ok ? "text-emerald-700" : "text-red-700"}`}>
          {saved} {ok ? "✓" : tx("✗ · ճիշտ՝ {c}", { c: correct ?? "—" })}
        </span>
      )}
    </div>
  );
}

function TaskCard({ bookId, bookNo, sec, task, saved, onAnswer, shortSection }: { bookId: string; bookNo: number; sec: BookSection; task: BookTask; saved: Record<string, string>; onAnswer: (id: string, value: string) => void; shortSection: boolean }) {
  const tx = useTx();
  const subs = task.answers ? task.answers.length : task.sub_count;
  const isTF = task.answers?.some((a) => a === "T" || a === "F") ?? false;
  const label = tx("Մաթեմատիկա • Մաս {m} • Գլուխ {c} • Բաժին {s} • Առաջադրանք {t} • Հարցեր 1–{k}", { m: bookNo, c: sec.chapter, s: sec.section, t: task.task, k: subs });

  return (
    <article className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      {!task.sub_segments && <TaskCrop book={bookId} segments={task.segments} />}
      <div className="space-y-2">
        {Array.from({ length: subs }, (_, i) => (<Fragment key={`sub-${i}`}>{task.sub_segments?.[i] ? <TaskCrop book={bookId} segments={task.sub_segments[i]} /> : null}{(() => {
          const n = i + 1;
          const id = `${bookId}:${sec.chapter}:${sec.section}:${task.task}:${n}`;
          const correct = task.answers?.[i];
          const explainFor = () => {
            const chosenValue = saved[id];
            if (chosenValue === undefined || correct === undefined) return null;
            const kind = isTF ? "tf" : shortSection || isShortAnswer(correct) ? "open" : "choice";
            return (
              <MathExplain
                item={id}
                bookId={bookId}
                pages={taskPages(task.segments)}
                kind={kind}
                task={`Առաջադրանք ${task.task}, հարց ${n}`}
                correct={correct}
                chosen={chosenValue}
              />
            );
          };
          if (shortSection || (correct !== undefined && isShortAnswer(correct))) {
            return (
              <Fragment key={n}>
                <ShortAnswerRow id={id} n={n} saved={saved[id]} correct={correct} onAnswer={onAnswer} />
                {explainFor()}
              </Fragment>
            );
          }
          const chosen = saved[id];
          const choices = isTF ? ["T", "F"] : ["1", "2", "3", "4"];
          return (
            <Fragment key={n}>
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border p-2">
              <span className="grid size-8 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{n}</span>
              {choices.map((c) => {
                const text = isTF ? (c === "T" ? tx("Ճիշտ է") : tx("Սխալ է")) : `${c})`;
                const isRight_ = chosen !== undefined && correct === c;
                const isWrong = chosen === c && correct !== c;
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={chosen !== undefined || !correct}
                    onClick={() => onAnswer(id, c)}
                    className={`h-10 min-w-12 rounded-xl border-2 px-3 text-sm font-bold transition ${
                      isRight_ ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : isWrong ? "border-red-500 bg-red-50 text-red-700"
                      : "border-border bg-card hover:bg-muted"}`}
                  >
                    {text}
                  </button>
                );
              })}
              {!correct && <span className="text-xs text-muted-foreground">{tx("Պատասխանը չկա")}</span>}
            </div>
            {explainFor()}
            </Fragment>
          );
        })()}</Fragment>))}
      </div>
    </article>
  );
}

function BooksPage() {
  const q = useIndex();
  const tx = useTx();
  const questionCounts = useMemo(() => {
    const out: Record<string, number> = {};
    if (!q.data) return out;
    for (const [id, b] of Object.entries(q.data.books)) {
      out[id] = b.sections.reduce(
        (n, sec) => n + sec.tasks.reduce((m, t) => m + (t.answers ? t.answers.length : t.sub_count), 0),
        0,
      );
    }
    return out;
  }, [q.data]);
  const [bookId, setBookId] = useState<string | null>(null);
  const [sectionKey, setSectionKey] = useState<string | null>(null);
  const [mode, setMode] = useState<"chapters" | "pages">("chapters");

  // Keep the open book / section in the URL, so a reload returns to the same place.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("book")) setBookId(sp.get("book"));
    if (sp.get("sec")) setSectionKey(sp.get("sec"));
    if (sp.get("mode") === "pages") setMode("pages");
  }, []);
  useEffect(() => {
    const sp = new URLSearchParams();
    if (bookId) sp.set("book", bookId);
    if (sectionKey) sp.set("sec", sectionKey);
    if (mode === "pages") sp.set("mode", "pages");
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [bookId, sectionKey, mode]);
  const { progress, setAnswer } = useMathProgress();
  const answered = (prefix: string) => Object.keys(progress.answers).filter((k) => k.startsWith(prefix));
  const correctIn = (prefix: string) =>
    Object.entries(progress.answers).filter(([k, v]) => {
      if (!k.startsWith(prefix) || !q.data) return false;
      const [b, ch, se, ta, su] = k.split(":");
      const sec = q.data.books[b]?.sections.find((x) => x.chapter === Number(ch) && x.section === Number(se));
      const task = sec?.tasks.find((t) => t.task === Number(ta));
      const correct = task?.answers?.[Number(su) - 1];
      return correct !== undefined && isRight(correct, v);
    }).length;

  const book = bookId && q.data ? q.data.books[bookId] : null;
  const bookNo = bookId ? Number(bookId.split("-")[1]) : 1;
  const section = useMemo(() => {
    if (!book || !sectionKey) return null;
    return book.sections.find((s) => `${s.chapter}-${s.section}` === sectionKey) ?? null;
  }, [book, sectionKey]);


  const chapters = useMemo(() => {
    if (!book) return [] as [number, BookSection[]][];
    const map = new Map<number, BookSection[]>();
    for (const s of book.sections) {
      if (!map.has(s.chapter)) map.set(s.chapter, []);
      map.get(s.chapter)!.push(s);
    }
    return [...map.entries()];
  }, [book]);

  if (q.isLoading) return <p className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {tx("Բեռնվում է…")}</p>;
  if (q.error || !q.data) return <p className="p-6 text-destructive">{tx("Չհաջողվեց բեռնել գրքերը։")}</p>;

  const back = () => (sectionKey ? setSectionKey(null) : mode === "pages" ? setMode("chapters") : setBookId(null));

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4 lg:max-w-5xl">
      <div className="flex items-center gap-3">
        {bookId ? (
          <button onClick={back} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {tx("Հետ")}
          </button>
        ) : (
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {tx("Գլխավոր էջ")}
          </Link>
        )}
      </div>

      {!bookId && (
        <section className="space-y-5">
          <h2 className="text-xl font-bold sm:text-2xl">{tx("Ընտրիր շտեմարանը")}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {BOOK_IDS.map((id, i) => {
              const total = questionCounts[id] ?? 0;
              return (
                <button
                  key={id}
                  onClick={() => setBookId(id)}
                  className="shadow-card group overflow-hidden rounded-2xl border bg-card text-left transition-transform hover:-translate-y-1"
                >
                  <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 p-4">
                    <img
                      src={`/math/books/covers/${id}.jpg`}
                      alt={tx("Մաթեմատիկա · Մաս {n} շապիկ", { n: i + 1 })}
                      loading="lazy"
                      className="aspect-[3/4] w-full rounded-lg object-cover"
                    />
                    <div className="min-w-0 space-y-2">
                      <h3 className="text-lg font-bold">{tx("Մաթեմատիկա • Մաս {n}", { n: i + 1 })}</h3>
                      <p className="text-sm text-muted-foreground">{tx("Շտեմարան · {place} · {n} հարց", { place: tx(i === 0 ? "Երևան 2019" : "Երևան 2020"), n: total })}</p>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-success" style={{ width: `${total ? Math.min(100, (answered(`${id}:`).length / total) * 100) : 0}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{tx("{n} / {t} արված · {c} ճիշտ", { n: answered(`${id}:`).length, t: total, c: correctIn(`${id}:`) })}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {bookId && book && !sectionKey && mode === "chapters" && (
        <section className="space-y-8">
          <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-end">
            <img
              src={`/math/books/covers/${bookId}.jpg`}
              alt={tx(book.title)}
              className="shadow-card hidden aspect-[3/4] w-full rounded-xl object-cover md:block"
            />
            <div className="space-y-4">
              <h1 className="text-3xl font-black sm:text-4xl">{tx(book.title)}</h1>
              <p className="text-muted-foreground">{tx("Շտեմարան · {place}", { place: tx(bookId === "matem-1" ? "Երևան 2019" : "Երևան 2020") })}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="game" size="lg" asChild>
                  <Link to="/math"><Trophy /> {tx("Քննություն")}</Link>
                </Button>
                <Button variant="sun" size="lg" asChild>
                  <Link to="/math"><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
                </Button>
                <Button variant="outline" size="lg" onClick={() => setMode("pages")}>
                  <BookText /> {tx("Էջեր")}
                </Button>
              </div>
            </div>
          </div>

          {chapters.map(([ch, secs]) => (
            <div key={ch} className="space-y-4">
              <h2 className="text-xl font-black">{tx("Գլուխ {n}", { n: ch })}</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {secs.map((s, i) => {
              const total = s.tasks.reduce((m, t) => m + (t.answers ? t.answers.length : t.sub_count), 0);
              const prefix = `${bookId}:${s.chapter}:${s.section}:`;
              const done = answered(prefix).length;
              const right = correctIn(prefix);
              const playHref = `/math/play?book=${bookId}&sec=${s.chapter}-${s.section}&mode=play`;
              const testHref = `/math/play?book=${bookId}&sec=${s.chapter}-${s.section}&mode=test`;
              return (
                <div key={`${s.chapter}-${s.section}`} className="shadow-card flex flex-col gap-3 rounded-2xl border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">{i + 1}</span>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold">{tx("Բաժին {n}", { n: s.section })}</h2>
                      <p className="text-sm leading-snug text-muted-foreground">{tx(s.title)}</p>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-success" style={{ width: `${total ? Math.min(100, (done / total) * 100) : 0}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{tx("{n}/{t} արված · {c} ճիշտ", { n: done, t: total, c: right })}</p>
                  <div className="mt-auto grid grid-cols-3 gap-2">
                    <Button variant="game" className="px-2 text-xs sm:text-sm" asChild>
                      <a href={playHref}><Gamepad2 /> {tx("Խաղալ")}</a>
                    </Button>
                    <Button variant="outline" className="px-2 text-xs sm:text-sm" onClick={() => setSectionKey(`${s.chapter}-${s.section}`)}>
                      <BookText /> {tx("Դասական")}
                    </Button>
                    <Button variant="sun" className="px-2 text-xs sm:text-sm" asChild>
                      <a href={testHref}><ClipboardCheck /> {tx("Թեստ")}</a>
                    </Button>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          ))}
        </section>
      )}

      {bookId && mode === "pages" && !sectionKey && (
        <section className="space-y-4">
          <h1 className="text-xl font-bold">{tx(book?.title ?? "")}</h1>
          {Array.from({ length: PAGE_COUNT[bookId] }, (_, i) => i + 1).map((pg) => (
            <figure key={pg} className="space-y-1">
              <img
                src={`/math/books/${bookId}/p-${String(pg).padStart(3, "0")}.jpg`}
                alt={tx("Էջ {n}", { n: pg })}
                loading="lazy"
                className="w-full rounded-xl border bg-white"
              />
              <figcaption className="text-center text-xs text-muted-foreground">{pg}</figcaption>
            </figure>
          ))}
        </section>
      )}

      {bookId && section && (
        <section className="space-y-4">
          <p className="text-sm font-bold">{tx("Բաժին {n}", { n: section.section })}. {tx(section.title)}</p>
          {section.tasks.map((t) => (
            <TaskCard key={t.task} bookId={bookId} bookNo={bookNo} sec={section} task={t} saved={progress.answers} onAnswer={setAnswer} shortSection={isOpenSection(section.tasks)} />
          ))}
        </section>
      )}
    </div>
  );
}
