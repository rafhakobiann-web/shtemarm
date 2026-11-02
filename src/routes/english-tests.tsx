import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Brain, ClipboardCheck, GraduationCap, Sparkles, Trophy } from "lucide-react";
import { BOOKS } from "@/lib/books";
import { ENGLISH_LEVELS } from "@/lib/levelTests";

export const Route = createFileRoute("/english-tests")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Անգլերենի թեստեր · Shtemarm" },
      {
        name: "description",
        content:
          "Անգլերենի թեստեր և վարժանքներ՝ երեք շտեմարանների բոլոր բաժիններից, մակարդակի ստուգում A1–C1 և քննության կազմիչ՝ մինչև 80 առաջադրանքով։",
      },
      { property: "og:title", content: "Անգլերենի թեստեր · Shtemarm" },
      {
        property: "og:description",
        content:
          "Լուծիր անգլերենի թեստեր շտեմարանների բոլոր բաժիններից, ստուգիր մակարդակդ և կազմիր քննություն։",
      },
      { property: "og:url", content: "https://shtemarm.lovable.app/english-tests" },
    ],
    links: [{ rel: "canonical", href: "https://shtemarm.lovable.app/english-tests" }],
  }),
  component: EnglishTestsPage,
});

const CARD =
  "group flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function CardIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-10 place-items-center rounded-xl border border-primary/10 bg-primary/10 text-primary">
      {children}
    </span>
  );
}

function EnglishTestsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 py-6">
      <div className="space-y-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Գլխավոր էջ
        </Link>
        <h1 className="text-3xl font-black sm:text-4xl">Անգլերենի թեստեր</h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          Այստեղ հավաքված են Shtemarm-ի անգլերենի բոլոր թեստային գործիքները՝ երեք շտեմարանների
          վարժանքները ըստ բաժինների, մակարդակի ստուգումը A1-ից C1 և քննության կազմիչը։
          Ընտրիր, թե որտեղից ուզում ես սկսել։
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-black sm:text-2xl">Շտեմարանների թեստեր</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Յուրաքանչյուր գիրք բաժանված է 13 բաժնի՝ տեքստային հարցեր, քերականություն, բառապաշար,
          երկխոսություններ և այլն։ Կարող ես ուսումնասիրել բացատրություններով կամ անցնել թեստ՝
          ըստ քո ընտրած հարցերի քանակի։
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {BOOKS.map((b) => (
            <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={CARD}>
              <CardIcon>
                <BookOpen className="size-5" />
              </CardIcon>
              <div className="space-y-1">
                <h3 className="font-black leading-snug">{b.title}</h3>
                <p className="text-xs text-muted-foreground">{b.sub} · 13 բաժին · ուսումնասիրում և թեստ</p>
              </div>
              <span aria-hidden="true" className="mt-auto flex justify-end text-primary">
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black sm:text-2xl">Մակարդակի ստուգում</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ընդհանուր տեղաբաշխման թեստը գնահատում է անգլերենի մոտավոր մակարդակդ A1–C1 սանդղակով,
          իսկ առանձին մակարդակների թեստերը թույլ են տալիս թիրախային մարզվել։
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/level-test/$level" params={{ level: "placement" }} className={CARD}>
            <CardIcon>
              <Brain className="size-5" />
            </CardIcon>
            <div className="space-y-1">
              <h3 className="font-black leading-snug">Ընդհանուր մակարդակի թեստ</h3>
              <p className="text-xs text-muted-foreground">25 հարց · A1–C1 · մոտավոր գնահատում</p>
            </div>
            <span aria-hidden="true" className="mt-auto flex justify-end text-primary">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          {ENGLISH_LEVELS.map((l) => (
            <Link key={l.id} to="/level-test/$level" params={{ level: l.id }} className={CARD}>
              <CardIcon>
                <GraduationCap className="size-5" />
              </CardIcon>
              <div className="space-y-1">
                <h3 className="font-black leading-snug">{l.title} մակարդակի թեստ</h3>
                <p className="text-xs text-muted-foreground">{l.description}</p>
              </div>
              <span aria-hidden="true" className="mt-auto flex justify-end text-primary">
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black sm:text-2xl">Քննություն և լրացուցիչ գործիքներ</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/exam/$subject" params={{ subject: "english" }} className={CARD}>
            <CardIcon>
              <Trophy className="size-5" />
            </CardIcon>
            <div className="space-y-1">
              <h3 className="font-black leading-snug">Քննության կազմիչ</h3>
              <p className="text-xs text-muted-foreground">
                Կազմիր թեստ՝ ընտրելով բաժինները և հարցերի քանակը, կամ անցիր 80 առաջադրանքով
                ամբողջական քննության ձևաչափով տարբերակը։
              </p>
            </div>
            <span aria-hidden="true" className="mt-auto flex justify-end text-primary">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link to="/english-grammar" className={CARD}>
            <CardIcon>
              <ClipboardCheck className="size-5" />
            </CardIcon>
            <div className="space-y-1">
              <h3 className="font-black leading-snug">Քերականական ձեռնարկ</h3>
              <p className="text-xs text-muted-foreground">
                Կանոններ և բացատրություններ հայերեն, անգլերեն և ռուսերեն՝ բոլոր 13 բաժինների համար։
              </p>
            </div>
            <span aria-hidden="true" className="mt-auto flex justify-end text-primary">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link to="/vocabulary" className={CARD}>
            <CardIcon>
              <Sparkles className="size-5" />
            </CardIcon>
            <div className="space-y-1">
              <h3 className="font-black leading-snug">Բառապաշար</h3>
              <p className="text-xs text-muted-foreground">
                Շտեմարանների բառերը հայերեն թարգմանություններով՝ ըստ գրքերի և բաժինների։
              </p>
            </div>
            <span aria-hidden="true" className="mt-auto flex justify-end text-primary">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link to="/flashcards" className={CARD}>
            <CardIcon>
              <BookOpen className="size-5" />
            </CardIcon>
            <div className="space-y-1">
              <h3 className="font-black leading-snug">Քարտերով կրկնություն</h3>
              <p className="text-xs text-muted-foreground">
                Կրկնիր բառերն ու արտահայտությունները փոխգործուն քարտերով։
              </p>
            </div>
            <span aria-hidden="true" className="mt-auto flex justify-end text-primary">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
