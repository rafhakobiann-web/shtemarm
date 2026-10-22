import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Timer, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/math")({
  head: () => ({
    meta: [
      { title: "Մաթեմատիկա · Թեստ 1 · Շտեմարան" },
      { name: "description", content: "2026 հունիսի մաթեմատիկայի ընդունելության թեստ 1" },
    ],
  }),
  component: MathPage,
});

type Kind = "choice" | "number" | "statements" | "unknown";
type MathQuestion = { n: number; page: number; kind: Kind; answer: string | null };
type MathTest = { title: string; answers_note: string; questions: MathQuestion[] };

const PAGE_SRC = (page: number) => `/math/test1/page-${String(page).padStart(2, "0")}.png`;
const LABELS: Record<Kind, string> = {
  choice: "Ընտրիր պատասխանը 1–4",
  number: "Գրիր թիվը",
  statements: "Գրիր ճիշտ պնդումների համարները (օրինակ՝ 1,3,5)",
  unknown: "Պատասխանը դեռ լրացված չէ",
};

function useMathTest() {
  return useQuery({
    queryKey: ["math-test1"],
    queryFn: async (): Promise<MathTest> => {
      const r = await fetch("/data/math-test1.json");
      if (!r.ok) throw new Error("load failed");
      return r.json();
    },
    staleTime: Infinity,
  });
}

function formatTime(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function normalize(v: string) {
  return v.replace(/\s+/g, "").replace(",", ".").replace(/%$/, "");
}

function isCorrect(q: MathQuestion, given: string | undefined) {
  if (!q.answer || given === undefined) return false;
  if (q.kind === "statements") {
    const a = q.answer.split(",").map((s) => s.trim()).sort().join(",");
    const g = given.split(/[,;\s]+/).filter(Boolean).sort().join(",");
    return a === g;
  }
  return normalize(q.answer) === normalize(given);
}

function MathPage() {
  const q = useMathTest();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!started || submitted) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [started, submitted]);

  const questions = q.data?.questions ?? [];
  const answered = useMemo(() => Object.keys(answers).filter((k) => answers[+k] !== "").length, [answers]);
  const scored = questions.filter((x) => x.answer !== null);
  const correct = questions.filter((x) => isCorrect(x, answers[x.n])).length;

  if (q.isLoading) return <p className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Բեռնվում է…</p>;
  if (q.error || !q.data) return <p className="p-6 text-destructive">Չհաջողվեց բեռնել թեստը։</p>;

  const pages = Array.from(new Set(questions.map((x) => x.page)));

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 pt-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Գլխավոր էջ
      </Link>

      <div className="sticky top-2 z-10 flex items-center justify-between gap-3 rounded-2xl border bg-background/95 p-4 shadow-md backdrop-blur">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">Թեստ · Մաթեմատիկա · Թեստ 1</p>
          <p className="text-xs text-muted-foreground">{submitted ? `Արդյունք՝ ${correct} / ${scored.length}` : `${answered} / ${questions.length} հարց պատասխանված`}</p>
        </div>
        <div className="flex items-center gap-3">
          {started && <span className="flex items-center gap-1 font-mono text-sm"><Timer className="size-4" />{formatTime(seconds)}</span>}
          {!started ? (
            <Button onClick={() => setStarted(true)}>Սկսել</Button>
          ) : !submitted ? (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setSubmitted(true)}>Ավարտել</Button>
          ) : (
            <Button variant="outline" onClick={() => { setAnswers({}); setSubmitted(false); setStarted(false); setSeconds(0); }}>Նորից</Button>
          )}
        </div>
      </div>

      {!started && <p className="rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed">Թեստը 65 հարց ունի։ Էջերը ցուցադրվում են նույն տեսքով, ինչ գրքույկում։ Պատասխանի կոճակը ընտրիր և սեղմիր «Ավարտել»։</p>}

      {started && pages.map((page) => {
        const items = questions.filter((x) => x.page === page);
        return (
          <section key={page} className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Էջ {page}</p>
              <a href={PAGE_SRC(page)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                Բացել <ExternalLink className="size-3" />
              </a>
            </div>
            <img src={PAGE_SRC(page)} alt={`Թեստի էջ ${page}`} loading="lazy" className="w-full rounded-xl border bg-white" />

            {items.map((item) => {
              const given = answers[item.n];
              const ok = submitted && isCorrect(item, given);
              return (
                <div key={item.n} className="space-y-2 rounded-2xl border p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{item.n}</span>
                    <span className="text-xs text-muted-foreground">{LABELS[item.kind]}</span>
                  </div>

                  {item.kind === "choice" && (
                    <div className="grid grid-cols-4 gap-2">
                      {["1", "2", "3", "4"].map((opt) => {
                        const selected = given === opt;
                        const isRight = submitted && item.answer === opt;
                        const isWrong = submitted && selected && !isRight;
                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={submitted}
                            onClick={() => setAnswers((a) => ({ ...a, [item.n]: opt }))}
                            className={`h-12 rounded-xl border-2 text-base font-bold transition ${
                              isRight ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                              : isWrong ? "border-red-500 bg-red-50 text-red-700"
                              : selected ? "border-blue-700 bg-blue-50 text-blue-800"
                              : "border-stone-300 bg-white hover:bg-stone-50"}`}
                          >
                            {opt})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {item.kind !== "choice" && item.kind !== "unknown" && (
                    <input
                      type="text"
                      disabled={submitted}
                      value={given ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [item.n]: e.target.value }))}
                      placeholder="Պատասխան"
                      className="h-11 w-full rounded-xl border-2 border-stone-300 bg-white px-3 text-base focus:border-blue-700 focus:outline-none"
                    />
                  )}

                  {submitted && (
                    <p className={`text-sm ${ok ? "text-emerald-700" : item.answer ? "text-red-700" : "text-muted-foreground"}`}>
                      {item.answer === null ? "Պատասխանը ստուգված չէ։" : ok ? "Ճիշտ է ✓" : `Ճիշտ պատասխանը՝ ${item.answer}`}
                    </p>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}

      {started && submitted && (
        <p className="rounded-2xl bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">{q.data.answers_note}</p>
      )}
    </div>
  );
}
