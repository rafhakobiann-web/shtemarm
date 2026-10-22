import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck, Trophy } from "lucide-react";
import { z } from "zod";
import { BOOKS } from "@/lib/books";

const SUBJECTS = ["english", "math"] as const;

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
  "group block overflow-hidden rounded-3xl border bg-card shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const MATH_BOOKS = [
  { id: "matem-1", title: "Մաթեմատիկա • Մաս 1", sub: "Երևան 2019", cover: "/math/books/covers/matem-1.jpg" },
  { id: "matem-2", title: "Մաթեմատիկա • Մաս 2", sub: "Երևան 2020", cover: "/math/books/covers/matem-2.jpg" },
] as const;

const HISTORY_BOOKS = [
  { cover: "/covers/hist-1.webp", title: "Հայոց պատմություն · 2021", sub: "Գիրք առաջին" },
  { cover: "/covers/hist-2.webp", title: "Հայոց պատմություն · 2021", sub: "Գիրք երկրորդ" },
  { cover: "/covers/hist-3.webp", title: "Հայոց պատմություն · 2023", sub: "Գիրք երրորդ" },
];

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
  return (
    <div className="flex aspect-[3/4] flex-col justify-between rounded-3xl border border-dashed bg-card/60 p-4 opacity-80 sm:aspect-auto sm:min-h-44">
      <div className="grid size-full place-items-center rounded-2xl bg-muted/50 text-5xl font-black text-muted-foreground/40">{title.slice(0, 1)}</div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Շուտով</p>
    </div>
  );
}

function ExamTile({ to, search, href, title, sub, icon }: { to?: string; search?: Record<string, string>; href?: string; title: string; sub: string; icon: React.ReactNode }) {
  const body = (
    <div className="flex h-full flex-col justify-between gap-6 p-5">
      <span className="grid size-11 place-items-center rounded-2xl bg-white/15">{icon}</span>
      <div className="space-y-1">
        <h4 className="text-base font-black leading-snug">{title}</h4>
        <p className="text-xs opacity-85">{sub}</p>
      </div>
    </div>
  );
  const cls = "group block min-h-40 overflow-hidden rounded-3xl bg-hero text-primary-foreground shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lg";
  if (href) return <a href={href} className={cls}>{body}</a>;
  return <Link to={to!} search={search as never} className={cls}>{body}</Link>;
}

function SubjectHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="space-y-3">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Բոլոր առարկաները
      </Link>
      <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
      <p className="text-muted-foreground">{sub}</p>
    </div>
  );
}

function EnglishSubject() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <SubjectHeader title="Անգլերեն" sub="Շտեմարաններ, պաշտոնական քննություններ և թեստերի կազմիչ" />
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">Շտեմարաններ</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {BOOKS.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">Քննություն</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExamTile
            to="/test/$bookId"
            search={{ mode: "exam", style: "classic" }}
            title="Պաշտոնական քննություն · 80 հարց"
            sub="Իրական քննության կառուցվածքով"
            icon={<Trophy className="size-5" />}
          />
          <ExamTile
            to="/test/$bookId"
            search={{ mode: "custom", style: "game" }}
            title="Թեստերի կազմիչ"
            sub="Ընտրիր բաժինները և հարցերի քանակը"
            icon={<ClipboardCheck className="size-5" />}
          />
        </div>
      </section>
    </div>
  );
}

function MathSubject() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <SubjectHeader title="Մաթեմատիկա" sub="Շտեմարաններ, պաշտոնական քննություն և թեստերի կազմիչ" />
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">Շտեմարաններ</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {MATH_BOOKS.map((b) => (
            <Link key={b.id} to="/math/books" search={{ book: b.id } as never} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">Քննություն</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExamTile to="/math" title="Պաշտոնական քննություն · 65 հարց" sub="Քննության կառուցվածքով" icon={<Trophy className="size-5" />} />
          <ExamTile to="/math" title="Թեստերի կազմիչ" sub="Ընտրիր շտեմարանները, բաժինները և քանակը" icon={<ClipboardCheck className="size-5" />} />
        </div>
      </section>
    </div>
  );
}

function Index() {
  const { subject } = Route.useSearch();
  if (subject === "english") return <EnglishSubject />;
  if (subject === "math") return <MathSubject />;

  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <section className="space-y-8">
        <h2 className="text-2xl font-black sm:text-3xl">Ընտրիր շտեմարանը սկսելու համար</h2>

        <SubjectRow title="Անգլերեն">
          {BOOKS.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </SubjectRow>

        <SubjectRow title="Մաթեմատիկա">
          {MATH_BOOKS.map((b) => (
            <Link key={b.id} to="/math/books" search={{ book: b.id } as never} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </SubjectRow>

        <SubjectRow title="Հայոց պատմություն">
          {HISTORY_BOOKS.map((h) => (
            <Link key={h.cover} to="/history" className={TILE}>
              <TileBody cover={h.cover} title={h.title} sub={h.sub} />
            </Link>
          ))}
        </SubjectRow>

        <SubjectRow title="Հայոց լեզու">
          <ComingSoon title="Հայոց լեզու" />
        </SubjectRow>
        <SubjectRow title="Կենսաբանություն">
          <ComingSoon title="Կենսաբանություն" />
        </SubjectRow>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black sm:text-3xl">Քննություն</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ExamTile
            to="/test/$bookId"
            search={{ mode: "exam", style: "classic" }}
            title="Անգլերեն · 80 հարցանոց քննություն"
            sub="Իրական քննության կառուցվածքով"
            icon={<Trophy className="size-5" />}
          />
          <ExamTile
            to="/test/$bookId"
            search={{ mode: "custom", style: "game" }}
            title="Անգլերեն · Կազմել թեստ"
            sub="Ընտրիր բաժինները և քանակը"
            icon={<ClipboardCheck className="size-5" />}
          />
          <ExamTile to="/math" title="Մաթեմատիկա · Թեստ" sub="65 հարց՝ քննության կառուցվածքով, կամ ընտրովի" icon={<Trophy className="size-5" />} />
          <ExamTile to="/history" title="Հայոց պատմություն · Թեստեր" sub="Նմուշային թեստեր" icon={<ClipboardCheck className="size-5" />} />
        </div>
      </section>
    </div>
  );
}
