import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Brain, CheckCircle2, Gamepad2, RotateCcw, Sparkles, Dna, BookOpen, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMiniGame, GAME_BLUEPRINTS, type GameQuestion, type MiniGameMode } from "@/lib/miniGameBank";
import { useTx } from "@/lib/lang";
import { update } from "@/lib/progress";

export const Route = createFileRoute("/mini-games")({
  head:()=>({meta:[{title:"Ուսումնական խաղեր · Shtemarm"},{name:"description",content:"Հինգ խաղ՝ տարբեր առարկաների գիտելիքները կրկնելու համար։"}]}),
  component:MiniGamesPage,
});
const MODES: {id:MiniGameMode;icon:typeof Brain;style:string}[]=[
  {id:"quick",icon:Sparkles,style:"from-violet-600/15 to-fuchsia-400/10"},
  {id:"marathon",icon:Trophy,style:"from-amber-500/15 to-rose-400/10"},
  {id:"biology",icon:Dna,style:"from-emerald-500/15 to-teal-400/10"},
  {id:"vocabulary",icon:BookOpen,style:"from-sky-500/15 to-cyan-400/10"},
  {id:"truefalse",icon:CheckCircle2,style:"from-indigo-500/15 to-blue-400/10"},
];
function MiniGamesPage(){
  const tx=useTx();
  const [mode,setMode]=useState<MiniGameMode|null>(null);
  const [questions,setQuestions]=useState<GameQuestion[]>([]);
  const [index,setIndex]=useState(0);
  const [answer,setAnswer]=useState<string|null>(null);
  const [results,setResults]=useState<{correct:boolean;question:GameQuestion}[]>([]);
  const [finished,setFinished]=useState(false);
  const [loading,setLoading]=useState<MiniGameMode|null>(null);
  const [error,setError]=useState("");
  const current=questions[index];
  const correct=results.filter(r=>r.correct).length;
  const reset=()=>{setMode(null);setQuestions([]);setIndex(0);setAnswer(null);setResults([]);setFinished(false);setError("");};
  const begin=async(selected:MiniGameMode)=>{
    if(loading)return;
    setLoading(selected);setError("");
    try{
      const next=await createMiniGame(selected);
      setQuestions(next);setIndex(0);setAnswer(null);setResults([]);setFinished(false);setMode(selected);
      window.scrollTo({top:0,behavior:"instant"});
    }catch(e){setError(e instanceof Error?e.message:tx("Չհաջողվեց բեռնել խաղը։"));}
    finally{setLoading(null);}
  };
  const pick=(choice:string)=>{
    if(answer!==null||!current)return;
    setAnswer(choice);
    setResults(r=>[...r,{correct:choice===current.answer,question:current}]);
  };
  const next=()=>{
    if(index+1===questions.length){
      setFinished(true);
      const count=results.filter(r=>r.correct).length;
      update(p=>({...p,xp:p.xp+count*3}));
    }else{setIndex(i=>i+1);setAnswer(null);}
  };
  return <main className="mx-auto max-w-5xl space-y-6 pb-16">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4"/>{tx("Գլխավոր էջ")}
    </Link>
    {!mode?<><header className="space-y-3 rounded-3xl border bg-card p-6 sm:p-8">
      <p className="inline-flex items-center gap-2 font-bold text-primary"><Gamepad2 className="size-5"/>{tx("Սովորիր խաղալով")}</p>
      <h1 className="text-3xl font-black">{tx("Ուսումնական խաղեր")}</h1>
      <p className="max-w-2xl text-muted-foreground">{tx("Ընտրիր խաղը․ յուրաքանչյուր փորձի հարցերը խառնվում են, իսկ ճիշտ պատասխանները բացատրվում են։ Խաղերը ներառում են ավելի քան հինգ հարց։")}</p>
    </header>
    {error&&<p role="alert" className="rounded-xl border border-destructive/40 bg-card p-3 text-destructive">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2">
      {MODES.map(({id,icon:Icon,style})=><button key={id} type="button" disabled={!!loading}
        onClick={()=>void begin(id)} className={"group flex min-h-44 flex-col items-start gap-3 rounded-3xl border bg-gradient-to-br p-5 text-left shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-65 "+style}>
        <span className="grid size-11 place-items-center rounded-2xl border bg-card/80 text-primary"><Icon className="size-6"/></span>
        <h2 className="text-lg font-black">{tx(GAME_BLUEPRINTS[id].title)}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{tx(GAME_BLUEPRINTS[id].description)}</p>
        <span className="mt-auto text-sm font-bold text-primary">{loading===id?tx("Բեռնվում է…"):tx("Սկսել")} · {GAME_BLUEPRINTS[id].size} {tx("հարց")}</span>
      </button>)}
    </div></>:finished?<section className="mx-auto max-w-2xl space-y-5 rounded-3xl border bg-card p-6 text-center sm:p-10" role="status">
      <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary"><Trophy className="size-8"/></span>
      <h1 className="text-2xl font-black">{tx("Խաղն ավարտված է")}</h1>
      <p className="text-3xl font-black tabular-nums text-primary">{correct} / {questions.length}</p>
      <p className="text-muted-foreground">{Math.round(correct/questions.length*100)}% · +{correct*3} XP</p>
      <details className="rounded-2xl border p-4 text-left"><summary className="cursor-pointer font-bold">{tx("Վերանայել սխալ պատասխանները")}</summary>
        <div className="mt-3 space-y-2">
          {results.filter(r=>!r.correct).map(r=><p key={r.question.id} className="rounded-xl bg-muted/40 p-3 text-sm">
            <strong>{r.question.prompt}</strong><span className="mt-1 block">{tx("Ճիշտ պատասխան")}՝ {r.question.answer}</span>
            <span className="block text-muted-foreground">{r.question.explanation}</span>
          </p>)}
          {results.every(r=>r.correct)&&<p>{tx("Բոլոր պատասխանները ճիշտ են։")}</p>}
        </div>
      </details>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={()=>mode&&void begin(mode)}><RotateCcw className="size-4"/>{tx("Նորից խաղալ")}</Button>
        <Button variant="outline" onClick={reset}>{tx("Այլ խաղեր")}</Button>
      </div>
    </section>:current?<section className="mx-auto max-w-3xl space-y-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">{tx(current.subject)}</span>
        <span className="font-bold tabular-nums">{index+1} / {questions.length}</span>
      </div>
      <progress className="h-2 w-full accent-primary" max={questions.length} value={index+1} aria-label={tx("Առաջընթաց")}/>
      <h2 className="whitespace-pre-line text-xl font-black leading-relaxed sm:text-2xl">{current.prompt}</h2>
      <div className="grid gap-3 sm:grid-cols-2">{current.choices.map((choice,i)=><button
        key={i} type="button" disabled={answer!==null}
        onClick={()=>pick(choice)} aria-pressed={answer===choice}
        className={"min-h-16 rounded-2xl border-2 p-4 text-left font-semibold transition-colors disabled:cursor-default "+
          (answer!==null&&choice===current.answer?"border-emerald-500 bg-emerald-500/10":
          answer===choice?"border-destructive bg-destructive/10":"border-border hover:border-primary/50")}
        >{choice}</button>)}</div>
      {answer!==null&&<div role="status" className="space-y-3 rounded-2xl border bg-muted/40 p-4">
        <p className="font-black">{answer===current.answer?tx("Ճիշտ է։"):tx("Սխալ պատասխան։")}</p>
        <p className="text-sm leading-relaxed">{current.explanation}</p>
        <Button className="w-full" onClick={next}>{index+1===questions.length?tx("Տեսնել արդյունքը"):tx("Հաջորդ հարցը")}</Button>
      </div>}
      <div className="flex items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
        <span>{tx("Ճիշտ պատասխաններ")}՝ {correct}</span><button type="button" className="underline" onClick={reset}>{tx("Փոխել խաղը")}</button>
      </div>
    </section>:null}
  </main>;
}
