import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatReply } from "@/lib/chat.functions";
import { cn } from "@/lib/utils";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Չատբոտ · Shtemarm" },
      { name: "description", content: "Հարցրեք Shtemarm-ի օգնականին ուսման և քննության հարցերի մասին։" },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

import { useKatex, RichText } from "@/components/MathText";


const STARTERS = ["Ինչպե՞ս պատրաստվեմ անգլերենի քննությանը", "Բացատրիր Հայոց պատմության թեստի ձևաչափը", "Ի՞նչ է միտոքոնդրիումը"];

function ChatPage() {
  const tx = useTx();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const katex = useKatex();

  // The conversation lives only in this page's memory: nothing is stored in the browser or the database.
  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: content.slice(0, 2000) }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await chatReply({ data: { messages: next.slice(-20) } });
      setMessages((m) => [...m, { role: "assistant", content: res.error ? tx(res.text) : res.text }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: tx("Չհաջողվեց պատասխանել։ Փորձեք կրկին։") }]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-black sm:text-3xl">{tx("Չատբոտ")}</h1>
        <p className="text-sm text-muted-foreground">{tx("Հարցրեք ուսման, թեմաների կամ քննության ձևաչափի մասին։")}</p>
      </header>

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
            <p className={cn("max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed", m.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-card border")}>
              <RichText text={m.content} katex={katex} />
            </p>
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
