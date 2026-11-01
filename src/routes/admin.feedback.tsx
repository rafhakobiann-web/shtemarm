import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminListFeedback, adminReplyFeedback } from "@/lib/feedback.functions";

export const Route = createFileRoute("/admin/feedback")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Հետադարձ կապ · Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminFeedbackPage,
});

type Row = { id: string; message: string; contact: string | null; reply: string | null; created_at: string; replied_at: string | null };

function AdminFeedbackPage() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      setRows((await adminListFeedback({ data: { password } })) as Row[]);
    } catch (e) {
      toast.error(e instanceof Error && e.message === "unauthorized" ? "Սխալ գաղտնաբառ" : "Չհաջողվեց բեռնել");
    } finally {
      setBusy(false);
    }
  };

  const reply = async (id: string) => {
    const text = (drafts[id] ?? "").trim();
    if (!text) return;
    try {
      await adminReplyFeedback({ data: { password, id, reply: text } });
      toast.success("Պատասխանը պահպանված է");
      setDrafts((d) => ({ ...d, [id]: "" }));
      await load();
    } catch {
      toast.error("Չհաջողվեց պահպանել");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="flex items-center gap-2 text-2xl font-black">
        <ShieldCheck className="size-6" /> Հետադարձ կապ
      </h1>

      {rows === null ? (
        <section className="shadow-card glass space-y-3 rounded-3xl p-5">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Գաղտնաբառ" />
          <Button className="w-full" onClick={load} disabled={busy || !password}>
            {busy ? <Loader2 className="animate-spin" /> : null} Մուտք
          </Button>
        </section>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Ընդամենը՝ {rows.length} · Առանց պատասխանի՝ {rows.filter((r) => !r.reply).length}
          </p>
          {rows.map((r) => (
            <section key={r.id} className="shadow-card glass space-y-3 rounded-3xl p-5">
              <p className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
                {r.contact ? ` · ${r.contact}` : ""}
              </p>
              <p className="whitespace-pre-wrap text-sm">{r.message}</p>
              {r.reply ? (
                <div className="rounded-xl bg-emerald-50 p-3 text-sm">
                  <p className="text-xs font-bold text-emerald-800">Պատասխանված է {r.replied_at ? new Date(r.replied_at).toLocaleString() : ""}</p>
                  <p className="mt-1 whitespace-pre-wrap">{r.reply}</p>
                </div>
              ) : null}
              <Textarea
                rows={3}
                value={drafts[r.id] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                placeholder={r.reply ? "Նոր պատասխան" : "Գրեք պատասխանը…"}
              />
              <Button variant="game" className="w-full" onClick={() => reply(r.id)} disabled={!(drafts[r.id] ?? "").trim()}>
                <Send /> Ուղարկել պատասխանը
              </Button>
            </section>
          ))}
          <Button variant="outline" onClick={load}>Թարմացնել</Button>
        </>
      )}
    </div>
  );
}
