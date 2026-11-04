import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, CircleHelp, GraduationCap, Layers3, Lightbulb, RotateCcw, Sparkles, Trophy, X } from "lucide-react";
import { useLang, setLang } from "@/lib/lang";
import { setAppearance } from "@/lib/theme";
import { GUEST_DEMO, guestCardSwipe, type GuestMode } from "@/lib/guest-demo";
import { GuestBookBrowser } from "@/components/GuestBookBrowser";
import { GUEST_BOOKS, GUEST_BOOK_TEXT } from "@/lib/guest-book-preview";

export const Route = createFileRoute("/try")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Try Shtemarm | Փորձիր առանց գրանցման" },
    { name: "description", content: "Իրական Shtemarm շտեմարաններ. փորձիր յուրաքանչյուր գրքից առաջին երկու հարցը և գրանցվիր՝ մնացածը բացելու համար։" },
    { property: "og:title", content: "Try Shtemarm — No account needed" },
    { property: "og:description", content: "Browse real Shtemarm question books, answer two guest questions per book, and unlock the rest after signing in." },
  ] }),
  component: GuestExperience,
});

function GuestExperience() {
  const lang = useLang();
  const { words: w, questions, cards } = GUEST_DEMO[lang];
  const bookWords = GUEST_BOOK_TEXT[lang];
  const [mode, setMode] = useState<GuestMode>("practice");
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  // Snapshot the missed pile when reviewing; don't lose a card mid-session
  // as the user marks it known. No storage or account write is involved.
  const [reviewQueue, setReviewQueue] = useState<string[] | null>(null);
  const currentCards = reviewQueue === null ? cards : cards.filter(c=>reviewQueue.includes(c.id));
  const [dragOffset, setDragOffset] = useState(0);
  const swipeStart = useRef<{ pointerId:number; x:number; y:number; dragging:boolean } | null>(null);
  const suppressClick = useRef(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeSelected, setChallengeSelected] = useState<number | null>(null);
  const [sampleXP, setSampleXP] = useState(0);

  useEffect(() => () => {
    if (clickTimer.current) clearTimeout(clickTimer.current);
  }, []);

  const resetCards = () => {
    setCardIndex(0);
    setRevealed(false);
    setReviewIds([]);
    setReviewQueue(null);
    setDragOffset(0);
    swipeStart.current = null;
  };
  const resetChallenge = () => {
    setChallengeIndex(0);
    setChallengeSelected(null);
    setSampleXP(0);
    setChallengeStarted(false);
  };
  const markCard = (outcome:"known"|"review") => {
    if (cardIndex >= currentCards.length) return;
    const cardId = currentCards[cardIndex]!.id;
    setReviewIds(prev => outcome === "review"
      ? prev.includes(cardId) ? prev : [...prev, cardId]
      : prev.filter(id=>id!==cardId));
    setCardIndex(n => n + 1);
    setRevealed(false);
    setDragOffset(0);
  };
  const replayMissed = () => {
    setReviewQueue([...reviewIds]);
    setCardIndex(0);
    setRevealed(false);
    setDragOffset(0);
    swipeStart.current = null;
  };
  const onCardDown = (event:ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    swipeStart.current = {pointerId:event.pointerId,x:event.clientX,y:event.clientY,dragging:false};
    if (clickTimer.current) clearTimeout(clickTimer.current);
    suppressClick.current = false;
  };
  const onCardMove = (event:ReactPointerEvent<HTMLButtonElement>) => {
    const s = swipeStart.current;
    if (!s || s.pointerId !== event.pointerId) return;
    const dx=event.clientX-s.x;
    const dy=event.clientY-s.y;
    if (!s.dragging && Math.abs(dy)>12 && Math.abs(dy)>Math.abs(dx)) {
      swipeStart.current=null;
      setDragOffset(0);
      return;
    }
    if (!s.dragging && Math.abs(dx)>14 && Math.abs(dx)>Math.abs(dy)*1.2) {
      s.dragging=true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    if (s.dragging) setDragOffset(Math.max(-140,Math.min(140,dx)));
  };
  const onCardUp = (event:ReactPointerEvent<HTMLButtonElement>) => {
    const s=swipeStart.current;
    if(!s || s.pointerId!==event.pointerId)return;
    swipeStart.current=null;
    if(s.dragging){
      suppressClick.current=true;
      if(clickTimer.current)clearTimeout(clickTimer.current);
      clickTimer.current=setTimeout(()=>{suppressClick.current=false;clickTimer.current=null;},0);
      const outcome=guestCardSwipe(event.clientX-s.x,event.clientY-s.y);
      if(outcome)markCard(outcome);
      else setDragOffset(0);
    }else setDragOffset(0);
  };
  const selectChallenge = (choice:number) => {
    if (!challengeStarted || challengeSelected !== null || challengeIndex >= questions.length) return;
    setChallengeSelected(choice);
    if (choice === questions[(challengeIndex+1)%questions.length]!.correct) setSampleXP(x => x + 20);
  };

  const cardsDone=cardIndex>=currentCards.length;
  const challengeDone=challengeIndex>=questions.length;
  const challengeQuestion=challengeDone?null:questions[(challengeIndex+1)%questions.length]!;
  const activeQuestion=challengeQuestion;
  const activeSelected=challengeSelected;
  const next=()=>{setChallengeIndex(i=>i+1);setChallengeSelected(null);};

  return (
    <div className="sht-try">
      <header className="sht-try-top">
        <Link className="sht-try-brand" to="/" aria-label="Shtemarm home">
          <span className="sht-try-logo"><img src="/shtemarm-logo.svg" alt="" width="32" height="32" /></span>
          <strong>Shtemarm</strong>
          <span className="sht-try-guest-badge">{w.guest}</span>
        </Link>
        <div className="sht-try-top-actions">
          <div className="sht-try-langs" role="group" aria-label={w.language}>
            {(["hy","en","ru"] as const).map(code=>
              <button key={code} type="button" aria-pressed={lang===code} onClick={()=>setLang(code)}>{code.toUpperCase()}</button>
            )}
          </div>
          <button type="button" className="sht-try-theme" onClick={()=>setAppearance({mode:document.documentElement.classList.contains("dark")?"light":"dark"})} aria-label={w.theme} title={w.theme}>
            <Sparkles size={18} aria-hidden="true"/>
          </button>
          <Link to="/auth" className="sht-try-signin">{w.signIn} <ArrowRight size={16} aria-hidden="true"/></Link>
        </div>
      </header>

      <div className="sht-try-heading">
        <div className="sht-try-copy">
          <span className="sht-try-eyebrow"><Sparkles size={16} aria-hidden="true" />{w.noSignup}</span>
          <h1>{w.title}</h1>
          <p>{w.subtitle}</p>
          <span className="sht-try-private"><CheckCircle2 size={16} aria-hidden="true" />{w.sampleOnly}</span>
        </div>
        <div className="sht-try-overview" aria-label={w.example}>
          <span className="sht-try-overview-icon"><GraduationCap size={26} aria-hidden="true"/></span>
          <div><strong>{GUEST_BOOKS.length}</strong><span>{bookWords.count}</span></div>
          <div><strong>3</strong><span>{w.cards}</span></div>
          <div><strong>+20</strong><span>{w.xp}</span></div>
        </div>
      </div>

      <div className="sht-try-content">
        <aside className="sht-try-sidebar">
          <p className="sht-try-sidebar-title">{w.startExploring}</p>
          <nav className="sht-try-modes" aria-label={w.navigation}>
            {([
              {id:"practice" as const, Icon:BookOpen,label:bookWords.title},
              {id:"cards" as const, Icon:Layers3,label:w.cards},
              {id:"challenge" as const, Icon:Trophy,label:w.challenge},
            ]).map(({id,Icon,label})=>(
              <button type="button" key={id} onClick={()=>setMode(id)} aria-current={mode===id?"page":undefined} className={mode===id?"is-active":""}>
                <Icon size={19} aria-hidden="true" /><span>{label}</span><ArrowRight size={15} aria-hidden="true"/>
              </button>
            ))}
          </nav>
          <div className="sht-try-sample-warning"><CircleHelp size={18} aria-hidden="true"/><p>{mode==="practice"?bookWords.disclaimer:w.note}</p></div>
        </aside>

        <section className="sht-try-panel" aria-labelledby="sht-try-panel-title">
          <div className="sht-try-panel-top">
            <span className="sht-try-panel-icon">
              {mode==="practice"?<BookOpen aria-hidden="true"/>:mode==="cards"?<Layers3 aria-hidden="true"/>:<Trophy aria-hidden="true"/>}
            </span>
            <div>
              <span className="sht-try-subtitle">{mode==="practice"?bookWords.firstTwo:w.example}</span>
              <h2 id="sht-try-panel-title">{mode==="practice"?bookWords.title:mode==="cards"?w.cards:w.challenge}</h2>
            </div>
            <span className="sht-try-live-label">{w.guest}</span>
          </div>

          {mode==="practice" && <GuestBookBrowser />}

          {mode==="cards" && (cardsDone ? (
            <div className="sht-try-completion" role="status">
              <CheckCircle2 size={42} aria-hidden="true"/>
              <h3>{w.cardFinished}</h3>
              <p>{w.reviewCount}: <strong>{reviewIds.length} / {cards.length}</strong></p>
              {reviewIds.length > 0 && <button type="button" className="sht-try-primary" onClick={replayMissed}><RotateCcw size={17} aria-hidden="true"/>{w.repeatMissed}</button>}
              <button type="button" className="sht-try-return" onClick={resetCards}><RotateCcw size={17} aria-hidden="true"/>{w.cardAgain}</button>
            </div>
          ) : (
            <div className="sht-try-task">
              <div className="sht-try-progress-row"><span>{cardIndex+1} / {currentCards.length}</span><span>{w.reviewCount}: {reviewIds.length}</span></div>
              <progress max={currentCards.length} value={cardIndex} aria-label={w.progress}/>
              <p className="sht-try-swipe-hint">{w.leftRight}</p>
              <button type="button" className="sht-try-flashcard" aria-pressed={revealed} aria-label={w.turnCard}
                data-drag={dragOffset<-38?"known":dragOffset>38?"review":"none"}
                style={{ transform:`translate3d(${dragOffset}px,0,0) rotate(${dragOffset/35}deg)` }}
                onPointerDown={onCardDown} onPointerMove={onCardMove} onPointerUp={onCardUp}
                onPointerCancel={()=>{swipeStart.current=null;setDragOffset(0);}}
                onClick={()=>{if(!suppressClick.current)setRevealed(v=>!v);}}>
                <span className="sht-try-card-hint">{revealed?w.turnCard:w.flipHint}</span>
                <strong>{revealed?currentCards[cardIndex]!.back:currentCards[cardIndex]!.front}</strong>
                <span>{revealed?currentCards[cardIndex]!.context:w.turnCard}</span>
              </button>
              <div className="sht-try-card-actions">
                <button type="button" className="sht-try-known" onClick={()=>markCard("known")}><Check size={18} aria-hidden="true"/>{w.know}</button>
                <button type="button" className="sht-try-review" onClick={()=>markCard("review")}><RotateCcw size={18} aria-hidden="true"/>{w.review}</button>
              </div>
            </div>
          ))}

          {mode==="challenge" && (!challengeStarted ? (
            <div className="sht-try-completion">
              <Trophy size={44} aria-hidden="true"/>
              <h3>{w.challenge}</h3>
              <p>{w.challengeIntro}</p>
              <button type="button" className="sht-try-primary" onClick={()=>setChallengeStarted(true)}>
                {w.begin}<ArrowRight size={17} aria-hidden="true"/>
              </button>
            </div>
          ) : challengeDone ? (
            <div className="sht-try-completion" role="status">
              <Trophy size={44} aria-hidden="true"/>
              <h3>{w.complete}</h3>
              <p>{w.xp}: <strong>{sampleXP}</strong></p>
              <button type="button" className="sht-try-primary" onClick={resetChallenge}><RotateCcw size={17} aria-hidden="true"/>{w.restart}</button>
            </div>
          ) : (
            <div className="sht-try-task" key={"challenge-"+challengeIndex}>
              <div className="sht-try-progress-row"><span>{w.question} {challengeIndex+1} / {questions.length}</span><span>{w.xp}: {sampleXP}</span></div>
              <progress max={questions.length} value={challengeIndex+(challengeSelected===null?0:1)} aria-label={w.progress}/>
              <h3>{challengeQuestion!.stem}</h3>
              <p className="sht-try-instruction">{w.choose}</p>
              <div className="sht-try-options" role="group" aria-label={w.choose}>
                {challengeQuestion!.options.map((option,i)=>(
                  <button key={i} type="button" disabled={challengeSelected!==null} aria-pressed={challengeSelected===i}
                    className={challengeSelected!==null&&i===challengeQuestion!.correct?"is-correct":challengeSelected===i?"is-incorrect":""}
                    onClick={()=>selectChallenge(i)}>
                    <span className="sht-try-option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span>
                    {challengeSelected!==null&&i===challengeQuestion!.correct?<Check size={18} aria-hidden="true"/>:null}
                  </button>
                ))}
              </div>
              {activeSelected!==null && activeQuestion && <div className="sht-try-feedback" role="status">
                <strong>{activeSelected===activeQuestion.correct?w.correct:w.incorrect}</strong>
                <p><Lightbulb size={16} aria-hidden="true"/>{activeQuestion.why}</p>
              </div>}
              <div className="sht-try-task-actions">
                <button type="button" className="sht-try-primary" disabled={challengeSelected===null} onClick={next}>
                  {challengeIndex===questions.length-1?w.finish:w.next}<ArrowRight size={17} aria-hidden="true"/>
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>

      <footer className="sht-try-cta">
        <div><span className="sht-try-eyebrow"><Sparkles size={15} aria-hidden="true"/>{w.nextFeature}</span>
          <h2>{w.create}</h2><p>{w.createDescription}</p></div>
        <div className="sht-try-footer-actions">
          <Link to="/auth" className="sht-try-primary">{w.create}<ArrowRight size={18} aria-hidden="true"/></Link>
          <Link to="/" className="sht-try-return"><ArrowLeft size={17} aria-hidden="true"/>{w.back}</Link>
        </div>
      </footer>
    </div>
  );
}
