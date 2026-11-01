import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgress } from "@/lib/progress";
import { useLang, useTx } from "@/lib/lang";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Մուտք · Shtemarm" },
      { name: "description", content: "Մուտք գործեք՝ ձեր առաջընթացը բոլոր սարքերում պահելու համար։" },
      { property: "og:title", content: "Մուտք · Shtemarm" },
      { property: "og:description", content: "Պահպանեք առաջընթացը առցանց։" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const tx = useTx();
  const lang = useLang();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const p = useProgress();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (user)
    return (
      <div className="shadow-card mx-auto max-w-md space-y-4 rounded-2xl border bg-card p-6">
        <h1 className="text-2xl font-black">{tx("Ձեր հաշիվը")}</h1>
        <p className="break-all text-sm text-muted-foreground">{user}</p>
        <p className="text-sm">{tx("Առաջընթացը ({xp} միավոր, {answers} պատասխան) պահվում է և՛ այս սարքում, և՛ առցանց։", { xp: p.xp, answers: Object.keys(p.answers).length })}</p>
        <section className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <h2 className="font-bold">{tx("Ուսումնական առաջընթաց")}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-background p-3"><p className="text-xs text-muted-foreground">{tx("Ճիշտ պատասխաններ")}</p><p className="text-xl font-black">{Object.values(p.answers).filter((v) => v === 1).length}</p></div>
            <div className="rounded-lg bg-background p-3"><p className="text-xs text-muted-foreground">{tx("Կրկնելու հարցեր")}</p><p className="text-xl font-black">{Object.values(p.answers).filter((v) => v === 0).length}</p></div>
          </div>
          {Object.values(p.answers).some((v) => v === 0) ? <p className="text-sm text-muted-foreground">{tx("Առաջարկ․ կրկնիր սխալ պատասխանած հարցերը և նոր թեստ անցիր՝ առաջընթացը համեմատելու համար։")}</p> : <p className="text-sm text-muted-foreground">{tx("Լուծիր մի քանի թեստ՝ թույլ թեմաները բացահայտելու համար։")}</p>}
          <Link to="/" search={{ subject: "english" }} className="inline-flex rounded-xl border bg-background px-3 py-2 text-sm font-semibold">{tx("Անցնել անգլերենի թեստերը")}</Link>
        </section>
        {p.exams.length > 0 && (
          <div className="space-y-1 text-sm">
            <p className="font-bold">{tx("Վերջին քննությունները")}</p>
            {p.exams.slice(-5).reverse().map((e) => (
              <p key={e.date} className="text-muted-foreground">
                {new Date(e.date).toLocaleDateString(lang === "en" ? "en-GB" : "hy-AM")} · {tx("Շտեմարան {book} · {score}/{total}", { book: e.book, score: e.score, total: e.total })}
              </p>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full" onClick={() => supabase.auth.signOut()}>{tx("Դուրս գալ")}</Button>
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password: pw })
        : await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin, data: { username: username.trim().slice(0, 40) } } });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (mode === "up" && !data.session) {
      toast.success(tx("Ստուգեք ձեր էլ. փոստը՝ հաշիվը հաստատելու համար։"));
      return;
    }
    nav({ to: "/" });
  };

  return (
    <div className="shadow-card mx-auto max-w-md space-y-5 rounded-2xl border bg-card p-6">
      <div>
        <h1 className="text-2xl font-black">{mode === "in" ? tx("Մուտք") : tx("Գրանցում")}</h1>
        <p className="text-sm text-muted-foreground">{tx("Առանց մուտքի էլ կարող եք սովորել․ առաջընթացը կպահվի այս սարքում։ Մուտք գործեք՝ այն բոլոր սարքերում ունենալու համար։")}</p>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={async () => {
          const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
          if (r.error) toast.error(tx("Google-ով մուտքը չհաջողվեց"));
        }}
      >
        {tx("Շարունակել Google-ով")}
      </Button>
      <form onSubmit={submit} className="space-y-3">
        {mode === "up" && (
          <Input required minLength={2} maxLength={40} placeholder={tx("Օգտանուն")} value={username} onChange={(e) => setUsername(e.target.value)} />
        )}
        <Input type="email" required placeholder={tx("Էլ. փոստ")} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={6} placeholder={tx("Գաղտնաբառ")} value={pw} onChange={(e) => setPw(e.target.value)} />
        <Button variant="game" className="w-full" disabled={busy}>{mode === "in" ? tx("Մուտք") : tx("Գրանցվել")}</Button>
      </form>
      <button type="button" className="text-sm font-semibold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? tx("Չունե՞ք հաշիվ․ գրանցվեք") : tx("Արդեն ունե՞ք հաշիվ․ մուտք")}
      </button>
    </div>
  );
}
