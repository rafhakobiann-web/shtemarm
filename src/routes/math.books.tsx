import { useEffect, useMemo, useState } from "react";
import { useMathProgress } from "@/lib/math-progress";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/math/books")({
  head: () => ({
    meta: [
      { title: "Մաթեմատիկայի գրքեր · Շտեմարան" },
      { name: "description", content: "Մաթեմատիկայի հարցաշարեր՝ 2 մաս" },
    ],
  }),
  component: BooksPage,
});

type Segment = { page: number; y0: number; y1: number };
type BookTask = { task: number; segments: Segment[]; answers: string[] | null; sub_count: number };
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

function TaskCrop({ book, segments }: { book: string; segments: Segment[] }) {
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
              src={`/math/books/${book}/p-${String(s.page).padStart(3, "0")}.jpg`}
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

function TaskCard({ bookId, bookNo, sec, task, saved, onAnswer }: { bookId: string; bookNo: number; sec: BookSection; task: BookTask; saved: Record<string, string>; onAnswer: (id: string, value: string) => void }) {
  const subs = task.answers ? task.answers.length : task.sub_count;
  const isTF = task.answers?.some((a) => a === "T" || a === "F") ?? false;
  const label = `Մաթեմատիկա • Մաս ${bookNo} • Գլուխ ${sec.chapter} • Բաժին ${sec.section} • Առաջադրանք ${task.task} • Հարցեր 1–${subs}`;

  return (
    <article className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <TaskCrop book={bookId} segments={task.segments} />
      <div className="space-y-2">
        {Array.from({ length: subs }, (_, i) => {
          const n = i + 1;
          const correct = task.answers?.[i];
          const choices = isTF ? ["T", "F"] : ["1", "2", "3", "4"];
          const id = `${bookId}:${sec.chapter}:${sec.section}:${task.task}:${n}`;
          const chosen = saved[id];
          return (
            <div key={n} className="flex flex-wrap items-center gap-2 rounded-2xl border p-2">
              <span className="grid size-8 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{n}</span>
              {choices.map((c) => {
                const label = isTF ? (c === "T" ? "Ճիշտ է" : "Սխալ է") : `${c})`;
                const isRight = chosen !== undefined && correct === c;
                const isWrong = chosen === c && correct !== c;
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={chosen !== undefined || !correct}
                    onClick={() => onAnswer(id, c)}
                    className={`h-10 min-w-12 rounded-xl border-2 px-3 text-sm font-bold transition ${
                      isRight ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : isWrong ? "border-red-500 bg-red-50 text-red-700"
                      : "border-stone-300 bg-white hover:bg-stone-50"}`}
                  >
                    {label}
                  </button>
                );
              })}
              {!correct && <span className="text-xs text-muted-foreground">Պատասխանը չկա</span>}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function BooksPage() {
  const q = useIndex();
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
      return task?.answers?.[Number(su) - 1] === v;
    }).length;

  const book = bookId && q.data ? q.data.books[bookId] : null;
  const bookNo = bookId ? Number(bookId.split("-")[1]) : 1;
  const section = useMemo(() => {
    if (!book || !sectionKey) return null;
    return book.sections.find((s) => `${s.chapter}-${s.section}` === sectionKey) ?? null;
  }, [book, sectionKey]);

  const chapters = useMemo(() => {
    if (!book) return [];
    const map = new Map<number, BookSection[]>();
    for (const s of book.sections) {
      if (!map.has(s.chapter)) map.set(s.chapter, []);
      map.get(s.chapter)!.push(s);
    }
    return [...map.entries()];
  }, [book]);

  if (q.isLoading) return <p className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Բեռնվում է…</p>;
  if (q.error || !q.data) return <p className="p-6 text-destructive">Չհաջողվեց բեռնել գրքերը։</p>;

  const back = () => (sectionKey ? setSectionKey(null) : mode === "pages" ? setMode("chapters") : setBookId(null));

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4">
      <div className="flex items-center gap-3">
        {bookId ? (
          <button onClick={back} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Հետ
          </button>
        ) : (
          <Link to="/math" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Թեստ
          </Link>
        )}
      </div>

      {!bookId && (
        <section className="space-y-5">
          <h2 className="text-xl font-bold sm:text-2xl">Ընտրիր շտեմարանը</h2>
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
                      alt={`Մաթեմատիկա · Մաս ${i + 1} շապիկ`}
                      loading="lazy"
                      className="aspect-[3/4] w-full rounded-lg object-cover"
                    />
                    <div className="min-w-0 space-y-2">
                      <h3 className="text-lg font-bold">Մաթեմատիկա • Մաս {i + 1}</h3>
                      <p className="text-sm text-muted-foreground">Շտեմարան · {i === 0 ? "Երևան 2019" : "Երևան 2020"} · {total} հարց</p>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-success" style={{ width: `${total ? Math.min(100, (answered(`${id}:`).length / total) * 100) : 0}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{answered(`${id}:`).length} / {total} արված · {correctIn(`${id}:`)} ճիշտ</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {bookId && book && !sectionKey && mode === "chapters" && (
        <section className="space-y-6">
          <div className="space-y-4 text-center sm:text-left">
            <img
              src={`/math/books/covers/${bookId}.jpg`}
              alt={`${book.title} շապիկ`}
              className="mx-auto aspect-[3/4] w-40 rounded-2xl object-cover shadow-card sm:mx-0 sm:w-48"
            />
            <div className="space-y-1">
              <h1 className="text-3xl font-black">{book.title}</h1>
              <p className="text-muted-foreground">Շտեմարան · {bookId === "matem-1" ? "Երևան 2019" : "Երևան 2020"}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <Link to="/math" className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-[0_4px_0_#0b2a6b]">
                Քննություն (65 հարց)
              </Link>
              <Link to="/math" className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-stone-900">
                Կազմել թեստ
              </Link>
              <a
                href={`/math/books/${bookId}.pdf`}
                download
                className="inline-flex h-11 items-center gap-2 rounded-xl border bg-card px-5 text-sm font-bold"
              >
                Գիրքը PDF-ով
              </a>
            </div>
            <button
              onClick={() => setMode("pages")}
              className="flex w-full items-center justify-between rounded-2xl border bg-card px-4 py-3 text-left text-sm font-bold shadow-sm hover:bg-stone-50"
            >
              <span>Ամբողջ գիրքը (բոլոր էջերը)</span>
              <span className="text-xs text-muted-foreground">{PAGE_COUNT[bookId]} էջ · {questionCounts[bookId]} հարց</span>
            </button>
          </div>

          {chapters.map(([ch, secs]) => (
            <div key={ch} className="space-y-3">
              <div>
                <h2 className="text-xl font-black">Գլուխ {ch}</h2>
                <p className="text-sm text-muted-foreground">Առաջադրանքներ ընտրովի պատասխաններով</p>
              </div>
              <div className="grid gap-3">
                {secs.map((s) => {
                  const total = s.tasks.reduce((m, t) => m + (t.answers ? t.answers.length : t.sub_count), 0);
                  const done = answered(`${bookId}:${s.chapter}:${s.section}:`).length;
                  return (
                    <button
                      key={`${s.chapter}-${s.section}`}
                      onClick={() => setSectionKey(`${s.chapter}-${s.section}`)}
                      className="shadow-card flex items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-transform hover:-translate-y-0.5"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-700 text-base font-bold text-white">{s.section}</span>
                      <span className="min-w-0 flex-1 space-y-2">
                        <span className="block font-bold leading-snug">{s.title}</span>
                        <span className="block text-xs text-muted-foreground">{s.tasks.length} առաջադրանք · {total} հարց · {done} արված</span>
                        <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
                          <span className="block h-full bg-success" style={{ width: `${total ? Math.min(100, (done / total) * 100) : 0}%` }} />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {bookId && mode === "pages" && !sectionKey && (
        <section className="space-y-4">
          <h1 className="text-xl font-bold">{book?.title}</h1>
          {Array.from({ length: PAGE_COUNT[bookId] }, (_, i) => i + 1).map((pg) => (
            <figure key={pg} className="space-y-1">
              <img
                src={`/math/books/${bookId}/p-${String(pg).padStart(3, "0")}.jpg`}
                alt={`Էջ ${pg}`}
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
          <p className="text-sm font-bold">Բաժին {section.section}. {section.title}</p>
          {section.tasks.map((t) => (
            <TaskCard key={t.task} bookId={bookId} bookNo={bookNo} sec={section} task={t} saved={progress.answers} onAnswer={setAnswer} />
          ))}
        </section>
      )}
    </div>
  );
}
