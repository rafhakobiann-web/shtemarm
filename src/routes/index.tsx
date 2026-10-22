import { createFileRoute, Link } from "@tanstack/react-router";
import { BOOKS } from "@/lib/books";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Շտեմարան · Ընտրիր առարկան" },
      { name: "description", content: "Ընտրիր շտեմարանը սկսելու համար կամ անցիր քննություն՝ անգլերեն, մաթեմատիկա և այլ առարկաներ։" },
      { property: "og:title", content: "Շտեմարան" },
      { property: "og:description", content: "Ուսուցում և քննություններ՝ ըստ առարկաների։" },
    ],
  }),
  component: Index,
});

const CHIP =
  "inline-flex h-11 items-center justify-center rounded-xl border-2 border-border bg-background px-4 text-sm font-bold transition hover:border-primary/40 hover:bg-muted/40";

function SubjectCard({ title, children, disabled }: { title: string; children?: React.ReactNode; disabled?: boolean }) {
  return (
    <div className="shadow-card flex flex-col gap-4 rounded-2xl border bg-card p-5">
      <h3 className="text-lg font-black">{title}</h3>
      {disabled ? (
        <p className="text-sm text-muted-foreground">Շուտով</p>
      ) : (
        <div className="flex flex-wrap gap-2">{children}</div>
      )}
    </div>
  );
}

function Index() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 py-4">
      <section className="space-y-4">
        <h2 className="text-xl font-black sm:text-2xl">Ընտրիր շտեմարանը սկսելու համար</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SubjectCard title="Անգլերեն">
            {BOOKS.map((b) => (
              <Link key={b.id} to="/book/$bookId" params={{ bookId: String(b.id) }} className={CHIP}>
                {b.title}
              </Link>
            ))}
          </SubjectCard>
          <SubjectCard title="Մաթեմատիկա">
            <a href="/math/books?book=matem-1" className={CHIP}>Մաս 1</a>
            <a href="/math/books?book=matem-2" className={CHIP}>Մաս 2</a>
          </SubjectCard>
          <SubjectCard title="Հայոց պատմություն">
            <Link to="/history" className={CHIP}>Շտեմարան</Link>
          </SubjectCard>
          <SubjectCard title="Հայոց լեզու" disabled />
          <SubjectCard title="Կենսաբանություն" disabled />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black sm:text-2xl">Քննություն</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SubjectCard title="Անգլերեն">
            <Link to="/test/$bookId" params={{ bookId: "all" }} search={{ mode: "exam", style: "classic" }} className={CHIP}>
              80 հարց
            </Link>
          </SubjectCard>
          <SubjectCard title="Մաթեմատիկա">
            <Link to="/math" className={CHIP}>65 հարց</Link>
          </SubjectCard>
          <SubjectCard title="Հայոց պատմություն">
            <Link to="/history" className={CHIP}>Թեստեր</Link>
          </SubjectCard>
          <SubjectCard title="Հայոց լեզու" disabled />
          <SubjectCard title="Կենսաբանություն" disabled />
        </div>
      </section>
    </div>
  );
}
