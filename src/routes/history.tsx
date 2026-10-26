import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, BookOpen, ClipboardList, Settings2, Trophy } from "lucide-react";
import { HistoryExam } from "@/components/HistoryExam";
import { HistoryCustomExam } from "@/components/HistoryCustomExam";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/history")({
  validateSearch: z.object({
    test: z.coerce.number().int().min(1).max(4).optional().catch(undefined),
    custom: z.coerce.boolean().optional().catch(undefined),
  }),
  head: () => ({ meta: [
    { title: "Հայոց պատմություն · Քննություններ և թեստերի կազմիչ" },
    { name: "description", content: "Հայոց պատմության հարցաշարեր, 2026 թվականի քննական տարբերակներ և կարգավորվող փորձնական թեստեր երեք շտեմարաններից։" },
    { property: "og:title", content: "Հայոց պատմություն · Թեստեր" },
    { property: "og:type", content: "website" },
  ] }),
  component: HistoryPage,
});

const TESTS = [1, 2, 3, 4] as const;

function HistoryPage() {
  const tx = useTx();
  const { test, custom } = Route.useSearch();

  if (test || custom) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        <Button variant="outline" size="sm" asChild>
          <Link to="/history" search={{}}><ArrowLeft className="size-4" /> {tx("Բոլոր թեստերը")}</Link>
        </Button>
        {test ? <HistoryExam key={test} testId={test} /> : <HistoryCustomExam />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-amber-950 via-orange-900 to-amber-700 p-6 text-white sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-12 size-60 rounded-full border border-white/20" aria-hidden="true" />
        <div className="relative max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-xs font-bold"><BookOpen className="size-4" /> {tx("Հայոց պատմություն")}</span>
          <h1 className="text-3xl font-black sm:text-4xl">{tx("Պատրաստվիր քո ձևով")}</h1>
          <p className="text-sm leading-relaxed text-amber-50 sm:text-base">{tx("Ընտրիր 2026 թվականի պատրաստի թեստերից մեկը կամ կազմիր սեփական փորձնական քննություն՝ օգտագործելով երեք շտեմարանների հարցերը։")}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/history" search={{ custom: true }}><Settings2 className="size-4" />{tx("Կազմել անհատական թեստ")}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/history-book"><ClipboardList className="size-4" />{tx("Ուսումնասիրել շտեմարանը")}</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-black">{tx("Պատրաստի քննական տարբերակներ")}</h2>
          <p className="text-sm text-muted-foreground">{tx("2026 թ. առաջին փուլի չորս թեստերը, պատասխանների ստուգմամբ։")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TESTS.map((id) => (
            <Link key={id} to="/history" search={{ test: id }} className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 grid size-11 place-items-center rounded-xl bg-secondary text-primary"><Trophy className="size-5" /></div>
              <h3 className="font-bold">{tx("Թեստ {n}", { n: id })}</h3>
              <p className="text-xs text-muted-foreground">{tx("70 առաջադրանք · 80 միավոր")}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <a href="https://test.am/pdf.php?page=13" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">{tx("Քննությունների աղբյուր")}</a>
        <a href="https://test.am/pdf.php?page=110" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">{tx("Հայոց պատմության շտեմարաններ")}</a>
      </section>
    </div>
  );
}
