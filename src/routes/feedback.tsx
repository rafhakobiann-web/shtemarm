import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageSquare, Send, Music2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { TIKTOK_URL } from "@/lib/site";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Կապ և առաջարկներ · Shtemarm" },
      { name: "description", content: "Ուղարկեք ձեր առաջարկը, սխալը կամ հարցը։" },
      { property: "og:title", content: "Կապ և առաջարկներ · Shtemarm" },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const tx = useTx();
  const [username, setUsername] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  // Signed-in users send with their account username; others type one.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.username as string | undefined;
      if (name) {
        setUsername(name);
        setSignedIn(true);
      }
    });
  }, []);

  const cleanName = username.trim().slice(0, 40);
  const cleanMessage = message.trim();
  const canSend = cleanName.length >= 2 && cleanMessage.length > 0 && !busy;

  const send = async () => {
    if (!canSend) return;
    setBusy(true);
    const { error } = await supabase.from("feedback").insert({ username: cleanName, message: cleanMessage.slice(0, 2000) });
    setBusy(false);
    if (error) {
      toast.error(tx("Չհաջողվեց ուղարկել։ Փորձեք կրկին կամ գրեք TikTok-ում։"));
      return;
    }
    setSent(true);
    setMessage("");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
          <MessageSquare className="size-7 text-primary" /> {tx("Կապ և առաջարկներ")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {tx("Գրեք ձեր առաջարկը, սխալը կամ հարցը։ Կարդում ենք բոլոր հաղորդագրությունները։")}
        </p>
      </header>

      {sent ? (
        <section className="shadow-card glass grid place-items-center gap-3 rounded-3xl p-8 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <p className="text-lg font-bold">{tx("Շնորհակալություն։ Հաղորդագրությունը ուղարկված է։")}</p>
          <Button variant="outline" onClick={() => setSent(false)}>{tx("Ուղարկել մեկ այլ հաղորդագրություն")}</Button>
        </section>
      ) : (
        <section className="shadow-card glass space-y-4 rounded-3xl p-5 sm:p-6">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            readOnly={signedIn}
            placeholder={tx("Ձեր օգտանունը")}
            maxLength={40}
            aria-label={tx("Օգտանուն")}
          />
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={tx("Ինչ պետք է բարելավել կամ ինչ սխալ եք գտել…")}
            rows={6}
            maxLength={2000}
            aria-label={tx("Հաղորդագրություն")}
          />
          <Button variant="game" className="w-full" onClick={send} disabled={!canSend}>
            {busy ? <Loader2 className="animate-spin" /> : <Send />} {tx("Ուղարկել")}
          </Button>
        </section>
      )}

      <section className="shadow-card rounded-3xl border bg-card p-5 sm:p-6">
        <h2 className="font-bold">{tx("Կամ գրեք TikTok-ում")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{tx("Կարող եք նաև գրել ինձ TikTok-ում՝ մեկնաբանություններում կամ անմիջական հաղորդագրությամբ։")}</p>
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
