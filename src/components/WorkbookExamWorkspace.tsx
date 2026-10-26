import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Languages, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamHero, ExamBuilderTitle } from "@/components/ExamDesign";
import { HistorySession } from "@/components/HistorySession";
import { KIND_HY, type Unit } from "@/lib/books";
import { update } from "@/lib/progress";
import { loadWorkbookSources, makeWorkbookExam, workbookEntries, type WorkbookSubject } from "@/lib/workbook-exams";
import { useTx } from "@/lib/lang";

type Active = { units: Unit[]; title: string; minutes: number; practice: boolean; bookId: number };
const kindOrder: Unit["kind"][] = ["mc", "set", "seq", "match", "num"];
const field = "h-12 w-full min-w-0 rounded-xl border bg-background px-3 text-sm";

export function WorkbookExamWorkspace({
  subject, initialBook, initialSection, initialMode,
}: {
  subject: WorkbookSubject;
  initialBook?: number | undefined;
  initialSection?: number | undefined;
  initialMode?: "full" | "custom" | undefined;
}) {
  const tx = useTx();
  const english = subject === "english";
  const name = tx(english ? "Անգլերեն" : "Հայոց լեզու և գրականություն");
  const books = useQuery({
    queryKey: ["workbook-exams", subject],
    queryFn: () => loadWorkbookSources(subject),
    staleTime: Infinity,
  });
  const [source, setSource] = useState(initialBook && english && [1, 2, 3].includes(initialBook) ? String(initialBook) : "all");
  const [mode, setMode] = useState<"full" | "custom">(initialMode ?? "custom");
  const [sections, setSections] = useState<string[] | null>(initialSection ? null : []);
  const [kinds, setKinds] = useState<Unit["kind"][]>(kindOrder);
  const [count, setCount] = useState(20);
  const [minutes, setMinutes] = useState(0);
  const [random, setRandom] = useState(true);
  const [practice, setPractice] = useState(false);
  const [active, setActive] = useState<Active | null>(null);
  const [error, setError] = useState("");

  const allEntries = useMemo(() => workbookEntries(books.data ?? []), [books.data]);
  const scoped = useMemo(
    () => allEntries.filter((entry) => source === "all" || entry.source === "book-" + source),
    [allEntries, source],
  );
  const names = [...new Set(scoped.map((e) => e.section))];
  const initialSections = initialSection
    ? [...new Set(scoped
      .filter((entry) => entry.unit.id.startsWith("book-" + (english ? (initialBook ?? 1) : 41) + ":" + initialSection + ":"))
      .map((entry) => entry.section))]
    : [];
  const selectedSections = sections ?? initialSections;
  const availableKinds = kindOrder.filter((kind) => scoped.some((e) => e.unit.kind === kind));
  const pool = scoped.filter(
    (entry) => (!selectedSections.length || selectedSections.includes(entry.section)) && kinds.includes(entry.unit.kind),
  );
  const available = new Set(pool.map((entry) => entry.unit.id)).size;
  const validCustom = Number.isInteger(count) && count > 0 && count <= available;
  const validMinutes = Number.isInteger(minutes) && minutes >= 0 && minutes <= 300;
  const canStart = !books.isPending && !books.isError &&
    validMinutes && (mode === "full" || validCustom);

  function changeSource(value: string) {
    setSource(value);
    setSections([]);
    setKinds(kindOrder);
    setError("");
  }
  function start() {
    if (!canStart || !books.data) return;
    try {
      const result = makeWorkbookExam(books.data, subject, source, mode, pool, count, random);
      setActive({ units: result.units, title: name, bookId: result.bookId, minutes, practice });
      setError("");
      window.scrollTo(0, 0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : tx("Չհաջողվեց կազմել թեստը։"));
    }
  }
  if (active) {
    return (
      <HistorySession
        units={active.units}
        title={active.title}
        minutes={active.minutes}
        practice={active.practice}
        onExit={() => {
          setActive(null);
          window.scrollTo(0, 0);
        }}
        recordResult={(score, total) => update((p) => ({
          ...p,
          exams: [...p.exams, {
            date: new Date().toISOString(),
            book: active.bookId,
            score,
            total,
          }].slice(-50),
        }))}
      />
    );
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <ExamHero
        subject={name}
        title={tx("{name} · Քննությունների կազմիչ", { name })}
        description={tx("Կազմիր անհատական թեստ՝ ընտրելով շտեմարանները, բաժինները, առաջադրանքների տեսակները և ժամանակը։ Պատասխանները վերանայիր ավարտելուց հետո։")}
        sources={english ? tx("3 շտեմարան") : tx("1 հարցաշար")}
        available={allEntries.length || undefined}
        icon={english ? <Languages className="size-5" /> : <BookOpen className="size-5" />}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="min-w-0 space-y-6 rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
          <ExamBuilderTitle />
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ["custom", "Անհատական թեստ", "Ընտրիր քո ուզած հարցերը"],
              ["full", english ? "80 միավորի նմուշային քննություն" : "80 միավորի փորձնական թեստ", "Ըստ առկա շտեմարանի"],
            ] as const).map(([option, title, desc]) => (
              <button key={option} type="button"
                aria-pressed={mode === option}
                onClick={() => { setMode(option); setError(""); }}
                className={"rounded-2xl border-2 p-4 text-left transition-colors " +
                  (mode === option ? "border-primary bg-primary/5" : "border-border hover:bg-muted")}>
                <strong className="block">{tx(title)}</strong>
                <span className="mt-1 block text-xs text-muted-foreground">{tx(desc)}</span>
              </button>
            ))}
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-bold">{tx("Հարցերի աղբյուր")}</span>
            <select className={field} value={source} onChange={(e) => changeSource(e.target.value)}>
              <option value="all">{tx(english ? "Բոլոր երեք շտեմարանները" : "Հայոց լեզվի և գրականության հարցաշար")}</option>
              {english && [1, 2, 3].map((id) => (
                <option key={id} value={String(id)}>{tx("Շտեմարան {n}", { n: id })}</option>
              ))}
            </select>
          </label>
          {books.isPending ? (
            <p role="status" className="text-sm">{tx("Բեռնվում է…")}</p>
          ) : books.isError ? (
            <div role="alert" className="space-y-2 text-sm text-destructive">
              <p>{tx("Չհաջողվեց բեռնել շտեմարանները։")}</p>
              <Button size="sm" variant="outline" onClick={() => void books.refetch()}>
                <RefreshCw className="mr-2 size-4" /> {tx("Կրկին փորձել")}
              </Button>
            </div>
          ) : mode === "custom" ? (
            <>
              <fieldset className="space-y-3">
                <legend className="font-bold">{tx("Բաժիններ")}</legend>
                <p className="text-xs text-muted-foreground">{tx("Եթե ոչինչ չես ընտրել, ընդգրկվում են բոլոր բաժինները։")}</p>
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border p-3 sm:grid-cols-2">
                  {names.map((section) => (
                    <label key={section} className="flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm hover:bg-muted">
                      <input className="mt-1 size-4 shrink-0 accent-primary" type="checkbox"
                        checked={selectedSections.includes(section)}
                        onChange={(e) => setSections((old) =>
                          e.target.checked ? [...(old ?? selectedSections), section] : (old ?? selectedSections).filter((value) => value !== section))} />
                      <span>{section}</span>
                    </label>
                  ))}
                </div>
                {selectedSections.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => setSections([])}>{tx("Ընտրել բոլոր բաժինները")}</Button>
                )}
              </fieldset>
              <fieldset className="space-y-3">
                <legend className="font-bold">{tx("Առաջադրանքի տեսակները")}</legend>
                <div className="flex flex-wrap gap-2">
                  {availableKinds.map((kind) => (
                    <label key={kind} className="flex items-center gap-2 rounded-xl border p-3 text-sm">
                      <input className="size-4 accent-primary" type="checkbox" checked={kinds.includes(kind)}
                        onChange={(e) => setKinds((old) =>
                          e.target.checked ? [...old, kind] : old.filter((value) => value !== kind))} />
                      {tx(KIND_HY[kind])}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 40, 80].map((n) => (
                  <Button key={n} size="sm" variant={count === n ? "default" : "outline"}
                    disabled={n > available} onClick={() => setCount(n)}>
                    {tx("{n} հարց", { n })}
                  </Button>
                ))}
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-bold">{tx("Առաջադրանքների քանակ")}</span>
                <input className={field} type="number" min={1} max={available || 1}
                  value={count || ""} onChange={(e) => setCount(Number(e.target.value))} />
                <span className="block text-xs text-muted-foreground">{tx("Հասանելի է՝ {n}", { n: available })}</span>
              </label>
            </>
          ) : (
            <p className="rounded-2xl border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
              {tx(english
                ? "Պահպանվում է անգլերենի 13 բաժինների 80 միավորանոց նմուշային քննության կառուցվածքը։ Բոլոր գրքերը ընտրելիս յուրաքանչյուր քննությունը կազմվում է մեկ պատահական շտեմարանից։"
                : "80 միավորանոց փորձնական թեստ՝ հարցաշարի առկա առաջադրանքներից։ Սա հաստատված պաշտոնական քննական ձևաթուղթ չէ։")}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold">{tx("Ժամանակ · րոպե")}</span>
              <input className={field} type="number" min={0} max={300}
                value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
              <span className="block text-xs text-muted-foreground">{tx("0 = առանց ժամանակի սահմանափակման")}</span>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">{tx("Հերթականություն")}</span>
              <select className={field} value={random ? "random" : "ordered"}
                onChange={(e) => setRandom(e.target.value === "random")}>
                <option value="random">{tx("Պատահական")}</option>
                <option value="ordered">{tx("Գրքի հերթականությամբ")}</option>
              </select>
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-bold">{tx("Ռեժիմ")}</span>
            <select className={field} value={practice ? "practice" : "exam"}
              onChange={(e) => setPractice(e.target.value === "practice")}>
              <option value="exam">{tx("Քննություն · ստուգել վերջում")}</option>
              <option value="practice">{tx("Ուսուցում · ստուգել յուրաքանչյուր հարցը")}</option>
            </select>
          </label>
          {mode === "custom" && !validCustom && !books.isPending && (
            <p role="alert" className="text-sm text-destructive">
              {tx("Ընտրիր 1-ից {n} առաջադրանք կամ փոխիր ֆիլտրերը։", { n: available })}
            </p>
          )}
          {!validMinutes && <p role="alert" className="text-sm text-destructive">{tx("Ժամանակը պետք է լինի 0-ից 300 ամբողջ րոպե։")}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button className="h-12 w-full rounded-xl" disabled={!canStart} onClick={start}>
            {tx(mode === "custom" ? "Սկսել · {n} առաջադրանք" : "Սկսել նմուշային քննությունը", { n: count })}
          </Button>
        </section>
        <aside className="space-y-5">
          <section className="space-y-4 rounded-3xl border bg-card p-5">
            <h2 className="flex items-center gap-2 font-black"><GraduationCap className="size-5 text-primary" />{tx("Հասանելի գրքեր")}</h2>
            {(english ? [1, 2, 3] : [41]).map((id) => (
              <Link key={id} to="/book/$bookId" params={{ bookId: String(id) }}
                className="block rounded-xl border p-3 text-sm font-semibold hover:bg-muted">
                {tx(english ? "Շտեմարան {n}" : "Հայոց լեզու և գրականություն", { n: id })}
              </Link>
            ))}
          </section>
          <section className="rounded-3xl border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 font-black text-foreground">{tx("Ինչպես է աշխատում")}</h2>
            {tx("Քննության ընթացքում կարող ես փոխել պատասխանները մինչև վերջնական հանձնումը։ Ավարտելիս կտեսնես արդյունքները և կարող ես վերանայել բոլոր հարցերը։")}
          </section>
        </aside>
      </div>
    </div>
  );
}
