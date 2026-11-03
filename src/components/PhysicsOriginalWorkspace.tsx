import {useMemo,useState} from "react";
import {Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {BookOpenCheck,ClipboardCheck,RefreshCw,ShieldCheck,Shuffle,Trophy} from "lucide-react";
import {Button} from "@/components/ui/button";
import {UnitCard,scoreUnit,type UnitAnswer} from "@/components/UnitCard";
import {useTx} from "@/lib/lang";
import {recordUnitMistakes} from "@/lib/unitMistakes";
import {PHYSICS_SOURCES,type PhysicsVolume} from "@/lib/physics-source";
import {loadPhysicsOriginalBank,sourceQuestionsForVolume,sourceAsUnit,
 type PhysicsSourceEntry} from "@/lib/physics-original";

const RESULTS="shtemarm-physics-real-transcriptions-results-v1";
type Session={questions:PhysicsSourceEntry[];exam:boolean};
export function PhysicsOriginalWorkspace(){
  const tx=useTx();
  const query=useQuery({queryKey:["physics-original-transcriptions"],queryFn:loadPhysicsOriginalBank,
    staleTime:Infinity,retry:1});
  const [volume,setVolume]=useState<PhysicsVolume>(61);
  const [exam,setExam]=useState(false);
  const [random,setRandom]=useState(false);
  const [session,setSession]=useState<Session|null>(null);
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<string,UnitAnswer>>({});
  const [revealed,setRevealed]=useState<Record<string,boolean>>({});
  const [complete,setComplete]=useState(false);
  const [showReview,setShowReview]=useState(false);
  const questions=useMemo(()=>query.data?sourceQuestionsForVolume(query.data,volume):[],
    [query.data,volume]);
  const units=useMemo(()=>session?.questions.map(sourceAsUnit)??[],[session]);
  const current=session?.questions[index];
  const unit=units[index];
  const total=units.length;
  const answered=units.filter(u=>answers[u.id]?.mc?.[u.label]).length;
  const correct=units.reduce((sum,u)=>sum+scoreUnit(u,answers[u.id]).got,0);
  function start(){
    const chosen=random?[...questions].sort(()=>Math.random()-0.5):[...questions];
    setSession({questions:chosen,exam});setIndex(0);setAnswers({});
    setRevealed({});setComplete(false);setShowReview(false);
  }
  function finish(){
    if(complete)return;
    recordUnitMistakes("physics",units,answers);
    setComplete(true);
    try{
      const history=JSON.parse(window.localStorage.getItem(RESULTS)??"[]") as unknown;
      const next=Array.isArray(history)?history.filter(x=>x!==null).slice(-29):[];
      window.localStorage.setItem(RESULTS,JSON.stringify([...next,{
        volume,answered,correct,total,at:new Date().toISOString(),
      }]));
    }catch{/* local storage is optional */}
  }
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
    <header className="space-y-3 rounded-3xl border bg-gradient-to-br from-primary/10 to-card p-5 sm:p-8">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
        <ShieldCheck className="size-4"/>{tx("Բնօրինակ PDF-ից թվայնացված առաջադրանքներ")}
      </p>
      <h1 className="text-2xl font-black sm:text-4xl">{tx("Ֆիզիկայի շտեմարաններ · Տեքստային առաջադրանքներ")}</h1>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {tx("Այստեղ ընդգրկված են տրամադրած գրքերից առաջին ստուգման փուլն անցած առաջադրանքները՝ պատասխանների բնօրինակ աղյուսակից կապակցված տարբերակներով։ Որոշ ձևակերպումների կետադրությունը հարմարեցված է ընթերցմանը։ Մնացած առաջադրանքների թվայնացումը դեռ ընթացքի մեջ է։")}
      </p>
      <div className="flex flex-wrap gap-2">
        <Link to="/subject/$subject" params={{subject:"physics"}}
          className="inline-flex min-h-11 items-center rounded-xl border bg-card px-4 text-sm font-semibold">
          {tx("Ֆիզիկայի ուսումնական կենտրոն")}
        </Link>
        <Link to="/physics/scan-practice"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">
          <ClipboardCheck className="size-4"/>{tx("Սկզբնական 250 բնօրինակ հարց · PDF-ով վարժանք")}
        </Link>
        <Link to="/physics/books" search={{volume,page:5}}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold">
          <BookOpenCheck className="size-4"/>{tx("Կարդալ ամբողջ բնօրինակ PDF-ը")}
        </Link>
      </div>
    </header>
    {!session ? <section className="space-y-5 rounded-3xl border bg-card p-5 sm:p-7">
      <h2 className="text-xl font-black">{tx("Ընտրիր բնօրինակ շտեմարանը")}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {([61,62] as const).map(id=><button key={id} type="button" onClick={()=>setVolume(id)}
          aria-pressed={volume===id}
          className={"min-h-28 space-y-2 rounded-2xl border-2 p-4 text-left "+
            (volume===id?"border-primary bg-primary/5":"border-border hover:border-primary/40")}>
          <span className="block text-lg font-black">{tx(id===61?"Մաս I":"Մաս II")}</span>
          <span className="block text-xs text-muted-foreground">{PHYSICS_SOURCES[id].pages} {tx("էջ")}
          </span>
          <span className="block text-sm font-semibold">{query.data?
            sourceQuestionsForVolume(query.data,id).length:0} {tx("թվայնացված ստուգված հարց")}
          </span>
        </button>)}
      </div>
      {query.isPending&&<p role="status">{tx("Բեռնվում են իրական առաջադրանքները…")}</p>}
      {query.isError&&<div role="alert" className="space-y-2">
        <p className="text-sm text-destructive">{tx("Տվյալները բեռնել չհաջողվեց։")}</p>
        <Button variant="outline" onClick={()=>void query.refetch()}>
          <RefreshCw className="mr-2 size-4"/>{tx("Կրկին փորձել")}
        </Button>
      </div>}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-bold">{tx("Ուզո՞ւմ ես լուծել ավելի շատ բնօրինակ առաջադրանքներ։")}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {tx("Արդեն կապակցված են երկու գրքերի առաջին 125-ական հարցերի ճշգրիտ PDF էջերն ու պատասխանները։ Տեքստը և գծագրերը ցուցադրվում են քո սեփական PDF-ից։")}
        </p>
        <Link to="/physics/scan-practice" className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground">
          {tx("Բացել 250 հարցանոց վարժանքը")}
        </Link>
      </div>
      {query.data&&<div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {tx("Բնօրինակում կան ավելի շատ առաջադրանքներ։ Այստեղ առայժմ հասանելի են միայն ստուգված տեքստով և պատասխանով հարցերը։")}
        </p>
        <fieldset className="space-y-2">
          <legend className="text-sm font-bold">{tx("Ռեժիմ")}</legend>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={!exam?"default":"outline"} onClick={()=>setExam(false)}>
              {tx("Ուսուցում · բացատրությամբ")}
            </Button>
            <Button type="button" variant={exam?"default":"outline"} onClick={()=>setExam(true)}>
              {tx("Թեստ · ստուգել վերջում")}
            </Button>
          </div>
        </fieldset>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-primary" checked={random}
            onChange={e=>setRandom(e.target.checked)}/>
          <Shuffle className="size-4"/>{tx("Խառնել առաջադրանքների հերթականությունը")}
        </label>
        <Button type="button" size="lg" disabled={!questions.length} onClick={start}
          className="min-h-12 w-full">
          <ClipboardCheck className="mr-2 size-5"/>
          {tx("Սկսել՝ {n} իրական առաջադրանքով",{n:questions.length})}
        </Button>
      </div>}
    </section> : <>
      <section className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <strong>{tx("Ֆիզիկա · {book} · {mode}",{
            book:volume===61?"Մաս I":"Մաս II",
            mode:session.exam?"Թեստ":"Ուսուցում",
          })}</strong>
          <span className="text-sm font-bold tabular-nums">{answered}/{total}</span>
        </div>
        <progress className="h-2 w-full accent-primary" value={answered} max={total}
          aria-label={tx("Առաջընթաց")}/>
        <nav aria-label={tx("Թվայնացված առաջադրանքներ")}
          className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
          {session.questions.map((q,i)=><button key={q.id} type="button"
            aria-current={i===index?"step":undefined}
            onClick={()=>setIndex(i)}
            className={"min-h-10 min-w-10 rounded-lg border px-2 text-sm font-bold "+
              (i===index?"bg-primary text-primary-foreground":
                answers[q.id]?"bg-muted/70":"bg-background")}>
            {q.number}
          </button>)}
        </nav>
      </section>
      {complete&&<section className="space-y-3 rounded-2xl border bg-secondary p-5" role="status">
        <h2 className="flex items-center gap-2 text-xl font-black">
          <Trophy className="size-5"/>{tx("Արդյունք՝ {n} / {total}",{n:correct,total})}
        </h2>
        <Button variant="outline" onClick={()=>setShowReview(v=>!v)}>
          {tx(showReview?"Թաքցնել պատասխանները":"Վերանայել պատասխանները")}
        </Button>
        <Button onClick={()=>setSession(null)}>{tx("Նոր թեստ")}</Button>
      </section>}
      {unit&&current&&(!complete||showReview)&&<>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-primary/5 px-4 py-3 text-sm">
          <span className="font-bold">{tx("Բնօրինակի առաջադրանք № {n}",{n:current.number})}</span>
          <Link to="/physics/books" search={{volume,page:current.page}}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-card px-3 font-semibold text-primary hover:bg-muted">
            <BookOpenCheck className="size-4"/>{tx("Ստուգել բնօրինակի էջ {n}",{n:current.page})}
          </Link>
        </div>
        <UnitCard key={unit.id} unit={unit}
          instruction={tx("Ընտրիր մեկ ճիշտ տարբերակ։")}
          value={answers[unit.id]} onChange={value=>{
            if(!complete&&!revealed[unit.id])setAnswers(all=>({...all,[unit.id]:value}));
          }}
          revealed={()=>complete||!!revealed[unit.id]}
          header={<span className="text-xs font-bold text-muted-foreground">
            {index+1}/{total} · {tx("Գիրք {n}",{n:volume===61?1:2})}
          </span>}/>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" disabled={index===0} onClick={()=>setIndex(i=>i-1)}>
            {tx("Նախորդը")}
          </Button>
          {!session.exam&&!complete&&<Button
            disabled={!answers[unit.id]?.mc?.[unit.label]||!!revealed[unit.id]}
            onClick={()=>setRevealed(old=>({...old,[unit.id]:true}))}>
            {tx("Ստուգել պատասխանը")}
          </Button>}
          <Button variant="outline" disabled={index>=total-1} onClick={()=>setIndex(i=>i+1)}>
            {tx("Հաջորդը")}
          </Button>
        </div>
      </>}
      {!complete&&<section className="space-y-2 rounded-xl border bg-card p-4">
        <Button className="w-full" onClick={finish}>{tx("Ավարտել և տեսնել արդյունքը")}</Button>
        <Button variant="ghost" className="w-full" onClick={()=>setSession(null)}>
          {tx("Վերադառնալ ընտրությանը")}
        </Button>
      </section>}
    </>}
    <p className="text-center text-xs leading-relaxed text-muted-foreground">
      {tx("Միայն գրքի իրական՝ էջի և պատասխանի հետ կապակցված առաջադրանքներն են այստեղ։ Բանաձևերով, նկարներով կամ անորոշ OCR տեքստով հարցերը կներմուծվեն միայն առանձին ստուգումից հետո։")}
    </p>
  </main>;
}
