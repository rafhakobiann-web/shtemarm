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
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{en ? update.label : index === 0 ? "Վերջին թարմացում" : update.titleHy}</p>
              </div>
              <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${update.tone}`}><Icon className="size-5" /></span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-black sm:text-xl">{en ? update.title : update.titleHy}</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{en ? "Update log" : "Փոփոխությունների մատյան"}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-3">
                  {update.items.map((item) => (
                    <li key={item.en} className="flex gap-3 text-sm leading-relaxed sm:text-[15px]">
                      <span className="mt-0.5 shrink-0 text-base" aria-hidden="true">{item.emoji}</span>
                      <span>{en ? item.en : item.hy}</span>
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
          <p>{en ? "Some improvements are still being tested. We will mark them as complete when they are ready." : "Որոշ բարելավումներ դեռ փորձարկվում են։ Ավարտված կնշենք, երբ պատրաստ լինեն։"}</p>
        </div>
      </section>
    </main>
  );
}
