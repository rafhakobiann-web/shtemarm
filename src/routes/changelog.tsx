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
    label: "Android beta and book stability",
    title: "Android Beta 4 and more reliable book progress",
    titleHy: "Android Beta 4 և շտեմարանների առաջընթացի ճշգրտում",
    icon: BookOpen,
    tone: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    items: [
      { emoji: "📱", en: "Android 0.3.0 Beta 4 is available as a private debug-signed test release, not a Play Store or guaranteed in-place update.", hy: "Android 0.3.0 Beta 4-ը հասանելի է որպես GitHub-ի փակ փորձնական տարբերակ, ոչ թե Play Store-ի թողարկում կամ երաշխավորված տեղային թարմացում։" },
      { emoji: "✅", en: "Merged improvements include Android loading/cancellation, English numbered-gap safeguards and mini-game controls. Full book verification is not complete.", hy: "Միավորվել են Android-ի բեռնման ու ընդհատման, անգլերենի համարակալված բացթողումների ստուգման և մինի խաղերի բարելավումները։ Գրքերի ամբողջական ստուգումը դեռ ավարտված չէ։" },
      { emoji: "🔍", en: "Book progress now counts repeated printed question numbers independently; the website update depends on deployment.", hy: "Շտեմարանների առաջընթացի հաշվարկը տարբերակում է կրկնվող տպագիր հարցահամարները․ կայքում հասանելիությունը կախված է նոր տարբերակի տեղակայումից։" },
      { emoji: "📚", en: "Source-book transcription and edition checking are continuing; authored practice is not represented as an official original book.", hy: "Բնօրինակ գրքերի թվայնացումն ու հրատարակությունների համեմատությունը շարունակվում են․ հեղինակային վարժանքները չեն ներկայացվում որպես պաշտոնական բնօրինակ։" },
      { emoji: "📝", en: "The next website update adds one-tap book refresh, clearer loading errors and a way to report a source mismatch with book/page/question details.", hy: "Կայքի նոր տարբերակը նախատեսում է գրքի ձեռքով վերաբեռնում, պարզ սխալների հաղորդագրություններ և գիրք/էջ/հարց համարով անհամապատասխանություն հայտնելու հղում։" },
    ],
  },
  {
    date: "October 29, 2026",
    label: "Latest update",
    title: "Smarter study guides and personalization",
    titleHy: "Ուսումնական ձեռնարկների և անհատականացման բարելավումներ",
    icon: Sparkles,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    items: [
      { emoji: "📚", en: "Added eight English grammar topics with Armenian, English and Russian explanations (PR #92).", hy: "Ավելացվել է անգլերենի քերականության 8 նոր թեմա՝ հայերեն, անգլերեն և ռուսերեն բացատրություններով (PR #92)։" },
      { emoji: "🧠", en: "Added step-by-step reasoning, comparisons and common pitfalls for these eight topics (PR #93).", hy: "Այդ 8 թեմաների համար ավելացվել են քայլ առ քայլ բացատրություններ, համեմատություններ և տարածված սխալներ (PR #93)։" },
      { emoji: "🧮", en: "Added two original worked math lessons on the website and six offline math reference topics in the Android code (PR #94).", hy: "Կայքում ավելացվել են մաթեմատիկայի 2 լուծված դաս, իսկ Android հավելվածի կոդում՝ 6 նոր թեմա (PR #94)։" },
      { emoji: "🎨", en: "Added a local-only username setting and simplified handbook subtitles. Public leaderboard is not live yet (PR #94).", hy: "Ավելացվել է սարքում պահպանվող օգտանուն և պարզեցվել են ձեռնարկների ենթավերնագրերը։ Հանրային վարկանիշը դեռ գործարկված չէ (PR #94)։" },
      { emoji: "📱", en: "Merged a mobile horizontal-overflow layout fix; visual verification on devices is still needed (PR #91).", hy: "Միավորվել է բջջային էջի հորիզոնական լայնության շտկումը․ անհրաժեշտ է ստուգել իրական սարքերով (PR #91)։" },
      { emoji: "⏳", en: "Still in progress: verified explanations for every book question, a secure opt-in leaderboard, and a signed Android update.", hy: "Դեռ ընթացքի մեջ են բոլոր առաջադրանքների ստուգված բացատրությունները, անվտանգ կամավոր վարկանիշը և ստորագրված Android թարմացումը։" },
    ],
  },
  {
    date: "October 26, 2026",
    label: "Vocabulary expansion",
    title: "Vocabulary expansion",
    titleHy: "Բառապաշարի ընդլայնում",
    icon: Languages,
    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    items: [
      { emoji: "📚", en: "Added 1,104 English–Armenian vocabulary entries across two commits (649 + 455).", hy: "Երկու commit-ով ավելացվել է անգլերեն-հայերեն բառարանի 1,104 նոր գրառում (649 + 455)։" },
      { emoji: "🧹", en: "Kept existing dictionary keys out of the additions to reduce duplicate entries.", hy: "Նոր գրառումները ավելացնելիս խուսափել ենք բառարանում արդեն առկա բանալիների կրկնությունից։" },
      { emoji: "🛠️", en: "Fixed generated-test ordering and made progress persistence resilient to browser-storage and remote-sync failures.", hy: "Ուղղվել է կազմվող թեստերի հարցերի հերթականությունը, իսկ առաջընթացի պահպանումը պաշտպանվել է դիտարկչի պահեստավորման և հեռավար համաժամացման խափանումներից։" },
      { emoji: "🧪", en: "Added scoring regression tests for multiple-choice, numeric, set, sequence and matching answers; execution still needs a successful build/test run.", hy: "Ավելացվել են բազմընտրանի, թվային, բազմության, հաջորդականության և համապատասխանեցման պատասխանների ստուգողական թեստեր․ դրանք գործարկելու համար դեռ պետք է հաջող build/test։" },
      { emoji: "🔎", en: "Next: compare all three English books against the dictionary and verify the exact remaining word count.", hy: "Հաջորդը՝ համեմատել անգլերենի երեք գրքերը բառարանի հետ և ճշտել չթարգմանված բառերի իրական քանակը։" },
    ],
  },
  {
    date: "October 25, 2026",
    label: "Platform improvements",
    title: "Usability, loading, and math fixes",
    titleHy: "Հարմարավետության, բեռնման և մաթեմատիկայի շտկումներ",
    icon: Wrench,
    tone: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    items: [
      { emoji: "📱", en: "Homepage and mobile-layout redesign work was recorded in the recent change set.", hy: "Վերջին փոփոխությունների ընթացքում կատարվել են գլխավոր էջի և բջջային դասավորության վերափոխման աշխատանքներ։" },
      { emoji: "⚡", en: "Loading/history and mini-game improvements were included in the recent pull-request work.", hy: "Վերջին pull request-երում ներառվել են բեռնման, պատմության և մինի խաղերի բարելավումներ։" },
      { emoji: "🛠️", en: "A math-books crash fix was recorded; broader math question coverage and answer verification remain in progress.", hy: "Գրանցվել է մաթեմատիկայի գրքերի խափանման շտկում․ առաջադրանքների ամբողջական ծածկույթն ու պատասխանների ստուգումը դեռ ընթացքի մեջ են։" },
    ],
  },
  {
    date: "October 23, 2026",
    label: "Content work",
    title: "Math-book reconstruction",
    titleHy: "Մաթեմատիկայի գրքերի վերակազմավորում",
    icon: BookOpen,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    items: [
      { emoji: "✍️", en: "Started replacing screenshot-based math material with selectable text recreated from the supplied books.", hy: "Սկսվել է մաթեմատիկայի՝ նկարների վրա հիմնված նյութերը գրքերից վերակազմված ընտրելի տեքստով փոխարինելու աշխատանքը։" },
      { emoji: "🧮", en: "The first reconstructed task was committed; full exercise coverage and official-answer checks are still pending.", hy: "Commit է արվել վերակազմված առաջին առաջադրանքը․ բոլոր վարժությունների ներառումն ու պաշտոնական պատասխանների ստուգումը դեռ առջևում են։" },
    ],
  },
  {
    date: "October 20, 2026",
    label: "Learning experience",
    title: "English practice tools",
    titleHy: "Անգլերենի ուսուցման գործիքներ",
    icon: Sparkles,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    items: [
      { emoji: "🎯", en: "Configurable A1–C1 level-test work and English-to-Armenian vocabulary support are part of the current platform direction.", hy: "A1–C1 մակարդակների կարգավորվող թեստերն ու անգլերենից հայերեն բառային աջակցությունը հարթակի զարգացման ընթացիկ ուղղություններից են։" },
      { emoji: "🧪", en: "Question/answer integrity, exam-format validation, and reliable AI explanation caching still need further verification.", hy: "Հարցերի ու պատասխանների ճշտությունը, քննության ձևաչափի վավերացումը և AI բացատրությունների հուսալի քեշավորումը դեռ լրացուցիչ ստուգման կարիք ունեն։" },
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
            {en ? "A transparent timeline of Shtemarm improvements, fixes, and work still in progress." : "Shtemarm-ի բարելավումների, շտկումների և դեռ ընթացքի մեջ գտնվող աշխատանքների թափանցիկ ժամանակագրություն։"}
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
          <p className="mt-1 text-xs text-muted-foreground">{en ? "Entries added ≠ all words verified" : "Նոր գրառումները դեռ ամբողջական ստուգում չեն նշանակում"}</p>
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
          <p>{en ? "We mark unfinished work as in progress rather than presenting it as complete. Dates summarize recorded project work; they are not a guarantee that every feature is fully verified." : "Չավարտված աշխատանքները նշվում են որպես ընթացքի մեջ, այլ ոչ թե ներկայացվում ավարտված։ Ամսաթվերը ամփոփում են գրանցված աշխատանքը և չեն նշանակում, որ յուրաքանչյուր գործառույթ ամբողջությամբ ստուգված է։"}</p>
        </div>
      </section>
    </main>
  );
}
