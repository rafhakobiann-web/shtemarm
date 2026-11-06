import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardFocus } from "@/components/DashboardFocus";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
import { useLang } from "@/lib/lang";
import { readOnboarding, type OnboardingSubject } from "@/lib/onboarding";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/profile")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "My Profile | Shtemarm" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MyProfile,
});

const COPY = {
  hy: {title:"Իմ պրոֆիլը",subtitle:"Իմ առաջընթացը, նպատակները և նվաճումները՝ մեկ տեղում։",back:"Դեպի գլխավոր վահանակ"},
  en: {title:"My Profile",subtitle:"Your progress, goals, reports, and achievements in one place.",back:"Back to Dashboard"},
  ru: {title:"Мой профиль",subtitle:"Прогресс, цели, отчёты и достижения в одном месте.",back:"Назад в кабинет"},
} as const;

function MyProfile() {
  const lang = useLang();
  const t = COPY[lang];
  const progress = useProgress();
  const [name, setName] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<OnboardingSubject[]>([]);

  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    let active = true;
    void supabase.auth.getUser()
      .then(({ data, error }) => {
        if (!active || error || !data.user) return;
        const value = data.user.user_metadata?.username;
        setName(typeof value === "string" ? value.slice(0, 40) : null);
        setSubjects(readOnboarding(data.user.id)?.subjects ?? []);
      })
      .catch(() => { /* Profile remains usable if remote profile lookup fails. */ });
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-4 py-2 sm:space-y-5 sm:py-5">
      <header className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <UserRound className="size-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <h1 className="break-words text-xl font-black sm:text-2xl">{t.title}</h1>
            {name && <p className="break-words text-sm font-semibold text-primary">{name}</p>}
            <p className="text-xs leading-relaxed text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
        <Link to="/dashboard"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold text-foreground hover:bg-muted">
          <ArrowLeft className="size-4" aria-hidden="true" />{t.back}
        </Link>
      </header>
      <DashboardFocus name={name} progress={progress} subjects={subjects} />
    </div>
  );
}
