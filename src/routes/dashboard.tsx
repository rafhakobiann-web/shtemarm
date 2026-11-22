import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ClipboardCheck, Trophy, Brain, BookOpen, Sparkles, Dna } from "lucide-react";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
import { useLang, useTx } from "@/lib/lang";
import { biologyBookTitle, biologyBookSubtitle } from "@/lib/biology-headings";
import { DashboardOverview } from "@/components/DashboardOverview";
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
  { volume: 3 as const, title: "Կենսաբանություն", sub: "Մաս III · 1 837 բնօրինակ առաջադրանք · սրբագրման փուլ", cover: "/covers/bio-3.svg" },
  { volume: 4 as const, title: "Կենսաբանություն", sub: "Մաս IV · 1 688 բնօրինակ առաջադրանք · սրբագրման փուլ", cover: "/covers/bio-4.svg" },
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
  const lang = useLang();
  const words = {
    hy: {back:"Բոլոր առարկաները",kind:"Սովորել ըստ առարկայի",books:"Բացել շտեմարանները",exams:"Գտնել քննություն"},
    en: {back:"All subjects",kind:"SUBJECT LEARNING",books:"Browse workbooks",exams:"Find practice exam"},
    ru: {back:"Все предметы",kind:"ИЗУЧЕНИЕ ПРЕДМЕТА",books:"Открыть сборники",exams:"Найти экзамен"},
  }[lang];
  return (
    <header className="sht-subject-header min-w-0 space-y-4 rounded-3xl border bg-card p-5 sm:p-7">
      <Link to="/explore" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">
        <ArrowLeft className="size-4" aria-hidden="true"/>{words.back}
      </Link>
      <div className="space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-primary">{words.kind}</span>
        <h1 className="flex flex-wrap items-center gap-3 break-words text-2xl font-black tracking-tight text-foreground sm:text-4xl">
          {title}
          {beta && <span className="rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-1 text-[10px] font-black tracking-wider text-amber-700 dark:text-amber-300">BETA</span>}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{sub}</p>
      </div>
      <nav className="flex flex-wrap gap-2 pt-1" aria-label={lang==="en"?"Subject shortcuts":lang==="ru"?"Быстрые переходы":"Արագ անցումներ"}>
        <a href="#subject-books" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-primary">
          <BookOpen className="size-4" aria-hidden="true"/>{words.books}
        </a>
        <Link to="/explore" hash="exams" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-bold text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">
          <Trophy className="size-4" aria-hidden="true"/>{words.exams}
        </Link>
      </nav>
    </header>
  );
}

function EnglishSubject() {
  const tx = useTx();
  return (
    <div className="mx-auto max-w-6xl space-y-7 py-4 sm:space-y-9 sm:py-6">
      <SubjectHeader title={tx("Անգլերեն")} sub={tx("Շտեմարաններ և քննություններ")} />
      <Link to="/solutions" search={{view:"english"}}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border px-4 py-2 text-sm font-bold text-primary hover:bg-muted">
        {tx("Նախ սովորել անգլերենի կանոնները")} <ArrowRight className="size-4" aria-hidden="true"/>
      </Link>
      <section id="subject-books" className="space-y-6">
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
    <div className="mx-auto max-w-6xl space-y-7 py-4 sm:space-y-9 sm:py-6">
      <SubjectHeader title={tx("Մաթեմատիկա")} sub={tx("Շտեմարաններ և քննություն")} />
      <Link to="/solutions" search={{view:"math"}}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border px-4 py-2 text-sm font-bold text-primary hover:bg-muted">
        {tx("Նախ սովորել լուծման մեթոդներն ու գծագրերը")} <ArrowRight className="size-4" aria-hidden="true"/>
      </Link>
      <section id="subject-books" className="space-y-6">
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
    <div className="mx-auto max-w-6xl space-y-7 py-4 sm:space-y-9 sm:py-6">
      <SubjectHeader title={tx("Հայոց պատմություն")} sub={tx("Շտեմարաններ և պաշտոնական քննության նմուշային թեստեր")} />
      <section id="subject-books" className="space-y-6">
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
  const lang = useLang();
  const importedBooks = BIO_BOOKS.filter((b) => b.id === 31 || b.id === 32);
  return (
    <div className="mx-auto max-w-6xl space-y-7 py-4 sm:space-y-9 sm:py-6">
      <SubjectHeader title={tx("Կենսաբանություն")} sub={tx("Հարցաշարեր, ինքնաստուգում և փորձնական թեստեր")} />
      <section id="subject-books" className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Հասանելի շտեմարաններ")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {importedBooks.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={biologyBookTitle(b.id, lang) ?? b.title} sub={lang === "en" ? "Practice questions" : lang === "ru" ? "Учебные задания" : "Ուսումնական առաջադրանքներ"} />
            </Link>
          ))}
          {BIOLOGY_ORIGINAL_BOOKS.map((b) => (
            <Link key={b.volume} to="/book/$bookId" params={{ bookId: String(30 + b.volume) }} className={TILE}>
              <TileBody cover={b.cover} title={biologyBookTitle(30 + b.volume, lang) ?? b.title} sub={biologyBookSubtitle(30 + b.volume, lang) ?? b.sub} />
            </Link>
          ))}
        </div>
      </section>
      <p className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground">
        {lang === "en" ? "All 3,525 indexed exercises from Parts III and IV are available for practice without selecting a PDF. Final source proofreading is ongoing." : lang === "ru" ? "Все 3 525 пронумерованных заданий из частей III и IV доступны без PDF. Сверка с оригиналами продолжается." : "III և IV մասերի բոլոր 3 525 համարակալված առաջադրանքները հասանելի են՝ առանց PDF ընտրելու։ Բնօրինակի հետ վերջնական սրբագրումը շարունակվում է։"}
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
      <p className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">{lang === "en" ? "Note: Parts III and IV have complete indexed question coverage, but not every question has been manually verified against the printed source." : lang === "ru" ? "Примечание: все задания частей III и IV внесены, однако не каждое задание вручную сверено с печатным оригиналом." : "Նշում․ III և IV մասերի բոլոր համարակալված առաջադրանքները ներմուծված են, սակայն դրանցից ոչ բոլորն են առանձին ձեռքով համեմատվել տպագիր բնօրինակի հետ։"}</p>
    </div>
  );
}

function ArmenianSubject() {
  const tx = useTx();
  return (
    <div className="mx-auto max-w-6xl space-y-8 py-6">
      <SubjectHeader title={tx("Հայոց լեզու և հայ գրականություն")} sub={tx("Ուսումնական հարցաշարեր և քննության պատրաստություն")} beta />
      <section id="subject-books" className="space-y-4">
        <h2 className="text-xl font-black">{tx("Ինտերակտիվ շտեմարան")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ARMENIAN_BOOKS.map(book => (
            <Link key={book.id} to="/book/$bookId" params={{bookId:String(book.id)}} className={TILE}>
              <TileBody cover={book.cover} title={tx(book.title)} sub={tx(book.sub)} />
            </Link>
          ))}
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
  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    let active = true;
    void supabase.auth.getUser()
      .then(({data,error}) => {
        if (!active || error || !data.user) return;
        const candidate = data.user.user_metadata?.username;
        if (typeof candidate === "string") setName(candidate.slice(0, 40));
      })
      .catch(() => { /* The Dashboard remains accessible if profile lookup fails. */ });
    return () => {active=false;};
  }, []);

  if (subject === "english") return <EnglishSubject />;
  if (subject === "math") return <MathSubject />;
  if (subject === "history") return <HistorySubject />;
  if (subject === "biology") return <BiologySubject />;
  if (subject === "armenian") return <ArmenianSubject />;

  const words = {
    hy:{heading:"Ընտրիր առարկան", hint:"Բացիր շտեմարանը և սկսիր սովորել։", all:"Բոլոր առարկաները",
      actions:"Ավելին", exams:"Փորձնական քննություններ", tools:"Ուսումնական գործիքներ"},
    en:{heading:"Choose a subject", hint:"Open a workbook and start learning.", all:"Browse all subjects",
      actions:"More ways to study", exams:"Practice exams", tools:"Study tools"},
    ru:{heading:"Выбери предмет", hint:"Открой сборник и начни заниматься.", all:"Все предметы",
      actions:"Ещё для учёбы", exams:"Пробные экзамены", tools:"Учебные инструменты"},
  }[lang];
  const subjects = [
    {id:"english" as const,title:{hy:"Անգլերեն",en:"English",ru:"Английский"},sub:{hy:"3 շտեմարան",en:"3 workbooks",ru:"3 сборника"},mark:"EN"},
    {id:"math" as const,title:{hy:"Մաթեմատիկա",en:"Mathematics",ru:"Математика"},sub:{hy:"2 շտեմարան",en:"2 workbooks",ru:"2 сборника"},mark:"ƒx"},
    {id:"armenian" as const,title:{hy:"Հայոց լեզու",en:"Armenian",ru:"Армянский"},sub:{hy:"4 մաս",en:"4 volumes",ru:"4 части"},mark:"Ա"},
    {id:"history" as const,title:{hy:"Հայոց պատմություն",en:"History",ru:"История"},sub:{hy:"3 շտեմարան",en:"3 workbooks",ru:"3 сборника"},mark:"Հ"},
    {id:"biology" as const,title:{hy:"Կենսաբանություն",en:"Biology",ru:"Биология"},sub:{hy:"4 մաս",en:"4 volumes",ru:"4 части"},mark:"DNA"},
  ];

  return (
    <main className="sht-home-2026 mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8 sm:pt-5">
      <DashboardOverview name={name} progress={progress} />

      <section id="subjects" className="scroll-mt-24 space-y-4" aria-label={words.heading}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground sm:text-2xl">{words.heading}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{words.hint}</p>
          </div>
          <Link to="/explore" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-black text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary">
            {words.all}<ArrowRight className="size-4" aria-hidden="true"/>
          </Link>
        </div>

        <div className="sht-home-subject-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map(item => (
            <Link key={item.id} to="/dashboard" search={{subject:item.id}}
              className="sht-home-subject-card group flex min-h-[104px] min-w-0 items-start gap-3 rounded-2xl border bg-card p-4 text-foreground focus-visible:outline-2 focus-visible:outline-primary">
              <span aria-hidden="true" className="sht-home-subject-mark grid size-12 shrink-0 place-items-center rounded-xl text-xs font-black text-primary">{item.mark}</span>
              <span className="min-w-0 flex-1">
                <strong className="block break-words text-sm font-black sm:text-base">{item.title[lang]}</strong>
                <span className="mt-1 block text-xs text-muted-foreground">{item.sub[lang]}</span>
              </span>
              <ArrowRight className="mt-3 size-4 shrink-0 text-primary" aria-hidden="true"/>
            </Link>
          ))}
          <Link to="/subject/$subject" params={{subject:"physics"}}
            className="sht-home-subject-card group flex min-h-[104px] min-w-0 items-start gap-3 rounded-2xl border bg-card p-4 text-foreground focus-visible:outline-2 focus-visible:outline-primary">
            <span aria-hidden="true" className="sht-home-subject-mark grid size-12 shrink-0 place-items-center rounded-xl text-sm font-black text-primary">Φ</span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-black sm:text-base">{lang==="hy"?"Ֆիզիկա":lang==="ru"?"Физика":"Physics"}</strong>
              <span className="mt-1 block text-xs text-muted-foreground">{lang==="hy"?"2 մաս և թեստեր":lang==="ru"?"2 части и тесты":"2 volumes and tests"}</span>
            </span>
            <ArrowRight className="mt-3 size-4 shrink-0 text-primary" aria-hidden="true"/>
          </Link>
        </div>
      </section>

      <section id="exams" className="scroll-mt-24 border-t pt-5" aria-label={words.actions}>
        <h2 className="text-base font-bold text-foreground">{words.actions}</h2>
        <nav aria-label={words.actions} className="sht-quiet-shortcuts mt-2 flex flex-col gap-1 sm:flex-row sm:gap-3">
          <Link to="/explore" hash="exams"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">
            <Trophy className="size-4 text-primary" aria-hidden="true" />{words.exams}<ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </Link>
          <Link to="/study-tools"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">
            <BookOpen className="size-4 text-primary" aria-hidden="true" />{words.tools}<ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </Link>
        </nav>
      </section>
    </main>
  );
}

