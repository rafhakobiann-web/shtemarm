import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, Languages, Sparkles, Wrench } from "lucide-react";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/changelog")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { property: "og:title", content: "Shtemarm · Changelog" },
      { property: "og:description", content: "Shtemarm updates, fixes, and learning-platform progress." },
      { title: "Shtemarm · Changelog" },
      { name: "description", content: "Shtemarm updates, fixes, and learning-platform progress." },
    ],
  }),
  component: ChangelogPage,
});

const updates = [
  {
    date: "November 6, 2026",
    label: "Navigation, explanations and fixes",
    title: "Easier discovery and step-by-step learning",
    titleHy: "Ավելի պարզ որոնում և քայլային ուսուցում",
    titleRu: "Удобный поиск и пошаговое обучение",
    icon: Sparkles,
    tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    items: [
      { emoji: "🧭", en: "Simpler Explore navigation and a calmer, focused dashboard.", hy: "Պարզեցվել են «Բացահայտիր» բաժինը, նավարկությունն ու գլխավոր վահանակը։", ru: "Упрощены раздел поиска, навигация и главная панель." },
      { emoji: "🧠", en: "Near-full-screen guided explanations with steps and less empty space.", hy: "Ավելացվել են գրեթե ամբողջ էկրանով քայլային բացատրություններ՝ առանց ավելորդ դատարկ տարածքի։", ru: "Добавлены пошаговые объяснения почти на весь экран, без лишних пустых областей." },
      { emoji: "📱", en: "Fixed blocked answer taps and AI overlays on smaller screens.", hy: "Շտկվել են հեռախոսով պատասխանի ընտրությանը խանգարող տարրերը։", ru: "Исправлены элементы, мешавшие выбору ответов на телефонах." },
      { emoji: "🧮", en: "Improved math formulas and expanded the math handbook to 59 rules.", hy: "Բարելավվել է բանաձևերի ցուցադրումը, մաթեմատիկայի կանոնները դարձել են 59-ը։", ru: "Улучшено отображение формул; справочник математики расширен до 59 правил." },
      { emoji: "🇬🇧", en: "Added an animated English question demo to the landing page.", hy: "Ներկայացման էջում ավելացվել է անգլերենի հարցերի անիմացիոն փորձնական հատված։", ru: "На главную страницу добавлено анимированное демо заданий по английскому." },
      { emoji: "⏳", en: "Draft only: nine Armenian Volume I syntax diagrams are being verified; not yet released.", hy: "Միայն Draft․ Հայոց լեզվի I մասի 9 գծապատկերների ստուգումը շարունակվում է․ դեռ հրապարակված չեն։", ru: "Только Draft: проверяются 9 схем из первого сборника армянского языка; ещё не выпущены." },
    ],
  },
  {
    date: "November 5, 2026",
    label: "Learning hub and Armenian books",
    title: "New ways to study",
    titleHy: "Սովորելու նոր հնարավորություններ",
    titleRu: "Новые возможности для учёбы",
    icon: BookOpen,
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    items: [
      { emoji: "🎓", en: "Added the Phase 4.2 learning hub and guided study tools.", hy: "Ավելացվել են Phase 4.2 ուսումնական կենտրոնն ու ուղղորդված գործիքները։", ru: "Добавлены учебный центр Phase 4.2 и инструменты пошагового обучения." },
      { emoji: "📘", en: "Imported 1,682 Armenian Volume I tasks; nine diagram questions still needed verification.", hy: "Ներմուծվել է Հայոց լեզվի I մասի 1 682 առաջադրանք․ 9 գծապատկեր դեռ ստուգման կարիք ուներ։", ru: "Импортированы 1682 задания первого сборника армянского языка; 9 схем требовали проверки." },
      { emoji: "🗣️", en: "Improved Armenian-language AI tutor explanations and formula clarity.", hy: "Բարելավվել են AI ուսուցչի հայերեն բացատրություններն ու բանաձևերի ներկայացումը։", ru: "Улучшены объяснения ИИ-репетитора на армянском и отображение формул." },
      { emoji: "✨", en: "Refined the animated landing page and signed-in dashboard.", hy: "Բարելավվել են անիմացիոն ներկայացման էջն ու մուտք գործած օգտատիրոջ վահանակը։", ru: "Улучшены анимированная главная страница и панель пользователя." },
      { emoji: "🛠️", en: "Worked on Lovable build/auth and site-routing issues.", hy: "Աշխատանք է կատարվել Lovable-ի build-ի, մուտքի և երթուղիների խնդիրների վրա։", ru: "Проведена работа над сборкой Lovable, авторизацией и маршрутами сайта." },
    ],
  },
  {
    date: "November 4, 2026",
    label: "AI and security",
    title: "Smarter, safer learning",
    titleHy: "Ավելի խելացի և անվտանգ ուսուցում",
    titleRu: "Умнее и безопаснее",
    icon: Wrench,
    tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    items: [
      { emoji: "🔐", en: "Added sign-in verification for usage-metered AI requests.", hy: "Սահմանափակվող AI հարցումների համար ավելացվել է մուտքի ստուգում։", ru: "Добавлена проверка входа для запросов к ИИ с учётом лимитов." },
      { emoji: "🛡️", en: "Strengthened feedback and AI-chat authorization protections.", hy: "Ուժեղացվել է հետադարձ կապի և AI զրույցների թույլտվությունների ստուգումը։", ru: "Усилены проверки доступа к обратной связи и ИИ-чату." },
      { emoji: "🧠", en: "Expanded learning-focused tutor modes and reusable explanations.", hy: "Ընդլայնվել են AI ուսուցչի ուսումնական ռեժիմներն ու կրկնօգտագործվող բացատրությունները։", ru: "Расширены учебные режимы ИИ-репетитора и повторно используемые объяснения." },
      { emoji: "📊", en: "Introduced a more personal progress dashboard and tutor preferences.", hy: "Ավելացվել են անհատական առաջընթացի վահանակն ու ուսուցչի նախընտրությունները։", ru: "Добавлены персональная панель прогресса и настройки репетитора." },
    ],
  },
  {
    date: "November 3, 2026",
    label: "Flashcards and personalization",
    title: "Practice that adapts to you",
    titleHy: "Քեզ հարմարեցվող վարժանքներ",
    titleRu: "Упражнения под ваши цели",
    icon: Languages,
    tone: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    items: [
      { emoji: "🃏", en: "Swipe flashcards left for known words or right to review later.", hy: "Քարտերը սահեցրու ձախ՝ գիտեմ, աջ՝ հետո կրկնելու համար։", ru: "Смахивайте карточки влево, если знаете слово, или вправо для повтора." },
      { emoji: "🎮", en: "Added daily quests, achievements and study-goal features.", hy: "Ավելացվել են ամենօրյա առաջադրանքներ, նվաճումներ և ուսման նպատակներ։", ru: "Добавлены ежедневные задания, достижения и учебные цели." },
      { emoji: "📋", en: "Improved mistake review, older saved mistakes and personal study plans.", hy: "Բարելավվել են սխալների կրկնությունը, հին սխալների վերականգնումը և ուսման պլանը։", ru: "Улучшены повтор ошибок, восстановление старых ошибок и учебный план." },
      { emoji: "🛡️", en: "Fixed feedback access and forged AI role issues in code.", hy: "Կոդում շտկվել են հետադարձ կապի հասանելիության և AI դերերի անվտանգության խնդիրները։", ru: "В коде исправлены проблемы доступа к обратной связи и подмены ролей ИИ." },
      { emoji: "📱", en: "Improved responsive motion and added 34 adapted Biology III questions.", hy: "Բարելավվել է շարժական ինտերֆեյսը․ Կենսաբանության III մասում ավելացվել է 34 վերաշարադրված հարց։", ru: "Улучшен мобильный интерфейс; добавлены 34 адаптированных вопроса по биологии III." },
    ],
  },
  {
    date: "November 2, 2026",
    label: "Books and Android",
    title: "More material, better foundations",
    titleHy: "Ավելի շատ նյութեր և կայուն հիմք",
    titleRu: "Больше заданий и улучшенная основа",
    icon: BookOpen,
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    items: [
      { emoji: "🧬", en: "Integrated source text for 1,681 Biology III–IV questions; remaining items are tracked separately.", hy: "Ներմուծվել է Կենսաբանության III–IV մասերի 1 681 բնօրինակ հարցերի տեքստ․ մնացածները առանձին հաշվառվում են։", ru: "Импортированы тексты 1681 исходного вопроса биологии III–IV; остальные учитываются отдельно." },
      { emoji: "🗂️", en: "Added biology backlog audits and safer book-route handling.", hy: "Ավելացվել են կենսաբանության բացթողումների ստուգումն ու գրքերի երթուղիների պաշտպանությունը։", ru: "Добавлены проверка незавершённых заданий и защита маршрутов книг." },
      { emoji: "📱", en: "Prepared Android 0.3.2 localization, practice feedback and bookmark changes; APK release not confirmed.", hy: "Պատրաստվել են Android 0.3.2-ի թարգմանության, պատասխանների և էջանիշների փոփոխությունները․ APK-ի թողարկումը հաստատված չէ։", ru: "Подготовлены локализация, обратная связь и закладки Android 0.3.2; выпуск APK не подтверждён." },
      { emoji: "🔎", en: "Improved page titles, search and link-sharing descriptions.", hy: "Բարելավվել են էջերի վերնագրերն ու որոնման և հղումների նկարագրությունները։", ru: "Улучшены заголовки страниц и описания для поиска и ссылок." },
      { emoji: "⏳", en: "Started admin-reviewed stored explanations; student rollout was still pending.", hy: "Սկսվել է ստուգված բացատրությունների պահման համակարգը․ սովորողներին հասանելիությունը դեռ նախատեսվում էր։", ru: "Начата система проверенных объяснений; запуск для учеников ещё ожидался." },
    ],
  },
  {
    date: "November 1, 2026",
    label: "Study and app improvements",
    title: "A better learning experience",
    titleHy: "Ավելի հարմար ուսուցում",
    icon: BookOpen,
    tone: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    items: [
      { emoji: "📚", en: "Improved how books and practice questions load.", hy: "Բարելավվել է գրքերի և հարցերի բեռնումը։" },
      { emoji: "🎮", en: "Made practice games easier to use.", hy: "Ուսումնական խաղերից օգտվելն ավելի հարմար է դարձել։" },
      { emoji: "📱", en: "An Android test version is available to testers. A regular app update is still being prepared.", hy: "Փորձարկողների համար հասանելի է Android-ի փորձնական տարբերակը։ Սովորական թարմացումը դեռ պատրաստվում է։" },
      { emoji: "⏳", en: "We're still checking questions against the original books.", hy: "Դեռ ստուգում ենք հարցերը բնօրինակ գրքերի հետ։" },
    ],
  },
  {
    date: "October 29, 2026",
    label: "Study guides",
    title: "Clearer explanations",
    titleHy: "Ավելի հասկանալի բացատրություններ",
    icon: Sparkles,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    items: [
      { emoji: "🇬🇧", en: "Added more English grammar lessons with explanations.", hy: "Ավելացվել են անգլերենի քերականության նոր դասեր՝ բացատրություններով։" },
      { emoji: "🌍", en: "Study guides now include more Armenian, English, and Russian help.", hy: "Ուսումնական ձեռնարկներում ավելացել են հայերեն, անգլերեն և ռուսերեն բացատրությունները։" },
      { emoji: "🧮", en: "Added worked examples for some math topics.", hy: "Մաթեմատիկայի որոշ թեմաների համար ավելացվել են լուծված օրինակներ։" },
      { emoji: "⏳", en: "More question explanations are on the way.", hy: "Այլ հարցերի բացատրությունները դեռ պատրաստվում են։" },
    ],
  },
  {
    date: "October 26, 2026",
    label: "Dictionary and fixes",
    title: "More words to learn",
    titleHy: "Ավելի շատ բառեր սովորելու համար",
    icon: Languages,
    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    items: [
      { emoji: "📖", en: "Added over 1,100 English–Armenian dictionary entries.", hy: "Անգլերեն–հայերեն բառարանին ավելացվել է ավելի քան 1100 գրառում։" },
      { emoji: "🛠️", en: "Fixed some issues with practice tests and saving progress.", hy: "Ուղղվել են վարժանքների և առաջընթացի պահպանման որոշ խնդիրներ։" },
    ],
  },
  {
    date: "October 25, 2026",
    label: "Small improvements",
    title: "A smoother experience",
    titleHy: "Ավելի հարմար օգտագործում",
    icon: Wrench,
    tone: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    items: [
      { emoji: "📱", en: "Improved the layout on smaller screens.", hy: "Բարելավվել է կայքի տեսքը փոքր էկրանների վրա։" },
      { emoji: "⚡", en: "Worked on loading, study history, and games.", hy: "Բարելավվել են բեռնումը, ուսման պատմությունը և խաղերը։" },
      { emoji: "🧮", en: "Fixed a math-book issue. More math questions still need checking.", hy: "Ուղղվել է մաթեմատիկայի գրքի խնդիրներից մեկը։ Մնացած հարցերի ստուգումը շարունակվում է։" },
    ],
  },
  {
    date: "October 23, 2026",
    label: "Math books",
    title: "Improving math exercises",
    titleHy: "Մաթեմատիկայի վարժությունների բարելավում",
    icon: BookOpen,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    items: [
      { emoji: "✍️", en: "Started making math questions easier to read as text.", hy: "Սկսվել է մաթեմատիկայի հարցերը ընթեռնելի տեքստով ներկայացնելու աշխատանքը։" },
      { emoji: "⏳", en: "More exercises and answer checks are still needed.", hy: "Մնացած վարժություններն ու պատասխանները դեռ ստուգման կարիք ունեն։" },
    ],
  },
  {
    date: "October 20, 2026",
    label: "English learning",
    title: "More English practice",
    titleHy: "Անգլերենի ավելի շատ վարժանքներ",
    icon: Sparkles,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    items: [
      { emoji: "🎯", en: "Continued work on English level tests and vocabulary practice.", hy: "Շարունակվել է անգլերենի մակարդակի թեստերի և բառապաշարի վարժանքների աշխատանքը։" },
      { emoji: "⏳", en: "We're still checking the questions and answers.", hy: "Հարցերի և պատասխանների ստուգումը դեռ շարունակվում է։" },
    ],
  },
];

function ChangelogPage() {
  const lang = useLang();
  const en = lang === "en";
  const ru = lang === "ru";
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />{en ? "Back to home" : "Վերադառնալ գլխավոր էջ"}
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-primary/10 via-card to-violet-500/10 p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary">
            <Clock3 className="size-3.5" />{en ? "Project updates" : "Նախագծի թարմացումներ"}
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{en ? "What's new" : "Ի՞նչն է նոր"}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {en ? "See what has improved in Shtemarm, in simple words." : "Իմացիր՝ ինչն է փոխվել Shtemarm-ում՝ պարզ ու հասկանալի ձևով։"}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-xl border bg-background/75 px-3 py-2 text-sm font-bold">✨ {en ? "Feature updates" : "Նոր հնարավորություններ"}</span>
            <span className="rounded-xl border bg-background/75 px-3 py-2 text-sm font-bold">🛠️ {en ? "Fixes" : "Շտկումներ"}</span>
            <span className="rounded-xl border bg-background/75 px-3 py-2 text-sm font-bold">📈 {en ? "Progress tracking" : "Առաջընթացի հետևում"}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border bg-card p-4">
          <p className="text-sm font-semibold text-muted-foreground">{en ? "New dictionary entries" : "Բառարանի նոր գրառումներ"}</p>
          <p className="mt-1 text-3xl font-black tabular-nums">+1,104</p>
          <p className="mt-1 text-xs text-muted-foreground">{en ? "Committed on Oct 26" : "Commit՝ հոկտեմբերի 26-ին"}</p>
        </article>
        <article className="rounded-2xl border bg-card p-4">
          <p className="text-sm font-semibold text-muted-foreground">{en ? "English books" : "Անգլերենի գրքեր"}</p>
          <p className="mt-1 text-3xl font-black">3</p>
          <p className="mt-1 text-xs text-muted-foreground">{en ? "Coverage audit still needed" : "Ծածկույթի ստուգումը դեռ պետք է"}</p>
        </article>
        <article className="rounded-2xl border bg-card p-4">
          <p className="text-sm font-semibold text-muted-foreground">{en ? "Status" : "Կարգավիճակ"}</p>
          <p className="mt-1 text-xl font-black">{en ? "In progress" : "Ընթացքի մեջ"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{en ? "More words are being checked" : "Բառերի ստուգումը շարունակվում է"}</p>
        </article>
      </section>

      <section className="space-y-5">
        {updates.map((update, index) => {
          const Icon = update.icon;
          return (
            <article key={update.date} className="relative grid gap-4 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-6">
              <div className="pt-2 sm:text-right">
                <p className="text-sm font-black">{update.date}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{en ? update.label : ru ? update.titleRu ?? update.title : index === 0 ? "Վերջին թարմացում" : update.titleHy}</p>
              </div>
              <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${update.tone}`}><Icon className="size-5" /></span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-black sm:text-xl">{en ? update.title : ru ? update.titleRu ?? update.title : update.titleHy}</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{en ? "Update log" : "Փոփոխությունների մատյան"}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-3">
                  {update.items.map((item) => (
                    <li key={item.en} className="flex gap-3 text-sm leading-relaxed sm:text-[15px]">
                      <span className="mt-0.5 shrink-0 text-base" aria-hidden="true">{item.emoji}</span>
                      <span>{en ? item.en : ru ? item.ru ?? item.en : item.hy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-dashed p-5 text-sm leading-relaxed text-muted-foreground">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <p>{en ? "These are GitHub development updates, not a guarantee of a live website or APK release. Changes still in Draft are explicitly marked." : ru ? "Это обновления разработки на GitHub, а не подтверждение выпуска сайта или APK. Изменения в Draft отмечены отдельно." : "Սրանք GitHub-ի զարգացման թարմացումներն են, ոչ թե կայքի կամ APK-ի հրապարակման հաստատում։ Draft փոփոխությունները նշված են առանձին։"}</p>
        </div>
      </section>
    </main>
  );
}
