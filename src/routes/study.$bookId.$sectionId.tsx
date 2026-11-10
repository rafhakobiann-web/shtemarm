import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Heart, Zap, Loader2, RotateCcw, Trophy } from "lucide-react";
import { z } from "zod";
import { useBook } from "@/lib/useBook";
import { ALL_BOOKS, questionAnswerKey, questionForAnswerKey, secTitle, type Unit } from "@/lib/books";
import { recordAnswer, useProgress, update } from "@/lib/progress";
import { UnitCard, scoreUnit, normNum, isAnswered, type UnitAnswer } from "@/components/UnitCard";
import { StudyTutorDrawer } from "@/components/StudyTutorDrawer";
import { StudyScratchpad } from "@/components/StudyScratchpad";
import { Button } from "@/components/ui/button";
import { LoadError } from "@/components/LoadError";
import { cn } from "@/lib/utils";
import { useLang, useTx } from "@/lib/lang";
import { recordUnitMistakes, subjectForBookId } from "@/lib/unitMistakes";
import { useSignedIn } from "@/lib/guest-trial";
import { guestPreviewUnits } from "@/lib/guest-preview";

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
  // Show only two complete source tasks to guests, including whole English texts.
  // Signed-in students retain the original units and all progress identities.
  const signedIn = useSignedIn();
  const previewUnits = section ? guestPreviewUnits(section.units, signedIn === true) : [];
  const showGuestSignup = signedIn !== true && !!section && section.units.length > previewUnits.length;

  useEffect(() => {
    update((p) => (p.mode === mode ? p : { ...p, mode }));
  }, [mode]);

  return (
    <div className="sht-study-workspace mx-auto max-w-3xl space-y-6 lg:max-w-6xl">
      <header className="sht-study-heading">
      <div className="sht-study-toolbar grid min-w-0 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Link to="/book/$bookId" params={{ bookId }} className="sht-study-breadcrumb inline-flex min-w-0 items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4 shrink-0" /> <span className="truncate">{section ? tx("Շտեմարան {book} · {title}", { book: bookId, title: secTitle(section) }) : tx("Շտեմարան {book} · Բաժին {n}", { book: bookId, n: sectionId })}</span>
        </Link>
        <nav aria-label={lang === "en" ? "Practice mode" : lang === "ru" ? "Режим занятий" : "Պարապմունքի ձև"} className="sht-study-mode-switch grid grid-cols-2 rounded-xl bg-muted p-1 text-center text-sm font-semibold">
          {(["game", "classic"] as const).map((m) => (
            <Link
              key={m}
              to="/study/$bookId/$sectionId"
              params={{ bookId, sectionId }}
              search={{ mode: m }}
              aria-current={mode === m ? "page" : undefined}
              className={cn("flex min-h-11 items-center justify-center rounded-lg px-3 py-2", mode === m ? "bg-card shadow-sm" : "text-muted-foreground")}
            >
              {m === "game" ? tx("Խաղային") : tx("Դասական")}
            </Link>
          ))}
        </nav>
      </div>
      <div className="sht-study-title">
        <p className="sht-study-eyebrow">{lang === "en" ? "Your learning space" : lang === "ru" ? "Место для занятий" : "Քո ուսումնական միջավայրը"}</p>
      <h1 className="text-balance text-2xl font-black tracking-tight sm:text-3xl">
        {section ? tx("Շտեմարան {book} · {title}", { book: bookId, title: secTitle(section) }) : tx("Շտեմարան {book} · Բաժին {n}", { book: bookId, n: sectionId })}
      </h1>
        <p className="sht-study-subtitle">{lang === "en" ? "Practice at your own pace. Check answers and learn from every mistake." : lang === "ru" ? "Решай в своём темпе, проверяй ответы и учись на ошибках." : "Պարապիր քեզ հարմար տեմպով, ստուգիր պատասխաններդ և սովորիր սխալներից։"}</p>
      </div>
      </header>
      {[1, 2, 3].includes(Number(bookId)) && <Link to="/english-grammar"
        search={{book:Number(bookId),section:Number(sectionId),topic:undefined}}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
        {lang==="en"?"Learn rules for this section":lang==="ru"?"Правила этого раздела":"Սովորել այս բաժնի կանոնները"}
      </Link>}
      {section && previewUnits.length > 0 && <StudyScratchpad bookId={bookId} sectionId={sectionId} />}
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
        <Game key={`study-game:${bookId}:${sectionId}`} units={previewUnits} instr={section.instr_hy} instrEn={section.instr_en} bookId={bookId} />
      ) : (
        <Classic key={`study-classic:${bookId}:${sectionId}`} units={previewUnits} instr={section.instr_hy} instrEn={section.instr_en} bookId={bookId} />
      )}
      {showGuestSignup && <GuestSignupPrompt bookId={bookId} sectionId={sectionId} />}
      {signedIn === true && section && section.units.length > 0 && <StudyTutorDrawer key={`study-tutor:${bookId}:${sectionId}`} />}
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
    if (checkedRef.current.has(id) || revealed[id] || !isAnswered(u, answers[u.id], perQuestion(u) ? key : undefined)) return;
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

const GUEST_PROMPT = {
  hy: { title: "Ամբողջ բաժինը բացելու համար մուտք գործիր", body: "Առանց հաշվի կարող ես փորձել յուրաքանչյուր բաժնի առաջին 2 առաջադրանքը (անգլերենում՝ 2 տեքստ)։ Մուտք գործիր՝ մյուսներն ու ուսուցչի գործիքները բացելու համար։", action: "Մուտք գործել" },
  en: { title: "Sign in for the full section", body: "Try the first 2 tasks in every section (2 texts in English reading sections) without an account. Sign in to unlock the rest and tutor tools.", action: "Sign in" },
  ru: { title: "Войди, чтобы открыть весь раздел", body: "Без аккаунта доступны первые 2 задания в каждом разделе (2 текста в разделах чтения английского). Войди, чтобы открыть остальные задания.", action: "Войти" },
};

/** Shown below the two accessible guest source tasks. */
function GuestSignupPrompt({ bookId, sectionId }: { bookId: string; sectionId: string }) {
  const lang = useLang();
  const t = lang === "en" ? GUEST_PROMPT.en : lang === "ru" ? GUEST_PROMPT.ru : GUEST_PROMPT.hy;
  return (
    <section aria-labelledby="guest-signup-title" className="space-y-3 rounded-2xl border border-primary/25 bg-primary/5 p-5">
      <h2 id="guest-signup-title" className="text-lg font-black">{t.title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{t.body}</p>
      <Button asChild className="min-h-11">
        <Link to="/auth" search={{ next: `/study/${bookId}/${sectionId}` }}>{t.action}</Link>
      </Button>
    </section>
  );
}

/* ---------------- Classic ---------------- */
function Classic({ units, instr, instrEn, bookId }: { units: Unit[]; instr: string; instrEn: string; bookId: string }) {
  const tx = useTx();
  const lang = useLang();
  const { answers, setAnswers, revealed, check } = useRevealer(subjectForBookId(bookId));
  // A fixed window keeps hundreds of source units off the main thread.
  // Answers and checked status live above the window and survive page changes.
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const pageCount = Math.ceil(units.length / PAGE_SIZE);
  const visibleUnits = units.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const words = lang === "en" ? { previous: "Previous", next: "Next", page: "Page", checked: "Checked", help: "Your answers stay here when you change pages." }
    : lang === "ru" ? { previous: "Назад", next: "Далее", page: "Страница", checked: "Проверено", help: "При переходе между страницами ответы сохраняются в этом занятии." }
    : { previous: "Նախորդը", next: "Հաջորդը", page: "Էջ", checked: "Ստուգված", help: "Էջերը փոխելիս պատասխաններդ պահպանվում են այս պարապմունքում։" };
  const total = units.reduce((count, u) => count + (perQuestion(u) ? (u as Extract<Unit, {kind: "mc" | "num"}>).questions.length : 1), 0);
  const checked = Object.values(revealed).filter(Boolean).length;
  const go = (next: number) => {
    setPage(Math.max(0, Math.min(pageCount - 1, next)));
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "start", behavior: "auto" });
    });
  };
  const pager = <div className="study-pager flex flex-wrap items-center justify-between gap-3">
    <Button type="button" variant="outline" disabled={page === 0} onClick={() => go(page - 1)} className="min-h-11">← {words.previous}</Button>
    <label className="flex items-center gap-2 text-sm font-semibold">{words.page}
      <select value={page} onChange={e => go(Number(e.target.value))} className="min-h-11 max-w-32 rounded-xl border bg-background px-3 text-base">
        {Array.from({ length: pageCount }, (_, index) => <option key={index} value={index}>{index + 1} / {pageCount}</option>)}
      </select>
    </label>
    <Button type="button" variant="outline" disabled={page + 1 >= pageCount} onClick={() => go(page + 1)} className="min-h-11">{words.next} →</Button>
  </div>;
  return (
    <div className="space-y-5">
      <section className="sht-study-progress-panel space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
        <h2 ref={heading} tabIndex={-1} className="study-section-heading text-sm font-bold">
          {tx("Առաջադրանքներ")} · {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, units.length)} / {units.length}
        </h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <progress value={checked} max={Math.max(total, 1)} aria-label={words.checked} className="h-2 min-w-0 flex-1 accent-primary" />
          <span role="status">{words.checked}: {checked} / {total}</span>
        </div>
        <p className="text-xs text-muted-foreground">{tx("Գրքի հերթականությամբ")} · {words.help}</p>
        {pageCount > 1 && pager}
      </section>
      {visibleUnits.map((u) => (
        <div key={u.id} className="space-y-2">
          <PhysicsSourceJump unit={u}/>
          <UnitCard unit={u} instruction={instr} instructionEn={instrEn}
            value={answers[u.id]} onChange={(v) => setAnswers((s) => ({ ...s, [u.id]: v }))}
            revealed={(k) => !!revealed[qKey(u, k)]} onCheck={(k) => check(u, k)}
            header={<h2 className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">{/^\d+$/.test(u.label) ? tx("Առաջադրանք {n}", { n: u.label }) : u.label}</h2>}
          />
        </div>
      ))}
      {pageCount > 1 && pager}
    </div>
  );
}

/* ---------------- Game ---------------- */
function Game({ units, instr, instrEn, bookId }: { units: Unit[]; instr: string; instrEn: string; bookId: string }) {
  const tx = useTx();
  const progress = useProgress();
  const lang = useLang();
  const unitRegion = useRef<HTMLDivElement>(null);
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
    <div className="sht-study-round space-y-4">
      <p role="status" className="sht-study-round-label text-sm font-semibold text-muted-foreground">
        {tx("Առաջադրանքներ")} · {idx + 1} / {round.length}
      </p>
      <div className="sht-study-round-progress grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <div role="img" aria-label={`${hearts} / 3 ${lang === "en" ? "lives" : lang === "ru" ? "жизни" : "կյանք"}`} className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <Heart aria-hidden="true" key={i} className={cn("size-5", i < hearts ? "fill-destructive text-destructive" : "text-muted-foreground/40")} />
          ))}
        </div>
        <div role="progressbar" aria-label={tx("Առաջադրանքներ")} aria-valuemin={0} aria-valuemax={round.length} aria-valuenow={idx} className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(idx / round.length) * 100}%` }} />
        </div>
        <span className={cn("flex items-center gap-1 font-display text-sm font-bold", combo >= 2 ? "text-sun" : "text-muted-foreground")}>
          <Zap className="size-4" /> ×{combo}
        </span>
      </div>
      <div ref={unitRegion} tabIndex={-1} className="study-active-unit">
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
      </div>
      {allRevealed && (
        <div className="study-action-bar sticky z-20 flex justify-end">
          <Button variant="game" size="lg" onClick={() => {
            setIdx(idx + 1);
            requestAnimationFrame(() => {
              unitRegion.current?.focus({ preventScroll: true });
              unitRegion.current?.scrollIntoView({ block: "start", behavior: "auto" });
            });
          }}>
            {tx("Շարունակել →")}
          </Button>
        </div>
      )}
    </div>
  );
}

