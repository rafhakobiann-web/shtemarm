import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, BookOpen, CheckCircle2, GraduationCap, Languages, ListChecks, ShieldCheck, Sparkles, Target, Trophy } from "lucide-react";
import { useLang } from "@/lib/lang";
import { supabase, ensureBrowserSupabaseConfig } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Shtemarm · Պատրաստվիր քննություններին քո ձևով" },
    { name: "description", content: "Shtemarm՝ շտեմարաններ, սխալների կրկնություն, ուսումնական պլան և առաջընթացի հետևում։" },
  ] }),
  component: LandingPage,
});
const COPY = {
  hy: { login:"Մուտք",start:"Սկսել անվճար",learn:"Իմանալ ավելին",tag:"Քո ուսումը՝ քո ռիթմով",hero:"Պատրաստվիր քննություններին ավելի վստահ",intro:"Սովորիր բնօրինակ շտեմարաններով, կրկնիր սխալներդ և հետևիր քո առաջընթացին՝ մեկ հարթակում։",benefits:"Ինչու ընտրել Shtemarm-ը",subjects:"Սովորիր քեզ անհրաժեշտ առարկաները",steps:"Ինչպես է աշխատում",preview:"Տես՝ ինչ է սպասվում քեզ",faq:"Հաճախ տրվող հարցեր",ready:"Պատրա՞ստ ես սկսել",readyDesc:"Ստեղծիր հաշիվ և սկսիր սովորել քո նպատակներով։",b1:"Շտեմարաններ",b1d:"Աշխատիր առարկայական հարցերով և ստուգիր պատասխաններդ։",b2:"Սխալների կրկնություն",b2d:"Վերադարձիր սխալ հարցերին ու ամրապնդիր գիտելիքներդ։",b3:"Անհատական պլան",b3d:"Ընտրիր առարկաներդ և ստացիր օրվա առաջադրանքներ։",b4:"XP և նվաճումներ",b4d:"Հետևիր առաջընթացին և նշիր փոքր հաղթանակներդ։",s1:"Ստեղծիր հաշիվ",s2:"Ընտրիր նպատակներդ",s3:"Սկսիր լուծել և կրկնել",demo:"Օրինակ՝ այսօրվա ուսումնական պլան",demo1:"Կրկնիր սխալ հարցերը",demo2:"Լուծիր նոր առաջադրանքներ",faq1:"Կարո՞ղ եմ սովորել առանց հաշվի։",faq1a:"Ուսումնական բաժիններից օգտվելու համար անհրաժեշտ է մուտք գործել։ Ներկայացման էջը բաց է բոլորի համար։",faq2:"Ի՞նչ կլինի նախկին առաջընթացիս հետ։",faq2a:"Նախկինում այս սարքում պահված առաջընթացը չի ջնջվում։ Մուտքից հետո հնարավորության դեպքում այն համաժամացվում է հաշվի հետ։",faq3:"Ո՞ր լեզուներն են հասանելի։",faq3a:"Ինտերֆեյսը հասանելի է հայերեն, անգլերեն և ռուսերեն։ Շտեմարանների հարցերը մնում են իրենց բնօրինակ լեզվով։"},
  en: {login:"Sign in",start:"Get started",learn:"Learn more",tag:"Learn at your own pace",hero:"Prepare for exams with confidence",intro:"Practice with question books, revisit mistakes and track your progress in one place.",benefits:"Why Shtemarm?",subjects:"Study the subjects you need",steps:"How it works",preview:"See what's waiting for you",faq:"Frequently asked questions",ready:"Ready to begin?",readyDesc:"Create an account and start learning toward your goals.",b1:"Question books",b1d:"Practice subject questions and check your answers.",b2:"Mistake review",b2d:"Return to missed questions and strengthen your knowledge.",b3:"Personal study plan",b3d:"Choose subjects and get daily learning tasks.",b4:"XP and achievements",b4d:"Track progress and celebrate small milestones.",s1:"Create an account",s2:"Choose your goals",s3:"Practice and review",demo:"Example daily study plan",demo1:"Review missed questions",demo2:"Practice new questions",faq1:"Can I study without an account?",faq1a:"Sign-in is required for study tools. The introductory page is public.",faq2:"What happens to my previous progress?",faq2a:"Previously saved progress on this device is not deleted and can be synced to your account when available.",faq3:"Which languages are available?",faq3a:"The interface supports Armenian, English and Russian. Original question text stays in its source language."},
  ru: {login:"Войти",start:"Начать",learn:"Подробнее",tag:"Учись в своём ритме",hero:"Готовься к экзаменам увереннее",intro:"Решай задания, повторяй ошибки и отслеживай прогресс на одной платформе.",benefits:"Почему Shtemarm?",subjects:"Изучай нужные предметы",steps:"Как это работает",preview:"Посмотри, что тебя ждёт",faq:"Частые вопросы",ready:"Готов начать?",readyDesc:"Создай аккаунт и учись в соответствии со своими целями.",b1:"Сборники заданий",b1d:"Решай вопросы по предметам и проверяй ответы.",b2:"Работа над ошибками",b2d:"Возвращайся к ошибкам и закрепляй знания.",b3:"Личный план",b3d:"Выбирай предметы и получай задания на день.",b4:"XP и достижения",b4d:"Следи за прогрессом и отмечай достижения.",s1:"Создай аккаунт",s2:"Выбери цели",s3:"Решай и повторяй",demo:"Пример плана на день",demo1:"Повтори ошибки",demo2:"Реши новые задания",faq1:"Можно ли учиться без аккаунта?",faq1a:"Для учебных разделов нужен вход. Вводная страница открыта всем.",faq2:"Что будет со старым прогрессом?",faq2a:"Прогресс, сохранённый на этом устройстве, не удаляется и может синхронизироваться с аккаунтом.",faq3:"Какие языки доступны?",faq3a:"Интерфейс доступен на армянском, английском и русском. Текст заданий остаётся на языке оригинала."},
};
const SUBJECTS = ["Հայոց լեզու","Անգլերեն","Մաթեմատիկա","Կենսաբանություն","Հայոց պատմություն","Ֆիզիկա","Քիմիա","Աշխարհագրություն","Русский язык"];
function LandingPage() {
  const lang = useLang();
  const t = COPY[lang];
  const navigate = useNavigate();
  const [active,setActive] = useState(0);
  useEffect(() => {
    let mounted = true;
    void ensureBrowserSupabaseConfig().then(ok => ok ? supabase.auth.getSession() : null).then(result => {
      if (mounted && result?.data.session) void navigate({to:"/dashboard",replace:true});
    }).catch(() => {});
    return () => {mounted=false};
  },[navigate]);
  const benefits = [[BookOpen,t.b1,t.b1d],[ListChecks,t.b2,t.b2d],[Target,t.b3,t.b3d],[Trophy,t.b4,t.b4d]] as const;
  return <div className="space-y-20 pb-16 sm:space-y-28">
    <section className="relative isolate flex min-h-[72vh] flex-col items-center justify-center overflow-hidden rounded-[2rem] border bg-gradient-to-br from-primary/15 via-card to-violet-500/10 px-5 py-16 text-center sm:px-10">
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl"/>
      <span className="relative mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-bold text-primary"><Sparkles className="size-4"/>{t.tag}</span>
      <h1 className="relative max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">{t.hero}</h1>
      <p className="relative mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{t.intro}</p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/auth" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">{t.start}<ArrowRight className="size-4"/></Link>
        <a href="#benefits" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border bg-background px-6 py-3 font-bold transition-colors hover:bg-muted">{t.learn}<ArrowDown className="size-4"/></a>
      </div>
    </section>
    <section id="benefits" className="scroll-mt-24 space-y-7"><h2 className="text-center text-3xl font-black">{t.benefits}</h2><div className="grid gap-4 sm:grid-cols-2">{benefits.map(([Icon,title,desc]) => <article key={title} className="rounded-3xl border bg-card p-6 transition-transform duration-200 hover:-translate-y-1"><span className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-6"/></span><h3 className="text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p></article>)}</div></section>
    <section className="space-y-6"><h2 className="text-center text-3xl font-black">{t.subjects}</h2><div className="flex flex-wrap justify-center gap-3">{SUBJECTS.map(subject => <span key={subject} className="rounded-2xl border bg-card px-4 py-3 text-sm font-bold">{subject}</span>)}</div></section>
    <section className="space-y-7"><h2 className="text-center text-3xl font-black">{t.steps}</h2><div className="grid gap-4 md:grid-cols-3">{[t.s1,t.s2,t.s3].map((step,i) => <div key={step} className="rounded-3xl border bg-card p-6"><span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-lg font-black text-primary">{i+1}</span><h3 className="mt-5 text-lg font-black">{step}</h3></div>)}</div></section>
    <section className="space-y-6"><h2 className="text-center text-3xl font-black">{t.preview}</h2><div className="mx-auto max-w-2xl rounded-3xl border bg-card p-5 shadow-sm sm:p-8"><div className="flex items-center gap-2 text-lg font-black"><GraduationCap className="size-6 text-primary"/>{t.demo}</div><div className="mt-6 grid gap-3 sm:grid-cols-2">{[t.demo1,t.demo2].map((item,i) => <button key={item} type="button" onClick={() => setActive(i)} aria-pressed={active===i} className={`rounded-2xl border p-5 text-left transition-colors ${active===i?"border-primary bg-primary/10":"hover:bg-muted"}`}><CheckCircle2 className="mb-3 size-5 text-primary"/><p className="font-bold">{item}</p><p className="mt-2 text-xs text-muted-foreground">{active===i?"✓ "+t.preview:t.learn}</p></button>)}</div><p className="mt-4 text-xs text-muted-foreground">{t.preview} · {t.demo}</p></div></section>
    <section className="mx-auto max-w-3xl space-y-6"><h2 className="text-center text-3xl font-black">{t.faq}</h2>{[[t.faq1,t.faq1a],[t.faq2,t.faq2a],[t.faq3,t.faq3a]].map(([q,a]) => <details key={q} className="group rounded-2xl border bg-card p-5"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p></details>)}</section>
    <section className="rounded-3xl border bg-primary/10 p-8 text-center sm:p-12"><h2 className="text-3xl font-black">{t.ready}</h2><p className="mt-3 text-muted-foreground">{t.readyDesc}</p><Link to="/auth" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground">{t.start}<ArrowRight className="size-4"/></Link></section>
  </div>;
}
