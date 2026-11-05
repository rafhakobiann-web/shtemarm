import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ALL_BOOKS, loadBook, type Book } from "@/lib/books";
import { searchBookCatalog, searchLoadedBooks } from "@/lib/smartSearch";
import { useLang } from "@/lib/lang";
import { upsertStudyItem } from "@/lib/studyLibrary";

export const Route = createFileRoute("/search")({
  staticData: { sitemap:false },
  head:()=>({meta:[{title:"Search · Shtemarm"}]}),
  component:SmartSearchPage,
});
const HISTORY_KEY="shtemarm:search-history:v1";
function readHistory():string[]{
  if(typeof window==="undefined")return [];
  try{const data:unknown=JSON.parse(localStorage.getItem(HISTORY_KEY)??"[]");return Array.isArray(data)?data.filter((v):v is string=>typeof v==="string"&&v.length<=100).slice(0,8):[];}catch{return [];}
}
function SmartSearchPage(){
  const lang=useLang();
  const tr=(hy:string,en:string,ru:string)=>lang==="en"?en:lang==="ru"?ru:hy;
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState("all");
  const [loaded,setLoaded]=useState<Book[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [history,setHistory]=useState(readHistory);
  const normalized=query.trim().slice(0,100);
  const bookId=filter==="all"?undefined:Number(filter);
  const catalog=normalized?searchBookCatalog(normalized,bookId):[];
  const found=searchLoadedBooks(loaded.filter(book=>bookId===undefined||book.id===bookId),normalized);
  const hits=[...catalog,...found];
  const saveHistory=(value:string)=>{
    const next=[value,...history.filter(item=>item!==value)].slice(0,8);
    setHistory(next);
    try{localStorage.setItem(HISTORY_KEY,JSON.stringify(next));}catch{/* private browsing */}
  };
  const search=async()=>{
    if(!normalized)return;
    saveHistory(normalized);
    setBusy(true);setError("");
    try{
      const books=bookId===undefined?ALL_BOOKS:ALL_BOOKS.filter(book=>book.id===bookId);
      const results:Book[]=[];
      // Explicit request only; do not silently download every bank on each keystroke.
      for(const book of books){
        try{results.push(await loadBook(book.id));}catch{/* individual books may be unavailable */}
      }
      setLoaded(results);
      if(!results.length)setError(tr("Գրքերը բեռնել չհաջողվեց։","Could not load question banks.","Не удалось загрузить сборники."));
    }finally{setBusy(false);}
  };
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6">
    <h1 className="text-3xl font-black">{tr("Որոնում","Search","Поиск")}</h1>
    <p className="text-sm text-muted-foreground">{tr("Որոնիր գրքեր, բաժիններ և առաջադրանքներ։ Հարցերը որոնվում են միայն «Որոնել» սեղմելուց հետո։","Find books, sections and questions. Question banks load only after pressing Search.","Поиск сборников, разделов и заданий. Загрузка вопросов только после нажатия «Поиск».")}</p>
    <form onSubmit={e=>{e.preventDefault();void search();}} className="flex flex-col gap-2 sm:flex-row">
      <input aria-label={tr("Որոնման բառեր","Search terms","Поисковый запрос")} className="min-h-11 min-w-0 flex-1 rounded-xl border bg-background px-3" value={query} onChange={e=>{setQuery(e.target.value);setLoaded([]);}} maxLength={100} placeholder={tr("Գրիր բառը կամ հարցը","Enter a topic or question","Введите тему или вопрос")}/>
      <select aria-label={tr("Գրքի զտիչ","Book filter","Фильтр сборников")} className="min-h-11 rounded-xl border bg-background px-3" value={filter} onChange={e=>{setFilter(e.target.value);setLoaded([]);}}>
        <option value="all">{tr("Բոլոր գրքերը","All books","Все сборники")}</option>
        {ALL_BOOKS.map(book=><option key={book.id} value={book.id}>{book.title} · {book.sub}</option>)}
      </select>
      <button type="submit" disabled={busy||!normalized} className="min-h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground disabled:opacity-50">{busy?tr("Բեռնվում է…","Loading…","Загрузка…"):tr("Որոնել","Search","Искать")}</button>
    </form>
    {history.length>0&&<div className="flex flex-wrap gap-2"><span className="text-xs text-muted-foreground">{tr("Վերջին որոնումներ","Recent searches","Недавние запросы")}:</span>{history.map(term=><button key={term} className="rounded-lg border px-2 py-1 text-xs" onClick={()=>{setQuery(term);setLoaded([]);}}>{term}</button>)}</div>}
    {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    <p className="text-xs text-muted-foreground">{tr("Գտնված արդյունքներ","Results","Результаты")}: {hits.length}{loaded.length>0?" · "+tr("Հարցերի արդյունքները սահմանափակված են 80-ով մեկ բեռնումում։","Question results are limited to 80 per loaded set.","Результаты заданий ограничены 80 за загрузку."): ""}</p>
    <div className="space-y-2">{hits.map(hit=><div key={hit.key} className="rounded-xl border bg-card p-4"><Link to="/book/$bookId" params={{bookId:String(hit.bookId)}} className="block hover:text-primary"><span className="text-xs font-bold text-primary">{hit.kind==="book"?tr("Գիրք","Book","Сборник"):hit.kind==="section"?tr("Բաժին","Section","Раздел"):tr("Առաջադրանք","Question","Задание")}</span><h2 className="mt-1 break-words text-sm font-semibold">{hit.title}</h2><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{hit.snippet}</p></Link><button type="button" className="mt-2 min-h-10 rounded-lg border px-3 text-xs font-bold" onClick={()=>{const ok=upsertStudyItem({id:hit.key,title:hit.title,subject:ALL_BOOKS.find(b=>b.id===hit.bookId)?.title??"",bookId:hit.bookId,section:hit.section,collection:"",note:"",reviewAt:null,createdAt:Date.now()});if(!ok)setError(tr("Պահպանել չհաջողվեց։","Could not save.","Не удалось сохранить."));}}>{tr("Պահպանել իմ գրադարանում","Save to my library","Сохранить в библиотеку")}</button></div>)}</div>
    {normalized&&!hits.length&&!busy&&<p className="text-sm text-muted-foreground">{tr("Արդյունք դեռ չկա։ Փորձիր այլ բառ կամ սեղմիր «Որոնել»։","No results yet. Try another term or press Search.","Пока нет результатов. Измените запрос или нажмите «Поиск».")}</p>}
  </main>;
}
