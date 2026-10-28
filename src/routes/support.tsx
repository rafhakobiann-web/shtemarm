import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HeartHandshake, ShieldCheck, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [
    { title: "Shtemarm · Աջակցել նախագծին" },
    { name: "description", content: "Աջակցիր Shtemarm-ի Android հավելվածի հրապարակմանը Google Play-ում։" },
  ] }),
  component: SupportPage,
});

const GOAL_AMD = 10000;
const approvedPaymentLink = import.meta.env.VITE_SHTEMARM_APPROVED_DONATION_URL?.trim() ?? "";
// An approved HTTPS checkout URL only; never place merchant secrets or card details here.
function safeCheckoutUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

function SupportPage() {
  const tx = useTx();
  const [amount, setAmount] = useState(1000);
  const checkout = safeCheckoutUrl(approvedPaymentLink);
  return (
    <main className="mx-auto max-w-3xl space-y-6 py-5">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />{tx("Գլխավոր էջ")}</Link>
      <section className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-card/80 p-6 shadow-xl backdrop-blur-xl sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary"><HeartHandshake className="size-4" />{tx("Աջակցիր Shtemarm-ին")}</span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{tx("Միասին՝ դեպի Google Play")}</h1>
          <p className="leading-relaxed text-muted-foreground">{tx("Օգնիր Shtemarm կրթական հարթակի Android հավելվածը հասանելի դարձնել ավելի շատ աշակերտների։ Նպատակը Google Play-ի միանվագ գրանցման վճարն է։ Աջակցությունը կամավոր է և չի ազդում կրթական գործիքների հասանելիության վրա։")}</p>
          <div className="rounded-2xl border bg-background/60 p-5">
            <div className="flex items-center justify-between gap-3"><strong>{tx("Դրամահավաքի նպատակ")}</strong><strong>{GOAL_AMD.toLocaleString("en-US")} ֏</strong></div>
            <p className="mt-2 text-xs text-muted-foreground">{tx("Հավաքված գումարի հաստատված հաշվիչը դեռ հասանելի չէ։ Մենք չենք ցուցադրում չստուգված վճարումներ։")}</p>
          </div>
          <fieldset className="space-y-3">
            <legend className="font-bold">{tx("Ընտրիր գումարը")}</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[500, 1000, 2000, 5000].map(value => <button key={value} type="button" aria-pressed={amount === value} onClick={() => setAmount(value)} className={`rounded-2xl border px-3 py-3 font-bold transition-colors ${amount === value ? "border-primary bg-primary/10 text-primary" : "bg-background/60 hover:bg-muted"}`}>{value.toLocaleString("en-US")} ֏</button>)}
            </div>
          </fieldset>
          {checkout ? (
            <div className="space-y-3">
              <a href={checkout} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-bold text-primary-foreground hover:opacity-90">{tx("Անցնել անվտանգ վճարման էջ")} <ExternalLink className="size-4" /></a>
              <p className="text-xs text-muted-foreground">{tx("Վճարումը կատարվում է արտաքին հաստատված էջում։ Ընտրված գումարը ստուգիր վճարման էջում։")}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground" role="status">{tx("Վճարումները դեռ հասանելի չեն։ Սպասում ենք բանկի հաստատմանը։")}</div>
          )}
          <p className="flex items-start gap-2 text-sm text-muted-foreground"><ShieldCheck className="mt-0.5 size-5 shrink-0" />{tx("Shtemarm-ը չի հավաքում կամ պահպանում բանկային քարտերի տվյալներ։ Վճարումները կակտիվացվեն միայն վճարային ծառայության հաստատումից հետո։")}</p>
        </div>
      </section>
    </main>
  );
}
