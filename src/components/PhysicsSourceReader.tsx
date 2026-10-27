import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ExternalLink, FileUp,
  FileX2, HardDriveDownload, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";
import { PhysicsSourceNotes } from "@/components/PhysicsSourceNotes";
import { PHYSICS_SOURCES, clampPhysicsPage, confirmPhysicsSourcePdf,
  deleteLocalPhysicsPdf, getLocalPhysicsPdf, putLocalPhysicsPdf,
  validatePhysicsSourceFile, type PhysicsVolume } from "@/lib/physics-source";

export function PhysicsSourceReader({
  volume,initialPage,
}:{volume:PhysicsVolume;initialPage?:number}){
  const tx=useTx();
  const source=PHYSICS_SOURCES[volume];
  const input=useRef<HTMLInputElement>(null);
  const [file,setFile]=useState<Blob|null>(null);
  const [fileName,setFileName]=useState("");
  const [page,setPage]=useState(()=>clampPhysicsPage(volume,initialPage??source.questionsStart));
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [checking,setChecking]=useState(false);
  const [verified,setVerified]=useState<"match"|"different"|null>(null);
  const [saved,setSaved]=useState(false);
  const [message,setMessage]=useState("");
  const [url,setUrl]=useState("");
  useEffect(()=>{
    let alive=true;
    setLoading(true);setFile(null);setFileName("");setSaved(false);setVerified(null);setMessage("");
    setPage(clampPhysicsPage(volume,initialPage??PHYSICS_SOURCES[volume].questionsStart));
    void getLocalPhysicsPdf(volume).then(item=>{
      if(!alive)return;
      if(item){setFile(item.pdf);setFileName(item.name);setSaved(true);}
    }).catch(()=>{
      if(alive)setMessage(tx("Այս դիտարկիչը թույլ չի տալիս պահպանել PDF-ը։ Այն կարող ես բացել միայն ընթացիկ այցելության ընթացքում։"));
    }).finally(()=>{if(alive)setLoading(false);});
    return ()=>{alive=false;};
    // parent changes the volume via keyed route; page changes must not re-read file
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[volume]);
  useEffect(()=>{
    if(!file){setUrl("");return;}
    const objectURL=URL.createObjectURL(file);
    setUrl(objectURL);
    return ()=>URL.revokeObjectURL(objectURL);
  },[file]);
  const pageURL=useMemo(()=>url?url+"#page="+page+"&zoom=page-width":null,[url,page]);
  async function importFile(selected:File){
    const err=validatePhysicsSourceFile(selected);
    if(err){setMessage(err);return;}
    setMessage("");setSaving(true);setVerified(null);
    // The local source is usable even when IndexedDB storage is blocked/quota-limited.
    setFile(selected);setFileName(selected.name);setPage(source.questionsStart);
    try{
      await putLocalPhysicsPdf(volume,selected);
      setSaved(true);
      setMessage(tx("PDF-ը պահպանված է միայն այս սարքում։ Shtemarm-ի սերվերին չի ուղարկվել։"));
    }catch{
      setSaved(false);
      setMessage(tx("PDF-ը բացվել է, բայց սարքի պահոցում չի պահպանվել։ Հաջորդ անգամ այն կրկին ընտրիր։"));
    }finally{setSaving(false);}
  }
  async function removeFile(){
    try{await deleteLocalPhysicsPdf(volume);}
    catch {/* still unload the file from the current page */}
    setFile(null);setFileName("");setSaved(false);setVerified(null);setUrl("");setMessage("");
    if(input.current)input.current.value="";
  }
  async function checkSource(){
    if(!file)return;
    setChecking(true);
    try{
      const matches=await confirmPhysicsSourcePdf(volume,file);
      setVerified(matches?"match":"different");
    }catch(e){
      setMessage(e instanceof Error?e.message:tx("Ֆայլի ստուգումը չհաջողվեց։"));
    }finally{setChecking(false);}
  }
  const jump=(n:number)=>setPage(clampPhysicsPage(volume,n));
  return <div className="mx-auto max-w-6xl space-y-5 pb-12">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Link to="/subject/$subject" params={{subject:"physics"}}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4"/>{tx("Ֆիզիկայի երկու մասերը")}
      </Link>
      <div className="flex gap-2">
        {([61,62] as const).map(id=><Link key={id}
          to="/physics/books" search={{volume:id,page:PHYSICS_SOURCES[id].questionsStart}}
          aria-current={volume===id?"page":undefined}
          className={"inline-flex min-h-11 items-center rounded-xl border px-4 py-2 text-sm font-bold "+
            (volume===id?"border-primary bg-primary text-primary-foreground":"bg-card hover:bg-muted")}>
          {tx(id===61?"Մաս I":"Մաս II")}
        </Link>)}
      </div>
    </div>
    <header className="space-y-3 rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-cyan-500/10 p-5 sm:p-8">
      <div className="flex items-start gap-3">
        <BookOpen className="size-8 shrink-0 text-primary"/>
        <div className="min-w-0">
          <h1 className="text-2xl font-black sm:text-3xl">{tx(source.title)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{source.edition} · {source.pages} {tx("էջ")}</p>
        </div>
      </div>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {tx("Սա բնօրինակ սկանավորված շտեմարանն է՝ իր գծագրերով, բանաձևերով և պատասխանների բաժնով։ Ընտրիր քո PDF-ը․ այն բացվում է անմիջապես սարքից և չի ուղարկվում որևէ սերվերի։")}
      </p>
      <p className="text-xs font-semibold text-primary">
        {tx("Բնօրինակ առաջադրանքները սկսվում են 5-րդ էջում։ Պատասխանների աղյուսակը՝ {n}-րդ էջում։",{n:source.answersStart})}
      </p>
    </header>
    <section className="space-y-4 rounded-3xl border bg-card p-4 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-black">
        <FileUp className="size-5 text-primary"/>{tx("Բացել բնօրինակ PDF ֆայլը")}
      </h2>
      <input ref={input} id={"physics-pdf-"+volume} type="file" accept=".pdf,application/pdf"
        className="block w-full min-w-0 cursor-pointer rounded-xl border bg-background p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-primary-foreground"
        aria-label={tx("Ընտրիր ֆիզիկայի բնօրինակ PDF-ը")}
        onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void importFile(file);}}/>
      <p className="text-xs text-muted-foreground">
        {tx("Սպասվող ֆայլ՝ {name}",{name:source.fileName})} · {tx("Սահման՝ 180 ՄԲ")}
      </p>
      {loading?<p role="status" className="flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin"/>{tx("Ստուգվում է սարքի պահոցը…")}
      </p>:file?<>
        <p role="status" className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="size-5 text-emerald-600"/>
          <span className="min-w-0 break-all">{fileName}</span>
          {saved&&<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
            <HardDriveDownload className="size-3"/>{tx("Պահված է սարքում")}
          </span>}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={checking||saving}
            onClick={()=>void checkSource()}>
            <ShieldCheck className="mr-1.5 size-4"/>
            {tx(checking?"Ստուգվում է…":"Համեմատել վերբեռնած PDF-ի բնօրինակը")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={()=>void removeFile()}>
            <FileX2 className="mr-1.5 size-4"/>{tx("Հեռացնել սարքի պահոցից")}
          </Button>
        </div>
        {verified==="match"&&<p role="status" className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="size-4 shrink-0"/>{tx("PDF-ը նույնական է Shtemarm-ին տրամադրված բնօրինակին (SHA-256)։")}
        </p>}
        {verified==="different"&&<p role="alert" className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="size-4 shrink-0"/>
          {tx("PDF-ը տարբերվում է տրամադրված 2017 թվականի տարբերակից։ Էջերի համարներն ու պատասխանների աղյուսակը կարող են տարբեր լինել։")}
        </p>}
      </>:null}
      {message&&<p role="status" className="text-xs leading-relaxed text-muted-foreground">{message}</p>}
      {!file&&<p className="text-xs leading-relaxed text-muted-foreground">
        {tx("Եթե PDF-ը սարքում չէ, այն կարելի է բացել հրատարակված աղբյուրից։ Արտաքին տարբերակի էջերը կարող են չհամընկնել այստեղ տրամադրված տարբերակի էջերին։")}{" "}
        <a href={source.webPdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-primary underline">
          {tx("Հրապարակված PDF")}<ExternalLink className="size-3"/>
        </a>
      </p>}
    </section>
    {file && url && <section className="space-y-4 rounded-3xl border bg-card p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-black">{tx("Գրքի էջերը")}</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={()=>jump(source.questionsStart)}>
            {tx("Առաջադրանքների սկիզբ")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={()=>jump(source.answersStart)}>
            {tx("Պատասխանների սկիզբ")}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button type="button" variant="outline" size="icon" disabled={page<=1}
          aria-label={tx("Նախորդ էջ")} onClick={()=>jump(page-1)}>
          <ArrowLeft className="size-4"/>
        </Button>
        <label className="flex items-center gap-2 text-sm font-bold">
          <span className="sr-only">{tx("Ընտրել էջը")}</span>
          <input type="number" min={1} max={source.pages} value={page}
            onChange={e=>{if(e.target.value)jump(Number(e.target.value));}}
            className="h-11 w-20 rounded-xl border bg-background px-2 text-center font-semibold tabular-nums"/>
          <span className="text-muted-foreground">/ {source.pages}</span>
        </label>
        <Button type="button" variant="outline" size="icon" disabled={page>=source.pages}
          aria-label={tx("Հաջորդ էջ")} onClick={()=>jump(page+1)}>
          <ArrowRight className="size-4"/>
        </Button>
        <a href={pageURL??undefined} target="_blank" rel="noopener noreferrer"
          className="inline-flex size-11 items-center justify-center rounded-xl border bg-background hover:bg-muted"
          aria-label={tx("Բացել PDF-ն առանձին ներդիրում")}>
          <ExternalLink className="size-4"/>
        </a>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-muted/30">
        <iframe title={tx("{name}՝ էջ {page}",{name:source.title,page})}
          src={pageURL??undefined}
          className="h-[75vh] min-h-[420px] w-full border-0 sm:h-[82vh]"
          loading="lazy"/>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {tx("Եթե հեռախոսի դիտարկիչը PDF-ը չի ցուցադրում այս հատվածում, սեղմիր վերևի «Բացել PDF-ն առանձին ներդիրում» կոճակը։ Ֆայլը շարունակում է մնալ միայն քո սարքում։")}
      </p>
    </section>}
    {file && url && <PhysicsSourceNotes volume={volume} page={page} onJump={jump}/>}
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{tx("Պատասխանները PDF-ից ավտոմատ արտագրած չենք համարում․ ուսումնական թեստերի պատասխանները առանձին ստուգված են։")}</p>
      <Link to="/physics/original"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-bold text-primary">
        <BookOpen className="size-4"/>{tx("Թվայնացված բնօրինակ հարցերը")}
      </Link>
      <Link to="/subject/$subject" params={{subject:"physics"}}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
        <BookOpen className="size-4"/>{tx("Անցնել ֆիզիկայի թեստերին")}
      </Link>
    </section>
  </div>;
}
