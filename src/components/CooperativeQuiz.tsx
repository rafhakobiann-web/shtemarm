import { useMemo, useState } from "react";
import { Users, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUICK_QUIZ_ITEMS, makeRound, type GameSubjectId } from "@/lib/mini-game-data";
import { useTx } from "@/lib/lang";

type Team = 0 | 1;
export function CooperativeQuiz({subject}:{subject:GameSubjectId}) {
  const tx=useTx();
  const [seed,setSeed]=useState(0);
  const [count,setCount]=useState(10);
  const available=QUICK_QUIZ_ITEMS.filter(q=>subject==="mixed"||q.subject===subject).length;
  const questions=useMemo(()=>makeRound(QUICK_QUIZ_ITEMS,subject,Math.min(count,QUICK_QUIZ_ITEMS.filter(q=>subject==="mixed"||q.subject===subject).length)),[subject,seed,count]);
  const [index,setIndex]=useState(0);
  const [picked,setPicked]=useState<string|null>(null);
  const [scores,setScores]=useState<[number,number]>([0,0]);
  const [names,setNames]=useState<[string,string]>(["Թիմ 1","Թիմ 2"]);
  const team=(index%2) as Team;
  const item=questions[index];
  const finished=index>=questions.length;
  const restart=()=>{setSeed(x=>x+1);setIndex(0);setPicked(null);setScores([0,0]);};
  const choose=(answer:string)=>{
    if(picked!==null||!item)return;
    setPicked(answer);
    if(answer===item.answer)setScores(s=>team===0?[s[0]+1,s[1]]:[s[0],s[1]+1]);
  };
  return <section className="mx-auto max-w-3xl space-y-5 rounded-3xl border bg-card p-5 sm:p-8" aria-label={tx("Թիմային վիկտորինա")}>
    <div className="flex items-center gap-3"><Users className="size-6 text-primary"/><div><h2 className="text-xl font-black">{tx("Թիմային վիկտորինա")}</h2><p className="text-xs text-muted-foreground">{tx("Երկու թիմերը հերթով պատասխանում են նույն սարքով։ Արդյունքները հաշվարկվում են միայն այս խաղում։")}</p></div></div>
    <div className="grid grid-cols-2 gap-3">{([0,1] as const).map(i=><label key={i} className={"rounded-xl border p-3 "+(!finished&&team===i?"border-primary bg-primary/10":"")}>
      <span className="mb-1 block text-xs text-muted-foreground">{tx("Թիմ")} {i+1}</span>
      <input aria-label={tx("Թիմի անունը")+" "+(i+1)} maxLength={24} className="w-full min-w-0 rounded-md bg-background px-2 py-2 text-sm font-bold" value={names[i]} onChange={e=>setNames(n=>i===0?[e.target.value,n[1]]:[n[0],e.target.value])}/>
      <strong className="mt-2 block text-2xl tabular-nums">{scores[i]}</strong>
    </label>)}</div>
    <div className="flex items-center gap-3"><label className="text-sm font-semibold" htmlFor="co-op-length">{tx("Հարցերի քանակ")}</label><select id="co-op-length" value={count} onChange={e=>{setCount(Number(e.target.value));restart();}} className="rounded-lg border bg-background px-3 py-2 text-sm">{[10,20,30,50,100].filter(n=>n<=available).map(n=><option key={n} value={n}>{n}</option>)}</select><span className="text-xs text-muted-foreground">{tx("Մինչև բանկի հասանելի հարցերի քանակը")}</span></div>
    {finished?<div className="space-y-4 text-center"><CheckCircle2 className="mx-auto size-12 text-primary"/><h3 className="text-xl font-black">{tx("Խաղն ավարտվեց")}</h3><p className="font-bold">{scores[0]===scores[1]?tx("Ոչ-ոքի"):names[scores[0]>scores[1]?0:1]+" · "+tx("Հաղթող թիմ")}</p><Button onClick={restart}><RotateCcw className="mr-2 size-4"/>{tx("Կրկին խաղալ")}</Button></div>:item?<div className="space-y-4">
      <p className="text-sm font-bold">{tx("Հերթը")}՝ {names[team]} · {index+1}/{questions.length}</p>
      <div role="progressbar" aria-label={tx("Խաղի առաջընթաց")} aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index} className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{width:(index/questions.length*100)+"%"}}/></div>
      <p className="text-lg font-black">{item.prompt}</p>
      <div className="grid gap-2 sm:grid-cols-2">{item.choices.map((answer,i)=><button key={i} type="button" disabled={picked!==null} onClick={()=>choose(answer)} className={"min-h-14 rounded-xl border-2 p-3 text-left font-semibold "+(picked!==null&&answer===item.answer?"border-emerald-500 bg-emerald-500/10":picked===answer?"border-destructive bg-destructive/10":"bg-background hover:border-primary")}>{answer}</button>)}</div>
      {picked!==null&&<div className="space-y-3 rounded-xl bg-muted/50 p-4"><p className="font-bold">{tx(picked===item.answer?"Ճիշտ պատասխան":"Սխալ պատասխան")}</p><p className="text-sm">{item.explanation}</p><Button onClick={()=>{setIndex(i=>i+1);setPicked(null);}} className="w-full">{tx("Հաջորդ հարցը")}</Button></div>}
    </div>:<p>{tx("Այս առարկայի համար առայժմ համապատասխան հարցեր չկան։")}</p>}
    <p className="text-xs text-muted-foreground">{tx("Այս ռեժիմը տեղային է. առցանց սենյակներ կամ խաղացողների հաշիվներ դեռ չկան։")}</p>
  </section>;
}
