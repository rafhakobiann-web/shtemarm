import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { loadBook } from "@/lib/books";
import { drawEnglishDemoQuestions, englishDemoQuestions, type EnglishDemoQuestion } from "@/lib/english-landing-demo";
import { ArrowRight, ArrowUpRight, BookOpen, BookMarked, Check, CheckCircle2, ChevronLeft, ChevronRight, Download, GraduationCap, Lightbulb, RotateCcw, Sparkles, Target, WandSparkles, X } from "lucide-react";

type Lang = "hy" | "en" | "ru";
type Subject = "math" | "english" | "armenian";
type Localized = Record<Lang, string>;
type Question = { prompt: Localized; options: string[]; correct: number; why: Localized };

const L = {
  hy: {
    playground: "Փորձիր հենց այստեղ", demo: "Ինտերակտիվ ուսումնական փորձարկում", anonymous: "Առանց գրանցվելու",
    choose: "Ընտրիր առարկան", math: "Մաթեմատիկա", english: "Անգլերեն", armenian: "Հայոց լեզու",
    question: "Հարց", of: "ից", correct: "Ճիշտ է", rethink: "Փորձիր հասկանալ",
    check: "Ստուգել պատասխանը", refresh: "Նոր պատահական հարցեր", loadingBook: "Բեռնվում են շտեմարանների հարցերը…", emptyBook: "Հարցերը հիմա հասանելի չեն․ փորձիր կրկին։", multipleHint: "Ընտրիր բոլոր ճիշտ պնդումները, ապա ստուգիր։", sourceBook: "Շտեմարան", sourceSection: "Բաժին",
    next: "Հաջորդ հարցը", retry: "Նորից փորձել", explanation: "Բացատրություն",
    finished: "Ավարտեցիր փոքրիկ փորձարկումը", finishedText: "Ավելի շատ հարցեր, կրկնություն և առաջընթաց՝ քո ուսումնական տարածքում։",
    begin: "Սկսել սովորել", note: "Սրանք ցուցադրական հարցեր են․ պատասխանները չեն պահպանվում։",
    sectionTag: "Shtemarm-ի ներսում", sectionTitle: "Սովորելն սկսվում է գործողությունից", sectionText: "Սեղմիր, ընտրիր, շրջիր․ ամեն մի հնարավորությունը ստեղծված է սովորելու համար։",
    flashTitle: "Բառաքարտեր, որոնք արձագանքում են քեզ", flip: "Սեղմիր՝ շրջելու համար", know: "Գիտեմ", repeat: "Կրկնել",
    repeats: "Կրկնելու նշումներ", swipe: "Սահեցրու աջ՝ կրկնելու, ձախ՝ անցնելու համար",
    tutorTitle: "Ոչ միայն պատասխան․ հասկանալի բացատրություն", tutorText: "Ընտրիր հարց՝ բացատրության օրինակ տեսնելու համար։ Սա ուղիղ AI զրույց չէ։",
    prompt1: "Ինչո՞ւ է x = 4", prompt2: "Ի՞նչ է Present Simple-ը",
    reply1: "2x + 6 = 14 հավասարման երկու կողմերից հանում ենք 6՝ ստանալով 2x = 8։ Այնուհետև բաժանում ենք 2-ի՝ x = 4։",
    reply2: "Present Simple-ը նկարագրում է սովորություններ և կրկնվող գործողություններ։ Օրինակ՝ She reads every day։",
    teacher: "Բացել AI ուսուցչին", readingTitle: "Ընթերցիր, ճանաչիր, սովորիր", readingText: "Սեղմիր ընդգծված բառերին կամ փոխիր տեքստի չափը։",
    word1: "հետաքրքրասեր՝ նոր բաներ իմանալ ցանկացող", word2: "բացահայտել՝ նոր բան գտնել կամ հասկանալ",
    textSize: "Փոխել տեքստի չափը", meaning: "Բառի իմաստը", tapWord: "Սեղմիր ընդգծված բառին",
    stepsTitle: "Քո ճանապարհը դեպի վստահ պատասխան", stepsText: "Ընտրիր քայլը և տես՝ ինչպես է Shtemarm-ը կառուցում ուսուցումը։",
    step1: "Լուծիր", step2: "Հասկացիր", step3: "Կրկնիր",
    step1d: "Փորձիր նոր առաջադրանքներ և անմիջապես ստուգիր պատասխաններդ։",
    step2d: "Հասկացիր պատասխանի պատճառը՝ քայլ առ քայլ բացատրությամբ։",
    step3d: "Վերադարձիր դժվարացած հարցերին՝ գիտելիքը ամրապնդելու համար։",
    appTag: "Սովորիր քո ձևով", appTitle: "Քո Shtemarm-ը՝ նաև Android-ում",
    appText: "Շարունակիր կայքում կամ ներբեռնիր Android հավելվածը մեր սեփական ներբեռնման էջից։",
    download: "Ներբեռնել հավելվածը", online: "Սկսել կայքում",
  },
  en: {
    playground: "Try it for yourself", demo: "Interactive learning playground", anonymous: "No sign-in needed",
    choose: "Choose a subject", math: "Mathematics", english: "English", armenian: "Armenian",
    question: "Question", of: "of", correct: "Exactly right", rethink: "Let's work through it",
    check: "Check answers", refresh: "New random questions", loadingBook: "Loading questions from the books…", emptyBook: "The book questions are unavailable right now. Try again.", multipleHint: "Select every correct statement, then check.", sourceBook: "Book", sourceSection: "Section",
    next: "Next question", retry: "Try again", explanation: "Explanation",
    finished: "Mini challenge complete", finishedText: "Find more questions, review tools and progress tracking in your own study space.",
    begin: "Start learning", note: "These are sample questions. Answers aren't saved.",
    sectionTag: "Inside Shtemarm", sectionTitle: "Learning starts when you interact", sectionText: "Tap, choose and flip. Each feature is designed to help you learn.",
    flashTitle: "Flashcards that respond to you", flip: "Tap to flip", know: "I know it", repeat: "Review again",
    repeats: "Marked for review", swipe: "Swipe right to review, left to continue",
    tutorTitle: "Not just an answer. A clear explanation.", tutorText: "Choose a question to see an example explanation. This isn't a live AI chat.",
    prompt1: "Why is x = 4?", prompt2: "What is Present Simple?",
    reply1: "For 2x + 6 = 14, subtract 6 from both sides: 2x = 8. Divide by 2: x = 4.",
    reply2: "Present Simple describes habits and repeated actions. For example: She reads every day.",
    teacher: "Explore AI teacher", readingTitle: "Read, explore, understand", readingText: "Tap underlined words or adjust the reading size.",
    word1: "wanting to know or learn more", word2: "to find or learn something new",
    textSize: "Change text size", meaning: "Meaning", tapWord: "Tap an underlined word",
    stepsTitle: "Your way to a confident answer", stepsText: "Choose a step to see how Shtemarm supports learning.",
    step1: "Practice", step2: "Understand", step3: "Review",
    step1d: "Try new questions and check your answers immediately.",
    step2d: "Explore the reason behind each answer step by step.",
    step3d: "Return to tricky questions until they make sense.",
    appTag: "Learn your way", appTitle: "Your Shtemarm, also on Android",
    appText: "Continue on the web or get the Android app from our own download page.",
    download: "Download Android app", online: "Start on the web",
  },
  ru: {
    playground: "Попробуй сам", demo: "Интерактивная учебная зона", anonymous: "Без регистрации",
    choose: "Выбери предмет", math: "Математика", english: "Английский", armenian: "Армянский",
    question: "Вопрос", of: "из", correct: "Правильно", rethink: "Разберём вместе",
    check: "Проверить ответы", refresh: "Новые случайные вопросы", loadingBook: "Загружаются вопросы из сборников…", emptyBook: "Вопросы сейчас недоступны. Попробуй ещё раз.", multipleHint: "Выбери все правильные утверждения и проверь.", sourceBook: "Сборник", sourceSection: "Раздел",
    next: "Следующий вопрос", retry: "Ещё раз", explanation: "Объяснение",
    finished: "Мини-задание завершено", finishedText: "Больше вопросов, повторение и прогресс доступны в личном кабинете.",
    begin: "Начать учиться", note: "Это примеры вопросов. Ответы не сохраняются.",
    sectionTag: "Внутри Shtemarm", sectionTitle: "Обучение начинается с действия", sectionText: "Нажимай, выбирай, переворачивай — все функции помогают учиться.",
    flashTitle: "Карточки, которые отвечают на жесты", flip: "Нажми, чтобы перевернуть", know: "Знаю", repeat: "Повторить",
    repeats: "На повторение", swipe: "Вправо — повторить, влево — дальше",
    tutorTitle: "Не только ответ, но и объяснение", tutorText: "Выбери вопрос, чтобы увидеть пример объяснения. Это не живой чат с ИИ.",
    prompt1: "Почему x = 4?", prompt2: "Что такое Present Simple?",
    reply1: "Из 2x + 6 = 14 вычитаем 6 из обеих частей: 2x = 8. Делим на 2: x = 4.",
    reply2: "Present Simple описывает привычки и регулярные действия. Например: She reads every day.",
    teacher: "Открыть ИИ-учителя", readingTitle: "Читай, исследуй, понимай", readingText: "Нажимай на подчёркнутые слова и меняй размер текста.",
    word1: "любознательный, желающий узнавать больше", word2: "найти или узнать что-то новое",
    textSize: "Изменить размер текста", meaning: "Значение", tapWord: "Нажми на подчёркнутое слово",
    stepsTitle: "Путь к уверенному ответу", stepsText: "Выбери этап и узнай, как Shtemarm помогает учиться.",
    step1: "Решай", step2: "Понимай", step3: "Повторяй",
    step1d: "Решай новые задания и сразу проверяй ответы.",
    step2d: "Разбирай причины правильного ответа шаг за шагом.",
    step3d: "Возвращайся к сложным вопросам и закрепляй знания.",
    appTag: "Учись как удобно", appTitle: "Shtemarm и на Android",
    appText: "Продолжай на сайте или скачай Android-приложение со страницы загрузки.",
    download: "Скачать приложение", online: "Начать на сайте",
  },
} as const;

const QUESTIONS: Record<Subject, Question[]> = {
  math: [
    { prompt: { hy: "Լուծիր՝ 2x + 6 = 14", en: "Solve: 2x + 6 = 14", ru: "Реши: 2x + 6 = 14" }, options: ["x = 2", "x = 3", "x = 4", "x = 5"], correct: 2,
      why: { hy: "14 - 6 = 8, ուրեմն 2x = 8, իսկ x = 4։", en: "14 - 6 = 8, so 2x = 8 and x = 4.", ru: "14 - 6 = 8, значит 2x = 8 и x = 4." } },
    { prompt: { hy: "Հաշվիր՝ 3 × (2 + 4)", en: "Calculate: 3 × (2 + 4)", ru: "Вычисли: 3 × (2 + 4)" }, options: ["12", "18", "14", "24"], correct: 1,
      why: { hy: "Սկզբում՝ 2 + 4 = 6, ապա՝ 3 × 6 = 18։", en: "First 2 + 4 = 6, then 3 × 6 = 18.", ru: "Сначала 2 + 4 = 6, затем 3 × 6 = 18." } },
  ],
  english: [
    { prompt: { hy: "Choose: She ___ every day.", en: "Choose: She ___ every day.", ru: "Choose: She ___ every day." }, options: ["read", "reads", "reading", "has readed"], correct: 1,
      why: { hy: "Present Simple-ում she-ի հետ գործածվում է reads։", en: "Present Simple with she takes the -s ending: reads.", ru: "В Present Simple с she добавляется окончание -s: reads." } },
    { prompt: { hy: "Opposite of ancient?", en: "Opposite of ancient?", ru: "Opposite of ancient?" }, options: ["rare", "modern", "old", "historic"], correct: 1,
      why: { hy: "Ancient-ը հինավուրց է, modern-ը՝ ժամանակակից։", en: "Ancient is very old; modern is contemporary.", ru: "Ancient — древний, modern — современный." } },
  ],
  armenian: [
    { prompt: { hy: "Ո՞ր բառը գոյական է։", en: "Ո՞ր բառը գոյական է։", ru: "Ո՞ր բառը գոյական է։" }, options: ["արագ", "գիրք", "կարդալ", "գեղեցիկ"], correct: 1,
      why: { hy: "«Գիրք»-ը ցույց է տալիս առարկա, հետևաբար գոյական է։", en: "«Գիրք» (book) names a thing and is a noun.", ru: "«Գիրք» (книга) обозначает предмет и является существительным." } },
    { prompt: { hy: "Ո՞ր բայն է անցյալ ժամանակով։", en: "Ո՞ր բայն է անցյալ ժամանակով։", ru: "Ո՞ր բայն է անցյալ ժամանակով։" }, options: ["գրեց", "կգրի", "գրում է", "գրելու է"], correct: 0,
      why: { hy: "«Գրեց»-ը ցույց է տալիս անցյալում կատարված գործողություն։", en: "«Գրեց» expresses an action completed in the past.", ru: "«Գրեց» обозначает действие в прошедшем времени." } },
  ],
};

const SUBJECTS: { id: Subject; glyph: string }[] = [
  { id: "math", glyph: "∑" }, { id: "english", glyph: "Aa" }, { id: "armenian", glyph: "Ա" },
];

export function LandingHeroLab({ lang, entryTo = "/auth" }: { lang: Lang; entryTo?: "/auth" | "/dashboard" }) {
  const t = L[lang];
  const [subject, setSubject] = useState<Subject>("math");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [englishPool, setEnglishPool] = useState<EnglishDemoQuestion[]>([]);
  const [englishRound, setEnglishRound] = useState<EnglishDemoQuestion[]>([]);
  // Landing visitors should not download all three large English banks until
  // they explicitly select the English sample. A small original demo is shown
  // immediately, and the real question bank replaces it once available.
  const [bookStatus, setBookStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const englishLoadedRef = useRef(false);

  useEffect(() => {
    if (subject !== "english" || englishLoadedRef.current) return;
    let live = true;
    setBookStatus("loading");
    Promise.all([1, 2, 3].map(id => loadBook(id)))
      .then(books => {
        if (!live) return;
        const pool = englishDemoQuestions(books);
        setEnglishPool(pool);
        setEnglishRound(drawEnglishDemoQuestions(pool));
        if (pool.length) englishLoadedRef.current = true;
        setBookStatus(pool.length ? "ready" : "error");
        // The displayed demo and source bank have different questions.
        setIndex(0); setAnswer(null); setSelected([]); setChecked(false); setFinished(false);
      })
      .catch(() => { if (live) setBookStatus("error"); });
    return () => { live = false; };
  }, [subject, loadAttempt]);

  const realEnglish = subject === "english" && bookStatus === "ready";
  const questionCount = realEnglish ? englishRound.length : QUESTIONS[subject].length;
  const englishQuestion = realEnglish ? englishRound[index] : undefined;
  const question = realEnglish ? undefined : QUESTIONS[subject][index];
  const hasAnswer = englishQuestion ? checked : answer !== null;
  const correct = englishQuestion
    ? selected.length === englishQuestion.correct.length && selected.every(i => englishQuestion.correct.includes(i))
    : answer === question?.correct;

  const resetAnswer = () => { setAnswer(null); setSelected([]); setChecked(false); };
  const chooseSubject = (id: Subject) => { setSubject(id); setIndex(0); resetAnswer(); setFinished(false); };
  const restart = () => {
    setIndex(0); resetAnswer(); setFinished(false);
    if (subject === "english") setEnglishRound(drawEnglishDemoQuestions(englishPool));
  };
  const next = () => {
    if (index + 1 >= questionCount) { setFinished(true); resetAnswer(); }
    else { setIndex(index + 1); resetAnswer(); }
  };
  const toggleEnglish = (i: number) => {
    if (checked) return;
    if (!englishQuestion?.multiple) { setSelected([i]); setChecked(true); return; }
    setSelected(old => old.includes(i) ? old.filter(n => n !== i) : [...old, i]);
  };

  return (
    <div className="sl-lab" aria-label={t.demo}>
      <div className="sl-lab-header">
        <span className="sl-lab-brand"><img src="/shtemarm-logo.svg" alt="" width="27" height="27" /><span><strong>Shtemarm</strong><small>{t.demo}</small></span></span>
        <span className="sl-lab-live"><span aria-hidden="true" />{t.anonymous}</span>
      </div>
      <div className="sl-lab-body">
        <span className="sl-overline">{t.choose}</span>
        <div className="sl-lab-subjects" role="tablist" aria-label={t.choose}>
          {SUBJECTS.map(x => <button type="button" role="tab" aria-selected={subject === x.id} key={x.id} onClick={() => chooseSubject(x.id)}>
            <span aria-hidden="true">{x.glyph}</span><strong>{t[x.id]}</strong>
          </button>)}
        </div>
        <div className="sl-lab-stage" role="tabpanel">
          {subject === "english" && bookStatus !== "ready" && (
            <p className="mb-3 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground" role="status">
              {bookStatus === "error"
                ? lang === "hy" ? "Ցուցադրվում են օրինակային հարցերը․ շտեմարանն այժմ հասանելի չէ։"
                  : lang === "ru" ? "Показаны примеры: сборник сейчас недоступен." : "Showing sample questions while the source bank is unavailable."
                : lang === "hy" ? "Օրինակային հարցեր․ բնօրինակ շտեմարանը բեռնվում է միայն Անգլերենն ընտրելուց հետո։"
                  : lang === "ru" ? "Примеры вопросов: сборник загружается только после выбора английского." : "Sample questions; source books load only after you select English."}
              {bookStatus === "error" && (
                <button type="button" className="ml-2 font-bold text-primary underline" onClick={() => { setBookStatus("loading"); setLoadAttempt(n => n + 1); }}>{t.retry}</button>
              )}
            </p>
          )}
          {finished ? (
            <div className="sl-lab-finish" aria-live="polite"><CheckCircle2 size={37} /><h3>{t.finished}</h3><p>{t.finishedText}</p>
              <button type="button" onClick={restart}><RotateCcw size={17} />{subject === "english" ? t.refresh : t.retry}</button>
              <Link to={entryTo}>{t.begin}<ArrowRight size={17} /></Link>
            </div>
          ) : (
            <div className="sl-lab-question" key={subject + ":" + index + ":" + (englishQuestion?.id ?? "")}>
              <div className="sl-lab-number">
                <span>{t.question} {index + 1} {t.of} {questionCount}</span>
                <span>{englishQuestion ? `${t.sourceBook} ${englishQuestion.bookId} · ${t.sourceSection} ${englishQuestion.section}` : t.playground}</span>
              </div>
              <div className="sl-lab-track" aria-hidden="true"><span style={{ width: (100 * (index + 1) / questionCount) + "%" }} /></div>
              <h3>{englishQuestion ? englishQuestion.prompt : question?.prompt[lang]}</h3>
              {englishQuestion?.multiple && <p className="sl-lab-multiple-hint"><Lightbulb size={15} aria-hidden="true" />{t.multipleHint}</p>}
              <div className={"sl-lab-options" + (englishQuestion?.multiple ? " sl-lab-set-options" : "")} role="group" aria-label={englishQuestion?.prompt ?? question?.prompt[lang]}>
                {(englishQuestion?.options ?? question?.options ?? []).map((option, i) => {
                  const isSelected = englishQuestion ? selected.includes(i) : answer === i;
                  const isCorrect = hasAnswer && (englishQuestion ? englishQuestion.correct.includes(i) : question?.correct === i);
                  return <button type="button" key={i} disabled={hasAnswer}
                    onClick={() => englishQuestion ? toggleEnglish(i) : setAnswer(i)}
                    aria-pressed={isSelected}
                    className={(isSelected ? "is-selected " : "") + (isCorrect ? "is-correct " : "") + (hasAnswer && isSelected && !isCorrect ? "is-wrong" : "")}>
                    <span>{englishQuestion?.multiple ? i + 1 : String.fromCharCode(65 + i)}</span>
                    <strong>{option}</strong>
                    {isCorrect ? <Check size={18} /> : isSelected && hasAnswer ? <X size={18} /> : null}
                  </button>;
                })}
              </div>
              <div className="sl-lab-feedback" aria-live="polite" aria-atomic="true">
                {!hasAnswer ? <p><Lightbulb size={16} />{t.note}</p>
                  : <div key={String(correct)} className={correct ? "is-correct" : "is-retry"}>
                    <strong>{correct ? <CheckCircle2 size={17} /> : <Lightbulb size={17} />}{correct ? t.correct : t.rethink}</strong>
                    <p>{t.explanation}: {englishQuestion
                      ? englishQuestion.explanation || (englishQuestion.multiple
                        ? `${t.sourceSection} ${englishQuestion.section}: ${englishQuestion.correct.map(i => i + 1).join(", ")}`
                        : englishQuestion.options[englishQuestion.correct[0]])
                      : question?.why[lang]}</p>
                  </div>}
              </div>
              <div className="sl-lab-bottom"><span>{String(index + 1).padStart(2, "0")}<i> / </i>{String(questionCount).padStart(2, "0")}</span>
                {englishQuestion?.multiple && !checked
                  ? <button type="button" disabled={!selected.length} onClick={() => setChecked(true)}>{t.check}<Check size={17} /></button>
                  : hasAnswer ? <button type="button" onClick={next}>{t.next}<ArrowRight size={17} /></button>
                  : <span className="sl-lab-try">{t.playground}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DECK: { front: string; back: Localized }[] = [
  { front: "curious", back: { hy: "հետաքրքրասեր", en: "wanting to know more", ru: "любознательный" } },
  { front: "improve", back: { hy: "բարելավել", en: "to make better", ru: "улучшать" } },
  { front: "achieve", back: { hy: "հասնել նպատակին", en: "to reach a goal", ru: "достичь цели" } },
  { front: "discover", back: { hy: "բացահայտել", en: "to find out something new", ru: "открывать новое" } },
];

function Flashcard({ lang }: { lang: Lang }) {
  const t = L[lang];
  const [index, setIndex] = useState(0), [flipped, setFlipped] = useState(false), [reviews, setReviews] = useState(0);
  const start = useRef<{ id: number; x: number; y: number } | null>(null);
  const blockClick = useRef(false), card = useRef<HTMLButtonElement>(null);
  const advance = (review: boolean) => { if (review) setReviews(n => n + 1); setIndex(n => (n + 1) % DECK.length); setFlipped(false); };
  const clear = () => {
    const el = card.current; if (!el) return;
    el.removeAttribute("data-dragging"); el.style.setProperty("--dx", "0px"); el.style.setProperty("--tilt", "0deg");
  };
  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch" || e.pointerType === "pen") start.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const origin = start.current; if (!origin || origin.id !== e.pointerId) return;
    const dx = e.clientX - origin.x, dy = e.clientY - origin.y;
    if (Math.abs(dx) < 7 || Math.abs(dx) <= Math.abs(dy) * 1.25) return;
    const dist = Math.max(-66, Math.min(66, dx)), el = card.current;
    if (el) { el.dataset.dragging = "true"; el.style.setProperty("--dx", dist + "px"); el.style.setProperty("--tilt", (dist / 28) + "deg"); }
  };
  const up = (e: PointerEvent<HTMLButtonElement>) => {
    const origin = start.current; start.current = null; clear(); if (!origin || origin.id !== e.pointerId) return;
    const dx = e.clientX - origin.x, dy = e.clientY - origin.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      blockClick.current = true;
      window.setTimeout(() => { blockClick.current = false; }, 120);
      advance(dx > 0);
    }
  };
  return (
    <article className="sl-tile sl-tile-flash" aria-labelledby="sl-flash-title">
      <div className="sl-tile-top"><span className="sl-tile-icon"><BookMarked size={21} /></span><span>01 / 03</span></div>
      <h3 id="sl-flash-title">{t.flashTitle}</h3><p>{t.swipe} · {t.flip}</p>
      <button type="button" className="sl-flashcard" ref={card} aria-label={t.flip + ": " + (flipped ? DECK[index].back[lang] : DECK[index].front)}
        onClick={() => { if (blockClick.current) { blockClick.current = false; return; } setFlipped(v => !v); }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up}
        onPointerCancel={() => { start.current = null; clear(); }}
        onKeyDown={e => { if (e.key === "ArrowLeft") { e.preventDefault(); advance(false); } else if (e.key === "ArrowRight") { e.preventDefault(); advance(true); } }}>
        <small>{flipped ? t.explanation : t.playground}</small><strong key={index + "-" + flipped}>{flipped ? DECK[index].back[lang] : DECK[index].front}</strong>
        <span><RotateCcw size={15} />{index + 1} / {DECK.length}</span>
      </button>
      <div className="sl-flash-actions"><button type="button" onClick={() => advance(true)}><RotateCcw size={17} />{t.repeat}</button><button type="button" onClick={() => advance(false)}><Check size={17} />{t.know}</button></div>
      <small className="sl-flash-count" aria-live="polite">{t.repeats}: {reviews} · {t.note}</small>
    </article>
  );
}

function Tutor({ lang, entryTo }: { lang: Lang; entryTo: "/auth" | "/dashboard" }) {
  const t = L[lang], [active, setActive] = useState(0);
  return <article className="sl-tile sl-tile-tutor" aria-labelledby="sl-tutor-title">
    <div className="sl-tile-top"><span className="sl-tile-icon"><WandSparkles size={21} /></span><span>02 / 03</span></div>
    <h3 id="sl-tutor-title">{t.tutorTitle}</h3><p>{t.tutorText}</p>
    <div className="sl-tutor-chat"><span><Sparkles size={15} /> Shtemarm AI · {t.demo}</span>
      <div className="sl-chat-user" key={"question-" + active}>{active === 0 ? t.prompt1 : t.prompt2}</div>
      <div className="sl-chat-answer" key={"answer-" + active}><Lightbulb size={18} /><p>{active === 0 ? t.reply1 : t.reply2}</p></div>
    </div>
    <div className="sl-tutor-prompts">{[t.prompt1, t.prompt2].map((prompt, i) => <button type="button" key={prompt} aria-pressed={active === i} onClick={() => setActive(i)}>{prompt}</button>)}</div>
    <Link to={entryTo} className="sl-text-link">{t.teacher}<ArrowUpRight size={17} /></Link>
  </article>;
}

function Reader({ lang }: { lang: Lang }) {
  const t = L[lang], [selected, setSelected] = useState<"curious" | "discover" | null>(null), [large, setLarge] = useState(false);
  return <article className="sl-tile sl-tile-reader" aria-labelledby="sl-reader-title">
    <div className="sl-tile-top"><span className="sl-tile-icon"><BookOpen size={21} /></span><span>03 / 03</span></div>
    <h3 id="sl-reader-title">{t.readingTitle}</h3><p>{t.readingText}</p>
    <div className="sl-reader-paper">
      <div className="sl-reader-top"><span>Reading · 01</span><button type="button" aria-label={t.textSize} aria-pressed={large} onClick={() => setLarge(v => !v)}>{large ? "A−" : "A+"}</button></div>
      <p className={large ? "is-large" : ""}>Learning begins with a <button type="button" aria-pressed={selected === "curious"} onClick={() => setSelected(v => v === "curious" ? null : "curious")}>curious</button> mind. Every question helps us <button type="button" aria-pressed={selected === "discover"} onClick={() => setSelected(v => v === "discover" ? null : "discover")}>discover</button> something new. Small steps can lead to big ideas.</p>
      <div className="sl-reader-meaning" aria-live="polite"><Lightbulb size={16} />{selected ? <><strong>{selected}</strong><span>{selected === "curious" ? t.word1 : t.word2}</span></> : <span>{t.tapWord}</span>}</div>
    </div>
  </article>;
}

export function LandingExperiences({ lang, entryTo = "/auth" }: { lang: Lang; entryTo?: "/auth" | "/dashboard" }) {
  const t = L[lang];
  const [step, setStep] = useState(0);
  const steps = [
    { title: t.step1, body: t.step1d, Icon: Target },
    { title: t.step2, body: t.step2d, Icon: Lightbulb },
    { title: t.step3, body: t.step3d, Icon: RotateCcw },
  ];
  const ActiveIcon = steps[step].Icon;
  return <>
    <section id="practice-demo" className="sl-experience" aria-labelledby="sl-exp-title">
      <div className="sl-section-heading"><span className="sl-kicker"><Sparkles size={16} />{t.sectionTag}</span><h2 id="sl-exp-title">{t.sectionTitle}</h2><p>{t.sectionText}</p></div>
      <div className="sl-tiles"><Flashcard lang={lang} /><Tutor lang={lang} entryTo={entryTo} /><Reader lang={lang} /></div>
    </section>
    <section className="sl-journey" aria-labelledby="sl-journey-title">
      <div className="sl-journey-copy"><span className="sl-kicker"><GraduationCap size={17} /> Shtemarm</span><h2 id="sl-journey-title">{t.stepsTitle}</h2><p>{t.stepsText}</p>
        <div className="sl-journey-tabs" role="tablist" aria-label={t.stepsTitle}>{steps.map((item, i) =>
          <button type="button" role="tab" aria-selected={step === i} onClick={() => setStep(i)} key={item.title}><span>0{i + 1}</span>{item.title}<ArrowRight size={16} /></button>)}</div>
      </div>
      <div className="sl-journey-visual" role="tabpanel" aria-live="polite"><div className="sl-journey-rings" aria-hidden="true"><i /><i /><i /></div>
        <div className="sl-journey-detail" key={step}><span className="sl-journey-icon"><ActiveIcon size={25} /></span><small>0{step + 1} / 03</small><h3>{steps[step].title}</h3><p>{steps[step].body}</p></div>
        <div className="sl-journey-controls"><button type="button" aria-label="Previous" onClick={() => setStep(v => (v + 2) % 3)}><ChevronLeft size={19} /></button><span>{step + 1} / 3</span><button type="button" aria-label="Next" onClick={() => setStep(v => (v + 1) % 3)}><ChevronRight size={19} /></button></div>
      </div>
    </section>
    <section className="sl-app-panel" aria-labelledby="sl-app-title"><span className="sl-app-icon"><Download size={27} /></span>
      <div><span className="sl-kicker">{t.appTag}</span><h2 id="sl-app-title">{t.appTitle}</h2><p>{t.appText}</p></div>
      <div className="sl-app-actions"><Link to="/download"><Download size={18} />{t.download}<ArrowRight size={18} /></Link><Link to={entryTo}>{t.online}<ArrowUpRight size={17} /></Link></div>
    </section>
  </>;
}
