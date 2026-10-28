import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ENGLISH_RULES } from "@/lib/englishRules";
import { getMistakes, markMistakeMastered, removeMistake, type Mistake } from "@/lib/mistakeNotebook";
export const Route = createFileRoute("/mistakes")({ component: MistakesPage });
function MistakesPage() {
  const [items, setItems] = useState<Mistake[]>([]);
  const [subject, setSubject] = useState("all");
  const [review, setReview] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const refresh = () => setItems(getMistakes());
  useEffect(() => { refresh(); window.addEventListener("shtemarm:mistakes-changed", refresh); return () => window.removeEventListener("shtemarm:mistakes-changed", refresh); }, []);
  const subjects = [...new Set(items.map(m => m.subject))];
  const filtered = items.filter(m => subject === "all" || m.subject === subject);
  return <main className="mx-auto max-w-4xl space-y-6 pb-24">
    <Link to="/" className="text-sm text-primary">← Գլխավոր էջ</Link>
    <header className="rounded-3xl border bg-card p-6"><h1 className="text-3xl font-black">Սխալների տետր</h1><p className="mt-2 text-muted-foreground">Կրկնիր սխալ պատասխանները և ամրապնդիր գիտելիքներդ։ Պահպանվում է այս սարքում։</p><p className="mt-3 font-semibold">{items.filter(m => !m.mastered).length} վերանայման ենթակա · {items.filter(m => m.mastered).length} յուրացված</p></header>
    <label className="flex items-center gap-3 text-sm">Առարկա <select className="rounded-xl border bg-background p-2" value={subject} onChange={e => setSubject(e.target.value)}><option value="all">Բոլորը</option>{subjects.map(s => <option key={s}>{s}</option>)}</select></label>
    {filtered.length === 0 && <p className="rounded-2xl border bg-card p-6">Դեռ պահպանված սխալներ չկան։</p>}
    {filtered.map(m => { const key = m.subject + ":" + m.id; const active = review === key; return <section key={key} className="space-y-3 rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap justify-between gap-2"><span className="text-xs font-semibold text-primary">{m.subject} · {m.section} · {m.attempts} սխալ փորձ</span><span className="text-xs">{m.mastered ? "✓ Յուրացված" : "Կրկնելու համար"}</span></div>
      <h2 className="font-semibold">{m.prompt}</h2>
      {active ? <div className="space-y-2">{m.options.map((option,i) => <button type="button" key={i} onClick={() => setSelected(i)} className={`block w-full rounded-xl border p-3 text-left text-sm ${selected === i ? "border-primary bg-primary/10" : ""}`}>{String.fromCharCode(65+i)}. {option}</button>)}{selected !== null && <button className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => { if (selected === m.correct) markMistakeMastered(m.id,m.subject); setReview(null); setSelected(null); }}>Ստուգել · {selected === m.correct ? "Ճիշտ է" : "Փորձիր կրկին"}</button>}</div> : <button className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => { setReview(key); setSelected(null); }}>Կրկնել հարցը</button>}
      <button className="ml-3 text-sm text-muted-foreground underline" onClick={() => removeMistake(m.id,m.subject)}>Հեռացնել</button>
      {m.mastered && <p className="text-sm text-muted-foreground">{m.explanation}</p>}
    </section>; })}
    <section className="space-y-4 rounded-3xl border bg-card p-6"><h2 className="text-xl font-bold">English Grammar · Քերականական կանոններ</h2>{ENGLISH_RULES.map(rule => <details key={rule.id} className="rounded-xl border p-3"><summary className="cursor-pointer font-semibold">{rule.title}</summary><p className="mt-2 text-sm">{rule.armenian}</p><p className="mt-2 text-sm italic">{rule.example}</p></details>)}</section>
  </main>;
}
