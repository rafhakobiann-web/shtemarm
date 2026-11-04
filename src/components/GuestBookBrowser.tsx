import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, KeyRound, Loader2, LockKeyhole, RefreshCw, Sparkles, X } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { UnitCard, type UnitAnswer } from "@/components/UnitCard";
import { questionAnswerKey, type Unit } from "@/lib/books";
import { useBook } from "@/lib/useBook";
import { useMathBookIndex } from "@/lib/math-bank";
import { useLang } from "@/lib/lang";
import { GUEST_BOOK_LIMIT, GUEST_BOOKS, GUEST_BOOK_TEXT, pickGuestBookSections, pickGuestMathSections, type GuestBookMeta, type GuestBookQuestion, type GuestPreviewSection, type PreviewCategory } from "@/lib/guest-book-preview";

const FILTERS:readonly PreviewCategory[]=["all","english","math","armenian","history","biology","physics","other"];

const normal = (s:string) => s.normalize("NFKC").replace(/\s+/g,"").replace(/,/g,".").toLowerCase();

function BookQuestionCard({ question, order, total }: { question:GuestBookQuestion;order:number;total:number }) {
  const lang=useLang();
  const t=GUEST_BOOK_TEXT[lang];
  const [choice,setChoice]=useState<string|null>(null);
  const [draft,setDraft]=useState("");
  const [checked,setChecked]=useState(false);
  const correct=question.kind==="number"?normal(draft)===normal(question.answer):choice===question.answer;
  const revealed=question.kind==="choice"?choice!==null:checked;
  const submit=()=>{
    if(question.kind!=="number"||checked||!draft.trim())return;
    setChecked(true);
  };
  return (
    <article className="sht-try-book-question">
      <div className="sht-try-progress-row">
        <span>{t.question} {order} / {total} · {question.printedNo}</span>
        <span>{t.source}: {question.section}</span>
      </div>
      {question.passage && <div className="sht-try-book-passage">{question.passage}</div>}
      <h4 className="sht-try-book-stem">{question.stem}</h4>
      {question.kind==="choice" ? (
        <div className="sht-try-options" role="group" aria-label={t.question+" "+order}>
          {question.options.map(({key,value})=>(
            <button type="button" key={key} aria-pressed={choice===key} disabled={revealed}
              onClick={()=>setChoice(key)}
              className={revealed&&key===question.answer?"is-correct":choice===key?"is-incorrect":""}>
              <span className="sht-try-option-letter">{key}</span><span>{value}</span>
              {revealed&&key===question.answer?<Check size={17} aria-hidden="true"/>:choice===key?<X size={17} aria-hidden="true"/>:null}
            </button>
          ))}
        </div>
      ) : (
        <form className="sht-try-numeric-answer" onSubmit={e=>{e.preventDefault();submit()}}>
          <label htmlFor={"guest-numeric-"+question.id}>{t.input}</label>
          <div>
            <input id={"guest-numeric-"+question.id} value={draft} onChange={e=>setDraft(e.target.value)} disabled={checked} autoComplete="off" inputMode="text" placeholder="…" />
            <button type="submit" disabled={!draft.trim()||checked}>{t.check}</button>
          </div>
        </form>
      )}
      {revealed && (
        <div className="sht-try-feedback" role="status">
          <strong>{correct?t.correct:t.incorrect}</strong>
          <p>{question.explanation?.trim()||`${t.explanation}: ${question.kind==="choice"
            ?question.options.find(o=>o.key===question.answer)?.value||question.answer
            :question.answer}`}</p>
        </div>
      )}
    </article>
  );
}


/** Reuse the EXACT same English reading, cloze, matching and ordering
 * interactive renderer as the signed-in study page, but with transient local
 * state. Absolutely no progress/mistake writes occur in this guest wrapper.
 */
function GuestFullExercise({unit,section,label}:{unit:Unit;section:GuestPreviewSection;label:string}) {
  const [value,setValue]=useState<UnitAnswer>();
  const [revealed,setRevealed]=useState<Record<string,boolean>>({});
  const keys=(unit.kind==="mc"||unit.kind==="num")
    ?unit.questions.map((_,i)=>questionAnswerKey(unit,i)):["unit"];
  const checked=keys.filter(k=>revealed[k]).length;
  return <div className="sht-try-source-unit">
    <div className="sht-try-source-unit-heading">
      <span><BookOpen size={16} aria-hidden="true"/>{label}</span>
      <span>{checked} / {keys.length}</span>
    </div>
    <UnitCard unit={unit} instruction={section.instruction}
      instructionEn={section.instructionEn} value={value}
      onChange={setValue} revealed={key=>!!revealed[key]}
      onCheck={key=>setRevealed(old=>({...old,[key]:true}))}/>
  </div>;
}

function SectionSamples({sections,meta}:{sections:GuestPreviewSection[];meta:GuestBookMeta}) {
  const t=GUEST_BOOK_TEXT[useLang()];
  const english=meta.category==="english";
  const [selected,setSelected]=useState<string|null>(null);
  const active=sections.find(s=>s.id===selected)||sections[0];
  if(!active)return <p className="sht-try-book-empty" role="status">{t.missing}</p>;
  const rest=Math.max(0,active.totalExercises-active.items.length);
  const showLocked=Math.min(3,rest);
  const sectionLabel=active.label;
  return <div className="sht-try-section-experience">
    <div className="sht-try-section-menu" role="group" aria-label={t.chooseSection}>
      {sections.map(section=><button key={section.id} type="button"
        aria-pressed={active.id===section.id} className={active.id===section.id?"is-selected":""}
        onClick={()=>setSelected(section.id)}>
        <span>{t.section} {section.id}</span>
        <small>{section.label}</small>
        <span className="sht-try-section-mini"><Check size={13} aria-hidden="true"/>{english?t.twoTexts:t.twoQuestions}</span>
      </button>)}
    </div>
    <div key={active.id} className="sht-try-section-detail">
      <div className="sht-try-section-intro">
        <div>
          <span className="sht-try-eyebrow"><BookOpen size={16} aria-hidden="true"/>{t.preview}</span>
          <h4>{sectionLabel}</h4>
          <p>{english?t.englishNotice:t.sectionNotice}</p>
        </div>
        <span className="sht-try-book-free"><Check size={15} aria-hidden="true"/>{english?t.twoTexts:t.twoQuestions}</span>
      </div>
      {active.items.length===0?<p className="sht-try-book-empty" role="status">{t.missing}</p>
        :<div className="sht-try-section-items">
          {active.items.map((item,i)=>item.type==="question"
            ?<BookQuestionCard key={item.id} question={item.question} order={i+1} total={active.items.length}/>
            :<GuestFullExercise key={item.id} unit={item.unit} section={active} label={item.label||`${t.text} ${i+1}`}/>)}
        </div>}
      <div className="sht-try-locked-content">
        <div className="sht-try-lock-header">
          <span className="sht-try-lock-icon"><LockKeyhole size={24} aria-hidden="true"/></span>
          <div><strong>{rest>0?t.sectionsLocked:t.ready}</strong><p>{t.rest}</p></div>
        </div>
        {showLocked>0&&<div className="sht-try-lock-items" aria-label={t.locked}>
          {Array.from({length:showLocked},(_,i)=>active.items.length+i+1).map(n=>
            <div key={n} className="sht-try-lock-item">
              <span>{english?t.text:t.question} {n}</span>
              <LockKeyhole size={16} aria-hidden="true"/><span>{t.locked}</span>
            </div>)}
        </div>}
        <div className="sht-try-unlock-actions">
          <Link to="/auth" className="sht-try-primary"><KeyRound size={17} aria-hidden="true"/>{t.login}</Link>
          {meta.regularId!==undefined?
            <Link to="/book/$bookId" params={{bookId:String(meta.regularId)}} className="sht-try-book-full">
              {t.unlock}<ArrowRight size={16} aria-hidden="true"/>
            </Link>
            :<Link to="/math/books" className="sht-try-book-full">{t.unlock}<ArrowRight size={16} aria-hidden="true"/></Link>}
        </div>
      </div>
    </div>
  </div>;
}

function BookContent({ meta, onBack }: { meta:GuestBookMeta;onBack:()=>void }) {
  const t=GUEST_BOOK_TEXT[useLang()];
  return <div className="sht-try-book-detail">
    <button type="button" onClick={onBack} className="sht-try-book-back"><ArrowLeft size={16} aria-hidden="true"/>{t.back}</button>
    <div className="sht-try-book-heading">
      <BookCover src={meta.cover} title={meta.title} size="lg"/>
      <div className="sht-try-book-heading-copy">
        <span className="sht-try-eyebrow"><BookOpen size={16} aria-hidden="true"/>{t.preview}</span>
        <h3>{meta.title}</h3><p>{meta.sub}</p>
        <span className="sht-try-book-free"><Check size={15} aria-hidden="true"/>
          {meta.category==="english"?t.twoTexts:t.twoQuestions}</span>
      </div>
    </div>
    {meta.regularId!==undefined?<RegularBookSample bookId={meta.regularId} meta={meta}/>
      :<MathBookSample bookId={meta.id as "matem-1"|"matem-2"} meta={meta}/>}
  </div>;
}

function RegularBookSample({bookId,meta}:{bookId:number;meta:GuestBookMeta}){
  const {data,error,isLoading,refetch}=useBook(bookId);
  const t=GUEST_BOOK_TEXT[useLang()];
  const sections=useMemo(()=>data?pickGuestBookSections(data):[],[data]);
  if(isLoading)return <div className="sht-try-book-loading" role="status"><Loader2 className="animate-spin" size={22} aria-hidden="true"/>{t.pending}</div>;
  if(error||!data)return <div className="sht-try-book-empty" role="alert">{t.failed}<button type="button" onClick={()=>void refetch()}><RefreshCw size={16} aria-hidden="true"/>{t.restart}</button></div>;
  return <SectionSamples sections={sections} meta={meta}/>;
}
function MathBookSample({bookId,meta}:{bookId:"matem-1"|"matem-2";meta:GuestBookMeta}){
  const {data,error,isLoading,refetch}=useMathBookIndex();
  const t=GUEST_BOOK_TEXT[useLang()];
  const sections=useMemo(()=>data?pickGuestMathSections(data,bookId):[],[data,bookId]);
  if(isLoading)return <div className="sht-try-book-loading" role="status"><Loader2 className="animate-spin" size={22} aria-hidden="true"/>{t.pending}</div>;
  if(error||!data)return <div className="sht-try-book-empty" role="alert">{t.failed}<button type="button" onClick={()=>void refetch()}><RefreshCw size={16} aria-hidden="true"/>{t.restart}</button></div>;
  return <SectionSamples sections={sections} meta={meta}/>;
}

export function GuestBookBrowser({initialCategory="all"}:{initialCategory?:PreviewCategory}) {
  const lang=useLang();
  const t=GUEST_BOOK_TEXT[lang];
  const [category,setCategory]=useState<PreviewCategory>(initialCategory);
  const [selected,setSelected]=useState<string|null>(null);
  useEffect(()=>{setCategory(initialCategory);setSelected(null);},[initialCategory]);
  const filtered=useMemo(()=>GUEST_BOOKS.filter(b=>category==="all"||b.category===category),[category]);
  const book=GUEST_BOOKS.find(b=>b.id===selected)||null;
  return <section className="sht-try-book-browser">
    {book? <BookContent key={book.id} meta={book} onBack={()=>setSelected(null)}/> : (
      <>
        <div className="sht-try-browser-header">
          <div><span className="sht-try-eyebrow"><Sparkles size={15} aria-hidden="true"/>{t.browse}</span>
            <h3>{t.title}</h3><p>{t.description}</p></div>
          <span className="sht-try-book-count">{GUEST_BOOKS.length} {t.count}</span>
        </div>
        <div className="sht-try-book-filters" role="group" aria-label={t.selected}>
          {FILTERS.map(filter=>(
            <button type="button" key={filter} aria-pressed={category===filter} className={category===filter?"is-selected":""}
              onClick={()=>setCategory(filter)}>{t.categories[filter]}</button>
          ))}
        </div>
        <div className="sht-try-book-grid">
          {filtered.map(meta=>(
            <button className="sht-try-book-tile" type="button" key={meta.id} onClick={()=>setSelected(meta.id)}
              aria-label={`${meta.title} ${meta.sub}: ${meta.category==="english"?t.twoTexts:t.twoQuestions}`}>
              <BookCover src={meta.cover} title={meta.title}/>
              <span className="sht-try-book-tile-copy"><strong>{meta.title}</strong><span>{meta.sub}</span>
                <span className="sht-try-book-preview-label"><Check size={14} aria-hidden="true"/>{meta.category==="english"?t.twoTexts:t.twoQuestions}</span></span>
              <span className="sht-try-book-tile-arrow"><ChevronRight size={18} aria-hidden="true"/></span>
            </button>
          ))}
        </div>
        <p className="sht-try-browser-disclaimer">{t.disclaimer}</p>
      </>
    )}
  </section>;
}
