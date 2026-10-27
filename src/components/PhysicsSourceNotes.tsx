import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, ListChecks, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";
import { PHYSICS_SOURCES, clampPhysicsPage, type PhysicsVolume } from "@/lib/physics-source";

export type SourceAnswer={
  id:string;question:number;page:number;
  answer:string;checked:boolean;date:string;
};
const STORAGE="shtemarm-physics-source-notes-v1:";
export function readPhysicsSourceAnswers(volume:PhysicsVolume):SourceAnswer[]{
  if(typeof window==="undefined")return [];
  try{
    const data=JSON.parse(localStorage.getItem(STORAGE+volume)??"[]");
    if(!Array.isArray(data))return [];
    return data.filter((a):a is SourceAnswer=>
      typeof a?.id==="string" && a.id.length<100 &&
      Number.isInteger(a.question)&&a.question>=1&&a.question<=9999 &&
      Number.isInteger(a.page)&&a.page>=1&&a.page<=PHYSICS_SOURCES[volume].pages &&
      typeof a.answer==="string"&&a.answer.length<=200 &&
      typeof a.checked==="boolean"&&typeof a.date==="string",
    ).slice(-500);
  }catch{return [];}
}
export function savePhysicsSourceAnswers(volume:PhysicsVolume,notes:SourceAnswer[]):boolean{
  try{localStorage.setItem(STORAGE+volume,JSON.stringify(notes.slice(-500)));return true;}
  catch{return false;}
}
export function PhysicsSourceNotes({volume,page,onJump}:{
  volume:PhysicsVolume;page:number;onJump:(page:number)=>void;
}){
  const tx=useTx();
  const [records,setRecords]=useState<SourceAnswer[]>(()=>readPhysicsSourceAnswers(volume));
  const [question,setQuestion]=useState("");
  const [answer,setAnswer]=useState("");
  const [error,setError]=useState("");
  const [showAll,setShowAll]=useState(false);
  useEffect(()=>{setRecords(readPhysicsSourceAnswers(volume));setQuestion("");setAnswer("");},
    [volume]);
  function persist(next:SourceAnswer[]){
    if(!savePhysicsSourceAnswers(volume,next))
      setError(tx("Չհաջողվեց պահպանել պատասխանը սարքում․ պահոցը կարող է արգելափակված լինել։"));
    else setError("");
    setRecords(next);
  }
  function add(){
    const num=Number(question);
    if(!Number.isInteger(num)||num<1||num>9999){
      setError(tx("Գրի՛ր առաջադրանքի ճիշտ համարը՝ 1-ից 9999։"));return;
    }
    if(!answer.trim()){
      setError(tx("Գրի՛ր քո պատասխանը։"));return;
    }
    const now=new Date().toISOString();
    const existing=records.find(x=>x.question===num);
    const newItem:SourceAnswer={
      id:existing?.id??String(now)+":"+String(num),
      question:num,page:clampPhysicsPage(volume,page),
      answer:answer.trim().slice(0,200),checked:false,date:now,
    };
    persist([...records.filter(a=>a.question!==num),newItem].slice(-500));
    setQuestion("");setAnswer("");
  }
  function setChecked(id:string,checked:boolean){
    persist(records.map(a=>a.id===id?{...a,checked}:a));
  }
  function remove(id:string){persist(records.filter(a=>a.id!==id));}
  const visible=showAll?records.slice().reverse():records.slice(-8).reverse();
  return <section className="space-y-4 rounded-3xl border bg-card p-4 sm:p-6"
    aria-label={tx("Իմ պատասխանները բնօրինակ գրքից")}>
    <div className="flex items-start gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
        <ListChecks className="size-6"/>
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-black">{tx("Իմ պատասխանները բնօրինակ գրքից")}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {tx("Պահպանի՛ր PDF-ում տեսած առաջադրանքի համարը և քո պատասխանը։ Այնուհետև համեմատի՛ր գրքի վերջի պատասխանների աղյուսակի հետ ու նշիր՝ ստուգե՞լ ես։ Այս գործիքը պատասխանները ինքնուրույն չի գնահատում։")}
        </p>
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-end">
      <label className="space-y-1">
        <span className="text-xs font-bold">{tx("Առաջադրանքի համարը")}</span>
        <input type="number" min={1} max={9999} value={question}
          onChange={e=>setQuestion(e.target.value)}
          className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
          placeholder="օր. 125"/>
      </label>
      <label className="space-y-1">
        <span className="text-xs font-bold">{tx("Քո պատասխանը")}</span>
        <input type="text" maxLength={200} value={answer}
          onChange={e=>setAnswer(e.target.value)}
          className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
          placeholder={tx("Տարբերակի համարը կամ թվային արժեքը")}/>
      </label>
      <Button type="button" className="min-h-11" onClick={add}>
        <Save className="mr-2 size-4"/>{tx("Պահպանել")}
      </Button>
    </div>
    {error&&<p role="alert" className="text-xs text-destructive">{error}</p>}
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-bold">{tx("Պահպանված պատասխաններ")}՝ {records.length}</p>
      <Button size="sm" variant="outline" type="button"
        onClick={()=>onJump(PHYSICS_SOURCES[volume].answersStart)}>
        <BookOpen className="mr-2 size-4"/>{tx("Բացել գրքի պատասխանների աղյուսակը")}
      </Button>
    </div>
    {visible.length>0&&<div className="space-y-2">
      {visible.map(note=><div key={note.id}
        className="flex flex-wrap items-center gap-3 rounded-xl border bg-background p-3">
        <button type="button" onClick={()=>onJump(note.page)}
          className="min-w-0 text-left text-sm font-bold text-primary underline-offset-2 hover:underline">
          № {note.question} · {tx("էջ")} {note.page}
        </button>
        <span className="max-w-full min-w-0 flex-1 break-words text-sm">
          {note.answer}
        </span>
        <label className="flex min-h-9 items-center gap-1 text-xs font-semibold">
          <input type="checkbox" className="size-4 accent-primary"
            checked={note.checked} onChange={e=>setChecked(note.id,e.target.checked)}/>
          <CheckCircle2 className="size-4 text-primary"/>
          {tx("Համեմատված է")}
        </label>
        <button type="button" className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-destructive"
          onClick={()=>remove(note.id)} aria-label={tx("Ջնջել {n} առաջադրանքի պատասխանը",{n:note.question})}>
          <Trash2 className="size-4"/>
        </button>
      </div>)}
      {records.length>8&&<Button variant="ghost" size="sm" type="button"
        onClick={()=>setShowAll(v=>!v)}>
        {tx(showAll?"Ցույց տալ վերջին 8-ը":"Ցույց տալ բոլոր պահպանված պատասխանները")}
      </Button>}
    </div>}
    <p className="text-xs text-muted-foreground">
      {tx("Բոլոր գրառումները պահպանվում են միայն այս սարքի դիտարկիչում։ Առաջադրանքի նույն համարը կրկին պահպանելիս նախորդ գրառումը կթարմացվի։")}
    </p>
  </section>;
}
