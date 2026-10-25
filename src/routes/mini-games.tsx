import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Brain, CheckCircle2, Gamepad2, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mini-games")({ component: MiniGamesPage });

const QUESTIONS = [
  { q: "Որքա՞ն է 12 × 8։", choices: ["86", "96", "108", "88"], answer: "96", kind: "Մաթեմատիկա" },
  { q: "Ո՞րն է «համարձակ» բառի հականիշը։", choices: ["քաջ", "վճռական", "վախկոտ", "ուժեղ"], answer: "վախկոտ", kind: "Հայոց լեզու" },
  { q: "Եթե 3x = 27, ապա x = ?", choices: ["6", "9", "12", "24"], answer: "9", kind: "Մաթեմատիկա" },
  { q: "Choose the correct form: She ___ to school every day.", choices: ["go", "going", "goes", "gone"], answer: "goes", kind: "English" },
  { q: "Որքա՞ն է 15%-ը 200-ի։", choices: ["15", "20", "30", "35"], answer: "30", kind: "Մաթեմատիկա" },
  { q: "Ո՞րն է 15-ի և 25-ի ամենամեծ ընդհանուր բաժանարարը։", choices: ["5", "10", "15", "25"], answer: "5", kind: "Մաթեմատիկա" },
  { q: "Ո՞րն է «արագ» բառի հոմանիշը։", choices: ["դանդաղ", "շտապ", "հեռու", "հանգիստ"], answer: "շտապ", kind: "Հայոց լեզու" },
  { q: "Choose the correct sentence.", choices: ["He don't like tea.", "He doesn't like tea.", "He not likes tea.", "He isn't like tea."], answer: "He doesn't like tea.", kind: "English" },
  { q: "Ո՞ր օրգանն է արյունը մղում դեպի անոթներ։", choices: ["Թոքեր", "Սիրտ", "Լյարդ", "Երիկամ"], answer: "Սիրտ", kind: "Կենսաբանություն" },
  { q: "Հայոց պատմության ո՞ր արքան է հայտնի Արտաշեսյան հարստության հիմնադիր լինելու համար։", choices: ["Տիգրան Մեծ", "Արտաշես Ա", "Արշակ Բ", "Պապ"], answer: "Արտաշես Ա", kind: "Հայոց պատմություն" },
  { q: "Եթե x + 17 = 30, ապա x = ?", choices: ["11", "12", "13", "14"], answer: "13", kind: "Մաթեմատիկա" },
  { q: "Ո՞րն է գոյականի հարցերից մեկը։", choices: ["ինչպիսի՞", "ո՞վ", "ինչպե՞ս", "ե՞րբ"], answer: "ո՞վ", kind: "Հայոց լեզու" },
  { q: "What is the past tense of “teach”?", choices: ["teached", "taught", "teaching", "teaches"], answer: "taught", kind: "English" },
  { q: "Ո՞ր բջջային օրգանոիդն է հիմնականում արտադրում էներգիա։", choices: ["Ռիբոսոմ", "Միտոքոնդրիում", "Լիզոսոմ", "Կորիզակ"], answer: "Միտոքոնդրիում", kind: "Կենսաբանություն" },
  { q: "Ո՞ր քաղաքն էր Արտաշես Ա-ի հիմնադրած մայրաքաղաքը։", choices: ["Տիգրանակերտ", "Արտաշատ", "Դվին", "Վաղարշապատ"], answer: "Արտաշատ", kind: "Հայոց պատմություն" },
  { q: "Որքա՞ն է 7² − 5²։", choices: ["12", "24", "25", "49"], answer: "24", kind: "Մաթեմատիկա" },
  { q: "Ո՞ր նախադասությունն է հարցական։", choices: ["Գիրքը սեղանին է։", "Եկ այստեղ։", "Ե՞րբ ես գալու։", "Ինչ գեղեցիկ օր է։"], answer: "Ե՞րբ ես գալու։", kind: "Հայոց լեզու" },
  { q: "Choose the correct plural: one child, two ___.", choices: ["childs", "childes", "children", "childrens"], answer: "children", kind: "English" },
  { q: "Բույսերի բջջապատի հիմնական նյութը ո՞րն է։", choices: ["Օսլա", "Ցելյուլոզ", "Գլիկոգեն", "Կերատին"], answer: "Ցելյուլոզ", kind: "Կենսաբանություն" },
  { q: "Ո՞ր թվականին է տեղի ունեցել Ավարայրի ճակատամարտը։", choices: ["301", "405", "451", "484"], answer: "451", kind: "Հայոց պատմություն" },
  { q: "Լուծիր՝ 4x = 36։", choices: ["6", "8", "9", "12"], answer: "9", kind: "Մաթեմատիկա" },
  { q: "Ո՞րն է բայի անորոշ դերբայի օրինակ։", choices: ["գրում", "գրել", "գրեց", "գրող"], answer: "գրել", kind: "Հայոց լեզու" },
  { q: "Complete: I have lived here ___ 2020.", choices: ["for", "since", "during", "from"], answer: "since", kind: "English" },
  { q: "Ո՞ր նյութն է ժառանգական տեղեկության հիմնական կրողը։", choices: ["ԴՆԹ", "Ճարպ", "Օսլա", "Ջուր"], answer: "ԴՆԹ", kind: "Կենսաբանություն" },
  { q: "Ո՞ր արքայի օրոք ընդունվեց քրիստոնեությունը որպես պետական կրոն Հայաստանում։", choices: ["Տրդատ Գ", "Արտաշես Ա", "Լևոն Բ", "Սմբատ Ա"], answer: "Տրդատ Գ", kind: "Հայոց պատմություն" },
];

function MiniGamesPage() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = QUESTIONS[index];
  const restart = () => { setIndex(0); setPicked(null); setScore(0); setFinished(false); };
  const choose = (choice: string) => {
    if (picked !== null) return;
    setPicked(choice);
    if (choice === question.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (index === QUESTIONS.length - 1) setFinished(true);
    else { setIndex((i) => i + 1); setPicked(null); }
  };
  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4"/> Գլխավոր էջ</Link>
    <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/15 via-card to-violet-500/10 p-6 sm:p-10">
      <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Gamepad2 className="size-6"/></span><div><p className="text-sm font-bold text-primary">Սովորիր խաղալով</p><h1 className="text-3xl font-black sm:text-4xl">Մինի խաղեր</h1></div></div>
      <p className="mt-4 max-w-2xl text-muted-foreground">Կարճ հարցաշարեր՝ գիտելիքները կրկնելու, արագ մտածելու և միավորներ հավաքելու համար։</p>
    </section>
    <section className="mx-auto max-w-2xl rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
      {finished ? <div className="space-y-4 text-center"><CheckCircle2 className="mx-auto size-12 text-primary"/><h2 className="text-2xl font-black">Խաղն ավարտվեց։</h2><p className="text-muted-foreground">Քո արդյունքը՝ {score} / {QUESTIONS.length}</p><Button onClick={restart}><RotateCcw className="mr-2 size-4"/>Կրկին խաղալ</Button></div> : <>
        <div className="mb-6 flex items-center justify-between gap-3"><span className="rounded-full bg-muted px-3 py-1 text-sm font-bold">{question.kind}</span><span className="text-sm text-muted-foreground">{index + 1} / {QUESTIONS.length}</span></div>
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{width: ((index + 1) / QUESTIONS.length * 100) + "%"}}/></div>
        <h2 className="mb-6 text-xl font-bold leading-relaxed sm:text-2xl">{question.q}</h2>
        <div className="grid gap-3 sm:grid-cols-2">{question.choices.map((choice) => {
          const correct = picked !== null && choice === question.answer;
          const wrong = picked === choice && choice !== question.answer;
          return <button key={choice} type="button" onClick={() => choose(choice)} disabled={picked !== null} className={`min-h-14 rounded-2xl border p-4 text-left font-semibold transition hover:border-primary disabled:cursor-default ${correct ? "border-emerald-500 bg-emerald-500/10" : wrong ? "border-destructive bg-destructive/10" : "bg-background"}`}>{choice}</button>;
        })}</div>
        {picked !== null && <div className="mt-5 space-y-4"><p className="font-semibold">{picked === question.answer ? "Ճիշտ է։ Լավ աշխատանք։" : `Ճիշտ պատասխանն է՝ ${question.answer}`}</p><Button className="w-full" onClick={next}>{index === QUESTIONS.length - 1 ? "Տեսնել արդյունքը" : "Հաջորդ հարցը"}</Button></div>}
      </>}
    </section>
    <p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground"><Brain className="size-4"/><Sparkles className="size-4"/> Նոր խաղեր և թեմաներ կավելացվեն հաջորդ թարմացումներում։</p>
  </main>;
}
