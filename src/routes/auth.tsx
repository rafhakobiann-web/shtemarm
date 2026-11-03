import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase, hasSupabaseConfig, ensureBrowserSupabaseConfig } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgress } from "@/lib/progress";
import { useLang, useTx } from "@/lib/lang";
import { authFeedback } from "@/lib/auth-feedback";
import { googleOAuthMethod, googleOAuthRedirect, hasAuthenticatedSession } from "@/lib/google-oauth-routing";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { property: "og:title", content: "Մուտք և գրանցում · Shtemarm" },
      { property: "og:description", content: "Մուտք գործիր, գրանցվիր կամ վերականգնիր Shtemarm հաշիվդ։" },
      { title: "Մուտք և գրանցում · Shtemarm" },
      { name: "description", content: "Մուտք գործիր, գրանցվիր կամ վերականգնիր Shtemarm հաշիվդ։" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "in" | "up" | "forgot" | "recovery";

function AuthPage() {
  const tx = useTx();
  const lang = useLang();
  const nav = useNavigate();
  const progress = useProgress();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [configurationAttempt, setConfigurationAttempt] = useState(0);
  const [mode, setMode] = useState<AuthMode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [problem, setProblem] = useState("");

  // During hydration, a Lovable Cloud backend may have public Supabase
  // connection values only in the server environment. Fetch public-only
  // settings from our same-origin endpoint rather than disabling sign-in.
  useEffect(() => {
    let active = true;
    setConfigured(null);
    if (hasSupabaseConfig()) {
      setConfigured(true);
    } else {
      void ensureBrowserSupabaseConfig().then(ok => {
        if (active) setConfigured(ok);
      }).catch(() => {
        if (active) setConfigured(false);
      });
    }
    return () => { active = false; };
  }, [configurationAttempt]);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    let authEventSeen = false;
    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!active) return;
        authEventSeen = true;
        setUser(session?.user?.email ?? (session?.user ? "Հաշիվ" : null));
        if (event === "PASSWORD_RECOVERY") {
          setMode("recovery");
          setNotice("Սահմանիր նոր գաղտնաբառը՝ վերականգնումն ավարտելու համար։");
          setProblem("");
        }
      });
      void supabase.auth.getUser().then(({ data: result, error }) => {
        if (active && !authEventSeen && !error) {
          setUser(result.user?.email ?? (result.user ? "Հաշիվ" : null));
        }
      }).catch(() => {
        if (active && !authEventSeen) setUser(null);
      });
      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    } catch (error) {
      if (active) setProblem(authFeedback(error));
    }
  }, [configured]);

  const changeMode = (next: AuthMode) => {
    setMode(next);
    setProblem("");
    setNotice("");
    setPassword("");
  };

  const showError = (error: unknown) => {
    const message = authFeedback(error);
    setProblem(message);
    toast.error(message);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!configured || busy) return;
    setBusy(true);
    setProblem("");
    setNotice("");
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + "/auth",
        });
        if (error) throw error;
        setNotice(tx("Եթե այս հասցեով հաշիվ կա, կստանաս գաղտնաբառը վերականգնելու նամակ։ Ստուգիր նաև Spam-ը։"));
        return;
      }
      if (mode === "recovery") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        setMode("in");
        setNotice(tx("Գաղտնաբառը փոխված է։"));
        toast.success(tx("Գաղտնաբառը հաջողությամբ փոխվել է։"));
        return;
      }
      if (mode === "in") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(), password,
        });
        if (error) throw error;
        // Do not navigate as a success when the auth service returns no session.
        if (!hasAuthenticatedSession(data.session)) {
          throw new Error("No active session after sign-in");
        }
        setPassword("");
        await nav({ to: "/" });
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin + "/auth",
          data: { username: username.trim().slice(0, 40) },
        },
      });
      if (error) throw error;
      setPassword("");
      if (!data.session) {
        setNotice(tx("Գրանցումը սկսվել է։ Ստուգիր էլ. փոստդ և հաստատիր հաշիվը՝ մուտք գործելու համար։"));
        setMode("in");
        return;
      }
      await nav({ to: "/" });
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = async () => {
    if (!configured || busy) return;
    setBusy(true);
    setProblem("");
    setNotice("");
    try {
      const redirect = googleOAuthRedirect(window.location.origin);
      if (googleOAuthMethod(window.location.hostname) === "lovable") {
        // Lovable-hosted pages use their broker; do not initiate a competing
        // Supabase OAuth redirect while that broker is handling the callback.
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: redirect,
        });
        if (result.error) throw result.error;
        if (result.redirected) return;

        // The broker can return without throwing even if setSession failed.
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!hasAuthenticatedSession(data.session)) {
          throw new Error("No active session after Google sign-in");
        }
        await nav({ to: "/" });
        return;
      }

      // Vercel/custom-domain deployments do not have Lovable's OAuth broker.
      // Supabase starts Google OAuth using its configured provider/redirects.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirect, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Google sign-in returned no redirect URL");
      window.location.assign(data.url);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (!configured || busy) return;
    setBusy(true);
    setProblem("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setPassword("");
      setMode("in");
      setNotice(tx("Դուրս եկար հաշվից։"));
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  if (configured === null) return (
    <div role="status" className="mx-auto max-w-md rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
      {tx("Բացվում է մուտքի էջը…")}
    </div>
  );

  if (!configured) return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border bg-card p-6">
      <h1 className="text-2xl font-black">{tx("Մուտքը ժամանակավորապես անհասանելի է")}</h1>
      <p role="alert" className="text-sm text-muted-foreground">
        {tx("Այս կայքի մուտքի ծառայությունը դեռ կարգավորված չէ։ Կարող ես շարունակել սովորել առանց մուտքի, և տվյալներդ կպահվեն սարքում։")}
      </p>
      <button type="button"
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/30 px-4 font-semibold text-primary"
        onClick={() => setConfigurationAttempt(n => n + 1)}>
        {lang === "en" ? "Retry sign-in connection" :
          lang === "ru" ? "Повторить подключение" : "Կրկին փորձել մուտքի կապը"}
      </button>
      <Link to="/" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-bold text-primary-foreground">
        {tx("Շարունակել առանց մուտքի")}
      </Link>
    </div>
  );

  if (user && mode !== "recovery") return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border bg-card p-6 shadow-card">
      <h1 className="text-2xl font-black">{tx("Ձեր հաշիվը")}</h1>
      <p className="break-all text-sm text-muted-foreground">{user}</p>
      <p className="text-sm">
        {tx("Առաջընթաց՝ {xp} XP, {answers} պատասխան։ Այն պահվում է սարքում և կարող է համաժամացվել հաշվի հետ, երբ առցանց կապն աշխատում է։", {
          xp: progress.xp, answers: Object.keys(progress.answers).length,
        })}
      </p>
      <section className="space-y-3 rounded-xl border bg-muted/30 p-4">
        <h2 className="font-bold">{tx("Ուսումնական առաջընթաց")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-background p-3">
            <p className="text-xs text-muted-foreground">{tx("Ճիշտ պատասխաններ")}</p>
            <p className="text-xl font-black">{Object.values(progress.answers).filter(v => v === 1).length}</p>
          </div>
          <div className="rounded-lg bg-background p-3">
            <p className="text-xs text-muted-foreground">{tx("Կրկնելու հարցեր")}</p>
            <p className="text-xl font-black">{Object.values(progress.answers).filter(v => v === 0).length}</p>
          </div>
        </div>
        <Link to="/" search={{ subject: "english" }} className="inline-flex min-h-11 items-center rounded-xl border bg-background px-3 py-2 text-sm font-semibold">
          {tx("Շարունակել ուսուցումը")}
        </Link>
      </section>
      {progress.exams.length > 0 && (
        <div className="space-y-1 text-sm">
          <h2 className="font-bold">{tx("Վերջին քննությունները")}</h2>
          {progress.exams.slice(-5).reverse().map(e => (
            <p key={e.date} className="text-muted-foreground">
              {new Date(e.date).toLocaleDateString(lang === "en" ? "en-GB" : "hy-AM")} ·
              {tx(" Շտեմարան {book} · {score}/{total}", { book: e.book, score: e.score, total: e.total })}
            </p>
          ))}
        </div>
      )}
      {problem && <p role="alert" className="text-sm text-destructive">{problem}</p>}
      {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
      <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={() => { void signOut(); }}>
        {busy ? tx("Կատարվում է…") : tx("Դուրս գալ")}
      </Button>
    </div>
  );

  const isRecovery = mode === "recovery";
  const isForgot = mode === "forgot";
  return (
    <div className="mx-auto max-w-md space-y-5 rounded-2xl border bg-card p-6 shadow-card">
      <div className="space-y-2">
        <h1 className="text-2xl font-black">
          {mode === "up" ? tx("Գրանցում") : isForgot ? tx("Վերականգնել գաղտնաբառը") :
            isRecovery ? tx("Նոր գաղտնաբառ") : tx("Մուտք")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {tx("Կարող ես սովորել նաև առանց հաշվի։ Մուտքը թույլ է տալիս համաժամացնել առաջընթացը, երբ առցանց ծառայությունը հասանելի է։")}
        </p>
      </div>

      {!isRecovery && !isForgot && (
        <Button type="button" variant="outline" className="min-h-12 w-full" disabled={busy}
          onClick={() => { void googleSignIn(); }}>
          {busy ? tx("Կատարվում է…") : tx("Շարունակել Google-ով")}
        </Button>
      )}

      <form onSubmit={e => { void submit(e); }} className="space-y-3">
        {mode === "up" && (
          <Input required minLength={2} maxLength={40} autoComplete="username" placeholder={tx("Օգտանուն")}
            value={username} onChange={e => setUsername(e.target.value)} disabled={busy} />
        )}
        {!isRecovery && (
          <Input type="email" required autoComplete="email" placeholder={tx("Էլ. փոստ")}
            value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
        )}
        {!isForgot && (
          <Input type="password" required minLength={6}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            placeholder={tx("Գաղտնաբառ՝ առնվազն 6 նիշ")}
            value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
        )}
        {problem && <p role="alert" className="text-sm text-destructive">{problem}</p>}
        {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
        <Button type="submit" variant="game" className="min-h-12 w-full" disabled={busy}>
          {busy ? tx("Կատարվում է…") :
            mode === "up" ? tx("Գրանցվել") : isForgot ? tx("Ուղարկել վերականգնման հղումը") :
              isRecovery ? tx("Փոխել գաղտնաբառը") : tx("Մուտք գործել")}
        </Button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!isRecovery && (
          <button type="button" className="min-h-11 text-sm font-semibold text-primary"
            onClick={() => changeMode(mode === "up" || isForgot ? "in" : "up")}>
            {mode === "in" ? tx("Գրանցվել") : tx("Վերադառնալ մուտք")}
          </button>
        )}
        {mode === "in" && (
          <button type="button" className="min-h-11 text-sm font-semibold text-primary"
            onClick={() => changeMode("forgot")}>
            {tx("Մոռացե՞լ ես գաղտնաբառը")}
          </button>
        )}
      </div>
      <Link to="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-muted-foreground hover:text-primary">
        {tx("Շարունակել առանց մուտքի")}
      </Link>
    </div>
  );
}
