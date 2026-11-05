import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Bot, User, ThumbsDown, RotateCcw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatReply } from "@/lib/chat.functions";
import { cn } from "@/lib/utils";
import { useLang, useTx } from "@/lib/lang";
import { studyLabels, STUDY_MODE_DEFAULT, type StudyMode } from "@/lib/ai-study-modes";
import { useProgress } from "@/lib/progress";
import { clearTutorMemory, readTutorMemory, writeTutorMemory } from "@/lib/tutor-memory";

export const Route = createFileRoute("/chat")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { property: "og:title", content: "Չատբոտ · Shtemarm" },
      { property: "og:description", content: "Հարցրեք Shtemarm-ի օգնականին ուսման և քննության հարցերի մասին։" },
      { title: "Չատբոտ · Shtemarm" },
      { name: "description", content: "Հարցրեք Shtemarm-ի օգնականին ուսման և քննության հարցերի մասին։" },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string; failed?: boolean; offline?: boolean; needsReview?: boolean };

import { useKatex, RichText } from "@/components/MathText";


const STARTERS = ["Ինչպե՞ս պատրաստվեմ անգլերենի քննությանը", "Բացատրիր Հայոց պատմության թեստի ձևաչափը", "Ի՞նչ է միտոքոնդրիումը"];
const MODE_KEY = "shtemarm:tutor-mode:v1";
function readPreferredMode(): StudyMode {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    return saved === "hint" || saved === "explain" || saved === "quiz"
      ? saved : STUDY_MODE_DEFAULT;
  } catch { return STUDY_MODE_DEFAULT; }
}


function ChatPage() {
  const tx = useTx();
  const lang = useLang();
  const labels = studyLabels[lang];
  const progress = useProgress();
  const [personalize, setPersonalize] = useState(false);
  const [remember, setRemember] = useState(false);
  const [focusTopic, setFocusTopic] = useState("");
  useEffect(() => { const saved = readTutorMemory(); if (saved.enabled) { setRemember(true); setPersonalize(true); setFocusTopic(saved.focusTopics[0] ?? ""); setMode(saved.preferredMode); } }, []);
  const changeMemory = (enabled: boolean) => {
    setRemember(enabled);
    if (enabled) { setPersonalize(true); writeTutorMemory({ enabled: true, preferredMode: mode, focusTopics: focusTopic ? [focusTopic] : [] }); }
    else { clearTutorMemory(); }
  };
  const forgetMemory = () => { clearTutorMemory(); setRemember(false); setPersonalize(false); setFocusTopic(""); };
  const answerResults = Object.values(progress.answers);
  const studySummary = { reviewed: answerResults.length, incorrect: answerResults.filter(value => value === 0).length };
  const [mode,setMode] = useState<StudyMode>(STUDY_MODE_DEFAULT);
  // Save only the learning preference, never conversation text or signed tokens.
  useEffect(() => { setMode(readPreferredMode()); }, []);
  const selectMode = (next:StudyMode) => {
    setMode(next);
    try { localStorage.setItem(MODE_KEY, next); } catch { /* private browsing */ }
    if (remember) writeTutorMemory({ enabled: true, preferredMode: next, focusTopics: focusTopic ? [focusTopic] : [] });
  };

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<number, "bad" | "clear">>({});
  const endRef = useRef<HTMLDivElement>(null);
  // Opaque HMAC-signed context supplied by the server. No prior assistant
  // messages or browser-claimed roles are sent as trusted conversation history.
  const contextTokenRef = useRef<string | undefined>(undefined);
  const katex = useKatex();

  // The conversation lives only in this page's memory: nothing is stored in the browser or the database.
  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    // Keep error messages visible but never send them back as fake assistant context.
    const next: Msg[] = [...messages.filter(m => !m.failed), { role: "user", content: content.slice(0, 2000) }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await chatReply({ data: {
        question:content, contextToken:contextTokenRef.current,
        mode, locale:lang,
        ...(personalize ? { studySummary } : {}),
        ...(remember && focusTopic ? { focusTopic } : {}),
      } });
      if ("contextToken" in res && typeof res.contextToken === "string")
        contextTokenRef.current = res.contextToken;
      setMessages((m) => [...m, { role: "assistant", content: res.error ? tx(res.text) : res.text, failed: !!res.error, offline: !!res.offline }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: tx("Չհաջողվեց պատասխանել։ Փորձեք կրկին։"), failed: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        endRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }, 50);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-black sm:text-3xl">{tx("Չատբոտ")}</h1>
        <p className="text-sm text-muted-foreground">{tx("Հարցրեք ուսման, թեմաների կամ քննության ձևաչափի մասին։")}</p>
      </header>


      <section aria-label={labels.title} className="glass rounded-2xl border p-3 sm:p-4">
        <h2 className="mb-1 text-sm font-bold">{labels.title}</h2>
        <p className="mb-3 text-xs text-muted-foreground">{labels.instruction}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label={labels.title}>
          {(["hint","explain","quiz"] as const).map(key=>(
            <button type="button" key={key} aria-pressed={mode===key}
              onClick={()=>selectMode(key)}
              className={cn("min-h-14 rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                mode===key?"border-primary bg-primary/10 text-foreground":"border-border bg-card/75 hover:border-primary/40")}>
              <span className="block text-sm font-bold">{labels[key]}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{labels[key+"Description" as "hintDescription"|"explainDescription"|"quizDescription"]}</span>
            </button>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-primary/10 bg-card/70 p-3 text-sm">
          <input type="checkbox" checked={personalize} onChange={event => setPersonalize(event.target.checked)} className="mt-1 size-4 accent-primary" />
          <span className="space-y-1"><strong className="block">{lang === "hy" ? "Անհատականացնել իմ առաջընթացով" : lang === "ru" ? "Учитывать мой прогресс" : "Personalize using my progress"}</strong>
          <span className="block text-xs leading-5 text-muted-foreground">{lang === "hy" ? "Միայն քո համաձայնությամբ AI-ին կփոխանցվեն լուծված և այժմ սխալ նշված հարցերի ընդհանուր քանակները՝ առանց հարցերի տեքստերի։ Կարող ես ցանկացած պահին անջատել։" : lang === "ru" ? "Только с твоего согласия ИИ получит общие числа решённых и неверных ответов без текста вопросов. Можно отключить в любой момент." : "Only with your permission, share counts of answered and currently incorrect questions, never their text. Turn off anytime."}</span></span>
        </label>
        <div className="mt-3 space-y-3 rounded-xl border border-border bg-card/70 p-3">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={remember} onChange={event => changeMemory(event.target.checked)} className="mt-1 size-4 accent-primary" />
            <span><strong className="block">{lang === "hy" ? "Հիշել իմ ուսուցման նախընտրությունները" : lang === "ru" ? "Запомнить мои учебные предпочтения" : "Remember my learning preferences"}</strong>
              <span className="block text-xs leading-5 text-muted-foreground">{lang === "hy" ? "Միայն այս դիտարկիչում կպահվեն ուսուցման ձևն ու քո նշած թեման։ Զրույցները չեն պահպանվի։" : lang === "ru" ? "Только в этом браузере сохраняются режим обучения и выбранная тема. Переписка не сохраняется." : "Save your learning mode and chosen topic in this browser only. Conversations are not saved."}</span>
            </span>
          </label>
          {remember && <label className="block space-y-1 text-xs font-semibold">
            <span>{lang === "hy" ? "Թեմա, որը ցանկանում եմ կրկնել (ըստ ցանկության)" : lang === "ru" ? "Тема для повторения (необязательно)" : "Topic to revisit (optional)"}</span>
            <input maxLength={60} value={focusTopic} onChange={event => { const topic = event.target.value; setFocusTopic(topic); writeTutorMemory({ enabled: true, preferredMode: mode, focusTopics: topic ? [topic] : [] }); }} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </label>}
          <button type="button" onClick={forgetMemory} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">{lang === "hy" ? "Ջնջել AI ուսուցչի հիշողությունը" : lang === "ru" ? "Удалить память ИИ-учителя" : "Clear tutor memory"}</button>
        </div>
      </section>

      <div className="glass flex min-h-[50vh] flex-col gap-3 rounded-3xl p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{tx("Սկսելու համար ընտրեք հարց կամ գրեք ձեր հարցը ներքևում։")}</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(tx(s))}
                  className="rounded-full border bg-card px-3 py-1.5 text-left text-sm font-semibold hover:border-primary/50"
                >
                  {tx(s)}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2", m.role === "user" && "justify-end")}>
            {m.role === "assistant" && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Bot className="size-4" /></span>}
            <div className="max-w-[85%] min-w-0 space-y-1">
            <div className={cn("whitespace-pre-line rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed break-words", m.role === "user" ? "bg-secondary text-secondary-foreground" : m.failed ? "border border-destructive/40 bg-destructive/5 text-foreground" : "bg-card border")}>
              {m.role==="assistant"&&m.offline&&<span className="mb-1 block text-xs font-semibold text-muted-foreground" role="status">
                {tx("Տեղային պատասխան (առանց AI-ի)")}
              </span>}
              <RichText text={m.content} katex={katex} />
            </div>
            {m.role === "assistant" && !m.failed && !m.offline && (
              <div className="flex flex-wrap items-center gap-1 px-1" aria-label={lang === "hy" ? "Պատասխանի գործողություններ" : lang === "ru" ? "Действия с ответом" : "Answer actions"}>
                <button type="button" aria-pressed={feedback[i] === "bad"}
                  onClick={() => setFeedback(previous => ({...previous, [i]: "bad"}))}
                  className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                  <ThumbsDown className="size-3.5" />
                  {lang === "hy" ? "Սխալ պատասխան" : lang === "ru" ? "Неверный ответ" : "Incorrect answer"}
                </button>
                <button type="button" disabled={loading}
                  onClick={() => void send(lang === "hy"
                    ? "Վերաբացատրիր նախորդ պատասխանդ պարզ, բնական հայերենով, առանց կրկնությունների։ Բանաձևերը գրիր միայն ճիշտ LaTeX-ով։"
                    : lang === "ru" ? "Объясни предыдущий ответ проще и короче, без повторов."
                    : "Explain your previous answer more simply and briefly without repetition.")}
                  className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                  <RotateCcw className="size-3.5" />
                  {lang === "hy" ? "Ավելի պարզ" : lang === "ru" ? "Проще" : "Simplify"}
                </button>
                <button type="button" disabled={loading}
                  onClick={() => void send(lang === "hy" ? "Բացատրիր նախորդ պատասխանդ մեկ նոր, ճիշտ և պարզ օրինակով։" : lang === "ru" ? "Приведи другой простой пример." : "Explain using one different clear example.")}
                  className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                  <BookOpen className="size-3.5" />
                  {lang === "hy" ? "Այլ օրինակ" : lang === "ru" ? "Другой пример" : "Another example"}
                </button>
                {feedback[i] === "bad" && <span role="status" className="text-xs text-muted-foreground">{lang === "hy" ? "Նշված է որպես սխալ (միայն այս զրույցում)" : lang === "ru" ? "Отмечено в этом чате" : "Marked in this chat"}</span>}
              </div>
            )}
            </div>
            {m.role === "user" && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted"><User className="size-4" /></span>}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> {tx("Պատասխանը պատրաստվում է…")}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={2}
          maxLength={2000}
          placeholder={tx("Գրեք ձեր հարցը…")}
          aria-label={tx("Հաղորդագրություն")}
          className="min-h-11 flex-1 resize-none rounded-2xl border bg-background px-4 py-2.5 text-[0.95rem] focus:border-primary focus:outline-none"
        />
        <Button type="submit" disabled={loading || !input.trim()} aria-label={tx("Ուղարկել")} className="h-11 gap-1">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
