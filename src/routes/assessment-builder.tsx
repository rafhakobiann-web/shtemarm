import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookMarked, ClipboardList, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistorySession } from "@/components/HistorySession";
import { loadBook } from "@/lib/books";
import { historyBookEntries, type HistoryEntry } from "@/lib/history";
import {
  ASSESSMENT_SOURCES, buildAssessment, printablePrompt, printableAnswer,
  type Assessment, type AssessmentSubject, type AssessmentKind,
} from "@/lib/assessment-builder";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/assessment-builder")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Թեմատիկ և ամփոփիչ աշխատանքներ · Shtemarm" },
    { name:"description",content:"Ստեղծիր թեմատիկ և ամփոփիչ առաջադրանքներ ըստ առարկաների և շտեմարանի իրական հարցերի։" },
  ]}),
  component: AssessmentBuilder,
});
const control="h-12 w-full rounded-xl border bg-background px-3 text-sm";
const maxCount=60;

async function fetchEntries(books: readonly number[]) {
  const results=await Promise.all(books.map(async id => historyBookEntries(await loadBook(id),id)));
  return results.flat();
}

function AssessmentBuilder() {
  const tx=useTx();
  const [subject,setSubject]=useState<AssessmentSubject>("biology");
  const [kind,setKind]=useState<AssessmentKind>("thematic");
  const [chosenSections,setChosenSections]=useState<string[]>([]);
  const [count,setCount]=useState(10);
  const [mode,setMode]=useState<"setup"|"test"|"print">("setup");
  const [showKey,setShowKey]=useState(false);
  const [generated,setGenerated]=useState<Assessment|null>(null);
  const [error,setError]=useState("");
  const source=ASSESSMENT_SOURCES.find(s=>s.key===subject)!;
  const query=useQuery<HistoryEntry[]>({
    queryKey:["assessment-bank-v2",subject],
    queryFn:()=>fetchEntries(source.books),
    staleTime:Infinity,
  });
  const items=query.data??[];
  const sections=useMemo(()=>[...new Set(items.map(i=>i.section))],[items]);
  const filtered=items.filter(item=>kind==="summative" || !chosenSections.length || chosenSections.includes(item.section));
  const unique=new Set(filtered.map(e=>e.unit.id)).size;
  const canGenerate=count>=1 && count<=maxCount && count<=unique && Number.isInteger(count);
  const generate=()=>{
    try {
      const assessment=buildAssessment(items,{subject,kind,sections:chosenSections,count});
      setGenerated(assessment);setShowKey(false);setError("");setMode("print");
    }catch(e){setError(e instanceof Error?e.message:String(e));}
  };
  if (generated && mode==="test") return <HistorySession
    title={generated.title} units={generated.units} minutes={0} practice
    onExit={()=>setMode("print")}/>;

  return <main className="mx-auto max-w-6xl space-y-6 px-4 pb-16 print:mx-0 print:max-w-none print:p-0">
    <div className="no-print flex items-center gap-2 pt-5">
      <Link to="/study-tools" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4"/>{tx("Ուսումնական գործիքներ")}</Link>
    </div>
    <header className="no-print rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-sky-500/10 p-6 sm:p-8">
      <div className="flex items-center gap-3 text-primary"><ClipboardList className="size-8"/>
        <h1 className="text-2xl font-black sm:text-3xl">{tx("Թեմատիկ և ամփոփիչ աշխատանքների կազմիչ")}</h1>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{tx("Ընտրիր առարկան, աշխատանքի տեսակը, թեմաները և հարցերի քանակը։ Հարցերը վերցվում են կայքում հասանելի շտեմարաններից, ոչ թե հորինվում ԱԲ-ի միջոցով։ Կարող ես տպել առաջադրանքներն ու պատասխանների բանալին կամ լուծել առցանց։")}</p>
    </header>

    {mode==="setup" && <div className="no-print grid items-start gap-6 lg:grid-cols-[1fr_19rem]">
      <section className="space-y-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-bold">{tx("Առարկա")}</span>
            <select className={control} value={subject} onChange={e=>{
              setSubject(e.target.value as AssessmentSubject);setChosenSections([]);setError("");setGenerated(null);
            }}>{ASSESSMENT_SOURCES.map(s=><option key={s.key} value={s.key}>{tx(s.label)}</option>)}</select>
          </label>
          <label className="space-y-2"><span className="text-sm font-bold">{tx("Աշխատանքի տեսակ")}</span>
            <select className={control} value={kind} onChange={e=>{setKind(e.target.value as AssessmentKind);setError("");}}>
              <option value="thematic">{tx("Թեմատիկ աշխատանք")}</option>
              <option value="summative">{tx("Ամփոփիչ աշխատանք")}</option>
            </select>
          </label>
        </div>
        {query.isPending ? <p role="status">{tx("Հարցերը բեռնվում են…")}</p> :
        query.isError ? <div role="alert" className="space-y-3">
          <p>{tx("Շտեմարանի հարցերը չհաջողվեց բեռնել։")}</p>
          <Button type="button" variant="outline" onClick={()=>void query.refetch()}>{tx("Կրկին փորձել")}</Button>
        </div> : kind==="thematic" ? <fieldset className="space-y-2">
          <legend className="text-sm font-bold">{tx("Ընտրիր թեմաները")}</legend>
          <p className="text-xs text-muted-foreground">{tx("Առանց ընտրության՝ բոլոր թեմաները։")}</p>
          <div className="grid max-h-72 gap-2 overflow-auto rounded-2xl border p-3 sm:grid-cols-2">
            {sections.map(section=><label key={section} className="flex items-start gap-2 rounded-lg p-2 text-sm hover:bg-muted">
              <input type="checkbox" className="mt-1 size-4 accent-primary"
                checked={chosenSections.includes(section)}
                onChange={e=>setChosenSections(old=>e.target.checked?[...old,section]:old.filter(x=>x!==section))}/>
              <span>{section}</span>
            </label>)}
          </div>
          {chosenSections.length>0 && <Button type="button" size="sm" variant="ghost" onClick={()=>setChosenSections([])}>{tx("Բոլոր թեմաները")}</Button>}
        </fieldset> : <p className="rounded-xl border bg-muted/40 p-3 text-sm">{tx("Ամփոփիչ աշխատանքի հարցերը ընտրվում են տվյալ առարկայի հասանելի բոլոր թեմաներից։")}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-bold">{tx("Առաջադրանքների քանակ")}</span>
            <input className={control} type="number" min={1} max={Math.min(maxCount,unique)} value={count}
              onChange={e=>setCount(Number(e.target.value))}/>
            <span className="block text-xs text-muted-foreground">{tx("Առկա է՝ {n} առաջադրանք",{n:unique})}</span>
          </label>
          <div className="space-y-2">
            <p className="text-sm font-bold">{tx("Արագ ընտրություն")}</p>
            <div className="flex gap-2">{[5,10,20,30].map(n=><Button size="sm" type="button" key={n}
              variant={n===count?"default":"outline"} disabled={n>unique}
              onClick={()=>setCount(n)}>{n}</Button>)}</div>
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="button" size="lg" className="w-full" disabled={!canGenerate||query.isPending||query.isError} onClick={generate}>
          <BookMarked className="mr-2 size-4"/>{tx("Կազմել աշխատանքը")}
        </Button>
      </section>
      <aside className="space-y-3 rounded-3xl border bg-card p-5 text-sm">
        <h2 className="font-black">{tx("Ինչպես է աշխատում")}</h2>
        <p>{tx("Թեմատիկ աշխատանքը կազմվում է ընտրված թեմաներից, ամփոփիչը՝ առարկայի բոլոր հասանելի թեմաներից։")}</p>
        <p className="text-muted-foreground">{tx("Դա ԳԹԿ-ի պաշտոնական քննություն չէ։ Առաջադրանքները պատահական են, գնահատումը կախված է հարցերի տեսակից։ Բնօրինակ բովանդակությունը մի թարգմանիր կամ մի փոխիր։")}</p>
        <p className="text-muted-foreground">{tx("Ֆիզիկա, քիմիա և ռուսաց լեզու առարկաների սկզբնական բանկերը հեղինակային ուսումնական օրինակներ են․ ամբողջական պաշտոնական շտեմարաններ դեռ չեն ներմուծվել։")}</p>
      </aside>
    </div>}

    {generated && mode==="print" && <div className="space-y-5">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={()=>setMode("setup")}><ArrowLeft className="mr-2 size-4"/>{tx("Փոխել կարգավորումները")}</Button>
        <Button type="button" onClick={()=>setMode("test")}>{tx("Լուծել առցանց")}</Button>
        <Button type="button" variant="secondary" onClick={()=>window.print()}><Printer className="mr-2 size-4"/>{tx("Տպել աշխատանքը")}</Button>
        <Button type="button" variant="outline" onClick={()=>setShowKey(s=>!s)}>{tx(showKey?"Թաքցնել պատասխանները":"Ցուցադրել պատասխանների բանալին")}</Button>
        <Button type="button" variant="outline" onClick={generate}><RefreshCw className="mr-2 size-4"/>{tx("Նոր տարբերակ")}</Button>
      </div>
      <article className="assessment-paper rounded-3xl border bg-card p-5 sm:p-8 print:rounded-none print:border-0 print:bg-white print:p-0">
        <div className="mb-7 space-y-2 border-b pb-5 text-center">
          <h2 className="text-2xl font-black">{generated.title}</h2>
          <p className="text-sm text-muted-foreground">{tx("Հեղինակային ուսումնական առաջադրանքների հավաքածու")} · {generated.units.length} {tx("առաջադրանք")}</p>
          <p className="pt-3 text-left text-sm">{tx("Անուն, ազգանուն")} ______________________　{tx("Դասարան")} ______　{tx("Ամսաթիվ")} __________</p>
        </div>
        <ol className="space-y-6">
          {generated.units.map((u,i)=><li key={u.id} className="break-inside-avoid space-y-2 border-b border-border/50 pb-4 text-sm leading-relaxed">
            <p className="font-bold">{i+1}. {u.label}</p>
            <p className="whitespace-pre-wrap">{printablePrompt(u)}</p>
            <p className="mt-2 text-muted-foreground">{tx("Պատասխան")}՝ ____________________________________</p>
          </li>)}
        </ol>
        {showKey && <section className="answer-key mt-8 break-before-page border-t pt-6">
          <h3 className="mb-4 text-xl font-black">{tx("Պատասխանների բանալի")}</h3>
          <ol className="grid gap-2 text-sm sm:grid-cols-2">
            {generated.units.map((u,i)=><li key={u.id}>{i+1}. {printableAnswer(u)}</li>)}
          </ol>
        </section>}
      </article>
    </div>}
  </main>;
}
