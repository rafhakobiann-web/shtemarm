import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardCheck,
  ExternalLink, FileUp, Loader2, RotateCcw, ShieldCheck, Trophy,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";
import { getLocalPhysicsPdf, putLocalPhysicsPdf, validatePhysicsSourceFile,
  confirmPhysicsSourcePdf, PHYSICS_SOURCES, type PhysicsVolume } from "@/lib/physics-source";
import { physicsScanRound, scorePhysicsScan, type PhysicsIndexedQuestion } from "@/lib/physics-scan-index";

type Session = { items: PhysicsIndexedQuestion[]; exam: boolean };
type VerifyStatus = "loading" | "checking" | "verified" | "different" | "unavailable";
type Result = { correct:number;answered:number;total:number };

export function PhysicsScanPractice() {
  const tx=useTx();
  const [volume,setVolume]=useState<PhysicsVolume>(61);
  const verificationEpoch=useRef(0);
  const [file,setFile]=useState<Blob|null>(null);
  const [name,setName]=useState("");
  const [objectUrl,setObjectUrl]=useState("");
  const [status,setStatus]=useState<VerifyStatus>("loading");
  const [error,setError]=useState("");
  const [from,setFrom]=useState(1);
  const [count,setCount]=useState(20);
  const [random,setRandom]=useState(false);
  const [exam,setExam]=useState(false);
  const [session,setSession]=useState<Session|null>(null);
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [finished,setFinished]=useState(false);
  const [review,setReview]=useState(false);
  const source=PHYSICS_SOURCES[volume];

  // The key is pinned to the exact PDF edition: never grade an unknown scan.
  useEffect(()=>{
    let active=true;
    const epoch=++verificationEpoch.current;
    setFile(null);setName("");setStatus("loading");setError("");setSession(null);
    setFinished(false);setAnswers({});setIndex(0);setFrom(1);
    getLocalPhysicsPdf(volume).then(async item=>{
      if(!active||verificationEpoch.current!==epoch)return;
      if(!item){setStatus("unavailable");return;}
      setFile(item.pdf);setName(item.name);setStatus("checking");
      try{
        const ok=await confirmPhysicsSourcePdf(volume,item.pdf);
        if(active&&verificationEpoch.current===epoch)setStatus(ok?"verified":"different");
      }catch{
        if(active&&verificationEpoch.current===epoch)setStatus("unavailable");
      }
    }).catch(()=>{
      if(active&&verificationEpoch.current===epoch)setStatus("unavailable");
    });
    return ()=>{active=false;};
  },[volume]);
  useEffect(()=>{
    if(!file){setObjectUrl("");return;}
    const link=URL.createObjectURL(file);
    setObjectUrl(link);
    return ()=>URL.revokeObjectURL(link);
  },[file]);

  async function selectFile(chosen:File){
    const message=validatePhysicsSourceFile(chosen);
    if(message){setError(message);return;}
    const epoch=++verificationEpoch.current;
    setError("");setFile(chosen);setName(chosen.name);
    setStatus("checking");setSession(null);setAnswers({});setFinished(false);
    try{
      const valid=await confirmPhysicsSourcePdf(volume,chosen);
      if(verificationEpoch.current!==epoch)return;
      if(!valid){
        setStatus("different");
        return; // Wrong editions must never be marked against this answer key.
      }
      setStatus("verified");
      try{await putLocalPhysicsPdf(volume,chosen);}
      catch{if(verificationEpoch.current===epoch)setError(tx("PDF-ը բացված է, բայց սարքում պահպանել չհաջողվեց։"));}
    }catch{
      if(verificationEpoch.current!==epoch)return;
      setStatus("unavailable");
      setError(tx("PDF-ի նույնականությունը ստուգել չհաջողվեց։ Ստուգված թեստը հասանելի չէ։"));
    }
  }
  const active=session?.items[index];
  const page=active?.page??source.questionsStart;
  const url=objectUrl ? objectUrl+"#page="+page+"&zoom=page-width" : "";
  const marked=Object.keys(answers).length;
  const stats:Result=useMemo(
    ()=>scorePhysicsScan(session?.items??[],answers),
    [session,answers],
  );
  function start(){
    if(status!=="verified")return;
    try{
      const items=physicsScanRound(volume,from,count,random);
      if(!items.length)return;
      setSession({items,exam});setIndex(0);setAnswers({});
      setFinished(false);setReview(false);setError("");
    }catch(e){setError(e instanceof Error?e.message:tx("Թեստի կազմումը չհաջողվեց։"));}
  }
  function finish(){
    if(!session||finished)return;
    setFinished(true);setReview(false);
    try{
      const key="shtemarm-physics-source-rounds-v1";
      const saved=JSON.parse(localStorage.getItem(key)??"[]") as unknown;
      const list=Array.isArray(saved)?saved.slice(-39):[];
      localStorage.setItem(key,JSON.stringify([...list,{
        volume,correct:stats.correct,total:stats.total,answered:stats.answered,
        startedAt:session.items[0]?.number,at:new Date().toISOString(),
      }]));
    }catch{/* storage is optional */}
  }
  function setChoice(choice:string){
    if(!active||finished)return;
    if(!session?.exam && answers[active.id])return;
    setAnswers(all=>({...all,[active.id]:choice}));
  }
  function reset(){setSession(null);setAnswers({});setFinished(false);setIndex(0);setReview(false);}
  const maxCount=126-from;
  return <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-9">
    <Link to="/physics/original" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
      <ArrowLeft className="size-4"/>{tx("Բնօրինակից թվայնացված հարցերը")}
    </Link>
    <header className="space-y-3 rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-8">
      <span className="inline-flex items-center gap-2 text-xs font-black text-primary">
        <ShieldCheck className="size-4"/>{tx("Բնօրինակ PDF · պատասխանների տպագիր աղյուսակ")}
      </span>
      <h1 className="text-2xl font-black sm:text-4xl">{tx("Ֆիզիկա · 250 բնօրինակ առաջադրանքով վարժանք")}</h1>
      <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
        {tx("Երկու գրքերի առաջին 125-ական առաջադրանքների էջերն ու պատասխանները կապակցված են բնօրինակ սկանների հետ։ Հարցը կարդա կողքի PDF-ից՝ պահպանելով բոլոր բանաձևերն ու գծագրերը, ապա սեղմիր տպագիր տարբերակի համարը։ Սա տեքստային արտագրություն չէ։")}
      </p>
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full border bg-card px-3 py-1.5">{tx("Մաս I · 125 առաջադրանք")}</span>
        <span className="rounded-full border bg-card px-3 py-1.5">{tx("Մաս II · 125 առաջադրանք")}</span>
        <span className="rounded-full border bg-card px-3 py-1.5">{tx("PDF-ը չի ուղարկվում սերվերին")}</span>
      </div>
    </header>
    {!session ? <section className="space-y-5 rounded-3xl border bg-card p-4 sm:p-7">
      <div className="grid gap-2 sm:grid-cols-2">
        {([61,62] as const).map(id=><button type="button" key={id}
          aria-pressed={volume===id} onClick={()=>setVolume(id)}
          className={"min-h-20 rounded-2xl border-2 p-4 text-left transition-colors "+
            (volume===id?"border-primary bg-primary/5":"border-border hover:border-primary/40")}>
          <strong className="block text-lg">{tx(id===61?"Ֆիզիկա · Մաս I":"Ֆիզիկա · Մաս II")}</strong>
          <span className="text-xs text-muted-foreground">{tx("Բնօրինակի էջերի հետ կապակցված 125 հարց")}</span>
        </button>)}
      </div>
      <div className="space-y-3 rounded-2xl border bg-muted/30 p-4">
        <h2 className="flex items-center gap-2 text-sm font-black">
          <FileUp className="size-5 text-primary"/>{tx("Բացել իմ բնօրինակ PDF-ը")}
        </h2>
        <input type="file" accept=".pdf,application/pdf" key={volume}
          className="block w-full rounded-xl border bg-background p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-primary-foreground"
          onChange={e=>{const item=e.currentTarget.files?.[0];if(item)void selectFile(item);}}
          aria-label={tx("Ընտրել բնօրինակ ֆիզիկայի PDF-ը")}/>
        <p className="text-xs text-muted-foreground">
          {tx("Ստուգվում է ֆայլի SHA-256-ը. միայն նույնական 2017 թ. PDF-ով է հնարավոր ավտոմատ գնահատումը։")}
        </p>
        {status==="loading"||status==="checking"?<p className="flex items-center gap-2 text-sm" role="status">
          <Loader2 className="size-4 animate-spin"/>{tx("Ստուգվում է PDF-ի նույնականությունը…")}
        </p>:status==="verified"?<p className="flex items-start gap-2 break-all text-sm font-semibold text-emerald-700 dark:text-emerald-300" role="status">
          <CheckCircle2 className="size-5 shrink-0"/>{name} · {tx("PDF-ը նույնական է բնօրինակին")}
        </p>:status==="different"?<p className="flex gap-2 text-sm text-destructive" role="alert">
          <TriangleAlert className="size-5 shrink-0"/>
          {tx("Այս PDF-ը չի համընկնում տվյալ մասի բնօրինակի հետ։ Սխալ գնահատումից խուսափելու համար ընտրիր քո տրամադրած ճիշտ ֆայլը։")}
        </p>:<p className="text-sm text-muted-foreground">
          {tx("Ընտրիր բնօրինակ PDF-ը՝ ֆայլը մնում է քո սարքում։")}
          <Link to="/physics/books" search={{volume,page:5}} className="ml-2 font-bold text-primary underline">{tx("Բացել ընթերցիչը")}</Link>
        </p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-sm font-bold">{tx("Սկզբնական առաջադրանքի համարը")}</span>
          <input type="number" min={1} max={125} value={from}
            onChange={e=>setFrom(Number(e.target.value))} className="h-12 w-full rounded-xl border bg-background px-3"/>
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-bold">{tx("Առաջադրանքների քանակ")}</span>
          <select value={count} onChange={e=>setCount(Number(e.target.value))}
            className="h-12 w-full rounded-xl border bg-background px-3">
            {[10,20,40,60,125].map(n=><option value={n} key={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="size-4 accent-primary" checked={exam} onChange={e=>setExam(e.target.checked)}/>
          {tx("Քննություն · ստուգել վերջում")}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="size-4 accent-primary" checked={random} onChange={e=>setRandom(e.target.checked)}/>
          {tx("Խառնել առաջադրանքների հերթականությունը")}
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        {tx("Եթե ընտրված սկզբնական համարից հետո ավելի քիչ հարց է մնացել, թեստում կընդգրկվեն հասանելի բոլոր հարցերը։")}
      </p>
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button size="lg" className="min-h-12 w-full" disabled={status!=="verified"||!Number.isInteger(from)||from<1||from>125}
        onClick={start}><ClipboardCheck className="mr-2 size-5"/>
        {tx("Սկսել բնօրինակ հարցերով վարժանքը")}
      </Button>
    </section>:<div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
        <span className="font-black">{tx("Առաջադրանք {n} / {total}",{n:index+1,total:session.items.length})}</span>
        <span className="text-sm text-muted-foreground">{tx("Պատասխանված է՝ {n}",{n:marked})}</span>
        <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="mr-2 size-4"/>{tx("Նոր վարժանք")}</Button>
      </div>
      <progress max={session.items.length} value={marked} className="h-2 w-full accent-primary"
        aria-label={tx("Վարժանքի առաջընթաց")}/>
      {finished&&<section className="space-y-3 rounded-2xl border bg-secondary p-5" role="status">
        <h2 className="flex items-center gap-2 text-xl font-black">
          <Trophy className="size-5"/>{tx("Արդյունք՝ {n} / {total}",{n:stats.correct,total:stats.total})}
        </h2>
        <p className="text-sm">{tx("Պատասխանված է՝ {n}",{n:stats.answered})}</p>
        <Button variant="outline" onClick={()=>setReview(v=>!v)}>
          {tx(review?"Թաքցնել պատասխանների բանալին":"Վերանայել պատասխանները")}
        </Button>
      </section>}
      {active&&(!finished||review)&&<>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-primary/5 px-4 py-3">
          <div>
            <p className="text-sm font-black">{tx("Բնօրինակի առաջադրանք № {n}",{n:active.number})}</p>
            <p className="text-xs text-muted-foreground">{tx("Բնօրինակի ֆիզիկական PDF էջ՝ {n}",{n:active.page})}</p>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-bold text-primary">
            <ExternalLink className="size-4"/>{tx("Բացել առանձին ներդիրում")}
          </a>
        </div>
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)]">
          <div className="min-w-0 overflow-hidden rounded-2xl border bg-card">
            <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
              <span className="text-xs font-bold">{tx("Կարդա բնօրինակ էջը՝ ներառյալ գծագրերը")}</span>
              <span className="text-xs tabular-nums">{active.page}/{source.pages}</span>
            </div>
            <iframe src={url} loading="lazy" title={tx("Ֆիզիկայի բնօրինակ էջ {n}",{n:active.page})}
              className="h-[62vh] min-h-[400px] w-full border-0 sm:h-[76vh]"/>
          </div>
          <aside className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <BookOpen className="size-5 text-primary"/>{tx("Ընտրիր գրքում նշված տարբերակը")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tx("Նայիր բնօրինակի № {n} առաջադրանքի չորս տարբերակներին։ Ընտրիր ճիշտ տարբերակի համարը այստեղ։",{n:active.number})}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["1","2","3","4"] as const).map(value=>{
                const chosen=answers[active.id]===value;
                const show=finished||(!session.exam && !!answers[active.id]);
                const correct=show&&active.answer===value;
                const incorrect=show&&chosen&&!correct;
                return <button type="button" key={value} aria-pressed={chosen}
                  disabled={finished||(!session.exam && !!answers[active.id])}
                  onClick={()=>setChoice(value)}
                  className={"min-h-16 rounded-xl border-2 p-3 text-base font-black outline-offset-2 transition-colors "+
                    (correct?"border-emerald-500 bg-emerald-500/10":
                      incorrect?"border-destructive bg-destructive/10":
                      chosen?"border-primary bg-primary/10":"border-border hover:border-primary/50")}>
                  {tx("Տարբերակ {n}",{n:value})}
                </button>;
              })}
            </div>
            {(finished||(!session.exam && answers[active.id]))&&<div role="status"
              className="space-y-2 rounded-xl border bg-muted/50 p-3 text-sm">
              <p className="font-black">{tx("Գրքի ճիշտ պատասխան՝ տարբերակ {n}",{n:active.answer})}</p>
              <p className="text-xs text-muted-foreground">
                {tx("Պատասխանը ստուգված է գրքի {n}-րդ էջի աղյուսակից։",{n:active.keyPage})}
              </p>
            </div>}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
              <Button variant="outline" disabled={index===0} onClick={()=>setIndex(i=>i-1)}>
                <ArrowLeft className="mr-1 size-4"/>{tx("Նախորդը")}
              </Button>
              <Button variant="outline" disabled={index===session.items.length-1} onClick={()=>setIndex(i=>i+1)}>
                {tx("Հաջորդը")}<ArrowRight className="ml-1 size-4"/>
              </Button>
            </div>
            <a href={objectUrl+"#page="+source.answersStart} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-muted px-3 text-sm font-bold">
              <BookOpen className="size-4"/>{tx("Բնօրինակի պատասխանների էջ")}
            </a>
          </aside>
        </section>
      </>}
      <nav className="space-y-2 rounded-2xl border bg-card p-4" aria-label={tx("Առաջադրանքների համարներ")}>
        <p className="text-sm font-black">{tx("Անցնել այլ առաջադրանքի")}</p>
        <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
          {session.items.map((q,i)=><button type="button" key={q.id}
            aria-current={i===index?"step":undefined} onClick={()=>{setIndex(i);if(finished)setReview(true);}}
            className={"min-h-10 min-w-10 rounded-lg border px-2 text-sm font-bold "+
              (index===i?"border-primary bg-primary text-primary-foreground":
                answers[q.id]?"bg-muted":"bg-background hover:border-primary/40")}>
            {q.number}
          </button>)}
        </div>
      </nav>
      {!finished&&<Button className="min-h-12 w-full" onClick={finish}>
        <ClipboardCheck className="mr-2 size-5"/>{tx("Ավարտել և տեսնել արդյունքը")}
      </Button>}
    </div>}
    <p className="text-center text-xs leading-relaxed text-muted-foreground">
      {tx("Նշում․ այս վարժանքը օգտագործում է բնօրինակ սկանների էջային ցուցիչն ու 1–125 պատասխանների աղյուսակը, ոչ թե ամբողջ գրքի տեքստային արտագրությունը։ Ավելացված հեղինակային ուսումնական հարցերը պահպանված են առանձին։")}
    </p>
  </main>;
}
