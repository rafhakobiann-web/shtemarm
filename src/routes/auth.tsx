import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgress } from "@/lib/progress";

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
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
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
        <h1 className="text-2xl font-black">Ձեր հաշիվը</h1>
        <p className="break-all text-sm text-muted-foreground">{user}</p>
        <p className="text-sm">Առաջընթացը ({p.xp} միավոր, {Object.keys(p.answers).length} պատասխան) պահվում է և՛ այս սարքում, և՛ առցանց։</p>
        {p.exams.length > 0 && (
          <div className="space-y-1 text-sm">
            <p className="font-bold">Վերջին քննությունները</p>
            {p.exams.slice(-5).reverse().map((e) => (
              <p key={e.date} className="text-muted-foreground">
                {new Date(e.date).toLocaleDateString("hy-AM")} · Շտեմարան {e.book} · {e.score}/{e.total}
              </p>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full" onClick={() => supabase.auth.signOut()}>Դուրս գալ</Button>
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password: pw })
        : await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (mode === "up" && !data.session) {
      toast.success("Ստուգեք ձեր էլ. փոստը՝ հաշիվը հաստատելու համար։");
      return;
    }
    nav({ to: "/" });
  };

  return (
    <div className="shadow-card mx-auto max-w-md space-y-5 rounded-2xl border bg-card p-6">
      <div>
        <h1 className="text-2xl font-black">{mode === "in" ? "Մուտք" : "Գրանցում"}</h1>
        <p className="text-sm text-muted-foreground">Առանց մուտքի էլ կարող եք սովորել․ առաջընթացը կպահվի այս սարքում։ Մուտք գործեք՝ այն բոլոր սարքերում ունենալու համար։</p>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={async () => {
          const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
          if (r.error) toast.error("Google-ով մուտքը չհաջողվեց");
        }}
      >
        Շարունակել Google-ով
      </Button>
      <form onSubmit={submit} className="space-y-3">
        <Input type="email" required placeholder="Էլ. փոստ" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={6} placeholder="Գաղտնաբառ" value={pw} onChange={(e) => setPw(e.target.value)} />
        <Button variant="game" className="w-full" disabled={busy}>{mode === "in" ? "Մուտք" : "Գրանցվել"}</Button>
      </form>
      <button type="button" className="text-sm font-semibold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "Չունե՞ք հաշիվ․ գրանցվեք" : "Արդեն ունե՞ք հաշիվ․ մուտք"}
      </button>
    </div>
  );
}
