import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck, Trophy } from "lucide-react";
import { z } from "zod";
import { useEffect } from "react";
import { useTx } from "@/lib/lang";
import { BIO_BOOKS, BOOKS, HISTORY_BOOKS } from "@/lib/books";

const SUBJECTS = ["english", "math", "history"] as const;

export const Route = createFileRoute("/")({
  validateSearch: z.object({ subject: z.enum(SUBJECTS).optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Shtemarm · Ընտրիր առարկան" },
      { name: "description", content: "Ընտրիր շտեմարանը սկսելու համար կամ անցիր քննություն՝ անգլերեն, մաթեմատիկա և այլ առարկաներ։" },
      { property: "og:title", content: "Shtemarm" },
      { property: "og:description", content: "Ուսուցում և քննություններ՝ ըստ առարկաների։" },
    ],
  }),
  component: Index,
});

const TILE =
  "glass group block overflow-hidden rounded-3xl shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const MATH_BOOKS = [
  { id: "matem-1", title: "Մաթեմատիկա • Մաս 1", sub: "Երևան 2019", cover: "/math/books/covers/matem-1.jpg" },
  { id: "matem-2", title: "Մաթեմատիկա • Մաս 2", sub: "Երևան 2020", cover: "/math/books/covers/matem-2.jpg" },
] as const;

function TileBody({ cover, title, sub }: { cover?: string; title: string; sub: string }) {
  return (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {cover ? (
          <img src={cover} alt={title} loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-muted to-secondary text-5xl font-black text-muted-foreground/40">{title.slice(0, 1)}</div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="text-base font-bold leading-snug">{title}</h3>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </>
  );
}

function SubjectRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black">{title}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  const tx = useTx();
  return (
    <div className="flex aspect-[3/4] flex-col justify-between rounded-3xl border border-dashed bg-card/60 p-4 opacity-80 sm:aspect-auto sm:min-h-44">
      <div className="grid size-full place-items-center rounded-2xl bg-muted/50 text-5xl font-black text-muted-foreground/40">{title.slice(0, 1)}</div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{tx("Շուտով")}</p>
    </div>
  );
}

function ExamTile({ to, params, search, href, title, sub, icon }: { to?: string; params?: Record<string, string>; search?: Record<string, string>; href?: string; title: string; sub: string; icon: React.ReactNode }) {
  const body = (
    <div className="flex h-full flex-col justify-between gap-6 p-5">
      <span className="grid size-11 place-items-center rounded-2xl bg-white/15">{icon}</span>
      <div className="space-y-1">
        <h4 className="text-base font-black leading-snug">{title}</h4>
        <p className="text-xs opacity-85">{sub}</p>
      </div>
    </div>
  );
  const cls = "group block min-h-40 overflow-hidden rounded-3xl text-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lg [background-image:var(--gloss),var(--gradient-hero)]";
  if (href) return <a href={href} className={cls}>{body}</a>;
  return <Link to={to!} params={params as never} search={search as never} className={cls}>{body}</Link>;
}

function SubjectHeader({ title, sub }: { title: string; sub: string }) {
  const tx = useTx();
  return (
    <div className="space-y-3">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {tx("Բոլոր առարկաները")}
      </Link>
      <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
      <p className="text-muted-foreground">{sub}</p>
    </div>
  );
}

function EnglishSubject() {
  const tx = useTx();
  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <SubjectHeader title={tx("Անգլերեն")} sub={tx("Շտեմարաններ, պաշտոնական քննություններ և թեստերի կազմիչ")} />
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Շտեմարաններ")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {BOOKS.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Քննություն")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExamTile
            to="/test/$bookId" params={{ bookId: "all" }}
            search={{ mode: "exam", style: "classic" }}
            title={tx("Քննություն")}
            sub={tx("80 հարց՝ իրական քննության կառուցվածքով")}
            icon={<Trophy className="size-5" />}
          />
          <ExamTile
            to="/test/$bookId" params={{ bookId: "all" }}
            search={{ mode: "custom", style: "game" }}
            title={tx("Թեստերի կազմիչ")}
            sub={tx("Ընտրիր բաժինները և հարցերի քանակը")}
            icon={<ClipboardCheck className="size-5" />}
          />
        </div>
      </section>
    </div>
  );
}

function MathSubject() {
  const tx = useTx();
  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <SubjectHeader title={tx("Մաթեմատիկա")} sub={tx("Շտեմարաններ, պաշտոնական քննություն և թեստերի կազմիչ")} />
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Շտեմարաններ")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {MATH_BOOKS.map((b) => (
            <Link key={b.id} to="/math/books" search={{ book: b.id } as never} className={TILE}>
              <TileBody cover={b.cover} title={tx(b.title)} sub={b.sub} />
            </Link>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Քննություն")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExamTile to="/math" search={{ mode: "exam" }} title={tx("Քննություն")} sub={tx("65 հարց՝ քննության կառուցվածքով")} icon={<Trophy className="size-5" />} />
          <ExamTile to="/math" search={{ mode: "custom" }} title={tx("Թեստերի կազմիչ")} sub={tx("Ընտրիր բաժինները և հարցերի քանակը")} icon={<ClipboardCheck className="size-5" />} />
        </div>
      </section>
    </div>
  );
}

function HistorySubject() {
  const tx = useTx();
  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <SubjectHeader title={tx("Հայոց պատմություն")} sub={tx("Շտեմարաններ և պաշտոնական քննության նմուշային թեստեր")} />
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Շտեմարաններ")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {HISTORY_BOOKS.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Քննություն")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExamTile to="/history" title={tx("Քննություն")} sub={tx("70 հարց · Թեստ 1–4")} icon={<Trophy className="size-5" />} />
        </div>
      </section>
    </div>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function AboutSection() {
  const tx = useTx();
  // Opened from the header menu (/#about): bring the section into view once the page is ready.
  useEffect(() => {
    if (window.location.hash === "#about") document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  }, []);
  return (
    <section id="about" className="glass scroll-mt-24 space-y-6 rounded-3xl p-6 sm:p-8">
      <h2 className="text-2xl font-black sm:text-3xl">{tx("Մեր մասին")}</h2>
      <div className="space-y-4 text-sm leading-relaxed sm:text-base">
        <p>
          <b>{tx("Ինչու ստեղծվեց Shtemarm-ը։")}</b> {tx("Քննությանը պատրաստվելը չպետք է լինի խառնաշփոթ։ Շատ աշակերտներ շտեմարանները, թեստերը և պատասխանները փնտրում են տարբեր տեղերում։ Մենք ուզեցինք, որ ամեն ինչ լինի մեկ տեղում՝ պարզ և միշտ հասանելի։")}
        </p>
        <p>
          <b>{tx("Ինչպես է օգնում աշակերտներին։")}</b> {tx("Առաջադրանքներն ունեն ճիշտ պատասխան և բացատրություն, որպեսզի սխալից հետո կարողանաս հասկանալ, թե ինչու ես սխալվել։ Խաղային ռեժիմում սովորում ես քայլ առ քայլ և հավաքում միավորներ, իսկ դասական ռեժիմում ամբողջ բաժինը տեսնում ես մեկ էջում։ Թեստերի կազմիչով ընտրում ես բաժինները և հարցերի քանակը, իսկ քննության ռեժիմը կառուցված է միասնական քննության ձևաչափով։")}
        </p>
        <div className="rounded-2xl bg-muted/60 p-4 sm:p-5">
          <p>
            <b>{tx("Իմ մասին։")}</b> {tx("Ես Ռաֆիկ Հակոբյանն եմ, 17 տարեկան։ Shtemarm-ը ստեղծել եմ այն պատճառով, որ լավ հասկանում եմ, թե որքան դժվար է պատրաստվել քննություններին, երբ նյութերը ցրված են։ Ուզում եմ օգնել իմ հասակակիցներին՝ խնայելով նրանց ժամանակը և նվազեցնելով անհանգստությունը։ Եթե ունես առաջարկ կամ նկատես սխալ, գրիր ինձ TikTok-ում։")}
          </p>
        </div>
      </div>
      <a
        href="https://www.tiktok.com/@shtemarm_official"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-3 rounded-2xl border bg-background p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <span className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-foreground text-background">
            <TikTokIcon className="size-6" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">TikTok</span>
            <span className="block truncate font-display text-base font-bold">@shtemarm_official</span>
          </span>
        </span>
        <span className="text-sm font-bold text-primary group-hover:underline">{tx("Բացել →")}</span>
      </a>
      <p className="text-center text-xs font-semibold text-muted-foreground">Shtemarm @ 2026</p>
    </section>
  );
}

function Index() {
  const tx = useTx();
  const { subject } = Route.useSearch();
  if (subject === "english") return <EnglishSubject />;
  if (subject === "math") return <MathSubject />;
  if (subject === "history") return <HistorySubject />;

  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <section className="space-y-8">
        <h2 className="text-2xl font-black sm:text-3xl">{tx("Ընտրիր շտեմարանը սկսելու համար")}</h2>

        <SubjectRow title={tx("Անգլերեն")}>
          {BOOKS.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </SubjectRow>

        <SubjectRow title={tx("Մաթեմատիկա")}>
          {MATH_BOOKS.map((b) => (
            <Link key={b.id} to="/math/books" search={{ book: b.id } as never} className={TILE}>
              <TileBody cover={b.cover} title={tx(b.title)} sub={b.sub} />
            </Link>
          ))}
        </SubjectRow>

        <SubjectRow title={tx("Հայոց պատմություն")}>
          {HISTORY_BOOKS.map((h) => (
            <Link key={h.id} to="/book/$bookId" params={{ bookId: String(h.id) }} className={TILE}>
              <TileBody cover={h.cover} title={h.title} sub={h.sub} />
            </Link>
          ))}
        </SubjectRow>

        <SubjectRow title={tx("Հայոց լեզու")}>
          <ComingSoon title={tx("Հայոց լեզու")} />
        </SubjectRow>
        <SubjectRow title={tx("Կենսաբանություն")}>
          {BIO_BOOKS.map((b) =>
            b.locked ? (
              <div key={b.id} aria-disabled="true" className={`${TILE} cursor-not-allowed opacity-60`}>
                <TileBody cover={b.cover} title={b.title} sub={b.sub} />
                <p className="px-4 pb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{tx("Շուտով")}</p>
              </div>
            ) : (
              <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
                <TileBody cover={b.cover} title={b.title} sub={b.sub} />
              </Link>
            ),
          )}
        </SubjectRow>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black sm:text-3xl">{tx("Քննություն")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ExamTile
            to="/test/$bookId" params={{ bookId: "all" }}
            search={{ mode: "exam", style: "classic" }}
            title={tx("Քննություն")}
            sub={tx("Անգլերեն · 80 հարց՝ իրական քննության կառուցվածքով")}
            icon={<Trophy className="size-5" />}
          />
          <ExamTile
            to="/test/$bookId" params={{ bookId: "all" }}
            search={{ mode: "custom", style: "game" }}
            title={tx("Անգլերեն · Կազմել թեստ")}
            sub={tx("Ընտրիր բաժինները և քանակը")}
            icon={<ClipboardCheck className="size-5" />}
          />
          <ExamTile to="/math" title={tx("Քննություն")} sub={tx("Մաթեմատիկա · 65 հարց՝ քննության կառուցվածքով")} icon={<Trophy className="size-5" />} />
          <ExamTile to="/history" title={tx("Քննություն")} sub={tx("Հայոց պատմություն · 70 հարց")} icon={<Trophy className="size-5" />} />
        </div>
      </section>
      <AboutSection />
    </div>
  );
}
