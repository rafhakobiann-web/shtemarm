import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Gamepad2, BookText, ClipboardCheck, Trophy, Loader2 } from "lucide-react";
import { ALL_BOOKS, KIND_HY, secNum, secTitle } from "@/lib/books";
import { useBook } from "@/lib/useBook";
import { LoadError } from "@/components/LoadError";
import { useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/book/$bookId")({
  beforeLoad: ({ params }) => {
    if (!ALL_BOOKS.some((b) => String(b.id) === params.bookId)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `Շտեմարան ${params.bookId} · Բաժիններ` },
      { name: "description", content: `Շտեմարան ${params.bookId}՝ բաժիններ, ուսուցում և թեստեր։` },
      { property: "og:title", content: `Շտեմարան ${params.bookId} · English` },
      { property: "og:description", content: "Ընտրեք բաժինը, սովորեք կամ անցեք թեստ։" },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { bookId } = Route.useParams();
  const id = Number(bookId);
  const meta = ALL_BOOKS.find((b) => b.id === id)!;
  const { data: book, isLoading, error, refetch } = useBook(id);
  const p = useProgress();

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Բոլոր գրքերը
      </Link>
      <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-end">
        <img src={meta.cover} alt={meta.title} className="shadow-card hidden aspect-[3/4] w-full rounded-xl object-cover md:block" />
        <div className="space-y-4">
          <h1 className="text-3xl font-black sm:text-4xl">{meta.title}</h1>
          <p className="text-muted-foreground">{meta.sub}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="game" size="lg" asChild>
              {id > 20 ? (
                <Link to="/history"><Trophy /> Քննություն</Link>
              ) : (
                <Link to="/test/$bookId" params={{ bookId }} search={{ mode: "exam", style: "classic" }}>
                  <Trophy /> Քննություն
                </Link>
              )}
            </Button>
            <Button variant="sun" size="lg" asChild>
              <Link to="/test/$bookId" params={{ bookId }} search={{ mode: "custom", style: "classic" }}>
                <ClipboardCheck /> Կազմել թեստ
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {error && !book ? (
        <LoadError onRetry={() => refetch()} detail={error instanceof Error ? error.message : String(error)} />
      ) : isLoading || !book ? (
        <div className="grid place-items-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {book.sections.map((s) => {
            const ids = s.units.flatMap((u) => ("questions" in u ? u.questions.map((q) => `${u.id}:${q.n}`) : [u.id]));
            const done = ids.filter((k) => k in p.answers).length;
            const right = ids.filter((k) => p.answers[k] === 1).length;
            return (
              <div key={s.n} className="shadow-card flex flex-col gap-3 rounded-2xl border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">{secNum(s.n)}</span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold">{secTitle(s)}</h2>
                    <p className="text-sm leading-snug text-muted-foreground">{s.instr_hy || KIND_HY[s.units[0]?.kind ?? "mc"]}</p>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-success" style={{ width: `${(right / Math.max(1, ids.length)) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {done}/{ids.length} արված · {right} ճիշտ
                </p>
                <div className="mt-auto grid grid-cols-3 gap-2">
                  <Button variant="game" className="px-2 text-xs sm:text-sm" asChild>
                    <Link to="/study/$bookId/$sectionId" params={{ bookId, sectionId: String(s.n) }} search={{ mode: "game" }}>
                      <Gamepad2 /> Խաղալ
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
