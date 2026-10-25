import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Brain, CheckCircle2, Gamepad2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/mini-games")({ component: MiniGamesPage });

type Question = { q: string; choices: string[]; answer: string; kind: string };
const QUESTIONS: Question[] = [
  { q: "Որքա՞ն է 12 × 8։", choices: ["86", "96", "108", "88"], answer: "96", kind: "Մաթեմատիկա" },
  { q: "Ո՞րն է «համարձակ» բառի հականիշը։", choices: ["քաջ", "վճռական", "վախկոտ", "ուժեղ"], answer: "վախկոտ", kind: "Հայոց լեզու" },
  { q: "Եթե 3x = 27, ապա x = ?", choices: ["6", "9", "12", "24"], answer: "9", kind: "Մաթեմատիկա" },
  { q: "Choose the correct form: She ___ to school every day.", choices: ["go", "going", "goes", "gone"], answer: "goes", kind: "English" },
  { q: "Որքա՞ն է 15%-ը 200-ի։", choices: ["15", "20", "30", "35"], answer: "30", kind: "Մաթեմատիկա" },
  { q: "Ո՞րն է ջրի քիմիական բանաձևը։", choices: ["CO₂", "H₂O", "O₂", "NaCl"], answer: "H₂O", kind: "Բնագիտություն" },
  { q: "Ո՞ր մոլորակն է հայտնի որպես Կարմիր մոլորակ։", choices: ["Վեներա", "Մարս", "Յուպիտեր", "Սատուրն"], answer: "Մարս", kind: "Բնագիտություն" },
  { q: "What is the past tense of “write”?", choices: ["writed", "written", "wrote", "writing"], answer: "wrote", kind: "English" },
  { q: "Ո՞ր դարում է տեղի ունեցել Վարդանանց պատերազմը։", choices: ["IV", "V", "VI", "VII"], answer: "V", kind: "Հայոց պատմություն" },
  { q: "Որքա՞ն է 7²։", choices: ["14", "42", "49", "56"], answer: "49", kind: "Մաթեմատիկա" },
  { q: "Ո՞ր օրգանն է մղում արյունը մարդու մարմնում։", choices: ["Թոքերը", "Սիրտը", "Լյարդը", "Երիկամը"], answer: "Սիրտը", kind: "Կենսաբանություն" },
  { q: "Ո՞րն է «լուսավոր» բառի հոմանիշը։", choices: ["մութ", "պայծառ", "խոնավ", "ցուրտ"], answer: "պայծառ", kind: "Հայոց լեզու" },
  { q: "If I ___ more time, I would learn another language.", choices: ["have", "had", "will have", "am having"], answer: "had", kind: "English" },
  { q: "Լուծի՛ր՝ 4x + 3 = 19։", choices: ["3", "4", "5", "6"], answer: "4", kind: "Մաթեմատիկա" },
  { q: "Ո՞ր գազն են բույսերը կլանում ֆոտոսինթեզի ժամանակ։", choices: ["Թթվածին", "Ազոտ", "Ածխաթթու գազ", "Ջրածին"], answer: "Ածխաթթու գազ", kind: "Կենսաբանություն" },
  { q: "Ո՞րն է Հայաստանի մայրաքաղաքը։", choices: ["Գյումրի", "Վանաձոր", "Երևան", "Կապան"], answer: "Երևան", kind: "Հայոց պատմություն" },
  { q: "Որքա՞ն է 3/4-ը տոկոսով։", choices: ["25%", "50%", "75%", "80%"], answer: "75%", kind: "Մաթեմատիկա" },
  { q: "Choose the correctly spelled word.", choices: ["necessary", "neccessary", "necesary", "necessery"], answer: "necessary", kind: "English" },
  { q: "Ո՞րն է գոյականի հարցերից մեկը։", choices: ["ինչպիսի՞", "ո՞վ", "ինչպե՞ս", "ե՞րբ"], answer: "ո՞վ", kind: "Հայոց լեզու" },
  { q: "Ո՞ր բջջային օրգանոիդն է հիմնականում արտադրում ATP։", choices: ["Ռիբոսոմ", "Միտոքոնդրիում", "Լիզոսոմ", "Գոլջիի համալիր"], answer: "Միտոքոնդրիում", kind: "Կենսաբանություն" },
  { q: "Որքա՞ն է √144։", choices: ["10", "11", "12", "14"], answer: "12", kind: "Մաթեմատիկա" },
  { q: "Choose the correct sentence.", choices: ["He don't like tea.", "He doesn't likes tea.", "He doesn't like tea.", "He not like tea."], answer: "He doesn't like tea.", kind: "English" },
  { q: "Ո՞րն է բայը։", choices: ["գեղեցիկ", "վազել", "սեղան", "արագ"], answer: "վազել", kind: "Հայոց լեզու" },
  { q: "Ո՞րն է Արեգակնային համակարգի ամենամեծ մոլորակը։", choices: ["Երկիր", "Մարս", "Յուպիտեր", "Նեպտուն"], answer: "Յուպիտեր", kind: "Բնագիտություն" },
  { q: "Եթե եռանկյան երկու անկյուններն են 50° և 60°, երրորդը քանի՞ աստիճան է։", choices: ["60°", "70°", "80°", "90°"], answer: "70°", kind: "Մաթեմատիկա" },
  { q: "Ո՞րն է «գիրք» բառի հոգնակին։", choices: ["գիրքեր", "գրքեր", "գիրքներն", "գրքիս"], answer: "գրքեր", kind: "Հայոց լեզու" },
  { q: "Which word is a synonym of “rapid”?", choices: ["slow", "quick", "quiet", "weak"], answer: "quick", kind: "English" },
  { q: "Ո՞րն է ժառանգական տեղեկատվության հիմնական կրողը։", choices: ["ԴՆԹ", "Գլյուկոզ", "Ջուր", "Օսլա"], answer: "ԴՆԹ", kind: "Կենսաբանություն" },
  { q: "Որքա՞ն է 250-ի 20%-ը։", choices: ["25", "40", "50", "60"], answer: "50", kind: "Մաթեմատիկա" },
  { q: "Ո՞ր թվականին է Հայաստանը հռչակվել առաջին հանրապետություն։", choices: ["1915", "1918", "1920", "1991"], answer: "1918", kind: "Հայոց պատմություն" },
];

function MiniGamesPage() {
  const tx = useTx();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [length, setLength] = useState(10);
  const [category, setCategory] = useState("Բոլորը");
  const pool = useMemo(() => category === "Բոլորը" ? QUESTIONS : QUESTIONS.filter((q) => q.kind === category), [category]);
  const round = useMemo(() => pool.slice(0, Math.min(length, pool.length)), [pool, length]);
  const question = round[index];
  const restart = () => { setIndex(0); setPicked(null); setScore(0); setFinished(false); };
  const choose = (choice: string) => {
    if (picked !== null || !question) return;
    setPicked(choice);
    if (choice === question.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (index >= round.length - 1) setFinished(true);
    else { setIndex((i) => i + 1); setPicked(null); }
  };
  const categories = ["Բոլորը", ...Array.from(new Set(QUESTIONS.map((q) => q.kind)))];
  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4"/> {tx("Գլխավոր էջ")}</Link>
    <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/15 via-card to-violet-500/10 p-6 sm:p-10">
      <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Gamepad2 className="size-6"/></span><div><p className="text-sm font-bold text-primary">{tx("Սովորիր խաղալով")}</p><h1 className="text-3xl font-black sm:text-4xl">{tx("Մինի խաղեր")}</h1></div></div>
      <p className="mt-4 max-w-2xl text-muted-foreground">{tx("30 հարց՝ տարբեր առարկաներից։ Ընտրիր խաղի երկարությունն ու թեման։")}</p>
    </section>
    <section className="mx-auto max-w-2xl space-y-4 rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-bold">{tx("Հարցերի քանակը")}
          <select value={length} onChange={(e) => { setLength(Number(e.target.value)); restart(); }} className="h-11 w-full rounded-xl border bg-background px-3 font-medium">
            {[5, 10, 15, 20, 25, 30].map((n) => <option key={n} value={n}>{n} {tx("հարց")}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-sm font-bold">{tx("Առարկա")}
          <select value={category} onChange={(e) => { setCategory(e.target.value); restart(); }} className="h-11 w-full rounded-xl border bg-background px-3 font-medium">
            {categories.map((c) => <option key={c} value={c}>{tx(c)}</option>)}
          </select>
        </label>
      </div>
      {finished ? <div className="space-y-4 text-center"><CheckCircle2 className="mx-auto size-12 text-primary"/><h2 className="text-2xl font-black">{tx("Խաղն ավարտվեց։")}</h2><p className="text-muted-foreground">{tx("Քո արդյունքը՝ {score} / {total}", { score, total: round.length })}</p><Button onClick={restart}><RotateCcw className="mr-2 size-4"/>{tx("Կրկին խաղալ")}</Button></div> : question ? <>
        <div className="mb-6 flex items-center justify-between gap-3"><span className="rounded-full bg-muted px-3 py-1 text-sm font-bold">{tx(question.kind)}</span><span className="text-sm text-muted-foreground">{index + 1} / {round.length}</span></div>
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{width: ((index + 1) / round.length * 100) + "%"}}/></div>
        <h2 className="mb-6 text-xl font-bold leading-relaxed sm:text-2xl">{tx(question.q)}</h2>
        <div className="grid gap-3 sm:grid-cols-2">{question.choices.map((choice) => {
          const correct = picked !== null && choice === question.answer;
          const wrong = picked === choice && choice !== question.answer;
          return <button key={choice} type="button" onClick={() => choose(choice)} disabled={picked !== null} className={`min-h-14 rounded-2xl border p-4 text-left font-semibold transition hover:border-primary disabled:cursor-default ${correct ? "border-emerald-500 bg-emerald-500/10" : wrong ? "border-destructive bg-destructive/10" : "bg-background"}`}>{choice}</button>;
        })}</div>
        {picked !== null && <div className="mt-5 space-y-4"><p className="font-semibold">{picked === question.answer ? tx("Ճիշտ է։ Լավ աշխատանք։") : tx("Ճիշտ պատասխանն է՝ {answer}", { answer: question.answer })}</p><Button className="w-full" onClick={next}>{index === round.length - 1 ? tx("Տեսնել արդյունքը") : tx("Հաջորդ հարցը")}</Button></div>}
      </> : <p className="text-sm text-muted-foreground">{tx("Այս առարկայի հարցերը դեռ չկան։ Ընտրիր այլ առարկա։")}</p>}
    </section>
    <p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground"><Brain className="size-4"/><Sparkles className="size-4"/> {tx("Խաղերը ներառում են մաթեմատիկա, լեզուներ, պատմություն և կենսաբանություն։")}</p>
  </main>;
}
