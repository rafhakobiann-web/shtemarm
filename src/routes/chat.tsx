import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatReply } from "@/lib/chat.functions";
import { cn } from "@/lib/utils";
import { useLang, useTx } from "@/lib/lang";
import { studyLabels, STUDY_MODE_DEFAULT, type StudyMode } from "@/lib/ai-study-modes";
import { ExplanationContent } from "@/components/RichExplanation";
import { tutorUi } from "@/lib/tutor-ui";

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

type Msg = { role: "user" | "assistant"; content: string; failed?: boolean; offline?: boolean };

import { useKatex, RichText } from "@/components/MathText";


const MODE_KEY = "shtemarm:tutor-mode:v1";
function readPreferredMode(): StudyMode {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    return saved === "hint" || saved === "explain" || saved === "quiz"
      ? saved : STUDY_MODE_DEFAULT;
  } catch { return STUDY_MODE_DEFAULT; }
}


export function ChatPage() {
  const tx = useTx();
  const lang = useLang();
  const labels = studyLabels[lang];
  const ui = tutorUi[lang];
  const [mode,setMode] = useState<StudyMode>(STUDY_MODE_DEFAULT);
  // Save only the learning preference, never conversation text or signed tokens.
  useEffect(() => { setMode(readPreferredMode()); }, []);
  const selectMode = (next:StudyMode) => {
    setMode(next);
    try { localStorage.setItem(MODE_KEY, next); } catch { /* private browsing */ }
  };

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  const endRef = useRef<HTMLDivElement>(null);
  // Opaque HMAC-signed context supplied by the server. No prior assistant
  // messages or browser-claimed roles are sent as trusted conversation history.
  const contextTokenRef = useRef<string | undefined>(undefined);
  const katex = useKatex();

  // The conversation lives only in this page's memory: nothing is stored in the browser or the database.
  const send = async (text: string, retry = false) => {
    const content = text.trim();
    if (!content || content.length > 2000 || pendingRef.current) return;
    pendingRef.current = true;
    // Keep error messages visible but never send them back as fake assistant context.
    const previous = messages.filter(m => !m.failed);
    const next: Msg[] = retry ? previous : [...previous, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await chatReply({ data: {
        question:content, contextToken:contextTokenRef.current,
        mode, locale:lang,
      } });
      if (!mountedRef.current) return;
      if ("contextToken" in res && typeof res.contextToken === "string")
        contextTokenRef.current = res.contextToken;
      setMessages((m) => [...m, { role: "assistant", content: res.error ? tx(res.text) : res.text, failed: !!res.error, offline: !!res.offline }]);
    } catch {
      if (!mountedRef.current) return;
      setMessages((m) => [...m, { role: "assistant", content: tx("Չհաջողվեց պատասխանել։ Փորձեք կրկին։"), failed: true }]);
    } finally {
      pendingRef.current = false;
      if (!mountedRef.current) return;
      setLoading(false);
    }
  };
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView?.({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
  }, [messages, loading]);
  const lastQuestion = [...messages].reverse().find(message => message.role === "user")?.content;
  const resetConversation = () => {
    if (pendingRef.current) return;
    setMessages([]);
    setInput("");
    contextTokenRef.current = undefined;
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1"><h1 className="text-2xl font-black sm:text-3xl">{ui.title}</h1>
        <p className="text-sm text-muted-foreground">{ui.description}</p></div>
        {messages.length > 0 && <Button type="button" variant="outline" disabled={loading} onClick={resetConversation}>{ui.newChat}</Button>}
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
      </section>

      <div className="glass flex min-h-[50vh] flex-col gap-3 rounded-3xl p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{tx("Սկսելու համար ընտրեք հարց կամ գրեք ձեր հարցը ներքևում։")}</p>
            <div className="flex flex-wrap gap-2">
              {ui.starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border bg-card px-3 py-1.5 text-left text-sm font-semibold hover:border-primary/50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2", m.role === "user" && "justify-end")}>
            {m.role === "assistant" && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Bot className="size-4" /></span>}
            <div className={cn("min-w-0 max-w-[90%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed sm:max-w-[85%]", m.role === "user" ? "bg-secondary text-secondary-foreground" : m.failed ? "border border-destructive/40 bg-destructive/5 text-foreground" : "bg-card border")}>
              {m.role==="assistant"&&m.offline&&<span className="mb-1 block text-xs font-semibold text-muted-foreground" role="status">
                {tx("Տեղային պատասխան (առանց AI-ի)")}
              </span>}
              {m.role === "assistant" ? <ExplanationContent text={m.content}/> : <RichText text={m.content} katex={katex} />}
              {m.failed && i === messages.length - 1 && lastQuestion && <Button type="button" variant="outline" className="mt-3" disabled={loading}
                onClick={() => void send(lastQuestion, true)}>{ui.retry}</Button>}
            </div>
            {m.role === "user" && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted"><User className="size-4" /></span>}
          </div>
        ))}
        {loading && (
          <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
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
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
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
