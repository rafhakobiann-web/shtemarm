import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HeartHandshake, ShieldCheck, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLang, useTx } from "@/lib/lang";
import { toast } from "sonner";
import { TIKTOK_URL } from "@/lib/site";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [
    { title: "Shtemarm · Աջակցել նախագծին" },
    { name: "description", content: "Աջակցիր Shtemarm-ի Android հավելվածի հրապարակմանը Google Play-ում։" },
  ] }),
  component: SupportPage,
});

const GOAL_AMD = 10000;
function SupportPage() {
  const tx = useTx();
  const lang = useLang();
  const [amount, setAmount] = useState(1000);
  const message = `Բարև Ձեզ։ Ցանկանում եմ աջակցել Shtemarm-ին ${amount.toLocaleString("en-US")} ֏ գումարով։ Խնդրում եմ տրամադրել փոխանցման տվյալները։`;
  const contactUrl = TIKTOK_URL;
  const copyMessage = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(message);
      toast.success(lang === "en" ? "Message copied" : lang === "ru" ? "Сообщение скопировано" : "Հաղորդագրությունը պատճենված է");
    } catch {
      toast.error(lang === "en" ? "Select and copy the message manually" : lang === "ru" ? "Выделите и скопируйте сообщение вручную" : "Ընտրեք և պատճենեք հաղորդագրությունը ձեռքով");
    }
  };
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-5">
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
          <div className="space-y-3">
            <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-bold text-primary-foreground hover:opacity-90"><MessageCircle className="size-5" />{tx("Ստանալ փոխանցման տվյալները")}</a>
            <p className="text-sm text-muted-foreground">{tx("Գրիր մեզ TikTok-ում և խնդրիր փոխանցման տվյալները։ Գումարը կարող ես նշել հաղորդագրության մեջ։")}</p>
            <div className="rounded-2xl border bg-background/60 p-4 text-sm">
              <p className="mb-2 font-semibold">{tx("Պատրաստի հաղորդագրություն")}</p>
              <p className="break-words text-muted-foreground">{message}</p>
              <button type="button" onClick={() => void copyMessage()} className="mt-3 rounded-xl border px-4 py-2 font-semibold hover:bg-muted">{tx("Պատճենել հաղորդագրությունը")}</button>
            </div>
          </div>
          <p className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">{lang === "en" ? "Donations are optional. This is not an online checkout: no money is collected on this page. Arrange any transfer with a parent or guardian and comply with your bank’s requirements. Core study tools remain free." : lang === "ru" ? "Пожертвования добровольны. Это не платёжная страница: здесь деньги не принимаются. Оформляйте переводы с родителем или опекуном с соблюдением требований банка. Основные учебные инструменты остаются бесплатными." : "Նվիրատվությունը կամավոր է։ Սա վճարային էջ չէ․ այստեղ գումար չի գանձվում։ Փոխանցումը կազմակերպեք ծնողի կամ խնամակալի հետ՝ պահպանելով բանկի պահանջները։ Հիմնական ուսումնական գործիքները մնում են անվճար։"}</p>
          <p className="flex items-start gap-2 text-sm text-muted-foreground"><ShieldCheck className="mt-0.5 size-5 shrink-0" />{tx("Քարտի տվյալները հրապարակված չեն։ Փոխանցումը կատարվում է քո բանկային հավելվածում՝ տվյալները անձնական հաղորդագրությամբ ստանալուց հետո։ Երբեք մի փոխանցիր CVV, PIN կամ գաղտնաբառ։")}</p>
        </div>
      </section>
    </div>
  );
}
