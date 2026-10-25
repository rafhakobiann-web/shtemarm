import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck, Trophy, Brain, BookOpen, Calculator, CheckCircle2, RotateCcw, MessageCircle, GraduationCap, Sparkles, Dna } from "lucide-react";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTx } from "@/lib/lang";
import { ARMENIAN_BOOKS, BIO_BOOKS, BOOKS, HISTORY_BOOKS } from "@/lib/books";
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
  "glass group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

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
      <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{children}</div>
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
      <SubjectHeader title={tx("Մաթեմատիկա")} sub={tx("Շտեմարաններ, պաշտոնական քննություն և թեստերի կազմիչ")} beta />
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
          {playable.map((b) => (
            <ExamTile key={b.id} to="/test/$bookId" params={{ bookId: String(b.id) }} search={{ mode: "custom", style: "classic" }} title={tx("{part} · Թեստ", { part: b.sub })} sub={tx("Կազմիր թեստ տվյալ շտեմարանի հարցերից")} icon={<Dna className="size-5" />} />
          ))}
          <ExamTile to="/test/$bookId" params={{ bookId: "31" }} search={{ mode: "exam", style: "classic" }} title={tx("Կենսաբանություն · Քննություն")} sub={tx("Փորձնական քննություն հասանելի հարցաշարից")} icon={<Trophy className="size-5" />} />
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
          <ExamTile to="/test/$bookId" params={{ bookId: "41" }} search={{ mode: "exam", style: "classic" }} title={tx("Փորձնական քննություն")} sub={tx("Խառը հարցեր բոլոր 8 բաժիններից")} icon={<Trophy className="size-5" />} />
          <ExamTile to="/test/$bookId" params={{ bookId: "41" }} search={{ mode: "custom", style: "classic" }} title={tx("Կազմել սեփական թեստ")} sub={tx("Ընտրիր բաժինը և վարժվիր ըստ թեմայի")} icon={<ClipboardCheck className="size-5" />} />
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
    supabase.auth.getUser().then(({ data }) => setName((data.user?.user_metadata?.username as string | undefined) ?? null));
  }, []);
  if (subject === "english") return <EnglishSubject />;
  if (subject === "math") return <MathSubject />;
  if (subject === "history") return <HistorySubject />;
  if (subject === "biology") return <BiologySubject />;
  if (subject === "armenian") return <ArmenianSubject />;

  return (
    <div className="mx-auto max-w-6xl space-y-10 py-4 sm:py-6">
      <section className="relative isolate overflow-hidden rounded-[2rem] border bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-800 px-5 py-7 text-white shadow-xl sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-16 -top-20 -z-10 size-64 rounded-full border-[24px] border-white/5" />
        <div aria-hidden="true" className="absolute -bottom-24 right-1/4 -z-10 size-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="max-w-2xl space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-cyan-100"><Sparkles className="size-4" /> SHTEMARM · STUDY SMARTER</p>
          <h1 className="text-3xl font-black leading-tight sm:text-5xl">{tx("Քո հաջորդ քայլը՝ դեպի քննության հաջողություն")}</h1>
          <p className="max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">{tx("Գտիր ճիշտ շտեմարանը, սովորիր թեմաներով, անցիր փորձնական քննություններ և հետևիր առաջընթացիդ՝ մեկ հարմար վայրում։")}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link to="/" search={{ subject: "english" }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5"><BookOpen className="size-4" />{tx("Սկսել սովորել")}</Link>
            <Link to="/mini-games" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"><Brain className="size-4" />{tx("Մինի խաղեր")}</Link>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-3 gap-2 border-t border-white/15 pt-4 sm:absolute sm:bottom-8 sm:right-8 sm:mt-0 sm:w-56 sm:border-l sm:border-t-0 sm:pl-5">
          <div><p className="text-xl font-black sm:text-2xl">5</p><p className="text-[10px] leading-tight text-blue-100 sm:text-xs">{tx("Առարկա")}</p></div>
          <div><p className="text-xl font-black sm:text-2xl">2</p><p className="text-[10px] leading-tight text-blue-100 sm:text-xs">{tx("Մաթ. գիրք")}</p></div>
          <div><p className="text-xl font-black sm:text-2xl">24/7</p><p className="text-[10px] leading-tight text-blue-100 sm:text-xs">{tx("Մուտք")}</p></div>
        </div>
      </section>
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
          {(() => {
            const values = Object.values(progress.answers);
            const right = values.filter((v) => v === 1).length;
            const wrong = values.filter((v) => v === 0).length;
            const answered = values.length;
            const accuracy = answered ? Math.round((right / answered) * 100) : 0;
            return (
              <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6" aria-label={tx("Առաջընթացի վերլուծություն")}>
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
          <p className="text-sm text-muted-foreground">{tx("Սովորիր քայլ առ քայլ, ստուգիր գիտելիքներդ թեստերով կամ լուծիր խնդիրներ հաշվիչով։")}</p>
        </div>

        <SubjectRow title={tx("Անգլերեն")}>
          {BOOKS.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}>
              <TileBody cover={b.cover} title={b.title} sub={b.sub} />
            </Link>
          ))}
        </SubjectRow>

        <SubjectRow title={tx("Մաթեմատիկա")} beta>
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
          <Link to="/" search={{ subject: "armenian" }} className={TILE}><TileBody title={tx("Հայոց լեզու · Թեստեր")} sub={tx("Հարցաշար և պաշտոնական նմուշներ")} /></Link>
          {ARMENIAN_BOOKS.map((b) => <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={TILE}><TileBody cover={b.cover} title={b.title} sub={b.sub} /></Link>)}
        </SubjectRow>
        <SubjectRow title={tx("Կենսաբանություն")} beta>
          <Link to="/" search={{ subject: "biology" }} className={TILE}><div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-500/15 via-muted to-primary/10 p-4 text-center text-primary sm:aspect-[3/4]"><Dna className="size-12" /><span className="font-black">{tx("Բոլոր կենսաբանության թեստերը")}</span></div><div className="p-4"><p className="text-xs text-muted-foreground">{tx("Հարցաշարեր և քննություն")}</p></div></Link>
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
        <h2 className="text-xl font-black sm:text-2xl">{tx("Կենսաբանություն · Թեստեր")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExamTile to="/test/$bookId" params={{ bookId: "31" }} search={{ mode: "custom", style: "classic" }} title={tx("Կենսաբանություն · Մաս 1")} sub={tx("Կազմիր թեստ առաջին գրքի հարցերից")} icon={<Dna className="size-5" />} />
          <ExamTile to="/test/$bookId" params={{ bookId: "32" }} search={{ mode: "custom", style: "classic" }} title={tx("Կենսաբանություն · Մաս 2")} sub={tx("Կազմիր թեստ երկրորդ գրքի հարցերից")} icon={<Dna className="size-5" />} />
        </div>
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
          <ExamTile to="/test/$bookId" params={{ bookId: "41" }} search={{ mode: "exam", style: "classic" }} title={tx("Հայոց լեզու և գրականություն")} sub={tx("64 հարց՝ 4 թեմատիկ բաժնից")} icon={<BookOpen className="size-5" />} />
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
