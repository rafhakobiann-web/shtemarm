import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronDown, ClipboardCheck, Trophy, Brain, BookOpen, Calculator, CheckCircle2, RotateCcw, MessageCircle, Sparkles, Dna, LibraryBig, Target, Smartphone } from "lucide-react";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
import { useLang, useTx } from "@/lib/lang";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ARMENIAN_BOOKS, BIO_BOOKS, BOOKS, HISTORY_BOOKS, PHYSICS_BOOKS, STARTER_SUBJECT_BOOKS } from "@/lib/books";
import { useProgress, level } from "@/lib/progress";
import { BookCover } from "@/components/BookCover";

const SUBJECTS = ["english", "math", "history", "biology", "armenian"] as const;
const LIBRARY_FILTERS = [
  { id:"all", hy:"Բոլորը", en:"All subjects", ru:"Все" },
  { id:"english", hy:"Անգլերեն", en:"English", ru:"Английский" },
  { id:"math", hy:"Մաթեմատիկա", en:"Mathematics", ru:"Математика" },
  { id:"history", hy:"Հայոց պատմություն", en:"History", ru:"История" },
  { id:"armenian", hy:"Հայոց լեզու", en:"Armenian", ru:"Армянский" },
  { id:"biology", hy:"Կենսաբանություն", en:"Biology", ru:"Биология" },
  { id:"physics", hy:"Ֆիզիկա", en:"Physics", ru:"Физика" },
  { id:"other", hy:"Այլ առարկաներ", en:"More subjects", ru:"Другие" },
] as const;
type LibraryFilter = typeof LIBRARY_FILTERS[number]["id"];

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
  const [expanded, setExpanded] = useState(defaultOpen);
  return (
    <details className="group/subject overflow-hidden rounded-[1.4rem] border bg-card shadow-card" open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
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
  const lang = useLang();
  const progress = useProgress();
  const { subject } = Route.useSearch();
  const [name, setName] = useState<string | null>(null);
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("all");
  const showLibrary = (key: LibraryFilter) => libraryFilter === "all" || libraryFilter === key;
  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    let active = true;
    void supabase.auth.getUser()
      .then(({ data, error }) => {
        if (!active || error || !data.user) return;
        setName((data.user.user_metadata?.username as string | undefined) ?? null);
      })
      .catch(() => { /* The dashboard remains usable when profile lookup fails. */ });
    return () => { active = false; };
  }, []);
  if (subject === "english") return <EnglishSubject />;
  if (subject === "math") return <MathSubject />;
  if (subject === "history") return <HistorySubject />;
  if (subject === "biology") return <BiologySubject />;
  if (subject === "armenian") return <ArmenianSubject />;

  return (
    <div className="academy-home mx-auto max-w-6xl space-y-5 px-1 py-3 sm:space-y-6 sm:py-6">
      <DashboardOverview name={name} progress={progress} />
      <nav aria-label={tx("Արագ անցումներ")} className="sht-dashboard-shortcuts grid gap-3 sm:grid-cols-2">
        <a href="#subjects" className="academy-quick-action">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><LibraryBig className="size-5"/></span>
          <span className="min-w-0 flex-1"><strong className="block text-sm font-black">{tx("Շտեմարաններ")}</strong><span className="block text-xs text-muted-foreground">{tx("Ընտրիր գիրքը")}</span></span>
          <ArrowRight className="size-4 text-muted-foreground"/>
        </a>
        <a href="#exams" className="academy-quick-action">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300"><Target className="size-5"/></span>
          <span className="min-w-0 flex-1"><strong className="block text-sm font-black">{tx("Փորձնական քննություններ")}</strong><span className="block text-xs text-muted-foreground">{tx("Ստուգիր պատրաստվածությունդ")}</span></span>
          <ArrowRight className="size-4 text-muted-foreground"/>
        </a>
      </nav>
      <section className="space-y-4" id="dashboard">
        <div id="subjects" className="scroll-mt-24 space-y-3 pt-2">
          <h2 className="academy-section-title text-2xl font-black sm:text-3xl">{tx("Գտիր քո շտեմարանը")}</h2>
          <div className="dashboard-library-filters flex gap-2 overflow-x-auto pb-2" role="group" aria-label={lang === "en" ? "Filter question books by subject" : lang === "ru" ? "Фильтр сборников по предметам" : "Զտել շտեմարանները ըստ առարկայի"}>
            {LIBRARY_FILTERS.map(option => (
              <button key={option.id} type="button" aria-pressed={libraryFilter === option.id} onClick={() => setLibraryFilter(option.id)}
                className="min-h-11 shrink-0 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary">
                {option[lang]}
              </button>
            ))}
          </div>
        </div>
        {showLibrary("english") && <SubjectRow key={"english-" + libraryFilter} title={tx("Անգլերեն")} defaultOpen={libraryFilter !== "all"}>
          {BOOKS.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </SubjectRow>}

        {showLibrary("math") && <SubjectRow key={"math-" + libraryFilter} title={tx("Մաթեմատիկա")} defaultOpen={libraryFilter !== "all"}>
          {MATH_BOOKS.map((b) => (
            <Link key={b.id} to="/math/books" search={{ book: b.id } as never} className={TILE}>
              <TileBody cover={b.cover} title={tx(b.title)} sub={b.sub} />
            </Link>
          ))}
        </SubjectRow>}

        {showLibrary("history") && <SubjectRow key={"history-" + libraryFilter} title={tx("Հայոց պատմություն")} defaultOpen={libraryFilter !== "all"}>
          {HISTORY_BOOKS.map((h) => (
            <Link key={h.id} to="/book/$bookId" params={{ bookId: String(h.id) }} className={TILE}>
              <TileBody cover={h.cover} title={h.title} sub={h.sub} />
            </Link>
          ))}
        </SubjectRow>}

        {showLibrary("armenian") && <SubjectRow key={"armenian-" + libraryFilter} title={tx("Հայոց լեզու և հայ գրականություն")} beta defaultOpen={libraryFilter !== "all"}>
          <Link to="/dashboard" search={{ subject: "armenian" }} className={TILE}><TileBody title={tx("Հայոց լեզու · Թեստեր")} sub={tx("Հարցաշար և պաշտոնական նմուշներ")} /></Link>
          {ARMENIAN_BOOKS.map((b) => <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}><TileBody cover={b.cover} title={b.title} sub={b.sub} /></Link>)}
        </SubjectRow>}
        {showLibrary("biology") && <SubjectRow key={"biology-" + libraryFilter} title={tx("Կենսաբանություն")} beta defaultOpen={libraryFilter !== "all"}>
          <Link to="/biology" className="inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary sm:w-fit"><span className="inline-flex items-center gap-2"><Dna className="size-5 shrink-0 text-primary" />{tx("Կենսաբանության քննություններ")}</span><ArrowRight className="size-4 shrink-0 text-primary" /></Link>
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
        </SubjectRow>}
        {showLibrary("physics") && <SubjectRow key={"physics-" + libraryFilter} title={tx("Ֆիզիկա · երկու մաս")} beta defaultOpen={libraryFilter !== "all"}>
          <Link to="/subject/$subject" params={{ subject:"physics" }} className={TILE}>
            <TileBody cover="/covers/physics-1.svg" title={tx("Ֆիզիկա · քննությունների պատրաստություն")}
              sub={tx("Երկու մաս · 55 առաջադրանքով փորձնական քննություն")} />
          </Link>
          {PHYSICS_BOOKS.map((b)=>(
            <Link key={b.id} to="/book/$bookId" params={{bookId:String(b.id)}} className={TILE}>
              <TileBody cover={b.cover} title={tx(b.title)} sub={tx(b.sub)}/>
            </Link>
          ))}
        </SubjectRow>}
        {libraryFilter === "other" && <SubjectRow key={"other-" + libraryFilter} title={tx("Քիմիա · Աշխարհագրություն · Ռուսաց լեզու")} beta defaultOpen={libraryFilter !== "all"}>
          {STARTER_SUBJECT_BOOKS.filter(b=>b.id!==51).map((b) => {
            const subject = ({51:"physics",52:"chemistry",53:"geography",54:"russian"} as Record<number, string>)[b.id]!;
            return (
              <Link key={b.id} to="/subject/$subject" params={{ subject }} className={TILE}>
                <TileBody cover={b.cover} title={tx(b.title)} sub={tx("Ուսումնական 12 հարց · ԳԹԿ 2027 ուղեցույց")} />
              </Link>
            );
          })}
        </SubjectRow>}
      </section>

      <section id="exams" className="scroll-mt-24 space-y-5">
        <h2 className="academy-section-title text-2xl font-black sm:text-3xl">{tx("Փորձնական քննություններ")}</h2>
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
          <ExamTile to="/math" search={{ mode: "exam" }} title={tx("Քննություն")} sub={tx("Մաթեմատիկա · 65 հարցանոց փորձնական թեստ")} icon={<Trophy className="size-5" />} />
          <ExamTile to="/history" title={tx("Քննություն")} sub={tx("Հայոց պատմություն · Անհատական թեստ")} icon={<Trophy className="size-5" />} />
          <details className="col-span-full min-w-0 overflow-hidden rounded-2xl border bg-card" data-dashboard-more-exams>
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
              {lang === "hy" ? "Բոլոր մյուս քննությունները" : lang === "ru" ? "Другие экзамены" : "More practice exams"}
              <ChevronDown className="size-4 text-primary" aria-hidden="true" />
            </summary>
            <div className="grid gap-3 border-t p-3 sm:grid-cols-2 lg:grid-cols-3">
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
          </details>
        </div>
      </section>
      <details className="group/tools rounded-2xl border bg-card">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
          {lang === "hy" ? "Այլ ուսումնական գործիքներ" : lang === "ru" ? "Другие инструменты" : "More study tools"}
          <ChevronDown className="size-4 text-primary transition-transform group-open/tools:rotate-180" aria-hidden="true" />
        </summary>
        <div className="grid gap-3 border-t p-3 sm:grid-cols-3">
          <Link to="/study-plan" className="sht-dashboard-bento academy-quick-action"><Target className="size-5 text-primary" />{lang === "hy" ? "Ուսումնական պլան" : lang === "ru" ? "План занятий" : "Study plan"}<ArrowRight className="ml-auto size-4" /></Link>
          <Link to="/mistakes" className="academy-quick-action"><RotateCcw className="size-5 text-primary" />{lang === "hy" ? "Իմ սխալները" : lang === "ru" ? "Мои ошибки" : "Review mistakes"}<ArrowRight className="ml-auto size-4" /></Link>
          <Link to="/chat" className="academy-quick-action"><MessageCircle className="size-5 text-primary" />{lang === "hy" ? "AI ուսուցիչ" : lang === "ru" ? "ИИ-учитель" : "AI teacher"}<ArrowRight className="ml-auto size-4" /></Link>
          <Link to="/flashcards" className="academy-quick-action"><BookOpen className="size-5 text-primary" />{lang === "hy" ? "Բառաքարտեր" : lang === "ru" ? "Карточки" : "Flashcards"}<ArrowRight className="ml-auto size-4" /></Link>
          <Link to="/mini-games" className="academy-quick-action"><Trophy className="size-5 text-primary" />{lang === "hy" ? "Ուսումնական խաղեր" : lang === "ru" ? "Учебные игры" : "Mini games"}<ArrowRight className="ml-auto size-4" /></Link>
          <Link to="/calc" className="academy-quick-action"><Calculator className="size-5 text-primary" />{lang === "hy" ? "Հաշվիչ" : lang === "ru" ? "Калькулятор" : "Calculator"}<ArrowRight className="ml-auto size-4" /></Link>
          <Link to="/feedback" className="academy-quick-action"><MessageCircle className="size-5 text-primary" />{lang === "hy" ? "Գրել մշակողին" : lang === "ru" ? "Написать разработчику" : "Send feedback"}<ArrowRight className="ml-auto size-4" /></Link>
        </div>
      </details>
      <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-5 text-sm">
        <Link to="/download" className="inline-flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground"><Smartphone className="size-4" aria-hidden="true" />{tx("Ներբեռնել Android հավելվածը")}</Link>
        <Link to="/changelog" className="inline-flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground"><Sparkles className="size-4" aria-hidden="true" />{tx("Նորություններ և թարմացումներ")}</Link>
      </footer>
    </div>
  );
}


