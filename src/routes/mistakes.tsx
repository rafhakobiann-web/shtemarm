import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { matchGrammarTopic } from "@/lib/grammarHandbook";
import { useLang } from "@/lib/lang";
import { getMistakes, markMistakeMastered, removeMistake, type Mistake } from "@/lib/mistakeNotebook";
export const Route = createFileRoute("/mistakes")({
  staticData: { sitemap: false }, component: MistakesPage });
function MistakesPage() {
  const lang = useLang();
  const [items, setItems] = useState<Mistake[]>([]);
  const [subject, setSubject] = useState("all");
  const [review, setReview] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [retryError, setRetryError] = useState(false);
  const refresh = () => setItems(getMistakes());
  useEffect(() => { refresh(); window.addEventListener("shtemarm:mistakes-changed", refresh); return () => window.removeEventListener("shtemarm:mistakes-changed", refresh); }, []);
  const subjects = [...new Set(items.map(m => m.subject))];
  const filtered = items.filter(m => subject === "all" || m.subject === subject);
  return <main className="mx-auto max-w-4xl space-y-6 pb-24">
    <Link to="/" className="text-sm text-primary">← Գլխավոր էջ</Link>
    <header className="rounded-3xl border bg-card p-6"><h1 className="text-3xl font-black">Սխալների տետր</h1><p className="mt-2 text-muted-foreground">Կրկնիր սխալ պատասխանները և ամրապնդիր գիտելիքներդ։ Պահպանվում է այս սարքում։</p><p className="mt-3 font-semibold">{items.filter(m => !m.mastered).length} վերանայման ենթակա · {items.filter(m => m.mastered).length} յուրացված</p></header>
    <label className="flex items-center gap-3 text-sm">Առարկա <select className="rounded-xl border bg-background p-2" value={subject} onChange={e => setSubject(e.target.value)}><option value="all">Բոլորը</option>{subjects.map(s => <option key={s}>{s}</option>)}</select></label>
    {filtered.length === 0 && <p className="rounded-2xl border bg-card p-6">Դեռ պահպանված սխալներ չկան։</p>}
    {filtered.map(m => { const key = m.subject + ":" + m.id; const active = review === key; const topic = m.subject === "English" ? matchGrammarTopic("grammar", m.explanation) : undefined; return <section key={key} className="space-y-3 rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap justify-between gap-2"><span className="text-xs font-semibold text-primary">{m.subject} · {m.section} · {m.attempts} սխալ փորձ</span><span className="text-xs">{m.mastered ? "✓ Յուրացված" : "Կրկնելու համար"}</span></div>
      <h2 className="font-semibold">{m.prompt}</h2>
      {active ? <div className="space-y-2">{m.options.map((option,i) => <button type="button" key={i} onClick={() => { setSelected(i); setRetryError(false); }} className={`block w-full rounded-xl border p-3 text-left text-sm ${selected === i ? "border-primary bg-primary/10" : ""}`}>{String.fromCharCode(65+i)}. {option}</button>)}{selected !== null && <button className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => { if (selected === m.correct) { markMistakeMastered(m.id,m.subject); setReview(null); setSelected(null); setRetryError(false); } else { setRetryError(true); } }}>{lang==="en"?"Check answer":lang==="ru"?"Проверить ответ":"Ստուգել պատասխանը"}</button>}{retryError && <p role="status" className="text-sm text-destructive">{lang==="en"?"Not quite. Try again.":lang==="ru"?"Пока неверно. Попробуйте ещё раз.":"Դեռ սխալ է։ Փորձիր կրկին։"}</p>}</div> : <button className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => { setReview(key); setSelected(null); setRetryError(false); }}>Կրկնել հարցը</button>}
      <button className="ml-3 text-sm text-muted-foreground underline" onClick={() => removeMistake(m.id,m.subject)}>Հեռացնել</button>
      {topic && <Link to="/english-grammar" search={{book:1,section:topic.sections.includes(2)?2:3,topic:topic.id}}
        className="block rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">
        {lang==="en"?"Relearn rule":lang==="ru"?"Повторить правило":"Վերուսումնասիրել կանոնը"}: {topic.title}
      </Link>}
      {m.mastered && <p className="text-sm text-muted-foreground">{m.explanation}</p>}
    </section>; })}
    <section className="space-y-3 rounded-3xl border bg-card p-6"><h2 className="text-xl font-bold">English Grammar</h2><p className="text-sm text-muted-foreground">{lang==="en"?"Review the rules behind your mistakes without AI.":lang==="ru"?"Повторяйте правила по своим ошибкам без ИИ.":"Վերհիշիր սխալների հետ կապված քերականական կանոններն առանց ԱԲ-ի։"}</p><Link to="/english-grammar" search={{book:1,section:2,topic:undefined}} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">{lang==="en"?"Open grammar handbook":lang==="ru"?"Открыть справочник":"Բացել քերականության ձեռնարկը"}</Link></section>
  </main>;
}
