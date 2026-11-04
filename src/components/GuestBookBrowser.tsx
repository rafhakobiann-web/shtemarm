import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, KeyRound, Loader2, LockKeyhole, RefreshCw, Sparkles, X } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { useBook } from "@/lib/useBook";
import { useMathBookIndex } from "@/lib/math-bank";
import { useLang } from "@/lib/lang";
import { GUEST_BOOK_LIMIT, GUEST_BOOKS, GUEST_BOOK_TEXT, pickGuestBookQuestions, pickGuestMathQuestions, type GuestBookMeta, type GuestBookQuestion, type PreviewCategory } from "@/lib/guest-book-preview";

const FILTERS:readonly PreviewCategory[]=["all","english","math","armenian","history","biology","physics","other"];

const normal = (s:string) => s.normalize("NFKC").replace(/\s+/g,"").replace(/,/g,".").toLowerCase();

function BookQuestionCard({ question, order, total, onAnswered }: { question:GuestBookQuestion;order:number;total:number;onAnswered:()=>void }) {
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
    onAnswered();
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
              onClick={()=>{setChoice(key);onAnswered();}}
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

function BookContent({ meta, onBack }: { meta:GuestBookMeta;onBack:()=>void }) {
  const lang=useLang();
  const t=GUEST_BOOK_TEXT[lang];
  const regular=meta.regularId!==undefined;
  return (
    <div className="sht-try-book-detail">
      <button type="button" onClick={onBack} className="sht-try-book-back"><ArrowLeft size={16} aria-hidden="true"/>{t.back}</button>
      <div className="sht-try-book-heading">
        <BookCover src={meta.cover} title={meta.title} size="lg"/>
        <div className="sht-try-book-heading-copy">
          <span className="sht-try-eyebrow"><BookOpen size={16} aria-hidden="true"/>{t.preview}</span>
          <h3>{meta.title}</h3>
          <p>{meta.sub}</p>
          <span className="sht-try-book-free"><Check size={15} aria-hidden="true"/>{t.firstTwo}</span>
        </div>
      </div>
      {regular ? <RegularBookSample bookId={meta.regularId!} /> : <MathBookSample bookId={meta.id as "matem-1"|"matem-2"} />}
      <div className="sht-try-locked-content">
        <div className="sht-try-lock-header">
          <span className="sht-try-lock-icon"><LockKeyhole size={24} aria-hidden="true"/></span>
          <div><strong>{t.sectionsLocked}</strong><p>{t.rest}</p></div>
        </div>
        <div className="sht-try-lock-items" aria-label={t.locked}>
          {[GUEST_BOOK_LIMIT+1,GUEST_BOOK_LIMIT+2,GUEST_BOOK_LIMIT+3].map(n=>(
            <div key={n} className="sht-try-lock-item"><span>{t.question} {n}</span><LockKeyhole size={16} aria-hidden="true"/><span>{t.locked}</span></div>
          ))}
        </div>
        <div className="sht-try-unlock-actions">
          <Link to="/auth" className="sht-try-primary"><KeyRound size={17} aria-hidden="true"/>{t.login}</Link>
          {regular ?
            <Link to="/book/$bookId" params={{bookId:String(meta.regularId)}} className="sht-try-book-full">
              {t.unlock}<ArrowRight size={16} aria-hidden="true"/>
            </Link> :
            <Link to="/math/books" className="sht-try-book-full">{t.unlock}<ArrowRight size={16} aria-hidden="true"/></Link>
          }
        </div>
      </div>
    </div>
  );
}

function BookSamples({questions}:{questions:GuestBookQuestion[]}) {
  const [position,setPosition]=useState(0);
  const [canAdvance,setCanAdvance]=useState(false);
  const t=GUEST_BOOK_TEXT[useLang()];
  if(questions.length===0)return <p className="sht-try-book-empty">{t.missing}</p>;
  const done=position>=questions.length;
  return (
    <section className="sht-try-book-samples">
      <div className="sht-try-book-progress"><span>{t.preview}</span><span>{questions.length} / {GUEST_BOOK_LIMIT}</span></div>
      <progress max={questions.length} value={Math.min(position,questions.length)} aria-label={t.preview}/>
      {done?(
        <div className="sht-try-book-end" role="status">
          <LockKeyhole size={28} aria-hidden="true"/>
          <strong>{t.ready}</strong><p>{t.rest}</p>
          <button type="button" className="sht-try-book-back" onClick={()=>{setPosition(0);setCanAdvance(false);}}><RefreshCw size={17} aria-hidden="true"/>{t.restart}</button>
        </div>
      ):(
        <div>
          <BookQuestionCard key={questions[position]!.id} question={questions[position]!} order={position+1} total={questions.length} onAnswered={()=>setCanAdvance(true)}/>
          <button type="button" className="sht-try-next-book" disabled={!canAdvance} onClick={()=>{setPosition(i=>i+1);setCanAdvance(false);}}>
            {position+1===questions.length?t.locked:t.next}<ChevronRight size={18} aria-hidden="true"/>
          </button>
        </div>
      )}
    </section>
  );
}

function RegularBookSample({bookId}:{bookId:number}){
  const {data,error,isLoading,refetch}=useBook(bookId);
  const t=GUEST_BOOK_TEXT[useLang()];
  const questions=useMemo(()=>data?pickGuestBookQuestions(data):[],[data]);
  if(isLoading)return <div className="sht-try-book-loading" role="status"><Loader2 className="animate-spin" size={22} aria-hidden="true"/>{t.pending}</div>;
  if(error||!data)return <div className="sht-try-book-empty" role="alert">{t.failed}<button type="button" onClick={()=>void refetch()}><RefreshCw size={16} aria-hidden="true"/>{t.restart}</button></div>;
  return <BookSamples questions={questions}/>;
}

function MathBookSample({bookId}:{bookId:"matem-1"|"matem-2"}){
  const {data,error,isLoading,refetch}=useMathBookIndex();
  const t=GUEST_BOOK_TEXT[useLang()];
  const questions=useMemo(()=>data?pickGuestMathQuestions(data,bookId):[],[data,bookId]);
  if(isLoading)return <div className="sht-try-book-loading" role="status"><Loader2 className="animate-spin" size={22} aria-hidden="true"/>{t.pending}</div>;
  if(error||!data)return <div className="sht-try-book-empty" role="alert">{t.failed}<button type="button" onClick={()=>void refetch()}><RefreshCw size={16} aria-hidden="true"/>{t.restart}</button></div>;
  return <BookSamples questions={questions}/>;
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
              aria-label={`${meta.title} ${meta.sub}: ${t.firstTwo}`}>
              <BookCover src={meta.cover} title={meta.title}/>
              <span className="sht-try-book-tile-copy"><strong>{meta.title}</strong><span>{meta.sub}</span>
                <span className="sht-try-book-preview-label"><Check size={14} aria-hidden="true"/>{t.firstTwo}</span></span>
              <span className="sht-try-book-tile-arrow"><ChevronRight size={18} aria-hidden="true"/></span>
            </button>
          ))}
        </div>
        <p className="sht-try-browser-disclaimer">{t.disclaimer}</p>
      </>
    )}
  </section>;
}
