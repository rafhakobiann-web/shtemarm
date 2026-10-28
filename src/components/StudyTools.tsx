import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useTx } from "@/lib/lang";
import { useProgress } from "@/lib/progress";

const FOCUS_SECONDS = 25 * 60;

export function StudyTools() {
  const tx = useTx();
  const progress = useProgress();
  const [seconds, setSeconds] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(id);
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const wrongCount = Object.values(progress.answers).filter((answer) => answer === 0).length;
  const correctCount = Object.values(progress.answers).filter((answer) => answer === 1).length;

  return (
    <section className="study-tools glass rounded-3xl p-5 sm:p-6" aria-label={tx("Ուսումնական գործիքներ")}>
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Timer className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black">{tx("Ուսումնական ժամանակաչափ")}</h3>
          <p className="text-sm text-muted-foreground">{tx("Սովորիր 25 րոպե, ապա կարճ դադար վերցրու։")}</p>
        </div>
      </div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-mono text-4xl font-black tabular-nums tracking-tight sm:text-5xl" role="timer" aria-live="off">{minutes}:{secs}</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setRunning((value) => !value)} disabled={seconds === 0} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-50">
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}{running ? tx("Դադար") : tx("Սկսել")}
          </button>
          <button type="button" onClick={() => { setRunning(false); setSeconds(FOCUS_SECONDS); }} className="inline-flex items-center gap-2 rounded-xl border bg-background/70 px-4 py-2.5 text-sm font-bold transition-colors duration-200 hover:bg-muted">
            <RotateCcw className="size-4" />{tx("Վերագործարկել")}
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-background/55 p-4">
          <p className="text-xs font-semibold text-muted-foreground">{tx("Ճիշտ պատասխաններ")}</p>
          <p className="mt-1 text-2xl font-black tabular-nums">{correctCount}</p>
        </div>
        <div className="rounded-2xl border bg-background/55 p-4">
          <p className="text-xs font-semibold text-muted-foreground">{tx("Կրկնելու հարցեր")}</p>
          <p className="mt-1 text-2xl font-black tabular-nums">{wrongCount}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-bold">{tx("Քո հաջորդ քայլը")}</p>
            <p className="text-sm text-muted-foreground">{wrongCount > 0 ? tx("Կրկնիր սխալ պատասխանած հարցերը, ապա փորձիր նոր թեստ։") : tx("Ընտրիր շտեմարան և սկսիր թեմատիկ վարժություններից։")}</p>
          </div>
        </div>
        {wrongCount > 0 && <Link to="/auth" className="inline-flex shrink-0 items-center justify-center rounded-xl border bg-background px-4 py-2 text-sm font-bold transition-colors hover:bg-muted">{tx("Իմ առաջընթացը")}</Link>}
      </div>
    </section>
  );
}
