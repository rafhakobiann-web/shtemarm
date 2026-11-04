import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Heart, Zap, Loader2, RotateCcw, Trophy } from "lucide-react";
import { z } from "zod";
import { useBook } from "@/lib/useBook";
import { ALL_BOOKS, questionAnswerKey, questionForAnswerKey, secTitle, type Unit } from "@/lib/books";
import { recordAnswer, useProgress, update } from "@/lib/progress";
import { UnitCard, scoreUnit, normNum, type UnitAnswer } from "@/components/UnitCard";
import { Button } from "@/components/ui/button";
import { LoadError } from "@/components/LoadError";
import { cn } from "@/lib/utils";
import { useLang, useTx } from "@/lib/lang";
import { recordUnitMistakes, subjectForBookId } from "@/lib/unitMistakes";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
import { saveStudyResume } from "@/lib/study-resume";

export const Route = createFileRoute("/study/$bookId/$sectionId")({
  staticData: { sitemap: false },
  beforeLoad: ({ params }) => {
    // Reject malformed deep links before requesting a nonexistent /data/*.json.
    if (!ALL_BOOKS.some(book => String(book.id) === params.bookId) ||
        !/^[1-9][0-9]*$/.test(params.sectionId) ||
        !Number.isSafeInteger(Number(params.sectionId))) throw notFound();
  },
  validateSearch: z.object({ mode: z.enum(["game", "classic"]).catch("game") }),
  head: ({ params }) => ({
    meta: [
      { title: `Շտեմարան ${params.bookId} · Բաժին ${params.sectionId} · Ուսուցում` },
      { name: "description", content: `Բաժին ${params.sectionId}-ի առաջադրանքները՝ բացատրություններով։` },
      { property: "og:title", content: `Բաժին ${params.sectionId} · Ուսուցում` },
      { property: "og:description", content: "Խաղային կամ դասական ուսուցում։" },
    ],
  }),
  component: StudyPage,
});

function StudyPage() {
  const tx = useTx();
  const lang = useLang();
  const { bookId, sectionId } = Route.useParams();
  const { mode } = Route.useSearch();
  const { data: book, error, isPending, isFetching, refetch } = useBook(Number(bookId));
  const section = book?.sections.find((s) => s.n === Number(sectionId));

  useEffect(() => {
    update((p) => (p.mode === mode ? p : { ...p, mode }));
  }, [mode]);

  // Only remember verified signed-in visitors. Do not capture answers,
  // question text or any data from other accounts on a shared device.
  useEffect(() => {
    if (!hasSupabaseConfig() || !section) return;
    let active = true;
    void supabase.auth.getUser().then(({data,error}) => {
      if (!active || error || !data.user?.id) return;
      saveStudyResume(data.user.id,{
        bookId:Number(bookId),sectionId:Number(sectionId),
        mode,visitedAt:Date.now(),
      });
    }).catch(()=>{ /* Resume is optional; never block a study session. */ });
    return () => {active=false;};
  }, [bookId,sectionId,mode,!!section]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 lg:max-w-6xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Link to="/book/$bookId" params={{ bookId }} className="inline-flex min-w-0 items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4 shrink-0" /> <span className="truncate">{section ? tx("Շտեմարան {book} · {title}", { book: bookId, title: secTitle(section) }) : tx("Շտեմարան {book} · Բաժին {n}", { book: bookId, n: sectionId })}</span>
        </Link>
        <div className="flex rounded-xl bg-muted p-1 text-sm font-semibold">
          {(["game", "classic"] as const).map((m) => (
            <Link
              key={m}
              to="/study/$bookId/$sectionId"
              params={{ bookId, sectionId }}
              search={{ mode: m }}
              className={cn("rounded-lg px-3 py-1.5", mode === m ? "bg-card shadow-sm" : "text-muted-foreground")}
            >
              {m === "game" ? tx("Խաղային") : tx("Դասական")}
            </Link>
          ))}
        </div>
      </div>
      <h1 className="text-balance text-2xl font-black tracking-tight sm:text-3xl">
        {section ? tx("Շտեմարան {book} · {title}", { book: bookId, title: secTitle(section) }) : tx("Շտեմարան {book} · Բաժին {n}", { book: bookId, n: sectionId })}
      </h1>
      {[1, 2, 3].includes(Number(bookId)) && <Link to="/english-grammar"
        search={{book:Number(bookId),section:Number(sectionId),topic:undefined}}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
        {lang==="en"?"Learn rules for this section":lang==="ru"?"Правила этого раздела":"Սովորել այս բաժնի կանոնները"}
      </Link>}
      {error && !book ? (
        <LoadError onRetry={() => void refetch()} retrying={isFetching} detail={error instanceof Error ? error.message : String(error)} />
      ) : isPending && !book ? (
        <div role="status" className="grid place-items-center gap-3 py-20">
          <Loader2 className="animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{tx("Բեռնվում է…")}</span>
        </div>
      ) : !section ? (
        <div role="alert" className="space-y-4 rounded-2xl border bg-card p-8 text-center">
          <h2 className="font-bold">{tx("Այս բաժինը չի գտնվել։")}</h2>
          <p className="text-sm text-muted-foreground">{tx("Ընտրիր գոյություն ունեցող բաժին գրքի ցանկից։")}</p>
          <Button asChild variant="outline"><Link to="/book/$bookId" params={{bookId}}>{tx("Վերադառնալ բաժիններին")}</Link></Button>
        </div>
      ) : section.units.length === 0 ? (
        <div role="status" className="space-y-3 rounded-2xl border bg-card p-8 text-center">
          <p className="font-semibold">{tx("Այս բաժնում առաջադրանքներ դեռ չկան։")}</p>
          <Button asChild variant="outline"><Link to="/book/$bookId" params={{bookId}}>{tx("Վերադառնալ բաժիններին")}</Link></Button>
        </div>
      ) : mode === "game" ? (
        <Game key={`${bookId}-${sectionId}`} units={section.units} instr={section.instr_hy} instrEn={section.instr_en} bookId={bookId} />
      ) : (
        <Classic key={`${bookId}-${sectionId}`} units={section.units} instr={section.instr_hy} instrEn={section.instr_en} bookId={bookId} />
      )}
    </div>
  );
}

const perQuestion = (u: Unit) => u.kind === "mc" || u.kind === "num";
const qKey = (u: Unit, k: string) => (perQuestion(u) ? `${u.id}:${k}` : u.id);

function useRevealer(subject: string, onResult?: (correct: boolean) => void) {
  const [answers, setAnswers] = useState<Record<string, UnitAnswer>>({});
  const [revealed, updateRevealed] = useState<Record<string, boolean>>({});
  const checkedRef = useRef<Set<string>>(new Set());
  const setRevealed: typeof updateRevealed = (value) => {
    updateRevealed((previous) => {
      const next = typeof value === "function" ? value(previous) : value;
      checkedRef.current = new Set(Object.keys(next).filter((id) => next[id]));
      return next;
    });
  };
  const check = (u: Unit, key: string) => {
    const id = qKey(u, key);
    // Guard synchronously. React state updates can be batched, so two rapid
    // taps must not record the same question twice before re-render.
    if (checkedRef.current.has(id) || revealed[id]) return;
    checkedRef.current.add(id);
    updateRevealed((r) => ({ ...r, [id]: true }));
    const a = answers[u.id];
    let ok: boolean;
    if (u.kind === "mc") ok = a?.mc?.[key] === questionForAnswerKey(u, key)?.answer;
    else if (u.kind === "num") ok = normNum(a?.mc?.[key]) === normNum(questionForAnswerKey(u, key)?.answer);
    else ok = scoreUnit(u, a).got === 1;
    recordAnswer(id, ok);
    if (a) {
      const attempted: UnitAnswer = perQuestion(u) ? {mc: {[key]: a.mc?.[key] ?? ""}} : a;
      recordUnitMistakes(subject, [u], {[u.id]: attempted});
    }
    onResult?.(ok);
  };
  return { answers, setAnswers, revealed, setRevealed, check };
}

/** Optional source-page link for manually checked original physics questions.
 * The link opens the user's local PDF, not a hosted screenshot or fabricated OCR.
 */
function PhysicsSourceJump({unit}:{unit:Unit}){
  const tx=useTx();
  const annotated=unit as Unit & {sourcePage?:number;sourceBook?:number};
  if(!Number.isInteger(annotated.sourcePage)||
    (annotated.sourceBook!==61&&annotated.sourceBook!==62))return null;
  return <Link to="/physics/books"
    search={{volume:annotated.sourceBook,page:annotated.sourcePage!}}
    className="inline-flex min-h-10 items-center rounded-lg border border-primary/25 bg-primary/5 px-3 text-xs font-semibold text-primary hover:bg-primary/10">
    {tx("Համեմատել բնօրինակ PDF-ի էջ {page}",{page:annotated.sourcePage!})}
  </Link>;
}

/* ---------------- Classic ---------------- */
function Classic({ units, instr, instrEn, bookId }: { units: Unit[]; instr: string; instrEn: string; bookId: string }) {
  const tx = useTx();
  const { answers, setAnswers, revealed, check } = useRevealer(subjectForBookId(bookId));
  // A single History/Biology section can contain hundreds of units. Rendering
  // the entire section on first paint blocks input and makes scrolling laggy.
  // Expand in source order without dropping any tasks or current answers.
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleUnits = units.slice(0, visibleCount);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-card px-4 py-3 text-sm shadow-sm">
        <span className="font-semibold">{tx("Առաջադրանքներ")} · {Math.min(visibleCount, units.length)} / {units.length}</span>
        <span className="text-muted-foreground">{tx("Գրքի հերթականությամբ")}</span>
      </div>
      {visibleUnits.map((u) => (
        <div key={u.id} className="space-y-2">
          <PhysicsSourceJump unit={u}/>
        <UnitCard
          key={u.id}
          unit={u}
          instruction={instr}
          instructionEn={instrEn}
          value={answers[u.id]}
          onChange={(v) => setAnswers((s) => ({ ...s, [u.id]: v }))}
          revealed={(k) => !!revealed[qKey(u, k)]}
          onCheck={(k) => check(u, k)}
          header={<p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">{/^\d+$/.test(u.label) ? tx("Առաջադրանք {n}", { n: u.label }) : u.label}</p>}
        />
        </div>
      ))}
      {visibleCount < units.length && (
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="min-h-12 w-full rounded-2xl"
          onClick={() => setVisibleCount((count) => Math.min(units.length, count + PAGE_SIZE))}
        >
          {tx("Ցույց տալ ևս {n} առաջադրանք", { n: Math.min(PAGE_SIZE, units.length - visibleCount) })}
        </Button>
      )}
    </div>
  );
}

/* ---------------- Game ---------------- */
function Game({ units, instr, instrEn, bookId }: { units: Unit[]; instr: string; instrEn: string; bookId: string }) {
  const tx = useTx();
  const progress = useProgress();
  const ROUND = 6;
  const [seed, setSeed] = useState(0);
  const round = useMemo(() => {
    // unseen first, then mistakes, then the rest
    const score = (u: Unit) => {
      const ids = u.kind === "mc" || u.kind === "num" ? u.questions.map((_, i) => `${u.id}:${questionAnswerKey(u, i)}`) : [u.id];
      if (ids.some((i) => !(i in progress.answers))) return 0;
      if (ids.some((i) => progress.answers[i] === 0)) return 1;
      return 2;
    };
    // book order: continue from the first unit not yet answered correctly
    const start = units.findIndex((u) => score(u) !== 2);
    const from = start === -1 ? (seed * ROUND) % Math.max(1, units.length) : start;
    return units.slice(from, from + ROUND);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, seed]);
  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [earned, setEarned] = useState(0);
  const [right, setRight] = useState(0);
  const [total, setTotal] = useState(0);
  const { answers, setAnswers, revealed, setRevealed, check } = useRevealer(subjectForBookId(bookId), (ok) => {
    setTotal((t) => t + 1);
    if (ok) {
      setRight((r) => r + 1);
      setCombo((c) => c + 1);
      setEarned((e) => e + 10 + Math.min(combo, 5) * 2);
    } else {
      setCombo(0);
      setHearts((h) => h - 1);
    }
  });

  const restart = () => {
    setSeed((s) => s + 1);
    setIdx(0);
    setHearts(3);
    setCombo(0);
    setEarned(0);
    setRight(0);
    setTotal(0);
    setAnswers({});
    setRevealed({});
  };

  const done = hearts <= 0 || idx >= round.length;
  if (done) {
    const win = hearts > 0;
    return (
      <div className="animate-pop shadow-card space-y-5 rounded-3xl border bg-card p-8 text-center">
        <Trophy className={cn("mx-auto size-14", win ? "text-sun" : "text-muted-foreground")} />
        <h2 className="text-2xl font-black">{win ? tx("Փուլն ավարտված է") : tx("Սրտերը վերջացան")}</h2>
        <p className="text-muted-foreground">
          {tx("{right} / {total} ճիշտ · +{earned} միավոր", { right, total, earned })}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="game" size="lg" onClick={restart}><RotateCcw /> {tx("Նոր փուլ")}</Button>
          <Button variant="outline" size="lg" asChild><Link to="/book/$bookId" params={{ bookId }}>{tx("Բաժիններ")}</Link></Button>
        </div>
      </div>
    );
  }

  const u = round[idx];
  if (!u) return null;
  const keys = u.kind === "mc" || u.kind === "num" ? u.questions.map((_, i) => questionAnswerKey(u, i)) : ["unit"];
  const allRevealed = keys.every((k) => revealed[qKey(u, k)]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <Heart key={i} className={cn("size-5", i < hearts ? "fill-destructive text-destructive" : "text-muted-foreground/40")} />
          ))}
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(idx / round.length) * 100}%` }} />
        </div>
        <span className={cn("flex items-center gap-1 font-display text-sm font-bold", combo >= 2 ? "text-sun" : "text-muted-foreground")}>
          <Zap className="size-4" /> ×{combo}
        </span>
      </div>
      <PhysicsSourceJump unit={u}/>
      <UnitCard
        key={u.id}
        unit={u}
        instruction={instr}
        instructionEn={instrEn}
        value={answers[u.id]}
        onChange={(v) => setAnswers((s) => ({ ...s, [u.id]: v }))}
        revealed={(k) => !!revealed[qKey(u, k)]}
        onCheck={(k) => check(u, k)}
      />
      {allRevealed && (
        <div className="sticky bottom-4 z-20 flex justify-end">
          <Button variant="game" size="lg" onClick={() => { setIdx(idx + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            {tx("Շարունակել →")}
          </Button>
        </div>
      )}
    </div>
  );
}
