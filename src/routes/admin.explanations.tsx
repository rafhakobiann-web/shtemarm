import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Loader2, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminStoredExplanationIds,
  adminGenerateExplanation,
} from "@/lib/question-explanations.functions";

export const Route = createFileRoute("/admin/explanations")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Բացատրություններ · Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminExplanationsPage,
});

const BANKS = [
  "book1.json", "book2.json", "book3.json",
  "bio-book1.json", "bio-book2.json", "bio-book3.json", "bio-book4.json",
  "history-book1.json", "history-book2.json", "history-book3.json",
];

type Q = { id: string; label: string; passage: string; stem: string; options: Record<string, string> | null; correct: string };

/** Flatten one bank into questions. Same shape the site already reads. */
function flatten(json: { sections?: { title?: string; n?: number; units?: any[] }[] }): Q[] {
  const out: Q[] = [];
  for (const section of json.sections ?? []) {
    for (const unit of section.units ?? []) {
      const label = [section.title ?? `Բաժին ${section.n ?? ""}`, unit.label].filter(Boolean).join(" · ");
      const list = unit.questions ?? [{ n: unit.n ?? "1", stem: unit.stem, options: unit.options, answer: unit.answer }];
      for (const q of list) {
        if (!q?.answer || !q?.stem) continue;
        out.push({
          id: `${unit.id}:${q.n}`,
          label,
          passage: unit.kind === "mc" && unit.passage ? String(unit.passage) : "",
          stem: String(q.stem),
          options: q.options ?? null,
          correct: String(q.answer),
        });
      }
    }
  }
  return out;
}

function AdminExplanationsPage() {
  const [password, setPassword] = useState("");
  const [bank, setBank] = useState(BANKS[0]);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [stored, setStored] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);

  const todo = useMemo(() => questions.filter((q) => !stored.has(q.id)), [questions, stored]);

  const load = async () => {
    try {
      const res = await fetch(`/data/${bank}`);
      if (!res.ok) throw new Error("bank");
      const qs = flatten(await res.json());
      const ids = await adminStoredExplanationIds({ data: { password, bank: bank as never } });
      setQuestions(qs);
      setStored(new Set(ids));
      toast.success(`Բեռնված է՝ ${qs.length} հարց, ${ids.length} բացատրություն արդեն կա`);
    } catch (e) {
      toast.error(e instanceof Error && e.message === "unauthorized" ? "Սխալ գաղտնաբառ" : "Չհաջողվեց բեռնել");
    }
  };

  const run = async () => {
    setRunning(true);
    stopRef.current = false;
    let failed = 0;
    for (const q of todo) {
      if (stopRef.current) break;
      try {
        await adminGenerateExplanation({ data: { password, bank: bank as never, question: { id: q.id, label: q.label, passage: q.passage, stem: q.stem, options: q.options, correct: q.correct } } });
        setStored((prev) => new Set(prev).add(q.id));
      } catch (e) {
        failed++;
        if (e instanceof Error && (e.message === "unauthorized" || e.message === "no_provider_available")) {
          toast.error(e.message === "unauthorized" ? "Սխալ գաղտնաբառ" : "AI բանալիները բացակայում են կամ սահմանաչափն է լրացել");
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 2500));
    }
    setRunning(false);
    if (failed) toast.message(`Սխալներ՝ ${failed}`);
  };

  const done = questions.length - todo.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <h1 className="text-2xl font-black">Բացատրությունների գեներացիա</h1>
      <p className="text-sm text-muted-foreground">
        Յուրաքանչյուր հարցի համար ստեղծվում է բացատրություն պաշտոնական բանալիի հիման վրա։ Նոր բացատրությունները թաքնված են, մինչև դրանք նշվեն որպես ստուգված։
      </p>
      <div className="space-y-3 rounded-2xl border bg-card p-5">
        <Input type="password" placeholder="Ադմինի գաղտնաբառ" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={bank} onChange={(e) => { setBank(e.target.value); setQuestions([]); setStored(new Set()); }}>
          {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <Button className="w-full" variant="outline" onClick={load} disabled={!password || running}>Բեռնել շտեմարանը</Button>
      </div>
      {questions.length > 0 && (
        <div className="space-y-3 rounded-2xl border bg-card p-5">
          <p className="font-semibold">{done} / {questions.length} արդեն կա · մնացել է՝ {todo.length}</p>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={run} disabled={running || todo.length === 0}>
              {running ? <Loader2 className="animate-spin" /> : <Play />} Գեներացնել
            </Button>
            <Button variant="outline" onClick={() => { stopRef.current = true; }} disabled={!running}>
              <Square /> Կանգնեցնել
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
