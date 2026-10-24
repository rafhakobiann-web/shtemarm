import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, LockKeyhole, Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { createStripeCustomerPortal, createStripeTestCheckout } from "@/lib/stripe.functions";

export const Route = createFileRoute("/subscription")({ component: SubscriptionPage });

function SubscriptionPage() {
  const [busy, setBusy] = useState<"checkout" | "portal" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkoutState = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("checkout") : null;
  const features = ["Առանց գովազդի ուսուցում (երբ հասանելի լինի)", "Ընդլայնված վիճակագրություն և առաջընթացի վերլուծություն", "Լրացուցիչ փորձնական քննություններ", "AI բացատրությունների ընդլայնված հնարավորություններ"];

  async function startCheckout() {
    setBusy("checkout");
    setNotice(null);
    setErrorMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Շարունակելու համար նախ մուտք գործիր քո հաշիվ։");
      const result = await createStripeTestCheckout({ data: { accessToken: session.access_token } });
      window.location.assign(result.url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Չհաջողվեց սկսել փորձնական վճարումը։");
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy("portal");
    setNotice(null);
    setErrorMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Շարունակելու համար նախ մուտք գործիր քո հաշիվ։");
      const result = await createStripeCustomerPortal({ data: { accessToken: session.access_token } });
      window.location.assign(result.url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Չհաջողվեց բացել բաժանորդագրության կառավարումը։");
      setBusy(null);
    }
  }

  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4"/> Գլխավոր էջ</Link>
    <section className="rounded-3xl border bg-gradient-to-br from-amber-500/15 via-card to-primary/10 p-6 sm:p-10">
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-amber-500/15 text-amber-600"><Crown className="size-7"/></span>
      <p className="text-sm font-bold text-primary">Shtemarm Plus</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Ավելի խելացի պատրաստվիր քննություններին։</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">Փորձնական ինտեգրացիան մշակման փուլում է։ Այն օգտագործում է միայն Stripe-ի sandbox-ը. իրական վճարումներ չեն ակտիվացվում։</p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-bold"><LockKeyhole className="size-4"/> Միայն փորձնական ռեժիմ</div>
    </section>
    {checkoutState === "success" && <p className="rounded-xl border p-4 text-sm">Checkout-ը վերադարձրել է քեզ կայք։ Բաժանորդագրության կարգավիճակը հաստատվում է միայն Stripe-ի ստուգված webhook-ից հետո. այս էջը ինքնուրույն մուտք չի տալիս Plus-ին։</p>}
    {checkoutState === "cancelled" && <p className="rounded-xl border p-4 text-sm">Փորձնական checkout-ը չեղարկվել է։ Քեզանից վճար չի գանձվել իրական ռեժիմում։</p>}
    {notice && <p className="rounded-xl border p-4 text-sm">{notice}</p>}
    {errorMessage && <p role="alert" className="rounded-xl border border-destructive/40 p-4 text-sm text-destructive">{errorMessage}</p>}
    <section className="grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border bg-card p-6"><h2 className="text-xl font-black">Անվճար</h2><p className="mt-2 text-sm text-muted-foreground">Շարունակիր սովորել հիմնական հնարավորություններով։</p><ul className="mt-5 space-y-3">{["Հասանելի շտեմարաններ", "Հիմնական թեստեր և խաղեր", "Առաջընթացի պահպանում"].map(x=><li key={x} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 text-primary"/>{x}</li>)}</ul><Button asChild variant="outline" className="mt-6 w-full"><Link to="/">Շարունակել սովորել</Link></Button></div>
      <div className="rounded-3xl border-2 border-primary/30 bg-card p-6"><h2 className="flex items-center gap-2 text-xl font-black"><Sparkles className="size-5 text-primary"/> Plus · Փորձնական</h2><p className="mt-2 text-sm text-muted-foreground">Առաջարկվող փորձնական պլան՝ $3/ամիս, 7-օրյա փորձաշրջան։ Իրական գանձումները անջատված են։</p><ul className="mt-5 space-y-3">{features.map(x=><li key={x} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 text-primary"/>{x}</li>)}</ul><Button onClick={startCheckout} disabled={busy !== null} className="mt-6 w-full">{busy === "checkout" && <LoaderCircle className="mr-2 size-4 animate-spin"/>}{busy === "checkout" ? "Բացվում է..." : "Փորձարկել Stripe Checkout"}</Button><Button onClick={openPortal} disabled={busy !== null} variant="outline" className="mt-2 w-full">{busy === "portal" && <LoaderCircle className="mr-2 size-4 animate-spin"/>}Կառավարել փորձնական բաժանորդագրությունը</Button><p className="mt-3 text-xs text-muted-foreground">Կոճակները աշխատելու համար անհրաժեշտ են Stripe-ի sandbox բանալիները, գնի ID-ն, webhook secret-ը և տվյալների բազայի migration-ը։</p></div>
    </section>
  </main>;
}
