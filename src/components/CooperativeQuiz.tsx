import { useMemo, useState } from "react";
import { RotateCcw, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";
import { QUICK_QUIZ_ITEMS, makeRound, type GameSubjectId } from "@/lib/mini-game-data";

type Turn={questionId:string;player:0|1;chosen:string;correct:boolean};
const COUNT=30;

/** Same-device cooperative challenge: teammates alternate, shared accuracy wins.
 * Offline, no account, no sockets, and no misleading online multiplayer claim.
 */
export function CooperativeQuiz({subject}:{subject:GameSubjectId}){
  const tx=useTx();
  const [seed,setSeed]=useState(0);
  const questions=useMemo(()=>makeRound(QUICK_QUIZ_ITEMS,subject,COUNT),[subject,seed]);
  const [names,setNames]=useState<[string,string]>(["Խաղացող 1","Խաղացող 2"]);
  const [turns,setTurns]=useState<Turn[]>([]);
  const [picked,setPicked]=useState<string|null>(null);
  const index=turns.length;
  const current=questions[index];
  const player=(index%2) as 0|1;
  const finished=index>=questions.length;
  const correct=turns.filter(t=>t.correct).length;
  const perPlayer=[0,1].map(p=>turns.filter(t=>t.player===p&&t.correct).length);
  const restart=()=>{setSeed(v=>v+1);setTurns([]);setPicked(null);};
  const submit=()=>{
    if(!current||picked===null)return;
    setTurns(v=>[...v,{questionId:current.id,player,chosen:picked,correct:picked===current.answer}]);
    setPicked(null);
  };
  return <section className="mx-auto max-w-3xl space-y-5 rounded-3xl border bg-card p-4 sm:p-7"
    aria-label={tx("Թիմային վիկտորինա")}>
    <div className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Users className="size-6"/></span>
      <div><h2 className="text-xl font-black">{tx("Թիմային վիկտորինա")}</h2>
      <p className="text-xs text-muted-foreground">{tx("Երկու հոգով՝ նույն սարքում։ Հերթով պատասխանեք և միասին հավաքեք միավորներ։")}</p></div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {([0,1] as const).map(p=><label key={p} className="space-y-1 text-sm font-semibold">
        <span>{tx("Խաղացող {n}",{n:p+1})}</span>
        <input aria-label={tx("Խաղացող {n}",{n:p+1})} maxLength={24} value={names[p]}
          onChange={e=>setNames(v=>p===0?[e.target.value,v[1]]:[v[0],e.target.value])}
          className="h-11 w-full rounded-xl border bg-background px-3"/>
        <span className="block text-xs text-muted-foreground">{perPlayer[p]} {tx("միավոր")}</span>
      </label>)}
    </div>
    <div className="flex items-center justify-between gap-3 text-sm font-bold">
      <span>{tx("Թիմային միավորներ")}՝ {correct}/{turns.length}</span>
      <span>{Math.min(index+1,questions.length)}/{questions.length}</span>
    </div>
    {finished?<div className="space-y-4 rounded-2xl bg-primary/5 p-6 text-center">
      <Trophy className="mx-auto size-10 text-primary"/>
      <h3 className="text-xl font-black">{tx("Թիմային խաղն ավարտվեց")}</h3>
      <p className="text-4xl font-black">{correct}/{questions.length}</p>
      <p className="text-sm text-muted-foreground">{tx("Հարցերի պատասխանները ստուգվել են տեղական հարցաշարով։")}</p>
      <Button onClick={restart}><RotateCcw className="mr-2 size-4"/>{tx("Նոր փուլ")}</Button>
    </div>:current?<div className="space-y-4">
      <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
        {tx("Հերթը՝")} {names[player]||tx("Խաղացող {n}",{n:player+1})}
      </p>
      <h3 className="text-lg font-black leading-relaxed">{current.prompt}</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {current.choices.map((choice,i)=><button key={i} type="button"
          aria-pressed={picked===choice} onClick={()=>setPicked(choice)}
          className={"min-h-14 rounded-xl border-2 p-3 text-left text-sm font-semibold "+
            (picked===choice?"border-primary bg-primary/10":"border-border hover:border-primary/40")}>
          {String.fromCharCode(65+i)}. {choice}
        </button>)}
      </div>
      <Button className="min-h-12 w-full" disabled={picked===null} onClick={submit}>
        {tx("Հաստատել պատասխանը և փոխանցել հերթը")}
      </Button>
    </div>:<p>{tx("Այս առարկայի համար հարցեր չկան։")}</p>}
    <Button variant="outline" size="sm" onClick={restart}>
      <RotateCcw className="mr-2 size-4"/>{tx("Սկսել նորից")}
    </Button>
  </section>;
}
