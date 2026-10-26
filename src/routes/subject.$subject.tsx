import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Atom } from "lucide-react";
import { ExamHero, ExamBuilderTitle } from "@/components/ExamDesign";
import { GtcGuidePanel } from "@/components/GtcGuidePanel";
import { HistorySession } from "@/components/HistorySession";
import { loadBook, type Unit } from "@/lib/books";
import { historyBookEntries, selectHistoryUnits } from "@/lib/history";
import { GTC_BLUEPRINTS } from "@/lib/gtc-blueprints";
import { update } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";

const SUBJECTS = { physics: 51, chemistry: 52, geography: 53, russian: 54 } as const;
type SubjectId = keyof typeof SUBJECTS;
const field = "h-12 w-full rounded-xl border bg-background px-3 text-sm";
export const Route = createFileRoute("/subject/$subject")({
  beforeLoad: ({ params }) => { if (!(params.subject in SUBJECTS)) throw notFound(); },
  validateSearch: z.object({ section: z.coerce.number().int().positive().optional().catch(undefined) }),
  head: ({ params }) => ({ meta: [
    { title: (GTC_BLUEPRINTS[params.subject as SubjectId]?.name ?? "Առարկա") + " · Shtemarm" },
    { name: "description", content: "ԳԹԿ 2027 ուղեցույց և հեղինակային ուսումնական առաջադրանքներ" },
  ] }),
  component: SubjectPage,
});
function SubjectPage() {
  const tx = useTx();
  const { subject } = Route.useParams();
  const { section } = Route.useSearch();
  const s = subject as SubjectId;
  const bookId = SUBJECTS[s];
  const guide = GTC_BLUEPRINTS[s];
  const book = useQuery({ queryKey: ["starter", bookId], queryFn: () => loadBook(bookId), staleTime: Infinity });
  const entries = useMemo(() => book.data ? historyBookEntries(book.data, bookId) : [], [book.data, bookId]);
  const initialSections = section ? entries.filter(e => e.unit.id.startsWith("book-" + bookId + ":" + section + ":")).map(e => e.section) : [];
  const [selected, setSelected] = useState<string[] | null>(null);
  const [count, setCount] = useState(10);
  const [minutes, setMinutes] = useState(0);
  const [practice, setPractice] = useState(false);
  const [random, setRandom] = useState(true);
  const [active, setActive] = useState<Unit[] | null>(null);
  const [error, setError] = useState("");
  const sections = selected ?? initialSections;
  const names = [...new Set(entries.map(e => e.section))];
  const pool = entries.filter(e => !sections.length || sections.includes(e.section));
  const valid = Number.isInteger(count) && count > 0 && count <= pool.length
    && Number.isInteger(minutes) && minutes >= 0 && minutes <= 300;
  if (active) return <HistorySession units={active} title={guide.name} practice={practice} minutes={minutes}
    onExit={() => setActive(null)} recordResult={(score, total) =>
      update(p => ({ ...p, exams: [...p.exams,
        { book: bookId, score, total, date: new Date().toISOString() }].slice(-50) }))}/>;
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <ExamHero subject={guide.name} title={tx("{name} · Քննությունների պատրաստություն", { name: guide.name })}
        description={tx("ԳԹԿ-ի պաշտոնական կառուցվածքը և Shtemarm-ի հեղինակային ուսումնական հարցերը։ Պաշտոնական ամբողջական շտեմարանն առայժմ ներմուծված չէ։")}
        sources={tx("Ուսումնական հարցաշար")} available={entries.length || undefined}
        icon={<Atom className="size-5" />} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="space-y-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
          <ExamBuilderTitle />
          <p className="rounded-xl border bg-muted/40 p-4 text-sm">{tx("Սա հեղինակային ուսումնական հավաքածու է, ոչ ԳԹԿ-ի պաշտոնական քննության ամբողջական տարբերակ։")}</p>
          {book.isPending ? <p role="status">{tx("Բեռնվում է…")}</p> :
          book.isError ? <Button onClick={() => void book.refetch()}>{tx("Կրկին փորձել")}</Button> : (
            <fieldset className="space-y-2">
              <legend className="font-bold">{tx("Բաժիններ")}</legend>
              <p className="text-xs text-muted-foreground">{tx("Առանց ընտրության՝ բոլոր բաժինները։")}</p>
              <div className="grid max-h-60 gap-2 overflow-y-auto rounded-xl border p-3 sm:grid-cols-2">
                {names.map(name => <label key={name} className="flex items-start gap-2 rounded-lg p-2 text-sm">
                  <input type="checkbox" className="mt-1 size-4 accent-primary"
                    checked={sections.includes(name)} onChange={e => setSelected(old =>
                      e.target.checked ? [...(old ?? sections), name] : (old ?? sections).filter(v => v !== name))}/>
                  <span>{name.replace(/^Գիրք \d+ · /, "")}</span>
                </label>)}
              </div>
              {sections.length > 0 && <Button size="sm" variant="ghost" onClick={() => setSelected([])}>{tx("Ընտրել բոլորը")}</Button>}
            </fieldset>
          )}
          <div className="flex flex-wrap gap-2">
            {[5,10,12].map(n => <Button key={n} size="sm" disabled={n > pool.length}
              variant={count === n ? "default" : "outline"} onClick={() => setCount(n)}>{tx("{n} հարց", { n })}</Button>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2"><span className="text-sm font-bold">{tx("Հարցերի քանակ")}</span>
              <input className={field} type="number" min={1} max={pool.length || 1} value={count || ""}
                onChange={e => setCount(Number(e.target.value))} /></label>
            <label className="space-y-2"><span className="text-sm font-bold">{tx("Ժամանակ · րոպե")}</span>
              <input className={field} type="number" min={0} max={300} value={minutes}
                onChange={e => setMinutes(Number(e.target.value))} /></label>
            <label className="space-y-2"><span className="text-sm font-bold">{tx("Ռեժիմ")}</span>
              <select className={field} value={practice ? "practice" : "exam"}
                onChange={e => setPractice(e.target.value === "practice")}>
                <option value="exam">{tx("Թեստ · ստուգել վերջում")}</option>
                <option value="practice">{tx("Ուսուցում · ստուգել յուրաքանչյուր հարցը")}</option></select></label>
            <label className="space-y-2"><span className="text-sm font-bold">{tx("Հերթականություն")}</span>
              <select className={field} value={random ? "random" : "ordered"}
                onChange={e => setRandom(e.target.value === "random")}>
                <option value="random">{tx("Պատահական")}</option>
                <option value="ordered">{tx("Գրքի հերթականությամբ")}</option></select></label>
          </div>
          {error && <p role="alert" className="text-destructive">{error}</p>}
          <Button className="h-12 w-full" disabled={!valid || book.isPending || book.isError}
            onClick={() => { try {setActive(selectHistoryUnits(pool,count,random)); setError("");}
              catch(e){setError(e instanceof Error?e.message:String(e));} }}>
            {tx("Սկսել · {n} առաջադրանք", { n: count })}
          </Button>
        </section>
        <aside className="space-y-4">
          <GtcGuidePanel subject={s} />
          <section className="space-y-3 rounded-3xl border bg-card p-5">
            <h2 className="font-black">{tx("Ուսումնական հարցաշար")}</h2>
            <Link to="/book/$bookId" params={{ bookId: String(bookId) }}
              className="flex items-center gap-2 rounded-xl border p-3 text-sm hover:bg-muted">
              <BookOpen className="size-4" /> {tx("Բացել հարցերը")}
            </Link>
            <a className="text-sm text-primary underline" href="https://test.am/" target="_blank" rel="noopener noreferrer">
              {tx("ԳԹԿ-ի շտեմարանների աղբյուր")}
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}