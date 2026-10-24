import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy } from "lucide-react";
import { ENGLISH_LEVELS, LEVEL_TEST_QUESTIONS, getLevel, selectLevelQuestions, type LevelQuestion } from "@/lib/levelTests";
import { Button } from "@/components/ui/button";
import { EnglishText, PassageTranslation } from "@/components/EnglishText";
import { Slider } from "@/components/ui/slider";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/level-test/$level")({
  head: ({ params }) => ({
    meta: [
      { title: `Անգլերենի ${params.level.toUpperCase()} թեստ · Shtemarm` },
      { name: "description", content: "Ստուգիր անգլերենի գիտելիքներդ A1–C1 մակարդակների ուսումնական թեստերով։" },
      { property: "og:title", content: `Shtemarm · Անգլերենի ${params.level.toUpperCase()} թեստ` },
      { property: "og:description", content: "Ընտրիր հարցերի քանակը և ստուգիր անգլերենի գիտելիքներդ։" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LevelTestRoute,
});

function LevelTestRoute() {
  const { level } = Route.useParams();
  return <LevelTestPage key={level} />;
}

function LevelTestPage() {
  const tx = useTx();
  const { level: levelParam } = Route.useParams();
  const levelId = levelParam.toLowerCase();
  const placement = levelId === "placement";
  const level = getLevel(levelId) ?? (placement ? { id: "placement", title: "A1–C1", subtitle: "Placement assessment", description: "Գտիր անգլերենի մոտավոր մակարդակդ" } : undefined);
  const bank = placement ? Object.values(LEVEL_TEST_QUESTIONS).flat() : LEVEL_TEST_QUESTIONS[levelId] ?? [];
  const [count, setCount] = useState(placement ? Math.min(20, bank.length) : bank.length);
  const [started, setStarted] = useState(false);
  const questions = useMemo(() => {
    if (!bank.length || count < 1 || count > bank.length) return [];
    if (!placement) return selectLevelQuestions(levelId, count);
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    // Spread the placement test across all five levels before filling remaining slots.
    const selected: LevelQuestion[] = [];
    const used = new Set<string>();
    for (const tier of ["a1", "a2", "b1", "b2", "c1"]) {
      const tierQuestions = (LEVEL_TEST_QUESTIONS[tier] ?? []).sort(() => Math.random() - 0.5);
      const item = tierQuestions.find((q) => !used.has(q.id));
      if (item && selected.length < count) { selected.push(item); used.add(item.id); }
    }
    for (const item of shuffled) if (selected.length < count && !used.has(item.id)) { selected.push(item); used.add(item.id); }
    return selected.sort(() => Math.random() - 0.5);
  }, [levelId, count, placement]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const correct = questions.filter((question) => answers[question.id] === question.answerIndex).length;
  const answeredCount = Object.keys(answers).length;

  if (!level || questions.length === 0) {
    return (
      <section className="mx-auto max-w-2xl space-y-4 rounded-3xl border bg-card p-6 text-center sm:p-10">
        <h1 className="text-2xl font-black">{tx("Այս մակարդակը դեռ հասանելի չէ")}</h1>
        <p className="text-muted-foreground">{tx("Ընտրիր առկա մակարդակներից մեկը։")}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {ENGLISH_LEVELS.map((item) => <Button key={item.id} asChild variant="outline"><Link to="/level-test/$level" params={{ level: item.id }}>{item.title}</Link></Button>)}
        </div>
        <Button asChild variant="ghost"><Link to="/">{tx("Վերադառնալ գլխավոր էջ")}</Link></Button>
      </section>
    );
  }

  const resetTest = () => {
    setAnswers({});
    setSubmitted(false);
    setStarted(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" /> {tx("Գլխավոր էջ")}</Link>
      <section className="bg-hero rounded-3xl p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">{placement ? "English placement assessment" : "English level practice"}</p>
            <h1 className="text-3xl font-black sm:text-4xl">{placement ? tx("Գտիր անգլերենի մակարդակդ") : tx("Մակարդակ {level}", { level: level.title })}</h1>
            <p className="text-sm opacity-90">{placement ? tx("Խառը հարցեր՝ A1-ից մինչև C1") : `${level.subtitle} · ${tx(level.description)}`}</p>
          </div>
          <div className="rounded-2xl bg-primary-foreground/15 px-4 py-3 text-center">
            <p className="text-2xl font-black">{questions.length}</p>
            <p className="text-xs opacity-85">{tx("հարց")}</p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm opacity-90">{placement ? tx("Պատասխանիր տարբեր բարդության հարցերին։ Արդյունքը կտա մոտավոր մակարդակ և ցույց կտա՝ որ հարցերն են դժվար եղել։") : tx("Ընտրիր յուրաքանչյուր հարցի մեկ պատասխան։ Ավարտելուց հետո կտեսնես արդյունքը և ճիշտ պատասխանների բացատրությունները։")}</p>
      </section>

      {!started && <section className="space-y-5 border-y py-6">
        <div className="flex items-center justify-between"><label htmlFor="level-count" className="font-semibold">{tx("Հարցերի քանակը")}</label><strong>{count} / {bank.length}</strong></div>
        <Slider id="level-count" aria-label={tx("Հարցերի քանակը")} min={1} max={bank.length} step={1} value={[count]} onValueChange={values => setCount(values[0] ?? bank.length)} />
        <Button size="lg" onClick={() => setStarted(true)}>{tx("Սկսել թեստը")}</Button>
      </section>}

      {started && <>
      {submitted && (
        <section className="rounded-3xl border bg-card p-5 shadow-card sm:p-6" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><Trophy className="size-6" /></span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black">{tx("Թեստի արդյունքը")}</h2>
              <p className="text-sm text-muted-foreground">{tx("Ճիշտ պատասխաններ՝ {correct} / {total}", { correct, total: questions.length })}</p>
            </div>
            <span className="text-2xl font-black text-primary">{Math.round((correct / questions.length) * 100)}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(correct / questions.length) * 100}%` }} /></div>
          <p className="mt-3 text-sm text-muted-foreground">{tx("Սա կարճ ուսումնական թեստ է, ոչ թե պաշտոնական մակարդակի հավաստագրում։")}</p>
          <Button className="mt-4" onClick={resetTest}><RotateCcw className="size-4" /> {tx("Կրկնել թեստը")}</Button>
        </section>
      )}

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{tx("Պատասխանված է՝ {answered} / {total}", { answered: answeredCount, total: questions.length })}</span>
        <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
      </div>
      <div className="-mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          return (
            <section key={question.id} className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-bold text-primary">{index + 1}</span>
                <div className="min-w-0 flex-1 space-y-2">
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{tx(skillLabel(question.skill))}</span>
                  {question.passage && <p className="whitespace-pre-line rounded-xl bg-muted/60 p-3 text-sm leading-relaxed"><EnglishText text={question.passage} /></p>}
                  {question.passage && <PassageTranslation text={question.passage} />}
                  <h2 className="text-base font-semibold leading-relaxed"><EnglishText text={question.prompt} /></h2>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = submitted && optionIndex === question.answerIndex;
                  const isWrongSelected = submitted && selected === optionIndex && optionIndex !== question.answerIndex;
                  return (
                    <div
                      key={`${question.id}-${optionIndex}`}
                      onClick={() => { if (!submitted) setAnswers((current) => ({ ...current, [question.id]: optionIndex })); }}
                      className={`flex min-h-12 items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${isCorrect ? "border-success bg-success/10" : isWrongSelected ? "border-destructive bg-destructive/10" : selected === optionIndex ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-accent/50"}`}
                    >
                      <Button variant="outline" size="icon" className="size-8 shrink-0" disabled={submitted} aria-label={tx("Հարց {n}, տարբերակ {letter}", { n: index + 1, letter: String.fromCharCode(65 + optionIndex) })} aria-pressed={selected === optionIndex}>{String.fromCharCode(65 + optionIndex)}</Button>
                      <span className="min-w-0 flex-1"><EnglishText text={option} context={`${question.prompt} ${option}`} /></span>
                      {isCorrect && <CheckCircle2 className="size-4 shrink-0 text-success" />}
                    </div>
                  );
                })}
              </div>
              {submitted && <p className="rounded-xl bg-muted/60 p-3 text-sm leading-relaxed"><strong>{selected === question.answerIndex ? <>{tx("Ճիշտ է։")} </> : <>{tx("Ճիշտ պատասխանը՝ {letter}.", { letter: String.fromCharCode(65 + question.answerIndex) })} <EnglishText text={question.options[question.answerIndex]} />. </>}</strong><EnglishText text={question.explanation} /></p>}
            </section>
          );
        })}
      </div>

      {!submitted ? (
        <section className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur">
          <p className="text-sm text-muted-foreground">{tx("Կարող ես ավարտել նաև չպատասխանած հարցերով։")}</p>
          <Button size="lg" onClick={() => setSubmitted(true)}>{tx("Ստուգել պատասխանները")} <CheckCircle2 className="size-4" /></Button>
        </section>
      ) : (
        <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/">Վերադառնալ գլխավոր էջ</Link></Button><Button onClick={resetTest}><RotateCcw className="size-4" /> {tx("Նորից անցնել")}</Button></div>
      )}
      </>}
    </div>
  );
}

function placementLevel(questions: LevelQuestion[], answers: Record<string, number>) {
  const byLevel = ["a1", "a2", "b1", "b2", "c1"] as const;
  let estimate = "A1";
  for (const tier of byLevel) {
    const tierQuestions = questions.filter((q) => q.id.startsWith(`${tier}-`));
    if (!tierQuestions.length) continue;
    const rate = tierQuestions.filter((q) => answers[q.id] === q.answerIndex).length / tierQuestions.length;
    if (rate >= 0.6) estimate = tier.toUpperCase();
  }
  return estimate;
}

function skillLabel(skill: string) {
  const labels: Record<string, string> = {
    grammar: "Grammar · Քերականություն",
    vocabulary: "Vocabulary · Բառապաշար",
    reading: "Reading · Ընթերցանություն",
    "use-of-english": "Use of English · Լեզվի կիրառում",
  };
  return labels[skill] ?? skill;
}
