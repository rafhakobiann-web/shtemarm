import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Gamepad2, BookText, ClipboardCheck, Trophy, Loader2, RefreshCw, MessageCircle } from "lucide-react";
import { ALL_BOOKS, KIND_HY, secNum, secTitle, sectionAnswerIds, invalidateBookCache } from "@/lib/books";
import { useBook } from "@/lib/useBook";
import { LoadError } from "@/components/LoadError";
import { BookCover } from "@/components/BookCover";
import { ArmenianSourceChapters } from "@/components/ArmenianSourceChapters";
import type { ArmenianVolume } from "@/lib/armenian-source-outline";
import { useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { useLang, useTx } from "@/lib/lang";

export const Route = createFileRoute("/book/$bookId")({
  staticData: { sitemap: true },
  beforeLoad: ({ params }) => {
    if (!ALL_BOOKS.some((b) => String(b.id) === params.bookId)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `Շտեմարան ${params.bookId} · Բաժիններ` },
      { name: "description", content: `Շտեմարան ${params.bookId}՝ բաժիններ, ուսուցում և թեստեր։` },
      { property: "og:title", content: `Շտեմարան ${params.bookId} · Shtemarm` },
      { property: "og:description", content: "Ընտրեք բաժինը, սովորեք կամ անցեք թեստ։" },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const tx = useTx();
  const lang = useLang();
  const { bookId } = Route.useParams();
  const id = Number(bookId);
  const meta = ALL_BOOKS.find((b) => b.id === id)!;
  const sourceReviewPending = [1, 2, 3, 21, 22, 23, 31, 32, 33, 34, 63, 64].includes(id);
  const { data: book, isLoading, isFetching, error, refetch } = useBook(id);
  const reload = () => { invalidateBookCache(id); void refetch(); };
  const p = useProgress();
  // A completed answer updates progress frequently, but source questions do not.
  // Cache the full section response-key lists until the book itself changes.
  const sectionIds = useMemo(() => book?.sections.map(sectionAnswerIds) ?? [], [book]);

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {tx("Բոլոր գրքերը")}
      </Link>
      <div className="rounded-3xl border bg-card p-5 sm:p-7">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <BookCover src={meta.cover} title={meta.title} size="lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{tx("Ուսուցման շտեմարան · Shtemarm")}</p>
              <h1 className="text-2xl font-black sm:text-4xl">{meta.title}</h1>
              <p className="text-muted-foreground">{meta.sub}</p>
            </div>
          </div>
          {sourceReviewPending && (
            <div role="note" className="space-y-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm leading-relaxed">
              <p>{tx("Այս գրքի առաջադրանքների ամբողջական համեմատությունը բնօրինակի հետ դեռ ընթացքի մեջ է։ Հնարավոր են բացթողումներ կամ թվայնացման սխալներ։")}</p>
              <Link to="/feedback" className="inline-flex min-h-9 items-center gap-2 font-semibold text-primary hover:underline">
                <MessageCircle className="size-4" aria-hidden="true" />
                {tx("Գտե՞լ ես սխալ․ նշիր գիրքը, էջն ու առաջադրանքի համարը")}
              </Link>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={reload} disabled={isFetching}>
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
            {tx("Թարմացնել գրքի տվյալները")}
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="game" size="lg" asChild>
              {id >= 21 && id <= 23 ? (
                <Link to="/history"><Trophy /> {tx("Քննություն")}</Link>
              ) : id >= 31 && id <= 34 ? (
                <Link to="/biology" search={{ book: id }}><Trophy /> {tx("Քննություն")}</Link>
              ) : id === 61 || id === 62 ? (
                <Link to="/subject/$subject" params={{ subject: "physics" }}><Trophy /> {tx("Քննություն")}</Link>
              ) : id >= 51 && id <= 54 ? (
                <Link to="/subject/$subject" params={{ subject: ({51:"physics",52:"chemistry",53:"geography",54:"russian"} as Record<number,string>)[id]! }}><Trophy /> {tx("Ինքնաստուգում")}</Link>
              ) : (id >= 41 && id <= 44) || (id >= 1 && id <= 3) ? (
                <Link to="/exam/$subject" params={{ subject: id >= 41 && id <= 44 ? "armenian" : "english" }}><Trophy /> {tx("Քննություն")}</Link>
              ) : id === 63 || id === 64 ? (
                <Link to="/physics/original"><Trophy /> {tx("Քննություն")}</Link>
              ) : (
                <Link to="/study/$bookId/$sectionId" params={{ bookId, sectionId: String(book?.sections[0]?.n ?? 1) }} search={{ mode: "classic" }}>
                  <Trophy /> {tx("Սովորել")}
                </Link>
              )}
            </Button>
            <Button variant="sun" size="lg" asChild>
              {id >= 21 && id <= 23 ? (
                <Link to="/history"><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : id >= 31 && id <= 34 ? (
                <Link to="/biology" search={{ book: id }}><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : id === 61 || id === 62 ? (
                <Link to="/subject/$subject" params={{ subject: "physics" }}><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : id >= 51 && id <= 54 ? (
                <Link to="/subject/$subject" params={{ subject: ({51:"physics",52:"chemistry",53:"geography",54:"russian"} as Record<number,string>)[id]! }}><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : (id >= 41 && id <= 44) || (id >= 1 && id <= 3) ? (
                <Link to="/exam/$subject" params={{ subject: id >= 41 && id <= 44 ? "armenian" : "english" }}><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : id === 63 || id === 64 ? (
                <Link to="/physics/original"><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : (
                <Link to="/study/$bookId/$sectionId" params={{ bookId, sectionId: String(book?.sections[0]?.n ?? 1) }} search={{ mode: "classic" }}>
                  <ClipboardCheck /> {tx("Սովորել")}
                </Link>
              )}
            </Button>
            {id >= 1 && id <= 3 && <Button variant="outline" size="lg" asChild>
              <Link to="/english-grammar" search={{book:id,section:2,topic:undefined}}>
                <BookText className="size-5" />{lang==="en"?"Grammar handbook":lang==="ru"?"Справочник грамматики":"Քերականական կանոններ"}
              </Link>
            </Button>}
            {(id === 61 || id === 62 || id === 63 || id === 64) && <Button variant="outline" size="lg" asChild>
              <Link to="/physics/books" search={{volume:id===63?61:id===64?62:id,page:5}}>
                <BookText className="size-5"/>{tx("Բացել բնօրինակ PDF-ը")}
              </Link>
            </Button>}
            {(id === 63 || id === 64) && <Button variant="outline" size="lg" asChild>
              <Link to="/physics/original"><BookText className="size-5"/>{tx("Բնօրինակի տեքստային հարցերը")}</Link>
            </Button>}
            {(id === 63 || id === 64) && <Button variant="outline" size="lg" asChild>
              <Link to="/physics/scan-practice"><ClipboardCheck className="size-5"/>{tx("125 բնօրինակ հարց՝ PDF-ով լուծում")}</Link>
            </Button>}
          </div>
        </div>
      </div>

      {id >= 41 && id <= 44 && book && (
        <ArmenianSourceChapters volume={(id - 40) as ArmenianVolume} book={book} />
      )}

      {error && !book ? (
        <LoadError onRetry={reload} retrying={isFetching} detail={error instanceof Error ? error.message : String(error)} />
      ) : isLoading || !book ? (
        <div role="status" aria-live="polite" className="grid place-items-center gap-3 py-20">
          <Loader2 className="animate-spin text-primary" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">{tx("Գրքի բաժինները բեռնվում են…")}</span>
        </div>
      ) : book.sections.length === 0 ? (
        <div role="status" className="mx-auto max-w-lg space-y-4 rounded-2xl border bg-card p-8 text-center">
          <p className="font-semibold">{tx("Այս գրքի բաժինները դեռ հասանելի չեն։")}</p>
          <p className="text-sm text-muted-foreground">{tx("Գրքի տվյալները կարող են թերի լինել։ Փորձիր նորից կամ ընտրիր մեկ այլ գիրք։")}</p>
          <Button variant="outline" onClick={reload} disabled={isFetching}>{tx("Կրկին բեռնել")}</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {book.sections.map((s, sectionIndex) => {
            const ids = sectionIds[sectionIndex] ?? [];
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
                  {tx("{done}/{total} արված · {right} ճիշտ", { done, total: ids.length, right })}
                </p>
                {id >= 1 && id <= 3 && <Link to="/english-grammar" search={{book:id,section:s.n,topic:undefined}}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 text-sm font-semibold text-primary hover:bg-primary/10">
                  <BookText className="size-4" />{lang==="en"?"Rules & study tips":lang==="ru"?"Правила и советы":"Կանոններ և ուսուցման հուշումներ"}
                </Link>}
                <div className="mt-auto grid grid-cols-3 gap-2">
                  <Button variant="game" className="px-2 text-xs sm:text-sm" asChild>
                    <Link to="/study/$bookId/$sectionId" params={{ bookId, sectionId: String(s.n) }} search={{ mode: "game" }}>
                      <Gamepad2 /> {tx("Խաղալ")}
                    </Link>
                  </Button>
                  <Button variant="outline" className="px-2 text-xs sm:text-sm" asChild>
                    <Link to="/study/$bookId/$sectionId" params={{ bookId, sectionId: String(s.n) }} search={{ mode: "classic" }}>
                      <BookText /> {tx("Դասական")}
                    </Link>
                  </Button>
                  <Button variant="sun" className="px-2 text-xs sm:text-sm" asChild>
                    {id >= 51 && id <= 54 ? (
                      <Link to="/subject/$subject" params={{ subject: ({51:"physics",52:"chemistry",53:"geography",54:"russian"} as Record<number,string>)[id]! }} search={{ section: s.n }}>
                        <ClipboardCheck /> {tx("Թեստ")}
                      </Link>
                    ) : (id >= 41 && id <= 44) || (id >= 1 && id <= 3) ? (
                      <Link to="/exam/$subject"
                        params={{ subject: id >= 41 && id <= 44 ? "armenian" : "english" }}
                        search={{ book: id, section: s.n }}>
                        <ClipboardCheck /> {tx("Թեստ")}
                      </Link>
                    ) : id >= 31 && id <= 34 ? (
                      <Link to="/biology" search={{ book: id, section: s.n }}>
                        <ClipboardCheck /> {tx("Թեստ")}
                      </Link>
                    ) : id >= 21 && id <= 23 ? (
                      <Link to="/history">
                        <ClipboardCheck /> {tx("Թեստ")}
                      </Link>
                    ) : id === 63 || id === 64 ? (
                      <Link to="/physics/original">
                        <ClipboardCheck /> {tx("Թեստ")}
                      </Link>
                    ) : id === 61 || id === 62 ? (
                      <Link to="/subject/$subject" params={{ subject: "physics" }} search={{ section: s.n }}>
                        <ClipboardCheck /> {tx("Թեստ")}
                      </Link>
                    ) : (
                      <Link to="/study/$bookId/$sectionId" params={{ bookId, sectionId: String(s.n) }} search={{ mode: "classic" }}>
                        <ClipboardCheck /> {tx("Ուսուցում")}
                      </Link>
                    )}
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

