import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageSquare, Send, Music2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TIKTOK_URL } from "@/lib/site";
import { useTx } from "@/lib/lang";
import { submitFeedback, getMyFeedback } from "@/lib/feedback.functions";

export const Route = createFileRoute("/feedback")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Գրել մշակողին · Shtemarm" },
      { name: "description", content: "Ուղարկեք ձեր առաջարկը, սխալը կամ հարցը։" },
      { property: "og:title", content: "Գրել մշակողին · Shtemarm" },
    ],
  }),
  component: FeedbackPage,
});

type Mine = { id: string; message: string; reply: string | null; created_at: string; replied_at: string | null };
const CLIENT_KEY = "shtemarm-client-id";

function getClientId(): string {
  const existingId = window.localStorage.getItem(CLIENT_KEY);
  if (existingId) return existingId;

  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(CLIENT_KEY, id);
  return id;
}

function FeedbackPage() {
  const tx = useTx();
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [mine, setMine] = useState<Mine[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadMine = async (id: string) => {
    try {
      const feedback = await getMyFeedback({ data: { clientId: id } });
      setMine(Array.isArray(feedback) ? (feedback as Mine[]) : []);
      setLoadFailed(false);
    } catch {
      setMine([]);
      setLoadFailed(true);
      toast.error(tx("Չհաջողվեց բեռնել հաղորդագրությունները։"));
    }
  };

  useEffect(() => {
    try {
      const id = getClientId();
      setClientId(id);
      void loadMine(id);
    } catch {
      setMine([]);
      toast.error(tx("Չհաջողվեց բացել հաղորդագրությունները այս սարքում։"));
    }
    // This initialization should run only once when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async () => {
    const text = message.trim();
    if (!text || busy || !clientId) return;
    setBusy(true);
    setSendError(null);
    try {
      await submitFeedback({ data: { message: text.slice(0, 2000), contact: contact.trim().slice(0, 200), clientId } });
      setSent(true);
      setMessage("");
      setContact("");
      void loadMine(clientId);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "";
      const note = reason.includes("rate_limited")
        ? tx("Սպասեք մեկ րոպե՝ հաջորդ հաղորդագրությունն ուղարկելուց առաջ։")
        : tx("Չհաջողվեց ուղարկել։ Հնարավոր է՝ հետադարձ կապի ծառայությունը ժամանակավորապես անհասանելի է։");
      setSendError(note);
      toast.error(note);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
          <MessageSquare className="size-7 text-primary" /> {tx("Գրել մշակողին")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {tx("Գրեք ձեր հարցը կամ առաջարկը։ Հաղորդագրությունները ուղարկվում են մշակողին։ Անձնական պատասխանների դիտումը ժամանակավորապես անջատված է՝ գաղտնիությունը պաշտպանելու համար։")}
        </p>
      </header>

      {sent ? (
        <section className="shadow-card glass grid place-items-center gap-3 rounded-3xl p-8 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <p className="text-lg font-bold">{tx("Շնորհակալություն։ Հաղորդագրությունը ուղարկված է։")}</p>
          <Button variant="outline" onClick={() => setSent(false)}>
            {tx("Ուղարկել մեկ այլ հաղորդագրություն")}
          </Button>
        </section>
      ) : (
        <section className="shadow-card glass space-y-4 rounded-3xl p-5 sm:p-6">
          <p className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
            {tx("Գաղտնիություն․ հաղորդագրությունները հրապարակային չեն։ Անձնական պատասխանների ցուցադրումը ժամանակավորապես անջատված է անվտանգության պատճառով։ Մի ուղարկեք գաղտնաբառեր կամ զգայուն անձնական տվյալներ։")}
          </p>
          {sendError && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{sendError}</p>}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={tx("Գրեք ձեր հաղորդագրությունը մշակողին…")}
            rows={6}
            maxLength={2000}
            aria-label={tx("Հաղորդագրություն")}
          />
          <Input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={tx("Կապի տվյալներ (ոչ պարտադիր)՝ էլ. փոստ կամ TikTok անուն")}
            maxLength={200}
            aria-label={tx("Կապի տվյալներ")}
          />
          <Button variant="game" className="w-full" onClick={send} disabled={busy || !message.trim() || !clientId}>
            {busy ? <Loader2 className="animate-spin" /> : <Send />} {tx("Ուղարկել")}
          </Button>
        </section>
      )}

      <section className="shadow-card glass space-y-3 rounded-3xl p-5 sm:p-6">
        <h2 className="font-bold">{tx("Ձեր հաղորդագրությունները և պատասխանները")}</h2>
        {loadFailed && clientId && <Button variant="outline" onClick={() => void loadMine(clientId)}>{tx("Կրկին փորձել")}</Button>}
        {mine === null && <p className="text-sm text-muted-foreground">{tx("Բեռնվում է…")}</p>}
        {mine !== null && mine.length === 0 && <p className="text-sm text-muted-foreground">{tx("Անձնական հաղորդագրությունների պատմությունը ժամանակավորապես թաքցված է՝ գաղտնիությունը պաշտպանելու համար։ Նախկին հաղորդագրությունները չեն ջնջվել։")}</p>}
        {mine?.map((m) => (
          <div key={m.id} className="space-y-2 rounded-2xl border bg-white/60 p-4">
            <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
            <p className="whitespace-pre-wrap text-sm">{m.message}</p>
            {m.reply ? (
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs font-bold text-emerald-800">
                  {tx("Պատասխան")}{m.replied_at ? ` · ${new Date(m.replied_at).toLocaleString()}` : ""}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{m.reply}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{tx("Դեռ պատասխան չկա։")}</p>
            )}
          </div>
        ))}
      </section>

      <section className="shadow-card rounded-3xl border bg-card p-5 sm:p-6">
        <h2 className="font-bold">{tx("Կամ գրեք TikTok-ում")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {tx("Կարող եք նաև գրել ինձ TikTok-ում՝ մեկնաբանություններում կամ անմիջական հաղորդագրությամբ։")}
        </p>
        <a
          href={TIKTOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-foreground px-4 py-2.5 text-sm font-bold text-background"
        >
          <Music2 className="size-4" /> {tx("Բացել TikTok-ը")}
        </a>
      </section>
    </div>
  );
}
