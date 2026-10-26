import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UnitCard, scoreUnit, isAnswered, type UnitAnswer } from "@/components/UnitCard";
import { KIND_HY, type Unit } from "@/lib/books";
import { useHistoryProgress } from "@/lib/history-progress";
import { useTx } from "@/lib/lang";

export function HistorySession({
  units,
  title,
  minutes,
  practice,
  onExit,
}: {
  units: Unit[];
  title: string;
  minutes: number;
  practice: boolean;
  onExit: () => void;
}) {
  const tx = useTx();
  const { addExam } = useHistoryProgress();
  const [answers, setAnswers] = useState<Record<string, UnitAnswer>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [review, setReview] = useState(false);
  const [deadline] = useState(() => (minutes ? Date.now() + minutes * 60000 : null));
  const [remaining, setRemaining] = useState(minutes * 60);
  const saved = useRef(false);
  const score = units.reduce((s, u) => s + scoreUnit(u, answers[u.id]).got, 0);
  const total = units.reduce((s, u) => s + scoreUnit(u, undefined).total, 0);
  const finish = useCallback(() => {
    if (saved.current) return;
    saved.current = true;
    setFinished(true);
    setConfirm(false);
    addExam(score, total);
  }, [score, total, addExam]);
  useEffect(() => {
    if (!deadline || finished) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (!left) finish();
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [deadline, finished, finish]);
  useEffect(() => {
    if (finished) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [finished]);
  const answered = units.filter((u) => isAnswered(u, answers[u.id])).length;
  const unit = units[index];
  if (!unit) return null;
  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-12">
      <div className="rounded-3xl border bg-card p-5 sm:p-7 space-y-3">
        <p className="text-sm font-semibold text-primary">
          {tx(practice ? "Ուսուցում" : "Քննություն")}
        </p>
        <h1 className="text-2xl font-black">{title}</h1>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <span>{tx("Պատասխանած՝ {n} / {total}", { n: answered, total: units.length })}</span>
          {deadline && (
            <span
              role="timer"
              className={remaining < 60 ? "font-bold text-destructive" : "font-mono"}
            >
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </span>
          )}
        </div>
        <progress
          className="h-2 w-full accent-primary"
          max={units.length}
          value={answered}
          aria-label={tx("Առաջընթաց")}
        />
      </div>
      {finished && (
        <section role="status" className="space-y-4 rounded-3xl border bg-secondary p-6">
          <h2 className="text-2xl font-black">
            {tx("Արդյունք՝ {score} / {total}", { score, total })}
          </h2>
          <p>
            {tx("Չավարտված՝ {n}", { n: units.length - answered })} ·{" "}
            {total ? Math.round((score / total) * 100) : 0}%
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setReview(!review)}>
              {tx(review ? "Թաքցնել պատասխանները" : "Վերանայել պատասխանները")}
            </Button>
            <Button variant="outline" onClick={onExit}>
              {tx("Նոր թեստ")}
            </Button>
          </div>
        </section>
      )}
      {(!finished || review) && (
        <>
          <nav
            aria-label={tx("Առաջադրանքներ")}
            className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-2xl border bg-card p-3"
          >
            {units.map((u, i) => (
              <button
                key={u.id}
                type="button"
                aria-label={tx("Առաջադրանք {n}", { n: i + 1 })}
                aria-current={index === i ? "step" : undefined}
                onClick={() => setIndex(i)}
                className={`h-10 min-w-10 rounded-lg border px-2 text-sm font-bold ${index === i ? "bg-primary text-primary-foreground" : answers[u.id] ? "bg-secondary" : "bg-background"}`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
          <UnitCard
            key={unit.id}
            unit={unit}
            instruction={tx(KIND_HY[unit.kind])}
            value={answers[unit.id]}
            onChange={(v) => {
              if (!finished && !checked[unit.id]) setAnswers((a) => ({ ...a, [unit.id]: v }));
            }}
            revealed={() => finished || !!checked[unit.id]}
            header={
              <p className="text-sm font-bold text-muted-foreground">
                {index + 1} / {units.length} · {unit.label}
              </p>
            }
          />
          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
              {tx("Նախորդը")}
            </Button>
            {practice && !finished && (
              <Button
                disabled={!answers[unit.id] || checked[unit.id]}
                onClick={() => setChecked((c) => ({ ...c, [unit.id]: true }))}
              >
                {tx("Ստուգել պատասխանը")}
              </Button>
            )}
            <Button
              variant="outline"
              disabled={index === units.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              {tx("Հաջորդը")}
            </Button>
          </div>
        </>
      )}
      {!finished && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          {confirm ? (
            <>
              <p>{tx("Ավարտե՞լ թեստը։ Չպատասխանած առաջադրանքները կստանան 0 միավոր։")}</p>
              <div className="flex gap-2">
                <Button onClick={finish}>{tx("Այո, ավարտել")}</Button>
                <Button variant="outline" onClick={() => setConfirm(false)}>
                  {tx("Շարունակել")}
                </Button>
              </div>
            </>
          ) : (
            <Button className="w-full" onClick={() => setConfirm(true)}>
              {tx("Ավարտել և տեսնել արդյունքը")}
            </Button>
          )}
          <details>
            <summary className="cursor-pointer text-sm text-muted-foreground">
              {tx("Դադարեցնել թեստը")}
            </summary>
            <p className="my-2 text-sm">{tx("Ընթացիկ պատասխանները չեն պահպանվի։")}</p>
            <Button variant="outline" onClick={onExit}>
              {tx("Վերադառնալ կարգավորումներին")}
            </Button>
          </details>
        </div>
      )}
    </div>
  );
}
