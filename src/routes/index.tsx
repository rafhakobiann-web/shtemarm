import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck, Trophy, Brain, BookOpen, Calculator, CheckCircle2, RotateCcw, MessageCircle, GraduationCap, Sparkles, Dna } from "lucide-react";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTx } from "@/lib/lang";
import { ARMENIAN_BOOKS, BIO_BOOKS, BOOKS, HISTORY_BOOKS, STARTER_SUBJECT_BOOKS } from "@/lib/books";
import { useProgress, level } from "@/lib/progress";

const SUBJECTS = ["english", "math", "history", "biology", "armenian"] as const;

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
  "glass group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-border/70 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const MATH_BOOKS = [
  { id: "matem-1", title: "Մաթեմատիկա • Մաս 1", sub: "Երևան 2019", cover: "/covers/math-1.svg" },
  { id: "matem-2", title: "Մաթեմատիկա • Մաս 2", sub: "Երևան 2020", cover: "/covers/math-2.svg" },
] as const;

function SubjectCover({ title, sub }: { title: string; sub: string }) {
  const text = `${title} ${sub}`.toLowerCase();
  const isMath = text.includes("մաթեմատիկ") || text.includes("matem");
  const isBiology = text.includes("կենսաբան") || text.includes("bio");
  const isHistory = text.includes("պատմ");
  const isArmenian = text.includes("հայոց լեզու") || text.includes("գրական") || text.includes("armenian");
  const isEnglish = text.includes("անգլերեն") || text.includes("շտեմարան") || text.includes("english");
  const subject = isMath ? "ՄԱԹԵՄԱՏԻԿԱ" : isBiology ? "ԿԵՆՍԱԲԱՆՈՒԹՅՈՒՆ" : isHistory ? "ՀԱՅՈՑ ՊԱՏՄՈՒԹՅՈՒՆ" : isArmenian ? "ՀԱՅՈՑ ԼԵԶՈՒ ԵՎ ԳՐԱԿԱՆՈՒԹՅՈՒՆ" : isEnglish ? "ԱՆԳԼԵՐԵՆ" : title.toLocaleUpperCase("hy-AM");
  const Icon = isMath ? Calculator : isBiology ? Dna : isHistory || isArmenian || isEnglish ? BookOpen : Brain;
  const palette = isMath
    ? "from-blue-950 via-blue-800 to-cyan-600"
    : isBiology
      ? "from-emerald-950 via-emerald-800 to-lime-600"
      : isHistory
        ? "from-orange-950 via-amber-800 to-orange-500"
        : isArmenian
          ? "from-violet-950 via-purple-800 to-fuchsia-500"
          : "from-indigo-950 via-indigo-800 to-sky-500";
  const badge = isMath ? "01" : isBiology ? "02" : isHistory ? "03" : isArmenian ? "04" : "05";
  return (
    <div className={`relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br ${palette} p-3 text-white sm:p-4`} aria-label={subject}>
      <div aria-hidden="true" className="absolute -right-8 -top-8 size-36 rounded-full border border-white/20" />
      <div aria-hidden="true" className="absolute -right-1 top-1 size-24 rounded-full border border-white/15" />
      <div aria-hidden="true" className="absolute -bottom-10 -left-8 size-36 rounded-full border-[18px] border-white/10" />
      <div aria-hidden="true" className="absolute inset-x-4 top-4 h-px bg-white/25" />
      <div className="relative z-10 flex min-h-0 w-full flex-col justify-between gap-3 sm:gap-4">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.2em]">SHTEMARM</span>
          <span className="text-xs font-bold tracking-[0.2em] text-white/65">{badge}</span>
        </div>
        <div className="flex flex-col items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/25 bg-white/10 shadow-lg backdrop-blur-sm sm:size-12">
            <Icon className="size-6 sm:size-7" strokeWidth={1.4} aria-hidden="true" />
          </span>
          <h4 className="line-clamp-3 max-w-full break-words text-pretty text-sm font-black leading-snug tracking-wide text-white sm:text-base">{subject}</h4>
          <p className="line-clamp-2 break-words text-[9px] font-semibold tracking-[0.08em] text-white/75 sm:text-[10px]">{sub.toLocaleUpperCase("hy-AM")}</p>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20"><div className="h-full w-1/3 rounded-full bg-white/80" /></div>
      </div>
    </div>
  );
}

function TileBody({ cover, title, sub }: { cover?: string; title: string; sub: string }) {
  return (
    <>
      <div className="cover-frame relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-muted sm:aspect-[3/4]" data-original-cover={cover}>
        <SubjectCover title={title} sub={sub} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.7em] break-words text-sm font-bold leading-snug sm:text-base">{title}</h3>
        <p className="line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">{sub}</p>
      </div>
    </>
  );
}

function SubjectRow({ title, children, beta = false }: { title: string; children: React.ReactNode; beta?: boolean }) {
  return (
    <div className="space-y-4">
      <h3 className="flex flex-wrap items-center gap-2 text-lg font-black">{title}{beta && <span className="rounded-md border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black tracking-[0.12em] text-amber-700 dark:text-amber-300">BETA</span>}</h3>
      <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 lg:gap-5 [&>*:first-child]:sm:col-span-2 [&>*:first-child]:lg:col-span-1">{children}</div>
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

function SubjectHeader({ title, sub, beta = false }: { title: string; sub: string; beta?: boolean }) {
  const tx = useTx();
  return (
    <div className="space-y-3">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
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
      <SubjectHeader title={tx("Անգլերեն")} sub={tx("Շտեմարաններ, պաշտոնական քննություններ և թեստերի կազմիչ")} />
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Շտեմարաններ")}</h2>
        <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4">
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
            to="/exam/$subject" params={{ subject: "english" }}
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
          <ExamTile to="/math" search={{ mode: "exam" }} title={tx("Քննություն")} sub={tx("65 հարց՝ երկու շտեմարաններից")} icon={<Trophy className="size-5" />} />
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
          <ExamTile to="/history" title={tx("Քննություն")} sub={tx("Քո ընտրած հարցերը, ժամանակը և ռեժիմը")} icon={<Trophy className="size-5" />} />
        </div>
      </section>
    </div>
  );
}

function BiologySubject() {
  const tx = useTx();
  const playable = BIO_BOOKS.filter((b) => !b.locked);
  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      <SubjectHeader title={tx("Կենսաբանություն")} sub={tx("Հարցաշարեր, ինքնաստուգում և փորձնական թեստեր")} beta />
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Հասանելի շտեմարաններ")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {playable.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-xl font-black sm:text-2xl">{tx("Փորձնական թեստեր")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExamTile to="/biology" title={tx("Կենսաբանություն · Անհատական թեստ")} sub={tx("Ընտրիր երկու գրքից, բաժիններից, քանակից և ժամանակից")} icon={<Dna className="size-5" />} />
          <ExamTile to="/biology" title={tx("Կենսաբանություն · Փորձնական քննություն")} sub={tx("80 առաջադրանքի ընտրություն՝ շտեմարանի հարցերից")} icon={<Trophy className="size-5" />} />
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
      <p className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">{tx("Նշում․ այս պահին հասանելի են առաջին երկու մասերի տվյալները։ Մյուս մասերը կավելացվեն միայն հարցերն ու պատասխանները ստուգելուց հետո։")}</p>
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
  const tx=useTx();
  const {subject}=Route.useSearch();
  if(subject==="english")return <EnglishSubject/>;
  if(subject==="math")return <MathSubject/>;
  if(subject==="history")return <HistorySubject/>;
  if(subject==="biology")return <BiologySubject/>;
  if(subject==="armenian")return <ArmenianSubject/>;

  const card="group flex min-h-28 items-center gap-4 rounded-3xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-primary";
  const iconClass="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary";
  return <main className="mx-auto max-w-7xl space-y-8 py-3 pb-16 sm:space-y-10 sm:py-6">
    <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-800 p-6 text-white sm:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full border-[24px] border-white/5"/>
      <div className="relative max-w-3xl space-y-4">
        <p className="text-xs font-black tracking-wide text-blue-200">SHTEMARM · STUDY SMARTER</p>
        <h1 className="text-3xl font-black leading-snug sm:text-5xl">{tx("Սովորիր, փորձիր, առաջադիմիր")}</h1>
        <p className="max-w-2xl leading-relaxed text-blue-100">{tx("Ընտրիր առարկան, սովորիր թեմաներով և ստուգիր գիտելիքներդ՝ առանց ավելորդ քայլերի։")}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link to="/thematic" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-slate-900">
            <ClipboardCheck className="size-4"/>{tx("Կազմել թեմատիկ աշխատանք")}
          </Link>
          <Link to="/mini-games" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 font-bold text-white">
            <Brain className="size-4"/>{tx("Ուսումնական խաղեր")}
          </Link>
        </div>
      </div>
    </section>
    <section className="space-y-4" aria-label={tx("Առարկաներ")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-black">{tx("Ընտրիր առարկան")}</h2>
        <p className="text-sm text-muted-foreground">{tx("Գրքերը, թեմաներն ու թեստերը՝ ըստ առարկաների")}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/" search={{subject:"english"}} className={card}><span className={iconClass}><BookOpen className="size-6"/></span><span className="font-bold">{tx("Անգլերեն")}</span></Link>
        <Link to="/" search={{subject:"math"}} className={card}><span className={iconClass}><Calculator className="size-6"/></span><span className="font-bold">{tx("Մաթեմատիկա")}</span></Link>
        <Link to="/" search={{subject:"history"}} className={card}><span className={iconClass}><BookOpen className="size-6"/></span><span className="font-bold">{tx("Հայոց պատմություն")}</span></Link>
        <Link to="/" search={{subject:"armenian"}} className={card}><span className={iconClass}><BookOpen className="size-6"/></span><span className="font-bold">{tx("Հայոց լեզու և հայ գրականություն")}</span></Link>
        <Link to="/" search={{subject:"biology"}} className={card}><span className={iconClass}><Dna className="size-6"/></span><span className="font-bold">{tx("Կենսաբանություն")}</span></Link>
        {STARTER_SUBJECT_BOOKS.map(b=><Link key={b.id} to="/subject/$subject"
          params={{subject:({51:"physics",52:"chemistry",53:"geography",54:"russian"} as Record<number,string>)[b.id]!}}
          className={card}>
          <span className={iconClass}><BookOpen className="size-6"/></span>
          <span className="min-w-0"><strong className="block">{tx(b.title)}</strong>
            <span className="mt-1 block text-xs text-muted-foreground">{tx("Ուսումնական հարցաշար")}</span></span>
        </Link>)}
      </div>
    </section>
    <section className="space-y-4" aria-label={tx("Ուսումնական գործիքներ")}>
      <h2 className="text-2xl font-black">{tx("Սովորելու և ստուգելու գործիքներ")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/thematic" className={card}><span className={iconClass}><ClipboardCheck className="size-6"/></span><span className="font-bold">{tx("Թեմատիկ և ամփոփիչ աշխատանքներ")}</span></Link>
        <Link to="/level-test/$level" params={{level:"placement"}} className={card}><span className={iconClass}><GraduationCap className="size-6"/></span><span className="font-bold">{tx("Անգլերենի մակարդակի ստուգում")}</span></Link>
        <Link to="/mini-games" className={card}><span className={iconClass}><Brain className="size-6"/></span><span className="font-bold">{tx("Ուսումնական խաղեր")}</span></Link>
        <Link to="/study-tools" className={card}><span className={iconClass}><Sparkles className="size-6"/></span><span className="font-bold">{tx("Կենտրոնացում և առաջընթաց")}</span></Link>
        <Link to="/flashcards" className={card}><span className={iconClass}><BookOpen className="size-6"/></span><span className="font-bold">{tx("Հիշողության քարտեր")}</span></Link>
      </div>
    </section>
    <section className="space-y-4" aria-label={tx("Քննություն")}>
      <h2 className="text-2xl font-black">{tx("Փորձնական քննություններ")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ExamTile to="/exam/$subject" params={{subject:"english"}} title={tx("Անգլերեն")} sub={tx("Շտեմարանային քննություն")} icon={<BookOpen className="size-5"/>}/>
        <ExamTile to="/math" title={tx("Մաթեմատիկա")} sub={tx("65 հարցանոց փորձնական թեստ")} icon={<Calculator className="size-5"/>}/>
        <ExamTile to="/history" title={tx("Հայոց պատմություն")} sub={tx("Ընտրովի քննություն")} icon={<Trophy className="size-5"/>}/>
        <ExamTile to="/biology" title={tx("Կենսաբանություն")} sub={tx("Քննություն և թեմատիկ հարցեր")} icon={<Dna className="size-5"/>}/>
      </div>
    </section>
    <p className="border-t pt-4 text-center text-sm text-muted-foreground">
      {tx("Սխա՞լ ես նկատել կամ առաջարկ ունես։")} <Link to="/feedback" className="font-bold text-primary underline underline-offset-2">{tx("Գրիր մեզ")}</Link>
    </p>
  </main>;
}
