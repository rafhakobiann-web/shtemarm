import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy } from "lucide-react";
import { z } from "zod";
import { MATH_BOOKS, MATH_QUESTIONS, type MathQuestion } from "@/lib/mathQuestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/math-test")({
  validateSearch: z.object({ book: z.enum(["1", "2", "all"]).catch("all") }),
  head: () => ({ meta: [{ title: "Մաթեմատիկայի թեստ · Shtemarm" }] }),
  component: MathTest,
});

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Fixed exam blueprint: each attempt changes the questions, not the topic structure. */
const EXAM_BLUEPRINT: ReadonlyArray<{ topic: string; count: number }> = [
  { topic: "Թվաբանական առաջադրանքներ", count: 5 },
  { topic: "Արտահայտությունների ձևափոխություններ", count: 6 },
  { topic: "Հավասարումներ", count: 7 },
  { topic: "Անհավասարումներ", count: 5 },
  { topic: "Տեքստային խնդիրներ", count: 5 },
  { topic: "Պրոգրեսիաներ", count: 5 },
  { topic: "Ֆունկցիաներ", count: 5 },
  { topic: "Եռանկյունաչափություն", count: 3 },
  { topic: "Հարթաչափություն", count: 8 },
  { topic: "Տարածաչափություն", count: 6 },
  { topic: "Կոորդինատներ և վեկտորներ", count: 5 },
  { topic: "Հավանականություն", count: 5 },
];

function makeExam(pool: MathQuestion[]): MathQuestion[] {
  const selected: MathQuestion[] = [];
  const used = new Set<string>();
  for (const section of EXAM_BLUEPRINT) {
    const candidates = shuffled(pool.filter((q) => q.topic === section.topic && !used.has(q.id)));
    const picked = candidates.slice(0, section.count);
    picked.forEach((q) => { used.add(q.id); selected.push(q); });
  }
  // Fail safely rather than silently displaying an exam with the wrong number of questions.
  if (selected.length !== 65) return shuffled(pool).slice(0, Math.min(65, pool.length));
  return selected;
}

function normalize(value: string) { return value.trim().replace(/\s/g, "").replace(/,/g, ".").replace(/−/g, "-").toLowerCase(); }

function MathTest() {
  const { book } = Route.useSearch();
  const available = useMemo(() => MATH_QUESTIONS.filter((q) => book === "all" || q.book === Number(book)), [book]);
  const [attempt, setAttempt] = useState(0);
  const questions = useMemo(() => book === "all" ? makeExam(available) : shuffled(available), [available, attempt, book]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [idx, setIdx] = useState(0);
  const current = questions[idx];
  const score = questions.filter((q) => normalize(answers[q.id] ?? "") === normalize(q.answer)).length;
  const reset = () => { setAnswers({}); setSubmitted(false); setIdx(0); setAttempt((n) => n + 1); };
  const chooseBook = book === "all" ? "Երկու շտեմարանները" : MATH_BOOKS.find((b) => String(b.id) === book)?.title ?? "Մաթեմատիկա";

  if (submitted) return <div className="mx-auto max-w-3xl space-y-6">
    <Link to="/math" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft className="size-4" /> Մաթեմատիկայի բաժին</Link>
    <section className="shadow-card space-y-5 rounded-3xl border bg-card p-6 text-center sm:p-10">
      <Trophy className="mx-auto size-14 text-sun" />
      <h1 className="text-3xl font-black">Թեստն ավարտված է</h1>
      <p className="text-2xl font-bold">{score} / {questions.length}</p>
      <p className="text-muted-foreground">Ճիշտ պատասխանների բացատրությունները ցուցադրված են ստորև։</p>
      <div className="space-y-4 text-left">
        {questions.map((q, i) => {
          const ok = normalize(answers[q.id] ?? "") === normalize(q.answer);
          return <article key={q.id} className="rounded-xl border p-4">
            <div className="flex items-start gap-2"><CheckCircle2 className={cn("mt-0.5 size-5 shrink-0", ok ? "text-success" : "text-destructive")} /><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-muted-foreground">{i + 1}. {q.topic} · Շտեմարան {q.book}</p><p className="mt-1 font-semibold">{q.prompt}</p><p className="mt-2 text-sm">Քո պատասխանը՝ <b>{answers[q.id] || "չի լրացվել"}</b></p><p className="text-sm">Ճիշտ պատասխան՝ <b>{q.answer}</b></p><p className="mt-2 text-sm text-muted-foreground">{q.explanation}</p></div></div>
          </article>;
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-3"><Button onClick={reset}><RotateCcw className="size-4" /> Նոր տարբերակ</Button><Button variant="outline" asChild><Link to="/math">Վերադառնալ</Link></Button></div>
    </section>
  </div>;

  if (!current) return null;
  return <div className="mx-auto max-w-3xl space-y-6">
    <div className="flex items-center justify-between gap-3"><Link to="/math" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft className="size-4" /> Մաթեմատիկա</Link><span className="text-sm text-muted-foreground">{chooseBook}</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} /></div>
    <section className="shadow-card space-y-6 rounded-3xl border bg-card p-5 sm:p-8">
      <div><p className="text-sm font-semibold text-muted-foreground">Հարց {idx + 1} / {questions.length} · {current.topic}</p><h1 className="mt-3 text-xl font-bold leading-relaxed sm:text-2xl">{current.prompt}</h1></div>
      {current.type === "choice" ? <div className="grid gap-3 sm:grid-cols-2">{current.options?.map((option, i) => <button key={option} type="button" onClick={() => setAnswers((a) => ({ ...a, [current.id]: option }))} className={cn("rounded-xl border p-4 text-left transition-colors hover:border-primary", answers[current.id] === option ? "border-primary bg-primary/10 ring-1 ring-primary" : "bg-background")}><span className="mr-3 inline-grid size-7 place-items-center rounded-full bg-muted text-sm font-bold">{String.fromCharCode(65 + i)}</span>{option}</button>)}</div> : <div className="space-y-2"><label htmlFor="math-answer" className="text-sm font-semibold">Գրիր թվային պատասխանը</label><Input id="math-answer" inputMode="decimal" value={answers[current.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [current.id]: e.target.value }))} placeholder="Քո պատասխանը" /></div>}
      <div className="flex items-center justify-between gap-3"><Button variant="outline" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>Նախորդ</Button>{idx < questions.length - 1 ? <Button onClick={() => setIdx((i) => i + 1)}>Հաջորդ →</Button> : <Button variant="sun" onClick={() => setSubmitted(true)}>Ավարտել և ստուգել</Button>}</div>
      <p className="text-xs text-muted-foreground">Պատասխանները ստուգվում են թեստն ավարտելուց հետո։ Թեստը կարող ես նորից սկսել՝ հարցերի նոր հերթականությամբ։</p>
    </section>
  </div>;
}
