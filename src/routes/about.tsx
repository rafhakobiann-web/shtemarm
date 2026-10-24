import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, HeartHandshake, MessageCircle, Target } from "lucide-react";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "Shtemarm · Մեր մասին" },
    { name: "description", content: "Shtemarm-ի նպատակը, ուսումնական գործիքներն ու կապը նախագծի հետ։" },
  ] }),
  component: AboutPage,
});

function AboutPage() {
  const tx = useTx();
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />{tx("Գլխավոր էջ")}</Link>
      <header className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary"><BookOpen className="size-4" />Shtemarm</span>
        <h1 className="text-3xl font-black sm:text-4xl">{tx("Մեր մասին")}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{tx("Մեկ վայր՝ շտեմարանների, վարժությունների և քննություններին պատրաստվելու համար։")}</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-3xl border bg-card p-5 sm:p-6">
          <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Target className="size-5" /></span>
          <h2 className="text-lg font-black">{tx("Մեր նպատակը")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tx("Քննությանը պատրաստվելը դարձնել ավելի կազմակերպված՝ նյութերը, հարցերը և թեստերը մեկ հարմար միջավայրում հավաքելով։")}</p>
        </article>
        <article className="rounded-3xl border bg-card p-5 sm:p-6">
          <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><HeartHandshake className="size-5" /></span>
          <h2 className="text-lg font-black">{tx("Ինչպես է օգնում Shtemarm-ը")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tx("Կարող ես աշխատել ըստ բաժինների, փորձել քննության ձևաչափով թեստեր և հետևել քո առաջընթացին։ Եթե նկատում ես սխալ, խնդրում ենք հայտնել մեզ։")}</p>
        </article>
      </section>
      <section className="rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-black">{tx("Նախագծի հեղինակը")}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{tx("Shtemarm-ը ստեղծվել է աշակերտների համար՝ քննություններին պատրաստվելն ավելի մատչելի և հարմար դարձնելու նպատակով։ Նախագիծը շարունակաբար զարգացվում է, և օգտատերերի առաջարկները օգնում են որոշել հաջորդ բարելավումները։")}</p>
        <a href="https://www.tiktok.com/@shtemarm_official" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"><MessageCircle className="size-4" />@shtemarm_official</a>
      </section>
      <Link to="/feedback" className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-bold transition-colors hover:bg-muted"><MessageCircle className="size-4" />{tx("Կապ մեզ հետ")}</Link>
    </div>
  );
}
