import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ChevronDown, BookOpen, CheckCircle2, GraduationCap, Languages, ListChecks, Menu, Moon, ShieldCheck, Sparkles, Sun, Target, Trophy } from "lucide-react";
import { initLang, setLang, useLang } from "@/lib/lang";
import { setAppearance } from "@/lib/theme";
import { supabase, ensureBrowserSupabaseConfig } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Shtemarm · Պատրաստվիր քննություններին քո ձևով" },
    { name: "description", content: "Shtemarm՝ շտեմարաններ, սխալների կրկնություն, ուսումնական պլան և առաջընթացի հետևում։" },
  ] }),
  component: LandingPage,
});
const COPY = {
  hy: { login:"Մուտք",start:"Սկսել անվճար",learn:"Իմանալ ավելին",tag:"Քո ուսումը՝ քո ռիթմով",hero:"Պատրաստվիր քննություններին ավելի վստահ",intro:"Սովորիր բնօրինակ շտեմարաններով, կրկնիր սխալներդ և հետևիր քո առաջընթացին՝ մեկ հարթակում։",benefits:"Ինչու ընտրել Shtemarm-ը",subjects:"Սովորիր քեզ անհրաժեշտ առարկաները",steps:"Ինչպես է աշխատում",preview:"Տես՝ ինչ է սպասվում քեզ",faq:"Հաճախ տրվող հարցեր",ready:"Պատրա՞ստ ես սկսել",readyDesc:"Ստեղծիր հաշիվ և սկսիր սովորել քո նպատակներով։",b1:"Շտեմարաններ",b1d:"Աշխատիր առարկայական հարցերով և ստուգիր պատասխաններդ։",b2:"Սխալների կրկնություն",b2d:"Վերադարձիր սխալ հարցերին ու ամրապնդիր գիտելիքներդ։",b3:"Անհատական պլան",b3d:"Ընտրիր առարկաներդ և ստացիր օրվա առաջադրանքներ։",b4:"XP և նվաճումներ",b4d:"Հետևիր առաջընթացին և նշիր փոքր հաղթանակներդ։",s1:"Ստեղծիր հաշիվ",s2:"Ընտրիր նպատակներդ",s3:"Սկսիր լուծել և կրկնել",demo:"Օրինակ՝ այսօրվա ուսումնական պլան",demo1:"Կրկնիր սխալ հարցերը",demo2:"Լուծիր նոր առաջադրանքներ",faq1:"Կարո՞ղ եմ սովորել առանց հաշվի։",faq1a:"Ուսումնական բաժիններից օգտվելու համար անհրաժեշտ է մուտք գործել։ Ներկայացման էջը բաց է բոլորի համար։",faq2:"Ի՞նչ կլինի նախկին առաջընթացիս հետ։",faq2a:"Նախկինում այս սարքում պահված առաջընթացը չի ջնջվում։ Մուտքից հետո հնարավորության դեպքում այն համաժամացվում է հաշվի հետ։",faq3:"Ո՞ր լեզուներն են հասանելի։",faq3a:"Ինտերֆեյսը հասանելի է հայերեն, անգլերեն և ռուսերեն։ Շտեմարանների հարցերը մնում են իրենց բնօրինակ լեզվով։"},
  en: {login:"Sign in",start:"Get started",learn:"Learn more",tag:"Learn at your own pace",hero:"Prepare for exams with confidence",intro:"Practice with question books, revisit mistakes and track your progress in one place.",benefits:"Why Shtemarm?",subjects:"Study the subjects you need",steps:"How it works",preview:"See what's waiting for you",faq:"Frequently asked questions",ready:"Ready to begin?",readyDesc:"Create an account and start learning toward your goals.",b1:"Question books",b1d:"Practice subject questions and check your answers.",b2:"Mistake review",b2d:"Return to missed questions and strengthen your knowledge.",b3:"Personal study plan",b3d:"Choose subjects and get daily learning tasks.",b4:"XP and achievements",b4d:"Track progress and celebrate small milestones.",s1:"Create an account",s2:"Choose your goals",s3:"Practice and review",demo:"Example daily study plan",demo1:"Review missed questions",demo2:"Practice new questions",faq1:"Can I study without an account?",faq1a:"Sign-in is required for study tools. The introductory page is public.",faq2:"What happens to my previous progress?",faq2a:"Previously saved progress on this device is not deleted and can be synced to your account when available.",faq3:"Which languages are available?",faq3a:"The interface supports Armenian, English and Russian. Original question text stays in its source language."},
  ru: {login:"Войти",start:"Начать",learn:"Подробнее",tag:"Учись в своём ритме",hero:"Готовься к экзаменам увереннее",intro:"Решай задания, повторяй ошибки и отслеживай прогресс на одной платформе.",benefits:"Почему Shtemarm?",subjects:"Изучай нужные предметы",steps:"Как это работает",preview:"Посмотри, что тебя ждёт",faq:"Частые вопросы",ready:"Готов начать?",readyDesc:"Создай аккаунт и учись в соответствии со своими целями.",b1:"Сборники заданий",b1d:"Решай вопросы по предметам и проверяй ответы.",b2:"Работа над ошибками",b2d:"Возвращайся к ошибкам и закрепляй знания.",b3:"Личный план",b3d:"Выбирай предметы и получай задания на день.",b4:"XP и достижения",b4d:"Следи за прогрессом и отмечай достижения.",s1:"Создай аккаунт",s2:"Выбери цели",s3:"Решай и повторяй",demo:"Пример плана на день",demo1:"Повтори ошибки",demo2:"Реши новые задания",faq1:"Можно ли учиться без аккаунта?",faq1a:"Для учебных разделов нужен вход. Вводная страница открыта всем.",faq2:"Что будет со старым прогрессом?",faq2a:"Прогресс, сохранённый на этом устройстве, не удаляется и может синхронизироваться с аккаунтом.",faq3:"Какие языки доступны?",faq3a:"Интерфейс доступен на армянском, английском и русском. Текст заданий остаётся на языке оригинала."},
};
const FAQ_ITEMS = {
  "hy": [
    [
      "Ի՞նչ է Shtemarm-ը և ո՞ւմ համար է նախատեսված։",
      "Shtemarm-ը ուսումնական հարթակ է դպրոցականների և դիմորդների համար։ Այստեղ կարող ես աշխատել առարկայական շտեմարաններով, ստուգել պատասխաններդ և հետևել քո առաջընթացին։"
    ],
    [
      "Ինչպե՞ս սկսել սովորել Shtemarm-ում։",
      "Ստեղծիր հաշիվ կամ մուտք գործիր Google-ով կամ էլ․ փոստով, ընտրիր առարկաներդ ու ուսման նպատակը։ Դրանից հետո քո անձնական էջից կարող ես բացել շտեմարաններն ու սկսել պարապել։"
    ],
    [
      "Կարո՞ղ եմ պատրաստվել միասնական քննություններին։",
      "Կարող ես պարապել առարկայական հարցերով և օգտվել քննությանը պատրաստվելու գործիքներից։ Հարթակը նախատեսված է նախապատրաստվելու համար, սակայն չի փոխարինում պաշտոնական քննության տեղեկություններին կամ ուսուցչի խորհրդին։"
    ],
    [
      "Ինչպե՞ս է Shtemarm-ն օգնում աշխատել սխալների վրա։",
      "Սխալ պատասխանած հարցերը կարող ես գտնել սխալների բաժնում, հերթով կրկնել և նշում անել, երբ արդեն յուրացրել ես նյութը։ Սա օգնում է կենտրոնանալ այն թեմաների վրա, որոնք դեռ դժվարանում ես։"
    ],
    [
      "Ի՞նչ է անհատական ուսումնական պլանը։",
      "Ընտրած առարկաների, հատկացրած ժամանակի և պահպանված սխալների հիման վրա Shtemarm-ն առաջարկում է օրվա ուսումնական առաջադրանքներ։ Պլանը կարող ես հարմարեցնել քո ռիթմին։"
    ],
    [
      "Ի՞նչ են XP-ն, մակարդակներն ու նվաճումները։",
      "Դրանք սովորելու առաջընթացը տեսանելի դարձնելու խաղային տարրեր են։ Հարցեր լուծելիս և առաջադրանքներ կատարելիս կարող ես հետևել քո նպատակներին։ XP-ն գումար չէ և չի որոշում քննության արդյունքդ։"
    ],
    [
      "Կպահպանվի՞ իմ առաջընթացը, եթե դուրս գամ հաշվից։",
      "Հաշվի հետ համաժամացված առաջընթացը կարող է հասանելի լինել նորից մուտք գործելիս։ Որոշ տվյալներ պահվում են նաև տվյալ սարքի դիտարկչում, ուստի սարքը փոխելուց կամ դիտարկչի տվյալները մաքրելուց առաջ համոզվիր, որ մուտք ես գործել։"
    ],
    [
      "Արդյո՞ք Shtemarm-ի հարցերը փոխարինում են պաշտոնական շտեմարաններին։",
      "Shtemarm-ը նախատեսված է ինտերակտիվ պարապմունքների համար։ Եթե քեզ անհրաժեշտ է առաջադրանքի ճշգրիտ ձևակերպումը կամ քննության վերջին կանոնները, համեմատիր այն պաշտոնական հրապարակման հետ։"
    ]
  ],
  "en": [
    [
      "What is Shtemarm, and who is it for?",
      "Shtemarm is a learning platform for school students and exam applicants. Practice subject questions, check answers and track your learning progress in one place."
    ],
    [
      "How do I get started?",
      "Create an account or sign in with Google or email, choose your subjects and learning goal, then open the question books from your personal dashboard."
    ],
    [
      "Can Shtemarm help me prepare for entrance exams?",
      "You can practice subject questions and use exam-preparation tools. Shtemarm supports your preparation but does not replace official exam guidance or advice from your teacher."
    ],
    [
      "How can I learn from my mistakes?",
      "Open the mistake review area to revisit missed questions one by one and mark material as mastered when you are ready. It helps you focus on topics that need more attention."
    ],
    [
      "How does the personal study plan work?",
      "Shtemarm suggests daily tasks based on your selected subjects, available study time and saved mistakes. You can adapt the plan to your schedule."
    ],
    [
      "What are XP, levels and achievements?",
      "They are game-like ways to visualize learning progress. Track goals as you practice and complete tasks. XP is not money and does not predict your exam score."
    ],
    [
      "Will my progress remain after signing out?",
      "Progress synced to your account may be available when you sign in again. Some data is also stored in this browser, so check that you are signed in before switching devices or clearing browser data."
    ],
    [
      "Do the questions replace official exam materials?",
      "Shtemarm is designed for interactive practice. For exact wording of a question or the latest exam rules, refer to the official published materials."
    ]
  ],
  "ru": [
    [
      "Что такое Shtemarm и для кого он создан?",
      "Shtemarm — учебная платформа для школьников и абитуриентов. Здесь можно решать задания по предметам, проверять ответы и отслеживать прогресс."
    ],
    [
      "Как начать заниматься?",
      "Создай аккаунт или войди через Google либо электронную почту, выбери предметы и цель обучения, затем открой задания в личном кабинете."
    ],
    [
      "Поможет ли Shtemarm подготовиться к вступительным экзаменам?",
      "Ты можешь решать задания по предметам и использовать инструменты подготовки. Платформа помогает готовиться, но не заменяет официальные сведения об экзаменах и рекомендации преподавателя."
    ],
    [
      "Как работать над ошибками?",
      "В разделе ошибок можно по очереди повторять задания с неверными ответами и отмечать усвоенный материал. Так проще уделять внимание сложным темам."
    ],
    [
      "Как работает индивидуальный учебный план?",
      "Shtemarm предлагает задания на день с учётом выбранных предметов, времени на занятия и сохранённых ошибок. План можно подстроить под свой график."
    ],
    [
      "Что такое XP, уровни и достижения?",
      "Это игровые элементы, которые помогают видеть прогресс. Отслеживай цели во время занятий. XP — не деньги и не прогноз результата экзамена."
    ],
    [
      "Сохранится ли прогресс после выхода из аккаунта?",
      "Прогресс, синхронизированный с аккаунтом, может быть доступен при следующем входе. Часть данных хранится и в браузере, поэтому перед сменой устройства или очисткой данных убедись, что вошёл в аккаунт."
    ],
    [
      "Заменяют ли задания Shtemarm официальные материалы?",
      "Shtemarm предназначен для интерактивной практики. Точные формулировки заданий и актуальные правила экзаменов следует сверять с официальными публикациями."
    ]
  ]
} as const;
const SUBJECTS = [
  { key: "armenian", names: { hy: "Հայոց լեզու", en: "Armenian language", ru: "Армянский язык" }, Icon: Languages },
  { key: "english", names: { hy: "Անգլերեն", en: "English", ru: "Английский язык" }, Icon: BookOpen },
  { key: "math", names: { hy: "Մաթեմատիկա", en: "Mathematics", ru: "Математика" }, Icon: Target },
  { key: "biology", names: { hy: "Կենսաբանություն", en: "Biology", ru: "Биология" }, Icon: Sparkles },
  { key: "history", names: { hy: "Հայոց պատմություն", en: "Armenian history", ru: "История Армении" }, Icon: GraduationCap },
  { key: "physics", names: { hy: "Ֆիզիկա", en: "Physics", ru: "Физика" }, Icon: ShieldCheck },
] as const;

const LANDING_UI = {
  hy: { navBenefits: "Առավելություններ", navSteps: "Ինչպես սկսել", sample: "Ինտերակտիվ նախադիտում", example: "Ցուցադրական օրինակ", focus: "Այսօրվա ուղղությունը", focused: "Ընտրված առաջադրանք", practice: "Ուսումնական գործիքներ", review: "Կրկնիր և ամրապնդիր", progress: "Քո տեմպով, առանց շտապելու", viewSubjects: "Դիտել առարկաները", subjectsIntro: "Ընտրիր քեզ անհրաժեշտ առարկան և սկսիր պատրաստվել մեկ հարմար տարածքում։", openSubject: "Սկսել պարապել", stepsIntro: "Քո պատրաստությունն սկսվում է ընդամենը երեք պարզ քայլից։", faqIntro: "Կարճ ու հստակ պատասխաններ՝ սովորելը հեշտ սկսելու համար։", footer: "Ստեղծված է դպրոցականների և դիմորդների համար։", explore: "Հարցաշարեր, կրկնություն, առաջընթաց", signIn: "Մուտք", account: "Ուսման տարածք", demoNote: "Սա հնարավորությունների նախադիտում է, ոչ թե քո իրական առաջընթացը։" },
  en: { navBenefits: "Benefits", navSteps: "How it works", sample: "Interactive preview", example: "Sample experience", focus: "Today's focus", focused: "Selected activity", practice: "Study tools", review: "Review and improve", progress: "At your own pace", viewSubjects: "Explore subjects", subjectsIntro: "Choose a subject and start preparing in one convenient place.", openSubject: "Start practicing", stepsIntro: "Your learning journey starts with three simple steps.", faqIntro: "Clear answers to help you get started.", footer: "Built for students and exam applicants.", explore: "Practice, review, progress", signIn: "Sign in", account: "Study space", demoNote: "This is a feature preview, not your actual learning progress." },
  ru: { navBenefits: "Преимущества", navSteps: "Как начать", sample: "Интерактивный пример", example: "Демонстрация", focus: "Задача на сегодня", focused: "Выбранное задание", practice: "Учебные инструменты", review: "Повторяй и закрепляй", progress: "В своём темпе", viewSubjects: "Выбрать предмет", subjectsIntro: "Выбери нужный предмет и готовься в одном удобном месте.", openSubject: "Начать занятия", stepsIntro: "Начни подготовку всего за три простых шага.", faqIntro: "Короткие ответы на вопросы перед началом занятий.", footer: "Для школьников и абитуриентов.", explore: "Задания, повторение, прогресс", signIn: "Войти", account: "Учебное пространство", demoNote: "Это демонстрация возможностей, а не твой реальный прогресс." },
} as const;

function LandingPage() {
  const lang = useLang();
  const t = COPY[lang];
  const ui = LANDING_UI[lang];
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  useEffect(() => {
    initLang();
    let mounted = true;
    void ensureBrowserSupabaseConfig()
      .then(ok => ok ? supabase.auth.getSession() : null)
      .then(result => {
        if (mounted && result?.data.session) void navigate({ to: "/dashboard", replace: true });
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [navigate]);

  const benefits = [
    { Icon: BookOpen, title: t.b1, description: t.b1d, className: "sht-feature-featured" },
    { Icon: ListChecks, title: t.b2, description: t.b2d, className: "" },
    { Icon: Target, title: t.b3, description: t.b3d, className: "" },
    { Icon: Trophy, title: t.b4, description: t.b4d, className: "" },
  ];
  const demoTasks = [t.demo1, t.demo2];

  return (
    <div className="sht-landing">
      <header className="sht-landing-nav" aria-label={lang === "hy" ? "Կայքի նավարկում" : lang === "ru" ? "Навигация сайта" : "Site navigation"}>
        <Link to="/" className="sht-brand" aria-label="Shtemarm">
          <span className="sht-brand-icon"><img src="/shtemarm-logo.svg" alt="" width="34" height="34" /></span>
          <span>Shtemarm</span>
        </Link>
        <nav className="sht-nav-links" aria-label={lang === "hy" ? "Հիմնական բաժիններ" : lang === "ru" ? "Основные разделы" : "Main sections"}>
          <a href="#benefits">{ui.navBenefits}</a>
          <a href="#subjects">{t.subjects}</a>
          <a href="#how-it-works">{ui.navSteps}</a>
          <a href="#faq">{t.faq}</a>
        </nav>
        <div className="sht-nav-actions">
          <details className="sht-mobile-links">
            <summary aria-label={lang === "hy" ? "Բացել բաժինները" : lang === "ru" ? "Открыть разделы" : "Open sections"}><Menu className="size-5" aria-hidden="true" /></summary>
            <nav aria-label={lang === "hy" ? "Բջջային բաժիններ" : lang === "ru" ? "Мобильное меню" : "Mobile menu"}>
              {[["#benefits", ui.navBenefits], ["#subjects", t.subjects], ["#how-it-works", ui.navSteps], ["#faq", t.faq]].map(([hash, label]) => (
                <a key={hash} href={hash} onClick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")}>{label}<ArrowRight className="size-4" aria-hidden="true" /></a>
              ))}
            </nav>
          </details>
          <div className="sht-lang-switch" role="group" aria-label={lang === "hy" ? "Լեզու" : lang === "ru" ? "Язык" : "Language"}>
            {(["hy", "en", "ru"] as const).map(code => (
              <button key={code} type="button" onClick={() => setLang(code)} aria-pressed={lang === code} title={{ hy: "Հայերեն", en: "English", ru: "Русский" }[code]}>{code.toUpperCase()}</button>
            ))}
          </div>
          <button type="button" className="sht-landing-theme" aria-label={lang === "hy" ? "Փոխել գունային ռեժիմը" : lang === "ru" ? "Изменить тему" : "Toggle color theme"} onClick={() => setAppearance({ mode: document.documentElement.classList.contains("dark") ? "light" : "dark" })}><Moon className="sht-theme-moon size-4" aria-hidden="true" /><Sun className="sht-theme-sun size-4" aria-hidden="true" /></button>
          <Link to="/auth" className="sht-nav-login">{ui.signIn}<ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>
      </header>

      <section className="sht-hero" aria-labelledby="sht-hero-title">
        <div className="sht-hero-copy">
          <span className="sht-eyebrow"><Sparkles className="size-4" aria-hidden="true" />{t.tag}</span>
          <h1 id="sht-hero-title">{t.hero}<span className="sht-hero-period">.</span></h1>
          <p className="sht-hero-description">{t.intro}</p>
          <div className="sht-hero-actions">
            <Link to="/auth" className="sht-button-primary">{t.start}<ArrowRight className="size-5" aria-hidden="true" /></Link>
            <a href="#subjects" className="sht-button-secondary">{ui.viewSubjects}<ArrowDown className="size-4" aria-hidden="true" /></a>
          </div>
          <div className="sht-hero-caption"><CheckCircle2 className="size-5" aria-hidden="true" /><span>{ui.explore}</span></div>
        </div>

        <div className="sht-hero-visual" aria-label={ui.sample}>
          <div className="sht-orbit sht-orbit-one" aria-hidden="true" />
          <div className="sht-orbit sht-orbit-two" aria-hidden="true" />
          <div className="sht-preview">
            <div className="sht-preview-top">
              <div className="sht-window-dots" aria-hidden="true"><i /><i /><i /></div>
              <span><Sparkles className="size-3.5" aria-hidden="true" />{ui.sample}</span>
            </div>
            <div className="sht-preview-body">
              <div className="sht-preview-heading">
                <span className="sht-preview-icon"><GraduationCap className="size-5" aria-hidden="true" /></span>
                <div><span className="sht-mini-label">{ui.example}</span><h2>{t.demo}</h2></div>
              </div>
              <div className="sht-preview-focus">
                <div className="sht-preview-focus-heading"><Target className="size-4" aria-hidden="true" /><span>{ui.focus}</span></div>
                <p>{ui.progress}</p>
                <div className="sht-progress-track" aria-hidden="true"><span /></div>
              </div>
              <div className="sht-demo-options" role="group" aria-label={t.demo}>
                {demoTasks.map((task, i) => (
                  <button key={task} type="button" onClick={() => setActive(i)} aria-pressed={active === i} className={"sht-demo-option" + (active === i ? " is-active" : "")}>
                    <span className="sht-demo-check"><CheckCircle2 className="size-5" aria-hidden="true" /></span>
                    <span>{task}</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className="sht-demo-selection"><ShieldCheck className="size-4" aria-hidden="true" />{ui.focused}: <strong>{demoTasks[active]}</strong></div>
              <p className="sht-demo-disclaimer">{ui.demoNote}</p>
            </div>
          </div>
          <div className="sht-floating-label"><BookOpen className="size-5" aria-hidden="true" /><span>{ui.review}</span></div>
        </div>
      </section>

      <div className="sht-info-band" aria-label={ui.explore}>
        <span><BookOpen className="size-5" aria-hidden="true" />{t.b1}</span>
        <span><ListChecks className="size-5" aria-hidden="true" />{t.b2}</span>
        <span><Target className="size-5" aria-hidden="true" />{t.b3}</span>
        <span><Trophy className="size-5" aria-hidden="true" />{t.b4}</span>
      </div>

      <section id="benefits" className="sht-section sht-section-benefits" aria-labelledby="sht-benefits-title">
        <div className="sht-section-heading">
          <span className="sht-section-kicker"><Sparkles className="size-4" aria-hidden="true" /> Shtemarm</span>
          <h2 id="sht-benefits-title">{t.benefits}</h2>
          <p>{t.intro}</p>
        </div>
        <div className="sht-bento-grid">
          {benefits.map(({ Icon, title, description, className }, i) => (
            <article key={title} className={"sht-feature " + className}>
              <div className="sht-feature-top"><span className="sht-feature-icon"><Icon className="size-6" aria-hidden="true" /></span><span className="sht-feature-number">0{i + 1}</span></div>
              <div><h3>{title}</h3><p>{description}</p></div>
              <span className="sht-feature-decoration" aria-hidden="true"><Icon /></span>
            </article>
          ))}
        </div>
      </section>

      <section id="subjects" className="sht-section" aria-labelledby="sht-subjects-title">
        <div className="sht-section-heading">
          <span className="sht-section-kicker"><BookOpen className="size-4" aria-hidden="true" />{ui.account}</span>
          <h2 id="sht-subjects-title">{t.subjects}</h2>
          <p>{ui.subjectsIntro}</p>
        </div>
        <div className="sht-subject-grid">
          {SUBJECTS.map(({ key, names, Icon }) => (
            <Link key={key} to="/auth" className="sht-subject-card" aria-label={names[lang] + " · " + ui.openSubject}>
              <span className="sht-subject-icon"><Icon className="size-6" aria-hidden="true" /></span>
              <strong>{names[lang]}</strong>
              <ArrowRight className="sht-subject-arrow size-5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="sht-section sht-steps-section" aria-labelledby="sht-steps-title">
        <div className="sht-section-heading">
          <span className="sht-section-kicker"><Target className="size-4" aria-hidden="true" />{ui.navSteps}</span>
          <h2 id="sht-steps-title">{t.steps}</h2><p>{ui.stepsIntro}</p>
        </div>
        <div className="sht-step-grid">
          {[t.s1, t.s2, t.s3].map((step, i) => (
            <div key={step} className="sht-step">
              <span className="sht-step-number">0{i + 1}</span>
              <h3>{step}</h3>
              <span className="sht-step-rule" aria-hidden="true" />
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="sht-section sht-faq-section" aria-labelledby="sht-faq-title">
        <div className="sht-section-heading">
          <span className="sht-section-kicker"><ShieldCheck className="size-4" aria-hidden="true" /> Shtemarm</span>
          <h2 id="sht-faq-title">{t.faq}</h2>
          <p>{ui.faqIntro}</p>
        </div>
        <div className="sht-faq-list">
          {FAQ_ITEMS[lang].map(([q, a], i) => (
            <details key={q} className="sht-faq-item">
              <summary><span className="sht-faq-index">{String(i + 1).padStart(2, "0")}</span><span>{q}</span><ChevronDown className="sht-faq-chevron size-5" aria-hidden="true" /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="sht-bottom-cta" aria-labelledby="sht-cta-title">
        <span className="sht-cta-decoration" aria-hidden="true"><GraduationCap /></span>
        <div><span className="sht-cta-overline">SHTEMARM</span><h2 id="sht-cta-title">{t.ready}</h2><p>{t.readyDesc}</p></div>
        <Link to="/auth" className="sht-button-primary sht-cta-button">{t.start}<ArrowRight className="size-5" aria-hidden="true" /></Link>
      </section>

      <footer className="sht-landing-footer">
        <Link to="/" className="sht-brand"><span className="sht-brand-icon"><img src="/shtemarm-logo.svg" alt="" width="28" height="28" /></span><span>Shtemarm</span></Link>
        <p>{ui.footer}</p>
        <Link to="/about">{t.learn}<ArrowRight className="size-4" aria-hidden="true" /></Link>
      </footer>
    </div>
  );
}
