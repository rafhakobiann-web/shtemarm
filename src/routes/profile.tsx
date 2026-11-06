import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardFocus } from "@/components/DashboardFocus";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
import { useLang } from "@/lib/lang";
import { readOnboarding, type OnboardingSubject } from "@/lib/onboarding";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile | Shtemarm" }] }),
  component: MyProfile,
});

function MyProfile() {
  const lang = useLang();
  const progress = useProgress();
  const [name, setName] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<OnboardingSubject[]>([]);

  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    let active = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active || error || !data.user) return;
      setName((data.user.user_metadata?.username as string | undefined) ?? null);
      setSubjects(readOnboarding(data.user.id)?.subjects ?? []);
    }).catch(() => { /* Keep local progress visible when profile lookup fails. */ });
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-5 py-2 sm:py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><UserRound className="size-5" /></span>
          <div className="min-w-0">
            <h1 className="break-words text-xl font-black text-foreground sm:text-2xl">{lang === "hy" ? "Իմ պրոֆիլը" : lang === "ru" ? "Мой профиль" : "My Profile"}</h1>
            {name && <p className="break-words text-sm text-muted-foreground">{name}</p>}
          </div>
        </div>
        <Link to="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted">
          <ArrowLeft className="size-4" />{lang === "hy" ? "Գլխավոր" : lang === "ru" ? "Главная" : "Dashboard"}
        </Link>
      </header>
      <DashboardFocus name={name} progress={progress} subjects={subjects} view="profile" />
    </div>
  );
}
