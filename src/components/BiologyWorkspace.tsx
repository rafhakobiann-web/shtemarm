import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Dna } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamHero, ExamBuilderTitle } from "@/components/ExamDesign";
import { GtcGuidePanel } from "@/components/GtcGuidePanel";
import { HistorySession } from "@/components/HistorySession";
import { HistoryOfficialPapers } from "@/components/HistoryOfficialPapers";
import { KIND_HY, loadBook, type Unit } from "@/lib/books";
import { historyBookEntries, selectHistoryUnits, type HistoryEntry } from "@/lib/history";
import { update } from "@/lib/progress";
import { useTx } from "@/lib/lang";

const KINDS: Unit["kind"][] = ["mc", "set", "seq", "match", "num"];
const fieldClass = "h-12 w-full rounded-xl border bg-background px-3 text-sm";
type Attempt = { units: Unit[]; title: string; minutes: number; practice: boolean };

async function loadBiologyEntries(source: string): Promise<HistoryEntry[]> {
  // Only download the selected book on mobile. The all-books option loads both.
  const bookIds = /^book-[1-4]$/.test(source) ? [30 + Number(source.slice(-1))] : [31, 32, 33, 34];
  const books = await Promise.all(bookIds.map((id) => loadBook(id)));
  return books.flatMap((book,i) => historyBookEntries(book,bookIds[i]!-30));
}

/** Actual verified available book questions; test blueprint is independent from this pool. */
export function BiologyWorkspace({ initialBook, initialSection }: { initialBook?: number; initialSection?: number } = {}) {
  const tx = useTx();
  // Initialize the source BEFORE React Query accesses it. This avoids a
  // production-only ReferenceError (temporal dead zone) after minification.
  const [source, setSource] = useState(() => initialBook && initialBook >= 31 && initialBook <= 34
    ? `book-${initialBook - 30}` : "all");
  const data = useQuery({
    queryKey: ["biology-configurable-pool-v3", source],
    queryFn: () => loadBiologyEntries(source),
    staleTime: Infinity,
  });
  const [sections, setSections] = useState<string[]>([]);
  const [kinds, setKinds] = useState<Unit["kind"][]>(KINDS);
  const [count, setCount] = useState(70);
  const [minutes, setMinutes] = useState(180);
  const [random, setRandom] = useState(true);
  const [practice, setPractice] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState("");
  const entries = useMemo(
    () => data.data ?? [],
    [data.data],
  );
  // Preserve the printed section from the book card. The entry identity
  // includes its book number + section number; never derive a section only
  // from its display title, which can repeat across different books.
  useEffect(() => {
    if (!initialBook || !initialSection || source !== `book-${initialBook - 30}` || !data.data) return;
    const idPrefix = `book-${initialBook - 30}:${initialSection}:`;
    setSections([...new Set(data.data
      .filter((entry) => entry.unit.id.startsWith(idPrefix))
      .map((entry) => entry.section))]);
  }, [initialBook, initialSection, source, data.data]);
  const names = [...new Set(entries.map((entry) => entry.section))];
  const allowedKinds = KINDS.filter((kind) => entries.some((entry) => entry.unit.kind === kind));
  const available = entries.filter(
    (entry) => (!sections.length || sections.includes(entry.section)) && kinds.includes(entry.unit.kind),
  );
  const possible = new Set(available.map((entry) => entry.unit.id)).size;
  const valid = Number.isInteger(count) && count >= 1 && count <= possible
    && Number.isInteger(minutes) && minutes >= 0 && minutes <= 300;
  if (attempt) {
    return (
      <HistorySession
        {...attempt}
        onExit={() => setAttempt(null)}
        recordResult={(score, total) => {
          update((p) => ({
            ...p,
            exams: [...p.exams, {
              date: new Date().toISOString(),
              book: /^book-[1-4]$/.test(source) ? 30 + Number(source.slice(-1)) : 31,
              score,
              total,
            }].slice(-50),
          }));
        }}
      />
    );
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <ExamHero
        subject={tx("Կենսաբանություն")}
        title={tx("Կենսաբանություն · Քննությունների կազմիչ")}
        description={tx("Ընտրիր շտեմարանները, բաժինները, հարցերի քանակն ու տեսակները, ժամանակն ու ռեժիմը։ Ավարտելուց հետո վերանայիր պատասխանները։")}
        sources={tx("4 շտեմարան")}
        available={data.data?.length}
        icon={<Dna className="size-5" />}
      />
      <Link to="/book/$bookId" params={{ bookId: "33" }} className="group flex flex-col gap-3 rounded-3xl border border-primary/25 bg-primary/5 p-5 transition-colors hover:border-primary/50 hover:bg-primary/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="flex items-center gap-2 text-lg font-black"><BookOpen className="size-5 text-primary" />{tx("Բնօրինակ կենսաբանություն · մաս 3 և 4")}</h2>
          <p className="text-sm text-muted-foreground">{tx("1,688 բնօրինակ տեքստային հարց՝ պատասխաններով · թվայնացումը շարունակվում է")}</p>
        </div>
        <span className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">{tx("Սկսել վարժանքը")} →</span>
      </Link>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0 space-y-5 rounded-3xl border bg-card p-5 sm:p-7">
          <ExamBuilderTitle />
          <label className="block space-y-2">
            <span className="text-sm font-bold">{tx("Հարցերի աղբյուր")}</span>
            <select className={fieldClass} value={source} onChange={(e) => {
              setSource(e.target.value);
              setSections([]);
              setKinds(KINDS);
              setError("");
            }}>
              <option value="all">{tx("Բոլոր չորս շտեմարանները միասին")}</option>
              <option value="book-1">{tx("Շտեմարան 1")}</option>
              <option value="book-2">{tx("Շտեմարան 2")}</option>
              <option value="book-3">{tx("Շտեմարան 3 · լրացվում է")}</option>
              <option value="book-4">{tx("Շտեմարան 4 · լրացվում է")}</option>
            </select>
          </label>
          {data.isPending ? <p role="status">{tx("Հարցերը բեռնվում են…")}</p> : data.isError ? (
            <div role="alert" className="space-y-2 text-sm text-destructive">
              <p>{tx("Հարցերը չեն բեռնվել։")}</p>
              <Button variant="outline" onClick={() => void data.refetch()}>{tx("Կրկին փորձել")}</Button>
            </div>
          ) : (
            <>
              <fieldset className="space-y-2">
                <legend className="font-bold">{tx("Բաժիններ")}</legend>
                <p className="text-xs text-muted-foreground">{tx("Առանց ընտրության՝ բոլոր բաժինները։")}</p>
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border p-3 sm:grid-cols-2">
                  {names.map((name) => (
                    <label key={name} className="flex items-start gap-2 rounded-lg p-2 text-sm hover:bg-muted">
                      <input type="checkbox" className="mt-1 size-4 accent-primary" checked={sections.includes(name)}
                        onChange={(e) => setSections((old) => e.target.checked ? [...old, name] : old.filter((v) => v !== name))} />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
                {sections.length > 0 && <Button size="sm" variant="ghost" onClick={() => setSections([])}>{tx("Ընտրել բոլոր բաժինները")}</Button>}
              </fieldset>
              <fieldset className="space-y-2">
                <legend className="font-bold">{tx("Առաջադրանքի տեսակները")}</legend>
                <div className="flex flex-wrap gap-2">
                  {allowedKinds.map((kind) => (
                    <label key={kind} className="flex items-center gap-2 rounded-xl border p-3 text-sm">
                      <input type="checkbox" className="size-4 accent-primary" checked={kinds.includes(kind)}
                        onChange={(e) => setKinds((old) => e.target.checked ? [...old, kind] : old.filter((v) => v !== kind))} />
                      {tx(KIND_HY[kind])}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <div className="flex flex-wrap gap-2">
            {[20, 40, 70].map((n) => (
              <Button key={n} size="sm" variant={count === n ? "default" : "outline"} disabled={n > possible}
                onClick={() => setCount(n)}>{tx("{n} հարց", { n })}</Button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold">{tx("Առաջադրանքների քանակ")}</span>
              <input type="number" min={1} max={possible || 1} className={fieldClass}
                value={count || ""} onChange={(e) => setCount(Number(e.target.value))} />
              <span className="block text-xs text-muted-foreground">{tx("Հասանելի է՝ {n}", { n: possible })}</span>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">{tx("Ժամանակ · րոպե")}</span>
              <input type="number" min={0} max={300} className={fieldClass}
                value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
              <span className="block text-xs text-muted-foreground">{tx("0 = առանց ժամանակի սահմանափակման")}</span>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">{tx("Ռեժիմ")}</span>
              <select className={fieldClass} value={practice ? "practice" : "exam"}
                onChange={(e) => setPractice(e.target.value === "practice")}>
                <option value="exam">{tx("Քննություն · ստուգել վերջում")}</option>
                <option value="practice">{tx("Ուսուցում · ստուգել յուրաքանչյուր հարցը")}</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">{tx("Հերթականություն")}</span>
              <select className={fieldClass} value={random ? "random" : "ordered"}
                onChange={(e) => setRandom(e.target.value === "random")}>
                <option value="random">{tx("Պատահական")}</option>
                <option value="ordered">{tx("Գրքի հերթականությամբ")}</option>
              </select>
            </label>
          </div>
          {!data.isPending && !data.isError && !valid && (
            <p role="alert" className="text-sm text-destructive">{tx("Ընտրիր հասանելի հարցերի քանակ և 0–300 րոպե։")}</p>
          )}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button size="lg" className="w-full" disabled={data.isPending || data.isError || !valid}
            onClick={() => {
              if (!valid) return;
              try {
                setAttempt({ units: selectHistoryUnits(available, count, random), title: tx("Կենսաբանություն"), minutes, practice });
                setError("");
                window.scrollTo(0, 0);
              } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
            }}>
            {tx("Սկսել · {n} առաջադրանք", { n: count })}
          </Button>
          <p className="text-xs text-muted-foreground">{tx("ԳԹԿ-ի 2027 թ. թեստն ունի 70 առաջադրանք և 80 միավոր։ Շտեմարանի կամայական 70 հարցը կարող է չունենալ պաշտոնական կարճ պատասխաններն ու երկու պնդումների փնջերը։")}</p>
        </section>
        <aside className="space-y-5">
          <GtcGuidePanel subject="biology" />
          <HistoryOfficialPapers subject="biology" />
          <div className="space-y-3 rounded-3xl border bg-card p-5">
            <h2 className="flex items-center gap-2 font-black"><BookOpen className="size-4" />{tx("Կենսաբանության գրքեր")}</h2>
            {[1, 2, 3, 4].map((n) => (
              <Link key={n} to="/book/$bookId" params={{ bookId: String(30 + n) }}
                className="block rounded-xl border p-3 text-sm font-semibold hover:bg-muted">
                {tx("Շտեմարան {n} · բոլոր բաժինները", { n })}
              </Link>
            ))}
            <Link to="/biology/original" className="block rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10">
              {tx("3-րդ մաս · բնօրինակ տեքստային հարցեր")}
            </Link>
            <p className="text-xs text-muted-foreground">{tx("3-րդ և 4-րդ մասերի տեքստային հարցերը ստուգվում են տպագիր պատասխանների բանալիներով։ Նկար պահանջող և դեռ չստուգված բարդ առաջադրանքները չեն ներառվում թեստերում։")}</p>
            <a className="block text-xs font-semibold text-primary underline" href="https://test.am/pdf.php?page=111" target="_blank" rel="noopener noreferrer">
              {tx("ԳԹԿ-ի 4 մասերի արխիվ")}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

