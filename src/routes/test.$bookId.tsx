import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Timer, Trophy, Shuffle, ListChecks } from "lucide-react";
import { z } from "zod";
import { useBook } from "@/lib/useBook";
import { WorkbookExamWorkspace } from "@/components/WorkbookExamWorkspace";
import { HistoryWorkspace } from "@/components/HistoryWorkspace";
import { BiologyWorkspace } from "@/components/BiologyWorkspace";
import { buildCustom, buildExam, shuffle, unitPoints, type Unit } from "@/lib/books";
import { recordAnswer, update } from "@/lib/progress";
import { UnitCard, scoreUnit, type UnitAnswer } from "@/components/UnitCard";
import { LoadError } from "@/components/LoadError";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLang, useTx } from "@/lib/lang";
import { recordUnitMistakes, subjectForBookId } from "@/lib/unitMistakes";

export const Route = createFileRoute("/test/$bookId")({
  staticData: { sitemap: false },
  validateSearch: z.object({
    mode: z.enum(["exam", "custom"]).catch("custom"),
    section: z.number().int().optional().catch(undefined),
    style: z.enum(["game", "classic"]).catch("classic"),
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${bookName(params.bookId)} · Թեստ և քննություն` },
      { name: "description", content: "Քննություն կամ ձեր ընտրած բաժիններից կազմված թեստ։" },
      { property: "og:title", content: `${bookName(params.bookId)} · Թեստ` },
      { property: "og:description", content: "Ստուգեք ձեր գիտելիքները իրական քննության կառուցվածքով։" },
    ],
  }),
  component: TestPage,
});

type Item = { section: number; unit: Unit };
type Style = "game" | "classic";
const isHistoryId = (id: string) => Number(id) >= 21 && Number(id) <= 23;
const isBiologyId = (id: string) => Number(id) >= 31 && Number(id) <= 34;
const isArmenianId = (id: string) => Number(id) === 41;
const bookName = (id: string) =>
  id === "all" ? "Բոլոր շտեմարանները" : isArmenianId(id) ? "Հայոց լեզու · Փորձնական հարցաշար" : isHistoryId(id) ? `Հայոց պատմություն · Գիրք ${Number(id) - 20}` : isBiologyId(id) ? `Կենսաբանություն · Մաս ${Number(id) - 30}` : `Շտեմարան ${id}`;

type Tx = ReturnType<typeof useTx>;
/** On-screen workbook name (bookName above is only for head(), which cannot use hooks). */
const bookLabel = (tx: Tx, id: string) =>
  id === "all" ? tx("Բոլոր շտեմարանները") : isArmenianId(id) ? tx("Հայոց լեզու · Փորձնական հարցաշար") : isHistoryId(id) ? tx("Հայոց պատմություն · Գիրք {n}", { n: Number(id) - 20 }) : isBiologyId(id) ? tx("Կենսաբանություն · Մաս {n}", { n: Number(id) - 30 }) : tx("Շտեմարան {n}", { n: id });
/** Section name, built the same way as secTitle in lib/books, but translated. */
const sectionName = (tx: Tx, s: { n: number; title?: string; label?: string }) =>
  s.label ?? (s.title ? tx("Բաժին {n}", { n: s.title }) : tx("Բաժին {n}", { n: s.n }));

function TestPage() {
  const tx = useTx();
  const { bookId } = Route.useParams();
  const { mode, section, style: initStyle } = Route.useSearch();
  const { data: book, error, refetch } = useBook(bookId === "all" ? 0 : Number(bookId));
  const [style, setStyle] = useState<Style>(initStyle);
  const [items, setItems] = useState<Item[] | null>(null);
  const [kind, setKind] = useState<"exam" | "custom">(mode);

  const parsedId = Number(bookId);
  if (bookId === "all" || [1, 2, 3, 41].includes(parsedId)) {
    return <WorkbookExamWorkspace
      key={bookId + ":" + (section ?? "") + ":" + mode}
      subject={parsedId === 41 ? "armenian" : "english"}
      initialBook={parsedId >= 1 && parsedId <= 3 ? parsedId : undefined}
      initialSection={section}
      initialMode={mode === "exam" ? "full" : "custom"}
    />;
  }
  if (parsedId >= 21 && parsedId <= 23) return <HistoryWorkspace key={bookId} />;
  if (parsedId >= 31 && parsedId <= 32) return <BiologyWorkspace key={bookId} />;

  if (!book) return error ? <LoadError onRetry={() => refetch()} detail={error instanceof Error ? error.message : String(error)} /> : <div className="grid place-items-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
  if (items) return <Runner book={book} items={items} kind={kind} bookId={bookId} style={style} onExit={() => setItems(null)} />;
  return (
    <Setup
      bookId={bookId}
      sections={book.sections.map((s) => ({ n: s.n, title: sectionName(tx, s), label: s.instr_hy, labelEn: s.instr_en, count: s.units.reduce((a, u) => a + unitPoints(u), 0) }))}
      initial={mode}
      section={section}
      style={style}
      onStyle={setStyle}
      onStart={(k, secs, count) => {
        try {
          const selected = k === "exam" ? buildExam(book, Number(bookId)) : buildCustom(book, secs, count);
          setKind(k);
          setItems(selected);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : tx("Չհաջողվեց կազմել թեստը։"));
        }
      }}
    />
  );
}

function Setup(p: {
  bookId: string;
  sections: { n: number; title: string; label: string; labelEn: string; count: number }[];
  initial: "exam" | "custom";
  section: number | undefined;
  style: Style;
  onStyle: (s: Style) => void;
  onStart: (k: "exam" | "custom", secs: number[], count: number) => void;
}) {
  const tx = useTx();
  const lang = useLang();
  const isHistory = isHistoryId(p.bookId);
  const [tab, setTab] = useState<"exam" | "custom" | "random">(isHistory && p.initial === "exam" ? "custom" : p.initial);
  const [secs, setSecs] = useState<number[]>(p.section ? [p.section] : [1, 2, 3]);
  const [count, setCount] = useState(p.section ? 10 : 20);
  const [randomN, setRandomN] = useState(3);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to={p.bookId === "all" ? "/" : "/book/$bookId"} params={{ bookId: p.bookId }} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {bookLabel(tx, p.bookId)}
      </Link>
      <h1 className="text-2xl font-black sm:text-3xl">{tx("Ընտրիր թեստի տեսակը")}</h1>
      <div className={cn("grid gap-3", isHistory ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
        {([
          ...(isHistory ? [] : [["exam", <Trophy key="t" />, "Քննություն", "80 հարց, իրական կառուցվածք"] as const]),
          ["custom", <ListChecks key="l" />, "Ըստ բաժինների", "Ընտրիր բաժիններն ու քանակը"],
          ["random", <Shuffle key="s" />, "Պատահական բաժիններ", "Համակարգը կընտրի"],
        ] as const).map(([k, icon, t, d]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn("flex flex-col items-start gap-1 rounded-2xl border-2 bg-card p-4 text-left", tab === k ? "border-primary" : "border-border hover:border-primary/40")}
          >
            <span className="text-primary">{icon}</span>
            <span className="font-bold">{tx(t)}</span>
            <span className="text-xs text-muted-foreground">{tx(d)}</span>
          </button>
        ))}
      </div>

      <div className="shadow-card space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
        {tab === "exam" && (
          <div className="space-y-2 text-sm leading-relaxed">
            <p>{tx("Քննությունը կազմված է 80 առաջադրանքից՝ շտեմարանի 13 բաժինների հերթականությամբ, ինչպես միասնական քննության թեստում։")}</p>
            <p className="text-muted-foreground">{tx("Ժամանակը՝ 3 ժամ։ Պատասխաններն ու բացատրությունները կերևան ավարտելուց հետո։")}</p>
          </div>
        )}
        {tab === "custom" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {p.sections.map((s) => (
              <label key={s.n} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 hover:bg-muted/50">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-primary"
                  checked={secs.includes(s.n)}
                  onChange={() => setSecs((x) => (x.includes(s.n) ? x.filter((y) => y !== s.n) : [...x, s.n]))}
                />
                <span className="min-w-0 text-sm">
                  <b>{s.title}</b> <span className="text-muted-foreground">· {s.count}</span>
                  <span className="block text-xs leading-snug text-muted-foreground">{(lang === "en" && s.labelEn) || s.label}</span>
                </span>
              </label>
            ))}
          </div>
        )}
        {tab === "random" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">{tx("Բաժինների քանակը՝ {n}", { n: randomN })}</p>
            <Slider min={1} max={p.sections.length} step={1} value={[randomN]} onValueChange={(v) => setRandomN(v[0] ?? 3)} />
          </div>
        )}
        {tab !== "exam" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">{tx("Հարցերի քանակը՝ {n}", { n: count })}</p>
            <Slider min={5} max={120} step={5} value={[count]} onValueChange={(v) => setCount(v[0] ?? 20)} />
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm font-semibold">{tx("Ռեժիմ")}</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["game", "🎮", "Խաղային", "Մեկ առ մեկ, միավորներով"],
              ["classic", "📄", "Դասական", "Բոլորը միասին, ինչպես քննությունում"],
            ] as const).map(([k, icon, t, d]) => (
              <button
                key={k}
                type="button"
                onClick={() => p.onStyle(k)}
                className={cn("rounded-xl border-2 p-3 text-left", p.style === k ? "border-primary bg-secondary" : "border-border hover:border-primary/40")}
              >
                <span className="block font-bold">{icon} {tx(t)}</span>
                <span className="text-xs text-muted-foreground">{tx(d)}</span>
              </button>
            ))}
          </div>
        </div>
        <Button
          variant="game"
          size="lg"
          className="w-full"
          disabled={tab === "custom" && secs.length === 0}
          onClick={() => {
            if (tab === "exam") p.onStart("exam", [], 80);
            else if (tab === "custom") p.onStart("custom", secs, count);
            else p.onStart("custom", shuffle(p.sections.map((s) => s.n)).slice(0, randomN), count);
          }}
        >
          {tx("Սկսել")}
        </Button>
      </div>
    </div>
  );
}

function Runner({ book, items, kind, bookId, style, onExit }: { book: { id: number; sections: { n: number; title?: string; instr_hy: string; instr_en: string }[] }; items: Item[]; kind: "exam" | "custom"; bookId: string; style: Style; onExit: () => void }) {
  const tx = useTx();
  const [cur, setCur] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [combo, setCombo] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UnitAnswer>>({});
  const [finished, setFinished] = useState(false);
  const [secs, setSecs] = useState(0);
  const limit = kind === "exam" ? 180 * 60 : 0;
  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [finished]);
  const total = useMemo(() => items.reduce((a, it) => a + unitPoints(it.unit), 0), [items]);
  const score = items.reduce((a, it) => a + scoreUnit(it.unit, answers[it.unit.id]).got, 0);

  const finish = () => {
    if (finished) return;
    setFinished(true);
    recordUnitMistakes(subjectForBookId(bookId), items.map(item => item.unit), answers);
    items.forEach(({ unit: u }) => {
      const r = scoreUnit(u, answers[u.id]);
      if (u.kind === "mc") u.questions.forEach((q, i) => recordAnswer(`${u.id}:${q.n}`, !!r.per[i], 5));
      else recordAnswer(u.id, !!r.per[0], 5);
    });
    update((p) => ({ ...p, exams: [...p.exams, { date: new Date().toISOString(), book: book.id, score, total }].slice(-50) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    if (limit && secs >= limit && !finished) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs]);

  const shown = limit ? Math.max(0, limit - secs) : secs;
  const time = `${Math.floor(shown / 3600)}:${String(Math.floor((shown % 3600) / 60)).padStart(2, "0")}:${String(shown % 60).padStart(2, "0")}`;
  let qNo = 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5 lg:max-w-6xl [--sticky-top:9.5rem]">
      <div className="test-toolbar sticky top-16 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card/95 p-3 shadow-sm backdrop-blur transition-shadow duration-200">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold">{kind === "exam" ? tx("Քննություն") : tx("Թեստ")} · {bookLabel(tx, bookId)}</p>
          <p className="text-xs text-muted-foreground">
            {finished ? tx("Արդյունք՝ {score} / {total}", { score, total }) : tx("{done} / {total} առաջադրանք", { done: Object.keys(answers).length, total: items.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-sm"><Timer className="size-4" />{time}</span>
          {finished ? (
            <Button variant="outline" size="sm" onClick={onExit}>{tx("Նոր թեստ")}</Button>
          ) : (
            <Button variant="success" size="sm" onClick={finish}>{tx("Ավարտել")}</Button>
          )}
        </div>
      </div>

      {finished && (
        <div className="bg-hero animate-pop rounded-3xl p-6 text-center text-white">
          <Trophy className="mx-auto size-10 text-sun" />
          <p className="mt-2 font-display text-4xl font-black">{score} / {total}</p>
          <p className="opacity-90">{Math.round((score / Math.max(1, total)) * 100)}% · {tx("Ստորև տեսեք ճիշտ պատասխաններն ու բացատրությունները")}</p>
        </div>
      )}

      {style === "game" && !finished && (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-success transition-[width] duration-500 ease-out" style={{ width: `${(cur / items.length) * 100}%` }} />
          </div>
          <span className={cn("font-display text-sm font-bold", combo >= 2 ? "text-sun" : "text-muted-foreground")}>⚡×{combo}</span>
        </div>
      )}
      {items.map(({ section, unit }, idx) => {
        const sec = book.sections.find((s) => s.n === section);
        if (!sec) return null;
        const from = qNo + 1;
        qNo += unitPoints(unit);
        if (style === "game" && !finished && idx !== cur) return null;
        const isChecked = !!checked[unit.id];
        return (
          <div key={unit.id} className="question-step space-y-3">
          <UnitCard
            key={unit.id}
            unit={unit}
            instruction={sec.instr_hy}
            instructionEn={sec.instr_en}
            value={answers[unit.id]}
            onChange={(v) => setAnswers((s) => ({ ...s, [unit.id]: v }))}
            revealed={() => finished || isChecked}
            header={
              <p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {sectionName(tx, sec)} · {from === qNo ? tx("Հարց {n}", { n: from }) : tx("Հարցեր {from}–{to}", { from, to: qNo })}
              </p>
            }
          />
          {style === "game" && !finished && (
            <div className="study-action-bar sticky z-20 flex justify-end">
              {!isChecked ? (
                <Button
                  variant="game"
                  size="lg"
                  onClick={() => {
                    setChecked((c) => ({ ...c, [unit.id]: true }));
                    const r = scoreUnit(unit, answers[unit.id]);
                    setCombo((c) => (r.got === r.total ? c + 1 : 0));
                  }}
                >
                  {tx("Ստուգել")}
                </Button>
              ) : idx < items.length - 1 ? (
                <Button variant="game" size="lg" onClick={() => { setCur(idx + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  {tx("Հաջորդը")} →
                </Button>
              ) : (
                <Button variant="success" size="lg" onClick={finish}>{tx("Ավարտել")}</Button>
              )}
            </div>
          )}
          </div>
        );
      })}
      {!finished && style === "classic" && (
        <Button variant="game" size="lg" className="w-full" onClick={finish}>{tx("Ավարտել և տեսնել արդյունքը")}</Button>
      )}
    </div>
  );
}

