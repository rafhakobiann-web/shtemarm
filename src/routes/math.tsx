import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ClipboardCheck, ExternalLink, GraduationCap } from "lucide-react";
import { MATH_BOOKS, MATH_QUESTIONS } from "@/lib/mathQuestions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/math")({
  head: () => ({ meta: [
    { title: "Մաթեմատիկա · Shtemarm" },
    { name: "description", content: "Մաթեմատիկայի երկու շտեմարան և քննության ձևաչափով ինքնաստուգման թեստ։" },
  ] }),
  component: MathHome,
});

function MathHome() {
  return <div className="mx-auto max-w-6xl space-y-8">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Գլխավոր էջ</Link>
    <section className="bg-hero rounded-3xl p-6 text-primary-foreground sm:p-10">
      <p className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground"><GraduationCap className="size-4" /> Միասնական քննություն · Մաթեմատիկա</p>
      <h1 className="mt-4 text-3xl font-black sm:text-4xl">Պատրաստվիր մաթեմատիկայի քննությանը</h1>
      <p className="mt-3 max-w-2xl opacity-90">Ընտրիր երկու պաշտոնական շտեմարաններից մեկը կամ փորձիր նոր կազմվող ինքնաստուգման թեստը։ Հարցերը Shtemarm-ի համար կազմված բնօրինակ առաջադրանքներ են՝ շտեմարանների թեմաներով և 2026 թ. քննության խմբավորված կառուցվածքի օրինակով։</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold sm:text-2xl">Ընտրիր շտեմարանը</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {MATH_BOOKS.map((book) => {
          const count = MATH_QUESTIONS.filter((q) => q.book === book.id).length;
          return <article key={book.id} className="shadow-card overflow-hidden rounded-2xl border bg-card">
            <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:p-5">
              <img src={book.cover} alt={`${book.title} շապիկ`} className="aspect-[3/4] w-full rounded-lg object-cover" loading="lazy" />
              <div className="flex min-w-0 flex-col items-start gap-2">
                <h3 className="text-lg font-bold">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.subtitle}</p>
                <p className="text-sm">{count} փորձնական հարց · թեմատիկ օրինակներ</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Button asChild><Link to="/math-test" search={{ book: book.id === 1 ? "1" : "2" }}>Սկսել հարցերը <BookOpen className="size-4" /></Link></Button>
                  <Button variant="outline" asChild><a href={book.source} target="_blank" rel="noreferrer">Պաշտոնական էջ <ExternalLink className="size-4" /></a></Button>
                  <Button variant="ghost" asChild><a href={book.pdf} target="_blank" rel="noreferrer">PDF</a></Button>
                </div>
              </div>
            </div>
          </article>;
        })}
      </div>
    </section>
    <section className="shadow-card flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div><h2 className="text-xl font-bold">Քննության ձևաչափով փորձնական թեստ</h2><p className="mt-1 text-sm text-muted-foreground">Երկու շտեմարանների թեմաներից կազմված հարցեր, կարճ պատասխաններ, տարբերակների ընտրություն և բացատրություններ։</p></div>
      <Button size="lg" variant="sun" asChild><Link to="/math-test" search={{ book: "all" }}><ClipboardCheck className="size-4" /> Սկսել թեստը</Link></Button>
    </section>
    <p className="text-xs text-muted-foreground">Նշում․ ներկայիս հարցերը Shtemarm-ի համար կազմված ուսումնական օրինակներ են՝ շտեմարանների թեմաների հիման վրա, ոչ թե երկու գրքերի բոլոր առաջադրանքների ամբողջական թվայնացված բանկ։ 65 հարցանոց քննության թեմատիկ բաշխումը մնում է նույնը, իսկ ընտրված հարցերը փոխվում են ամեն նոր փորձի ժամանակ։</p>
  </div>;
}
