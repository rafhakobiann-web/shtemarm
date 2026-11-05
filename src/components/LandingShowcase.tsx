import { Link } from "@tanstack/react-router";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import {
  ArrowRight, BookOpen, BookMarked, Bookmark, Check, ChevronLeft, ChevronRight,
  CircleHelp, Clock3, Download, GraduationCap, Layers3, RotateCcw,
  Send, Sparkles, Star, Target, Trophy, Volume2, WandSparkles, Zap,
} from "lucide-react";

type Lang = "hy" | "en" | "ru";
const WORDS = {
  hy: {
    books: "Շտեմարաններ", other: "Այլ հնարավորություններ", test: "Փորձնական քննություն",
    all: "Բոլորը", english: "Անգլերեն", math: "Մաթեմատիկա", armenian: "Հայոց լեզու",
    open: "Բացել", preview: "Սա ինտերակտիվ ցուցադրություն է",
    exercise: "Սովորիր գործնականում", exerciseTitle: "Լուծիր մի հարց հենց այստեղ",
    exerciseDesc: "Փորձիր իրական ուսումնական միջերեսի հնարավորությունները՝ առանց գրանցվելու։",
    question: "Լուծիր հավասարումը՝ 2x + 6 = 14։ Որքա՞ն է x-ը։",
    correct: "Ճիշտ է։ 2x = 8, հետևաբար x = 4։",
    incorrect: "Դեռ ոչ։ Երկու կողմերից հանիր 6, հետո բաժանիր 2-ի։",
    again: "Կրկին փորձել", seeMore: "Բացել շտեմարանները",
    teacherTag: "Անհատական ուսուցում · ցուցադրություն",
    teacherTitle: "Չես հասկանում՞։ Հարցրու ուսուցչին",
    teacherDesc: "Ստացիր քայլ առ քայլ բացատրություններ։ Այս զրույցը ցուցադրական է. իրական AI ուսուցիչը հասանելի է մուտքից հետո։",
    teacherPrompt: "Ինչպե՞ս լուծել 2x + 6 = 14 հավասարումը։",
    teacherAnswer: "Սկզբում երկու կողմերից հանում ենք 6. ստացվում է 2x = 8։ Հետո բաժանում ենք 2-ի և գտնում x = 4։",
    teacherAlt: "Ինչո՞ւ ենք հանում 6-ը։", teacherAltAnswer: "Մեր նպատակն է x-ով անդամը թողնել առանձին։ Հակադարձ գործողությունը պահպանում է հավասարությունը։",
    askTeacher: "Փորձել AI ուսուցչին",
    readerTag: "Անգլերեն · ընթերցում",
    readerTitle: "Անծանոթ բառ՞։ Սեղմիր վրան",
    readerDesc: "Ընթերցիր անգլերեն տեքստը, ուսումնասիրիր բառերը և փորձիր հարցերը՝ հարմար ձևաչափով։",
    wordTip: "ընտրիր ընդգծված բառը",
    saved: "Պահպանված է", save: "Պահպանել", increase: "Մեծացնել տեքստը",
    toolsTag: "Սովորելու քո ձևը", toolsTitle: "Ամեն ինչ՝ մեկ վայրում",
    toolsDesc: "Շտեմարաններ, բառաքարտեր, բացատրություններ և առաջընթաց՝ պարզ ու կազմակերպված։",
    flashcards: "Բառաքարտեր", flashDesc: "Վարժվիր և վերադարձիր չյուրացրած բառերին։",
    mistakes: "Սխալների կրկնություն", mistakesDesc: "Սովորիր հարցերից, որոնցում դժվարացել ես։",
    progress: "Քո առաջընթացը", progressDesc: "Տես, թե ինչ ես արդեն սովորել։",
    games: "Ուսումնական խաղեր", gamesDesc: "Կրկնիր նյութը հետաքրքիր ձևով։",
    progressTag: "Մոտիվացիա · ցուցադրություն", progressTitle: "Ամեն օր՝ մի քայլ առաջ",
    progressDesc: "Նպատակներ, ձեռքբերումներ և հստակ առաջընթաց՝ առանց ավելորդ ճնշման։",
    demoProgress: "Առաջընթացի օրինակ", target: "Օրվա նպատակ", level: "Մակարդակ", streak: "Անընդմեջ օրեր",
    downloadTag: "Android հավելված", downloadTitle: "Սովորիր նաև հեռախոսով",
    downloadDesc: "Shtemarm-ը հասանելի է կայքում և Android հավելվածով։ APK-ը վերցրու մեր ներբեռնման էջից, ոչ թե Google Play-ից։",
    download: "Ներբեռնել հավելվածը", web: "Սկսել կայքում", learn: "Սկսել սովորել",
    sampleLabel: "Սա օրինակ է, ոչ թե քո հաշվի տվյալները։",
  },
  en: {
    books: "Question books", other: "More features", test: "Practice exam",
    all: "All", english: "English", math: "Mathematics", armenian: "Armenian",
    open: "Open", preview: "Interactive demonstration",
    exercise: "Learn by doing", exerciseTitle: "Try a question right here",
    exerciseDesc: "Experience the learning interface without signing up.",
    question: "Solve the equation 2x + 6 = 14. What is x?",
    correct: "Correct! 2x = 8, so x = 4.",
    incorrect: "Not quite. Subtract 6 from both sides, then divide by 2.",
    again: "Try again", seeMore: "Explore question books",
    teacherTag: "Personalized learning · demonstration", teacherTitle: "Stuck? Ask the teacher",
    teacherDesc: "Understand every step with helpful explanations. This chat is a demo; the actual AI teacher is available after sign-in.",
    teacherPrompt: "How do I solve 2x + 6 = 14?",
    teacherAnswer: "First subtract 6 from both sides: 2x = 8. Now divide by 2 to get x = 4.",
    teacherAlt: "Why do we subtract 6?", teacherAltAnswer: "We want to isolate the term containing x. The inverse operation keeps the equation balanced.",
    askTeacher: "Try the AI teacher",
    readerTag: "English · reading", readerTitle: "A word you don't know? Tap it",
    readerDesc: "Read English passages, explore vocabulary and practice questions in a comfortable layout.",
    wordTip: "tap the underlined word", saved: "Saved", save: "Save", increase: "Increase text size",
    toolsTag: "Your way of learning", toolsTitle: "Everything in one place",
    toolsDesc: "Question books, flashcards, explanations and progress organized around learning.",
    flashcards: "Flashcards", flashDesc: "Practice and revisit unfamiliar vocabulary.",
    mistakes: "Mistake review", mistakesDesc: "Learn from questions you found difficult.",
    progress: "Your progress", progressDesc: "See what you've already learned.",
    games: "Learning games", gamesDesc: "Refresh your knowledge through play.",
    progressTag: "Motivation · demonstration", progressTitle: "One step forward, every day",
    progressDesc: "Goals and achievements that help you see progress without pressure.",
    demoProgress: "Example progress", target: "Daily goal", level: "Level", streak: "Day streak",
    downloadTag: "Android app", downloadTitle: "Study on your phone, too",
    downloadDesc: "Use Shtemarm on the web or Android. Get the APK from our download page, not Google Play.",
    download: "Download the app", web: "Start on the web", learn: "Start learning",
    sampleLabel: "Illustration only, not your account data.",
  },
  ru: {
    books: "Сборники", other: "Другие возможности", test: "Пробный экзамен",
    all: "Все", english: "Английский", math: "Математика", armenian: "Армянский",
    open: "Открыть", preview: "Интерактивный пример",
    exercise: "Учись на практике", exerciseTitle: "Реши вопрос прямо здесь",
    exerciseDesc: "Попробуй учебный интерфейс без регистрации.",
    question: "Реши уравнение 2x + 6 = 14. Чему равен x?",
    correct: "Верно! 2x = 8, следовательно, x = 4.",
    incorrect: "Пока нет. Вычти 6 из обеих частей, затем раздели на 2.",
    again: "Попробовать снова", seeMore: "Открыть сборники",
    teacherTag: "Индивидуальное обучение · пример", teacherTitle: "Не понял? Спроси учителя",
    teacherDesc: "Пошаговые объяснения помогают разобраться в теме. Этот чат — пример; настоящий ИИ-учитель доступен после входа.",
    teacherPrompt: "Как решить 2x + 6 = 14?",
    teacherAnswer: "Сначала вычтем 6 из обеих частей: 2x = 8. Затем разделим на 2 и получим x = 4.",
    teacherAlt: "Зачем вычитать 6?", teacherAltAnswer: "Нужно оставить член с x отдельно. Обратное действие сохраняет равенство.",
    askTeacher: "Попробовать ИИ-учителя",
    readerTag: "Английский · чтение", readerTitle: "Незнакомое слово? Нажми",
    readerDesc: "Читай тексты на английском, изучай слова и отвечай на вопросы в удобном формате.",
    wordTip: "нажми на подчёркнутое слово", saved: "Сохранено", save: "Сохранить", increase: "Увеличить текст",
    toolsTag: "Твой способ обучения", toolsTitle: "Всё в одном месте",
    toolsDesc: "Сборники, карточки, объяснения и прогресс — всё для удобного обучения.",
    flashcards: "Карточки", flashDesc: "Тренируй и повторяй незнакомые слова.",
    mistakes: "Повтор ошибок", mistakesDesc: "Разбирай сложные вопросы.",
    progress: "Твой прогресс", progressDesc: "Смотри, что уже изучено.",
    games: "Учебные игры", gamesDesc: "Повторяй материал в игре.",
    progressTag: "Мотивация · пример", progressTitle: "Каждый день — шаг вперёд",
    progressDesc: "Цели и достижения без лишнего давления.",
    demoProgress: "Пример прогресса", target: "Цель на день", level: "Уровень", streak: "Дней подряд",
    downloadTag: "Приложение Android", downloadTitle: "Учись и с телефона",
    downloadDesc: "Shtemarm работает на сайте и Android. APK доступен на странице загрузки, не в Google Play.",
    download: "Скачать приложение", web: "Начать на сайте", learn: "Начать обучение",
    sampleLabel: "Это пример, а не данные аккаунта.",
  },
} as const;

function PhoneShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={"ref-device " + className}>
      <div className="ref-device-frame">
        <div className="ref-device-status" aria-hidden="true"><span>09:41</span><span className="ref-island" /><span className="ref-signal">▂▄▆ ◕ ▰</span></div>
        <div className="ref-device-screen">{children}</div>
        <div className="ref-home-indicator" aria-hidden="true" />
      </div>
    </div>
  );
}

export function LandingHeroPhone({ lang }: { lang: Lang }) {
  const w = WORDS[lang];
  const [subject, setSubject] = useState<"english" | "math" | "armenian">("english");
  const names = { english: w.english, math: w.math, armenian: w.armenian };
  return (
    <PhoneShell className="ref-hero-phone">
      <div className="ref-phone-top">
        <div className="ref-phone-logo"><img src="/shtemarm-logo.svg" width="29" height="29" alt="" /><strong>Shtemarm</strong></div>
        <CircleHelp size={20} aria-hidden="true" />
      </div>
      <div className="ref-phone-tabs" role="group" aria-label={w.books}>
        {(Object.keys(names) as Array<keyof typeof names>).map(key => (
          <button type="button" key={key} className={subject === key ? "is-active" : ""} aria-pressed={subject === key} onClick={() => setSubject(key)}>{names[key]}</button>
        ))}
      </div>
      <div className="ref-phone-content">
        <h3>{w.books}</h3>
        <div className="ref-book-row">
          {[1, 2, 3].map(n => (
            <Link to="/auth" className={"ref-book ref-book-" + n} key={n} aria-label={names[subject] + " " + n + " · " + w.open}>
              <span className="ref-book-name">{names[subject]}</span>
              <span className="ref-book-type">{lang === "hy" ? "ՄԱՍ" : lang === "ru" ? "ЧАСТЬ" : "PART"}</span>
              <strong>{["I", "II", "III"][n - 1]}</strong>
              <span className="ref-book-open">{w.open} ›</span>
            </Link>
          ))}
        </div>
        <h3>{w.other}</h3>
        <Link to="/auth" className="ref-phone-listitem"><span><GraduationCap size={19} /></span>{w.test}<ArrowRight size={17} /></Link>
        <Link to="/auth" className="ref-phone-listitem"><span><BookMarked size={19} /></span>{w.flashcards}<ArrowRight size={17} /></Link>
        <Link to="/auth" className="ref-phone-listitem"><span><Sparkles size={19} /></span>{w.askTeacher}<ArrowRight size={17} /></Link>
      </div>
    </PhoneShell>
  );
}

function SampleQuestion({ lang }: { lang: Lang }) {
  const w = WORDS[lang];
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <div className="ref-question-card">
      <div className="ref-question-steps"><span className="is-active">1</span><span>2</span><span>3</span><span>4</span></div>
      <div className="ref-question-head"><span>01 / 04</span><span><Clock3 size={13} /> {w.preview}</span></div>
      <h3>{w.question}</h3>
      <div className="ref-question-options" role="group" aria-label={w.question}>
        {[2, 3, 4, 5].map((number, index) => (
          <button type="button" key={number} aria-pressed={choice === number} onClick={() => setChoice(number)}
            className={(choice === number ? "is-selected " : "") + (choice === number && number === 4 ? "is-correct" : "")}>
            <span>{String.fromCharCode(65 + index)}</span><strong>x = {number}</strong>{choice === number && number === 4 ? <Check size={18} /> : null}
          </button>
        ))}
      </div>
      <div className="ref-question-feedback" aria-live="polite">
        {choice === null ? <span className="ref-question-hint"><Target size={16} />{w.exerciseDesc}</span> :
          <div className={choice === 4 ? "is-correct" : "is-incorrect"}><Sparkles size={18} />{choice === 4 ? w.correct : w.incorrect}</div>}
      </div>
      <div className="ref-question-bottom">
        <button type="button" onClick={() => setChoice(null)}><RotateCcw size={16} />{w.again}</button>
        <Link to="/auth">{w.seeMore}<ArrowRight size={17} /></Link>
      </div>
    </div>
  );
}

function TeacherPhone({ lang }: { lang: Lang }) {
  const w = WORDS[lang];
  const [question, setQuestion] = useState(0);
  return (
    <PhoneShell className="ref-teacher-phone">
      <div className="ref-teacher-head"><ChevronLeft size={20} /><span><Sparkles size={16} /> Shtemarm AI</span><span className="ref-online-dot" /></div>
      <div className="ref-chat-date">{w.preview}</div>
      <div className="ref-chat-bubble ref-chat-user" key={"user-" + question}>{question === 0 ? w.teacherPrompt : w.teacherAlt}</div>
      <div className="ref-chat-bubble ref-chat-assistant" key={"answer-" + question}>
        <span className="ref-chat-avatar"><Sparkles size={15} /></span>
        <div><strong>Shtemarm AI</strong><p>{question === 0 ? w.teacherAnswer : w.teacherAltAnswer}</p></div>
      </div>
      <div className="ref-teacher-suggestions">
        <button type="button" onClick={() => setQuestion(current => (current + 1) % 2)}><WandSparkles size={14} />{question === 0 ? w.teacherAlt : w.teacherPrompt}</button>
      </div>
      <div className="ref-chat-input"><span>{w.preview}</span><Send size={17} /></div>
    </PhoneShell>
  );
}

function ReadingPhone({ lang }: { lang: Lang }) {
  const w = WORDS[lang];
  const [saved, setSaved] = useState(false);
  const [large, setLarge] = useState(false);
  const [definition, setDefinition] = useState(false);
  return (
    <PhoneShell className="ref-reader-phone">
      <div className="ref-reader-toolbar">
        <ChevronLeft size={20} /><strong>AA</strong>
        <button type="button" onClick={() => setLarge(v => !v)} aria-label={w.increase} aria-pressed={large}>A<span>+</span></button>
        <button type="button" onClick={() => setSaved(v => !v)} aria-pressed={saved}><Bookmark size={16} fill={saved ? "currentColor" : "none"} />{saved ? w.saved : w.save}</button>
      </div>
      <div className={"ref-reading-text" + (large ? " is-large" : "")}>
        <h3>Text 1</h3>
        <p>Every small step can lead to a big discovery. Learning something new takes time, curiosity and practice. Students who stay <button type="button" onClick={() => setDefinition(v => !v)} aria-expanded={definition}>curious</button> ask better questions and find new ways to solve problems.</p>
        {definition && <div className="ref-word-definition" role="status"><Volume2 size={16} /> <strong>curious</strong> — eager to learn or know more.</div>}
        <p>Some answers are easy to find. Others appear only after a little patience.</p>
      </div>
      <div className="ref-reader-task"><span>01 / 02</span><h4>What helps students discover new things?</h4><div>{w.wordTip}</div></div>
    </PhoneShell>
  );
}

export function LandingShowcase({ lang }: { lang: Lang }) {
  const w = WORDS[lang];
  const [card, setCard] = useState(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const words = [{ front: "curious", back: "eager to learn" }, { front: "improve", back: "to make better" }, { front: "achieve", back: "to reach a goal" }];
  const nextCard = () => setCard(current => (current + 1) % words.length);
  const previousCard = () => setCard(current => (current + words.length - 1) % words.length);
  const handleCardDown = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === "touch") swipeStart.current = { x: event.clientX, y: event.clientY }; };
  const handleCardUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current; swipeStart.current = null;
    if (start && Math.abs(event.clientX - start.x) > 48 && Math.abs(event.clientY - start.y) < 80) nextCard();
  };
  return (
    <>
      <section className="ref-story ref-story-practice" id="practice-demo" aria-labelledby="ref-practice-title">
        <div className="ref-story-inner">
          <div className="ref-story-copy">
            <span className="ref-story-eyebrow"><Target size={15} />{w.exercise}</span>
            <h2 id="ref-practice-title">{w.exerciseTitle}</h2>
            <p>{w.exerciseDesc}</p>
            <div className="ref-story-mark"><span>01</span><i /></div>
          </div>
          <div className="ref-story-visual"><SampleQuestion lang={lang} /></div>
        </div>
      </section>
      <section className="ref-story ref-story-teacher" aria-labelledby="ref-teacher-title">
        <div className="ref-story-inner">
          <div className="ref-story-copy">
            <span className="ref-story-eyebrow"><Sparkles size={15} />{w.teacherTag}</span>
            <h2 id="ref-teacher-title">{w.teacherTitle}</h2>
            <p>{w.teacherDesc}</p>
            <Link to="/auth" className="ref-story-link">{w.askTeacher}<ArrowRight size={18} /></Link>
            <div className="ref-story-mark"><span>02</span><i /></div>
          </div>
          <div className="ref-story-visual"><TeacherPhone lang={lang} /></div>
        </div>
      </section>
      <section className="ref-story ref-story-reader" aria-labelledby="ref-reader-title">
        <div className="ref-story-inner">
          <div className="ref-story-copy">
            <span className="ref-story-eyebrow"><BookOpen size={15} />{w.readerTag}</span>
            <h2 id="ref-reader-title">{w.readerTitle}</h2>
            <p>{w.readerDesc}</p>
            <div className="ref-story-mark"><span>03</span><i /></div>
          </div>
          <div className="ref-story-visual"><ReadingPhone lang={lang} /></div>
        </div>
      </section>
      <section className="ref-story ref-story-tools" aria-labelledby="ref-tools-title">
        <div className="ref-story-inner">
          <div className="ref-story-copy">
            <span className="ref-story-eyebrow"><Layers3 size={15} />{w.toolsTag}</span>
            <h2 id="ref-tools-title">{w.toolsTitle}</h2>
            <p>{w.toolsDesc}</p>
            <div className="ref-tool-cards">
              {[
                { Icon: BookMarked, title: w.flashcards, desc: w.flashDesc },
                { Icon: RotateCcw, title: w.mistakes, desc: w.mistakesDesc },
                { Icon: Target, title: w.progress, desc: w.progressDesc },
                { Icon: Zap, title: w.games, desc: w.gamesDesc },
              ].map(({ Icon, title, desc }) => <div className="ref-tool" key={title}><Icon size={20} /><strong>{title}</strong><p>{desc}</p></div>)}
            </div>
          </div>
          <div className="ref-story-visual ref-flashcard-stage" onPointerDown={handleCardDown} onPointerUp={handleCardUp} onPointerCancel={() => { swipeStart.current = null; }}>
            <div className="ref-flashcard">
              <span><BookMarked size={17} />{w.flashcards}</span>
              <strong key={card}>{words[card].front}</strong>
              <p>{words[card].back}</p>
              <div className="ref-flashcard-nav"><button type="button" onClick={previousCard} aria-label="Previous flashcard"><ChevronLeft size={20} /></button><span>{card + 1} / 3</span><button type="button" onClick={nextCard} aria-label="Next flashcard"><ChevronRight size={20} /></button></div>
            </div>
            <span className="ref-flashcard-tip">{w.preview}</span>
          </div>
        </div>
      </section>
      <section className="ref-story ref-story-progress" aria-labelledby="ref-progress-title">
        <div className="ref-story-inner">
          <div className="ref-story-copy">
            <span className="ref-story-eyebrow"><Trophy size={15} />{w.progressTag}</span>
            <h2 id="ref-progress-title">{w.progressTitle}</h2>
            <p>{w.progressDesc}</p>
            <div className="ref-story-mark"><span>05</span><i /></div>
          </div>
          <div className="ref-story-visual">
            <div className="ref-progress-panel">
              <div className="ref-progress-header"><span><Star size={18} fill="currentColor" /> {w.demoProgress}</span><span>✨</span></div>
              <div className="ref-progress-rank"><span>1</span><div><strong>{w.level} 3</strong><small>{w.sampleLabel}</small></div><Trophy size={38} /></div>
              <div className="ref-progress-stat"><span>{w.target}</span><strong>7 / 10</strong></div>
              <div className="ref-progress-line"><span /></div>
              <div className="ref-progress-bottom"><span><Zap size={18} /> 120 XP</span><span><Star size={18} /> 3 {w.streak}</span></div>
            </div>
          </div>
        </div>
      </section>
      <section className="ref-download-band" aria-labelledby="ref-download-title">
        <span className="ref-story-eyebrow"><Download size={16} />{w.downloadTag}</span>
        <h2 id="ref-download-title">{w.downloadTitle}</h2>
        <p>{w.downloadDesc}</p>
        <div className="ref-download-actions">
          <Link to="/download" className="ref-download-primary"><Download size={18} />{w.download}<ArrowRight size={17} /></Link>
          <Link to="/auth" className="ref-download-secondary">{w.web}<ArrowRight size={17} /></Link>
        </div>
      </section>
    </>
  );
}
