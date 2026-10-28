import { Link } from "@tanstack/react-router";
import { BookOpen, RotateCcw } from "lucide-react";
import { useTx } from "@/lib/lang";
import { useProgress } from "@/lib/progress";

export function StudyTools() {
  const tx = useTx();
  const progress = useProgress();
  const wrongCount = Object.values(progress.answers).filter((answer) => answer === 0).length;
  const correctCount = Object.values(progress.answers).filter((answer) => answer === 1).length;
  return (
    <section className="study-tools glass rounded-3xl p-5 sm:p-6" aria-label={tx("Ուսումնական առաջընթաց")}>
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><RotateCcw className="size-5" /></span>
        <div>
          <h3 className="text-lg font-black">{tx("Ուսումնական առաջընթաց")}</h3>
          <p className="text-sm text-muted-foreground">{tx("Ուսումնասիրիր արդյունքներդ և կրկնիր դժվար առաջադրանքները։")}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
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
