import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHistoryProgress } from "@/lib/history-progress";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/history-book")({
  head: () => ({
    meta: [
      { title: "Հայոց պատմություն · Գիրք 1 · Շտեմարան" },
      { name: "description", content: "Հայոց պատմության հարցաշար՝ ստուգված պատասխաններով" },
    ],
  }),
  component: HistoryBookPage,
});

type Question = {
  book: string;
  section: string;
  num: number;
  page: number;
  stem: string;
  options: Record<string, string>;
  answer: string;
  source_run: number;
};
type Bank = { title: string; questions: Question[] };

const DEFAULT_TEST_SIZE = 20;
const BOOK_KEY = "patm-1";

function useBank() {
  return useQuery({
    queryKey: ["history-bank-book1"],
    queryFn: async (): Promise<Bank> => {
      const r = await fetch("/data/history-bank-book1.json");
      if (!r.ok) throw new Error("load failed");
      const d = await r.json();
      return { title: d.title, questions: d.questions };
    },
    staleTime: Infinity,
  });
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Sections in book order, each with its questions in book order. */
function groupSections(qs: Question[]) {
  const out: { index: number; title: string; items: Question[] }[] = [];
  for (const q of qs) {
    const last = out[out.length - 1];
    if (!last || last.title !== q.section || last.items[last.items.length - 1].source_run !== q.source_run) {
      out.push({ index: out.length + 1, title: q.section || "—", items: [q] });
    } else last.items.push(q);
  }
  return out;
}

function qid(q: Question) {
  return `${q.book}:${q.source_run}:${q.num}`;
}

function AnswerRow({ q, chosen, locked, onPick }: { q: Question; chosen?: string; locked: boolean; onPick: (c: string) => void }) {
  return (
    <div className="grid gap-2">
      {Object.entries(q.options).map(([k, text]) => {
        const isRight = chosen !== undefined && k === q.answer;
        const isWrong = chosen === k && k !== q.answer;
        return (
          <button
            key={k}
            type="button"
            disabled={locked || chosen !== undefined}
            onClick={() => onPick(k)}
            className={`flex w-full items-start gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left text-sm transition ${
              isRight ? "border-emerald-600 bg-emerald-50 text-emerald-900"
              : isWrong ? "border-red-500 bg-red-50 text-red-800"
              : "border-stone-300 hover:bg-stone-50"}`}
          >
            <span className="w-6 shrink-0 font-bold text-stone-500">{k})</span>
            <span>{text}</span>
          </button>
        );
      })}
    </div>
  );
}

function HistoryBookPage() {
  const tx = useTx();
  const q = useBank();
  const { progress, setAnswer, addExam } = useHistoryProgress();
  const sections = useMemo(() => (q.data ? groupSections(q.data.questions) : []), [q.data]);

  const [sectionNo, setSectionNo] = useState<number | null>(null);
  const [mode, setMode] = useState<"play" | "classic" | "test">("play");
  const [testSize, setTestSize] = useState(DEFAULT_TEST_SIZE);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("sec")) setSectionNo(Number(sp.get("sec")));
    if (sp.get("mode") === "test" || sp.get("mode") === "classic") setMode(sp.get("mode") as "test" | "classic");
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (sectionNo !== null) sp.set("sec", String(sectionNo));
    if (sectionNo !== null && mode !== "play") sp.set("mode", mode);
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [sectionNo, mode]);

  const [round, setRound] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, string>>({});
  const [streak, setStreak] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isWholeBook = sectionNo === -1;
  const section = isWholeBook
    ? { index: 0, title: "Ամբողջ գիրքը", items: q.data.questions }
    : sectionNo !== null ? sections.find((s) => s.index === sectionNo) ?? null : null;

  useEffect(() => {
    if (!section) return;
    setRound(mode === "test" ? shuffle(section.items).slice(0, Math.min(testSize, section.items.length)) : section.items);
    setIndex(0);
    setMistakes(0);
    setSessionAnswers({});
    setStreak(0);
    setTestAnswers({});
    setSubmitted(false);
  }, [sectionNo, mode, q.data, testSize]);

  if (q.isLoading) return <p className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {tx("Բեռնվում է…")}</p>;
  if (q.error || !q.data) return <p className="p-6 text-destructive">{tx("Չհաջողվեց բեռնել գիրքը։")}</p>;

  // ---------- book page (cover + sections) ----------
  if (!section) {
    return (
      <div className="relative mx-auto max-w-2xl space-y-5 px-3 pb-24 pt-4">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-sky-300/50 blur-3xl" />
          <div className="absolute right-[-60px] top-1/3 h-80 w-80 rounded-full bg-amber-200/60 blur-3xl" />
          <div className="absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl" />
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {tx("Գլխավոր էջ")}
        </Link>
        <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4">
          <img src="/history/covers/patm-1.jpg" alt={tx("Հայոց պատմություն · Գիրք 1")} className="aspect-[3/4] w-full rounded-[22px] border border-white/70 object-cover shadow-[0_14px_40px_rgba(30,58,138,0.25)]" />
          <div className="space-y-2">
            <h1 className="text-xl font-black">{tx("Հայոց պատմություն · Գիրք 1")}</h1>
            <p className="text-sm text-muted-foreground">{tx("{count} հարց · {sections} բաժին", { count: q.data.questions.length, sections: sections.length })}</p>
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border bg-card p-4">
          <label htmlFor="history-test-size" className="block text-sm font-bold">{tx("Քանի՞ հարցով կազմել թեստը")}</label>
          <select
            id="history-test-size"
            value={testSize}
            onChange={(e) => setTestSize(Number(e.target.value))}
            className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
          >
            {[5, 10, 15, 20, 30, 40, 50, 60, 70].map((n) => (
              <option key={n} value={n}>{n} {tx("հարց")}</option>
            ))}
          </select>
          <button
            onClick={() => { setMode("test"); setSectionNo(-1); }}
            className="w-full rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-3 text-sm font-bold text-stone-900 shadow-[0_6px_18px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.6)]"
          >
            {tx("Կազմել թեստ ({n} հարց ամբողջ գրքից)", { n: testSize })}
          </button>
        </div>
        <div className="grid gap-3">
          {sections.map((s) => {
            const prefix = `${BOOK_KEY}:${s.items[0].source_run}:`;
            const done = Object.keys(progress.answers).filter((k) => k.startsWith(prefix)).length;
            return (
              <div key={s.index} className="space-y-3 rounded-[28px] border border-white/60 bg-white/55 p-4 shadow-[0_8px_32px_rgba(30,58,138,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-700 font-black text-white">{s.index}</span>
                  <div className="min-w-0">
                    <p className="font-bold leading-snug">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{tx("{count} հարց · {done} արված", { count: s.items.length, done })}</p>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-success" style={{ width: `${Math.min(100, (done / s.items.length) * 100)}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => { setMode("play"); setSectionNo(s.index); }} className="h-11 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-800 text-sm font-bold text-white shadow-[0_6px_18px_rgba(29,78,216,0.35),inset_0_1px_0_rgba(255,255,255,0.45)]">{tx("Խաղալ")}</button>
                  <button onClick={() => { setMode("classic"); setSectionNo(s.index); }} className="h-11 rounded-2xl border border-white/70 bg-white/60 text-sm font-bold text-stone-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur">{tx("Դասական")}</button>
                  <button onClick={() => { setMode("test"); setSectionNo(s.index); }} className="h-11 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 text-sm font-bold text-stone-900 shadow-[0_6px_18px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.6)]">{tx("Թեստ")}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const sectionTitle = isWholeBook ? tx("Ամբողջ գիրքը") : section.title;

  // ---------- section pages ----------
  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button onClick={() => setSectionNo(null)} className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4 shrink-0" />
        <span className="truncate">{isWholeBook ? tx("Գիրք 1 · Կազմել թեստ") : tx("Գիրք 1 · Բաժին {n}", { n: section.index })}</span>
      </button>
      <div className="flex rounded-2xl bg-muted/70 p-1 text-sm font-bold">
        <button onClick={() => setMode("play")} className={`rounded-xl px-4 py-2 ${mode === "play" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>{tx("Խաղային")}</button>
        <button onClick={() => setMode("classic")} className={`rounded-xl px-4 py-2 ${mode === "classic" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>{tx("Դասական")}</button>
        <button onClick={() => setMode("test")} className={`rounded-xl px-4 py-2 ${mode === "test" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>{tx("Թեստ")}</button>
      </div>
    </div>
  );

  if (mode === "classic") {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4">
        {header}
        <p className="text-sm font-bold">{sectionTitle}</p>
        {section.items.map((it) => (
          <section key={qid(it)} className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-semibold">{it.num}. {it.stem}</p>
            <div className="grid gap-2 text-sm">
              {Object.entries(it.options).map(([k, t]) => (
                <p key={k} className={k === it.answer ? "font-bold text-emerald-700" : ""}>{k}) {t}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (mode === "test") {
    const correctOf = (x: Question) => testAnswers[qid(x)] === x.answer;
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4">
        {header}
        <p className="text-sm font-bold">{tx("Թեստ · {count} հարց · {title}", { count: round.length, title: sectionTitle })}</p>
        {round.map((it, idx) => (
          <section key={qid(it)} className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{idx + 1} / {round.length}</p>
            <p className="text-sm font-semibold">{it.stem}</p>
            <AnswerRow q={it} chosen={submitted ? testAnswers[qid(it)] : testAnswers[qid(it)]} locked={submitted} onPick={(c) => setTestAnswers((a) => ({ ...a, [qid(it)]: c }))} />
          </section>
        ))}
        {!submitted ? (
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => {
            setSubmitted(true);
            addExam(round.filter(correctOf).length, round.length);
          }}>{tx("Ավարտել")}</Button>
        ) : (
          <p className="rounded-2xl bg-muted/60 p-4 text-center text-sm font-semibold">{tx("Արդյունք՝ {score} / {total}", { score: round.filter(correctOf).length, total: round.length })}</p>
        )}
      </div>
    );
  }

  // ---------- Խաղային ----------
  const it = round[index];
  const answeredCount = round.filter((x) => sessionAnswers[qid(x)] !== undefined).length;
  const current = it ? sessionAnswers[qid(it)] : undefined;
  const finished = !it || (index === round.length - 1 && current !== undefined);

  const onPick = (c: string) => {
    if (!it || current !== undefined) return;
    setSessionAnswers((prev) => ({ ...prev, [qid(it)]: c }));
    setAnswer(qid(it), c);
    if (c === it.answer) setStreak((s) => s + 1);
    else {
      setStreak(0);
      setMistakes((n) => n + 1);
    }
  };

  return (
    <div className="relative mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-sky-300/50 blur-3xl" />
        <div className="absolute right-[-60px] top-1/3 h-80 w-80 rounded-full bg-amber-200/60 blur-3xl" />
      </div>
      {header}
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-xs font-bold text-muted-foreground">{tx("Սխալներ՝ {n}", { n: mistakes })}</span>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${round.length ? (answeredCount / round.length) * 100 : 0}%` }} />
        </div>
        <span className="flex items-center gap-1 text-sm font-black text-amber-600"><Zap className="size-5" /> ×{streak}</span>
      </div>

      {finished ? (
        <section className="space-y-3 rounded-[28px] border border-white/60 bg-white/55 p-6 text-center shadow-[0_8px_32px_rgba(30,58,138,0.12)] backdrop-blur-xl">
          <p className="text-xl font-black">{tx("Խաղն ավարտված է")}</p>
          <p className="text-sm text-muted-foreground">{tx("Ճիշտ՝ {correct} / {answered}", { correct: round.filter((x) => sessionAnswers[qid(x)] === x.answer).length, answered: answeredCount })}</p>
          <Button className="w-full" onClick={() => { setIndex(0); setMistakes(0); setStreak(0); setSessionAnswers({}); setRound([...section.items]); }}>{tx("Նորից")}</Button>
        </section>
      ) : (
        <section className="space-y-4 rounded-[28px] border border-white/60 bg-white/55 p-5 shadow-[0_8px_32px_rgba(30,58,138,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl">
          <div className="space-y-1">
            <p className="text-base font-bold text-blue-700">{tx("Կարդալ հարցը և ընտրել ճիշտ տարբերակը:")}</p>
            <p className="text-sm italic text-muted-foreground">Read the question and choose the right answer.</p>
          </div>
          <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur">
            <p className="mb-4 text-base font-semibold leading-relaxed">{it.num}. {it.stem}</p>
            <AnswerRow q={it} chosen={current} locked={false} onPick={onPick} />
            {current !== undefined && (
              <Button className="mt-4 h-12 w-full rounded-2xl" onClick={() => setIndex((i) => i + 1)}>{tx("Հաջորդը")}</Button>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground">{index + 1} / {round.length}</p>
        </section>
      )}
    </div>
  );
}
