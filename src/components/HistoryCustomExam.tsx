import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, Clock3, Loader2, RotateCcw, Settings2, Shuffle, Trophy } from "lucide-react";
import { loadBook } from "@/lib/books";
import { buildHistoryExam, historyPool, HISTORY_SECTION_NAMES, type HistoryExamQuestion } from "@/lib/history-exam-builder";
import { isAnswered, scoreUnit, UnitCard, type UnitAnswer } from "@/components/UnitCard";
import { useHistoryProgress } from "@/lib/history-progress";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";

const BOOK_IDS = [21, 22, 23];
const SECTIONS = HISTORY_SECTION_NAMES.map((name, i) => ({ id: i + 1, name }));

export function HistoryCustomExam() {
  const tx = useTx();
  const query = useQuery({
    queryKey: ["history-custom-books"],
    queryFn: () => Promise.all(BOOK_IDS.map(loadBook)),
    staleTime: Infinity,
  });
  const { addExam } = useHistoryProgress();
  const [books, setBooks] = useState<number[]>([21, 22, 23]);
  const [sections, setSections] = useState<number[]>(SECTIONS.map((s) => s.id));
  const [count, setCount] = useState(70);
  const [order, setOrder] = useState<"random" | "book">("random");
  const [layout, setLayout] = useState<"single" | "all">("single");
  const [minutes, setMinutes] = useState(180);
  const [items, setItems] = useState<HistoryExamQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, UnitAnswer>>({});
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState("");

  const pool = useMemo(
    () => query.data ? historyPool(query.data, books, sections) : [],
    [query.data, books, sections],
  );
  const completed = useMemo(
    () => items?.filter((q) => isAnswered(q.unit, answers[q.id])).length ?? 0,
    [items, answers],
  );
  const score = useMemo(
    () => items?.reduce((sum, q) => sum + scoreUnit(q.unit, answers[q.id]).got, 0) ?? 0,
    [items, answers],
  );

  const finish = useCallback(() => {
    if (!items || finished) return;
    setFinished(true);
    addExam(score, items.length);
  }, [items, finished, score, addExam]);

  useEffect(() => {
    if (!items || finished || minutes === 0) return;
    const timer = window.setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [items, finished, minutes]);

  useEffect(() => {
    if (items && !finished && minutes > 0 && remaining === 0) finish();
  }, [items, finished, minutes, remaining, finish]);

  function start() {
    try {
      if (!query.data) return;
      const selected = buildHistoryExam(query.data, { books, sections, count, order });
      setAnswers({});
      setCurrent(0);
      setFinished(false);
      setRemaining(minutes * 60);
      setItems(selected);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Չհաջողվեց կազմել թեստը։");
    }
  }

  const reset = () => {
    setItems(null);
    setAnswers({});
    setFinished(false);
    setError("");
  };

  if (query.isLoading) return <div className="flex items-center gap-2 rounded-2xl border p-5 text-muted-foreground"><Loader2 className="size-5 animate-spin" />{tx("Բեռնվում են պատմության շտեմարանները…")}</div>;
  if (query.error || !query.data) return (
    <div role="alert" className="space-y-3 rounded-2xl border border-destructive/30 p-5">
      <p className="text-destructive">{tx("Չհաջողվեց բեռնել պատմության շտեմարանները։")}</p>
      <Button variant="outline" onClick={() => query.refetch()}>{tx("Կրկին փորձել")}</Button>
    </div>
  );

  if (!items) return (
    <section className="space-y-5 rounded-3xl border bg-card p-4 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary"><Settings2 /></span>
        <div>
          <h2 className="text-xl font-black">{tx("Կազմիր քո քննությունը")}</h2>
          <p className="text-sm text-muted-foreground">{tx("Ընտրիր գրքերը, թեմաները, հարցերի քանակը և անցնելու եղանակը։")}</p>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-bold">{tx("Շտեմարաններ")}</legend>
        <div className="grid grid-cols-3 gap-2">
          {BOOK_IDS.map((id) => (
            <label key={id} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-sm hover:bg-muted/60">
              <input type="checkbox" checked={books.includes(id)} onChange={() => setBooks((v) => v.includes(id) ? v.filter((x) => x !== id) : [...v, id])} className="size-4 accent-primary" />
              <span className="font-semibold">{tx("Գիրք {n}", { n: id - 20 })}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <legend className="text-sm font-bold">{tx("Բաժիններ")}</legend>
          <div className="flex gap-3 text-xs font-semibold">
            <button type="button" className="text-primary hover:underline" onClick={() => setSections(SECTIONS.map((s) => s.id))}>{tx("Ընտրել բոլորը")}</button>
            <button type="button" className="text-muted-foreground hover:underline" onClick={() => setSections([])}>{tx("Մաքրել")}</button>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm hover:bg-muted/60">
              <input type="checkbox" checked={sections.includes(s.id)} onChange={() => setSections((v) => v.includes(s.id) ? v.filter((x) => x !== s.id) : [...v, s.id])} className="mt-0.5 size-4 accent-primary" />
              <span>{s.id}. {s.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold">
          <span>{tx("Հարցերի քանակը")}</span>
          <input type="number" min={1} max={Math.max(1, pool.length)} step={1} value={count} onChange={(e) => setCount(Number(e.target.value))} className="h-11 w-full rounded-xl border bg-background px-3" />
          <span className="block text-xs font-normal text-muted-foreground">{tx("Հասանելի՝ {n} հարց", { n: pool.length })}</span>
        </label>
        <label className="space-y-2 text-sm font-semibold">
          <span>{tx("Ժամանակի սահմանափակում")}</span>
          <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="h-11 w-full rounded-xl border bg-background px-3">
            <option value={0}>{tx("Առանց սահմանափակման")}</option>
            <option value={30}>30 {tx("րոպե")}</option>
            <option value={60}>60 {tx("րոպե")}</option>
            <option value={90}>90 {tx("րոպե")}</option>
            <option value={180}>180 {tx("րոպե")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-semibold">
          <span>{tx("Հարցերի հերթականություն")}</span>
          <select value={order} onChange={(e) => setOrder(e.target.value as "random" | "book")} className="h-11 w-full rounded-xl border bg-background px-3">
            <option value="random">{tx("Պատահական")}</option>
            <option value="book">{tx("Գրքերի և բաժինների հերթականությամբ")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-semibold">
          <span>{tx("Ցուցադրման եղանակ")}</span>
          <select value={layout} onChange={(e) => setLayout(e.target.value as "single" | "all")} className="h-11 w-full rounded-xl border bg-background px-3">
            <option value="single">{tx("Մեկ հարց յուրաքանչյուր էջում")}</option>
            <option value="all">{tx("Բոլոր հարցերը մեկ էջում")}</option>
          </select>
        </label>
      </div>

      {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Button variant="game" size="lg" className="w-full" disabled={!books.length || !sections.length || count < 1 || !Number.isSafeInteger(count) || count > pool.length} onClick={start}>
        <Shuffle className="size-4" /> {tx("Սկսել {n} հարցից կազմված թեստը", { n: count })}
      </Button>
      {count > pool.length && <p className="text-sm text-amber-700">{tx("Ընտրած գրքերում և բաժիններում բավարար հարցեր չկան։")}</p>}
      <p className="text-xs text-muted-foreground">{tx("Սա շտեմարանների հարցերից կազմված անհատական փորձնական թեստ է, ոչ թե պաշտոնական քննական տարբերակ։")}</p>
    </section>
  );

  const visible = layout === "all" || finished ? items : items.slice(current, current + 1);
  const clock = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <section className="mx-auto space-y-5">
      <div className="sticky top-16 z-20 space-y-3 rounded-2xl border bg-card/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-black">{finished ? tx("Թեստի արդյունքները") : tx("Հայոց պատմություն · Անհատական թեստ")}</p>
            <p className="text-xs text-muted-foreground">{tx("Պատասխանված՝ {n} / {total}", { n: completed, total: items.length })}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {minutes > 0 && <span className="flex items-center gap-1 font-mono text-sm"><Clock3 className="size-4" />{clock}</span>}
            {!finished && <Button variant="success" size="sm" onClick={finish}>{tx("Ավարտել")}</Button>}
            {finished && <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="size-4" />{tx("Նոր թեստ")}</Button>}
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${(completed / items.length) * 100}%` }} /></div>
      </div>

      {finished && (
        <div role="status" className="space-y-2 rounded-3xl border bg-card p-6 text-center">
          <Trophy className="mx-auto size-9 text-primary" />
          <p className="text-3xl font-black">{score} / {items.length}</p>
          <p className="text-sm text-muted-foreground">{tx("Ճիշտ պատասխան՝ {n} · Չպատասխանված՝ {missing}", { n: score, missing: items.length - completed })}</p>
          <p className="text-xs text-muted-foreground">{tx("Ստորև կարող ես ստուգել բոլոր հարցերն ու ճիշտ պատասխանները։")}</p>
        </div>
      )}

      {!finished && layout === "single" && (
        <div className="flex flex-wrap gap-1.5" aria-label={tx("Հարցերի նավիգացիա")}>
          {items.map((q, i) => (
            <button key={q.id} type="button" onClick={() => setCurrent(i)}
              aria-label={tx("Հարց {n}", { n: i + 1 })} aria-current={current === i ? "step" : undefined}
              className={`grid size-9 place-items-center rounded-lg border text-xs font-bold ${current === i ? "border-primary bg-primary text-primary-foreground" : isAnswered(q.unit, answers[q.id]) ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "bg-card"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {visible.map((q) => {
        const position = items.findIndex((item) => item.id === q.id) + 1;
        return (
          <div key={q.id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <BookOpen className="size-4" />
              <span>{tx("Գիրք {n}", { n: q.bookId - 20 })} · {HISTORY_SECTION_NAMES[q.section - 1]} · {position} / {items.length}</span>
              {isAnswered(q.unit, answers[q.id]) && <CheckCircle2 className="size-4 text-emerald-600" />}
            </div>
            <UnitCard
              unit={q.unit}
              instruction={q.instruction}
              value={answers[q.id]}
              onChange={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
              revealed={() => finished}
            />
          </div>
        );
      })}

      {!finished && layout === "single" && (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" disabled={current === 0} onClick={() => { setCurrent((v) => Math.max(0, v - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{tx("Նախորդը")}</Button>
          <Button variant="game" disabled={current === items.length - 1} onClick={() => { setCurrent((v) => Math.min(items.length - 1, v + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{tx("Հաջորդը")}</Button>
        </div>
      )}
      {finished && <Button className="w-full" variant="outline" onClick={reset}>{tx("Կազմել նոր թեստ")}</Button>}
    </section>
  );
}
