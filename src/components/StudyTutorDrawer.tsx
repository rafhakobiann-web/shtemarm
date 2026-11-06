import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Loader2, ArrowLeft, ArrowRight, BookOpenCheck } from "lucide-react";
import { chatReply } from "@/lib/chat.functions";
import { useLang } from "@/lib/lang";
import { RichText, useKatex } from "@/components/MathText";
import { buildExplanationSteps } from "@/lib/explanation-steps";

type Message = { role: "user" | "assistant"; text: string };
const copy = {
  hy: { open:"Հարցնել AI ուսուցչին", title:"AI օգնական", intro:"Հարցրու այս բաժնի մասին։ Առաջադրանքի տեքստը ինքնաբերաբար չի փոխանցվում։", placeholder:"Գրիր քո հարցը…", send:"Ուղարկել", close:"Փակել AI օգնականը", error:"Պատասխան ստանալ չհաջողվեց։ Փորձիր կրկին։", note:"AI-ի պատասխանները կարող են սխալ լինել։ Ստուգիր շտեմարանի բանալին։" },
  en: { open:"Ask AI tutor", title:"AI assistant", intro:"Ask about this section. Question text is never shared automatically.", placeholder:"Type your question…", send:"Send", close:"Close AI assistant", error:"Could not get an answer. Please retry.", note:"AI responses may be inaccurate. Check the official answer key." },
  ru: { open:"Спросить ИИ", title:"ИИ-помощник", intro:"Задай вопрос об этом разделе. Текст заданий не отправляется автоматически.", placeholder:"Напиши вопрос…", send:"Отправить", close:"Закрыть ИИ-помощника", error:"Не удалось получить ответ. Попробуй ещё раз.", note:"ИИ может ошибаться. Сверяйся с ключами сборника." },
} as const;

/** Guided AI replies use the same safe, plain-text step parser as Math lessons.
 * The full reply is kept in memory only; no model output is interpreted as HTML. */
function GuidedTutorReply({text, lang, katex}:{
  text:string; lang:"hy"|"en"|"ru"; katex:ReturnType<typeof useKatex>;
}) {
  const steps = buildExplanationSteps([{kind:"text",value:text}]);
  const [index,setIndex] = useState(0);
  const labels = {
    hy:{step:"Քայլ",of:"-ից",previous:"Նախորդ քայլը",next:"Հաջորդ քայլը",finish:"Ավարտված է",go:"Անցնել քայլին"},
    en:{step:"Step",of:"of",previous:"Previous step",next:"Next step",finish:"Completed",go:"Go to step"},
    ru:{step:"Шаг",of:"из",previous:"Назад",next:"Следующий шаг",finish:"Завершено",go:"Перейти к шагу"},
  }[lang];
  if(steps.length<=1) return <RichText text={text} katex={katex}/>;
  const current=steps[Math.min(index,steps.length-1)];
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <strong role="status" className="text-sm text-primary">{labels.step} {index+1} {labels.of} {steps.length}</strong>
      <span className="text-xs font-bold text-muted-foreground">{Math.round((index+1)/steps.length*100)}%</span>
    </div>
    <div role="progressbar" aria-label={labels.step} aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={index+1}
      className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div className="h-full bg-primary" style={{width:(index+1)/steps.length*100+"%"}}/>
    </div>
    <nav aria-label={labels.step} className="sht-explanation-stepper">
      {steps.map((_,i)=><button type="button" key={i} aria-current={index===i?"step":undefined}
        aria-label={labels.go+" "+(i+1)} onClick={()=>setIndex(i)}>{i+1}</button>)}
    </nav>
    <div className="min-h-36 rounded-2xl border border-primary/25 bg-background p-4 text-base leading-8 sm:min-h-52 sm:p-6">
      <RichText text={current?.value??text} katex={katex}/>
    </div>
    <div className="flex items-center justify-between gap-3">
      <button type="button" disabled={index===0} onClick={()=>setIndex(n=>Math.max(0,n-1))}
        className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-bold disabled:opacity-40">
        <ArrowLeft className="size-4"/>{labels.previous}
      </button>
      <button type="button" disabled={index===steps.length-1} onClick={()=>setIndex(n=>Math.min(steps.length-1,n+1))}
        className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50">
        {index===steps.length-1?labels.finish:labels.next}
        {index===steps.length-1?<BookOpenCheck className="size-4"/>:<ArrowRight className="size-4"/>}
      </button>
    </div>
  </div>;
}

export function StudyTutorDrawer() {
  const lang = useLang();
  const t = copy[lang];
  const katex = useKatex();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<{ question: string; chosen: string } | null>(null);
  const [includeQuestion, setIncludeQuestion] = useState(false);
  useEffect(() => {
    const onSelect = (event: Event) => {
      const detail = (event as CustomEvent<{ question?: unknown; chosen?: unknown }>).detail;
      if (!detail || typeof detail.question !== "string") return;
      setSelectedQuestion({ question: detail.question.slice(0, 1200), chosen: typeof detail.chosen === "string" ? detail.chosen.slice(0, 100) : "" });
      setIncludeQuestion(false);
      setOpen(true);
    };
    window.addEventListener("shtemarm:tutor-question", onSelect);
    return () => window.removeEventListener("shtemarm:tutor-question", onSelect);
  }, []);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const contextToken = useRef<string | undefined>(undefined);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => { if (!open) triggerRef.current?.focus(); }, [open]);

  async function send() {
    const question = input.trim().slice(0, 2000);
    const sharedContext = includeQuestion && selectedQuestion ? `Selected exercise (student-approved): ${selectedQuestion.question}${selectedQuestion.chosen ? `\\nStudent-selected option: ${selectedQuestion.chosen}` : ""}\\n\\n` : "";
    const submittedQuestion = (sharedContext + question).slice(0, 2000);
    if (!question || loading) return;
    setMessages(previous => [...previous, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const result = await chatReply({ data: { question: submittedQuestion, contextToken: contextToken.current, mode: "adaptive", locale: lang } });
      if ("contextToken" in result && typeof result.contextToken === "string") contextToken.current = result.contextToken;
      setMessages(previous => [...previous, { role: "assistant", text: result.error ? t.error : result.text }]);
    } catch {
      setMessages(previous => [...previous, { role: "assistant", text: t.error }]);
    } finally { setLoading(false); }
  }
  return <>
    <button ref={triggerRef} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="study-ai-panel" className="fixed bottom-5 right-4 z-30 inline-flex min-h-12 items-center gap-2 rounded-full border border-primary/30 bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:bottom-6 sm:right-6">
      <Bot className="size-5" aria-hidden="true" />{t.open}
    </button>
    {open && <div className="fixed inset-0 z-40">
      <button type="button" aria-label={t.close} className="absolute inset-0 bg-black/35" onClick={() => setOpen(false)} />
      <section id="study-ai-panel" role="dialog" aria-modal="true" aria-label={t.title} className="sht-tutor-workspace absolute inset-2 flex flex-col overflow-hidden rounded-2xl border-2 border-primary/35 bg-background shadow-2xl sm:inset-5 sm:rounded-3xl">
        <header className="flex items-center justify-between border-b px-4 py-3"><h2 className="flex items-center gap-2 text-base font-black"><Bot className="size-5 text-primary" />{t.title}</h2><button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label={t.close} className="grid size-11 place-items-center rounded-xl hover:bg-muted"><X className="size-5" /></button></header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-7" aria-live="polite">
          <p className="text-sm leading-6 text-muted-foreground">{t.intro}</p>
          {messages.map((message,index) => <div key={index} className={message.role==="user"?"ml-auto max-w-3xl rounded-2xl bg-primary/10 p-4 text-sm":"mx-auto max-w-5xl rounded-2xl border bg-card p-4 text-sm sm:p-6"}>{message.role==="assistant"?<GuidedTutorReply text={message.text} lang={lang} katex={katex}/>:<RichText text={message.text} katex={katex}/>}</div>)}
          {loading && <p role="status"><Loader2 className="size-5 animate-spin text-primary" /></p>}
        </div>
        <div className="border-t p-3">{selectedQuestion && <div className="mb-3 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs"><strong className="block">{lang==="hy"?"Ընտրված առաջադրանք․ նախադիտում":lang==="ru"?"Выбранное задание: предпросмотр":"Selected question preview"}</strong><p className="max-h-24 overflow-auto whitespace-pre-wrap break-words">{selectedQuestion.question}</p>{selectedQuestion.chosen && <p>{lang==="hy"?"Ընտրված տարբերակ":lang==="ru"?"Выбранный вариант":"Selected option"}: {selectedQuestion.chosen}</p>}<label className="flex items-center gap-2"><input type="checkbox" checked={includeQuestion} onChange={event=>setIncludeQuestion(event.target.checked)} className="size-4 accent-primary" /><span>{lang==="hy"?"Համաձայն եմ փոխանցել այս տվյալները AI-ին":lang==="ru"?"Согласен передать эти данные ИИ":"I agree to share this context with AI"}</span></label><button type="button" className="underline underline-offset-2" onClick={()=>{setSelectedQuestion(null);setIncludeQuestion(false);}}>{lang==="hy"?"Հեռացնել համատեքստը":lang==="ru"?"Удалить контекст":"Remove context"}</button></div>}<p className="mb-2 text-xs text-muted-foreground">{t.note}</p><form onSubmit={event => { event.preventDefault(); void send(); }} className="flex items-end gap-2"><textarea value={input} onChange={event=>setInput(event.target.value)} rows={2} maxLength={2000} aria-label={t.placeholder} placeholder={t.placeholder} className="min-h-12 min-w-0 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm" /><button type="submit" disabled={loading || !input.trim()} aria-label={t.send} className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"><Send className="size-5" /></button></form></div>
      </section>
    </div>}
  </>;
}
