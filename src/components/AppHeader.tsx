import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Star, User } from "lucide-react";
import { useProgress, level } from "@/lib/progress";
import { supabase } from "@/integrations/supabase/client";

export function AppHeader() {
  const p = useProgress();
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent font-display text-lg font-black text-accent-foreground">Շ</span>
          <span className="truncate font-display text-base font-bold sm:text-lg">Շտեմարան · English</span>
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold sm:gap-4">
          <span className="flex items-center gap-1" title="Օրեր անընդմեջ">
            <Flame className="size-4 text-destructive" />
            {p.streak}
          </span>
          <span className="flex items-center gap-1" title="Միավորներ">
            <Star className="size-4 text-sun" />
            {p.xp}
            <span className="hidden text-muted-foreground sm:inline">· Մակ. {level(p.xp)}</span>
          </span>
          <Link to="/auth" className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-secondary-foreground">
            <User className="size-4" />
            <span className="hidden max-w-32 truncate sm:inline">{email ?? "Մուտք"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
