import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck, Trophy, Brain, BookOpen, Calculator, CheckCircle2, RotateCcw, MessageCircle, GraduationCap, Sparkles } from "lucide-react";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTx } from "@/lib/lang";
import { BIO_BOOKS, BOOKS, HISTORY_BOOKS } from "@/lib/books";
import { useProgress, level } from "@/lib/progress";

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
      <div className="cover-frame relative aspect-[3/4] overflow-hidden bg-muted">
        {cover ? (
          <img src={cover} alt={title} loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="cover-placeholder grid size-full place-items-center bg-gradient-to-br from-primary/10 via-muted to-secondary text-primary/65"><BookOpen className="size-12 sm:size-16" strokeWidth={1.35} aria-hidden="true" /></div>
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
      <div className="grid size-full place-items-center rounded-2xl bg-primary/5 text-primary/55"><GraduationCap className="size-10" strokeWidth={1.4} aria-hidden="true" /></div>
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
        <h2 className="text-xl font-black sm:text-2xl">{tx("Քննություն և մակարդակի ստուգում")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExamTile to="/level-test/$level" params={{ level: "placement" }} title={tx("Ստուգել անգլերենի մակարդակս")} sub={tx("Խառը հարցեր՝ A1–C1 · մոտավոր գնահատում")} icon={<Brain className="size-5" />} />
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

function Index() {
  const tx = useTx();
  const progress = useProgress();
  const { subject } = Route.useSearch();
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setName((data.user?.user_metadata?.username as string | undefined) ?? null));
  }, []);
  if (subject === "english") return <EnglishSubject />;
  if (subject === "math") return <MathSubject />;
  if (subject === "history") return <HistorySubject />;

  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <section className="space-y-8">
        <div className="space-y-2">
          <p className="text-lg font-bold text-primary">
            {name ? tx("Բարև, {name}։ Ուրախ ենք, որ նորից ես այստեղ։", { name }) : tx("Բարև՝ ընկեր։ Ուրախ ենք, որ այցելեցիր Shtemarm։")}
          </p>
          <h2 className="text-2xl font-black sm:text-3xl">{tx("Ընտրիր շտեմարանը սկսելու համար")}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Sparkles className="size-4 text-primary" aria-hidden="true" />{tx("Քո միավորները")}</p>
              <p className="mt-1 text-2xl font-black tabular-nums">{progress.xp} <span className="text-sm font-semibold text-muted-foreground">XP</span></p>
              <p className="mt-1 text-xs text-muted-foreground">{tx("Մակարդակ")} {level(progress.xp)}</p>
            </div>
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><CheckCircle2 className="size-4 text-success" aria-hidden="true" />{tx("Ճիշտ պատասխաններ")}</p>
              <p className="mt-1 text-2xl font-black tabular-nums">{Object.values(progress.answers).filter((v) => v === 1).length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tx("Ընդհանուր պատասխանված հարցերից")}</p>
            </div>
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><RotateCcw className="size-4 text-amber-600" aria-hidden="true" />{tx("Կրկնելու հարցեր")}</p>
              <p className="mt-1 text-2xl font-black tabular-nums">{Object.values(progress.answers).filter((v) => v === 0).length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tx("Անհատական առաջարկ")}</p>
            </div>
          </div>
          {Object.values(progress.answers).some((v) => v === 0) && (
            <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{tx("Առաջարկ քեզ համար")}</p>
                <p className="text-sm text-muted-foreground">{tx("Կրկնիր նախկինում սխալ պատասխանած հարցերը, հետո նորից ստուգիր առաջընթացդ։")}</p>
              </div>
              <Link to="/auth" className="inline-flex shrink-0 items-center justify-center rounded-xl border bg-background px-4 py-2 text-sm font-bold hover:bg-muted">{tx("Տեսնել առաջընթացը")}</Link>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{tx("Սովորիր քայլ առ քայլ, ստուգիր գիտելիքներդ թեստերով կամ լուծիր խնդիրներ հաշվիչով։")}</p>
        </div>

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
      <section className="shadow-card glass grid gap-4 rounded-3xl p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-black">{tx("Օգնիր մեզ դառնալ ավելի լավը")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{tx("Սխալ գտե՞ր, ունե՞ս գաղափար։ Գրիր մեզ՝ մենք կարդում ենք բոլոր հաղորդագրությունները։")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link to="/feedback" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-md"><MessageCircle className="size-4" aria-hidden="true" />{tx("Գրել մեզ")}</Link>
          <Link to="/calc" className="inline-flex items-center gap-2 rounded-2xl border bg-card px-4 py-2.5 text-sm font-bold transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><Calculator className="size-4" aria-hidden="true" />{tx("Բացել հաշվիչը")}</Link>
        </div>
      </section>
    </div>
  );
}
