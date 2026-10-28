import { useState } from "react";
import { Check, X, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";
import type { Unit, MCQuestion } from "@/lib/books";
import { explainAnswer } from "@/lib/explain.functions";
import { Button } from "@/components/ui/button";
import { EnglishText, PassageTranslation } from "@/components/EnglishText";
import { useTx } from "@/lib/lang";
import { RichExplanation } from "@/components/RichExplanation";
import { SECTION_ONE_EXPLANATIONS } from "@/lib/englishSectionOneExplanations";

export type UnitAnswer = {
  mc?: Record<string, string>;
  nums?: (number | null)[];
  match?: Record<string, number>;
};

/* ---------- passage ---------- */
function PassageContent({ text, kind }: { text: string; kind: Unit["kind"] }) {
  if (!text.trim()) return null;
  const lines = text.split("\n");
  if (/^\s*Line number/i.test(lines[0] ?? "")) {
    const rows = lines.slice(1).filter((l) => l.trim());
    const paras: { n: string; t: string }[][] = [];
    for (const l of rows) {
      const m = l.match(/^\s*(\d+)\s*\.(\s*)(.*)$/);
      const n = m?.[1] ?? "";
      const t = (m ? (m[3] ?? "") : l).trim();
      const newPara = !!m && (m[2]?.length ?? 0) >= 3;
      if (newPara || paras.length === 0) paras.push([]);
      paras[paras.length - 1]?.push({ n, t });
    }
    return (
      <div className="passage space-y-3 rounded-xl bg-muted/60 p-4 sm:p-6">
        {paras.map((p, i) => (
          <p key={i}>
            {p.map((r, j) => (
              <span key={j}>
                {r.n && <span className="mr-1 select-none whitespace-nowrap font-mono text-[0.75rem] font-semibold text-primary/80">{r.n}.</span>}
                <EnglishText text={r.t} context={text} />{" "}
              </span>
            ))}
          </p>
        ))}
      </div>
    );
  }
  if (kind === "match") {
    const cols = splitColumns(lines);
    if (!cols) {
      return (
        <div className="overflow-x-auto rounded-xl bg-muted/60 p-4 sm:p-6">
          <pre className="min-w-max font-mono text-[13px] leading-relaxed sm:text-sm"><EnglishText text={text} /></pre>
        </div>
      );
    }
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {[cols.left, cols.right].map((items, ci) => (
          <ul key={ci} className="space-y-2 rounded-xl bg-muted/60 p-3 sm:p-4">
            {items.map((it, i) => (
              <li key={i} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 text-[0.95rem] leading-snug">
                <span className={cn("font-display text-sm font-bold", ci === 0 ? "text-primary" : "text-accent-foreground")}>{it.mark}</span>
                <span><EnglishText text={it.text} context={text} /></span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    );
  }
  if (kind === "set") {
    // numbered statements: join wrapped continuation lines
    const items: string[] = [];
    for (const l of lines) {
      if (/^\s*\d+\s*\.\s+/.test(l) || items.length === 0) items.push(l.trim());
      else if (l.trim()) items[items.length - 1] += "\n" + l.trim();
    }
    return (
      <ol className="space-y-3">
        {items.map((it, i) => {
          const m = it.match(/^(\d+)\s*\.\s*([\s\S]*)$/);
          return (
            <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 rounded-lg bg-muted/50 p-3">
              <span className="font-display text-sm font-bold text-primary">{m?.[1]}</span>
              <span className="passage whitespace-pre-line text-[0.98rem]"><EnglishText text={(m ? m[2] : it) ?? ""} context={text} /></span>
            </li>
          );
        })}
      </ol>
    );
  }
  // prose: reflow hard-wrapped PDF lines into paragraphs
  const paras: string[] = [];
  let cur = "";
  for (const raw of lines) {
    const l = raw.replace(/\s+$/, "");
    const indented = /^\s{3,}\S/.test(l);
    const isList = /^\s*\d+\s*\.\s*\S/.test(l) && /^\s*\d+\s*\.\s*[a-z]/i.test(l) && l.length < 60;
    const isDialog = /^\s*[-–]/.test(l) || /^\s*\d\s?[.)]\s/.test(l) || /^\s*[A-Z][a-z]*:/.test(l);
    if (!l.trim()) {
      if (cur) paras.push(cur);
      cur = "";
    } else if ((indented || isDialog || isList) && cur) {
      paras.push(cur);
      cur = l.trim();
    } else cur = cur ? cur + " " + l.trim() : l.trim();
  }
  if (cur) paras.push(cur);
  return (
    <div className="passage space-y-3 rounded-xl bg-muted/60 p-4 sm:p-6">
      {paras.map((p, i) => (
        <p key={i}><EnglishText text={p} /></p>
      ))}
    </div>
  );
}

function Passage({ text, kind }: { text: string; kind: Unit["kind"] }) {
  return <div><PassageContent text={text} kind={kind} /><PassageTranslation key={text} text={text} /></div>;
}

/* ---------- explanation ---------- */
function Explain(props: { instruction: string; passage: string; question: string; correct: string; chosen: string | null }) {
  const tx = useTx();
  const fn = useServerFn(explainAnswer);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div>
    {text && <RichExplanation text={text} error={failed}/>}
    {(!text || failed) && <Button
      variant="secondary"
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const r = await fn({ data: { ...props, passage: props.passage.slice(0, 5800) } });
          setText(r.error ? tx(r.text) : r.text);
          setFailed(r.error);
        } catch {
          setText(tx("Չհաջողվեց ստանալ բացատրությունը։"));
          setFailed(true);
        } finally {
          setLoading(false);
        }
      }}
      className="mt-3 h-auto min-h-10 whitespace-normal text-left"
    >
      {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
      {loading ? tx("Բացատրությունը պատրաստվում է…") : failed ? tx("Կրկին փորձել") : tx("Ստանալ բացատրություն")}
    </Button>}
    </div>
  );
}

/* ---------- scoring ---------- */
/** Numeric answers compare ignoring spaces, so "1 200" and "1200" count the same. */
export const normNum = (x: string | undefined) => (x ?? "").replace(/\s/g, "");

export function isGtcClaimsBundle(u: Unit): boolean {
  return u.kind === "mc" && u.questions.length === 6 &&
    /վեց պնդում|պնդումների փունջ/i.test(u.passage) &&
    u.questions.every((q) => q.answer === "1" || q.answer === "2");
}

export function scoreUnit(u: Unit, a: UnitAnswer | undefined) {
  if (u.kind === "mc" && isGtcClaimsBundle(u)) {
    // GTC rules: +1 correct true/false, -1 incorrect, 0 "don't know".
    // Deductions are clamped to zero *within the bundle*, not across the exam.
    const per = u.questions.map((q) => a?.mc?.[q.n] === q.answer);
    const wrong = u.questions.filter((q) => {
      const chosen = a?.mc?.[q.n];
      return (chosen === "1" || chosen === "2") && chosen !== q.answer;
    }).length;
    return { got: Math.max(0, per.filter(Boolean).length - wrong), total: 6, per };
  }
  if (u.kind === "mc") {
    const per = u.questions.map((q) => a?.mc?.[q.n] === q.answer);
    return { got: per.filter(Boolean).length, total: per.length, per };
  }
  if (u.kind === "num") {
    const per = u.questions.map((q) => normNum(a?.mc?.[q.n]) === normNum(q.answer));
    return { got: per.filter(Boolean).length, total: per.length, per };
  }
  if (u.kind === "match") {
    const ok = Object.entries(u.answer).every(([k, v]) => a?.match?.[k] === v);
    return { got: ok ? 1 : 0, total: 1, per: [ok] };
  }
  const given = (a?.nums ?? []).filter((x): x is number => x != null);
  const ok =
    u.kind === "set"
      ? JSON.stringify([...given].sort((x, y) => x - y)) === JSON.stringify([...u.answer].sort((x, y) => x - y))
      : JSON.stringify(a?.nums ?? []) === JSON.stringify(u.answer);
  return { got: ok ? 1 : 0, total: 1, per: [ok] };
}

export function isAnswered(u: Unit, a: UnitAnswer | undefined, qn?: string) {
  if (!a) return false;
  if (u.kind === "mc") return qn ? !!a.mc?.[qn] : u.questions.every((q) => a.mc?.[q.n]);
  if (u.kind === "num") return qn ? !!a.mc?.[qn] : u.questions.every((q) => a.mc?.[q.n]);
  if (u.kind === "match") return Object.keys(u.answer).every((k) => a.match?.[k]);
  if (u.kind === "seq") return (a.nums ?? []).filter((x) => x != null).length === u.answer.length;
  return (a.nums ?? []).length > 0;
}

/* ---------- card ---------- */
export function UnitCard(props: {
  unit: Unit;
  instruction: string;
  instructionEn?: string;
  value: UnitAnswer | undefined;
  onChange: (v: UnitAnswer) => void;
  /** questions (mc n, or "unit") whose answers are revealed */
  revealed: (key: string) => boolean;
  onCheck?: (key: string) => void;
  header?: React.ReactNode;
}) {
  const { unit: u, value: a, onChange, revealed } = props;
  const tx = useTx();

  const mcBlock = (q: MCQuestion) => {
    const show = revealed(q.n);
    const chosen = a?.mc?.[q.n];
    return (
      <div key={q.n} className={cn("question-card rounded-xl border bg-card p-4", show && chosen !== q.answer && "animate-shake")}>
        <div className="mb-3 flex gap-2">
          <span className="grid h-7 min-w-7 shrink-0 place-items-center rounded-full bg-primary px-1.5 font-display text-xs font-bold text-primary-foreground">
            {q.n}
          </span>
          <p className="min-w-0 whitespace-pre-line pt-0.5 font-medium leading-relaxed"><EnglishText text={q.stem || tx("Ընտրեք ճիշտ տարբերակը ({n})", { n: q.n })} /></p>
        </div>
        {q.diagram && <figure className="mb-4 rounded-xl border bg-white p-3"><img src={q.diagram.src} alt={q.diagram.alt} width={350} height={250} loading="lazy" className="mx-auto h-auto w-full max-w-sm" /></figure>}
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(isGtcClaimsBundle(u) ? { ...q.options, "3": tx("Չգիտեմ") } : q.options).map(([k, v]) => {
            const isC = k === q.answer;
            const isSel = chosen === k;
            return (
              <div
                key={k}
                onClick={() => { if (!show) onChange({ ...a, mc: { ...a?.mc, [q.n]: k } }); }}
                className={cn(
                  "answer-option flex min-h-11 items-start gap-2 rounded-lg border-2 px-3 py-2 text-left text-[0.95rem] transition-[color,background-color,border-color,transform,box-shadow] duration-200",
                  !show && isSel && "border-primary bg-secondary",
                  !show && !isSel && "border-border hover:border-primary/50 hover:bg-muted",
                  show && isC && "border-success bg-success/10",
                  show && isSel && !isC && "border-destructive bg-destructive/10",
                  show && !isC && !isSel && "border-border opacity-60",
                )}
              >
                <Button variant="ghost" size="icon" className="size-7 shrink-0" disabled={show} aria-label={tx("Ընտրել {n} հարցի {k} տարբերակը", { n: q.n, k })} aria-pressed={isSel}>{k})</Button>
                <span className="min-w-0 flex-1"><EnglishText text={v} context={`${q.stem} ${v}`} /></span>
                {show && isC && <Check className="size-4 shrink-0 text-success" />}
                {show && isSel && !isC && <X className="size-4 shrink-0 text-destructive" />}
              </div>
            );
          })}
        </div>
        {props.onCheck && !show && chosen && (
          <button type="button" onClick={() => props.onCheck?.(q.n)} className="mt-3 text-sm font-bold text-primary hover:underline">
            {tx("Ստուգել →")}
          </button>
        )}
        {show && (q.explanation || SECTION_ONE_EXPLANATIONS[`${u.id}:${q.n}`]) && <div role="note" className="mt-3 rounded-xl border border-primary/15 bg-primary/5 px-3 py-3 text-sm leading-relaxed">
          <span className="font-black">{tx("Բացատրություն")}․ </span>{q.explanation || SECTION_ONE_EXPLANATIONS[`${u.id}:${q.n}`]}
        </div>}
        {show && chosen === q.answer && (
          <div role="status" className="animate-pop mt-3 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm font-black text-success">
            <Sparkles className="size-4" /> {tx("Կեցցե՜ս։ Ճիշտ պատասխան է։")}
          </div>
        )}
        {show && !SECTION_ONE_EXPLANATIONS[`${u.id}:${q.n}`] && (
          <Explain
            instruction={props.instructionEn ?? props.instruction}
            passage={u.passage}
            question={`${q.stem}\n${Object.entries(q.options).map(([k, v]) => `${k}) ${v}`).join("\n")}`}
            correct={`${q.answer}) ${q.options[q.answer]}`}
            chosen={chosen ? `${chosen}) ${q.options[chosen]}` : null}
          />
        )}
      </div>
    );
  };

  const numBlock = (q: { n: string; stem: string; answer: string; explanation?: string }) => {
    const show = revealed(q.n);
    const val = a?.mc?.[q.n] ?? "";
    const ok = normNum(val) === normNum(q.answer);
    return (
      <div key={q.n} className={cn("question-card rounded-xl border bg-card p-4", show && !ok && "animate-shake")}>
        <div className="mb-3 flex gap-2">
          <span className="grid h-7 min-w-7 shrink-0 place-items-center rounded-full bg-primary px-1.5 font-display text-xs font-bold text-primary-foreground">
            {q.n}
          </span>
          <p className="min-w-0 whitespace-pre-line pt-0.5 font-medium leading-relaxed"><EnglishText text={q.stem} /></p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            disabled={show}
            value={val}
            aria-label={tx("Պատասխան {n}", { n: q.n })}
            onChange={(e) => onChange({ ...a, mc: { ...a?.mc, [q.n]: e.target.value } })}
            className={cn(
              "h-11 w-40 rounded-lg border-2 bg-background px-3 font-display text-lg font-bold focus:outline-none",
              !show && "border-border focus:border-primary",
              show && ok && "border-success bg-success/10",
              show && !ok && "border-destructive bg-destructive/10",
            )}
          />
          {show && <span className="text-sm font-semibold">{tx("Ճիշտ պատասխանը՝ {answer}", { answer: q.answer })}</span>}
        </div>
        {props.onCheck && !show && val.trim() && (
          <button type="button" onClick={() => props.onCheck?.(q.n)} className="mt-3 text-sm font-bold text-primary hover:underline">
            {tx("Ստուգել →")}
          </button>
        )}
        {show && q.explanation && <div role="note" className="mt-3 rounded-xl border border-primary/15 bg-primary/5 px-3 py-3 text-sm leading-relaxed">
          <span className="font-black">{tx("Բացատրություն")}․ </span>{q.explanation}
        </div>}
        {show && ok && (
          <div role="status" className="animate-pop mt-3 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm font-black text-success">
            <Sparkles className="size-4" /> {tx("Կեցցե՜ս։ Ճիշտ պատասխան է։")}
          </div>
        )}
        {show && (
          <Explain
            instruction={props.instructionEn ?? props.instruction}
            passage={u.passage}
            question={q.stem}
            correct={q.answer}
            chosen={val.trim() ? val : null}
          />
        )}
      </div>
    );
  };

  const show = revealed("unit");
  const res = scoreUnit(u, a);
  const seqBlock =
    u.kind === "seq" ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold">{tx("Յուրաքանչյուր բացթողման համար ընտրեք բառի համարը")}</p>
          <div className="grid gap-2">
            {u.answer.map((ans, i) => {
              const v = a?.nums?.[i] ?? null;
              const max = Math.max(/(^|\s)8\s?[.)]/.test(u.passage) ? 8 : 7, ...u.answer);
              return (
                <div key={i} className="flex flex-wrap items-center gap-1.5">
                  <span className="w-16 shrink-0 text-xs font-bold text-muted-foreground">{tx("Բաց {n}", { n: i + 1 })}</span>
                  {Array.from({ length: max }, (_, k) => k + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      disabled={show}
                      onClick={() => {
                        const arr = [...(a?.nums ?? Array(u.answer.length).fill(null))];
                        arr[i] = n;
                        onChange({ ...a, nums: arr });
                      }}
                      className={numCls(v === n, show, n === ans)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : null;
  const correctText =
    u.kind === "match"
      ? Object.entries(u.answer).map(([k, v]) => `${k}${v}`).join(" ")
      : u.kind === "set" || u.kind === "seq"
        ? u.answer.join(", ")
        : "";
  const chosenText =
    u.kind === "match"
      ? Object.entries(a?.match ?? {}).map(([k, v]) => `${k}${v}`).join(" ")
      : (a?.nums ?? []).map((x) => x ?? "_").join(", ");

  return (
    <article className="question-card shadow-card space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
      {props.header}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-primary">{props.instruction}</p>
        {props.instructionEn && <p className="text-xs italic text-muted-foreground"><EnglishText text={props.instructionEn} /></p>}
      </div>
      {(() => {
        const split = !!u.passage.trim() && (u.kind === "mc" || u.kind === "num" || u.kind === "seq");
        const qs = (
          <div className="min-w-0 space-y-4">
            {u.kind === "mc" && <div className="space-y-3">{u.questions.map(mcBlock)}</div>}
            {u.kind === "num" && <div className="space-y-3">{u.questions.map(numBlock)}</div>}
            {u.kind === "seq" && seqBlock}
          </div>
        );
        if (!split)
          return (
            <>
              <Passage text={u.passage} kind={u.kind} />
              {qs}
            </>
          );
        return (
          <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
            <div className="sticky top-[var(--sticky-top,4.5rem)] z-10 max-h-[34vh] overflow-y-auto rounded-xl bg-card shadow-card ring-1 ring-border lg:max-h-[calc(100vh-var(--sticky-top,4.5rem)-1.5rem)]">
              <Passage text={u.passage} kind={u.kind} />
            </div>
            {qs}
          </div>
        );
      })()}

      {u.kind === "set" && (
        <NumPicker
          label={tx("Ընտրեք ճիշտ համարները")}
          count={u.count ?? 5}
          selected={(a?.nums ?? []).filter((x): x is number => x != null)}
          disabled={show}
          correct={show ? u.answer : undefined}
          onToggle={(n) => {
            const cur = (a?.nums ?? []).filter((x): x is number => x != null);
            onChange({ ...a, nums: cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n].sort() });
          }}
        />
      )}

      {u.kind === "match" && (
        <div className="grid gap-2">
          {Object.keys(u.answer).map((L) => {
            const max = Math.max(5, ...Object.values(u.answer), /1\.|1\)/.test(u.passage) && /6[.)]/.test(u.passage) ? 6 : 5);
            return (
              <div key={L} className="flex flex-wrap items-center gap-1.5">
                <span className="w-8 shrink-0 font-display font-bold">{L}</span>
                {Array.from({ length: max }, (_, k) => k + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={show}
                    onClick={() => onChange({ ...a, match: { ...a?.match, [L]: n } })}
                    className={numCls(a?.match?.[L] === n, show, u.answer[L] === n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {u.kind !== "mc" && u.kind !== "num" && props.onCheck && !show && isAnswered(u, a) && (
        <button type="button" onClick={() => props.onCheck?.("unit")} className="text-sm font-bold text-primary hover:underline">
          {tx("Ստուգել →")}
        </button>
      )}
      {u.kind !== "mc" && u.kind !== "num" && show && (
        <div className={cn("rounded-xl p-4", res.got ? "bg-success/10" : "bg-destructive/10")}>
          <p className="font-bold">{res.got ? tx("Ճիշտ է 🎉") : tx("Սխալ է")}</p>
          <p className="text-sm">
            {tx("Ճիշտ պատասխանը՝")} <b>{correctText}</b>
            {!res.got && chosenText && <> · {tx("Ձեր պատասխանը՝")} {chosenText}</>}
          </p>
          <Explain
            instruction={props.instructionEn ?? props.instruction}
            passage={u.passage}
            question="(see text)"
            correct={correctText}
            chosen={chosenText || null}
          />
        </div>
      )}
    </article>
  );
}

function numCls(sel: boolean, show: boolean, correct: boolean) {
  return cn(
    "grid h-10 w-10 place-items-center rounded-lg border-2 font-display text-sm font-bold transition-colors",
    !show && sel && "border-primary bg-primary text-primary-foreground",
    !show && !sel && "border-border hover:border-primary/50",
    show && correct && "border-success bg-success/15",
    show && sel && !correct && "border-destructive bg-destructive/15",
    show && !sel && !correct && "opacity-50",
  );
}

function NumPicker(p: { label: string; count: number; selected: number[]; disabled: boolean; correct?: number[] | undefined; onToggle: (n: number) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{p.label}</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: p.count }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" disabled={p.disabled} onClick={() => p.onToggle(n)} className={numCls(p.selected.includes(n), !!p.correct, !!p.correct?.includes(n))}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Split a two-column "match" block (A–D on the left, 1–6 on the right) into lists. */
function splitColumns(lines: string[]) {
  let col = Infinity;
  for (const l of lines) {
    const m = /\s{2,}(\d\s?[.)])\s/.exec(l);
    if (m && m.index > 4) col = Math.min(col, m.index + m[0].indexOf(m[1] ?? ""));
    const lead = /^(\s{8,})(\d\s?[.)])\s/.exec(l);
    if (lead) col = Math.min(col, (lead[1]?.length ?? 0));
  }
  if (!isFinite(col)) return null;
  const left: { mark: string; text: string }[] = [];
  const right: { mark: string; text: string }[] = [];
  const push = (arr: typeof left, chunk: string, re: RegExp) => {
    const s = chunk.trim();
    if (!s) return;
    const m = re.exec(s);
    if (m) arr.push({ mark: m[1] ?? "", text: s.slice(m[0].length).trim() });
    else { const last = arr[arr.length - 1]; if (last) last.text += " " + s; }
  };
  for (const l of lines) {
    push(left, l.slice(0, col), /^([A-E])\s?[.)]\s*/);
    push(right, l.slice(col), /^(\d)\s?[.)]\s*/);
  }
  if (left.length < 3 || right.length < 3) return null;
  return { left, right };
}

