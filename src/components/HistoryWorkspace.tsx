import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamHero, ExamBuilderTitle } from "@/components/ExamDesign";
import { GtcGuidePanel } from "@/components/GtcGuidePanel";
import { HistorySession } from "@/components/HistorySession";
import { HistoryOfficialPapers } from "@/components/HistoryOfficialPapers";
import {
  loadHistoryBank,
  loadHistoryBooks,
  loadHistoryTests,
  selectHistoryUnits,
  type HistoryEntry,
} from "@/lib/history";
import { KIND_HY, type Unit } from "@/lib/books";
import { useHistoryProgress } from "@/lib/history-progress";
import { useTx } from "@/lib/lang";

const KINDS: Unit["kind"][] = ["mc", "set", "seq", "match", "num"];
const field = "h-12 w-full rounded-xl border bg-background px-3 text-sm";
type Session = { units: Unit[]; title: string; minutes: number; practice: boolean };

export function HistoryWorkspace({ initialTest }: { initialTest?: number | undefined }) {
  const tx = useTx();
  const bank = useQuery({
    queryKey: ["history-bank"],
    queryFn: loadHistoryBank,
    staleTime: Infinity,
  });
  const books = useQuery({
    queryKey: ["history-books-all"],
    queryFn: loadHistoryBooks,
    staleTime: Infinity,
  });
  const samples = useQuery({
    queryKey: ["history-tests"],
    queryFn: loadHistoryTests,
    staleTime: Infinity,
  });
  const { progress } = useHistoryProgress();
  const [source, setSource] = useState(initialTest ? `test-${initialTest}` : "books");
  const [sections, setSections] = useState<string[]>([]);
  const [kinds, setKinds] = useState<Unit["kind"][]>(KINDS);
  const [count, setCount] = useState(70);
  const [minutes, setMinutes] = useState(180);
  const [random, setRandom] = useState(!initialTest);
  const [practice, setPractice] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const entries = useMemo<HistoryEntry[]>(
    () =>
      source === "bank"
        ? (bank.data ?? [])
        : source === "books" || source.startsWith("book-")
          ? (books.data ?? []).filter((e) => source === "books" || e.source === source)
          : (samples.data?.tests ?? [])
              .filter((t) => source === "samples" || source === `test-${t.id}`)
              .flatMap((t) =>
                t.tasks.map((unit) => ({ unit, source: `test-${t.id}`, section: `Թեստ ${t.id}` })),
              ),
    [source, bank.data, books.data, samples.data],
  );
  const sectionNames = [...new Set(entries.map((e) => e.section))];
  const availableKinds = KINDS.filter((k) => entries.some((e) => e.unit.kind === k));
  const pool = entries.filter(
    (e) => (!sections.length || sections.includes(e.section)) && kinds.includes(e.unit.kind),
  );
  const available = new Set(pool.map((e) => e.unit.id)).size;
  const active = source === "bank" ? bank : source === "books" || source.startsWith("book-") ? books : samples;
  const loading = active.isPending;
  const failed = active.isError;
  const valid =
    !loading &&
    !failed &&
    Number.isInteger(count) &&
    count > 0 &&
    count <= available &&
    Number.isInteger(minutes) &&
    minutes >= 0 &&
    minutes <= 300;
  function changeSource(value: string) {
    setSource(value);
    setSections([]);
    setKinds(KINDS);
    setError("");
  }
  function start() {
    if (!valid) return;
    try {
      setSession({
        units: selectHistoryUnits(pool, count, random),
        title: tx("Հայոց պատմություն"),
        minutes,
        practice,
      });
      setError("");
      window.scrollTo(0, 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }
  if (session)
    return (
      <HistorySession
        {...session}
        onExit={() => {
          setSession(null);
          window.scrollTo(0, 0);
        }}
      />
    );
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <ExamHero
        subject={tx("Հայոց պատմություն")}
        title={tx("Հայոց պատմություն · Քննությունների կազմիչ")}
        description={tx("Ընտրիր շտեմարանները, բաժինները, առաջադրանքների քանակը, ժամանակն ու ռեժիմը։ Ավարտելուց հետո վերանայիր պատասխանները։")}
        sources={tx("3 շտեմարան · 4 նմուշ")}
        available={books.data?.length}
        icon={<BookOpen className="size-5" />}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section
          id="history-builder"
          className="min-w-0 space-y-6 rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
        >
          <ExamBuilderTitle />
          <label className="block space-y-2">
            <span className="text-sm font-bold">{tx("Հարցերի աղբյուր")}</span>
            <select className={field} value={source} onChange={(e) => changeSource(e.target.value)}>
              <option value="books">{tx("Բոլոր երեք շտեմարանները")}</option>
              {[1, 2, 3].map((n) => (
                <option key={n} value={`book-${n}`}>{tx("Գիրք {n}", { n })}</option>
              ))}
              <option value="bank">{tx("Առաջին գրքի ստուգված հարցաշար")}</option>
              <option value="samples">{tx("Բոլոր նմուշային թեստերը")}</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={`test-${n}`}>
                  {tx("Նմուշային թեստ {n}", { n })}
                </option>
              ))}
            </select>
          </label>
          {loading ? (
            <p role="status">{tx("Բեռնվում է…")}</p>
          ) : failed ? (
            <div role="alert" className="space-y-3 text-destructive">
              <p>{tx("Չհաջողվեց բեռնել հարցերը։")}</p>
              <Button
                variant="outline"
                onClick={() => void active.refetch()}
              >
                {tx("Կրկին փորձել")}
              </Button>
            </div>
          ) : (
            <>
              <fieldset className="space-y-3">
                <legend className="text-sm font-bold">{tx("Բաժիններ")}</legend>
                <p className="text-xs text-muted-foreground">
                  {tx("Եթե բաժին չես նշում, ընտրվում են բոլորը։")}
                </p>
                <div className="grid max-h-56 gap-2 overflow-y-auto rounded-xl border p-3 sm:grid-cols-2">
                  {sectionNames.map((s) => (
                    <label
                      key={s}
                      className="flex items-start gap-2 rounded-lg p-2 text-sm hover:bg-muted"
                    >
                      <input
                        className="mt-1 size-4 shrink-0 accent-primary"
                        type="checkbox"
                        checked={sections.includes(s)}
                        onChange={(e) =>
                          setSections((old) =>
                            e.target.checked ? [...old, s] : old.filter((x) => x !== s),
                          )
                        }
                      />
                      <span>{s.replace(/^\d+: /, "")}</span>
                    </label>
                  ))}
                </div>
                {sections.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSections([])}>
                    {tx("Ընտրել բոլոր բաժինները")}
                  </Button>
                )}
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-sm font-bold">{tx("Առաջադրանքի տեսակները")}</legend>
                <div className="flex flex-wrap gap-2">
                  {availableKinds.map((k) => (
                    <label
                      key={k}
                      className="flex items-center gap-2 rounded-xl border p-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={kinds.includes(k)}
                        onChange={(e) =>
                          setKinds((old) =>
                            e.target.checked ? [...old, k] : old.filter((x) => x !== k),
                          )
                        }
                      />
                      {tx(KIND_HY[k])}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <div className="flex flex-wrap gap-2">
            {[20, 40, 70].map((n) => (
              <Button key={n} size="sm" variant={count === n ? "default" : "outline"}
                disabled={n > available} onClick={() => setCount(n)}>
                {tx("{n} առաջադրանք", { n })}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold">{tx("Առաջադրանքների քանակ")}</span>
              <input
                className={field}
                type="number"
                min={1}
                max={available || 1}
                value={count || ""}
                onChange={(e) => setCount(Number(e.target.value))}
              />
              <span className="block text-xs text-muted-foreground">
                {tx("Հասանելի է՝ {n}", { n: available })}
              </span>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">{tx("Ժամանակ · րոպե")}</span>
              <input
                className={field}
                type="number"
                min={0}
                max={300}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
              <span className="block text-xs text-muted-foreground">
                {tx("0 = առանց ժամանակի սահմանափակման")}
              </span>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold">{tx("Ռեժիմ")}</span>
              <select
                className={field}
                value={practice ? "practice" : "exam"}
                onChange={(e) => setPractice(e.target.value === "practice")}
              >
                <option value="exam">{tx("Քննություն · ստուգել վերջում")}</option>
                <option value="practice">{tx("Ուսուցում · ստուգել յուրաքանչյուր հարցը")}</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">{tx("Հերթականություն")}</span>
              <select
                className={field}
                value={random ? "random" : "ordered"}
                onChange={(e) => setRandom(e.target.value === "random")}
              >
                <option value="random">{tx("Պատահական")}</option>
                <option value="ordered">{tx("Գրքի հերթականությամբ")}</option>
              </select>
            </label>
          </div>
          {!loading && !failed && (count < 1 || count > available || !Number.isInteger(count)) && (
            <p role="alert" className="text-sm text-destructive">
              {tx("Ընտրիր 1-ից {n} առաջադրանք կամ փոխիր ֆիլտրերը։", { n: available })}
            </p>
          )}
          {(minutes < 0 || minutes > 300 || !Number.isInteger(minutes)) && (
            <p role="alert" className="text-sm text-destructive">
              {tx("Ժամանակը պետք է լինի 0-ից 300 ամբողջ րոպե։")}
            </p>
          )}
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <Button size="lg" className="w-full" disabled={!valid} onClick={start}>
            {tx("Սկսել · {n} առաջադրանք", { n: count })}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {tx(
              "70 առաջադրանքն ու պաշտոնական 80 միավորը տարբեր բաներ են։ Շտեմարանի կամայական 70 հարցանոց տարբերակը չի հավաստում ԳԹԿ-ի 2027 թ. ճշգրիտ տեսակային կառուցվածքը։",
            )}
          </p>
        </section>
        <aside className="space-y-5">
          <GtcGuidePanel subject="history" />
          <section className="space-y-3 rounded-3xl border bg-card p-5">
            <h2 className="font-black">{tx("Նմուշային քննություններ")}</h2>
            <p className="text-sm text-muted-foreground">
              {tx("2026 · 1-ին փուլ · սկզբնական հերթականությամբ")}
            </p>
            {[1, 2, 3, 4].map((n) => (
              <Button
                key={n}
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  changeSource(`test-${n}`);
                  setCount(70);
                  setRandom(false);
                  setPractice(false);
                  document
                    .getElementById("history-builder")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {tx("Թեստ {n}", { n })}
                <span className="text-xs text-muted-foreground">{tx("70 առաջադրանք")}</span>
              </Button>
            ))}
          </section>
          <section className="space-y-3 rounded-3xl border bg-card p-5">
            <h2 className="font-black">{tx("Շտեմարաններ")}</h2>
            {[1, 2, 3].map((n) => (
              <Link
                key={n}
                className="block rounded-xl border p-3 text-sm font-semibold hover:bg-muted"
                to="/book/$bookId"
                params={{ bookId: String(20 + n) }}
              >
                {tx("Գիրք {n}", { n })}
              </Link>
            ))}
            <p className="text-xs text-muted-foreground">
              {tx("Կազմիչը ներառում է երեք գրքերի հասանելի հարցերն ու չորս առանձին նմուշային թեստերը։")}
            </p>
          </section>
          {progress.exams.length > 0 && (
            <section className="space-y-3 rounded-3xl border bg-card p-5">
              <h2 className="font-black">{tx("Վերջին արդյունքները")}</h2>
              {progress.exams.slice(0, 5).map((e, i) => (
                <div key={`${e.date}-${i}`} className="flex justify-between gap-2 text-sm">
                  <time dateTime={e.date}>{new Date(e.date).toLocaleDateString("hy-AM")}</time>
                  <strong>
                    {e.correct} / {e.total}
                  </strong>
                </div>
              ))}
            </section>
          )}
          <HistoryOfficialPapers />
        </aside>
      </div>
    </div>
  );
}
