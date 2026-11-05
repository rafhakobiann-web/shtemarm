import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, Download, ExternalLink,
  GraduationCap, Lightbulb, LockKeyhole, Monitor, RotateCcw, Smartphone, Sparkles,
} from "lucide-react";
import { GITHUB_ANDROID_APK_URL, GITHUB_ANDROID_RELEASE_URL, GITHUB_ANDROID_BETA_VERSION } from "@/lib/app-download";

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
    installDesc: "Բացիր Shtemarm-ը դիտարկչում կամ ներբեռնիր Android-ի փորձնական APK-ն անմիջապես GitHub Releases-ից։ Google Play-ում հավելված դեռ չունենք։",
    browser: "Օգտվել կայքից", browserDesc: "Աշխատում է հեռախոսով, պլանշետով և համակարգչով՝ առանց APK ներբեռնելու։",
    browserCta: "Սկսել կայքում",
    android: "Android հավելված", androidDesc: "Հանրային GitHub Release-ից ներբեռնվող փորձնական APK։",
    apkCta: "Ներբեռնել APK-ն GitHub-ից",
    releaseCta: "Տեսնել թողարկման էջը",
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
    installDesc: "Open Shtemarm in your browser or get the Android beta APK directly from GitHub Releases. We don't have a Google Play app.",
    browser: "Use the website", browserDesc: "Works on phones, tablets and computers without installing an APK.",
    browserCta: "Start on the website",
    android: "Android application", androidDesc: "Public beta APK hosted on GitHub Releases.",
    apkCta: "Download APK from GitHub",
    releaseCta: "View the release page",
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
    installDesc: "Открой Shtemarm в браузере или скачай тестовый APK для Android напрямую с GitHub Releases. Приложения в Google Play пока нет.",
    browser: "Открыть сайт", browserDesc: "Работает на телефонах, планшетах и компьютерах без APK.",
    browserCta: "Начать на сайте",
    android: "Android-приложение", androidDesc: "Публичный тестовый APK из GitHub Releases.",
    apkCta: "Скачать APK с GitHub",
    releaseCta: "Открыть страницу релиза",
    betaNote: "Тестовая debug-сборка. Некоторые функции не закончены, а другая подпись может помешать обновлению. Сохрани прогресс заранее.",
    instructions: "Инструкция по установке",
  },
} as const;

export function LandingShowcase({ lang }: { lang: Lang }) {
  const t = WORDS[lang];
  const [answer,setAnswer] = useState<number|null>(null);
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
        <div className="sht-story-demo" aria-label={t.demo}>
          <div className="sht-story-demo-head"><span><BookOpen size={16} aria-hidden="true"/>{t.demo}</span><span className="sht-story-demo-count">01 / 01</span></div>
          <div className="sht-story-demo-body">
            <span className="sht-story-label">{t.check}</span>
            <h3>{t.question}</h3>
            <div className="sht-story-answers" role="group" aria-label={t.question}>
              {[2,3,4].map((n,i)=><button key={n} type="button" aria-pressed={answer===n}
                className={answer===n?(n===3?"is-correct":"is-wrong"):""}
                onClick={()=>setAnswer(n)}>
                <span>{["A","B","C"][i]}</span>{n}
                {answer===n&&n===3?<Check size={18} aria-hidden="true"/>:<ChevronRight size={18} aria-hidden="true"/>}
              </button>)}
            </div>
            {answer!==null&&<p className={"sht-story-feedback "+(answer===3?"is-correct":"")} role="status">
              {answer===3?<CheckCircle2 size={18} aria-hidden="true"/>:<Lightbulb size={18} aria-hidden="true"/>}
              {answer===3?t.correct:t.incorrect}
            </p>}
            {answer!==null&&<button type="button" className="sht-story-reset" onClick={()=>setAnswer(null)}><RotateCcw size={15} aria-hidden="true"/>{t.reset}</button>}
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
          <div className="sht-journey-heading"><span><GraduationCap size={20} aria-hidden="true"/>Shtemarm</span><span>{t.progressNumber}</span></div>
          <h3>{t.pathTitle}</h3>
          <div className="sht-journey-line" aria-hidden="true"><span/></div>
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
          <div className="sht-ai-messages">
            <div className="sht-ai-user">{t.aiStudent}</div>
            <div className="sht-ai-tutor"><span className="sht-ai-tutor-icon"><Lightbulb size={16} aria-hidden="true"/></span><span>{t.aiReply}</span></div>
          </div>
          <div className="sht-ai-mock-input" aria-hidden="true"><span>...</span><ArrowRight size={17}/></div>
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
            <p>{t.androidDesc} <span className="sht-install-beta">v{GITHUB_ANDROID_BETA_VERSION}</span></p>
            <a href={GITHUB_ANDROID_APK_URL} target="_blank" rel="noopener noreferrer" className="sht-install-action"><Download size={17} aria-hidden="true"/>{t.apkCta}</a>
            <a href={GITHUB_ANDROID_RELEASE_URL} target="_blank" rel="noopener noreferrer" className="sht-install-release">{t.releaseCta}<ExternalLink size={15} aria-hidden="true"/></a>
          </article>
        </div>
        <div className="sht-install-foot"><LockKeyhole size={16} aria-hidden="true"/><p>{t.betaNote} <Link to="/download">{t.instructions}<ArrowRight size={14} aria-hidden="true"/></Link></p></div>
      </section>
    </>
  );
}
