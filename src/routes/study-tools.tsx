import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ClipboardList, Layers, Gamepad2, Languages } from "lucide-react";
import { StudyTools } from "@/components/StudyTools";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/study-tools")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Shtemarm · Ուսումնական գործիքներ" },
    { name: "description", content: "Ուսումնական առաջընթացի տվյալներ և անհատական ուսումնական գործիքներ։" },
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
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary"><BookOpen className="size-4" />{tx("Ուսումնական կենտրոն")}</span>
        <h1 className="text-3xl font-black sm:text-4xl">{tx("Ուսումնական գործիքներ և առաջընթաց")}</h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{tx("Հետևիր քո առաջընթացին, կրկնիր սխալ պատասխանները և օգտվիր թեմատիկ աշխատանքներից ու մինի խաղերից։")}</p>
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
      <StudyTools />
      <Link to="/" className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-bold transition-colors hover:bg-muted"><BookOpen className="size-4" />{tx("Ընտրել շտեմարան")}</Link>
    </div>
  );
}
