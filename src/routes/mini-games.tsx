import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Brain, CheckCircle2, Gamepad2, Layers3, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";
import { SUBJECTS, QUICK_QUIZ_ITEMS, makeRound, resultPercent,
  type GameSubjectId, type QuizItem } from "@/lib/mini-game-data";
import { TrueFalseGame, MatchingGame, FlashcardsGame } from "@/components/AdditionalMiniGames";
import { CooperativeQuiz } from "@/components/CooperativeQuiz";
import { bestResult, recordResult, type MiniGameMode, type MiniGameResult } from "@/lib/mini-game-progress";

export const Route = createFileRoute("/mini-games")({
  head:()=>({meta:[{title:"Մինի խաղեր · Shtemarm"},
    {name:"description",content:"Արագ վիկտորինա, ճիշտ կամ սխալ, համապատասխանեցում և հիշողության քարտեր՝ ութ ուսումնական առարկաներով։"}]}),
  component:MiniGamesPage,
});
type Response={item:QuizItem;chosen:string;correct:boolean};
const MODES=[
  {id:"quiz",label:"Արագ վիկտորինա",icon:Gamepad2},
  {id:"truefalse",label:"Ճիշտ թե սխալ",icon:CheckCircle2},
  {id:"matching",label:"Համապատասխանեցում",icon:Layers3},
  {id:"flashcards",label:"Հիշողության քարտեր",icon:Brain},
] as const satisfies readonly {id:MiniGameMode;label:string;icon:typeof Brain}[];

function MiniGamesPage(){
  const tx=useTx();
  const [game,setGame]=useState<MiniGameMode>("quiz");
  const [cooperative,setCooperative]=useState(false);
  const [subject,setSubject]=useState<GameSubjectId>("mixed");
  const [attempt,setAttempt]=useState(0);
  const questions=useMemo(()=>makeRound(QUICK_QUIZ_ITEMS,subject,subject==="mixed"?20:10),
    [subject,attempt]);
  const [index,setIndex]=useState(0);
  const [picked,setPicked]=useState<string|null>(null);
  const [score,setScore]=useState(0);
  const [finished,setFinished]=useState(false);
  const [answers,setAnswers]=useState<Response[]>([]);
  const [best,setBest]=useState<MiniGameResult|null>(null);
  useEffect(()=>{setBest(bestResult(game,subject));},[game,subject]);
  const current=questions[index];
  const reset=()=>{
    setAttempt(n=>n+1);setIndex(0);setPicked(null);setScore(0);
    setFinished(false);setAnswers([]);
  };
  const switchSubject=(id:GameSubjectId)=>{
    if(id===subject)return;
    setSubject(id);setIndex(0);setPicked(null);setScore(0);setFinished(false);setAnswers([]);
  };
  const switchGame=(id:MiniGameMode)=>{
    if(id===game)return;
    setCooperative(false);setGame(id);setIndex(0);setPicked(null);setScore(0);setFinished(false);setAnswers([]);
  };
  const complete=(mode:MiniGameMode,correct:number,total:number)=>{
    setBest(recordResult(mode,subject,correct,total));
  };
  const choose=(choice:string)=>{
    if(picked!==null||!current)return;
    const correct=choice===current.answer;
    setPicked(choice);
    if(correct)setScore(n=>n+1);
    setAnswers(prev=>[...prev,{item:current,chosen:choice,correct}]);
  };
  const next=()=>{
    if(picked===null)return;
    if(index===questions.length-1){
      setFinished(true);complete("quiz",score,questions.length);
    }else {setIndex(i=>i+1);setPicked(null);}
  };
  const incorrect=answers.filter(a=>!a.correct);
  const done=finished||!current;
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-9">
    <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4"/>{tx("Գլխավոր էջ")}
    </Link>
    <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/15 via-card to-violet-500/10 p-5 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Gamepad2 className="size-6"/>
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-bold text-primary sm:text-sm">{tx("Սովորիր խաղալով")}</p>
          <h1 className="text-2xl font-black tracking-tight sm:text-4xl">{tx("Մինի խաղեր")}</h1>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {tx("Ընտրիր խաղը և առարկան։ Հարցերը չեն կրկնվում նույն փուլում, իսկ լավագույն արդյունքը պահպանվում է սարքում։")}
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-2 text-xs font-semibold">
        <Sparkles className="size-4 text-primary"/>
        {tx("Անվճար · Աշխատում է առանց ԱԲ հարցումների")}
      </div>
    </section>
    <section className="space-y-4">
      <h2 className="text-base font-black">{tx("Խաղի ընտրություն")}</h2>
      <button type="button" aria-pressed={cooperative} onClick={()=>{setCooperative(v=>!v);setIndex(0);setPicked(null);setScore(0);setFinished(false);setAnswers([]);}}
        className={"flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 p-4 text-left "+
          (cooperative?"border-primary bg-primary/10":"border-border bg-card hover:border-primary/40")}>
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Gamepad2 className="size-5"/></span>
        <span><strong className="block">{tx("Թիմային խաղ · 2 հոգով")}</strong>
        <span className="block text-xs text-muted-foreground">{tx("30 հարց, հերթափոխով պատասխաններ, ընդհանուր միավորներ։ Նույն սարքում՝ առանց հաշվի։")}</span></span>
      </button>
      <div role="group" aria-label={tx("Խաղի ընտրություն")} className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {MODES.map(({id,label,icon:Icon})=><button type="button" key={id}
          aria-pressed={game===id} onClick={()=>switchGame(id)}
          className={"flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-2xl border p-3 text-center text-xs font-bold transition-colors sm:min-h-20 sm:text-sm "+
          (game===id?"border-primary bg-primary text-primary-foreground shadow-sm":
            "bg-card hover:border-primary/50 hover:bg-muted/50")}>
          <Icon className="size-5 shrink-0"/><span className="min-w-0">{tx(label)}</span>
        </button>)}
      </div>
      <h2 className="pt-1 text-base font-black">{tx("Առարկայի ընտրություն")}</h2>
      <div role="group" aria-label={tx("Առարկայի ընտրություն")}
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
        {SUBJECTS.map(({id,label})=><button type="button" key={id}
          aria-pressed={subject===id} onClick={()=>switchSubject(id)}
          className={"min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors "+
            (subject===id?"border-primary bg-primary text-primary-foreground":"bg-card hover:border-primary/50")}>
          {tx(label)}
        </button>)}
      </div>
    </section>
    {best && <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-4 py-2 text-sm"
      role="status">
      <Trophy className="size-4 text-primary"/><span className="font-bold">{tx("Լավագույն արդյունք")}</span>
      <strong className="ml-auto tabular-nums">{best.correct}/{best.total} · {resultPercent(best.correct,best.total)}%</strong>
    </div>}
    {cooperative ? <CooperativeQuiz key={"coop-"+subject} subject={subject}/> : game==="truefalse" ? <TrueFalseGame key={"tf-"+subject} subject={subject}
      onComplete={(c,t)=>complete("truefalse",c,t)}/> :
      game==="matching" ? <MatchingGame key={"pairs-"+subject} subject={subject}
        onComplete={(c,t)=>complete("matching",c,t)}/> :
      game==="flashcards" ? <FlashcardsGame key={"cards-"+subject} subject={subject}
        onComplete={(c,t)=>complete("flashcards",c,t)}/> :
      <section aria-label={tx("Արագ վիկտորինա")}
        className="mx-auto max-w-3xl space-y-5 rounded-3xl border bg-card p-4 shadow-sm sm:p-8">
        {done ? <div className="space-y-5 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary">
            <CheckCircle2 className="size-9"/>
          </span>
          <h2 className="text-2xl font-black">{tx("Խաղն ավարտվեց")}</h2>
          <p className="text-4xl font-black tabular-nums">{score} / {questions.length}</p>
          <p className="text-sm text-muted-foreground">{resultPercent(score,questions.length)}% · {tx("Ճիշտ պատասխաններ")}</p>
          {incorrect.length>0 && <div className="rounded-2xl border bg-muted/30 p-4 text-left">
            <h3 className="mb-3 font-black">{tx("Վերանայել սխալ պատասխանները")} ({incorrect.length})</h3>
            <div className="space-y-4">
              {incorrect.map(({item,chosen})=><article className="space-y-1 border-b pb-3 last:border-none last:pb-0" key={item.id}>
                <p className="text-sm font-bold">{item.prompt}</p>
                <p className="text-xs text-destructive">{tx("Քո պատասխանը")}՝ {chosen}</p>
                <p className="text-xs font-semibold">{tx("Ճիշտ պատասխան")}՝ {item.answer}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{item.explanation}</p>
              </article>)}
            </div>
          </div>}
          <Button type="button" size="lg" onClick={reset} className="min-h-12">
            <RotateCcw className="mr-2 size-4"/>{tx("Կրկին խաղալ")}
          </Button>
        </div> :current?<>
          <div className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="rounded-full bg-muted px-3 py-1 text-xs">{tx(SUBJECTS.find(x=>x.id===current.subject)?.label??current.subject)}</span>
            <span className="tabular-nums text-muted-foreground">{index+1} / {questions.length}</span>
          </div>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index}
            aria-label={tx("Խաղի առաջընթաց")} className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
              style={{width:(index/questions.length*100)+"%"}}/>
          </div>
          <h2 className="text-lg font-black leading-relaxed sm:text-2xl">{current.prompt}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {current.choices.map((choice,i)=>{
              const correct=picked!==null&&choice===current.answer;
              const wrong=picked===choice&&choice!==current.answer;
              return <button type="button" key={i} disabled={picked!==null}
                aria-pressed={picked===choice} onClick={()=>choose(choice)}
                className={"flex min-h-16 items-center gap-3 rounded-2xl border-2 p-3 text-left text-sm font-semibold outline-offset-2 transition-colors disabled:cursor-default sm:p-4 "+
                  (correct?"border-emerald-500 bg-emerald-500/10":
                   wrong?"border-destructive bg-destructive/10":
                   "border-border bg-background hover:border-primary")}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/70 text-xs font-black">
                  {String.fromCharCode(65+i)}
                </span>
                <span className="min-w-0 break-words">{choice}</span>
              </button>;
            })}
          </div>
          {picked!==null && <div role="status" aria-live="polite"
            className={"space-y-3 rounded-2xl border p-4 "+
              (picked===current.answer?"border-emerald-500/30 bg-emerald-500/10":
              "border-amber-500/30 bg-amber-500/10")}>
            <p className="font-black">{tx(picked===current.answer?"Ճիշտ պատասխան":"Սխալ պատասխան")}</p>
            {picked!==current.answer&&<p className="text-sm font-bold">
              {tx("Ճիշտ պատասխան")}՝ {current.answer}
            </p>}
            <p className="text-sm leading-relaxed">{current.explanation}</p>
            <Button type="button" className="min-h-11 w-full" onClick={next}>
              {tx(index===questions.length-1?"Տեսնել արդյունքը":"Հաջորդ հարցը")}
            </Button>
          </div>}
        </>:<p className="text-sm text-muted-foreground">{tx("Այս առարկայի համար առայժմ համապատասխան հարցեր չկան։")}</p>}
      </section>}
    <p className="text-center text-xs leading-relaxed text-muted-foreground">
      {tx("Խաղերի հարցերը հեղինակային ուսումնական վարժություններ են և չեն փոխարինում պաշտոնական քննությանը։")}
    </p>
  </main>;
}
