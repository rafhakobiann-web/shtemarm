import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Atom, BookOpen, ClipboardCheck, ExternalLink, FileText, RefreshCw, Sigma } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamHero, ExamBuilderTitle } from "@/components/ExamDesign";
import { GtcGuidePanel } from "@/components/GtcGuidePanel";
import { HistorySession } from "@/components/HistorySession";
import { useTx } from "@/lib/lang";
import { PHYSICS_BOOK_IDS, PHYSICS_SOURCE, loadPhysicsBooks, makePhysicsModel,
  physicsEntries, physicsSlotType } from "@/lib/physics";
import { selectHistoryUnits } from "@/lib/history";
import { update } from "@/lib/progress";
import type { Unit } from "@/lib/books";
import { PHYSICS_SOURCE_BOOKS } from "@/lib/books";

type Mode="model"|"custom";
type Kind="choice"|"short"|"claims";
type Active={units:Unit[];bookId:number;practice:boolean;minutes:number};
const field="h-12 w-full rounded-xl border bg-background px-3 text-sm";

export function PhysicsWorkspace(){
  const tx=useTx();
  const query=useQuery({
    queryKey:["physics-two-volumes"],queryFn:loadPhysicsBooks,
    staleTime:Infinity,retry:2,
  });
  const [source,setSource]=useState("all");
  const [mode,setMode]=useState<Mode>("model");
  const [selected,setSelected]=useState<string[]>([]);
  const [kinds,setKinds]=useState<Kind[]>(["choice","short","claims"]);
  const [count,setCount]=useState(20);
  const [minutes,setMinutes]=useState(180);
  const [practice,setPractice]=useState(false);
  const [random,setRandom]=useState(true);
  const [active,setActive]=useState<Active|null>(null);
  const [error,setError]=useState("");

  const entries=useMemo(()=>physicsEntries(query.data??[]),[query.data]);
  const scoped=entries.filter(e=>source==="all"||e.source==="book-"+source);
  const sectionNames=[...new Set(scoped.map(e=>e.section))];
  const pool=scoped.filter(e=>
    (!selected.length||selected.includes(e.section)) &&
    kinds.includes(physicsSlotType(e.unit))
  );
  const available=new Set(pool.map(e=>e.unit.id)).size;
  const valid=Number.isInteger(minutes)&&minutes>=0&&minutes<=300 &&
    (mode==="model" || Number.isInteger(count)&&count>=1&&count<=available);

  const changeSource=(next:string)=>{
    setSource(next);setSelected([]);setKinds(["choice","short","claims"]);setError("");
  };
  const begin=()=>{
    if(!query.data || !valid)return;
    try{
      if(mode==="model"){
        const result=makePhysicsModel(query.data,source,random);
        setActive({units:result.units,bookId:result.bookId,minutes,practice});
      }else{
        setActive({units:selectHistoryUnits(pool,count,random),
          bookId:source==="all"?60:Number(source),minutes,practice});
      }
      setError("");
      window.scrollTo({top:0,behavior:"instant"});
    }catch(e){setError(e instanceof Error?e.message:tx("Չհաջողվեց կազմել թեստը։"));}
  };
  if(active)return <HistorySession units={active.units}
    title={tx("Ֆիզիկա · ուսումնական քննություն")} practice={active.practice}
    minutes={active.minutes}
    onExit={()=>setActive(null)}
    recordResult={(score,total)=>update(p=>({
      ...p,exams:[...p.exams,{date:new Date().toISOString(),book:active.bookId,score,total}].slice(-50),
    }))}/>;
  return <div className="mx-auto max-w-6xl space-y-6 pb-12">
    <ExamHero subject={tx("Ֆիզիկա")}
      title={tx("Ֆիզիկա · երկու մաս և քննության կազմիչ")}
      description={tx("Երկու առանձին հեղինակային հարցաշար՝ ֆիզիկայի թեմաներով։ ԳԹԿ-ի 2027 թ. ուղեցույցի կառուցվածքով փորձնական քննություն, առանց բնօրինակ շտեմարանների հարցերը վերարտադրելու։")}
      sources={tx("2 մաս · 110 հիմնական ուսումնական առաջադրանք")}
      available={entries.length||undefined}
      icon={<Atom className="size-5"/>}/>
    <section className="flex flex-col gap-4 rounded-3xl border border-primary/25 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0 space-y-1">
        <h2 className="flex items-center gap-2 text-lg font-black">
          <FileText className="size-5 text-primary"/>{tx("2017 թ. բնօրինակ շտեմարանները")}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {tx("Քո տրամադրած 430 և 436 էջանոց սկանավորված PDF-ները կարող ես բացել անմիջապես Shtemarm-ում՝ ներառյալ բոլոր գծագրերը և պատասխանների աղյուսակները։ Ֆայլերը մնում են միայն քո սարքում։")}
        </p>
      </div>
      <Link to="/physics/books" search={{volume:61,page:5}}
        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
        <BookOpen className="size-5"/>{tx("Բացել բնօրինակները")}
      </Link>
    </section>
    <section className="flex flex-col gap-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-lg font-black">{tx("Բնօրինակ գրքերից թվայնացված տեքստային հարցեր")}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {tx("Արդեն հասանելի է երկու մասերի կինեմատիկայի առաջին ստուգված հարցաշարը։ Յուրաքանչյուր հարց կապակցված է PDF-ի բնօրինակ էջին և պատասխանների աղյուսակին։")}
        </p>
      </div>
      <Link to="/physics/scan-practice"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-card px-5 text-sm font-bold text-primary hover:bg-muted">
        <ClipboardCheck className="size-5"/>{tx("250 բնօրինակ առաջադրանք · PDF-ով լուծում")}
      </Link>
      <Link to="/physics/original" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground">
        <BookOpen className="size-4"/>{tx("Լուծել գրքերի իրական առաջադրանքները")}
      </Link>
    </section>
    <div className="grid gap-3 sm:grid-cols-2">
      {PHYSICS_SOURCE_BOOKS.map((b,i)=>(
        <Link key={b.id} to="/book/$bookId" params={{bookId:String(b.id)}}
          className="flex min-h-24 min-w-0 items-center gap-3 rounded-2xl border border-primary/25 bg-card p-4 transition-colors hover:bg-muted/40">
          <img src={b.cover} alt="" width={54} height={74}
            className="h-20 w-14 shrink-0 rounded-lg object-cover" loading="lazy"/>
          <span className="min-w-0 space-y-1">
            <strong className="block text-base font-black">{tx(i===0?"Բնօրինակ գիրք · Մաս I":"Բնօրինակ գիրք · Մաս II")}</strong>
            <span className="block text-xs text-muted-foreground">{tx(b.sub)}</span>
            <span className="block text-xs font-semibold text-primary">{tx("Բացել թվայնացված առաջադրանքները")}</span>
          </span>
        </Link>
      ))}
    </div>
    <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
      {tx("Առանձին հեղինակային փորձնական հավաքածուներ")}
    </h2>
    <div className="grid gap-5 md:grid-cols-2">
      {PHYSICS_BOOK_IDS.map((id,i)=><Link key={id} to="/book/$bookId"
        params={{bookId:String(id)}}
        className="group flex min-w-0 items-center gap-4 rounded-3xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/20 focus-visible:outline-2 focus-visible:outline-primary">
        <img src={"/covers/physics-"+(i+1)+".svg"} width={92} height={122} loading="lazy"
          alt={tx("Ֆիզիկայի ուսումնական մաս {n}",{n:i+1})}
          className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-sm"/>
        <span className="min-w-0 flex-1 space-y-2">
          <strong className="block text-lg font-black">{tx(i===0?"Մաս առաջին":"Մաս երկրորդ")}</strong>
          <span className="block text-sm text-muted-foreground">{tx(i===0?
            "Մեխանիկա, ուժեր, էներգիա, ջերմություն":
            "Մոլեկուլային ֆիզիկա, էլեկտրականություն, ալիքներ, օպտիկա")}</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
            <BookOpen className="size-4"/>{tx("Բացել առաջադրանքները")}
          </span>
        </span>
      </Link>)}
    </div>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="min-w-0 space-y-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
        <ExamBuilderTitle/>
        <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed">
          {tx("Ուսումնական տարբերակ․ 55 հիմնական առաջադրանք, 70 պատասխանային դիրք, 80 միավոր, 180 րոպե։ Աղբյուրային գրքերի ամբողջական առաջադրանքների արտագրություն չէ։")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label={tx("Քննության տեսակ")}>
          {([
            ["model","Կառուցվածքային փորձնական քննություն","55 առաջադրանք · 80 միավոր"],
            ["custom","Անհատական թեստ","Ընտրիր թեմաներն ու հարցերը"],
          ] as const).map(([v,label,sub])=><button key={v} type="button"
            aria-pressed={mode===v}
            onClick={()=>{setMode(v);setError("");}}
            className={"min-h-24 rounded-2xl border-2 p-4 text-left transition-colors "+
              (mode===v?"border-primary bg-primary/5":"border-border hover:border-primary/40")}>
            <span className="block font-black">{tx(label)}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{tx(sub)}</span>
          </button>)}
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-bold">{tx("Հարցերի աղբյուր")}</span>
          <select className={field} value={source} onChange={e=>changeSource(e.target.value)}>
            <option value="all">{tx("Երկու մասերն էլ")}</option>
            <option value="61">{tx("Ֆիզիկա · մաս I")}</option>
            <option value="62">{tx("Ֆիզիկա · մաս II")}</option>
          </select>
        </label>
        {query.isPending?<p role="status">{tx("Հարցերը բեռնվում են…")}</p>:
          query.isError?<div role="alert" className="space-y-3">
            <p className="text-sm text-destructive">{tx("Ֆիզիկայի նյութերը չհաջողվեց բեռնել։")}</p>
            <Button variant="outline" onClick={()=>void query.refetch()}>
              <RefreshCw className="mr-2 size-4"/>{tx("Կրկին փորձել")}
            </Button>
          </div>:mode==="custom"?<>
            <fieldset className="space-y-3">
              <legend className="font-black">{tx("Ընտրիր թեմաները")}</legend>
              <p className="text-xs text-muted-foreground">{tx("Առանց ընտրության՝ բոլոր թեմաները։")}</p>
              <div className="grid max-h-64 gap-1 overflow-y-auto rounded-xl border p-3 sm:grid-cols-2">
                {sectionNames.map(name=><label key={name} className="flex min-w-0 items-start gap-2 rounded-lg p-2 text-sm hover:bg-muted/50">
                  <input type="checkbox" checked={selected.includes(name)}
                    className="mt-0.5 size-4 accent-primary"
                    onChange={e=>setSelected(old=>e.target.checked?[...old,name]:old.filter(x=>x!==name))}/>
                  <span className="min-w-0">{name.replace(/^Գիրք \d+ · /,"")}</span>
                </label>)}
              </div>
              {selected.length>0&&<Button variant="ghost" size="sm" onClick={()=>setSelected([])}>
                {tx("Ընտրել բոլոր բաժինները")}
              </Button>}
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="font-black">{tx("Առաջադրանքի տեսակները")}</legend>
              <div className="flex flex-wrap gap-3">
                {([["choice","Ընտրովի պատասխան"],["short","Թվային պատասխան"],["claims","Պնդումների փունջ"]] as const)
                  .map(([v,label])=><label key={v} className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm">
                    <input type="checkbox" className="size-4 accent-primary"
                      checked={kinds.includes(v)} onChange={e=>setKinds(old=>
                        e.target.checked?[...old,v]:old.filter(x=>x!==v))}/>
                    {tx(label)}
                  </label>)}
              </div>
            </fieldset>
            <div className="flex flex-wrap items-center gap-2">
              {[10,20,40,70].map(n=><Button key={n} size="sm"
                variant={count===n?"default":"outline"} disabled={n>available}
                onClick={()=>setCount(n)}>{tx("{n} հարց",{n})}</Button>)}
            </div>
            <p className="text-xs text-muted-foreground">{tx("Հասանելի է՝ {n}",{n:available})}</p>
          </>:null}
        {mode==="model"&&<div className="rounded-2xl bg-muted/40 p-4 text-sm">
          <div className="flex items-start gap-2">
            <Sigma className="mt-0.5 size-5 shrink-0 text-primary"/>
            <span>{tx("40 ընտրովի պատասխան, 28 թվային ենթահարց՝ 13 խմբում, 2 վեց պնդում պարունակող առաջադրանք։ «Երկու մասերն էլ» ընտրությամբ հարցերը խառնվում են երկու հավաքածուներից։")}</span>
          </div>
        </div>}
        <div className="grid gap-4 sm:grid-cols-2">
          {mode==="custom"&&<label className="space-y-2">
            <span className="text-sm font-bold">{tx("Հարցերի քանակ")}</span>
            <input className={field} type="number" min={1} max={available||1}
              value={count} onChange={e=>setCount(Number(e.target.value))}/>
          </label>}
          <label className="space-y-2">
            <span className="text-sm font-bold">{tx("Ժամանակ · րոպե")}</span>
            <input className={field} type="number" min={0} max={300} value={minutes}
              onChange={e=>setMinutes(Number(e.target.value))}/>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">{tx("Ռեժիմ")}</span>
            <select className={field} value={practice?"practice":"exam"}
              onChange={e=>setPractice(e.target.value==="practice")}>
              <option value="exam">{tx("Թեստ · ստուգել վերջում")}</option>
              <option value="practice">{tx("Ուսուցում · ստուգել յուրաքանչյուր հարցը")}</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">{tx("Հերթականություն")}</span>
            <select className={field} value={random?"random":"ordered"} onChange={e=>setRandom(e.target.value==="random")}>
              <option value="random">{tx("Պատահական")}</option>
              <option value="ordered">{tx("Գրքի հերթականությամբ")}</option>
            </select>
          </label>
        </div>
        {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button className="min-h-12 w-full" disabled={!valid||!query.data||query.isPending}
          onClick={begin}>
          <ClipboardCheck className="mr-2 size-5"/>
          {tx(mode==="model"?"Սկսել 80-միավորանոց փորձնական քննությունը":"Սկսել · {n} առաջադրանք",
            mode==="model"?undefined:{n:count})}
        </Button>
      </section>
      <aside className="space-y-4">
        <GtcGuidePanel subject="physics"/>
        <section className="space-y-3 rounded-3xl border bg-card p-5">
          <h2 className="font-black">{tx("Բնօրինակ գրքերի աղբյուրներ")}</h2>
          <Link to="/physics/books" search={{volume:source==="62"?62:61,page:5}}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm font-bold text-primary hover:bg-primary/10">
            <FileText className="size-4"/>{tx("Կարդալ տրամադրված PDF-ները Shtemarm-ում")}
          </Link>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {tx("Ստորև բերված են բնօրինակ շտեմարանների հղումները։ Դրանց հեղինակային առաջադրանքները չեն արտագրվել Shtemarm-ի ուսումնական հավաքածուներում։")}
          </p>
          {([["part1","Մաս I"],["part2","Մաս II"]] as const).map(([id,label])=>
            <a key={id} href={PHYSICS_SOURCE[id]} target="_blank" rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-between gap-2 rounded-xl border p-3 text-sm font-semibold hover:bg-muted">
              {tx("Հանրային աղբյուր · {part}",{part:label})}
              <ExternalLink className="size-4 shrink-0"/>
            </a>)}
        </section>
      </aside>
    </div>
  </div>;
}
