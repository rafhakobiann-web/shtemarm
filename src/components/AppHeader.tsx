import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight, BookOpen, Compass, Download, GraduationCap, HeartHandshake,
  History, House, Languages, Menu, MessageCircle, Moon, Search, Sun, UserRound, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { initLang, setLang, useLang, type Lang } from "@/lib/lang";
import { resolvedTheme, setAppearance, useAppearance } from "@/lib/theme";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";

const LANG_NAMES: Record<Lang,string> = {hy:"Հայերեն",en:"English",ru:"Русский"};

const COPY = {
  hy: {
    nav:"Հիմնական նավարկում", home:"Գլխավոր", explore:"Բացահայտել", exams:"Քննություններ",
    tools:"Գործիքներ", profile:"Իմ պրոֆիլը", more:"Ավելին", menu:"Նավարկում",
    account:"Հաշիվ", dark:"Մուգ տեսք", language:"Լեզու", browse:"Գտիր անհրաժեշտը",
    resources:"Այլ հղումներ", download:"Ներբեռնել հավելվածը", updates:"Թարմացումներ",
    support:"Աջակցություն", feedback:"Գրել մեզ", landing:"Ներկայացման էջ",
    examHint:"Քննություններ և վարժանքներ՝ ըստ առարկայի",
  },
  en: {
    nav:"Main navigation", home:"Home", explore:"Explore", exams:"Exams", tools:"Tools",
    profile:"My Profile", more:"More",menu:"Navigation",account:"Account",
    dark:"Dark mode",language:"Language",browse:"Find what you need",
    resources:"Other links",download:"Download app",updates:"What's new",
    support:"Support",feedback:"Contact us",landing:"About Shtemarm",
    examHint:"Exams and practice by subject",
  },
  ru: {
    nav:"Основное меню",home:"Главная",explore:"Обзор",exams:"Экзамены",tools:"Инструменты",
    profile:"Мой профиль",more:"Ещё",menu:"Навигация",account:"Аккаунт",
    dark:"Тёмная тема",language:"Язык",browse:"Найди нужное",
    resources:"Другие ссылки",download:"Скачать приложение",updates:"Обновления",
    support:"Поддержка",feedback:"Связаться",landing:"О Shtemarm",
    examHint:"Экзамены и задания по предметам",
  },
} as const;

export function AppHeader() {
  const lang = useLang();
  const t = COPY[lang];
  const location = useLocation();
  const appearance = useAppearance();
  const [hydrated,setHydrated] = useState(false);
  const [open,setOpen] = useState(false);
  const [email,setEmail] = useState<string|null>(null);

  useEffect(() => {initLang();setHydrated(true);}, []);
  useEffect(() => {
    if (!hasSupabaseConfig()) {setEmail(null);return;}
    let active = true;
    let eventReceived = false;
    try {
      const {data} = supabase.auth.onAuthStateChange((_event,session) => {
        eventReceived = true;
        if(active) setEmail(session?.user?.email??null);
      });
      void supabase.auth.getUser().then(({data,error}) => {
        if(active&&!eventReceived) setEmail(error?null:data.user?.email??null);
      }).catch(() => {if(active&&!eventReceived)setEmail(null);});
      return () => {active=false;data.subscription.unsubscribe();};
    } catch {setEmail(null);}
  }, []);

  const close = () => setOpen(false);
  const navClass = "inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary";
  const menuClass = "flex min-h-12 min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary";
  const route = location.pathname;
  const examActive = route === "/explore" && location.hash?.replace(/^#/, "") === "exams";
  const exploreActive = route === "/explore" && !examActive;
  const profileActive = route === "/profile";
  const current = (yes:boolean) => yes ? "bg-primary/10 text-primary" : "";

  return (
    <header className="site-header sht-explore-header sticky top-0 z-30 border-b bg-card/95">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:px-5">
        <Link to="/dashboard" aria-label="Shtemarm" className="inline-flex min-h-11 min-w-0 shrink-0 items-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-primary">
          <img src="/shtemarm-logo.svg" alt="" aria-hidden="true" className="size-10 object-contain" />
          <span className="truncate text-base font-black tracking-tight text-foreground sm:text-lg">Shtemarm</span>
        </Link>

        <nav aria-label={t.nav} className="hidden items-center gap-1 lg:flex">
          <Link to="/dashboard" className={navClass+" "+current(route==="/dashboard")}><House className="size-4"/>{t.home}</Link>
          <Link to="/explore" className={navClass+" "+current(exploreActive)}><Compass className="size-4"/>{t.explore}</Link>
          <Link to="/explore" hash="exams" className={navClass+" "+current(examActive)}><GraduationCap className="size-4"/>{t.exams}</Link>
          <Link to="/study-tools" className={navClass+" "+current(route==="/study-tools")}><Wrench className="size-4"/>{t.tools}</Link>
          <Link to="/profile" className={navClass+" "+current(profileActive)}><UserRound className="size-4"/>{t.profile}</Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link to="/explore" aria-label={lang==="hy"?"Որոնել առարկաներ":lang==="ru"?"Найти предметы":"Find subjects"}
            className="grid size-11 place-items-center rounded-xl border bg-card text-primary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary lg:hidden">
            <Search className="size-5" aria-hidden="true"/>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <Button variant="outline" size="icon" className="size-11 rounded-xl" aria-label={t.more} onClick={() => setOpen(true)}>
              <Menu className="size-5" aria-hidden="true" />
            </Button>
            <SheetContent side="right" className="flex w-[min(22rem,92vw)] flex-col gap-5 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-lg font-black">{t.menu}</SheetTitle>
                <SheetDescription className="text-sm">{t.browse}</SheetDescription>
              </SheetHeader>

              <nav aria-label={t.nav} className="grid gap-1">
                <Link to="/dashboard" onClick={close} className={menuClass}><House className="size-5 text-primary"/>{t.home}<ArrowRight className="ml-auto size-4 text-muted-foreground"/></Link>
                <Link to="/explore" onClick={close} className={menuClass}><Compass className="size-5 text-primary"/>{t.explore}<ArrowRight className="ml-auto size-4 text-muted-foreground"/></Link>
                <Link to="/explore" hash="exams" onClick={close} className={menuClass}><GraduationCap className="size-5 text-primary"/>{t.exams}<ArrowRight className="ml-auto size-4 text-muted-foreground"/></Link>
                <Link to="/study-tools" onClick={close} className={menuClass}><Wrench className="size-5 text-primary"/>{t.tools}<ArrowRight className="ml-auto size-4 text-muted-foreground"/></Link>
                {email && <Link to="/profile" onClick={close} className={menuClass}><UserRound className="size-5 text-primary"/>{t.profile}<ArrowRight className="ml-auto size-4 text-muted-foreground"/></Link>}
              </nav>

              <div className="space-y-1 border-t pt-4">
                <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.resources}</p>
                <Link to="/download" onClick={close} className={menuClass}><Download className="size-4"/>{t.download}</Link>
                <Link to="/changelog" onClick={close} className={menuClass}><History className="size-4"/>{t.updates}</Link>
                <Link to="/feedback" onClick={close} className={menuClass}><MessageCircle className="size-4"/>{t.feedback}</Link>
                <Link to="/support" onClick={close} className={menuClass}><HeartHandshake className="size-4"/>{t.support}</Link>
                <Link to="/" onClick={close} className={menuClass}><BookOpen className="size-4"/>{t.landing}</Link>
              </div>

              <div className="mt-auto space-y-4 border-t pt-4">
                <div className="flex min-h-11 items-center justify-between gap-3 px-3">
                  <span className="flex items-center gap-2 text-sm font-bold"><Moon className="size-4"/>{t.dark}</span>
                  <Switch checked={hydrated&&resolvedTheme(appearance)==="dark"}
                    onCheckedChange={enabled=>setAppearance({mode:enabled?"dark":"light"})}
                    aria-label={t.dark} />
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 px-3 text-sm font-bold"><Languages className="size-4"/>{t.language}</p>
                  <div role="group" aria-label={t.language} className="grid grid-cols-3 gap-2">
                    {(["hy","en","ru"] as const).map(code=><button key={code} type="button" aria-pressed={lang===code}
                      onClick={()=>setLang(code)} className={"min-h-11 rounded-xl border px-1.5 text-xs font-bold focus-visible:outline-2 focus-visible:outline-primary "+
                      (lang===code?"border-primary bg-primary/10 text-primary":"bg-card text-foreground hover:bg-muted")}>
                      {LANG_NAMES[code]}
                    </button>)}
                  </div>
                </div>
                <Link to="/auth" onClick={close} className={menuClass}>
                  <UserRound className="size-4"/>
                  <span className="min-w-0 flex-1 truncate">{email??t.account}</span>
                  <ArrowRight className="size-4 text-muted-foreground"/>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
