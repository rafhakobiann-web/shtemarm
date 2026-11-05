import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, Download, ExternalLink,
  GraduationCap, Lightbulb, LockKeyhole, Monitor, RotateCcw, Smartphone, Sparkles, Layers3, MoveHorizontal, BookmarkCheck,
} from "lucide-react";
import { SITE_ANDROID_APK_URL, SITE_ANDROID_BETA_VERSION } from "@/lib/app-download";

type Lang = "hy" | "en" | "ru";

const WORDS = {
  hy: {
    kicker: "Փորձիր նախքան գրանցվելը",
    headline: "Առաջադրանքը միայն սկիզբն է։ Կարևորը՝ հասկանալը։",
    description: "Փորձիր Shtemarm-ի ուսուցման ոճը հենց այստեղ․ ընտրիր պատասխանը, ստացիր բացատրություն և որոշիր՝ ինչպես շարունակել։",
    demo: "Ցուցադրական հարց • Մաթեմատիկա", question: "Եթե 3x + 5 = 14, ապա որքա՞ն է x-ը։",
    check: "Ընտրիր ճիշտ պատասխանը", correct: "Ճի՛շտ է։ 14 − 5 = 9, իսկ 9 ÷ 3 = 3։",
    incorrect: "Փորձիր նորից․ նախ երկու կողմերից հանիր 5, ապա բաժանիր 3-ի։",
    reset: "Սկսել նորից", sample: "Ցուցադրական օրինակ, ոչ պաշտոնական շտեմարանի հարց",
    one: "Լուծիր", two: "Ստուգիր", three: "Հասկացիր",
    journeyKicker: "Անհատական առաջընթաց",
    journeyTitle: "Ամեն օր՝ մեկ քայլ ավելի վստահ։",
    journeyDesc: "Սեփական ուսումնական պլան, սխալների կրկնություն և պարզ առաջընթաց։ Ոչ թե պարզապես թեստեր, այլ սովորելու հստակ ուղի։",
    pathTitle: "Այսօրվա ուղին", path1: "Կրկնիր դժվար հարցերը", path2: "Լուծիր նոր առաջադրանքներ", path3: "Ամրապնդիր գիտելիքները",
    sampleProgress: "Օրինակային առաջընթաց", progressNumber: "2 / 3 քայլ",
    aiKicker: "AI ուսուցիչ",
    aiTitle: "Չհասկացա՞ր։ Հարցրու, սովորիր, կրկնիր։",
    aiDesc: "Ընտրիր հուշում, ամբողջական բացատրություն կամ ինքնաստուգում։ AI-ը օգնում է հասկանալ լուծման ընթացքը, ոչ միայն տեսնել պատասխանը։",
    aiStudent: "Կարո՞ղ ես բացատրել 3x + 5 = 14 լուծումը։",
    aiReply: "Իհարկե։ Նախ երկու կողմերից հանիր 5՝ 3x = 9։ Հիմա երկու կողմերը բաժանիր 3-ի՝ x = 3։",
    aiBadge: "Ցուցադրական զրույց • AI հարցում չի կատարվում",
    aiCta: "Բացել AI ուսուցչին",
    installKicker: "Վեբ + Android",
    installTitle: "Սովորիր այնտեղ, որտեղ քեզ հարմար է։",
    installDesc: "Բացիր Shtemarm-ը դիտարկչում կամ ներբեռնիր Android-ի փորձնական APK-ն անմիջապես կայքից։ Google Play-ում հավելված դեռ չունենք։",
    browser: "Օգտվել կայքից", browserDesc: "Աշխատում է հեռախոսով, պլանշետով և համակարգչով՝ առանց APK ներբեռնելու։",
    browserCta: "Սկսել կայքում",
    android: "Android հավելված", androidDesc: "Կայքի սեփական սերվերից ներբեռնվող փորձնական APK։",
    apkCta: "Ներբեռնել Android APK-ն կայքից",
    releaseCta: "Տեղադրման և թարմացման հրահանգներ",
    betaNote: "Փորձնական debug build. Հնարավոր են անավարտ գործառույթներ և թարմացման ստորագրության անհամապատասխանություն։ Նախ պահպանիր առաջընթացդ։",
    instructions: "Տեղադրման հրահանգներ",
  },
  en: {
    kicker: "Try before you sign up",
    headline: "The question is just the start. Understanding comes next.",
    description: "Experience Shtemarm's learning style right here: choose an answer, see feedback and decide how to continue.",
    demo: "Illustrative question • Mathematics", question: "If 3x + 5 = 14, what is x?",
    check: "Choose the correct answer", correct: "Correct! 14 − 5 = 9, then 9 ÷ 3 = 3.",
    incorrect: "Try again: first subtract 5 from both sides, then divide by 3.",
    reset: "Try again", sample: "Illustrative example, not an official question-bank item",
    one: "Practice", two: "Check", three: "Understand",
    journeyKicker: "Personal progress",
    journeyTitle: "One small step more confident every day.",
    journeyDesc: "A personal study plan, mistake review, and simple progress tracking. Not just tests—a clearer path to learning.",
    pathTitle: "Today's journey", path1: "Review difficult questions", path2: "Practice new questions", path3: "Strengthen what you know",
    sampleProgress: "Illustrative progress", progressNumber: "2 / 3 steps",
    aiKicker: "AI tutor",
    aiTitle: "Stuck? Ask, learn, and try again.",
    aiDesc: "Choose a hint, full explanation or practice. AI helps you understand the reasoning, not just see the answer.",
    aiStudent: "Could you explain how to solve 3x + 5 = 14?",
    aiReply: "Of course. Subtract 5 from both sides: 3x = 9. Then divide both sides by 3: x = 3.",
    aiBadge: "Illustrative conversation • no AI request",
    aiCta: "Open AI tutor",
    installKicker: "Web + Android",
    installTitle: "Learn wherever works for you.",
    installDesc: "Open Shtemarm in your browser or download the Android beta APK from this website. We don't have a Google Play app.",
    browser: "Use the website", browserDesc: "Works on phones, tablets and computers without installing an APK.",
    browserCta: "Start on the website",
    android: "Android application", androidDesc: "Beta APK served directly from the Shtemarm website.",
    apkCta: "Download Android APK",
    releaseCta: "Installation & update guide",
    betaNote: "Debug beta build. Some features are unfinished and signing keys may prevent in-place updates. Back up your progress first.",
    instructions: "Installation instructions",
  },
  ru: {
    kicker: "Попробуй до регистрации",
    headline: "Вопрос — только начало. Главное — понять.",
    description: "Познакомься с обучением в Shtemarm: выбери ответ, получи пояснение и реши, как продолжить.",
    demo: "Пример задания • Математика", question: "Если 3x + 5 = 14, чему равен x?",
    check: "Выбери правильный ответ", correct: "Верно! 14 − 5 = 9, затем 9 ÷ 3 = 3.",
    incorrect: "Попробуй снова: вычти 5 из обеих частей, затем раздели на 3.",
    reset: "Попробовать снова", sample: "Демонстрация, не задание из официального сборника",
    one: "Решай", two: "Проверяй", three: "Разбирай",
    journeyKicker: "Личный прогресс",
    journeyTitle: "Каждый день — ещё один уверенный шаг.",
    journeyDesc: "Личный план занятий, работа над ошибками и понятный прогресс. Не просто тесты — путь к знаниям.",
    pathTitle: "План на сегодня", path1: "Повтори сложные вопросы", path2: "Реши новые задания", path3: "Закрепи знания",
    sampleProgress: "Пример прогресса", progressNumber: "2 / 3 шага",
    aiKicker: "ИИ-репетитор",
    aiTitle: "Не понял? Спроси, разберись и попробуй снова.",
    aiDesc: "Подсказки, подробные объяснения и практика. ИИ помогает понять решение, а не только увидеть ответ.",
    aiStudent: "Объясни, как решить 3x + 5 = 14.",
    aiReply: "Конечно. Вычтем 5 из обеих частей: 3x = 9. Разделим обе части на 3: x = 3.",
    aiBadge: "Демонстрация • без запроса к ИИ",
    aiCta: "Открыть ИИ-репетитора",
    installKicker: "Сайт + Android",
    installTitle: "Учись там, где тебе удобно.",
    installDesc: "Открой Shtemarm в браузере или скачай тестовый APK для Android прямо с сайта. Приложения в Google Play пока нет.",
    browser: "Открыть сайт", browserDesc: "Работает на телефонах, планшетах и компьютерах без APK.",
    browserCta: "Начать на сайте",
    android: "Android-приложение", androidDesc: "Тестовый APK, загружаемый прямо с сайта Shtemarm.",
    apkCta: "Скачать APK для Android",
    releaseCta: "Установка и обновление",
    betaNote: "Тестовая debug-сборка. Некоторые функции не закончены, а другая подпись может помешать обновлению. Сохрани прогресс заранее.",
    instructions: "Инструкция по установке",
  },
} as const;

type SampleQuestion = { subject: string; prompt: string; options: readonly string[]; correct: number; hint: string; explanation: string };

// Original, short examples for visitors. Real textbook question access is tracked
// separately in Draft PR #207 and must not be confused with these examples.
const SAMPLE_QUESTIONS: Record<Lang, readonly SampleQuestion[]> = {
  hy: [
    { subject: "Մաթեմատիկա · փորձնական հարց", prompt: "Եթե 3x + 5 = 14, ապա որքա՞ն է x-ը։", options: ["2", "3", "4"], correct: 1, hint: "Հանիր 5 երկու կողմից, հետո բաժանիր 3-ի։", explanation: "14 − 5 = 9, իսկ 9 ÷ 3 = 3։" },
    { subject: "Անգլերեն · փորձնական հարց", prompt: "Ո՞րն է Present Simple ժամանակաձևով նախադասությունը։", options: ["She is reading now.", "She reads every day.", "She read yesterday."], correct: 1, hint: "Փնտրիր սովորական, կրկնվող գործողությունը։", explanation: "«She reads every day» արտահայտում է կրկնվող գործողություն։" },
    { subject: "Հայոց լեզու · փորձնական հարց", prompt: "«Գեղեցիկ» բառը ո՞ր խոսքի մասն է։", options: ["Ածական", "Գոյական", "Բայ"], correct: 0, hint: "Բառը նկարագրում է առարկայի հատկանիշը։", explanation: "«Գեղեցիկ» բառը ածական է, քանի որ ցույց է տալիս հատկանիշ։" },
    { subject: "Մաթեմատիկա · փորձնական հարց", prompt: "Եթե 2(x + 3) = 18, ապա որքա՞ն է x-ը։", options: ["6", "9", "12"], correct: 0, hint: "Նախ երկու կողմերը բաժանիր 2-ի։", explanation: "x + 3 = 9, հետևաբար x = 6։" },
    { subject: "Անգլերեն · փորձնական հարց", prompt: "Choose the correct form: They ___ to school every day.", options: ["goes", "go", "going"], correct: 1, hint: "With «they» use the base form in Present Simple.", explanation: "They go to school every day. «They» takes the base verb." },
    { subject: "Հայոց լեզու · փորձնական հարց", prompt: "Ո՞ր բառն է գոյական։", options: ["արագ", "գիրք", "գրել"], correct: 1, hint: "Գտիր այն բառը, որը առարկա է անվանում։", explanation: "«Գիրք» բառը գոյական է. անվանում է առարկա։" },
  ],
  en: [
    { subject: "Mathematics · sample", prompt: "If 3x + 5 = 14, what is x?", options: ["2", "3", "4"], correct: 1, hint: "Subtract 5 from both sides, then divide by 3.", explanation: "14 − 5 = 9, then 9 ÷ 3 = 3." },
    { subject: "English · sample", prompt: "Which sentence uses the Present Simple tense?", options: ["She is reading now.", "She reads every day.", "She read yesterday."], correct: 1, hint: "Look for a repeated everyday action.", explanation: "“She reads every day” describes a habit in the Present Simple." },
    { subject: "Armenian language · sample", prompt: "Which part of speech is «գեղեցիկ» (beautiful)?", options: ["Adjective", "Noun", "Verb"], correct: 0, hint: "It describes a quality.", explanation: "It is an adjective because it describes a quality." },
    { subject: "Mathematics · sample", prompt: "If 2(x + 3) = 18, what is x?", options: ["6", "9", "12"], correct: 0, hint: "First divide both sides by 2.", explanation: "x + 3 = 9, so x = 6." },
    { subject: "English · sample", prompt: "Choose the correct form: They ___ to school every day.", options: ["goes", "go", "going"], correct: 1, hint: "With “they” use the base verb in Present Simple.", explanation: "They go to school every day. “They” takes the base verb." },
    { subject: "Armenian language · sample", prompt: "Which of these Armenian words is a noun?", options: ["արագ (fast)", "գիրք (book)", "գրել (to write)"], correct: 1, hint: "Look for a word that names an object.", explanation: "«Գիրք» (book) is a noun." },
  ],
  ru: [
    { subject: "Математика · пример", prompt: "Если 3x + 5 = 14, чему равен x?", options: ["2", "3", "4"], correct: 1, hint: "Вычти 5, затем раздели на 3.", explanation: "14 − 5 = 9, затем 9 ÷ 3 = 3." },
    { subject: "Английский · пример", prompt: "Какое предложение написано в Present Simple?", options: ["She is reading now.", "She reads every day.", "She read yesterday."], correct: 1, hint: "Найди повторяющееся действие.", explanation: "«She reads every day» описывает привычное действие." },
    { subject: "Армянский язык · пример", prompt: "Какая часть речи — «գեղեցիկ» (красивый)?", options: ["Прилагательное", "Существительное", "Глагол"], correct: 0, hint: "Это слово обозначает признак предмета.", explanation: "Это прилагательное, обозначающее признак." },
    { subject: "Математика · пример", prompt: "Если 2(x + 3) = 18, чему равен x?", options: ["6", "9", "12"], correct: 0, hint: "Сначала раздели обе части на 2.", explanation: "x + 3 = 9, поэтому x = 6." },
    { subject: "Английский · пример", prompt: "Выбери правильную форму: They ___ to school every day.", options: ["goes", "go", "going"], correct: 1, hint: "После they в Present Simple используется начальная форма.", explanation: "They go to school every day. После they используется go." },
    { subject: "Армянский язык · пример", prompt: "Какое армянское слово — существительное?", options: ["արագ (быстро)", "գիրք (книга)", "գրել (писать)"], correct: 1, hint: "Найди название предмета.", explanation: "«Գիրք» (книга) — существительное." },
  ],
};

const SAMPLE_SUBJECTS: Record<Lang, readonly string[]> = {
  hy:["Մաթեմատիկա","Անգլերեն","Հայոց լեզու"],
  en:["Mathematics","English","Armenian"],
  ru:["Математика","Английский","Армянский"],
};


/** Front-end-only example responses: never presented as a live AI request. */
const TUTOR_DEMO: Record<Lang, {
  modes: Record<"hint"|"explain"|"practice",string>;
  replies: Record<"hint"|"explain"|"practice",string>;
}> = {
  hy: {
    modes:{hint:"Հուշում",explain:"Բացատրություն",practice:"Ինքնաստուգում"},
    replies:{
      hint:"Նախ մտածիր՝ ի՞նչ պետք է անել +5-ը վերացնելու համար։ Հավասարման երկու կողմերում կատարիր նույն գործողությունը։",
      explain:"3x + 5 = 14 → 3x = 9 → x = 3։ Երկու կողմերից հանում ենք 5, ապա բաժանում 3-ի։",
      practice:"Քո հերթն է․ եթե 2x + 4 = 12, ապա x-ը որքա՞ն է։ Պատասխանդ փորձիր ստուգել՝ 2 · 4 + 4 = 12։",
    },
  },
  en: {
    modes:{hint:"Hint",explain:"Step by step",practice:"Try it"},
    replies:{
      hint:"What would remove the +5? Perform the same operation on both sides of the equation.",
      explain:"3x + 5 = 14 → 3x = 9 → x = 3. Subtract 5 from both sides, then divide by 3.",
      practice:"Your turn: if 2x + 4 = 12, what is x? Check your result: 2 × 4 + 4 = 12.",
    },
  },
  ru: {
    modes:{hint:"Подсказка",explain:"По шагам",practice:"Попробуй"},
    replies:{
      hint:"Как убрать +5? Выполни одно и то же действие с обеими частями уравнения.",
      explain:"3x + 5 = 14 → 3x = 9 → x = 3. Вычти 5 из обеих частей, затем раздели на 3.",
      practice:"Твоя очередь: если 2x + 4 = 12, чему равен x? Проверь: 2 × 4 + 4 = 12.",
    },
  },
};

/** Original, non-copyrighted words for the illustrative flashcard interaction. */
const FLASHCARDS: Record<Lang,readonly {word:string;translation:string;example:string}[]> = {
  hy:[
    {word:"achieve",translation:"հասնել, ձեռք բերել",example:"You can achieve your goals."},
    {word:"consider",translation:"հաշվի առնել",example:"Consider another solution."},
    {word:"improve",translation:"բարելավել",example:"Practice can improve your skills."},
  ],
  en:[
    {word:"achieve",translation:"to successfully reach a goal",example:"You can achieve your goals."},
    {word:"consider",translation:"to think carefully about",example:"Consider another solution."},
    {word:"improve",translation:"to make something better",example:"Practice can improve your skills."},
  ],
  ru:[
    {word:"achieve",translation:"достигать",example:"You can achieve your goals."},
    {word:"consider",translation:"обдумывать, учитывать",example:"Consider another solution."},
    {word:"improve",translation:"улучшать",example:"Practice can improve your skills."},
  ],
};

const FLASHCARD_LABELS: Record<Lang,{
  kicker:string; title:string; description:string; know:string; review:string; saved:string;
  showReview:string; showAll:string; tap:string; session:string;
}> = {
  hy:{
    kicker:"Բառապաշար · ինտերակտիվ",title:"Սահեցրու, հիշիր, կրկնիր։",
    description:"Սահեցրու ձախ՝ եթե գիտես բառը, աջ՝ եթե ուզում ես նորից սովորել։ Կարող ես նաև օգտվել կոճակներից։",
    know:"Գիտեմ",review:"Կրկնել",saved:"Կրկնելու բառեր",
    showReview:"Դիտել կրկնվողները",showAll:"Բոլոր բառերը",tap:"Սահեցրու քարտը",session:"Միայն այս ցուցադրության ընթացքում",
  },
  en:{
    kicker:"Vocabulary · interactive",title:"Swipe, remember, repeat.",
    description:"Swipe left if you know the word or right to review later. Buttons work too.",
    know:"I know it",review:"Review again",saved:"Words to review",
    showReview:"Review saved words",showAll:"All words",tap:"Swipe the card",session:"Only during this demo session",
  },
  ru:{
    kicker:"Слова · интерактивно",title:"Листай, запоминай, повторяй.",
    description:"Свайп влево — знаю слово, вправо — повторю. Или используй кнопки.",
    know:"Знаю",review:"Повторить",saved:"Слова для повтора",
    showReview:"Повторить слова",showAll:"Все слова",tap:"Листай карточку",session:"Только в этой демонстрации",
  },
};

export function LandingShowcase({ lang }: { lang: Lang }) {
  const t = WORDS[lang];
  const [questionIndex,setQuestionIndex] = useState(0);
  const [answers,setAnswers] = useState<Record<number,number>>({});
  const [tutorMode,setTutorMode] = useState<"hint" | "explain" | "practice">("hint");
  const [cardIndex,setCardIndex] = useState(0);
  const [reviewWords,setReviewWords] = useState<number[]>([]);
  const [showReview,setShowReview] = useState(false);
  const cardSwipe = useRef<{id:number;x:number;y:number}|null>(null);
  const question = SAMPLE_QUESTIONS[lang][questionIndex];
  const answer = answers[questionIndex] ?? null;
  const correctCount = SAMPLE_QUESTIONS[lang].reduce((count, sample, index) =>
    count + Number(answers[index] === sample.correct), 0);
  const answeredCount = Object.keys(answers).length;
  const sampleProgress = SAMPLE_QUESTIONS[lang].length;
  const cardSet = showReview && reviewWords.length ? reviewWords : [0,1,2];
  const displayCard = cardSet[cardIndex % cardSet.length];
  const flashcard = FLASHCARDS[lang][displayCard];
  const nextFlashcard = (needsReview: boolean) => {
    const next = needsReview ?
      (reviewWords.includes(displayCard) ? reviewWords : [...reviewWords,displayCard]) :
      reviewWords.filter(index => index !== displayCard);
    setReviewWords(next);
    if (showReview && next.length === 0) setShowReview(false);
    setCardIndex(i => i + 1);
  };
  const resetQuiz = () => { setAnswers({}); setQuestionIndex(0); };
  const changeQuestion = (direction: number) => {
    // Stay in the selected subject: two preview questions per subject.
    setQuestionIndex(current => {
      const subject = current % 3;
      const local = Math.floor(current / 3);
      return subject + (((local + direction + 2) % 2) * 3);
    });
  };
  const tutorCopy = TUTOR_DEMO[lang];
  const cardLabels = FLASHCARD_LABELS[lang];
  return (
    <>
      <section id="experience" className="sht-story sht-story-paper" aria-labelledby="sht-story-practice-title">
        <div className="sht-story-copy">
          <span className="sht-story-kicker"><Sparkles size={16} aria-hidden="true"/>{t.kicker}</span>
          <h2 id="sht-story-practice-title">{t.headline}</h2>
          <p>{t.description}</p>
          <div className="sht-story-steps" aria-label={t.kicker}>
            {[t.one,t.two,t.three].map((step,i)=><span key={step}><b>{i+1}</b>{step}</span>)}
          </div>
        </div>
        <div className="sht-story-demo" aria-label={question.subject}>
          <div className="sht-reference-quiz-tabs" role="group" aria-label={lang==="hy"?"Ընտրել առարկան":lang==="ru"?"Выбрать предмет":"Choose a subject"}>
            {SAMPLE_SUBJECTS[lang].map((label,index)=>(
              <button type="button" key={label} aria-pressed={questionIndex % 3 === index}
                onClick={()=>setQuestionIndex(index)}>{label}</button>
            ))}
          </div>
          <div className="sht-story-demo-head">
            <span><BookOpen size={16} aria-hidden="true" />{question.subject}</span>
            <span className="sht-story-demo-count">{String(Math.floor(questionIndex / 3) + 1).padStart(2,"0")} / 02}</span>
          </div>
          <div className="sht-story-demo-body">
            <span className="sht-story-label">{t.check}</span>
            <h3 key={lang + questionIndex} className="sht-story-question">{question.prompt}</h3>
            <div className="sht-story-answers" role="group" aria-label={question.prompt}>
              {question.options.map((option,i) => (
                <button key={i} type="button" aria-pressed={answer===i}
                  className={answer===i ? (i===question.correct ? "is-correct" : "is-wrong") : ""}
                  onClick={()=>setAnswers(previous=>({...previous,[questionIndex]:i}))}>
                  <span>{["A","B","C"][i]}</span>{option}
                  {answer===i&&i===question.correct?<Check size={18} aria-hidden="true" />:<ChevronRight size={18} aria-hidden="true" />}
                </button>
              ))}
            </div>
            {answer!==null && (
              <p className={"sht-story-feedback " + (answer===question.correct ? "is-correct" : "")} role="status">
                {answer===question.correct?<CheckCircle2 size={18} aria-hidden="true" />:<Lightbulb size={18} aria-hidden="true" />}
                {answer===question.correct ? question.explanation : question.hint}
              </p>
            )}
            <div className="sht-story-quiz-bottom">
              <button type="button" className="sht-story-quiz-arrow" onClick={()=>changeQuestion(-1)}
                aria-label={lang==="hy"?"Նախորդ հարցը":lang==="ru"?"Предыдущий вопрос":"Previous question"}>
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <span className="sht-story-quiz-score" aria-live="polite">
                {lang==="hy"?"Ճիշտ":lang==="ru"?"Верно":"Correct"}: {correctCount} / {sampleProgress}
              </span>
              <button type="button" className="sht-story-quiz-next" onClick={()=>changeQuestion(1)}>
                {lang==="hy"?"Հաջորդը":lang==="ru"?"Дальше":"Next"}<ArrowRight size={17} aria-hidden="true" />
              </button>
              <button type="button" className="sht-story-reset" onClick={resetQuiz}
                aria-label={t.reset}><RotateCcw size={15} aria-hidden="true" />{t.reset}</button>
            </div>
          </div>
          <p className="sht-story-demo-foot">{t.sample}</p>
        </div>
      </section>

      <section className="sht-story sht-story-gold" aria-labelledby="sht-story-journey-title">
        <div className="sht-story-copy">
          <span className="sht-story-kicker"><GraduationCap size={16} aria-hidden="true"/>{t.journeyKicker}</span>
          <h2 id="sht-story-journey-title">{t.journeyTitle}</h2>
          <p>{t.journeyDesc}</p>
        </div>
        <div className="sht-journey-card" aria-label={t.sampleProgress}>
          <div className="sht-journey-heading"><span><GraduationCap size={20} aria-hidden="true"/>Shtemarm</span>
            <span aria-live="polite">{answeredCount} / {sampleProgress}</span></div>
          <h3>{t.pathTitle}</h3>
          <div className="sht-journey-line" aria-hidden="true">
            <span style={{ width: `${(answeredCount / sampleProgress) * 100}%` }} />
          </div>
          <p className="sht-reference-progress-live" aria-live="polite">
            {lang==="hy" ? "Ճիշտ պատասխաններ" : lang==="ru" ? "Правильные ответы" : "Correct answers"}:
            {" "}{correctCount} / {sampleProgress}
          </p>
          {[t.path1,t.path2,t.path3].map((v,i)=>
            <div className={"sht-journey-step"+(i<2?" is-complete":"")} key={v}>
              <span className="sht-journey-step-number">{i<2?<Check size={17} aria-hidden="true"/>:i+1}</span>
              <span>{v}</span>
              <span className="sht-journey-step-state">{i<2?"✓":"→"}</span>
            </div>)}
          <p className="sht-journey-note">{t.sampleProgress}</p>
        </div>
      </section>

      <section className="sht-story sht-story-ai" aria-labelledby="sht-story-ai-title">
        <div className="sht-story-copy">
          <span className="sht-story-kicker"><Sparkles size={16} aria-hidden="true"/>{t.aiKicker}</span>
          <h2 id="sht-story-ai-title">{t.aiTitle}</h2>
          <p>{t.aiDesc}</p>
          <Link to="/auth" className="sht-story-text-link">{t.aiCta}<ArrowRight size={18} aria-hidden="true"/></Link>
        </div>
        <div className="sht-ai-mock" aria-label={t.aiBadge}>
          <div className="sht-ai-mock-head"><span className="sht-ai-avatar"><GraduationCap size={19} aria-hidden="true"/></span>
            <div><strong>Shtemarm AI</strong><span>{t.aiBadge}</span></div>
            <Sparkles size={19} aria-hidden="true"/>
          </div>
          <div className="sht-reference-teacher-modes" role="group" aria-label={t.aiBadge}>
            {(["hint","explain","practice"] as const).map(mode=>(
              <button key={mode} type="button" aria-pressed={tutorMode===mode}
                onClick={()=>setTutorMode(mode)}>{tutorCopy.modes[mode]}</button>
            ))}
          </div>
          <div className="sht-ai-messages">
            <div className="sht-ai-user">{t.aiStudent}</div>
            <div className="sht-ai-tutor"><span className="sht-ai-tutor-icon"><Lightbulb size={16} aria-hidden="true"/></span><span aria-live="polite">{tutorCopy.replies[tutorMode]}</span></div>
          </div>
          <div className="sht-ai-mock-input" aria-hidden="true"><span>...</span><ArrowRight size={17}/></div>
        </div>
      </section>

      <section className="sht-story sht-story-flashcards" aria-labelledby="sht-story-flashcards-title">
        <div className="sht-story-copy">
          <span className="sht-story-kicker"><Layers3 size={17} aria-hidden="true" />{cardLabels.kicker}</span>
          <h2 id="sht-story-flashcards-title">{cardLabels.title}</h2>
          <p>{cardLabels.description}</p>
          <div className="sht-reference-review-count" aria-live="polite">
            <BookmarkCheck size={17} aria-hidden="true" />{cardLabels.saved}: <strong>{reviewWords.length}</strong>
          </div>
          <button className="sht-reference-review-toggle" type="button"
            disabled={!showReview && reviewWords.length===0}
            onClick={()=>{setShowReview(previous=>!previous);setCardIndex(0);}}>
            {showReview ? cardLabels.showAll : cardLabels.showReview}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <span className="sht-reference-session-note">{cardLabels.session}</span>
        </div>
        <div className="sht-reference-flashcard-panel">
          <div className="sht-reference-flashcard-counter">
            <span>SHTEMARM / WORDS</span>
            <span>{(cardIndex % cardSet.length)+1} / {cardSet.length}</span>
          </div>
          <div className="sht-reference-flashcard" role="group" aria-label={flashcard.word}
            onPointerDown={event=>{
              if(event.pointerType==="touch" || event.pointerType==="pen")
                cardSwipe.current={id:event.pointerId,x:event.clientX,y:event.clientY};
            }}
            onPointerUp={event=>{
              const swipe=cardSwipe.current;
              cardSwipe.current=null;
              if(!swipe || swipe.id!==event.pointerId)return;
              const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;
              if(Math.abs(dx)>54 && Math.abs(dx)>Math.abs(dy)*1.2)
                nextFlashcard(dx>0);
            }}
            onPointerCancel={()=>{cardSwipe.current=null;}}>
            <span className="sht-reference-flashcard-kicker"><MoveHorizontal size={16} aria-hidden="true" />{cardLabels.tap}</span>
            <div key={displayCard} className="sht-reference-flashcard-content">
              <strong>{flashcard.word}</strong>
              <span>{flashcard.translation}</span>
              <p>{flashcard.example}</p>
            </div>
            <div className="sht-reference-flashcard-corners" aria-hidden="true"><span>01</span><span>↗</span></div>
          </div>
          <div className="sht-reference-flashcard-actions" role="group" aria-label={cardLabels.title}>
            <button type="button" onClick={()=>nextFlashcard(false)}>
              <Check size={18} aria-hidden="true" />{cardLabels.know}
            </button>
            <button type="button" onClick={()=>nextFlashcard(true)}>
              <BookmarkCheck size={18} aria-hidden="true" />{cardLabels.review}
            </button>
          </div>
        </div>
      </section>

      <section id="download" className="sht-story sht-story-download" aria-labelledby="sht-story-install-title">
        <div className="sht-story-install-head">
          <span className="sht-story-kicker"><Download size={16} aria-hidden="true"/>{t.installKicker}</span>
          <h2 id="sht-story-install-title">{t.installTitle}</h2>
          <p>{t.installDesc}</p>
        </div>
        <div className="sht-install-options">
          <article className="sht-install-option">
            <span className="sht-install-icon"><Monitor size={23} aria-hidden="true"/></span>
            <h3>{t.browser}</h3>
            <p>{t.browserDesc}</p>
            <Link to="/auth" className="sht-install-action">{t.browserCta}<ArrowRight size={17} aria-hidden="true"/></Link>
          </article>
          <article className="sht-install-option sht-install-option-github">
            <span className="sht-install-icon"><Smartphone size={23} aria-hidden="true"/></span>
            <h3>{t.android}</h3>
            <p>{t.androidDesc} <span className="sht-install-beta">v{SITE_ANDROID_BETA_VERSION}</span></p>
            <a href={SITE_ANDROID_APK_URL} download="Shtemarm-Android.apk" className="sht-install-action"><Download size={17} aria-hidden="true"/>{t.apkCta}</a>
            <Link to="/download" className="sht-install-release">{t.releaseCta}<ExternalLink size={15} aria-hidden="true"/></Link>
          </article>
        </div>
        <div className="sht-install-foot"><LockKeyhole size={16} aria-hidden="true"/><p>{t.betaNote} <Link to="/download">{t.instructions}<ArrowRight size={14} aria-hidden="true"/></Link></p></div>
      </section>
    </>
  );
}
