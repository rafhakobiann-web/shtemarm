import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Timer, BookOpen } from "lucide-react";
import { StudyTools } from "@/components/StudyTools";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/study-tools")({
  head: () => ({ meta: [
    { title: "Shtemarm · Ուսումնական գործիքներ" },
    { name: "description", content: "Կենտրոնացման ժամանակաչափ և անհատական ուսումնական գործիքներ։" },
  ] }),
  component: StudyToolsPage,
});

function StudyToolsPage() {
  const tx = useTx();
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />{tx("Գլխավոր էջ")}
      </Link>
      <header className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary"><Timer className="size-4" />{tx("Ուսումնական կենտրոն")}</span>
        <h1 className="text-3xl font-black sm:text-4xl">{tx("Կենտրոնացում և առաջընթաց")}</h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{tx("Օգտագործիր ժամանակաչափը, հետևիր պատասխաններիդ և միացրու կենտրոնացման ռեժիմը՝ ուսման ընթացքում շեղումները նվազեցնելու համար։")}</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/thematic" className="flex items-center gap-3 rounded-2xl border bg-card p-5 font-bold hover:border-primary/50">
          <BookOpen className="size-5 text-primary"/>{tx("Թեմատիկ և ամփոփիչ աշխատանքներ")}
        </Link>
        <Link to="/flashcards" className="flex items-center gap-3 rounded-2xl border bg-card p-5 font-bold hover:border-primary/50">
          <BookOpen className="size-5 text-primary"/>{tx("Հիշողության քարտեր")}
        </Link>
      </div>
      <StudyTools />
      <Link to="/" className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-bold transition-colors hover:bg-muted"><BookOpen className="size-4" />{tx("Ընտրել շտեմարան")}</Link>
    </div>
  );
}
