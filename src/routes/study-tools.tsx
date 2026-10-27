import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Timer, BookOpen, ClipboardList, Layers, Gamepad2, Languages, Headphones } from "lucide-react";
import { StudyTools } from "@/components/StudyTools";
import { useTx } from "@/lib/lang";
import { STUDY_MUSIC_OPEN_EVENT } from "@/lib/study-music";

export const Route = createFileRoute("/study-tools")({
  head: () => ({ meta: [
    { title: "Shtemarm · Ուսումնական գործիքներ" },
    { name: "description", content: "Կենտրոնացման ժամանակաչափ և անհատական ուսումնական գործիքներ։" },
  ] }),
  component: StudyToolsPage,
});

function StudyToolsPage() {
  const tx = useTx();
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />{tx("Գլխավոր էջ")}
      </Link>
      <header className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary"><Timer className="size-4" />{tx("Ուսումնական կենտրոն")}</span>
        <h1 className="text-3xl font-black sm:text-4xl">{tx("Կենտրոնացում և առաջընթաց")}</h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{tx("Օգտագործիր ժամանակաչափը, հետևիր պատասխաններիդ և միացրու կենտրոնացման ռեժիմը՝ ուսման ընթացքում շեղումները նվազեցնելու համար։")}</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {to:"/assessment-builder",title:"Թեմատիկ և ամփոփիչ աշխատանքներ",desc:"Կազմել, տպել կամ լուծել առցանց",Icon:ClipboardList},
          {to:"/flashcards",title:"Հիշողության քարտեր",desc:"Կրկնել տերմինները և թեմաները",Icon:Layers},
          {to:"/mini-games",title:"Մինի խաղեր",desc:"Արագ հարցեր, ճիշտ/սխալ, համապատասխանեցում",Icon:Gamepad2},
          {to:"/vocabulary",title:"Իմ բառապաշարը",desc:"Սովորել և կրկնել բառերը",Icon:Languages},
        ].map(item=><Link key={item.to} to={item.to} className="group flex items-start gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/40">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><item.Icon className="size-5"/></span>
          <span><span className="block font-bold">{tx(item.title)}</span><span className="mt-1 block text-sm text-muted-foreground">{tx(item.desc)}</span></span>
        </Link>)}
      </div>
      <section className="flex flex-col gap-3 rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between" aria-label={tx("Երաժշտություն՝ սովորելիս")}>
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Headphones className="size-6" />
          </span>
          <div>
            <h2 className="font-black">{tx("Երաժշտություն՝ սովորելիս")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {tx("Spotify · lo-fi, բնության և անձրևի ձայներ, Naré – BOO!։ Միացրու միայն ցանկության դեպքում։")}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => window.dispatchEvent(new Event(STUDY_MUSIC_OPEN_EVENT))}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90">
          <Headphones className="size-4" />{tx("Ընտրել երաժշտություն")}
        </button>
      </section>
      <StudyTools />
      <Link to="/" className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-bold transition-colors hover:bg-muted"><BookOpen className="size-4" />{tx("Ընտրել շտեմարան")}</Link>
    </div>
  );
}
