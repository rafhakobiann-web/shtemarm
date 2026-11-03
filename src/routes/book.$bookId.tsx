import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Gamepad2, BookText, ClipboardCheck, Trophy, Loader2 } from "lucide-react";
import { ALL_BOOKS, KIND_HY, secNum, secTitle } from "@/lib/books";
import { useBook } from "@/lib/useBook";
import { LoadError } from "@/components/LoadError";
import { useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { useLang, useTx } from "@/lib/lang";

type ArmenianSourceIndex = {
  volumes: { volume: number; sections: { number: number; pdfPage: number; lastPdfPage: number }[]; statementBundle: { pdfPage: number; lastPdfPage: number }; answerKeyStartPdfPage: number; answerKeyEndPdfPage: number }[];
};

async function loadArmenianSourceIndex(): Promise<ArmenianSourceIndex> {
  const response = await fetch("/data/armenian-source-index.json");
  if (!response.ok) throw new Error("Armenian source section index is unavailable");
  const index: unknown = await response.json();
  if (!index || typeof index !== "object" || !("volumes" in index) ||
      !Array.isArray(index.volumes)) throw new Error("Invalid Armenian source section index");
  return index as ArmenianSourceIndex;
}

export const Route = createFileRoute("/book/$bookId")({
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
  const { data: book, isLoading, error, refetch } = useBook(id);
  const p = useProgress();
  const isArmenianBook = id >= 41 && id <= 44;
  const sourceIndex = useQuery({
    queryKey: ["armenian-source-toc"],
    queryFn: loadArmenianSourceIndex,
    enabled: isArmenianBook,
    staleTime: Infinity,
  });
  const printedVolume = sourceIndex.data?.volumes.find((volume) => volume.volume === id - 40);

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {tx("Բոլոր գրքերը")}
      </Link>
      <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-end">
        <img src={meta.cover} alt={meta.title} className="shadow-card hidden aspect-[3/4] w-full rounded-xl object-cover md:block" />
        <div className="space-y-4">
          <h1 className="text-3xl font-black sm:text-4xl">{meta.title}</h1>
          <p className="text-muted-foreground">{meta.sub}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="game" size="lg" asChild>
              {id >= 21 && id <= 23 ? (
                <Link to="/history"><Trophy /> {tx("Քննություն")}</Link>
              ) : id >= 31 && id <= 32 ? (
                <Link to="/biology"><Trophy /> {tx("Քննություն")}</Link>
              ) : id === 61 || id === 62 ? (
                <Link to="/subject/$subject" params={{ subject: "physics" }}><Trophy /> {tx("Քննություն")}</Link>
              ) : id >= 51 && id <= 54 ? (
                <Link to="/subject/$subject" params={{ subject: ({51:"physics",52:"chemistry",53:"geography",54:"russian"} as Record<number,string>)[id]! }}><Trophy /> {tx("Ինքնաստուգում")}</Link>
              ) : (id >= 41 && id <= 44) || (id >= 1 && id <= 3) ? (
                <Link to="/exam/$subject" params={{ subject: id >= 41 && id <= 44 ? "armenian" : "english" }}><Trophy /> {tx("Քննություն")}</Link>
              ) : id === 63 || id === 64 ? (
                <Link to="/physics/original"><Trophy /> {tx("Քննություն")}</Link>
              ) : (
                <Link to="/subject/$subject" params={{ subject: "physics" }}><Trophy /> {tx("Քննություն")}</Link>
              )}
            </Button>
            <Button variant="sun" size="lg" asChild>
              {id >= 21 && id <= 23 ? (
                <Link to="/history"><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : id >= 31 && id <= 32 ? (
                <Link to="/biology"><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : id === 61 || id === 62 ? (
                <Link to="/subject/$subject" params={{ subject: "physics" }}><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : id >= 51 && id <= 54 ? (
                <Link to="/subject/$subject" params={{ subject: ({51:"physics",52:"chemistry",53:"geography",54:"russian"} as Record<number,string>)[id]! }}><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : (id >= 41 && id <= 44) || (id >= 1 && id <= 3) ? (
                <Link to="/exam/$subject" params={{ subject: id >= 41 && id <= 44 ? "armenian" : "english" }}><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : id === 63 || id === 64 ? (
                <Link to="/physics/original"><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
              ) : (
                <Link to="/subject/$subject" params={{ subject: "physics" }}><ClipboardCheck /> {tx("Կազմել թեստ")}</Link>
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

      {isArmenianBook && (
        <p role="note" className="rounded-xl border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "The eight headings below follow the 2018 original volume. Questions currently available here are Shtemarm-authored practice, not digitized official tasks. Source page ranges are references only; no PDF upload is required."
            : lang === "ru"
              ? "Восемь разделов соответствуют сборнику 2018 года. Доступные задания — авторские упражнения Shtemarm, а не оцифрованные официальные вопросы. Страницы оригинала указаны для справки; загружать PDF не нужно."
              : "Ստորև ներկայացված 8 բաժինները համապատասխանում են 2018 թ. բնօրինակ շտեմարանին։ Առկա հարցերը Shtemarm-ի հեղինակային վարժանքներ են, ոչ թե պաշտոնական առաջադրանքների թվայնացումներ։ Բնօրինակի էջերը նշված են որպես հղում․ PDF վերբեռնել պետք չէ։"}
        </p>
      )}

      {error && !book ? (
        <LoadError onRetry={() => refetch()} detail={error instanceof Error ? error.message : String(error)} />
      ) : isLoading || !book ? (
        <div className="grid place-items-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {book.sections.map((s) => {
            const printedSection = printedVolume?.sections.find((section) => section.number === s.n);
            const ids = s.units.flatMap((u) => ("questions" in u ? u.questions.map((q) => `${u.id}:${q.n}`) : [u.id]));
            const hasQuestions = ids.length > 0;
            const instruction = !isArmenianBook
              ? (s.instr_hy || KIND_HY[s.units[0]?.kind ?? "mc"])
              : hasQuestions
                ? lang === "en" ? `Shtemarm-authored practice · ${ids.length} questions`
                  : lang === "ru" ? `Авторские упражнения Shtemarm · ${ids.length} вопросов`
                    : `Shtemarm-ի հեղինակային վարժանքներ · ${ids.length} հարց`
                : lang === "en" ? "Original section; interactive practice is not available yet."
                  : lang === "ru" ? "Раздел оригинала; интерактивных заданий пока нет."
                    : "Բնօրինակի բաժին․ ինտերակտիվ հարցեր դեռ չկան։";
            const done = ids.filter((k) => k in p.answers).length;
            const right = ids.filter((k) => p.answers[k] === 1).length;
            return (
              <div key={s.n} className="shadow-card flex flex-col gap-3 rounded-2xl border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">{secNum(s.n)}</span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold">{secTitle(s)}</h2>
                    <p className="text-sm leading-snug text-muted-foreground">{instruction}</p>
                    {printedSection && (
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {lang === "en" ? "Original PDF pages" : lang === "ru" ? "Страницы оригинала" : "Բնօրինակի էջեր"}: {printedSection.pdfPage}–{printedSection.lastPdfPage}
                      </p>
                    )}
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-success" style={{ width: `${(right / Math.max(1, ids.length)) * 100}%` }} />
                </div>
                {hasQuestions ? (
                  <p className="text-xs text-muted-foreground">
                    {tx("{done}/{total} արված · {right} ճիշտ", { done, total: ids.length, right })}
                  </p>
                ) : (
                  <p role="status" className="text-sm font-medium text-muted-foreground">
                    {lang === "en" ? "This section is listed in the original book; practice questions are still being prepared." :
                      lang === "ru" ? "Раздел есть в оригинальном сборнике; учебные задания ещё готовятся." :
                      "Այս բաժինը կա բնօրինակ շտեմարանում, սակայն կայքում դրա վարժությունները դեռ պատրաստ չեն։"}
                  </p>
                )}
                {id >= 1 && id <= 3 && <Link to="/english-grammar" search={{book:id,section:s.n,topic:undefined}}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 text-sm font-semibold text-primary hover:bg-primary/10">
                  <BookText className="size-4" />{lang==="en"?"Rules & study tips":lang==="ru"?"Правила и советы":"Կանոններ և ուսուցման հուշումներ"}
                </Link>}
                {hasQuestions && <div className="mt-auto grid grid-cols-3 gap-2">
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
                    ) : (
                      <Link to="/subject/$subject" params={{ subject: "physics" }}>
                        <ClipboardCheck /> {tx("Թեստ")}
                      </Link>
                    )}
                  </Button>
                </div>}
              </div>
            );
          })}
        </div>
      )}
      {isArmenianBook && book && printedVolume && (
        <section className="space-y-3" aria-label={lang === "en" ? "Additional original book sections" : lang === "ru" ? "Дополнительные разделы оригинала" : "Բնօրինակի լրացուցիչ բաժիններ"}>
          <h2 className="text-lg font-black">
            {lang === "en" ? "Other sections in the original" : lang === "ru" ? "Другие разделы оригинала" : "Բնօրինակի մյուս բաժինները"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-4">
              <h3 className="font-bold">{lang === "en" ? "Statement bundle" : lang === "ru" ? "Набор утверждений" : "Պնդումների փունջ"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {lang === "en" ? "PDF pages" : lang === "ru" ? "Страницы PDF" : "PDF էջեր"}: {printedVolume.statementBundle.pdfPage}–{printedVolume.statementBundle.lastPdfPage}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {lang === "en" ? "Not yet digitized as playable tasks." : lang === "ru" ? "Пока нет интерактивных заданий." : "Դեռ թվայնացված լուծելի առաջադրանքներ չկան։"}
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <h3 className="font-bold">{lang === "en" ? "Printed answer key" : lang === "ru" ? "Печатные ответы" : "Պատասխանների բանալի"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {lang === "en" ? "PDF pages" : lang === "ru" ? "Страницы PDF" : "PDF էջեր"}: {printedVolume.answerKeyStartPdfPage}–{printedVolume.answerKeyEndPdfPage}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {lang === "en" ? "Official answers have not been individually checked against practice tasks." : lang === "ru" ? "Официальные ответы ещё не сверены с учебными заданиями." : "Պաշտոնական բանալիները դեռ չեն համադրվել ուսումնական հարցերի հետ։"}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
