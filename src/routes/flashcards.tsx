import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Layers, RefreshCw, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadBook, type Unit } from "@/lib/books";
import { historyBookEntries } from "@/lib/history";
import { ASSESSMENT_SOURCES, type AssessmentSubject } from "@/lib/assessment-builder";
import { useTx } from "@/lib/lang";

export const Route=createFileRoute("/flashcards")({
  staticData: { sitemap: true },
  head:()=>({meta:[
      { property: "og:title", content: "Հիշողության քարտեր · Shtemarm" },
      { property: "og:description", content: "Սովորիր քարտերով՝ օգտագործելով շտեմարանների իրական հարցերը և ստուգված պատասխանները։" },{title:"Հիշողության քարտեր · Shtemarm"},
    {name:"description",content:"Սովորիր քարտերով՝ օգտագործելով շտեմարանների իրական հարցերը և ստուգված պատասխանները։"}]}),
  component: FlashcardsPage,
});
type Card={id:string;front:string;back:string;source:string};
function asCard(unit:Unit,section:string):Card|null {
  if(unit.kind==="mc" && unit.questions.length===1){
    const q=unit.questions[0]!,answer=q.options[q.answer];
    return answer && q.stem.trim() ? {id:unit.id,front:q.stem,back:answer,source:section}:null;
  }
  if(unit.kind==="num" && unit.questions.length===1) {
    const q=unit.questions[0]!;
    return q.stem.trim() && q.answer ? {id:unit.id,front:q.stem,back:q.answer,source:section}:null;
  }
  return null;
}
function shuffle<T>(a:readonly T[]):T[]{
  const copy=[...a];for(let i=copy.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[copy[i],copy[k]]=[copy[k]!,copy[i]!];}
  return copy;
}
async function loadCards(subject:AssessmentSubject):Promise<Card[]>{
  const source=ASSESSMENT_SOURCES.find(s=>s.key===subject)!;
  const books=await Promise.all(source.books.map(id=>loadBook(id)));
  const entries=books.flatMap((book,i)=>historyBookEntries(book,source.books[i]!));
  return entries.map(e=>asCard(e.unit,e.section)).filter((v):v is Card=>v!==null);
}
function readKnown(subject:AssessmentSubject):Record<string,boolean>{
  if(typeof window==="undefined")return {};
  try{
    const v=JSON.parse(window.localStorage.getItem("shtemarm-flashcards-"+subject)||"{}");
    if(!v || typeof v!=="object" || Array.isArray(v))return {};
    return Object.fromEntries(Object.entries(v).filter(([k,value])=>k.length<200 && typeof value==="boolean")) as Record<string,boolean>;
  }catch{return {};}
}
function saveKnown(subject:AssessmentSubject,known:Record<string,boolean>){
  try{window.localStorage.setItem("shtemarm-flashcards-"+subject,JSON.stringify(known));}catch{/* The current practice session still works. */}
}
function FlashcardsPage(){
  const tx=useTx();
  const [subject,setSubject]=useState<AssessmentSubject>("biology");
  const [retry,setRetry]=useState(0);
  const [selected,setSelected]=useState<string[]>([]);
  const [index,setIndex]=useState(0);
  const [revealed,setRevealed]=useState(false);
  const [known,setKnown]=useState<Record<string,boolean>>(()=>readKnown("biology"));
  const [onlyMissed,setOnlyMissed]=useState(false);
  const [dragX,setDragX]=useState(0);
  const [animating,setAnimating]=useState(false);
  const start=useRef<{x:number;y:number;id:number;dragged:boolean}|null>(null);
  const animationTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const clickResetTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const suppressFlipClick=useRef(false);
  useEffect(()=>()=> {
    if(animationTimer.current)clearTimeout(animationTimer.current);
    if(clickResetTimer.current)clearTimeout(clickResetTimer.current);
  },[]);
  const result=useQuery({queryKey:["flashcards-v1",subject],queryFn:()=>loadCards(subject),staleTime:Infinity});
  const all=result.data??[];
  const sections=useMemo(()=>[...new Set(all.map(v=>v.source))],[all]);
  const cards=useMemo(()=>{
    const pool=all.filter(v=>(!selected.length||selected.includes(v.source))&&(!onlyMissed||known[v.id]===false));
    return shuffle(pool).slice(0,30);
    // retry deliberately changes the set; cards remain stable while studying
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[all,selected,retry,onlyMissed]);
  const knownCount=Object.values(known).filter(Boolean).length;
  const current=cards[index]??null;
  const done=cards.length>0 && index>=cards.length;
  const answer=(success:boolean)=>{
    if(!current)return;
    setKnown(p=>{
      const next={...p,[current.id]:success};
      saveKnown(subject,next);
      return next;
    });
    setIndex(i=>i+1);setRevealed(false);
  };
  const finishSwipe=(success:boolean)=>{
    if(animating||!current)return;
    // Accessible instantaneous result when the OS or student disables motion.
    const reduceMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
      document.documentElement.classList.contains("user-reduced-motion");
    if(reduceMotion){answer(success);setDragX(0);return;}
    setAnimating(true);
    setDragX(success?-window.innerWidth:window.innerWidth);
    if(animationTimer.current)clearTimeout(animationTimer.current);
    animationTimer.current=setTimeout(()=>{answer(success);setDragX(0);setAnimating(false);animationTimer.current=null;},210);
  };
  const pointerDown=(e:ReactPointerEvent<HTMLButtonElement>)=>{
    if(animating||e.button!==0)return;
    start.current={x:e.clientX,y:e.clientY,id:e.pointerId,dragged:false};
    if(clickResetTimer.current)clearTimeout(clickResetTimer.current);
    suppressFlipClick.current=false;
  };
  const pointerMove=(e:ReactPointerEvent<HTMLButtonElement>)=>{
    const s=start.current;
    if(!s||s.id!==e.pointerId||animating)return;
    const dx=e.clientX-s.x,dy=e.clientY-s.y;
    if(!s.dragged&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12){start.current=null;return;}
    if(!s.dragged&&Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.2){
      s.dragged=true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    if(s.dragged){
      const offset=Math.max(-240,Math.min(240,dx));
      setDragX(prev=>Math.abs(offset-prev)<3?prev:offset);
    }
  };
  const pointerUp=(e:ReactPointerEvent<HTMLButtonElement>)=>{
    const s=start.current;
    if(!s||s.id!==e.pointerId)return;
    start.current=null;
    const dx=e.clientX-s.x,dy=e.clientY-s.y;
    if(s.dragged){
      // A completed drag must not also fire the card's click-to-reveal action.
      suppressFlipClick.current=true;
      if(clickResetTimer.current)clearTimeout(clickResetTimer.current);
      clickResetTimer.current=setTimeout(()=>{suppressFlipClick.current=false;clickResetTimer.current=null;},0);
      if(Math.abs(dx)>=85&&Math.abs(dx)>Math.abs(dy)*1.25)finishSwipe(dx<0);
      else setDragX(0);
    } else setDragX(0);
  };
  const restart=()=>{if(animationTimer.current)clearTimeout(animationTimer.current);animationTimer.current=null;setAnimating(false);setDragX(0);start.current=null;suppressFlipClick.current=false;setRetry(n=>n+1);setIndex(0);setRevealed(false);};
  return <main className="mx-auto max-w-5xl space-y-6 px-4 pb-20">
    <Link to="/study-tools" className="inline-flex items-center gap-2 pt-5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4"/>{tx("Ուսումնական գործիքներ")}</Link>
    <header className="space-y-3 rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-violet-500/10 p-6 sm:p-8">
      <span className="flex items-center gap-2 text-sm font-bold text-primary"><Layers className="size-5"/>{tx("Կրկնության գործիք")}</span>
      <h1 className="text-3xl font-black">{tx("Հիշողության քարտեր")}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">{tx("Տես հարցը, հիշիր պատասխանը, բացիր քարտը և նշիր՝ գիտեի՞ր, թե՞ դեռ պետք է կրկնել։ Քարտերը վերցվում են կայքի առկա շտեմարաններից։")}</p>
    </header>
    <div className="no-print grid gap-4 rounded-3xl border bg-card p-5 sm:grid-cols-2">
      <label className="space-y-2"><span className="text-sm font-bold">{tx("Առարկա")}</span>
        <select className="h-12 w-full rounded-xl border bg-background px-3" value={subject} onChange={e=>{
          const next=e.target.value as AssessmentSubject;
          setSubject(next);setSelected([]);setKnown(readKnown(next));setOnlyMissed(false);restart();
        }}>{ASSESSMENT_SOURCES.map(s=><option key={s.key} value={s.key}>{tx(s.label)}</option>)}</select>
      </label>
      <div className="space-y-2">
        <p className="text-sm font-bold">{tx("Կրկնություն")}</p>
        <p className="text-xs text-muted-foreground">{tx("Հիշված քարտեր")}՝ {knownCount}</p>
        <label className="flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" checked={onlyMissed}
          onChange={e=>{setOnlyMissed(e.target.checked);setIndex(0);setRevealed(false)}}/>
          {tx("Միայն չիմացած քարտերը")}</label>
      </div>
      {sections.length>0 && <details className="space-y-2 sm:col-span-2">
        <summary className="cursor-pointer font-semibold">{tx("Թեմաների ընտրություն")} · {selected.length?selected.length:tx("Բոլորը")}</summary>
        <div className="grid max-h-48 gap-2 overflow-auto rounded-xl border p-3 sm:grid-cols-2">
          {sections.map(section=><label className="flex items-start gap-2 text-sm" key={section}>
            <input type="checkbox" className="mt-1" checked={selected.includes(section)}
              onChange={e=>{setSelected(old=>e.target.checked?[...old,section]:old.filter(x=>x!==section));setIndex(0);setRevealed(false);}}/>
            <span>{section}</span>
          </label>)}
        </div>
      </details>}
    </div>
    {result.isPending ? <p role="status">{tx("Քարտերը բեռնվում են…")}</p> :
    result.isError ? <div role="alert"><p>{tx("Չհաջողվեց բեռնել քարտերը։")}</p><Button onClick={()=>void result.refetch()}>{tx("Կրկին փորձել")}</Button></div> :
    !cards.length ? <section className="rounded-3xl border bg-card p-8 text-center">
      <h2 className="font-black">{tx("Այս ընտրությամբ քարտեր չեն գտնվել։")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{tx("Ընտրիր այլ թեմաներ կամ անջատիր «Միայն չիմացած քարտերը» տարբերակը։")}</p>
      <Button className="mt-4" onClick={()=>{setOnlyMissed(false);setSelected([]);restart()}}>{tx("Վերադառնալ բոլոր քարտերին")}</Button>
    </section> : done ? <section className="space-y-4 rounded-3xl border bg-card p-8 text-center">
      <CheckCircle2 className="mx-auto size-12 text-primary"/>
      <h2 className="text-2xl font-black">{tx("Կրկնությունն ավարտվեց")}</h2>
      <p>{tx("Դիտված քարտեր")}՝ {cards.length} · {tx("Գիտեի")}՝ {cards.filter(c=>known[c.id]===true).length}</p>
      <Button onClick={restart}><RefreshCw className="mr-2 size-4"/>{tx("Նոր քարտեր")}</Button>
    </section> :
    <section className="sht-flashcard-session space-y-4" data-swipe-intent={dragX < -32 ? "known" : dragX > 32 ? "review" : "none"}>
      <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
        <span>{index+1} / {cards.length}</span><span className="max-w-[65%] truncate">{current?.source}</span>
      </div>
      <progress className="h-2 w-full accent-primary" max={cards.length} value={index}/>
      <div className="sht-flashcard-choices grid grid-cols-2 gap-3 text-center text-xs font-bold sm:text-sm">
        <span className="sht-flashcard-choice-known rounded-xl bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">← {tx("Գիտեի")}</span>
        <span className="sht-flashcard-choice-review rounded-xl bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">{tx("Պետք է կրկնեմ")} →</span>
      </div>
      <button type="button" aria-expanded={revealed} aria-label={tx("Հպիր քարտին՝ շրջելու համար")} className="sht-flashcard-card relative flex min-h-64 w-full touch-pan-y select-none flex-col items-center justify-center gap-5 rounded-3xl border bg-card p-6 text-center shadow-sm transition-[transform,opacity,border-color] duration-200 ease-out hover:border-primary/50 sm:min-h-80"
        style={{transform:"translate3d("+dragX+"px,0,0) rotate("+(dragX/24)+"deg)",opacity:Math.max(.35,1-Math.abs(dragX)/500),transition:dragX!==0&&!animating?"none":undefined}}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{start.current=null;setDragX(0)}}
        onClick={()=>{if(!suppressFlipClick.current&&!animating&&Math.abs(dragX)<8)setRevealed(v=>!v)}}>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">{revealed?tx("Պատասխան"):tx("Հարց")}</span>
        <span className="max-w-2xl whitespace-pre-wrap text-lg font-bold leading-relaxed sm:text-2xl">{revealed?current?.back:current?.front}</span>
        <span className="text-xs text-muted-foreground">{tx("Հպիր քարտին՝ շրջելու համար")}</span>
      </button>
      <div className="sht-flashcard-actions grid grid-cols-2 gap-2 sm:grid-cols-3">
        {!revealed ? <Button size="lg" className="col-span-2 sm:col-span-3" onClick={()=>setRevealed(true)}>{tx("Տեսնել պատասխանը")}</Button> :
          <>
            <Button variant="outline" size="lg" disabled={animating} onClick={()=>finishSwipe(false)}>{tx("Պետք է կրկնեմ")}</Button>
            <Button size="lg" disabled={animating} onClick={()=>finishSwipe(true)}>{tx("Գիտեի")}</Button>
            <Button variant="ghost" size="lg" className="col-span-2 sm:col-span-1" onClick={()=>{setIndex(v=>v+1);setRevealed(false)}}>{tx("Բաց թողնել")}</Button>
          </>}
      </div>
      <p className="text-center text-xs text-muted-foreground">{tx("Միայն չիմացած քարտերը")} · {Object.values(known).filter(v=>v===false).length}</p>
      <Button variant="ghost" onClick={restart}><RotateCcw className="mr-2 size-4"/>{tx("Սկսել նորից")}</Button>
    </section>}
  </main>;
}
