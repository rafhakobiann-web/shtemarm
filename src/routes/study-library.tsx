import {createFileRoute,Link} from "@tanstack/react-router";
import {useEffect,useState} from "react";
import {useLang} from "@/lib/lang";
import {filterStudyLibrary,readStudyLibrary,saveStudyLibrary,upsertStudyItem,STUDY_LIBRARY_CHANGED,type StudyItem} from "@/lib/studyLibrary";

export const Route=createFileRoute("/study-library")({staticData:{sitemap:false},component:StudyLibraryPage});
function StudyLibraryPage(){
  const lang=useLang();
  const tr=(hy:string,en:string,ru:string)=>lang==="en"?en:lang==="ru"?ru:hy;
  const [items,setItems]=useState(readStudyLibrary);
  const [query,setQuery]=useState("");
  const [collection,setCollection]=useState("");
  const [title,setTitle]=useState("");
  const [subject,setSubject]=useState("");
  const [group,setGroup]=useState("");
  const [message,setMessage]=useState("");
  useEffect(()=>{const refresh=()=>setItems(readStudyLibrary());window.addEventListener(STUDY_LIBRARY_CHANGED,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(STUDY_LIBRARY_CHANGED,refresh);window.removeEventListener("storage",refresh);};},[]);
  const collections=[...new Set(items.map(item=>item.collection).filter(Boolean))];
  const results=filterStudyLibrary(items,query,collection);
  const update=(item:StudyItem,patch:Partial<StudyItem>)=>{if(!upsertStudyItem({...item,...patch}))setMessage(tr("Պահպանել չհաջողվեց։","Could not save changes.","Не удалось сохранить изменения."));};
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6">
    <h1 className="text-3xl font-black">{tr("Իմ ուսումնական գրադարանը","My Study Library","Моя учебная библиотека")}</h1>
    <p className="text-sm text-muted-foreground">{tr("Պահպանիր նյութերի հղումները, խմբավորիր, ավելացրու նշումներ և կրկնության օր։ Տվյալները պահվում են այս դիտարկչում։","Save study references, organize collections, add notes and a review date. Stored in this browser.","Сохраняйте материалы, коллекции, заметки и дату повторения. Данные в этом браузере.")}</p>
    <form className="grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();if(!title.trim())return;const item:StudyItem={id:"manual:"+Date.now()+":"+Math.random().toString(36).slice(2),title:title.trim(),subject:subject.trim(),collection:group.trim(),note:"",reviewAt:null,createdAt:Date.now()};if(upsertStudyItem(item)){setTitle("");setSubject("");setGroup("");}else setMessage(tr("Պահպանել չհաջողվեց։","Could not save.","Не удалось сохранить."));}}>
      <label className="text-sm">{tr("Նյութի անվանում","Material title","Название материала")}<input required maxLength={240} className="mt-1 min-h-11 w-full rounded-lg border bg-background px-3" value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <label className="text-sm">{tr("Առարկա","Subject","Предмет")}<input maxLength={80} className="mt-1 min-h-11 w-full rounded-lg border bg-background px-3" value={subject} onChange={e=>setSubject(e.target.value)}/></label>
      <label className="text-sm">{tr("Հավաքածու","Collection","Коллекция")}<input maxLength={80} className="mt-1 min-h-11 w-full rounded-lg border bg-background px-3" value={group} onChange={e=>setGroup(e.target.value)}/></label>
      <button className="min-h-11 self-end rounded-lg bg-primary px-4 font-bold text-primary-foreground" type="submit">{tr("Պահպանել","Save","Сохранить")}</button>
    </form>
    <div className="grid gap-2 sm:grid-cols-2">
      <input aria-label={tr("Որոնում","Search","Поиск")} placeholder={tr("Որոնել պահպանվածներում","Search saved items","Поиск сохранённого")} value={query} onChange={e=>setQuery(e.target.value)} className="min-h-11 rounded-lg border bg-background px-3"/>
      <select aria-label={tr("Հավաքածու","Collection","Коллекция")} value={collection} onChange={e=>setCollection(e.target.value)} className="min-h-11 rounded-lg border bg-background px-3"><option value="">{tr("Բոլոր հավաքածուները","All collections","Все коллекции")}</option>{collections.map(c=><option key={c} value={c}>{c}</option>)}</select>
    </div>
    {message&&<p role="alert" className="text-sm text-destructive">{message}</p>}
    {results.map(item=><article key={item.id} className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-bold">{item.title}</h2><p className="text-xs text-muted-foreground">{item.subject}{item.collection?" · "+item.collection:""}</p></div><button type="button" className="min-h-10 rounded-lg border px-3 text-xs" onClick={()=>{if(saveStudyLibrary(items.filter(x=>x.id!==item.id)))setMessage("");else setMessage(tr("Հեռացնել չհաջողվեց։","Could not remove.","Не удалось удалить."));}}>{tr("Հեռացնել","Remove","Удалить")}</button></div>
      {item.bookId!==undefined&&<Link to="/book/$bookId" params={{bookId:String(item.bookId)}} className="text-sm font-semibold text-primary">{tr("Բացել գիրքը","Open book","Открыть сборник")}</Link>}
      <label className="block text-xs">{tr("Նշումներ","Notes","Заметки")}<textarea rows={2} maxLength={2000} defaultValue={item.note} key={item.id+":note"} onBlur={e=>update(item,{note:e.target.value})} className="mt-1 w-full rounded-lg border bg-background p-2"/></label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs">{tr("Հավաքածու","Collection","Коллекция")}<input maxLength={80} defaultValue={item.collection} key={item.id+":collection"} onBlur={e=>update(item,{collection:e.target.value})} className="mt-1 min-h-10 w-full rounded-lg border bg-background px-2"/></label>
        <label className="text-xs">{tr("Կրկնության օր","Review date","Дата повторения")}<input type="date" value={item.reviewAt??""} onChange={e=>update(item,{reviewAt:e.target.value||null})} className="mt-1 min-h-10 w-full rounded-lg border bg-background px-2"/></label>
      </div>
    </article>)}
    {!results.length&&<p className="text-sm text-muted-foreground">{tr("Նյութեր չեն գտնվել։","No saved materials found.","Материалы не найдены.")}</p>}
  </main>;
}
