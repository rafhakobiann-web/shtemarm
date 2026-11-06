import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  ArrowLeft, ArrowRight, Atom, BookOpen, BookText, Calculator,
  CheckCircle2, Download, FlaskConical, Languages, RotateCcw, ShieldCheck,
} from "lucide-react";
import { initLang, setLang, useLang } from "@/lib/lang";
import {
  GUEST_QUESTIONS, GUEST_SUBJECT_NAMES, GUEST_SUBJECTS,
  type GuestSubject, type GuestLocale,
} from "@/lib/guest-preview";

const searchSchema = z.object({
  subject: z.enum(GUEST_SUBJECTS as [GuestSubject, ...GuestSubject[]]).catch("math"),
});

export const Route = createFileRoute("/guest")({
  staticData: { sitemap: true },
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Try Shtemarm without signing in | Shtemarm" },
      { name: "description", content: "Try original sample questions in six subjects without an account. Explanations are shown after each answer. Nothing is saved." },
    ],
  }),
  component: GuestPracticePage,
});

const ICONS = {
  math: Calculator, english: Languages, armenian: BookText,
  history: BookOpen, biology: FlaskConical, physics: Atom,
};

const WORDS = {
  hy: {
    badge:"Հյուրի ռեժիմ", title:"Փորձիր Shtemarm-ը՝ առանց գրանցվելու",
    intro:"Ընտրիր առարկան և լուծիր երկու օրինակ՝ բացատրություններով։ Հաշիվ ստեղծելու կարիք չկա։",
    demo:"Ցուցադրական առաջադրանքներ", note:"Սրանք հատուկ ստեղծված օրինակներ են, ոչ թե բնօրինակ շտեմարանների հարցեր։",
    privacy:"Պատասխանները չեն պահպանվում կամ համաժամացվում։", choose:"Ընտրիր առարկան",
    question:"Հարց", from:"ից", check:"Ստուգել պատասխանը", skip:"Բաց թողնել",
    next:"Հաջորդ հարցը", finish:"Տեսնել արդյունքը", correct:"Ճիշտ է։",
    incorrect:"Դիտենք ճիշտ տարբերակը։", answer:"Ճիշտ պատասխանը", explanation:"Ինչո՞ւ",
    complete:"Փոքրիկ փորձարկումն ավարտված է", score:"Ճիշտ պատասխաններ",
    again:"Կրկնել այս առարկան", more:"Ընտրել մեկ այլ առարկա",
    join:"Մուտք / Գրանցում", joinDesc:"Հաշվով հասանելի են ամբողջական շտեմարաններն ու առաջընթացի պահպանումը։",
    back:"Գլխավոր էջ", download:"Ներբեռնել հավելվածը",
    reading:"Կարդա տեքստը և պատասխանիր հարցին",
  },
  en: {
    badge:"Guest mode", title:"Try Shtemarm without signing in",
    intro:"Pick a subject and try two sample questions with explanations. No account is needed.",
    demo:"Sample exercises", note:"These are original examples, not questions copied from the official workbooks.",
    privacy:"Your answers are not saved or synced.", choose:"Choose a subject",
    question:"Question", from:"of", check:"Check answer", skip:"Skip",
    next:"Next question", finish:"See results", correct:"Correct!",
    incorrect:"Here's the right answer.", answer:"Correct answer", explanation:"Why?",
    complete:"Your mini practice is complete", score:"Correct answers",
    again:"Try this subject again", more:"Choose another subject",
    join:"Sign in / Sign up", joinDesc:"Sign in for the full workbooks and saved progress.",
    back:"Home", download:"Download app", reading:"Read the passage and answer",
  },
  ru: {
    badge:"Гостевой режим", title:"Попробуй Shtemarm без регистрации",
    intro:"Выбери предмет и реши два примера с объяснениями. Аккаунт не нужен.",
    demo:"Примеры заданий", note:"Это авторские примеры, а не задания из официальных сборников.",
    privacy:"Ответы не сохраняются и не синхронизируются.", choose:"Выбери предмет",
    question:"Вопрос", from:"из", check:"Проверить ответ", skip:"Пропустить",
    next:"Следующий вопрос", finish:"Посмотреть результат", correct:"Верно!",
    incorrect:"Вот правильный ответ.", answer:"Правильный ответ", explanation:"Почему?",
    complete:"Небольшая практика завершена", score:"Верных ответов",
    again:"Повторить этот предмет", more:"Выбрать другой предмет",
    join:"Вход / Регистрация", joinDesc:"С аккаунтом доступны полные сборники и сохранение прогресса.",
    back:"На главную", download:"Скачать приложение", reading:"Прочитай текст и ответь на вопрос",
  },
} satisfies Record<GuestLocale, Record<string, string>>;

function GuestPracticePage() {
  const lang = useLang();
  const t = WORDS[lang];
  const { subject } = Route.useSearch();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const questions = GUEST_QUESTIONS[subject];
  const completed = step >= questions.length;
  const current = completed ? undefined : questions[step];

  useEffect(() => { initLang(); }, []);
  // A new subject starts fresh. Never store guest scores or answers.
  useEffect(() => {
    setStep(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
  }, [subject]);

  const restart = () => {
    setStep(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
  };
  const next = () => {
    setStep(n => Math.min(n + 1, questions.length));
    setSelected(null);
    setRevealed(false);
  };
  const submit = () => {
    if (selected === null || !current || revealed) return;
    setRevealed(true);
    if (selected === current.correct) setCorrectCount(n => n + 1);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-3 sm:p-4">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-foreground hover:bg-muted">
          <ArrowLeft className="size-4" aria-hidden="true" /> Shtemarm
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border bg-background p-1" role="group" aria-label={lang === "hy" ? "Լեզու" : lang === "en" ? "Language" : "Язык"}>
            {(["hy","en","ru"] as const).map(code => (
              <button type="button" key={code} onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={"min-h-9 rounded-lg px-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-primary " +
                  (lang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <Link to="/auth" className="inline-flex min-h-11 items-center rounded-xl border px-3 text-sm font-semibold text-foreground hover:bg-muted">
            {t.join}
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border bg-card p-4 sm:p-7" aria-labelledby="guest-title">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
          <ShieldCheck className="size-4" aria-hidden="true" /> {t.badge}
        </div>
        <h1 id="guest-title" className="mt-4 max-w-3xl text-balance text-2xl font-black leading-tight text-foreground sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{t.intro}</p>
        <div className="mt-4 space-y-1 text-xs leading-relaxed text-muted-foreground">
          <p>{t.note}</p>
          <p>{t.privacy}</p>
        </div>
      </section>

      <section aria-labelledby="guest-subject-title" className="space-y-3">
        <h2 id="guest-subject-title" className="text-lg font-extrabold text-foreground">{t.choose}</h2>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label={t.choose}>
          {GUEST_SUBJECTS.map(id => {
            const Icon = ICONS[id];
            return (
              <Link key={id} to="/guest" search={{ subject: id }}
                aria-current={subject === id ? "page" : undefined}
                className={"flex min-h-14 min-w-0 items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-primary " +
                  (subject === id ? "border-primary bg-primary/10 text-foreground" : "bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground")}>
                <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 break-words">{GUEST_SUBJECT_NAMES[id][lang]}</span>
              </Link>
            );
          })}
        </nav>
      </section>

      <section className="min-w-0 space-y-5 rounded-2xl border bg-card p-4 sm:p-7" aria-label={t.demo}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black text-foreground">{GUEST_SUBJECT_NAMES[subject][lang]}</h2>
          <span className="rounded-full border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground" aria-live="polite">
            {completed ? t.complete : t.question + " " + (step + 1) + " " + t.from + " " + questions.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar"
          aria-label={t.demo} aria-valuemin={0} aria-valuemax={questions.length}
          aria-valuenow={Math.min(step + (revealed ? 1 : 0), questions.length)}>
          <div className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: String(100 * Math.min(step + (revealed ? 1 : 0), questions.length) / questions.length) + "%" }} />
        </div>

        {completed ? (
          <div role="status" className="space-y-4 py-4">
            <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
            <h3 className="text-xl font-black">{t.complete}</h3>
            <p className="text-base text-muted-foreground">{t.score}: <strong className="text-foreground">{correctCount} / {questions.length}</strong></p>
            <p className="text-sm leading-6 text-muted-foreground">{t.privacy}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90" onClick={restart}>
                <RotateCcw className="size-4" aria-hidden="true" />{t.again}
              </button>
              <a href="#guest-subject-title" className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-bold hover:bg-muted">{t.more}</a>
            </div>
          </div>
        ) : current ? (
          <div className="space-y-4">
            {current.reading && (
              <div className="space-y-2 rounded-xl border bg-muted/25 p-4">
                <p className="text-xs font-bold text-muted-foreground">{t.reading}</p>
                <p lang="en" className="text-base leading-8 text-foreground">{current.reading}</p>
              </div>
            )}
            <h3 className="text-lg font-bold leading-relaxed text-foreground">{current.prompt[lang]}</h3>
            <div className="grid gap-2" role="group" aria-label={current.prompt[lang]}>
              {current.options.map((option, index) => {
                const chosen = selected === index;
                const correct = current.correct === index;
                return (
                  <button key={index} type="button" disabled={revealed}
                    onClick={() => setSelected(index)} aria-pressed={chosen}
                    className={"flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default " +
                      (revealed && correct ? "border-primary bg-primary/10 text-foreground" :
                        revealed && chosen ? "border-destructive/50 bg-destructive/5 text-foreground" :
                        chosen ? "border-primary bg-primary/10 text-foreground" : "bg-background hover:border-primary/40")}>
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border text-xs">{String.fromCharCode(65 + index)}</span>
                    <span className="min-w-0 break-words">{option}</span>
                    {revealed && correct && <CheckCircle2 className="ml-auto size-5 shrink-0 text-primary" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <div role="status" aria-live="polite" className="space-y-2 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm leading-7 text-foreground">
                <p className="font-black">{selected === current.correct ? t.correct : t.incorrect}</p>
                <p>{t.answer}: <strong>{current.options[current.correct]}</strong></p>
                <p><strong>{t.explanation} </strong>{current.explanation[lang]}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {!revealed ? (
                <>
                  <button type="button" disabled={selected === null} onClick={submit}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
                    {t.check}<ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={next} className="min-h-11 rounded-xl border px-4 text-sm font-semibold hover:bg-muted">{t.skip}</button>
                </>
              ) : (
                <button type="button" onClick={next}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                  {step === questions.length - 1 ? t.finish : t.next}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        ) : null}
      </section>
      <aside className="flex flex-col gap-3 rounded-2xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-1">
          <h2 className="font-bold text-foreground">{t.join}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{t.joinDesc}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/auth" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90">{t.join}<ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link to="/download" className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold hover:bg-muted"><Download className="size-4" aria-hidden="true" />{t.download}</Link>
        </div>
      </aside>
    </div>
  );
}
