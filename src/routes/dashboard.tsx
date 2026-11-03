import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronDown, ClipboardCheck, Trophy, Brain, BookOpen, Calculator, CheckCircle2, RotateCcw, MessageCircle, GraduationCap, Sparkles, Dna, Atom, LibraryBig, Target, Download, Smartphone } from "lucide-react";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
import { useTx } from "@/lib/lang";
import { ARMENIAN_BOOKS, BIO_BOOKS, BOOKS, HISTORY_BOOKS, PHYSICS_BOOKS, STARTER_SUBJECT_BOOKS } from "@/lib/books";
import { useProgress, level } from "@/lib/progress";
import { BookCover } from "@/components/BookCover";

const SUBJECTS = ["english", "math", "history", "biology", "armenian"] as const;

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: true },
  validateSearch: z.object({ subject: z.enum(SUBJECTS).optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Shtemarm | Շտեմարաններ և միասնական քննությունների պատրաստում" },
      { name: "description", content: "Shtemarm՝ շտեմարաններ, առարկայական վարժանքներ, փորձնական քննություններ և ուսումնական առաջընթացի հետևում՝ մեկ հարթակում։" },
      { property: "og:title", content: "Shtemarm | Շտեմարաններ և քննությունների պատրաստում" },
      { property: "og:description", content: "Ընտրիր առարկան, լուծիր առաջադրանքներ, ստուգիր առաջընթացդ և պատրաստվիր քննություններին Shtemarm-ի հետ։" },
      { name: "twitter:title", content: "Shtemarm | Շտեմարաններ և քննությունների պատրաստում" },
      { name: "twitter:description", content: "Շտեմարաններ, վարժանքներ և փորձնական քննություններ՝ Shtemarm-ում։" },
    ],
  }),
  component: Index,
});

const TILE =
  "academy-bento group flex h-full min-w-0 flex-col overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** Original source volumes remain separate from the authored Biology III exercises. */
const BIOLOGY_ORIGINAL_BOOKS = [
  { volume: 3 as const, title: "Կենսաբանություն", sub: "Մաս III · 911 բնօրինակ հարց + 34 վերաշարադրված · լրացվում է", cover: "/covers/bio-3.svg" },
  { volume: 4 as const, title: "Կենսաբանություն", sub: "Մաս IV · 777 բնօրինակ հարց · լրացվում է", cover: "/covers/bio-4.svg" },
];

const MATH_BOOKS = [
  { id: "matem-1", title: "Մաթեմատիկա • Մաս 1", sub: "Երևան 2019", cover: "/covers/math-1.svg" },
  { id: "matem-2", title: "Մաթեմատիկա • Մաս 2", sub: "Երևան 2020", cover: "/covers/math-2.svg" },
] as const;

function TileBody({ cover, title, sub }: { cover?: string; title: string; sub: string }) {
  return (
    <div className="flex h-full min-h-28 min-w-0 items-start gap-3 p-3 sm:p-4">
      <BookCover src={cover} title={title} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="break-words text-sm font-black leading-snug sm:text-base">{title}</h3>
        <p className="break-words text-xs leading-relaxed text-muted-foreground">{sub}</p>
        <span aria-hidden="true" className="mt-auto flex items-center justify-end text-primary">
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}

function SubjectRow({ title, children, beta = false, defaultOpen = false }: { title: string; children: React.ReactNode; beta?: boolean; defaultOpen?: boolean }) {
  const tx = useTx();
  return (
    <details className="group/subject overflow-hidden rounded-[1.4rem] border bg-card shadow-card" open={defaultOpen ? true : undefined}>
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-4 outline-offset-[-3px] marker:hidden hover:bg-muted/40 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><LibraryBig className="size-4" /></span>
        <h3 className="min-w-0 flex-1 text-base font-black sm:text-lg">{title}</h3>
        {beta && <span className="shrink-0 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-200">BETA</span>}
        <span className="sr-only">{tx("Բացել կամ փակել բաժինը")}</span>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open/subject:rotate-180" />
      </summary>
      <div className="grid grid-cols-1 items-stretch gap-3 border-t p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 xl:grid-cols-3">
        {children}
      </div>
    </details>
  );
}

function ExamTile({ to, params, search, href, title, sub, icon }: { to?: string; params?: Record<string, string>; search?: Record<string, string>; href?: string; title: string; sub: string; icon: React.ReactNode }) {
  const body = (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <span className="grid size-10 place-items-center rounded-xl border border-primary/10 bg-primary/10 text-primary">{icon}</span>
      <div className="min-w-0 space-y-1">
        <h4 className="text-sm font-black leading-snug sm:text-base">{title}</h4>
        <p className="text-xs leading-relaxed text-muted-foreground">{sub}</p>
      </div>
      <span aria-hidden="true" className="mt-auto flex justify-end text-primary">
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5"/>
      </span>
    </div>
  );
  const cls = "academy-bento group block min-h-36 overflow-hidden text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  if (href) return <a href={href} className={cls}>{body}</a>;
  return <Link to={to!} params={params as never} search={search as never} className={cls}>{body}</Link>;
}

function SubjectHeader({ title, sub, beta = false }: { title: string; sub: string; beta?: boolean }) {
  const tx = useTx();
  return (
    <div className="space-y-3">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {tx("Բոլոր առարկաները")}
      </Link>
      <h1 className="flex flex-wrap items-center gap-2 text-3xl font-black sm:text-4xl">{title}{beta && <span className="rounded-md border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black tracking-[0.12em] text-amber-700 dark:text-amber-300">BETA</span>}</h1>
      <p className="text-muted-foreground">{sub}</p>
    </div>
  );
}

function EnglishSubject() {
  const tx = useTx();
  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <SubjectHeader title={tx("Անգլերեն")} sub={tx("Շտեմարաններ և քննություններ")} />
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Շտեմարաններ")}</h2>
        <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
          <ExamTile to="/level-test/$level" params={{ level: "placement" }} title={tx("Ստուգել անգլերենի մակարդակս")} sub={tx("25 հաստատուն հարց · A1–C1 · մոտավոր գնահատում")} icon={<Brain className="size-5" />} />
          <ExamTile
            to="/exam/$subject" params={{ subject: "english" }}
            title={tx("Քննություն")}
            sub={tx("13 բաժին · 80 միավոր · կարգավորվող թեստ")}
            icon={<Trophy className="size-5" />}
          />
          <ExamTile
            to="/english-tests"
            title={tx("Բոլոր անգլերենի թեստերը")}
            sub={tx("Շտեմարաններ, մակարդակի թեստեր և քննություն՝ մեկ էջում")}
            icon={<Sparkles className="size-5" />}
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
      <SubjectHeader title={tx("Մաթեմատիկա")} sub={tx("Շտեմարաններ և քննություն")} />
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Շտեմարաններ")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <ExamTile to="/math" search={{ mode: "exam" }} title={tx("Քննություն")} sub={tx("65 հարց՝ երկու շտեմարաններից")} icon={<Trophy className="size-5" />} />
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
          <ExamTile to="/history" title={tx("Քննություն")} sub={tx("Քո ընտրած հարցերը, ժամանակը և ռեժիմը")} icon={<Trophy className="size-5" />} />
        </div>
      </section>
    </div>
  );
}

function BiologySubject() {
  const tx = useTx();
  const importedBooks = BIO_BOOKS.filter((b) => b.id === 31 || b.id === 32);
  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <SubjectHeader title={tx("Կենսաբանություն")} sub={tx("Հարցաշարեր, ինքնաստուգում և փորձնական թեստեր")} beta />
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Հասանելի շտեմարաններ")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {importedBooks.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
          {BIOLOGY_ORIGINAL_BOOKS.map((b) => (
            <Link key={b.volume} to="/book/$bookId" params={{ bookId: String(30 + b.volume) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </div>
      </section>
      <p className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground">
        {tx("3-րդ մասում հասանելի է 911, իսկ 4-րդում՝ 777 բնօրինակ տեքստային հարց՝ պատասխաններով։ Կարող ես սովորել և կազմել թեստ՝ առանց PDF ընտրելու։ Մնացած առաջադրանքների թվայնացումը շարունակվում է։")}
      </p>
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Փորձնական թեստեր")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExamTile to="/biology" title={tx("Կենսաբանություն · Անհատական թեստ")} sub={tx("Ընտրիր գրքերը, բաժինները և աշխատանքի ձևաչափը")} icon={<Dna className="size-5" />} />
          <ExamTile to="/biology" title={tx("Կենսաբանություն · Փորձնական քննություն")} sub={tx("70 առաջադրանքով փորձնական թեստ՝ առկա շտեմարաններից")} icon={<Trophy className="size-5" />} />
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-black">{tx("Պաշտոնական քննության նմուշներ")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExamTile href="https://test.am/pdf.php?page=17" title={tx("2026 թ․ հունիսյան քննություններ")} sub={tx("Կենսաբանության պաշտոնական թեստեր և պատասխաններ")} icon={<BookOpen className="size-5" />} />
          <ExamTile href="https://test.am/pdf.php?page=13" title={tx("2026 թ․ հունվար–փետրվարի քննություններ")} sub={tx("Նախորդ փուլի կենսաբանության թեստեր և պատասխաններ")} icon={<ClipboardCheck className="size-5" />} />
          <ExamTile href="https://test.am/pdf.php?page=111" title={tx("Կենսաբանության պաշտոնական շտեմարաններ")} sub={tx("ԳԹԿ-ի հրապարակած շտեմարանների բոլոր հասանելի մասերը")} icon={<BookOpen className="size-5" />} />
          <ExamTile href="https://dimord.am/public/tests" title={tx("ԳԹԿ-ի քննությունների պաշտոնական աղյուսակ")} sub={tx("Ստուգիր նոր հրապարակված թեստերն ու պատասխանները")} icon={<ClipboardCheck className="size-5" />} />
          <ExamTile href="https://www.olymp.am/hy/node/1465" title={tx("Կենսաբանության օլիմպիադա · 2026")} sub={tx("Լրացուցիչ բարդ առաջադրանքներ և պաշտոնական լուծումներ")} icon={<Trophy className="size-5" />} />
        </div>
      </section>
      <p className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">{tx("Նշում․ 1-ին և 2-րդ մասերն ունեն կայքում ներմուծված հարցեր։ 3-րդ և 4-րդ մասերի բնօրինակ հարցերը հասանելի են տեքստով՝ առանց PDF ընտրելու․ ամբողջական, առանձին ձեռքով ստուգված տեքստային բազա դեռ չկա։")}</p>
    </div>
  );
}

function ArmenianSubject() {
  const tx = useTx();
  return (
    <div className="mx-auto max-w-6xl space-y-8 py-6">
      <SubjectHeader title={tx("Հայոց լեզու և հայ գրականություն")} sub={tx("Ուսումնական հարցաշարեր և քննության պատրաստություն")} beta />
      <section className="space-y-4">
        <h2 className="text-xl font-black">{tx("Ինտերակտիվ շտեմարան")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/book/$bookId" params={{ bookId: "41" }} className={TILE}>
            <TileBody cover="/covers/armenian-1.svg" title={tx("Հայոց լեզու և գրականություն")} sub={tx("8 բաժին · 96 հարց · պատասխանների ավտոմատ ստուգում")} />
          </Link>
          <ExamTile to="/exam/$subject" params={{ subject: "armenian" }} title={tx("Փորձնական քննություն")} sub={tx("Խառը հարցեր բոլոր 8 բաժիններից")} icon={<Trophy className="size-5" />} />
          <ExamTile to="/exam/$subject" params={{ subject: "armenian" }} title={tx("Կազմել սեփական թեստ")} sub={tx("Ընտրիր բաժինը և վարժվիր ըստ թեմայի")} icon={<ClipboardCheck className="size-5" />} />
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
        <p className="font-bold text-foreground">{tx("Բաժիններն ու թեմաները")}</p>
        <p className="mt-2">{tx("Հնչյունաբանություն և բառագիտություն · Ձևաբանություն · Շարահյուսություն և կետադրություն · Կապակցված խոսք · Ընդհանուր գիտելիքներ հայոց լեզվի մասին · Ոճագիտություն · Հայ գրականություն")}</p>
        <p className="mt-3">{tx("Այս էջում առաջադրանքները բացվում են հենց Shtemarm-ում․ արտաքին կայքերին ուղղորդող շտեմարանի հղումներ չեն օգտագործվում։ Ներկայում ավելացված հարցերը ուսումնական վարժություններ են, իսկ PDF-ների մնացած առաջադրանքները պետք է հաջորդաբար թվայնացնել և ստուգել պատասխանների բանալիներով։")}</p>
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
    if (!hasSupabaseConfig()) return;
    try {
      void supabase.auth.getUser()
        .then(({ data, error }) => {
          if (!error) setName((data.user?.user_metadata?.username as string | undefined) ?? null);
        })
        .catch(() => { /* Keep the study dashboard usable without an account. */ });
    } catch {
      // Missing or unavailable auth must never crash the public homepage.
    }
  }, []);
  if (subject === "english") return <EnglishSubject />;
  if (subject === "math") return <MathSubject />;
  if (subject === "history") return <HistorySubject />;
  if (subject === "biology") return <BiologySubject />;
  if (subject === "armenian") return <ArmenianSubject />;

  return (
    <div className="academy-home mx-auto max-w-7xl space-y-8 px-1 py-3 sm:space-y-10 sm:py-6">
      <section className="academy-hero relative isolate grid overflow-hidden rounded-[1.65rem] px-5 py-8 text-white sm:px-9 sm:py-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(240px,.7fr)] lg:items-center lg:gap-10 lg:px-11">
        <div className="relative z-10 max-w-2xl space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-widest text-emerald-50">
            <GraduationCap className="size-4" aria-hidden="true"/> SHTEMARM
          </p>
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/80">{tx("Shtemarm · քննությունների պատրաստում")}</p>
            <h1 className="max-w-xl text-balance text-3xl font-black leading-[1.23] sm:text-[2.75rem] lg:text-5xl">{tx("Սովորիր վստահ։ Պատրաստվիր խելացի։")}</h1>
            <p className="max-w-lg text-sm leading-7 text-emerald-50/85 sm:text-base">{tx("Շտեմարաններ, թեմատիկ վարժություններ և փորձնական քննություններ՝ մեկ հարմար ուսումնական տարածքում։")}</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href="#subjects" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#124e4b] shadow-sm transition-colors hover:bg-emerald-50">
              <BookOpen className="size-4" />{tx("Ընտրել առարկան")}<ArrowRight className="size-4" />
            </a>
            <a href="#exams" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20">
              <Target className="size-4" />{tx("Անցնել թեստ")}
            </a>
          </div>
        </div>
        <div className="relative z-10 mt-8 space-y-3 rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 lg:mt-0">
          <p className="text-xs font-bold tracking-[.15em] text-emerald-50/75">{tx("ՈՒՍՈՒՄՆԱԿԱՆ ՔԱՅԼԵՐ")}</p>
          {[
            {n:"01",label:tx("Ընտրիր առարկան"),sub:tx("Գտիր քո շտեմարանը")},
            {n:"02",label:tx("Սովորիր թեմաներով"),sub:tx("Բացատրություններ ու վարժություններ")},
            {n:"03",label:tx("Ստուգիր գիտելիքներդ"),sub:tx("Փորձնական քննություններ")},
          ].map(step=>(
            <div key={step.n} className="flex items-start gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
              <span className="font-mono text-sm font-bold text-[#f1d08c]">{step.n}</span>
              <span className="min-w-0">
                <strong className="block text-sm font-bold">{step.label}</strong>
                <span className="mt-0.5 block text-xs text-white/65">{step.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
      <Link
        to="/download"
        className="academy-download-cta group flex min-h-16 items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-primary shadow-sm transition-colors hover:bg-primary/10 sm:px-5"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12">
          <Smartphone className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block text-sm font-black">{tx("Shtemarm-ը՝ քո հեռախոսում")}</strong>
          <span className="block text-xs leading-5 text-muted-foreground">{tx("Ներբեռնել Android հավելվածը կամ տեղադրել կայքը")}</span>
        </span>
        <Download className="size-5 shrink-0 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
      </Link>
      <Link
        to="/changelog"
        className="group flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 sm:px-5"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block text-sm font-black">{tx("Նորություններ և թարմացումներ")}</strong>
          <span className="block text-xs leading-5 text-muted-foreground">
            {tx("Android Beta 4 · Գրքերի կայունության շտկումներ · Ավարտված և ընթացիկ աշխատանքներ")}
          </span>
        </span>
        <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>
      <nav aria-label={tx("Արագ անցումներ")} className="grid gap-3 sm:grid-cols-3">
        <a href="#subjects" className="academy-quick-action">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><LibraryBig className="size-5"/></span>
          <span className="min-w-0 flex-1"><strong className="block text-sm font-black">{tx("Շտեմարաններ")}</strong><span className="block text-xs text-muted-foreground">{tx("Ընտրիր գիրքը")}</span></span>
          <ArrowRight className="size-4 text-muted-foreground"/>
        </a>
        <Link to="/study-tools" className="academy-quick-action">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300"><Brain className="size-5"/></span>
          <span className="min-w-0 flex-1"><strong className="block text-sm font-black">{tx("Ուսումնական գործիքներ")}</strong><span className="block text-xs text-muted-foreground">{tx("Քո առաջընթացն ու սխալները")}</span></span>
          <ArrowRight className="size-4 text-muted-foreground"/>
        </Link>
      </nav>
      <section className="space-y-7" id="dashboard">
        <div className="space-y-3">
          <p className="text-sm font-bold text-primary">
            {name ? tx("Բարև, {name}։ Ուրախ ենք, որ նորից ես այստեղ։", { name }) : tx("Բարև՝ ընկեր։ Ուրախ ենք, որ այցելեցիր Shtemarm։")}
          </p>
          <h2 className="text-2xl font-black sm:text-3xl">{tx("Քո ուսումնական վահանակը")}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="academy-bento p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Sparkles className="size-4 text-primary" aria-hidden="true" />{tx("Քո միավորները")}</p>
              <p className="mt-1 text-2xl font-black tabular-nums">{progress.xp} <span className="text-sm font-semibold text-muted-foreground">XP</span></p>
              <p className="mt-1 text-xs text-muted-foreground">{tx("Մակարդակ")} {level(progress.xp)}</p>
            </div>
            <div className="academy-bento p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><CheckCircle2 className="size-4 text-success" aria-hidden="true" />{tx("Ճիշտ պատասխաններ")}</p>
              <p className="mt-1 text-2xl font-black tabular-nums">{Object.values(progress.answers).filter((v) => v === 1).length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tx("Ընդհանուր պատասխանված հարցերից")}</p>
            </div>
            <div className="academy-bento p-4">
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
          <details className="group/progress rounded-[1.35rem] border bg-card shadow-card">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-black hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2"><Trophy className="size-5 text-primary"/>{tx("Մանրամասն առաջընթաց")}</span>
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open/progress:rotate-180"/>
            </summary>
            <div className="border-t p-3 sm:p-4">
          {(() => {
            const values = Object.values(progress.answers);
            const right = values.filter((v) => v === 1).length;
            const wrong = values.filter((v) => v === 0).length;
            const answered = values.length;
            const accuracy = answered ? Math.round((right / answered) * 100) : 0;
            return (
              <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-sm sm:p-6 lg:p-7" aria-label={tx("Առաջընթացի վերլուծություն")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-black"><Trophy className="size-5 text-primary" />{tx("Առաջընթացի վերլուծություն")}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{tx("Տես՝ ինչն է արդեն լավ ստացվում և ինչն է պետք կրկնել։")}</p>
                  </div>
                  <span className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-black text-primary">{accuracy}% {tx("ճշտություն")}</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-success transition-[width] duration-500" style={{ width: String(accuracy) + "%" }} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-success/8 p-4">
                    <p className="flex items-center gap-2 font-bold text-success"><CheckCircle2 className="size-4" />{tx("Ուժեղ կողմեր")}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{answered ? tx("Դու արդեն ճիշտ ես պատասխանել {n} հարցի։ Շարունակի՛ր պահպանել այս արդյունքը։", { n: right }) : tx("Երբ սկսես լուծել հարցեր, այստեղ կերևան ճիշտ պատասխաններդ և ձեռք բերած հմտությունները։")}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-500/8 p-4">
                    <p className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300"><RotateCcw className="size-4" />{tx("Կրկնելու կարիք ունեն")}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{wrong ? tx("Կա {n} սխալ պատասխան․ կրկնիր այդ հարցերը և փորձիր նորից։", { n: wrong }) : tx("Առայժմ սխալ պատասխաններ չկան։ Նոր թեստեր լուծիր՝ բացերը բացահայտելու համար։")}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{tx("Վերլուծությունը հիմնված է պահված պատասխանների վրա և դեռ չի դասակարգում առանձին թեմաները։")}</p>
              </section>
            );
          })()}
            </div>
          </details>
          <p className="text-sm text-muted-foreground">{tx("Սովորիր քայլ առ քայլ, ստուգիր գիտելիքներդ թեստերով կամ լուծիր խնդիրներ հաշվիչով։")}</p>
        </div>

        <div id="subjects" className="scroll-mt-24 space-y-3 pt-2">
          <p className="academy-eyebrow">{tx("Ուսումնական գրադարան")}</p>
          <h2 className="academy-section-title text-2xl font-black sm:text-3xl">{tx("Գտիր քո շտեմարանը")}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{tx("Բացիր առարկան՝ տեսնելու բոլոր գրքերն ու հարցաշարերը։")}</p>
        </div>
        <SubjectRow title={tx("Անգլերեն")} defaultOpen>
          {BOOKS.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </SubjectRow>

        <SubjectRow title={tx("Մաթեմատիկա")} defaultOpen>
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

        <SubjectRow title={tx("Հայոց լեզու և հայ գրականություն")} beta>
          <Link to="/dashboard" search={{ subject: "armenian" }} className={TILE}><TileBody title={tx("Հայոց լեզու · Թեստեր")} sub={tx("Հարցաշար և պաշտոնական նմուշներ")} /></Link>
          {ARMENIAN_BOOKS.map((b) => <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}><TileBody cover={b.cover} title={b.title} sub={b.sub} /></Link>)}
        </SubjectRow>
        <SubjectRow title={tx("Կենսաբանություն")} beta>
          <Link to="/dashboard" search={{ subject: "biology" }} className={TILE}><div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-500/15 via-muted to-primary/10 p-4 text-center text-primary sm:aspect-[3/4]"><Dna className="size-12" /><span className="font-black">{tx("Բոլոր կենսաբանության թեստերը")}</span></div><div className="p-4"><p className="text-xs text-muted-foreground">{tx("Հարցաշարեր և քննություն")}</p></div></Link>
          {BIO_BOOKS.filter(b => b.id === 31 || b.id === 32).map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub}/>
            </Link>
          ))}
          {BIOLOGY_ORIGINAL_BOOKS.map((b) => (
            <Link key={b.volume} to="/book/$bookId" params={{ bookId: String(30 + b.volume) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub}/>
            </Link>
          ))}
        </SubjectRow>
        <SubjectRow title={tx("Ֆիզիկա · երկու մաս")} beta>
          <Link to="/subject/$subject" params={{ subject:"physics" }} className={TILE}>
            <TileBody cover="/covers/physics-1.svg" title={tx("Ֆիզիկա · քննությունների պատրաստություն")}
              sub={tx("Երկու մաս · 55 առաջադրանքով փորձնական քննություն")} />
          </Link>
          {PHYSICS_BOOKS.map((b)=>(
            <Link key={b.id} to="/book/$bookId" params={{bookId:String(b.id)}} className={TILE}>
              <TileBody cover={b.cover} title={tx(b.title)} sub={tx(b.sub)}/>
            </Link>
          ))}
        </SubjectRow>
        <SubjectRow title={tx("Քիմիա · Աշխարհագրություն · Ռուսաց լեզու")} beta>
          {STARTER_SUBJECT_BOOKS.filter(b=>b.id!==51).map((b) => {
            const subject = ({51:"physics",52:"chemistry",53:"geography",54:"russian"} as Record<number, string>)[b.id]!;
            return (
              <Link key={b.id} to="/subject/$subject" params={{ subject }} className={TILE}>
                <TileBody cover={b.cover} title={tx(b.title)} sub={tx("Ուսումնական 12 հարց · ԳԹԿ 2027 ուղեցույց")} />
              </Link>
            );
          })}
        </SubjectRow>
      </section>

      <section id="exams" className="scroll-mt-24 space-y-5">
        <p className="academy-eyebrow">{tx("Գիտելիքների ստուգում")}</p>
        <h2 className="academy-section-title text-2xl font-black sm:text-3xl">{tx("Փորձնական քննություններ")}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{tx("Ընտրիր առարկան և ստուգիր պատրաստվածությունդ։")}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4 [&>*:nth-child(1)]:lg:col-span-6 [&>*:nth-child(2)]:lg:col-span-6 [&>*:nth-child(3)]:lg:col-span-4 [&>*:nth-child(4)]:lg:col-span-4 [&>*:nth-child(5)]:lg:col-span-4">
          <ExamTile
            to="/exam/$subject" params={{ subject: "english" }}
            title={tx("Քննություն")}
            sub={tx("Անգլերեն · 13 բաժին · 80 միավոր")}
            icon={<Trophy className="size-5" />}
          />
          <ExamTile
            to="/exam/$subject" params={{ subject: "english" }}
            title={tx("Անգլերեն · Կազմել թեստ")}
            sub={tx("Ընտրիր բաժինները և քանակը")}
            icon={<ClipboardCheck className="size-5" />}
          />
          <ExamTile to="/math" title={tx("Քննություն")} sub={tx("Մաթեմատիկա · 65 հարցանոց փորձնական թեստ")} icon={<Trophy className="size-5" />} />
          <ExamTile to="/history" title={tx("Քննություն")} sub={tx("Հայոց պատմություն · Անհատական թեստ")} icon={<Trophy className="size-5" />} />
          <ExamTile to="/biology" title={tx("Կենսաբանություն · Քննություն")} sub={tx("Անհատական թեստ՝ 1-ին և 2-րդ շտեմարաններից")} icon={<Dna className="size-5" />} />
          <ExamTile to="/exam/$subject" params={{ subject: "armenian" }} title={tx("Հայոց լեզու և գրականություն")} sub={tx("70 առաջադրանք · ուսումնական տարբերակ")} icon={<BookOpen className="size-5" />} />
          <ExamTile to="/subject/$subject" params={{subject:"physics"}}
            title={tx("Ֆիզիկա · փորձնական քննություն")}
            sub={tx("70 պատասխանային դիրք · 80 միավոր · 2 մաս")}
            icon={<BookOpen className="size-5"/>}/>
          {STARTER_SUBJECT_BOOKS.filter(b=>b.id!==51).map((b) => (
            <ExamTile key={b.id} to="/subject/$subject"
              params={{ subject: ({51:"physics",52:"chemistry",53:"geography",54:"russian"} as Record<number,string>)[b.id]! }}
              title={tx(b.title)} sub={tx("Ուսումնական հարցեր և ԳԹԿ-ի 2027 ուղեցույց")}
              icon={<BookOpen className="size-5" />} />
          ))}
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-3" aria-label={tx("Լրացուցիչ ուսումնական գործիքներ")}>
        <ExamTile to="/flashcards" title={tx("Հիշողության քարտեր")} sub={tx("Կրկնել իրական հարցերն ու պատասխանները")} icon={<BookOpen className="size-5"/>}/>
        <ExamTile to="/mini-games" title={tx("Ուսումնական խաղեր")} sub={tx("Վիկտորինա, ճիշտ/սխալ և համապատասխանեցում")} icon={<Trophy className="size-5"/>}/>
      </section>
      <section className="academy-bento grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-black">{tx("Օգնիր մեզ դառնալ ավելի լավը")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{tx("Սխա՞լ ես գտել կամ ունե՞ս առաջարկ։ Գրիր մեզ՝ մենք կարդում ենք բոլոր հաղորդագրությունները։")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link to="/feedback" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-md"><MessageCircle className="size-4" aria-hidden="true" />{tx("Գրել մեզ")}</Link>
          <Link to="/calc" className="inline-flex items-center gap-2 rounded-2xl border bg-card px-4 py-2.5 text-sm font-bold transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><Calculator className="size-4" aria-hidden="true" />{tx("Բացել հաշվիչը")}</Link>
        </div>
      </section>
    </div>
  );
}


