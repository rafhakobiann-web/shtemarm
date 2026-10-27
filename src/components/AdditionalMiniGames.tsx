import { useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, RefreshCw, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";
import { makeRound, shuffle, type GameSubjectId } from "@/lib/mini-game-data";
import { TRUE_FALSE_ITEMS, MATCH_PAIRS } from "@/lib/mini-game-activities";

export { TRUE_FALSE_ITEMS, MATCH_PAIRS };
type ResultFn = (correct:number,total:number)=>void;
type Props = { subject:GameSubjectId; onComplete?:ResultFn };
const progress = (n:number,total:number)=>Math.round((total? n/total : 0)*100);

function GameProgress({done,total,label}:{done:number;total:number;label:string}){
  return <div className="space-y-2">
    <div className="flex items-center justify-between gap-3 text-sm font-bold">
      <span>{label}</span><span className="tabular-nums text-muted-foreground">{done} / {total}</span>
    </div>
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total}
      aria-valuenow={done} className="h-2 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
        style={{width:progress(done,total)+"%"}} />
    </div>
  </div>;
}
function Finish({score,total,onRestart,detail}:{score:number;total:number;onRestart:()=>void;detail?:string}){
  const tx=useTx();
  return <div className="space-y-5 py-6 text-center">
    <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary">
      <CheckCircle2 className="size-9"/>
    </span>
    <h2 className="text-2xl font-black">{tx("Խաղն ավարտվեց")}</h2>
    <p className="text-3xl font-black tabular-nums">{score} / {total}</p>
    {detail && <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>}
    <Button type="button" size="lg" onClick={onRestart} className="min-h-12">
      <RotateCcw className="mr-2 size-4"/>{tx("Նոր խաղ")}
    </Button>
  </div>;
}

export function TrueFalseGame({subject,onComplete}:Props){
  const tx=useTx();
  const [round,setRound]=useState(0);
  const items=useMemo(()=>makeRound(TRUE_FALSE_ITEMS,subject,subject==="mixed"?20:10),[subject,round]);
  const [index,setIndex]=useState(0);
  const [choice,setChoice]=useState<boolean|null>(null);
  const [score,setScore]=useState(0);
  const done=index>=items.length;
  const current=items[index];
  const reset=()=>{setRound(v=>v+1);setIndex(0);setChoice(null);setScore(0);};
  const next=()=>{
    if(choice===null)return;
    if(index===items.length-1)onComplete?.(score,items.length);
    setIndex(i=>i+1);setChoice(null);
  };
  return <section aria-label={tx("Ճի՞շտ, թե՞ սխալ")} className="mx-auto max-w-3xl space-y-5 rounded-3xl border bg-card p-4 shadow-sm sm:p-8">
    {!items.length ? <p>{tx("Այս առարկայի համար առայժմ համապատասխան հարցեր չկան։")}</p> :
      done?<Finish score={score} total={items.length} onRestart={reset}/> :
      current ? <>
        <GameProgress done={index} total={items.length} label={tx("Ճի՞շտ, թե՞ սխալ")}/>
        <div className="rounded-2xl bg-muted/40 p-5 text-center">
          <span className="mb-3 block text-xs font-semibold text-muted-foreground">{tx("Պնդում")}</span>
          <h2 className="text-lg font-black leading-relaxed sm:text-2xl">{current.statement}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([true,false] as const).map(value=><Button key={String(value)} type="button" size="lg"
            className="min-h-14 whitespace-normal" disabled={choice!==null}
            variant={choice===value?"default":"outline"}
            onClick={()=>{if(choice!==null)return;setChoice(value);if(value===current.truth)setScore(n=>n+1);}}>
            {tx(value?"Ճիշտ է":"Սխալ է")}
          </Button>)}
        </div>
        {choice!==null && <div role="status" aria-live="polite"
          className={"space-y-3 rounded-2xl border p-4 "+(choice===current.truth?
            "border-emerald-500/30 bg-emerald-500/10":"border-amber-500/30 bg-amber-500/10")}>
          <p className="font-black">{tx(choice===current.truth?"Ճիշտ պատասխան":"Սխալ պատասխան")}</p>
          <p className="text-sm leading-relaxed">{current.reason}</p>
          <Button type="button" className="min-h-11 w-full" onClick={next}>
            {tx(index===items.length-1?"Տեսնել արդյունքը":"Հաջորդ հարցը")}
          </Button>
        </div>}
      </>:null}
  </section>;
}

export function MatchingGame({subject,onComplete}:Props){
  const tx=useTx();
  const [round,setRound]=useState(0);
  const pairs=useMemo(()=>makeRound(MATCH_PAIRS,subject,subject==="mixed"?10:8),[subject,round]);
  const right=useMemo(()=>shuffle(pairs),[pairs]);
  const [left,setLeft]=useState<string|null>(null);
  const [matched,setMatched]=useState<string[]>([]);
  const [mistakes,setMistakes]=useState(0);
  const [feedback,setFeedback]=useState("");
  const reset=()=>{setRound(v=>v+1);setLeft(null);setMatched([]);setMistakes(0);setFeedback("");};
  const complete=pairs.length>0 && matched.length===pairs.length;
  function choose(id:string){
    if(!left){setFeedback(tx("Նախ ընտրիր ձախ կողմի տերմինը։"));return;}
    if(matched.includes(left)||matched.includes(id))return;
    if(left===id){
      const count=matched.length+1;
      setMatched(v=>[...v,id]);setFeedback(tx("Ճիշտ է"));
      setLeft(null);
      if(count===pairs.length)onComplete?.(Math.max(0,count-mistakes),count);
    }else{
      setMistakes(v=>v+1);
      setFeedback(tx("Սխալ զույգ է։ Փորձիր կրկին։"));
    }
  }
  return <section aria-label={tx("Համապատասխանեցում")} className="mx-auto max-w-4xl space-y-5 rounded-3xl border bg-card p-4 shadow-sm sm:p-8">
    {!pairs.length?<p>{tx("Այս առարկայի համար զույգեր դեռ չկան։")}</p>:
      complete?<Finish score={Math.max(0,pairs.length-mistakes)} total={pairs.length}
        detail={tx("Սխալ փորձեր")+": "+mistakes} onRestart={reset}/> :<>
        <GameProgress done={matched.length} total={pairs.length} label={tx("Գտիր համապատասխան զույգերը")}/>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {tx("Նախ սեղմիր ձախ կողմի տերմինը, հետո՝ աջ կողմի բացատրությունը։")}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="grid content-start gap-2">
            {pairs.map(pair=><button key={pair.id} type="button"
              disabled={matched.includes(pair.id)} aria-pressed={left===pair.id}
              onClick={()=>{setLeft(pair.id);setFeedback("");}}
              className={"min-h-16 min-w-0 break-words rounded-xl border p-2 text-left text-xs font-semibold outline-offset-2 transition-colors sm:p-3 sm:text-sm "+
                (matched.includes(pair.id)?"border-emerald-500/50 bg-emerald-500/10 opacity-60":
                  left===pair.id?"border-primary bg-primary/15 ring-2 ring-primary/30":"bg-background hover:border-primary")}>
              {pair.left}
            </button>)}
          </div>
          <div className="grid content-start gap-2">
            {right.map(pair=><button key={pair.id} type="button"
              disabled={matched.includes(pair.id)} onClick={()=>choose(pair.id)}
              className={"min-h-16 min-w-0 break-words rounded-xl border p-2 text-left text-xs font-semibold outline-offset-2 transition-colors sm:p-3 sm:text-sm "+
                (matched.includes(pair.id)?"border-emerald-500/50 bg-emerald-500/10 opacity-60":"bg-background hover:border-primary")}>
              {pair.right}
            </button>)}
          </div>
        </div>
        <p role="status" aria-live="polite" className="min-h-6 text-sm font-semibold text-primary">{feedback}</p>
        <p className="text-xs text-muted-foreground">{tx("Սխալ փորձեր")}՝ {mistakes}</p>
      </>}
  </section>;
}

/** Flashcards are self-assessment, not an AI call or an automatic quiz score. */
export function FlashcardsGame({subject,onComplete}:Props){
  const tx=useTx();
  const [round,setRound]=useState(0);
  const cards=useMemo(()=>makeRound(MATCH_PAIRS,subject,subject==="mixed"?15:8),[subject,round]);
  const [index,setIndex]=useState(0);
  const [revealed,setRevealed]=useState(false);
  const [known,setKnown]=useState(0);
  const current=cards[index];
  const done=index>=cards.length;
  const reset=()=>{setRound(v=>v+1);setIndex(0);setRevealed(false);setKnown(0);};
  const finish=(yes:boolean)=>{
    const result=known+(yes?1:0);
    setKnown(result);
    if(index===cards.length-1)onComplete?.(result,cards.length);
    setIndex(i=>i+1);setRevealed(false);
  };
  return <section aria-label={tx("Հիշողության քարտեր")}
    className="mx-auto max-w-3xl space-y-5 rounded-3xl border bg-card p-4 shadow-sm sm:p-8">
    {!cards.length?<p>{tx("Այս առարկայի համար զույգեր դեռ չկան։")}</p>:
      done?<Finish score={known} total={cards.length} onRestart={reset}
        detail={tx("Հիշողության քարտերով նշված՝ իմացած պատասխաններ")}/>:
      current ? <>
        <GameProgress done={index} total={cards.length} label={tx("Հիշողության քարտեր")}/>
        <button type="button" aria-pressed={revealed} onClick={()=>setRevealed(v=>!v)}
          className="flex min-h-64 w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-card to-primary/5 p-6 text-center shadow-sm outline-offset-4 transition-colors hover:border-primary/40 motion-reduce:transition-none">
          <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-black text-primary">
            {tx(revealed?"Պատասխան":"Հարց")}
          </span>
          <span className="break-words text-xl font-black leading-relaxed sm:text-3xl">
            {revealed?current.right:current.left}
          </span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpenCheck className="size-4"/>{tx("Հպիր քարտին՝ շրջելու համար")}
          </span>
        </button>
        {!revealed?<Button type="button" className="min-h-12 w-full" onClick={()=>setRevealed(true)}>
          <Sparkles className="mr-2 size-4"/>{tx("Տեսնել պատասխանը")}
        </Button>:<div className="grid grid-cols-2 gap-3">
          <Button type="button" size="lg" className="min-h-14" variant="outline" onClick={()=>finish(false)}>
            {tx("Պետք է կրկնեմ")}
          </Button>
          <Button type="button" size="lg" className="min-h-14" onClick={()=>finish(true)}>
            {tx("Գիտեի")}
          </Button>
        </div>}
      </>:null}
  </section>;
}
