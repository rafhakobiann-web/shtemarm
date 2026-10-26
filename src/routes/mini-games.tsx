import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Brain, Gamepad2, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mini-games")({ component: MiniGamesPage });

type Subject = "Մաթեմատիկա" | "Հայոց լեզու" | "English" | "Հայոց պատմություն";
type Question = { q: string; choices: string[]; answer: string; kind: Subject; explanation: string };

const QUESTIONS: Question[] = [
  { q: "Որքա՞ն է 12 × 8։", choices: ["86", "96", "108", "88"], answer: "96", kind: "Մաթեմատիկա", explanation: "12 × 8 = 96։" },
  { q: "Եթե 3x = 27, ապա x = ?", choices: ["6", "9", "12", "24"], answer: "9", kind: "Մաթեմատիկա", explanation: "Երկու կողմն էլ բաժանում ենք 3-ի՝ x = 9։" },
  { q: "Որքա՞ն է 200-ի 15%-ը։", choices: ["15", "20", "30", "35"], answer: "30", kind: "Մաթեմատիկա", explanation: "200 × 0.15 = 30։" },
  { q: "Որքա՞ն է 7² − 5²։", choices: ["12", "24", "14", "2"], answer: "24", kind: "Մաթեմատիկա", explanation: "49 − 25 = 24։" },
  { q: "Լուծի՛ր՝ 2x + 6 = 18։", choices: ["x = 5", "x = 6", "x = 12", "x = 9"], answer: "x = 6", kind: "Մաթեմատիկա", explanation: "2x = 12, հետևաբար x = 6։" },
  { q: "Որքա՞ն է 3/4 + 1/4։", choices: ["1/2", "1", "4/8", "3/8"], answer: "1", kind: "Մաթեմատիկա", explanation: "Հայտարարները նույնն են՝ (3 + 1)/4 = 1։" },
  { q: "Ուղղանկյան երկարությունը 8 սմ է, լայնությունը՝ 3 սմ։ Որքա՞ն է պարագիծը։", choices: ["11 սմ", "22 սմ", "24 սմ", "16 սմ"], answer: "22 սմ", kind: "Մաթեմատիկա", explanation: "P = 2(8 + 3) = 22 սմ։" },
  { q: "Որքա՞ն է 0.6-ը տոկոսներով։", choices: ["6%", "60%", "0.6%", "600%"], answer: "60%", kind: "Մաթեմատիկա", explanation: "0.6 × 100% = 60%։" },
  { q: "Ո՞ր բառն է «համարձակ» բառի հականիշը։", choices: ["քաջ", "վճռական", "վախկոտ", "ուժեղ"], answer: "վախկոտ", kind: "Հայոց լեզու", explanation: "«Վախկոտ»-ը հակառակ իմաստն ունի «համարձակ» բառին։" },
  { q: "Ո՞րն է գոյականը։", choices: ["արագ", "վազել", "գեղեցկություն", "կարդալ"], answer: "գեղեցկություն", kind: "Հայոց լեզու", explanation: "«Գեղեցկություն»-ը առարկա կամ հասկացություն անվանող գոյական է։" },
  { q: "Ո՞ր բառն է ածական։", choices: ["կանաչ", "գիրք", "վազել", "երեկ"], answer: "կանաչ", kind: "Հայոց լեզու", explanation: "Ածականը ցույց է տալիս առարկայի հատկանիշը։" },
  { q: "Ո՞ր տարբերակում է գրված հոմանիշների զույգ։", choices: ["մեծ — փոքր", "ուրախ — զվարթ", "լույս — մութ", "բարձր — ցածր"], answer: "ուրախ — զվարթ", kind: "Հայոց լեզու", explanation: "«Ուրախ» և «զվարթ» բառերը մոտ իմաստներ ունեն։" },
  { q: "Ո՞րն է բայի անորոշ դերբայը։", choices: ["գրում", "գրեց", "գրել", "գրած"], answer: "գրել", kind: "Հայոց լեզու", explanation: "Անորոշ դերբայը սովորաբար կազմվում է -ել կամ -ալ վերջավորությամբ։" },
  { q: "Ո՞ր բառի մեջ կա երկհնչյուն։", choices: ["լույս", "տուն", "գիրք", "մայր"], answer: "լույս", kind: "Հայոց լեզու", explanation: "«Լույս» բառում ույ-ն երկհնչյուն է։" },
  { q: "Ո՞րն է բարդ բառը։", choices: ["ծաղիկ", "արևածաղիկ", "սպիտակ", "գեղեցիկ"], answer: "արևածաղիկ", kind: "Հայոց լեզու", explanation: "«Արևածաղիկ»-ը կազմված է երկու արմատից՝ արև + ծաղիկ։" },
  { q: "Ո՞ր կետադրական նշանն է դրվում հարցական նախադասության վերջում հայերենում։", choices: ["։", "՞", "՝", "՜"], answer: "՞", kind: "Հայոց լեզու", explanation: "Հայերենում հարցական նշանը դրվում է հարցական հնչերանգ կրող բառի վրա։" },
  { q: "Choose the correct form: She ___ to school every day.", choices: ["go", "going", "goes", "gone"], answer: "goes", kind: "English", explanation: "In the present simple, he/she/it takes -s or -es." },
  { q: "What is the past tense of “buy”?", choices: ["buyed", "bought", "buying", "buys"], answer: "bought", kind: "English", explanation: "“Buy” is irregular: buy — bought — bought." },
  { q: "Choose the correct article: I saw ___ elephant.", choices: ["a", "an", "the", "no article"], answer: "an", kind: "English", explanation: "Use “an” before a vowel sound." },
  { q: "Which word is closest in meaning to “rapid”?", choices: ["slow", "quick", "quiet", "weak"], answer: "quick", kind: "English", explanation: "“Rapid” means fast or quick." },
  { q: "Complete: If I ___ more time, I would learn French.", choices: ["have", "had", "will have", "am having"], answer: "had", kind: "English", explanation: "The second conditional uses if + past simple, would + base verb." },
  { q: "Choose the plural of “child”.", choices: ["childs", "childes", "children", "childrens"], answer: "children", kind: "English", explanation: "“Children” is the irregular plural of “child”." },
  { q: "Which sentence is grammatically correct?", choices: ["He don't like tea.", "He doesn't likes tea.", "He doesn't like tea.", "He not like tea."], answer: "He doesn't like tea.", kind: "English", explanation: "After “doesn't”, use the base form “like”." },
  { q: "What does “generous” mean?", choices: ["willing to give and share", "often late", "easily frightened", "very noisy"], answer: "willing to give and share", kind: "English", explanation: "A generous person is willing to give or share with others." },
  { q: "Ո՞ր թվականին է տեղի ունեցել Ավարայրի ճակատամարտը։", choices: ["301 թ.", "405 թ.", "451 թ.", "484 թ."], answer: "451 թ.", kind: "Հայոց պատմություն", explanation: "Ավարայրի ճակատամարտը տեղի է ունեցել 451 թվականին։" },
  { q: "Ո՞վ է հայոց այբուբենի ստեղծողը։", choices: ["Մովսես Խորենացի", "Մեսրոպ Մաշտոց", "Գրիգոր Լուսավորիչ", "Անանիա Շիրակացի"], answer: "Մեսրոպ Մաշտոց", kind: "Հայոց պատմություն", explanation: "Հայոց այբուբենը ստեղծել է Մեսրոպ Մաշտոցը՝ 405 թվականին։" },
  { q: "Ո՞ր թվականին է Հայաստանը հռչակվել առաջին հանրապետություն։", choices: ["1915 թ.", "1918 թ.", "1920 թ.", "1991 թ."], answer: "1918 թ.", kind: "Հայոց պատմություն", explanation: "Հայաստանի Առաջին Հանրապետությունը հռչակվել է 1918 թվականի մայիսի 28-ին։" },
  { q: "Ո՞ր արքան է ավանդաբար կապվում քրիստոնեությունը պետական կրոն հռչակելու հետ։", choices: ["Տիգրան Մեծ", "Արտաշես Ա", "Տրդատ Գ", "Արգիշտի Ա"], answer: "Տրդատ Գ", kind: "Հայոց պատմություն", explanation: "Տրդատ Գ-ի օրոք՝ 301 թվականին, քրիստոնեությունն ընդունվեց որպես պետական կրոն։" },
  { q: "Ո՞ր քաղաքն էր Արտաշեսյան Հայաստանի մայրաքաղաքը՝ Տիգրան Մեծի օրոք։", choices: ["Արտաշատ", "Տիգրանակերտ", "Վան", "Դվին"], answer: "Տիգրանակերտ", kind: "Հայոց պատմություն", explanation: "Տիգրան Մեծը հիմնադրեց Տիգրանակերտ քաղաքը և այն դարձրեց մայրաքաղաք։" },
  { q: "Ո՞վ էր «Հայոց պատմություն» աշխատության հեղինակը՝ ավանդաբար կոչված Հայոց պատմահայր։", choices: ["Փավստոս Բուզանդ", "Ագաթանգեղոս", "Մովսես Խորենացի", "Եղիշե"], answer: "Մովսես Խորենացի", kind: "Հայոց պատմություն", explanation: "Մովսես Խորենացին հայտնի է որպես Հայոց պատմահայր։" },
  { q: "Ո՞ր թվականին է տեղի ունեցել Սարդարապատի ճակատամարտը։", choices: ["1905 թ.", "1918 թ.", "1921 թ.", "1945 թ."], answer: "1918 թ.", kind: "Հայոց պատմություն", explanation: "Սարդարապատի ճակատամարտը տեղի է ունեցել 1918 թվականի մայիսին։" },
  { q: "Հայաստանի ներկայիս անկախության հանրաքվեն տեղի է ունեցել ո՞ր թվականին։", choices: ["1988 թ.", "1990 թ.", "1991 թ.", "1995 թ."], answer: "1991 թ.", kind: "Հայոց պատմություն", explanation: "Անկախության հանրաքվեն անցկացվել է 1991 թվականի սեպտեմբերի 21-ին։" }
];

const SUBJECTS = ["Բոլոր առարկաները", "Մաթեմատիկա", "Հայոց լեզու", "English", "Հայոց պատմություն"] as const;
const LENGTHS = [5, 10, 15, 30] as const;

function shuffled<T,>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function MiniGamesPage() {
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("Բոլոր առարկաները");
  const [roundLength, setRoundLength] = useState<number>(10);
  const [round, setRound] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ question: Question; picked: string; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const available = useMemo(
    () => subject === "Բոլոր առարկաները" ? QUESTIONS : QUESTIONS.filter((q) => q.kind === subject),
    [subject]
  );
  const question = round?.[index];
  const score = answers.filter((a) => a.correct).length;
  const streak = useMemo(() => {
    let current = 0;
    for (const answer of answers) current = answer.correct ? current + 1 : 0;
    return current;
  }, [answers]);

  const startGame = () => {
    const nextRound = shuffled(available).slice(0, Math.min(roundLength, available.length));
    setRound(nextRound);
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setFinished(false);
  };
  const restart = () => {
    setRound(null);
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setFinished(false);
  };
  const choose = (choice: string) => {
    if (!question || picked !== null) return;
    const correct = choice === question.answer;
    setPicked(choice);
    setAnswers((previous) => [...previous, { question, picked: choice, correct }]);
  };
  const next = () => {
    if (!round) return;
    if (index === round.length - 1) setFinished(true);
    else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Գլխավոր էջ</Link>
    <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/15 via-card to-violet-500/10 p-6 sm:p-10">
      <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Gamepad2 className="size-6" /></span><div><p className="text-sm font-bold text-primary">Սովորիր խաղալով</p><h1 className="text-3xl font-black sm:text-4xl">Մինի խաղեր</h1></div></div>
      <p className="mt-4 max-w-2xl text-muted-foreground">Խաղա տարբեր առարկաներից, ընտրիր հարցերի քանակը և ստացիր անմիջական բացատրություն յուրաքանչյուր պատասխանի համար։</p>
      <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
        <span className="rounded-full border bg-background/70 px-3 py-1.5">32 հարց</span>
        <span className="rounded-full border bg-background/70 px-3 py-1.5">4 առարկա</span>
        <span className="rounded-full border bg-background/70 px-3 py-1.5">Պատահական հերթականություն</span>
      </div>
    </section>

    {!round && <section className="mx-auto max-w-2xl space-y-6 rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
      <div><h2 className="text-2xl font-black">Ընտրի՛ր խաղը</h2><p className="mt-2 text-sm text-muted-foreground">Յուրաքանչյուր նոր խաղում հարցերի հերթականությունը փոխվում է։</p></div>
      <label className="block space-y-2"><span className="text-sm font-bold">Առարկա</span><select value={subject} onChange={(e) => setSubject(e.target.value as (typeof SUBJECTS)[number])} className="min-h-12 w-full rounded-xl border bg-background px-3 py-2 text-sm"><option value="Բոլոր առարկաները">Բոլոր առարկաները</option><option value="Մաթեմատիկա">Մաթեմատիկա</option><option value="Հայոց լեզու">Հայոց լեզու</option><option value="English">English</option><option value="Հայոց պատմություն">Հայոց պատմություն</option></select></label>
      <div className="space-y-2"><span className="text-sm font-bold">Հարցերի քանակը</span><div className="grid grid-cols-4 gap-2">{LENGTHS.map((length) => <button key={length} type="button" onClick={() => setRoundLength(length)} className={"min-h-12 rounded-xl border font-bold transition " + (roundLength === length ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary")}>{length}</button>)}</div><p className="text-xs text-muted-foreground">Ընտրված առարկայում հասանելի է {available.length} հարց։ Խաղը կներառի մինչև {Math.min(roundLength, available.length)} հարց։</p></div>
      <Button className="w-full" onClick={startGame}><Gamepad2 className="mr-2 size-4" /> Սկսել խաղը</Button>
    </section>}

    {round && finished && <section className="mx-auto max-w-2xl space-y-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
      <div className="text-center"><Trophy className="mx-auto size-12 text-primary" /><h2 className="mt-3 text-2xl font-black">Խաղն ավարտվեց։</h2><p className="mt-2 text-muted-foreground">Քո արդյունքը</p><p className="mt-1 text-4xl font-black">{score} / {round.length}</p><p className="mt-2 text-sm font-semibold">{Math.round((score / round.length) * 100)}% ճիշտ պատասխաններ</p></div>
      <div className="rounded-2xl bg-muted/60 p-4"><p className="font-bold">Արդյունքի գնահատում</p><p className="mt-1 text-sm text-muted-foreground">{score === round.length ? "Գերազանց է․ բոլոր պատասխանները ճիշտ են։" : score / round.length >= 0.7 ? "Լավ արդյունք է․ կրկնիր բաց թողած հարցերը և փորձիր նորից։" : "Շարունակի՛ր մարզվել․ սխալ պատասխանների բացատրությունները կօգնեն քեզ։"}</p></div>
      <div className="space-y-3"><h3 className="text-lg font-black">Պատասխանների ամփոփում</h3>{answers.map((item, i) => <div key={i} className="rounded-2xl border p-4"><div className="flex items-start gap-2"><span className={"mt-0.5 grid size-6 shrink-0 place-items-center rounded-full " + (item.correct ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/10 text-destructive")}>{item.correct ? "✓" : "×"}</span><div className="min-w-0"><p className="font-semibold">{item.question.q}</p><p className="mt-1 text-sm text-muted-foreground">Քո պատասխանը՝ {item.picked}</p>{!item.correct && <p className="text-sm font-semibold">Ճիշտ պատասխան՝ {item.question.answer}</p>}<p className="mt-2 text-sm">{item.question.explanation}</p></div></div></div>)}</div>
      <div className="grid gap-3 sm:grid-cols-2"><Button onClick={startGame}><RotateCcw className="mr-2 size-4" /> Նոր խաղ</Button><Button variant="outline" onClick={restart}>Փոխել կարգավորումները</Button></div>
    </section>}

    {round && !finished && question && <section className="mx-auto max-w-2xl rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-muted px-3 py-1 text-sm font-bold">{question.kind}</span><span className="text-sm text-muted-foreground">Հարց {index + 1} / {round.length}</span><span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">Միավորներ՝ {score}</span></div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: (((index + 1) / round.length) * 100) + "%" }} /></div>
      <h2 className="mb-6 text-xl font-bold leading-relaxed sm:text-2xl">{question.q}</h2>
      <div className="grid gap-3 sm:grid-cols-2">{question.choices.map((choice) => {
        const correct = picked !== null && choice === question.answer;
        const wrong = picked === choice && choice !== question.answer;
        return <button key={choice} type="button" onClick={() => choose(choice)} disabled={picked !== null} className={"min-h-14 rounded-2xl border p-4 text-left font-semibold transition disabled:cursor-default " + (correct ? "border-emerald-500 bg-emerald-500/10" : wrong ? "border-destructive bg-destructive/10" : "bg-background hover:border-primary")}>{choice}</button>;
      })}</div>
      {picked !== null && <div className="mt-5 space-y-4 rounded-2xl bg-muted/50 p-4"><p className="font-bold">{picked === question.answer ? "Ճիշտ է։ Լավ աշխատանք։" : "Այս անգամ ճիշտ չէ։"}</p>{picked !== question.answer && <p className="text-sm">Ճիշտ պատասխանն է՝ <strong>{question.answer}</strong></p>}<p className="text-sm text-muted-foreground">{question.explanation}</p><Button className="w-full" onClick={next}>{index === round.length - 1 ? "Տեսնել արդյունքը" : "Հաջորդ հարցը"}</Button></div>}
    </section>}

    <p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground"><Brain className="size-4" /><Sparkles className="size-4" /> Յուրաքանչյուր խաղից հետո կարող ես վերանայել պատասխանները և անմիջապես սկսել նորը։</p>
  </main>;
}
