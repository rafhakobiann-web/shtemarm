import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Check, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadBook, shuffle } from "@/lib/books";
import { LEVEL_TEST_QUESTIONS } from "@/lib/levelTests";
import { historyBookEntries } from "@/lib/history";
import { useTx } from "@/lib/lang";

type Card = { id:string;front:string;back:string;subject:string;note?:string };
const SOURCES=[
  {id:"english",name:"Անգլերեն · A1–C1",book:0},
  {id:"biology-1",name:"Կենսաբանություն · Մաս 1",book:31},
  {id:"biology-2",name:"Կենսաբանություն · Մաս 2",book:32},
  {id:"biology-extra",name:"Կենսաբանություն · Լրացուցիչ",book:35},
  {id:"history",name:"Հայոց պատմություն",book:21},
  {id:"armenian",name:"Հայոց լեզու",book:41},
  {id:"physics",name:"Ֆիզիկա",book:51},
  {id:"chemistry",name:"Քիմիա",book:52},
  {id:"geography",name:"Աշխարհագրություն",book:53},
  {id:"russian",name:"Ռուսաց լեզու",book:54},
] as const;
const KEY="shtemarm-flashcards-mastered-v1";
async function loadCards(source:string):Promise<Card[]>{
  if(source==="english")return Object.entries(LEVEL_TEST_QUESTIONS).flatMap(([lv,bank])=>
    bank.filter(q=>!q.passage).map(q=>({id:q.id,front:q.prompt,back:q.options[q.answerIndex]!,
    subject:"English "+lv.toUpperCase(),note:q.explanation})));
  const id=SOURCES.find(s=>s.id===source)?.book;
  if(!id) return [];
  const book=await loadBook(id);
  return historyBookEntries(book,id).flatMap(e=>{
    const u=e.unit;
    if(u.kind!=="mc"||u.questions.length!==1)return [];
    const q=u.questions[0]!;
    const ans=q.options[q.answer];
    return !ans?[]:[{id:e.unit.id,front:q.stem,back:ans,subject:e.section}];
  });
}
function readKnown():Record<string,boolean>{
  try{return JSON.parse(localStorage.getItem(KEY)??"{}") as Record<string,boolean>;}catch{return {};}
}
export const Route=createFileRoute("/flashcards")({
  head:()=>({meta:[{title:"Հիշողության քարտեր · Shtemarm"},{name:"description",content:"Կրկնիր առարկաների թեմաները շրջվող ուսումնական քարտերով։"}]}),
  component:Flashcards,
});
function Flashcards(){
  const tx=useTx();
  const [source,setSource]=useState("english");
  const [attempt,setAttempt]=useState(0);
  const [index,setIndex]=useState(0);
  const [revealed,setRevealed]=useState(false);
  const [known,setKnown]=useState<Record<string,boolean>>({});
  useEffect(()=>setKnown(readKnown()),[]);
  const query=useQuery({queryKey:["flashcard-bank-v1",source],queryFn:()=>loadCards(source),staleTime:Infinity});
  const deck=useMemo(()=>shuffle(query.data??[]).slice(0,20),[query.data,attempt]);
  const current=deck[index];
  const mastered=deck.filter(c=>known[c.id]).length;
  const mark=(yes:boolean)=>{
    if(!current)return;
    const next={...known,[current.id]:yes};
    setKnown(next);
    try{localStorage.setItem(KEY,JSON.stringify(next));}catch{ /* keep current session */ }
    setIndex(i=>Math.min(i+1,deck.length));
    setRevealed(false);
  };
  const restart=()=>{setAttempt(a=>a+1);setIndex(0);setRevealed(false);};
  return <main className="mx-auto max-w-4xl space-y-6 pb-16">
    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4"/>{tx("Գլխավոր էջ")}</Link>
    <header className="space-y-3 rounded-3xl border bg-card p-6 sm:p-8">
      <span className="inline-flex items-center gap-2 text-sm font-black text-primary"><BookOpen className="size-5"/>{tx("Ուսումնական գործիքներ")}</span>
      <h1 className="text-3xl font-black">{tx("Հիշողության քարտեր")}</h1>
      <p className="text-muted-foreground">{tx("Կարդա հարցը, շրջիր քարտը և նշիր՝ արդեն գիտե՞ս պատասխանը։ Քարտերը ստեղծվում են առկա հարցաշարերից և պահում են քո նշումները սարքում։")}</p>
    </header>
    <section className="space-y-5 rounded-3xl border bg-card p-5 sm:p-8">
      <label className="block space-y-2"><span className="block font-bold">{tx("Առարկա և աղբյուր")}</span>
        <select className="h-12 w-full rounded-xl border bg-background px-3" value={source}
          onChange={e=>{setSource(e.target.value);setIndex(0);setRevealed(false);setAttempt(a=>a+1);}}>
          {SOURCES.map(s=><option key={s.id} value={s.id}>{tx(s.name)}</option>)}
        </select>
      </label>
      {query.isPending?<p role="status">{tx("Բեռնվում է…")}</p>:
        query.isError?<div role="alert" className="space-y-2"><p>{tx("Չհաջողվեց բեռնել քարտերը։")}</p><Button onClick={()=>void query.refetch()}>{tx("Կրկին փորձել")}</Button></div>:
        deck.length===0?<p>{tx("Այս բաժնում դեռ հիշողության քարտեր չկան։")}</p>:
        index===deck.length?<div className="space-y-4 text-center">
          <Check className="mx-auto size-12 text-primary"/>
          <h2 className="text-2xl font-black">{tx("Փուլն ավարտված է")}</h2>
          <p>{tx("Այս հավաքածուում իմացիր")}՝ {mastered} / {deck.length}</p>
          <Button onClick={restart}><RotateCcw className="size-4"/>{tx("Նոր քարտեր")}</Button>
        </div>:<div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold"><span>{index+1} / {deck.length}</span>
          <span>{tx("Հայտնի քարտեր")}՝ {mastered}</span></div>
          <progress max={deck.length} value={index} aria-label={tx("Առաջընթաց")} className="h-2 w-full accent-primary"/>
          <button type="button" onClick={()=>setRevealed(v=>!v)} aria-pressed={revealed}
            className="flex min-h-64 w-full flex-col items-center justify-center gap-5 rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-background px-6 py-10 text-center focus-visible:outline-2 focus-visible:outline-primary">
            <span className="text-xs font-bold text-primary">{tx(revealed?"Պատասխան":"Հարց")}</span>
            <span className="max-w-2xl whitespace-pre-wrap text-xl font-bold leading-relaxed sm:text-2xl">{revealed?current?.back:current?.front}</span>
            {revealed&&current?.note&&<span className="text-sm text-muted-foreground">{current.note}</span>}
            <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground"><Eye className="size-4"/>{tx("Սեղմիր քարտը՝ շրջելու համար")}</span>
          </button>
          {!revealed?<Button onClick={()=>setRevealed(true)} className="w-full">{tx("Ցույց տալ պատասխանը")}</Button>:
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={()=>mark(false)}>{tx("Կրկնել ավելի ուշ")}</Button>
              <Button onClick={()=>mark(true)}><Check className="size-4"/>{tx("Գիտեմ")}</Button>
            </div>}
          <p className="text-xs text-muted-foreground">{tx("Սա ինքնաստուգման գործիք է․ «Գիտեմ» նշումը նշանակում է քո ընտրությունը, ոչ ավտոմատ գնահատում։")}</p>
        </div>}
    </section>
  </main>;
}
