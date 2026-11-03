import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Layers, Gamepad2, Languages, ListChecks, CalendarCheck, Trophy } from "lucide-react";
import { StudyTools } from "@/components/StudyTools";
import { useLang, useTx } from "@/lib/lang";

export const Route = createFileRoute("/study-tools")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
      { property: "og:title", content: "Shtemarm · Ուսումնական գործիքներ" },
      { property: "og:description", content: "Ուսումնական առաջընթացի տվյալներ և անհատական ուսումնական գործիքներ։" },
    { title: "Shtemarm · Ուսումնական գործիքներ" },
    { name: "description", content: "Ուսումնական առաջընթացի տվյալներ և անհատական ուսումնական գործիքներ։" },
  ] }),
  component: StudyToolsPage,
});

function StudyToolsPage() {
  const tx = useTx();
  const lang = useLang();
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />{tx("Գլխավոր էջ")}
      </Link>
      <header className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary"><BookOpen className="size-4" />{tx("Ուսումնական կենտրոն")}</span>
        <h1 className="text-3xl font-black sm:text-4xl">{tx("Ուսումնական գործիքներ և առաջընթաց")}</h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{tx("Հետևիր քո առաջընթացին, կրկնիր սխալ պատասխանները և օգտվիր հիշողության քարտերից ու մինի խաղերից։")}</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {to:"/achievements",title:lang === "en" ? "Achievements & daily quests" : lang === "ru" ? "Достижения и задания" : "Նվաճումներ և օրվա առաջադրանքներ",desc:lang === "en" ? "Daily goals, XP, levels and badges" : lang === "ru" ? "Ежедневные цели, XP и награды" : "Ամենօրյա նպատակներ, XP, մակարդակներ ու մեդալներ",Icon:Trophy},
          {to:"/study-plan",title:lang === "en" ? "My study plan" : lang === "ru" ? "Мой учебный план" : "Իմ ուսումնական պլանը",desc:lang === "en" ? "A daily plan based on your mistakes and progress" : lang === "ru" ? "Ежедневный план по ошибкам и прогрессу" : "Օրվա առաջադրանքներ՝ ըստ սխալների ու առաջընթացի",Icon:CalendarCheck},
          {to:"/mistakes",title:lang === "en" ? "My mistakes" : lang === "ru" ? "Мои ошибки" : "Իմ սխալները",desc:lang === "en" ? "All mistakes and step-by-step review" : lang === "ru" ? "Все ошибки и последовательное повторение" : "Բոլոր սխալներն ու հերթական կրկնությունը",Icon:ListChecks},
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
