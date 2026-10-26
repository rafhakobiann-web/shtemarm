import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ClipboardList, BookOpen, Dna, Clock3 } from "lucide-react";
import { loadBook, type Unit } from "@/lib/books";
import { historyBookEntries, selectHistoryUnits } from "@/lib/history";
import { HistorySession } from "@/components/HistorySession";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";
import { update } from "@/lib/progress";

const OPTIONS = [
  { id: "biology", label: "Կենսաբանություն", books: [31,32,35] },
  { id: "english", label: "Անգլերեն", books: [1,2,3] },
  { id: "history", label: "Հայոց պատմություն", books: [21,22,23] },
  { id: "armenian", label: "Հայոց լեզու և հայ գրականություն", books: [41] },
  { id: "physics", label: "Ֆիզիկա", books: [51] },
  { id: "chemistry", label: "Քիմիա", books: [52] },
  { id: "geography", label: "Աշխարհագրություն", books: [53] },
  { id: "russian", label: "Ռուսաց լեզու", books: [54] },
] as const;
type Subject = (typeof OPTIONS)[number]["id"];
type Attempt = { units: Unit[]; minutes: number; practice: boolean; title: string; book: number };
const input = "h-12 w-full rounded-xl border bg-background px-3 text-sm";
export const Route = createFileRoute("/thematic")({
  head: () => ({ meta: [
    { title: "Թեմատիկ և ամփոփիչ աշխատանքներ · Shtemarm" },
    { name: "description", content: "Կազմիր թեմատիկ կամ ամփոփիչ աշխատանք առկա ստուգված շտեմարանային հարցերից՝ ընտրելով առարկան և բաժինները։" },
  ] }),
  component: ThematicBuilder,
});

export function ThematicBuilder() {
  const tx=useTx();
  const [subject,setSubject]=useState<Subject>("biology");
  const [source,setSource]=useState("all");
  const [workType,setWorkType]=useState<"thematic"|"summative">("thematic");
  const [selected,setSelected]=useState<string[]>([]);
  const [count,setCount]=useState(10);
  const [minutes,setMinutes]=useState(30);
  const [random,setRandom]=useState(true);
  const [attempt,setAttempt]=useState<Attempt|null>(null);
  const [error,setError]=useState("");
  const config=OPTIONS.find(option=>option.id===subject)!;
  const books=source==="all" ? [...config.books] : config.books.filter(n=>String(n)===source);
  const data=useQuery({
    queryKey:["thematic-pool-v2", subject,source],
    queryFn:async()=> (await Promise.all(books.map(id=>loadBook(id))))
      .flatMap((book,i)=>historyBookEntries(book,books[i]!)),
    staleTime:Infinity,
  });
  const sectionNames=useMemo(()=>[...new Set((data.data??[]).map(e=>e.section))],[data.data]);
  const eligible=useMemo(()=> (data.data??[]).filter(e=>!selected.length||selected.includes(e.section)),[data.data,selected]);
  const possible=new Set(eligible.map(e=>e.unit.id)).size;
  const valid=Number.isInteger(count)&&count>0&&count<=possible&&Number.isInteger(minutes)&&minutes>=0&&minutes<=180;
  const swapSubject=(s:Subject)=>{setSubject(s);setSource("all");setSelected([]);setCount(10);setError("");};
  if(attempt)return <HistorySession key={attempt.title+attempt.units[0]?.id} units={attempt.units}
    title={attempt.title} minutes={attempt.minutes} practice={attempt.practice}
    onExit={()=>setAttempt(null)} recordResult={(score,total)=>update(p=>({...p,
      exams:[...p.exams,{date:new Date().toISOString(),book:attempt.book,score,total}].slice(-50),
    }))}/>;
  return <main className="mx-auto max-w-5xl space-y-6 pb-16">
    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4"/>{tx("Գլխավոր էջ")}</Link>
    <header className="space-y-3 rounded-3xl border bg-card p-6 sm:p-8">
      <p className="flex items-center gap-2 text-xs font-bold text-primary"><ClipboardList className="size-5"/>{tx("Ուսումնական գործիքներ")}</p>
      <h1 className="text-2xl font-black sm:text-4xl">{tx("Թեմատիկ և ամփոփիչ աշխատանքների կազմիչ")}</h1>
      <p className="max-w-3xl leading-relaxed text-muted-foreground">{tx("Ընտրիր առարկան ու թեմաները, և կայքը կկազմի նոր աշխատանք՝ առկա պատասխաններով առաջադրանքներից։ Գնահատումը կկատարվի աշխատանքն ավարտելուց հետո։")}</p>
    </header>
    <section className="space-y-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
      <fieldset className="space-y-3">
        <legend className="font-black">{tx("Աշխատանքի տեսակը")}</legend>
        <div className="grid grid-cols-2 gap-3">
          {(["thematic","summative"] as const).map(type=><button type="button" key={type}
            aria-pressed={workType===type} onClick={()=>setWorkType(type)}
            className={"rounded-2xl border-2 p-4 text-left font-bold "+(workType===type?"border-primary bg-primary/5":"border-border")}>
            {tx(type==="thematic"?"Թեմատիկ աշխատանք":"Ամփոփիչ աշխատանք")}
            <span className="mt-1 block text-xs font-normal text-muted-foreground">{tx(type==="thematic"?"Մեկ կամ մի քանի ընտրված թեմայից":"Մի քանի թեմաների ընդհանուր ստուգում")}</span>
          </button>)}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2"><span className="block text-sm font-bold">{tx("Առարկա")}</span>
          <select className={input} value={subject} onChange={e=>swapSubject(e.target.value as Subject)}>
            {OPTIONS.map(item=><option value={item.id} key={item.id}>{tx(item.label)}</option>)}
          </select>
        </label>
        <label className="space-y-2"><span className="block text-sm font-bold">{tx("Հարցերի աղբյուր")}</span>
          <select className={input} value={source} onChange={e=>{setSource(e.target.value);setSelected([]);setError("");}}>
            <option value="all">{tx("Բոլոր հասանելի գրքերը")}</option>
            {config.books.map((id,i)=><option key={id} value={String(id)}>{tx(id===35?"Լրացուցիչ թեմատիկ վարժություններ":"Շտեմարան {n}",{n:i+1})}</option>)}
          </select>
        </label>
      </div>
      {data.isPending?<p role="status" className="text-muted-foreground">{tx("Հարցերը բեռնվում են…")}</p>
       :data.isError?<div role="alert" className="space-y-2"><p>{tx("Հարցերը չեն բեռնվել։")}</p><Button variant="outline" onClick={()=>void data.refetch()}>{tx("Կրկին փորձել")}</Button></div>
       :<fieldset className="space-y-2">
          <legend className="font-black">{tx("Թեմաներ և բաժիններ")}</legend>
          <p className="text-xs text-muted-foreground">{tx("Եթե ոչինչ չընտրես, կօգտագործվեն բոլոր թեմաները։")}</p>
          <div className="grid max-h-72 gap-2 overflow-y-auto rounded-2xl border p-3 sm:grid-cols-2">
            {sectionNames.map(name=><label className="flex items-start gap-2 rounded-xl p-2 text-sm hover:bg-muted" key={name}>
              <input type="checkbox" className="mt-1 size-4 accent-primary"
                checked={selected.includes(name)}
                onChange={e=>setSelected(old=>e.target.checked?[...old,name]:old.filter(v=>v!==name))}/>
              <span className="leading-relaxed">{name}</span>
            </label>)}
          </div>
          {!!selected.length&&<Button variant="ghost" size="sm" onClick={()=>setSelected([])}>{tx("Ընտրել բոլոր բաժինները")}</Button>}
        </fieldset>}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2">
          <span className="block text-sm font-bold">{tx("Առաջադրանքների քանակ")}</span>
          <input className={input} type="number" min={1} max={possible||1} value={count||""} onChange={e=>setCount(Number(e.target.value))}/>
          <span className="block text-xs text-muted-foreground">{tx("Հասանելի է՝ {n}",{n:possible})}</span>
        </label>
        <label className="space-y-2"><span className="block text-sm font-bold">{tx("Ժամանակ · րոպե")}</span>
          <input className={input} type="number" min={0} max={180} value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/>
        </label>
        <label className="space-y-2"><span className="block text-sm font-bold">{tx("Հերթականություն")}</span>
          <select className={input} value={random?"random":"ordered"} onChange={e=>setRandom(e.target.value==="random")}>
            <option value="random">{tx("Պատահական")}</option><option value="ordered">{tx("Գրքի հերթականությամբ")}</option>
          </select>
        </label>
      </div>
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button size="lg" className="w-full" disabled={!valid||data.isPending||data.isError} onClick={()=>{
        try{
          const units=selectHistoryUnits(eligible,count,random);
          setAttempt({units,minutes,practice:false,title:tx(workType==="thematic"?"Թեմատիկ աշխատանք":"Ամփոփիչ աշխատանք")+" · "+tx(config.label),book:books[0]??31});
          setError("");
          window.scrollTo({top:0,behavior:"instant"});
        }catch(e){setError(e instanceof Error?e.message:String(e));}
      }}><ClipboardList className="size-4"/>{tx("Կազմել և սկսել աշխատանքը")}</Button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {tx("Սա Shtemarm-ի ուսումնական աշխատանքի կազմիչն է, ոչ ուսումնական հաստատության հաստատած ստուգողական աշխատանք։ Առկա տվյալները կարող են չունենալ տվյալ դասարանի ամբողջ ծրագիրը։")}
      </p>
    </section>
    <div className="grid gap-3 sm:grid-cols-2">
      <Link to="/study-tools" className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm font-bold"><Clock3 className="size-5 text-primary"/>{tx("Կենտրոնացման ժամանակաչափ")}</Link>
      <Link to="/biology" className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm font-bold"><Dna className="size-5 text-primary"/>{tx("Կենսաբանություն · Քննություն")}</Link>
    </div>
  </main>;
}
