import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { KIND_HY } from "@/lib/books";
import { loadHistoryTests } from "@/lib/history";
import { UnitCard, scoreUnit, type UnitAnswer } from "@/components/UnitCard";
import { Button } from "@/components/ui/button";

/** One Armenian history sample exam (70 tasks, 80 points), answered and scored on submit. */
export function HistoryExam({ testId }: { testId: number }) {
  const q = useQuery({ queryKey: ["history-tests"], queryFn: loadHistoryTests, staleTime: Infinity });
  const [answers, setAnswers] = useState<Record<string, UnitAnswer>>({});
  const [finished, setFinished] = useState(false);

  if (q.isLoading) {
    return <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" />Բեռնվում է…</p>;
  }
  if (q.error || !q.data) {
    return <p className="text-destructive">Չհաջողվեց բեռնել թեստը։</p>;
  }
  const test = q.data.tests.find((t) => t.id === testId);
  if (!test) return <p className="text-muted-foreground">Թեստը չի գտնվել։</p>;

  const score = test.tasks.reduce((sum, u) => sum + scoreUnit(u, answers[u.id]).got, 0);
  const total = test.tasks.reduce((sum, u) => sum + scoreUnit(u, undefined).total, 0);
  const answered = test.tasks.filter((u) => answers[u.id] !== undefined).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Թեստ {test.id}</h2>
        <p className="text-sm text-muted-foreground">
          {finished ? `Արդյունք՝ ${score} / ${total}` : `${answered} / ${test.tasks.length} առաջադրանք`}
        </p>
      </div>

      {test.tasks.map((unit) => (
        <UnitCard
          key={unit.id}
          unit={unit}
          instruction={KIND_HY[unit.kind]}
          value={answers[unit.id]}
          onChange={(v) => setAnswers((s) => ({ ...s, [unit.id]: v }))}
          revealed={() => finished}
          header={
            <p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">{unit.label}</p>
          }
        />
      ))}

      {!finished && (
        <Button variant="game" size="lg" className="w-full" onClick={() => setFinished(true)}>
          Ավարտել և տեսնել արդյունքը
        </Button>
      )}
    </div>
  );
}
