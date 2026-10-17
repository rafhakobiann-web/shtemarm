import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Trophy } from "lucide-react";
import { BOOKS } from "@/lib/books";
import { Button } from "@/components/ui/button";
import { useProgress, level, levelFloor } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Շտեմարան · Անգլերենի միասնական քննության պատրաստում" },
      { name: "description", content: "Անգլերենի շտեմարանի 1, 2, 3 մասերի բոլոր առաջադրանքները՝ ուսուցում, թեստեր և 80 հարցանոց քննություն։" },
      { property: "og:title", content: "Շտեմարան · English" },
      { property: "og:description", content: "Սովորեք, խաղացեք և ստուգեք ձեզ միասնական քննության իրական առաջադրանքներով։" },
    ],
  }),
  component: Index,
});

const COUNTS: Record<number, number> & Record<1 | 2 | 3, number> = { 1: 1586, 2: 1466, 3: 1225 };

function Index() {
  const p = useProgress();
  const lv = level(p.xp);
  const pct = Math.min(100, ((p.xp - levelFloor(lv)) / (levelFloor(lv + 1) - levelFloor(lv))) * 100);
  const done = Object.keys(p.answers).length;
  return (
    <div className="space-y-10">
      <section className="bg-hero relative overflow-hidden rounded-3xl p-6 text-primary-foreground sm:p-10 lg:p-12">
        <div className="pointer-events-none absolute -right-10 top-1/2 hidden -translate-y-1/2 xl:flex">
          {BOOKS.map((b, i) => (
            <img
              key={b.id}
              src={b.cover}
              alt=""
              className="shadow-card -ml-16 w-40 rounded-xl border-4 border-primary-foreground/30 object-cover"
              style={{ transform: `rotate(${(i - 1) * 8}deg) translateY(${i === 1 ? -12 : 10}px)` }}
            />
          ))}
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <p className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Միասնական քննություն · Անգլերեն</p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Պատրաստվիր քննությանը խաղալով</h1>
          <p className="max-w-xl text-base opacity-90 sm:text-lg">
            Շտեմարանի բոլոր 13 բաժինները, պաշտոնական պատասխաններն ու յուրաքանչյուր պատասխանի բացատրությունը։
          </p>
        </div>
        <div className="relative z-10 mt-6 grid max-w-xl grid-cols-3 gap-3">
          <Stat label="Մակարդակ" value={lv} />
          <Stat label="Պատասխանված" value={done} />
          <Stat label="Օրեր անընդմեջ" value={p.streak} />
        </div>
        <div className="relative z-10 mt-4 h-2 max-w-xl overflow-hidden rounded-full bg-primary-foreground/25">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-xl font-bold sm:text-2xl">Ընտրիր շտեմարանը</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BOOKS.map((b) => {
            const mine = Object.keys(p.answers).filter((k) => k.startsWith(`${b.id}-`)).length;
            return (
              <Link
                key={b.id}
                to="/book/$bookId"
                params={{ bookId: String(b.id) }}
                className="shadow-card group overflow-hidden rounded-2xl border bg-card transition-transform hover:-translate-y-1"
              >
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-1 sm:p-0">
                  <img src={b.cover} alt={`${b.title} շապիկ`} loading="lazy" className="aspect-[3/4] w-full rounded-lg object-cover sm:aspect-[16/10] sm:rounded-none sm:object-top" />
                  <div className="min-w-0 space-y-2 sm:p-5">
                    <h3 className="text-lg font-bold">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.sub} · {COUNTS[b.id]} հարց</p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-success" style={{ width: `${Math.min(100, (mine / COUNTS[b.id]) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{mine} / {COUNTS[b.id]} արված</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="shadow-card grid gap-4 rounded-3xl border bg-card p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <h2 className="text-xl font-bold">Թեստ բոլոր շտեմարաններից</h2>
          <p className="text-sm text-muted-foreground">Հարցեր երեք գրքերից միասին՝ քննություն կամ ըստ բաժինների։</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="game" size="lg" asChild>
            <Link to="/test/$bookId" params={{ bookId: "all" }} search={{ mode: "exam", style: "classic" }}>
              <Trophy /> Քննություն (80)
            </Link>
          </Button>
          <Button variant="sun" size="lg" asChild>
            <Link to="/test/$bookId" params={{ bookId: "all" }} search={{ mode: "custom", style: "game" }}>
              <GraduationCap /> Կազմել թեստ
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Feature icon={<BookOpen />} title="Ուսուցում" text="Խաղային կամ դասական ռեժիմ՝ ըստ բաժինների։" />
        <Feature icon={<GraduationCap />} title="Թեստեր" text="Ընտրիր բաժինները և հարցերի քանակը։" />
        <Feature icon={<Trophy />} title="80 հարցանոց քննություն" text="Իրական քննության կառուցվածքով։" />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-primary-foreground/15 p-3">
      <p className="font-display text-2xl font-black">{value}</p>
      <p className="text-xs opacity-85">{label}</p>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border bg-card p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">{icon}</span>
      <div className="min-w-0">
        <h3 className="text-base font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
