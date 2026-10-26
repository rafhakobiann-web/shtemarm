import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Star, User, Menu, BookOpen, Info, MessageSquare, Languages, Moon, Sun, Calculator, MessageCircle, Gamepad2, Timer, Bookmark, History } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { resolvedTheme, setAppearance, useAppearance } from "@/lib/theme";
import { useProgress, level } from "@/lib/progress";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { initLang, setLang, useLang, useT, type Lang } from "@/lib/lang";

const LANG_NAMES: Record<Lang, string> = { hy: "Հայերեն", en: "English", ru: "Русский" };

export function AppHeader() {
  const p = useProgress();
  const t = useT();
  const lang = useLang();
  const [email, setEmail] = useState<string | null>(null);
  const appearance = useAppearance();
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    initLang();
    setHydrated(true);
  }, []);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const close = () => setOpen(false);
  const item = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-muted";

  return (
    <header className="site-header sticky top-0 z-30 glass rounded-none !border-x-0 !border-t-0">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src="/shtemarm-logo.svg" alt="" aria-hidden="true" className="h-10 w-10 shrink-0 object-contain" />
          <span className="flex min-w-0 items-center gap-2"><span className="truncate font-display text-base font-bold sm:text-lg">Shtemarm</span><span className="rounded-md border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black tracking-[0.12em] text-amber-700 dark:text-amber-300">BETA</span></span>
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold sm:gap-3">
          <div className="hidden items-center gap-1.5 sm:flex" title={t.darkMode}>
            <Sun className="size-4 text-sun" aria-hidden />
            <Switch
              checked={hydrated && resolvedTheme(appearance) === "dark"}
              onCheckedChange={(v) => setAppearance({ mode: v ? "dark" : "light" })}
              aria-label={t.darkMode}
            />
            <Moon className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <span className="hidden items-center gap-1 md:flex" title={t.streak}>
            <Flame className="size-4 text-destructive" />
            {p.streak}
          </span>
          <span className="hidden items-center gap-1 sm:flex" title={t.points}>
            <Star className="size-4 text-sun" />
            {p.xp}
            <span className="hidden text-muted-foreground md:inline">· {t.level} {level(p.xp)}</span>
          </span>

          <Sheet open={open} onOpenChange={setOpen}>
            <Button variant="outline" size="icon" aria-label={t.openMenu} onClick={() => setOpen(true)}>
              <Menu className="size-5" />
            </Button>
            <SheetContent side="right" className="flex w-[min(20rem,90vw)] flex-col gap-4 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-display text-lg font-black">{t.menu}</SheetTitle>
                <SheetDescription className="sr-only">{t.menu}</SheetDescription>
              </SheetHeader>

              <Link to="/auth" onClick={close} className={item}>
                <User className="size-4" />
                <span className="truncate">{email ?? t.account}</span>
              </Link>

              <div className="space-y-1">
                <p className="px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.subjects}</p>
                <Link to="/" search={{ subject: "english" }} onClick={close} className={item}>
                  <BookOpen className="size-4" />{t.english}
                </Link>
                <Link to="/" search={{ subject: "math" }} onClick={close} className={item}>
                  <BookOpen className="size-4" />{t.math}
                </Link>
                <Link to="/" search={{ subject: "armenian" }} onClick={close} className={item}>
                  <BookOpen className="size-4" />{t.armenianLang}
                </Link>
                <Link to="/" search={{ subject: "biology" }} onClick={close} className={item}>
                  <BookOpen className="size-4" />{t.biology}
                </Link>
                <Link to="/" search={{ subject: "history" }} onClick={close} className={item}>
                  <BookOpen className="size-4" />{t.history}
                </Link>
              </div>

              <div className="space-y-1">
                <Link to="/changelog" onClick={close} className={item}>
                  <History className="size-4" />{lang === "en" ? "Changelog" : lang === "ru" ? "История изменений" : "Փոփոխությունների մատյան"}
                </Link>
                <Link to="/about" onClick={close} className={item}>
                  <Info className="size-4" />{t.about}
                </Link>
                <Link to="/vocabulary" onClick={close} className={item}>
                  <Bookmark className="size-4" />{lang === "en" ? "My vocabulary" : lang === "ru" ? "Мой словарь" : "Իմ բառապաշարը"}
                </Link>
                <Link to="/study-tools" onClick={close} className={item}>
                  <Timer className="size-4" />{lang === "en" ? "Study tools / Focus" : lang === "ru" ? "Инструменты / Фокус" : "Ուսումնական գործիքներ / Կենտրոնացում"}
                </Link>
                                <Link to="/mini-games" onClick={close} className={item}><Gamepad2 className="size-4" />{lang === "en" ? "Mini games" : lang === "ru" ? "Мини-игры" : "Մինի խաղեր"}</Link>
                <Link to="/chat" onClick={close} className={item}>
                  <MessageSquare className="size-4" />{t.chat}
                </Link>
                <Link to="/calc" onClick={close} className={item}>
                  <Calculator className="size-4" />{t.calc}
                </Link>
                <Link to="/feedback" onClick={close} className={item}>
                  <MessageCircle className="size-4" />{t.feedback}
                </Link>
              </div>

              <div className="mt-auto space-y-2 border-t pt-4">
                <p className="flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Languages className="size-4" />{t.language}
                </p>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label={t.language}>
                  {(["hy", "en", "ru"] as const).map((l) => (
                    <Button
                      key={l}
                      variant={lang === l ? "default" : "outline"}
                      aria-pressed={lang === l}
                      onClick={() => setLang(l)}
                    >
                      {LANG_NAMES[l]}
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
