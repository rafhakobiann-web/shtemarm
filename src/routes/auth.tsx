import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { supabase, hasSupabaseConfig, ensureBrowserSupabaseConfig } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgress } from "@/lib/progress";
import { useLang, useTx } from "@/lib/lang";
import { authFeedback } from "@/lib/auth-feedback";
import { googleOAuthMethod, googleOAuthRedirect, hasAuthenticatedSession } from "@/lib/google-oauth-routing";
import { oauthReturnPath } from "@/lib/oauth-return-path";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  // OAuth consent sends unauthenticated users here with a return target.
  // Return {} when absent so `next` stays optional for plain /auth links.
  validateSearch: (search: Record<string, unknown>) =>
    typeof search["next"] === "string" ? { next: search["next"] } : {},
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
  const { next } = Route.useSearch();
  // Validated same-origin return target (e.g. back to the OAuth consent page).
  const returnPath = oauthReturnPath(next);
  const progress = useProgress();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [configurationAttempt, setConfigurationAttempt] = useState(0);
  const [mode, setMode] = useState<AuthMode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    setShowPassword(false);
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
        if (returnPath !== "/") {
          window.location.assign(returnPath);
          return;
        }
        await nav({ to: "/dashboard" });
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: new URL(returnPath, window.location.origin).href,
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
      const redirect = googleOAuthRedirect(window.location.origin, returnPath);
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
        if (returnPath !== "/") {
          window.location.assign(returnPath);
          return;
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
        {tx("Այս կայքի մուտքի ծառայությունը դեռ կարգավորված չէ։ Քո նախկին առաջընթացը չի ջնջվել։ Փորձիր կրկին ավելի ուշ։")}
      </p>
      <button type="button"
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/30 px-4 font-semibold text-primary"
        onClick={() => setConfigurationAttempt(n => n + 1)}>
        {lang === "en" ? "Retry sign-in connection" :
          lang === "ru" ? "Повторить подключение" : "Կրկին փորձել մուտքի կապը"}
      </button>
      <Link to="/" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-bold text-primary-foreground">
        {tx("Վերադառնալ ներկայացման էջ")}
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
        <Link to="/dashboard" search={{ subject: "english" }} className="inline-flex min-h-11 items-center rounded-xl border bg-background px-3 py-2 text-sm font-semibold">
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
  const ui = {
    hy: {
      eyebrow: "Քո ուսումնական միջավայրը",
      headline: "Մի տեղ՝ սովորելու և առաջ գնալու համար։",
      description: "Առարկաներդ, առաջադրանքներդ և առաջընթացդ՝ առանց ավելորդ շեղումների։",
      path: ["Ընտրիր թեման", "Լուծիր առաջադրանքը", "Հասկացիր սխալը"],
      step: "ՔԱՅԼ",
      signin: "Մուտք",
      signup: "Գրանցում",
      formIntro: "Շարունակիր այնտեղից, որտեղ կանգ ես առել։",
      signupIntro: "Ստեղծիր հաշիվ՝ ուսումնական առաջընթացդ պահելու համար։",
      recoveryIntro: "Նշիր նոր գաղտնաբառը՝ հաշիվդ վերականգնելու համար։",
      forgotIntro: "Մուտքագրիր էլ. փոստը՝ վերականգնման հղում ստանալու համար։",
      orEmail: "կամ էլ. փոստով",
      username: "Օգտանուն",
      email: "Էլ. փոստ",
      password: "Գաղտնաբառ",
      reveal: "Ցույց տալ գաղտնաբառը",
      conceal: "Թաքցնել գաղտնաբառը",
      back: "Դեպի գլխավոր էջ",
      minimum: "Առնվազն 6 նիշ",
      privacy: "Քո արդեն լուծած հարցերի պատմությունը չի ջնջվում։",
    },
    en: {
      eyebrow: "Your learning workspace",
      headline: "A quieter place to make progress.",
      description: "Your subjects, practice and progress, without the distractions.",
      path: ["Choose a topic", "Work through a question", "Learn from the result"],
      step: "STEP",
      signin: "Sign in",
      signup: "Create account",
      formIntro: "Pick up exactly where you left off.",
      signupIntro: "Create an account to keep your learning progress.",
      recoveryIntro: "Choose a new password to recover access.",
      forgotIntro: "Enter your email to receive a recovery link.",
      orEmail: "or continue with email",
      username: "Username",
      email: "Email address",
      password: "Password",
      reveal: "Show password",
      conceal: "Hide password",
      back: "Back to home",
      minimum: "At least 6 characters",
      privacy: "Your previous answers are not deleted.",
    },
    ru: {
      eyebrow: "Твоё пространство для учёбы",
      headline: "Учись спокойно. Двигайся вперёд.",
      description: "Предметы, задания и прогресс — ничего лишнего.",
      path: ["Выбери тему", "Реши задание", "Разбери ответ"],
      step: "ШАГ",
      signin: "Войти",
      signup: "Создать аккаунт",
      formIntro: "Продолжи с того места, где остановился.",
      signupIntro: "Создай аккаунт, чтобы сохранять свой прогресс.",
      recoveryIntro: "Придумай новый пароль для восстановления.",
      forgotIntro: "Введи почту для получения ссылки восстановления.",
      orEmail: "или войди по почте",
      username: "Имя пользователя",
      email: "Электронная почта",
      password: "Пароль",
      reveal: "Показать пароль",
      conceal: "Скрыть пароль",
      back: "На главную",
      minimum: "Не менее 6 символов",
      privacy: "История твоих ответов не удаляется.",
    },
  }[lang];
  const heading = mode === "up" ? ui.signup : isForgot ? tx("Վերականգնել գաղտնաբառը") :
    isRecovery ? tx("Նոր գաղտնաբառ") : ui.signin;

  return (
    <div className="sht-auth-layout">
      <aside className="sht-auth-story" aria-label={ui.eyebrow}>
        <div className="sht-auth-story-brand">
          <Link to="/" className="sht-auth-brand">
            <img src="/shtemarm-logo.svg" alt="" width={36} height={36} />
            <span>Shtemarm<span className="sht-auth-brand-period">.</span></span>
          </Link>
          <span className="sht-auth-story-counter">01 / 03</span>
        </div>
        <div className="sht-auth-story-content">
          <p className="sht-auth-kicker">{ui.eyebrow}</p>
          <h2>{ui.headline}</h2>
          <p className="sht-auth-story-description">{ui.description}</p>
        </div>
        <ol className="sht-auth-roadmap">
          {ui.path.map((label, index) => (
            <li key={label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{label}</span>
              {index === 2 ? <Check size={16} aria-hidden="true" /> : <span className="sht-auth-roadmap-rule" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </aside>

      <main className="sht-auth-form-panel">
        <div className="sht-auth-form-top">
          <span className="sht-auth-form-edition">SHTEMARM / ACCOUNT</span>
          <Link to="/" className="sht-auth-back">{ui.back}<ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="sht-auth-form-content">
          <div className="sht-auth-form-heading" key={mode}>
            <div className="sht-auth-form-step">{ui.step} 01 <span aria-hidden="true">/</span> 02</div>
            <h1>{heading}</h1>
            <p>{mode === "up" ? ui.signupIntro : isRecovery ? ui.recoveryIntro :
              isForgot ? ui.forgotIntro : ui.formIntro}</p>
          </div>

          {!isRecovery && !isForgot && (
            <div role="group" aria-label={lang === "en" ? "Account mode" : lang === "ru" ? "Режим аккаунта" : "Հաշվի տեսակ"} className="sht-auth-mode-tabs">
              <button type="button" aria-pressed={mode === "in"} disabled={busy} onClick={() => changeMode("in")}>{ui.signin}</button>
              <button type="button" aria-pressed={mode === "up"} disabled={busy} onClick={() => changeMode("up")}>{ui.signup}</button>
            </div>
          )}

          {!isRecovery && !isForgot && (
            <Button type="button" variant="outline" className="sht-auth-google min-h-12 w-full" disabled={busy}
              onClick={() => { void googleSignIn(); }}>
              <span className="sht-auth-google-mark" aria-hidden="true">G</span>
              {busy ? tx("Կատարվում է…") : tx("Շարունակել Google-ով")}
            </Button>
          )}
          {!isRecovery && !isForgot && <div className="sht-auth-divider"><span>{ui.orEmail}</span></div>}

          <form onSubmit={e => { void submit(e); }} className="sht-auth-form" aria-label={heading}>
            {mode === "up" && (
              <div className="sht-auth-field">
                <label htmlFor="sht-auth-username">{ui.username}</label>
                <Input id="sht-auth-username" required minLength={2} maxLength={40}
                  autoComplete="username" placeholder="student_01"
                  value={username} onChange={e => setUsername(e.target.value)} disabled={busy} />
              </div>
            )}
            {!isRecovery && (
              <div className="sht-auth-field">
                <label htmlFor="sht-auth-email">{ui.email}</label>
                <Input id="sht-auth-email" type="email" required autoComplete="email" placeholder="name@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
              </div>
            )}
            {!isForgot && (
              <div className="sht-auth-field">
                <div className="sht-auth-field-label">
                  <label htmlFor="sht-auth-password">{ui.password}</label>
                  <span>{ui.minimum}</span>
                </div>
                <div className="sht-auth-password-wrap">
                  <Input id="sht-auth-password" type={showPassword ? "text" : "password"} required minLength={6}
                    autoComplete={mode === "in" ? "current-password" : "new-password"}
                    placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
                  <button type="button" disabled={busy} onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? ui.conceal : ui.reveal}
                    aria-pressed={showPassword} className="sht-auth-password-toggle">
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            )}

            {problem && <p role="alert" className="sht-auth-feedback sht-auth-error">{problem}</p>}
            {notice && <p role="status" className="sht-auth-feedback sht-auth-success">{notice}</p>}

            <Button type="submit" className="sht-auth-submit min-h-12 w-full" disabled={busy}>
              <span>{busy ? tx("Կատարվում է…") :
                mode === "up" ? tx("Գրանցվել") : isForgot ? tx("Ուղարկել վերականգնման հղումը") :
                  isRecovery ? tx("Փոխել գաղտնաբառը") : tx("Մուտք գործել")}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
          </form>
          <div className="sht-auth-secondary-actions">
            {isForgot && <button type="button" onClick={() => changeMode("in")} className="sht-auth-text-button">{tx("Վերադառնալ մուտք")}</button>}
            {mode === "in" && <button type="button" onClick={() => changeMode("forgot")} className="sht-auth-text-button">{tx("Մոռացե՞լ ես գաղտնաբառը")}</button>}
            <Link to="/" className="sht-auth-guest-link">{tx("Շարունակել առանց մուտքի")}</Link>
          </div>
          <p className="sht-auth-privacy-note"><LockKeyhole size={15} aria-hidden="true" />{ui.privacy}</p>
        </div>
        <div className="sht-auth-form-bottom">SHTEMARM <span aria-hidden="true">—</span> 2026</div>
      </main>
    </div>
  );
}
