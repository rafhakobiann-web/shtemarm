import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, ListChecks, Target } from "lucide-react";
import { useLang } from "@/lib/lang";
import { supabase, ensureBrowserSupabaseConfig } from "@/integrations/supabase/client";
import { ONBOARDING_SUBJECTS, saveOnboarding, type OnboardingSubject, type OnboardingProfile } from "@/lib/onboarding";
export const Route = createFileRoute("/onboarding")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Ուսումնական միջավայրի ընտրություն · Shtemarm" },
    { name: "description", content: "Ընտրիր քո առարկաները և ուսման նպատակը Shtemarm-ում։" },
    { property: "og:title", content: "Ուսումնական միջավայրի ընտրություն · Shtemarm" },
    { property: "og:description", content: "Անհատականացրու քո ուսումնական միջավայրը։" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: OnboardingPage,
});
const NAMES: Record<OnboardingSubject,[string,string,string]> = {
  english:["Անգլերեն","English","Английский"],math:["Մաթեմատիկա","Math","Математика"],
  armenian:["Հայոց լեզու","Armenian","Армянский"],history:["Հայոց պատմություն","Armenian history","История Армении"],
  biology:["Կենսաբանություն","Biology","Биология"],physics:["Ֆիզիկա","Physics","Физика"],
  chemistry:["Քիմիա","Chemistry","Химия"],geography:["Աշխարհագրություն","Geography","География"],
  russian:["Ռուսաց լեզու","Russian","Русский"],
};
function OnboardingPage() {
  const lang=useLang(),i=lang==="en"?1:lang==="ru"?2:0;
  const tr=(hy:string,en:string,ru:string)=>[hy,en,ru][i]!;
  const nav=useNavigate();
  const [userId,setUserId]=useState("");
  const [subjects,setSubjects]=useState<OnboardingSubject[]>([]);
  const [goal,setGoal]=useState<OnboardingProfile["goal"]>("exam");
  const [problem,setProblem]=useState("");
  useEffect(()=>{let active=true;void ensureBrowserSupabaseConfig().then(ok=>ok?supabase.auth.getUser():null).then(result=>{if(active&&result?.data.user)setUserId(result.data.user.id)}).catch(()=>{});return()=>{active=false}},[]);
  function finish() {
    if (!userId || subjects.length===0) return;
    const ok=saveOnboarding(userId,{subjects,goal,completedAt:new Date().toISOString()});
    if (!ok) {setProblem(tr("Չհաջողվեց պահպանել ընտրությունը։ Ստուգիր դիտարկչի հիշողությունը։","Could not save your choices. Check browser storage.","Не удалось сохранить выбор. Проверь память браузера."));return;}
    void nav({to:"/dashboard",replace:true});
  }
  return <div className="mx-auto max-w-3xl space-y-7 py-6">
    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary"><GraduationCap className="size-4"/>{tr("Բարի գալուստ Shtemarm","Welcome to Shtemarm","Добро пожаловать в Shtemarm")}</span>
    <h1 className="text-3xl font-black sm:text-4xl">{tr("Կազմենք քո ուսումնական միջավայրը","Set up your learning space","Настроим твоё обучение")}</h1>
    <p className="text-sm text-muted-foreground">{tr("Սա չի փոխի քո նախկին առաջընթացը։","Your previous progress will remain unchanged.","Твой предыдущий прогресс сохранится.")}</p>
    <section className="rounded-3xl border bg-card p-5 sm:p-7"><h2 className="flex items-center gap-2 text-lg font-black"><BookOpen className="size-5 text-primary"/>{tr("Ի՞նչ առարկաներ ես սովորում։","Which subjects are you studying?","Какие предметы ты изучаешь?")}</h2><div className="mt-5 flex flex-wrap gap-2">{ONBOARDING_SUBJECTS.map(s=><button type="button" key={s} aria-pressed={subjects.includes(s)} onClick={()=>setSubjects(old=>old.includes(s)?old.filter(x=>x!==s):[...old,s])} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${subjects.includes(s)?"border-primary bg-primary/10 text-primary":"hover:bg-muted"}`}>{NAMES[s][i]}</button>)}</div></section>
    <section className="rounded-3xl border bg-card p-5 sm:p-7"><h2 className="flex items-center gap-2 text-lg font-black"><Target className="size-5 text-primary"/>{tr("Ո՞րն է քո նպատակը։","What's your goal?","Какова твоя цель?")}</h2><div className="mt-4 grid gap-3">{([
      ["exam",tr("Պատրաստվել քննություններին","Prepare for exams","Подготовиться к экзаменам"),GraduationCap],
      ["practice",tr("Ամեն օր սովորել","Practice daily","Учиться каждый день"),BookOpen],
      ["review",tr("Ուղղել սխալները","Review mistakes","Повторять ошибки"),ListChecks],
    ] as const).map(([id,label,Icon])=><button key={id} type="button" aria-pressed={goal===id} onClick={()=>setGoal(id)} className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 text-left text-sm font-bold ${goal===id?"border-primary bg-primary/10":"hover:bg-muted"}`}><Icon className="size-5 text-primary"/>{label}</button>)}</div></section>
    {problem&&<p role="alert" className="text-sm text-destructive">{problem}</p>}
    <button type="button" disabled={!userId||subjects.length===0} onClick={finish} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 font-bold text-primary-foreground disabled:opacity-50">{tr("Անցնել իմ Dashboard","Go to my dashboard","Перейти в кабинет")}<ArrowRight className="size-4"/></button>
  </div>;
}
