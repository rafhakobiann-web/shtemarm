import { useRef, useState, type ReactNode, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, BookOpen, BookMarked, Check, CheckCircle2,
  ChevronDown, Clock3, Download, Flame, GraduationCap,
  ListChecks, Play, RotateCcw, Sparkles, Target, Trophy,
} from "lucide-react";
import { SITE_ANDROID_APK_URL } from "@/lib/app-download";
import "./reference-chapters.css";

type Lang = "hy" | "en" | "ru";
type Chapter = "books" | "reading" | "cards" | "mistakes" | "exam" | "community" | "access";

const TRANSLATIONS = {
  hy: {
    sample: "Ինտերակտիվ ցուցադրություն", booksTag: "Շտեմարաններ · ծանոթացում", booksTitle: "Շտեմարանները՝ քո ձեռքի տակ",
    booksDesc: "Ընտրիր առարկա և ծանոթացիր գրքերի կառուցվածքին։ Հարցերի իրական բովանդակությունը բացվում է ուսումնական հարթակում։",
    bookChoose: "Ընտրիր առարկան", bookShelf: "Շտեմարաններ", bookOne: "Հատոր I", bookTwo: "Հատոր II", bookThree: "Հատոր III",
    bookOpen: "Բացել շտեմարանները", readingTag: "Անգլերեն · ընթերցում", readingTitle: "Կարդա, մտածիր, ընտրիր պատասխանը",
    readingDesc: "Կարճ ընթերցողական օրինակով փորձիր, թե ինչպես են աշխատում տեքստային առաջադրանքները։",
    readingHeader: "Ընթերցանության առաջադրանք", readingQuestion: "Where does Ani go after school?",
    readingFeedbackYes: "Ճիշտ է․ տեքստում նշված է, որ Անին գնում է գրադարան։",
    readingFeedbackNo: "Կրկին կարդա առաջին նախադասությունը և փորձիր ընտրել ճիշտ պատասխանը։",
    readingPrompt: "Ընտրիր պատասխանը", readingTry: "Փորձել մեկ այլ պատասխան",
    cardsTag: "Բառաքարտեր · սովորում", cardsTitle: "Բառերն ավելի հեշտ են հիշվում",
    cardsDesc: "Սահեցրու ձախ՝ եթե գիտես բառը, աջ՝ եթե դեռ պետք է կրկնես։ Կարող ես օգտագործել նաև կոճակները։",
    cardsKnow: "Գիտեմ", cardsReview: "Կրկնելու եմ", cardsSaved: "Կրկնության ենթակա", cardsNext: "Հաջորդ բառը", cardsReset: "Կրկնել սկզբից",
    cardsHint: "Ձախ ← գիտեմ · աջ → կրկնելու եմ", cardsComplete: "Բոլոր ցուցադրական քարտերն ավարտված են։",
    mistakesTag: "Սխալներ · վերանայում", mistakesTitle: "Սովորիր նաև սխալ պատասխաններից",
    mistakesDesc: "Ամեն սխալը կարող է դառնալ հաջորդ առաջընթացդ։ Բացիր քարտը և տես, թե ինչու է ճիշտ պատասխանը ճիշտ։",
    mistakesHeading: "Կրկնելու հարցեր", mistakesOpen: "Տեսնել բացատրությունը",
    mistakesItem1: "Որքա՞ն է 5 × 6-ը։", mistakesAnswer1: "30․ բազմապատկումը հինգը վեց անգամ գումարելն է։",
    mistakesItem2: "Ո՞րն է «արագ» բառի խոսքի մասը։", mistakesAnswer2: "Կախված գործածությունից՝ «արագ»-ը կարող է հանդես գալ որպես ածական կամ մակբայ։",
    examTag: "Քննության փորձարկում", examTitle: "Պատրաստվիր հանգիստ, քայլ առ քայլ",
    examDesc: "Ծանոթացիր քննության ռեժիմին, ընտրիր առարկան և անցիր իրական պարապմունքների՝ քո հաշվից։",
    examTitleIn: "Փորձնական քննություն", examSelect: "Ընտրիր առարկա", examRules: "Ժամանակի և միավորների հաշվարկը կախված է ընտրված քննության տեսակից։",
    examStart: "Բացել քննության բաժինը", examPractice: "Պարապելու ռեժիմ", examReview: "Սխալների ստուգում",
    communityTag: "Առաջընթաց · մոտիվացիա", communityTitle: "Ամեն օր՝ մի փոքր առաջ",
    communityDesc: "Առաջընթացի ուղի, XP և նվաճումներ՝ սովորելու գործընթացը տեսանելի դարձնելու համար։",
    communityWeekly: "Շաբաթական", communityMonthly: "Ամսական", communityTitleIn: "Օրինակային առաջընթաց",
    communitySample: "Ցուցադրական տվյալներ․ ոչ իրական օգտատերեր", communityStep1: "Սկիզբ", communityStep2: "Առաջընթաց", communityStep3: "Նպատակ",
    communityCta: "Սկսել իմ ուղին", accessTag: "Հասանելիություն", accessTitle: "Սկսիր հիմա՝ առանց բարդությունների",
    accessDesc: "Կայքը հասանելի է բրաուզերում, իսկ Android-ի փորձնական APK-ն կարող ես ներբեռնել անմիջապես այստեղից։",
    accessColumn: "Ինչ է հասանելի", accessWeb: "Վեբ հարթակ", accessAndroid: "Android APK (բետա)",
    accessLearning: "Ուսումնական գործիքներ", accessFree: "Գրանցմամբ", accessVersion: "Փորձնական տարբերակ",
    accessAi: "AI ուսուցչի գործառույթներ", accessAiValue: "Կախված հասանելիությունից", accessGet: "Սկսել սովորել",
    accessDownload: "Ներբեռնել APK", accessNotice: "Google Play-ում հավելված դեռ չկա։ Այստեղից ներբեռնվող APK-ն փորձնական է։",
  },
  en: {
    sample: "Interactive illustration", booksTag: "Question books · explore", booksTitle: "Your question books, close at hand",
    booksDesc: "Pick a subject and explore its book structure. Actual question content opens in the learning platform.",
    bookChoose: "Choose a subject", bookShelf: "Question books", bookOne: "Volume I", bookTwo: "Volume II", bookThree: "Volume III",
    bookOpen: "Explore the books", readingTag: "English · reading", readingTitle: "Read, think, choose your answer",
    readingDesc: "Try a short original reading example to see how text-based exercises work.",
    readingHeader: "Reading comprehension", readingQuestion: "Where does Ani go after school?",
    readingFeedbackYes: "Correct. The passage says Ani goes to the library.",
    readingFeedbackNo: "Read the first sentence again and choose another answer.",
    readingPrompt: "Choose an answer", readingTry: "Choose another answer",
    cardsTag: "Flashcards · learning", cardsTitle: "Make new words easier to remember",
    cardsDesc: "Swipe left when you know the word, right if you need to review it. The buttons work too.",
    cardsKnow: "I know it", cardsReview: "Review later", cardsSaved: "Needs review", cardsNext: "Next word", cardsReset: "Start again",
    cardsHint: "Left ← I know · Right → review", cardsComplete: "You finished all the sample cards.",
    mistakesTag: "Mistakes · review", mistakesTitle: "Learn from every missed answer",
    mistakesDesc: "A mistake can be your next step forward. Open a card to understand its answer.",
    mistakesHeading: "Questions to revisit", mistakesOpen: "Reveal explanation",
    mistakesItem1: "What is 5 × 6?", mistakesAnswer1: "30. Multiplication means adding five six times.",
    mistakesItem2: "What can the Armenian word «արագ» mean grammatically?", mistakesAnswer2: "Depending on context, «արագ» (fast) can function as an adjective or an adverb.",
    examTag: "Exam practice", examTitle: "Prepare calmly, step by step",
    examDesc: "See what exam practice feels like, select a subject and open practice from your account.",
    examTitleIn: "Practice examination", examSelect: "Choose a subject", examRules: "Time and scoring rules depend on the selected exam type.",
    examStart: "Open exam practice", examPractice: "Practice mode", examReview: "Review mistakes",
    communityTag: "Progress · motivation", communityTitle: "A little further, every day",
    communityDesc: "A study path, XP, and achievements to make your learning progress easier to see.",
    communityWeekly: "This week", communityMonthly: "This month", communityTitleIn: "Example progress",
    communitySample: "Illustrative data, not real users", communityStep1: "Start", communityStep2: "Progress", communityStep3: "Goal",
    communityCta: "Start my journey", accessTag: "Access", accessTitle: "Get started without the complications",
    accessDesc: "Use the website in your browser, or download the Android beta APK directly from this site.",
    accessColumn: "What's included", accessWeb: "Web platform", accessAndroid: "Android APK (beta)",
    accessLearning: "Learning tools", accessFree: "With sign-in", accessVersion: "Beta version",
    accessAi: "AI tutor features", accessAiValue: "Subject to availability", accessGet: "Start learning",
    accessDownload: "Download APK", accessNotice: "There is no Google Play listing yet. The available APK is a beta build.",
  },
  ru: {
    sample: "Интерактивная демонстрация", booksTag: "Сборники · знакомство", booksTitle: "Сборники заданий всегда под рукой",
    booksDesc: "Выбери предмет и познакомься со структурой книг. Сами задания доступны в учебной платформе.",
    bookChoose: "Выбери предмет", bookShelf: "Сборники заданий", bookOne: "Том I", bookTwo: "Том II", bookThree: "Том III",
    bookOpen: "Открыть сборники", readingTag: "Английский · чтение", readingTitle: "Читай, думай, выбирай ответ",
    readingDesc: "Попробуй короткое авторское упражнение на понимание текста.",
    readingHeader: "Чтение и понимание", readingQuestion: "Where does Ani go after school?",
    readingFeedbackYes: "Верно. В тексте сказано, что Ани идёт в библиотеку.",
    readingFeedbackNo: "Прочти первое предложение ещё раз и попробуй другой ответ.",
    readingPrompt: "Выбери ответ", readingTry: "Другой ответ",
    cardsTag: "Карточки · учёба", cardsTitle: "Запоминать слова стало проще",
    cardsDesc: "Смахни влево, если знаешь слово, вправо, если хочешь повторить. Есть и кнопки.",
    cardsKnow: "Знаю", cardsReview: "Повторить", cardsSaved: "Нужно повторить", cardsNext: "Следующее слово", cardsReset: "Сначала",
    cardsHint: "Влево ← знаю · Вправо → повторить", cardsComplete: "Все примеры карточек пройдены.",
    mistakesTag: "Ошибки · повторение", mistakesTitle: "Учись на своих ошибках",
    mistakesDesc: "Каждая ошибка — возможность стать увереннее. Открой карточку и узнай правильный ответ.",
    mistakesHeading: "Вопросы для повторения", mistakesOpen: "Показать объяснение",
    mistakesItem1: "Сколько будет 5 × 6?", mistakesAnswer1: "30. Умножение — это сложение пяти шесть раз.",
    mistakesItem2: "Какой частью речи может быть армянское слово «արագ»?", mistakesAnswer2: "В зависимости от контекста «արագ» может быть прилагательным или наречием.",
    examTag: "Подготовка к экзамену", examTitle: "Готовься спокойно, шаг за шагом",
    examDesc: "Посмотри на режим экзамена, выбери предмет и переходи к занятиям через свой аккаунт.",
    examTitleIn: "Пробный экзамен", examSelect: "Выбери предмет", examRules: "Время и баллы зависят от типа выбранного экзамена.",
    examStart: "Открыть экзамен", examPractice: "Тренировка", examReview: "Разбор ошибок",
    communityTag: "Прогресс · мотивация", communityTitle: "Чуть ближе к цели каждый день",
    communityDesc: "Учебный путь, XP и достижения помогают видеть свой прогресс.",
    communityWeekly: "Неделя", communityMonthly: "Месяц", communityTitleIn: "Пример прогресса",
    communitySample: "Демонстрация, не реальные пользователи", communityStep1: "Старт", communityStep2: "Прогресс", communityStep3: "Цель",
    communityCta: "Начать свой путь", accessTag: "Доступность", accessTitle: "Начни без сложностей",
    accessDesc: "Работай в браузере или скачай тестовый Android APK прямо с сайта.",
    accessColumn: "Что доступно", accessWeb: "Веб-платформа", accessAndroid: "Android APK (бета)",
    accessLearning: "Учебные инструменты", accessFree: "После входа", accessVersion: "Тестовая версия",
    accessAi: "Функции ИИ-репетитора", accessAiValue: "При наличии доступа", accessGet: "Начать учиться",
    accessDownload: "Скачать APK", accessNotice: "Приложения в Google Play пока нет. Доступная сборка — бета.",
  },
} as const;

const BOOK_SUBJECTS = {
  hy: ["Հայոց լեզու", "Անգլերեն", "Մաթեմատիկա", "Կենսաբանություն"],
  en: ["Armenian", "English", "Mathematics", "Biology"],
  ru: ["Армянский", "Английский", "Математика", "Биология"],
} as const;

const FLASH_WORDS = [
  { word: "Resilient", meaning: { hy: "Դիմացկուն", en: "Able to recover after difficulty", ru: "Стойкий" } },
  { word: "Curious", meaning: { hy: "Հետաքրքրասեր", en: "Eager to learn", ru: "Любознательный" } },
  { word: "Achieve", meaning: { hy: "Հասնել հաջողության", en: "To reach a goal", ru: "Достигать" } },
] as const;

function DeviceFrame({ children, title = "Shtemarm" }: { children: ReactNode; title?: string }) {
  return (
    <div className="sht-ref-device">
      <div className="sht-ref-device-status"><span>09:41</span><span className="sht-ref-island" aria-hidden="true" /><span aria-hidden="true">◖ ▰</span></div>
      <div className="sht-ref-device-brand"><img src="/shtemarm-logo.svg" alt="" width="22" height="22" />{title}</div>
      <div className="sht-ref-device-content">{children}</div>
      <div className="sht-ref-home-bar" aria-hidden="true" />
    </div>
  );
}

function ChapterIntro({ tag, title, description }: { tag: string; title: string; description: string }) {
  return <div className="sht-ref-intro"><span className="sht-ref-tag"><Sparkles size={14} aria-hidden="true" />{tag}</span><h2>{title}</h2><p>{description}</p></div>;
}

export function ReferenceChapters({ lang, part }: { lang: Lang; part: Chapter }) {
  const t = TRANSLATIONS[lang];
  const [subject, setSubject] = useState(0);
  const [readAnswer, setReadAnswer] = useState<number | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [review, setReview] = useState<number[]>([]);
  const [examSubject, setExamSubject] = useState(0);
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const start = useRef<{ x: number; y: number } | null>(null);
  const categorize = (needsReview: boolean) => {
    setReview(current => needsReview && !current.includes(cardIndex) ? [...current, cardIndex] : current);
    setCardIndex(current => Math.min(current + 1, FLASH_WORDS.length));
  };
  const onCardUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.35) categorize(dx > 0);
  };

  if (part === "books") return (
    <section id="book-preview" className="sht-ref-section sht-ref-books">
      <ChapterIntro tag={t.booksTag} title={t.booksTitle} description={t.booksDesc} />
      <div className="sht-ref-visual">
        <DeviceFrame title={t.bookShelf}>
          <div className="sht-ref-chips" role="group" aria-label={t.bookChoose}>{BOOK_SUBJECTS[lang].map((item, index) =>
            <button key={item} type="button" aria-pressed={subject === index} onClick={() => setSubject(index)}>{item}</button>)}</div>
          <div className="sht-ref-inner-heading"><h3>{t.bookShelf}</h3><BookOpen size={18} aria-hidden="true" /></div>
          <div className="sht-ref-book-row" aria-live="polite">{[t.bookOne, t.bookTwo, t.bookThree].map((v, i) =>
            <div className={"sht-ref-book sht-ref-book-" + i} key={i}>
              <span>{BOOK_SUBJECTS[lang][subject]}</span><strong>{["I", "II", "III"][i]}</strong><small>{v}</small>
            </div>)}</div>
          <div className="sht-ref-phone-action"><Link to="/auth">{t.bookOpen}<ArrowRight size={15} aria-hidden="true" /></Link></div>
          <span className="sht-ref-sample">{t.sample}</span>
        </DeviceFrame>
      </div>
    </section>
  );

  if (part === "reading") return (
    <section id="reading-preview" className="sht-ref-section sht-ref-paper sht-ref-reading">
      <ChapterIntro tag={t.readingTag} title={t.readingTitle} description={t.readingDesc} />
      <div className="sht-ref-visual">
        <DeviceFrame title={t.readingHeader}>
          <span className="sht-ref-mini-kicker">ENGLISH / READING</span>
          <article className="sht-ref-passage" lang="en">After school, Ani goes to the library. She enjoys reading about stars and planets. On Fridays, she borrows a new book to share with her brother.</article>
          <h3 className="sht-ref-question" lang="en">{t.readingQuestion}</h3>
          <div className="sht-ref-answer-list" role="group" aria-label={t.readingPrompt}>{["To the park", "To the library", "To the market"].map((option, index) =>
            <button type="button" key={option} onClick={() => setReadAnswer(index)} aria-pressed={readAnswer === index}
              className={readAnswer === index ? (index === 1 ? "is-right" : "is-not-right") : ""}>
              <span>{String.fromCharCode(65 + index)}</span>{option}{readAnswer === index && index === 1 ? <Check size={16} aria-hidden="true" /> : null}
            </button>)}</div>
          {readAnswer !== null && <p className="sht-ref-feedback" role="status">{readAnswer === 1 ? t.readingFeedbackYes : t.readingFeedbackNo}</p>}
          <span className="sht-ref-sample">{t.sample}</span>
        </DeviceFrame>
      </div>
    </section>
  );

  if (part === "cards") return (
    <section id="flashcard-preview" className="sht-ref-section sht-ref-lavender">
      <ChapterIntro tag={t.cardsTag} title={t.cardsTitle} description={t.cardsDesc} />
      <div className="sht-ref-visual">
        <DeviceFrame title={t.cardsTag}>
          <div className="sht-ref-card-progress"><span>{Math.min(cardIndex + 1, FLASH_WORDS.length)} / {FLASH_WORDS.length}</span><span><BookMarked size={14} aria-hidden="true" />{t.cardsSaved}: {review.length}</span></div>
          {cardIndex < FLASH_WORDS.length ? (
            <div className="sht-ref-flashcard" onPointerDown={event => {
              if (event.pointerType === "touch" || event.pointerType === "pen") start.current = { x: event.clientX, y: event.clientY };
            }} onPointerUp={onCardUp} onPointerCancel={() => { start.current = null; }}>
              <span>ENGLISH · VOCABULARY</span>
              <h3>{FLASH_WORDS[cardIndex].word}</h3>
              <p>{FLASH_WORDS[cardIndex].meaning[lang]}</p>
              <small>{t.cardsHint}</small>
            </div>
          ) : <div className="sht-ref-flashcard sht-ref-complete"><CheckCircle2 size={34} aria-hidden="true" /><p>{t.cardsComplete}</p></div>}
          <div className="sht-ref-card-actions">
            {cardIndex < FLASH_WORDS.length ? <>
              <button type="button" className="sht-ref-know" onClick={() => categorize(false)}><Check size={18} aria-hidden="true" />{t.cardsKnow}</button>
              <button type="button" className="sht-ref-review" onClick={() => categorize(true)}><RotateCcw size={17} aria-hidden="true" />{t.cardsReview}</button>
            </> : <button type="button" onClick={() => { setCardIndex(0); setReview([]); }}><RotateCcw size={17} aria-hidden="true" />{t.cardsReset}</button>}
          </div>
          <span className="sht-ref-sample">{t.sample}</span>
        </DeviceFrame>
      </div>
    </section>
  );

  if (part === "mistakes") return (
    <section id="mistakes-preview" className="sht-ref-section sht-ref-paper sht-ref-mistakes">
      <ChapterIntro tag={t.mistakesTag} title={t.mistakesTitle} description={t.mistakesDesc} />
      <div className="sht-ref-visual">
        <DeviceFrame title={t.mistakesHeading}>
          <div className="sht-ref-mistakes-banner"><ListChecks size={20} aria-hidden="true" /><div><strong>{t.mistakesHeading}</strong><span>02 · {t.sample}</span></div></div>
          {[{ q: t.mistakesItem1, a: t.mistakesAnswer1, badge: "01", subject: BOOK_SUBJECTS[lang][2] },
            { q: t.mistakesItem2, a: t.mistakesAnswer2, badge: "02", subject: BOOK_SUBJECTS[lang][0] }].map(item =>
            <details className="sht-ref-mistake" key={item.badge}>
              <summary><span>{item.badge}</span><div><small>{item.subject}</small><strong>{item.q}</strong></div><ChevronDown size={17} aria-hidden="true" /></summary>
              <p>{item.a}</p>
            </details>)}
          <span className="sht-ref-sample">{t.sample}</span>
        </DeviceFrame>
      </div>
    </section>
  );

  if (part === "exam") return (
    <section id="exam-preview" className="sht-ref-section sht-ref-exam">
      <ChapterIntro tag={t.examTag} title={t.examTitle} description={t.examDesc} />
      <div className="sht-ref-visual">
        <DeviceFrame title={t.examTitleIn}>
          <div className="sht-ref-exam-hero"><Play size={25} fill="currentColor" aria-hidden="true" /><h3>{t.examTitleIn}</h3><p>{t.sample}</p></div>
          <div className="sht-ref-exam-kpis"><div><Clock3 size={17} aria-hidden="true" />{t.examPractice}</div><div><Target size={17} aria-hidden="true" />{t.examReview}</div></div>
          <label className="sht-ref-label" htmlFor="sht-ref-exam-subject">{t.examSelect}</label>
          <select id="sht-ref-exam-subject" value={examSubject} onChange={event => setExamSubject(Number(event.target.value))}>
            {BOOK_SUBJECTS[lang].map((item, i) => <option value={i} key={i}>{item}</option>)}
          </select>
          <p className="sht-ref-exam-note">{t.examRules}</p>
          <Link to="/auth" className="sht-ref-exam-cta">{t.examStart}<ArrowRight size={17} aria-hidden="true" /></Link>
        </DeviceFrame>
      </div>
    </section>
  );

  if (part === "community") return (
    <section id="progress-preview" className="sht-ref-section sht-ref-community">
      <ChapterIntro tag={t.communityTag} title={t.communityTitle} description={t.communityDesc} />
      <div className="sht-ref-visual">
        <div className="sht-ref-path" aria-label={t.communityTitleIn}>
          <div className="sht-ref-path-head"><span><Trophy size={19} aria-hidden="true" />{t.communityTitleIn}</span>
            <div role="group" aria-label={t.communityTag}>
              <button type="button" aria-pressed={period === "weekly"} onClick={() => setPeriod("weekly")}>{t.communityWeekly}</button>
              <button type="button" aria-pressed={period === "monthly"} onClick={() => setPeriod("monthly")}>{t.communityMonthly}</button>
            </div></div>
          <div className="sht-ref-path-road">
            {[t.communityStep1, t.communityStep2, t.communityStep3].map((step,i)=>
              <div className={"sht-ref-milestone sht-ref-milestone-" + i} key={i}>
                <span>{i === 0 ? <Check size={18} aria-hidden="true" /> : i + 1}</span><strong>{step}</strong></div>)}
          </div>
          <div className="sht-ref-path-summary"><Flame size={20} aria-hidden="true" />
            <strong>{period === "weekly" ? "3" : "12"}</strong>
            <span>{lang === "hy" ? "օրինակային ուսումնական օր" : lang === "ru" ? "пример учебных дней" : "sample study days"}</span></div>
          <p className="sht-ref-sample">{t.communitySample}</p>
          <Link to="/auth" className="sht-ref-path-cta">{t.communityCta}<ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );

  return (
    <section id="access-preview" className="sht-ref-access" aria-labelledby="sht-ref-access-title">
      <span className="sht-ref-tag"><GraduationCap size={15} aria-hidden="true" />{t.accessTag}</span>
      <h2 id="sht-ref-access-title">{t.accessTitle}</h2><p>{t.accessDesc}</p>
      <div className="sht-ref-access-table">
        <table><thead><tr><th scope="col">{t.accessColumn}</th><th scope="col">{t.accessWeb}</th><th scope="col">{t.accessAndroid}</th></tr></thead>
          <tbody>
            <tr><th scope="row">{t.accessLearning}</th><td>{t.accessFree}</td><td>{t.accessVersion}</td></tr>
            <tr><th scope="row">{t.accessAi}</th><td>{t.accessAiValue}</td><td>{t.accessAiValue}</td></tr>
            <tr><th scope="row">{lang === "hy" ? "Ներբեռնում" : lang === "ru" ? "Загрузка" : "Installation"}</th><td><CheckCircle2 size={19} aria-label="Yes" /></td><td><Download size={19} aria-label="APK" /></td></tr>
          </tbody></table>
      </div>
      <div className="sht-ref-access-actions"><Link to="/auth">{t.accessGet}<ArrowRight size={17} aria-hidden="true" /></Link><a href={SITE_ANDROID_APK_URL} download="Shtemarm-Android.apk">{t.accessDownload}<Download size={17} aria-hidden="true" /></a></div>
      <small>{t.accessNotice}</small>
    </section>
  );
}
