import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Check, GraduationCap, ListChecks, Target } from "lucide-react";
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
  const chosen = subjects.length;
  const complete = chosen > 0;
  return (
    <div className="sht-onboard-layout">
      <aside className="sht-onboard-intro">
        <div className="sht-onboard-brandline">
          <span>SHTEMARM / SETUP</span>
          <span>01 — 02</span>
        </div>
        <div className="sht-onboard-intro-main">
          <span className="sht-onboard-overline">{tr("Քո ուսումնառության ուղղությունը", "Your learning direction", "Твой учебный маршрут")}</span>
          <h1>{tr("Սկսենք քեզ անհրաժեշտից։", "Start with what matters to you.", "Начнём с важного для тебя.")}</h1>
          <p>{tr("Ընտրիր առարկաներդ ու հիմնական նպատակը։ Հետո ամեն ինչ կարող ես փոխել։", "Choose your subjects and your main goal. You can change them later.", "Выбери предметы и главную цель. Позже всё можно изменить.")}</p>
        </div>
        <div className="sht-onboard-live-summary" aria-live="polite">
          <div><span>{tr("ԸՆՏՐՎԱԾ ԱՌԱՐԿԱՆԵՐ", "SUBJECTS SELECTED", "ВЫБРАНО ПРЕДМЕТОВ")}</span><strong>{String(chosen).padStart(2, "0")}</strong></div>
          <div className="sht-onboard-track" role="progressbar"
            aria-label={tr("Լրացման առաջընթաց", "Setup progress", "Прогресс настройки")}
            aria-valuemin={0} aria-valuemax={2} aria-valuenow={complete ? 2 : 1}>
            <span style={{ width: complete ? "100%" : "50%" }}/>
          </div>
          <p>{tr("Նախկին առաջընթացդ չի ջնջվի։", "Your existing progress stays intact.", "Твой прежний прогресс сохранится.")}</p>
        </div>
      </aside>

      <main className="sht-onboard-form">
        <div className="sht-onboard-mobile-label">SHTEMARM <span>01 / 02</span></div>
        <section className="sht-onboard-step" aria-labelledby="sht-onboard-subjects-title">
          <div className="sht-onboard-step-head">
            <span className="sht-onboard-step-num">01</span>
            <div>
              <p className="sht-onboard-step-overline">{tr("Քայլ առաջին", "First step", "Первый шаг")}</p>
              <h2 id="sht-onboard-subjects-title">{tr("Ո՞ր առարկաներն ես սովորում։", "What are you studying?", "Какие предметы ты изучаешь?")}</h2>
              <p>{tr("Կարող ես ընտրել մի քանիսը։", "Pick as many as you need.", "Можно выбрать несколько.")}</p>
            </div>
          </div>
          <div role="group" aria-labelledby="sht-onboard-subjects-title" className="sht-onboard-subjects">
            {ONBOARDING_SUBJECTS.map((subject, index) => {
              const active = subjects.includes(subject);
              return (
                <button type="button" key={subject} aria-pressed={active}
                  onClick={() => setSubjects(old => old.includes(subject) ? old.filter(x => x !== subject) : [...old, subject])}
                  className="sht-onboard-subject">
                  <span className="sht-onboard-subject-index">{String(index + 1).padStart(2, "0")}</span>
                  <span>{NAMES[subject][i]}</span>
                  <span aria-hidden="true" className="sht-onboard-selection-mark">{active ? <Check size={15} /> : null}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="sht-onboard-step" aria-labelledby="sht-onboard-goal-title">
          <div className="sht-onboard-step-head">
            <span className="sht-onboard-step-num">02</span>
            <div>
              <p className="sht-onboard-step-overline">{tr("Քայլ երկրորդ", "Second step", "Второй шаг")}</p>
              <h2 id="sht-onboard-goal-title">{tr("Ի՞նչ արդյունք ես ուզում։", "What's your main goal?", "Какова твоя главная цель?")}</h2>
              <p>{tr("Ընտրիր քեզ առավել համապատասխանող տարբերակը։", "Choose the one that fits best.", "Выбери подходящий вариант.")}</p>
            </div>
          </div>
          <div role="group" aria-labelledby="sht-onboard-goal-title" className="sht-onboard-goals">
            {([
              ["exam", tr("Պատրաստվել քննություններին", "Prepare for exams", "Подготовиться к экзаменам"), GraduationCap],
              ["practice", tr("Ամեն օր սովորել", "Practice daily", "Учиться каждый день"), BookOpen],
              ["review", tr("Ուղղել սխալները", "Review mistakes", "Повторять ошибки"), ListChecks],
            ] as const).map(([id, label, Icon], index) => (
              <button key={id} type="button" aria-pressed={goal === id} onClick={() => setGoal(id)}
                className="sht-onboard-goal">
                <span className="sht-onboard-goal-number">{String(index + 1).padStart(2, "0")}</span>
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
                <span className="sht-onboard-goal-choice" aria-hidden="true">{goal === id && <Check size={14} />}</span>
              </button>
            ))}
          </div>
        </section>
        {problem && <p role="alert" className="sht-onboard-error">{problem}</p>}
        <div className="sht-onboard-footer">
          <p>{tr("Քո ընտրությունները կարող ես փոխել ավելի ուշ։", "You can change your choices later.", "Ты сможешь изменить свой выбор позже.")}</p>
          <button type="button" disabled={!userId || !complete} onClick={finish} className="sht-onboard-continue">
            {tr("Շարունակել", "Continue", "Продолжить")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>
  );
}
