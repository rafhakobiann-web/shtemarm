import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
import { googleAuthRedirect } from "@/lib/google-auth";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgress } from "@/lib/progress";
import { useLang, useTx } from "@/lib/lang";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
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
  const [googleUnavailable, setGoogleUnavailable] = useState(false);
  const nav = useNavigate();
  const p = useProgress();

  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    let active = true;
    // Prevent a delayed initial lookup from overriding a newer OAuth event.
    let eventReceived = false;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        eventReceived = true;
        if (active) setUser(session?.user?.email ?? null);
      });
      void supabase.auth.getUser()
        .then(({ data: result, error }) => {
          if (active && !eventReceived) setUser(error ? null : result.user?.email ?? null);
        })
        .catch(() => { if (active && !eventReceived) setUser(null); });
      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    } catch {
      // The question library and local progress remain accessible without auth.
      return () => { active = false; };
    }
  }, []);

  const signInWithGoogle = async (method: "lovable" | "supabase") => {
    if (!hasSupabaseConfig()) {
      toast.error(tx("Առցանց հաշիվները դեռ կարգավորված չեն։ Կարող ես սովորել առանց մուտքի։"));
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const redirect = googleAuthRedirect(window.location.origin);
      if (method === "lovable") {
        // Preserve the existing Lovable Cloud OAuth broker and Preview flow.
        const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirect });
        if (result.error) throw result.error;
        if (!result.redirected) await nav({ to: "/" });
      } else {
        // Alternative standard Supabase OAuth, when the Google provider and
        // /auth redirect have been explicitly configured by the site owner.
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: redirect },
        });
        if (error) throw error;
      }
      setGoogleUnavailable(false);
    } catch (error) {
      setGoogleUnavailable(true);
      toast.error(tx("Google-ով մուտքը չհաջողվեց։ Փորձիր այլ եղանակ կամ տեղեկացրու մշակողին։"));
      console.warn("[Shtemarm] Google sign-in unavailable", error);
    } finally {
      setBusy(false);
    }
  };

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
    try {
      if (!hasSupabaseConfig()) {
        toast.error(tx("Առցանց հաշիվները դեռ կարգավորված չեն։ Կարող ես սովորել առանց մուտքի։"));
        return;
      }
      const { data, error } =
        mode === "in"
          ? await supabase.auth.signInWithPassword({ email, password: pw })
          : await supabase.auth.signUp({ email, password: pw, options: {
              emailRedirectTo: googleAuthRedirect(window.location.origin),
              data: { username: username.trim().slice(0, 40) },
            } });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (mode === "up" && !data.session) {
        toast.success(tx("Ստուգեք ձեր էլ. փոստը՝ հաշիվը հաստատելու համար։"));
        return;
      }
      await nav({ to: "/" });
    } catch {
      toast.error(tx("Հաշիվը ժամանակավորապես անհասանելի է։ Առանց մուտքի կարող ես շարունակել սովորել։"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shadow-card mx-auto max-w-md space-y-5 rounded-2xl border bg-card p-6">
      <div>
        <h1 className="text-2xl font-black">{mode === "in" ? tx("Մուտք") : tx("Գրանցում")}</h1>
        <p className="text-sm text-muted-foreground">{tx("Առանց մուտքի էլ կարող եք սովորել․ առաջընթացը կպահվի այս սարքում։ Մուտք գործեք՝ այն բոլոր սարքերում ունենալու համար։")}</p>
      </div>
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-12 w-full gap-3"
          disabled={busy}
          onClick={() => void signInWithGoogle("lovable")}
        >
          <span aria-hidden="true" className="text-lg font-black text-primary">G</span>
          {busy ? tx("Սպասիր…") : tx("Շարունակել Google-ով")}
        </Button>
        {googleUnavailable && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            disabled={busy}
            onClick={() => void signInWithGoogle("supabase")}
          >
            {tx("Փորձել Google-ի այլ մուտքի եղանակը")}
          </Button>
        )}
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "up" && (
          <Input required minLength={2} maxLength={40} placeholder={tx("Օգտանուն")} value={username} onChange={(e) => setUsername(e.target.value)} />
        )}
        <Input type="email" required placeholder={tx("Էլ. փոստ")} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={6} placeholder={tx("Գաղտնաբառ")} value={pw} onChange={(e) => setPw(e.target.value)} />
        <Button type="submit" variant="game" className="w-full" disabled={busy}>{mode === "in" ? tx("Մուտք") : tx("Գրանցվել")}</Button>
      </form>
      <button type="button" className="text-sm font-semibold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? tx("Չունե՞ք հաշիվ․ գրանցվեք") : tx("Արդեն ունե՞ք հաշիվ․ մուտք")}
      </button>
    </div>
  );
}
