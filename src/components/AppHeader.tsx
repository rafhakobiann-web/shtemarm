import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Star, User, Menu, BookOpen, Info, MessageSquare, Languages, Moon, Sun, Calculator, MessageCircle, Gamepad2, Wrench, Bookmark, History, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { resolvedTheme, setAppearance, useAppearance } from "@/lib/theme";
import { useProgress, level } from "@/lib/progress";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
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
    if (!hasSupabaseConfig()) {
      setEmail(null);
      return;
    }
    let active = true;
    // Auth events can arrive before the initial lookup finishes. Never let an
    // older getUser response overwrite the newer signed-in/out state.
    let authEventSeen = false;
    try {
      const { data } = supabase.auth.onAuthStateChange((_e, session) => {
        authEventSeen = true;
        if (active) setEmail(session?.user?.email ?? null);
      });
      void supabase.auth.getUser()
        .then(({ data: result, error }) => {
          if (active && !authEventSeen) setEmail(error ? null : result.user?.email ?? null);
        })
        .catch(() => {
          if (active && !authEventSeen) setEmail(null);
        });
      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    } catch (error) {
      console.warn("[Shtemarm] Account menu is temporarily unavailable", error);
      setEmail(null);
    }
  }, []);

  const close = () => setOpen(false);
  const item = "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/85 hover:bg-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-primary";

  return (
    <header className="site-header sticky top-0 z-30 border-b border-border/80 bg-card/95">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-11 shrink-0 place-items-center rounded-[.85rem] border border-primary/10 bg-primary/10"><img src="/shtemarm-logo.svg" alt="" aria-hidden="true" className="size-9 object-contain" /></span>
          <span className="flex min-w-0 items-center gap-2"><span className="truncate font-display text-base font-black tracking-tight sm:text-lg">Shtemarm<span className="hidden text-xs font-bold uppercase tracking-[.18em] text-primary/80 sm:inline"> · Academy</span></span><span className="rounded-md border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black tracking-[0.12em] text-amber-700 dark:text-amber-300">BETA</span></span>
        </Link>
        <nav aria-label={lang === "ru" ? "Главное меню" : lang === "en" ? "Main navigation" : "Հիմնական նավարկում"}
          className="hidden items-center gap-1 lg:flex">
          <Link to="/" hash="subjects"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <BookOpen className="size-4"/>{t.subjects}
          </Link>
          <Link to="/" hash="exams"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <History className="size-4"/>{lang === "en" ? "Exams" : lang === "ru" ? "Экзамены" : "Քննություններ"}
          </Link>
          <Link to="/english-grammar" search={{book:1,section:2,topic:undefined}}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <BookOpen className="size-4"/>{lang === "en" ? "Grammar" : lang === "ru" ? "Грамматика" : "Քերականություն"}
          </Link>
          <Link to="/study-tools"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Wrench className="size-4"/>{lang === "en" ? "Study tools" : lang === "ru" ? "Инструменты" : "Գործիքներ"}
          </Link>
        </nav>
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

          <Link
            to="/download"
            title={lang === "en" ? "Download Shtemarm" : lang === "ru" ? "Скачать Shtemarm" : "Ներբեռնել Shtemarm-ը"}
            aria-label={lang === "en" ? "Download app" : lang === "ru" ? "Скачать приложение" : "Ներբեռնել հավելվածը"}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-primary/25 bg-primary/10 px-2.5 text-xs font-extrabold text-primary transition-colors hover:bg-primary/15 sm:px-3"
          >
            <Download className="size-[18px] shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{lang === "en" ? "Download" : lang === "ru" ? "Скачать" : "Ներբեռնել"}</span>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <Button variant="outline" size="icon" className="size-11 rounded-xl border-primary/15 bg-muted/35 hover:bg-primary/10" aria-label={t.openMenu} onClick={() => setOpen(true)}>
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
              <Link
                to="/download"
                onClick={close}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5 text-sm font-extrabold text-primary transition-colors hover:bg-primary/15"
              >
                <Download className="size-5" aria-hidden="true" />
                {lang === "en" ? "Download Shtemarm" : lang === "ru" ? "Скачать Shtemarm" : "Ներբեռնել հավելվածը"}
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
                <Link to="/subject/$subject" params={{subject:"physics"}} onClick={close} className={item}>
                  <BookOpen className="size-4"/>{lang === "en" ? "Physics" : lang === "ru" ? "Физика" : "Ֆիզիկա"}
                </Link>
                <Link to="/physics/original" onClick={close} className={item}>
                  <BookOpen className="size-4"/>{lang === "en" ? "Physics question books" : lang === "ru" ? "Сборники по физике" : "Ֆիզիկայի շտեմարաններ"}
                </Link>
              </div>

              <div className="space-y-1 border-t pt-3">
                <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{lang === "en" ? "Learning tools" : lang === "ru" ? "Инструменты" : "Ուսումնական գործիքներ"}</p>
                <Link to="/english-grammar" search={{book:1,section:2,topic:undefined}} onClick={close} className={item}>
                  <BookOpen className="size-4" />{lang === "en" ? "English grammar handbook" : lang === "ru" ? "Справочник грамматики" : "Անգլերենի կանոնների ձեռնարկ"}
                </Link>
                <Link to="/assessment-builder" onClick={close} className={item}>
                  <BookOpen className="size-4"/>{lang === "en" ? "Thematic assignments" : lang === "ru" ? "Тематические работы" : "Թեմատիկ և ամփոփիչ աշխատանքներ"}
                </Link>
                <Link to="/flashcards" onClick={close} className={item}>
                  <Bookmark className="size-4"/>{lang === "en" ? "Flashcards" : lang === "ru" ? "Карточки" : "Հիշողության քարտեր"}
                </Link>
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
                  <Wrench className="size-4" />{lang === "en" ? "Study tools" : lang === "ru" ? "Инструменты" : "Ուսումնական գործիքներ"}
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
