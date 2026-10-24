import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/subscription")({ component: SubscriptionPage });

function SubscriptionPage() {
  const features = ["Առանց գովազդի ուսուցում (երբ հասանելի լինի)", "Ընդլայնված վիճակագրություն և առաջընթացի վերլուծություն", "Լրացուցիչ փորձնական քննություններ", "AI բացատրությունների ընդլայնված հնարավորություններ"];
  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4"/> Գլխավոր էջ</Link>
    <section className="rounded-3xl border bg-gradient-to-br from-amber-500/15 via-card to-primary/10 p-6 sm:p-10">
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-amber-500/15 text-amber-600"><Crown className="size-7"/></span>
      <p className="text-sm font-bold text-primary">Shtemarm Plus</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Ավելի խելացի պատրաստվիր քննություններին։</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">Վճարովի հնարավորությունները շուտով հասանելի կլինեն։ Այս պահին բաժանորդագրություն գնել հնարավոր չէ, և վճար չի գանձվում։</p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-bold"><LockKeyhole className="size-4"/> Շուտով</div>
    </section>
    <section className="grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border bg-card p-6"><h2 className="text-xl font-black">Անվճար</h2><p className="mt-2 text-sm text-muted-foreground">Շարունակիր սովորել հիմնական հնարավորություններով։</p><ul className="mt-5 space-y-3">{["Հասանելի շտեմարաններ", "Հիմնական թեստեր և խաղեր", "Առաջընթացի պահպանում"].map(x=><li key={x} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 text-primary"/>{x}</li>)}</ul><Button asChild variant="outline" className="mt-6 w-full"><Link to="/">Շարունակել սովորել</Link></Button></div>
      <div className="rounded-3xl border-2 border-primary/30 bg-card p-6"><h2 className="flex items-center gap-2 text-xl font-black"><Sparkles className="size-5 text-primary"/> Plus · Շուտով</h2><p className="mt-2 text-sm text-muted-foreground">Նախատեսվող հավելյալ հնարավորություններ։</p><ul className="mt-5 space-y-3">{features.map(x=><li key={x} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 text-primary"/>{x}</li>)}</ul><Button disabled className="mt-6 w-full">Շուտով հասանելի կլինի</Button></div>
    </section>
  </main>;
}
