import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Timer, Trophy, Shuffle, ListChecks } from "lucide-react";
import { z } from "zod";
import { useBook } from "@/lib/useBook";
import { buildCustom, buildExam, shuffle, unitPoints, type Unit } from "@/lib/books";
import { recordAnswer, update } from "@/lib/progress";
import { UnitCard, scoreUnit, type UnitAnswer } from "@/components/UnitCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/test/$bookId")({
  validateSearch: z.object({ mode: z.enum(["exam", "custom"]).catch("custom") }),
  head: ({ params }) => ({
    meta: [
      { title: `Շտեմարան ${params.bookId} · Թեստ և քննություն` },
      { name: "description", content: "80 հարցանոց քննություն կամ ձեր ընտրած բաժիններից կազմված թեստ։" },
      { property: "og:title", content: `Շտեմարան ${params.bookId} · Թեստ` },
      { property: "og:description", content: "Ստուգեք ձեր գիտելիքները իրական քննության կառուցվածքով։" },
    ],
  }),
  component: TestPage,
});

type Item = { section: number; unit: Unit };

function TestPage() {
  const { bookId } = Route.useParams();
  const { mode } = Route.useSearch();
  const { data: book } = useBook(Number(bookId));
  const [items, setItems] = useState<Item[] | null>(null);
  const [kind, setKind] = useState<"exam" | "custom">(mode);

  if (!book) return <div className="grid place-items-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
  if (items) return <Runner book={book} items={items} kind={kind} bookId={bookId} onExit={() => setItems(null)} />;
  return (
    <Setup
      bookId={bookId}
      sections={book.sections.map((s) => ({ n: s.n, label: s.instr_hy, count: s.units.reduce((a, u) => a + unitPoints(u), 0) }))}
      initial={mode}
      onStart={(k, secs, count) => {
        setKind(k);
        setItems(k === "exam" ? buildExam(book) : buildCustom(book, secs, count));
      }}
    />
  );
}

function Setup(p: {
  bookId: string;
  sections: { n: number; label: string; count: number }[];
  initial: "exam" | "custom";
  onStart: (k: "exam" | "custom", secs: number[], count: number) => void;
}) {
  const [tab, setTab] = useState<"exam" | "custom" | "random">(p.initial);
  const [secs, setSecs] = useState<number[]>([1, 2, 3]);
  const [count, setCount] = useState(20);
  const [randomN, setRandomN] = useState(3);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/book/$bookId" params={{ bookId: p.bookId }} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Շտեմարան {p.bookId}
      </Link>
      <h1 className="text-2xl font-black sm:text-3xl">Ընտրիր թեստի տեսակը</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {([
          ["exam", <Trophy key="t" />, "Քննություն", "80 հարց, իրական կառուցվածք"],
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
            <span className="font-bold">{t}</span>
            <span className="text-xs text-muted-foreground">{d}</span>
          </button>
        ))}
      </div>

      <div className="shadow-card space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
        {tab === "exam" && (
          <div className="space-y-2 text-sm leading-relaxed">
            <p>Քննությունը կազմված է 80 առաջադրանքից՝ շտեմարանի 13 բաժինների հերթականությամբ, ինչպես միասնական քննության թեստում։</p>
            <p className="text-muted-foreground">Ժամանակը՝ 3 ժամ։ Պատասխաններն ու բացատրությունները կերևան ավարտելուց հետո։</p>
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
                  <b>Բաժին {s.n}</b> <span className="text-muted-foreground">· {s.count}</span>
                  <span className="block text-xs leading-snug text-muted-foreground">{s.label}</span>
                </span>
              </label>
            ))}
          </div>
        )}
        {tab === "random" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">Բաժինների քանակը՝ {randomN}</p>
            <Slider min={1} max={13} step={1} value={[randomN]} onValueChange={(v) => setRandomN(v[0])} />
          </div>
        )}
        {tab !== "exam" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">Հարցերի քանակը՝ {count}</p>
            <Slider min={5} max={120} step={5} value={[count]} onValueChange={(v) => setCount(v[0])} />
          </div>
        )}
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
          Սկսել
        </Button>
      </div>
    </div>
  );
}

function Runner({ book, items, kind, bookId, onExit }: { book: { id: number; sections: { n: number; instr_hy: string; instr_en: string }[] }; items: Item[]; kind: "exam" | "custom"; bookId: string; onExit: () => void }) {
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
    setFinished(true);
    items.forEach(({ unit: u }) => {
      const r = scoreUnit(u, answers[u.id]);
      if (u.kind === "mc") u.questions.forEach((q, i) => recordAnswer(`${u.id}:${q.n}`, r.per[i], 5));
      else recordAnswer(u.id, r.per[0], 5);
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
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="sticky top-16 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card/95 p-3 backdrop-blur">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold">{kind === "exam" ? "Քննություն" : "Թեստ"} · Շտեմարան {bookId}</p>
          <p className="text-xs text-muted-foreground">
            {finished ? `Արդյունք՝ ${score} / ${total}` : `${Object.keys(answers).length} / ${items.length} առաջադրանք`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-sm"><Timer className="size-4" />{time}</span>
          {finished ? (
            <Button variant="outline" size="sm" onClick={onExit}>Նոր թեստ</Button>
          ) : (
            <Button variant="success" size="sm" onClick={finish}>Ավարտել</Button>
          )}
        </div>
      </div>

      {finished && (
        <div className="bg-hero animate-pop rounded-3xl p-6 text-center text-primary-foreground">
          <Trophy className="mx-auto size-10 text-sun" />
          <p className="mt-2 font-display text-4xl font-black">{score} / {total}</p>
          <p className="opacity-90">{Math.round((score / Math.max(1, total)) * 100)}% · Ստորև տեսեք ճիշտ պատասխաններն ու բացատրությունները</p>
        </div>
      )}

      {items.map(({ section, unit }) => {
        const sec = book.sections.find((s) => s.n === section)!;
        const from = qNo + 1;
        qNo += unitPoints(unit);
        return (
          <UnitCard
            key={unit.id}
            unit={unit}
            instruction={sec.instr_hy}
            instructionEn={sec.instr_en}
            value={answers[unit.id]}
            onChange={(v) => setAnswers((s) => ({ ...s, [unit.id]: v }))}
            revealed={() => finished}
            header={
              <p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Բաժին {section} · {from === qNo ? `Հարց ${from}` : `Հարցեր ${from}–${qNo}`}
              </p>
            }
          />
        );
      })}
      {!finished && (
        <Button variant="game" size="lg" className="w-full" onClick={finish}>Ավարտել և տեսնել արդյունքը</Button>
      )}
    </div>
  );
}
