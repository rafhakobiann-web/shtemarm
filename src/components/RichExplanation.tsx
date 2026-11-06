import { useEffect, useId, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, Expand, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildExplanationSteps, type ExplanationStep } from "@/lib/explanation-steps";
import { useLang } from "@/lib/lang";
import { MathDiagram, readDiagram } from "@/components/MathDiagram";
import { RichText, useKatex } from "@/components/MathText";
import { useTx } from "@/lib/lang";

type ContentBlock = { kind: "text" | "diagram" | "code"; value: string };
/** Markdown code fences are never executed or inserted as HTML. */
export function splitExplanation(text: string): ContentBlock[] {
  const ticks = String.fromCharCode(96).repeat(3);
  const fence = new RegExp(ticks + "(diagram|json|text)?\\s*\\n([\\s\\S]*?)" + ticks, "g");
  const result: ContentBlock[] = [];
  let last = 0;
  for (const match of text.matchAll(fence)) {
    const at = match.index ?? 0;
    if (at > last) result.push({ kind: "text", value: text.slice(last, at) });
    const src = match[2]?.trim() ?? "";
    const valid = readDiagram(src);
    result.push({ kind: valid ? "diagram" : "code", value: src });
    last = at + match[0].length;
  }
  if (last < text.length) result.push({ kind: "text", value: text.slice(last) });
  return result;
}
function MathProse({ text }: { text: string }) {
  const katex = useKatex();
  return <div className="space-y-3">
    {text.trim().split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => {
      const numbered = /^([1-9][0-9]?)\.\s+([\s\S]*)/.exec(paragraph.trim());
      const body = numbered ? numbered[2]! : paragraph;
      return <div key={index} className={numbered ? "flex gap-3 rounded-2xl border border-border/50 bg-background/60 p-3 sm:p-4" : "leading-7"}>
        {numbered && <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-black text-primary">{numbered[1]}</span>}
        <div className="min-w-0 flex-1 space-y-1 leading-7">
          {body.split(/(\*\*[^*]+\*\*)/g).map((part,i) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={i}><RichText text={part.slice(2,-2)} katex={katex}/></strong>
              : <RichText key={i} text={part} katex={katex}/>)}
        </div>
      </div>;
    })}
  </div>;
}
/** The same full-screen lesson works for Mathematics and every question book.
 * Uses Radix Dialog for focus trapping, Escape, scroll locking and focus return.
 * Does not issue AI calls or persist explanation content in browser storage.
 */
export function RichExplanation({
  text, error = false, source = "ai",
}: {
  text: string;
  error?: boolean;
  source?: "ai" | "cached" | "offline";
}) {
  const lang = useLang();
  const titleId = useId();
  const [open, setOpen] = useState(() => !error && !!text.trim());
  const [current, setCurrent] = useState(0);
  const steps = useMemo(() => buildExplanationSteps(splitExplanation(text)), [text]);
  const total = Math.max(1, steps.length);
  const index = Math.min(current, steps.length - 1);
  const step = steps[index];

  useEffect(() => {
    setCurrent(0);
    setOpen(!error && !!text.trim());
  }, [text, error]);

  const copy = {
    hy: {
      title: "Բացատրություն · քայլ առ քայլ",
      open: "Բացել մեծ բացատրությունը",
      subtitle: "Կարդա յուրաքանչյուր քայլը առանձին և անցիր հաջորդին։",
      progress: "Քայլ",
      of: "-ից",
      previous: "Նախորդ քայլը",
      next: "Հաջորդ քայլը",
      finish: "Ավարտել",
      caution: "AI-ի բացատրությունը կարող է սխալ լինել․ ստուգիր պատասխանը շտեմարանի բանալիով։",
      offline: "Տեղային բացատրություն (առանց AI-ի)",
      cached: "Պահպանված AI բացատրություն",
      ai: "AI բացատրություն",
    },
    en: {
      title: "Explanation · step by step",
      open: "Open full-screen explanation",
      subtitle: "Read one step at a time and move forward when ready.",
      progress: "Step",
      of: "of",
      previous: "Previous step",
      next: "Next step",
      finish: "Finish lesson",
      caution: "AI explanations can be inaccurate. Check the official answer key.",
      offline: "Local explanation (no AI)",
      cached: "Saved AI explanation",
      ai: "AI explanation",
    },
    ru: {
      title: "Объяснение · шаг за шагом",
      open: "Открыть объяснение на весь экран",
      subtitle: "Изучай один шаг за другим в удобном темпе.",
      progress: "Шаг",
      of: "из",
      previous: "Предыдущий шаг",
      next: "Следующий шаг",
      finish: "Завершить",
      caution: "ИИ может ошибаться. Проверяйте ответы по ключу сборника.",
      offline: "Локальное объяснение (без ИИ)",
      cached: "Сохранённое объяснение ИИ",
      ai: "Объяснение ИИ",
    },
  }[lang];

  const stepBody = (page: ExplanationStep | undefined) => {
    if (!page) return <p className="text-muted-foreground">{text}</p>;
    if (page.kind === "diagram") {
      const diagram = readDiagram(page.value);
      return diagram ? <MathDiagram spec={diagram} /> : null;
    }
    if (page.kind === "code")
      return <pre className="max-w-full overflow-auto rounded-2xl border bg-muted/60 p-4 text-xs leading-relaxed">{page.value}</pre>;
    return <MathProse text={page.value}/>;
  };

  if (error) return (
    <section role="alert" className="explanation-panel mt-4 rounded-2xl border border-destructive/40 bg-card p-4 text-sm leading-relaxed">
      <h3 className="mb-2 font-bold">{copy.title}</h3>
      <p className="whitespace-pre-wrap">{text}</p>
    </section>
  );

  if (!steps.length) return null;

  const reveal = () => {
    setCurrent(0);
    setOpen(true);
  };

  return (
    <>
      <section className="explanation-panel mt-4 flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-card p-4" aria-label={copy.title}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-black">{copy.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {copy[source]} · {steps.length} {lang === "en" ? "steps" : lang === "ru" ? "шагов" : "քայլ"}
            </p>
          </div>
        </div>
        <button type="button" onClick={reveal}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <Expand className="size-4" aria-hidden="true"/>{copy.open}
        </button>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sht-explanation-dialog max-w-none gap-0 overflow-hidden border-2 border-primary/35 bg-background p-0 shadow-2xl" aria-describedby={titleId}>
          <DialogHeader className="sht-explanation-header shrink-0 space-y-2 border-b px-5 py-4 text-left sm:px-8 sm:py-6">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-primary">
              <BookOpenCheck className="size-4" aria-hidden="true"/>{copy[source]}
            </span>
            <DialogTitle className="pr-9 text-xl font-black leading-snug text-foreground sm:text-3xl">{copy.title}</DialogTitle>
            <DialogDescription id={titleId} className="text-xs leading-6 text-muted-foreground sm:text-sm">{copy.subtitle}</DialogDescription>
            <div className="flex items-center justify-between gap-3 pt-2">
              <span role="status" aria-live="polite" className="text-sm font-black text-foreground">
                {copy.progress} {index + 1} {copy.of} {total}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {Math.round((index + 1) / total * 100)}%
              </span>
            </div>
            <div role="progressbar" aria-label={copy.progress} aria-valuemin={0} aria-valuemax={total}
              aria-valuenow={index + 1} className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
                style={{width:String((index + 1) / total * 100)+"%"}}/>
            </div>
          </DialogHeader>

          <div className="sht-explanation-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-8" key={index}>
            <article aria-label={copy.progress+" "+(index + 1)} className="sht-explanation-stage mx-auto flex min-h-full w-full max-w-4xl flex-col rounded-2xl border border-primary/25 bg-card p-5 text-base leading-8 text-foreground sm:p-8 sm:text-lg">
              <span className="mb-5 inline-flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-lg font-black text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 break-words">{stepBody(step)}</div>
            </article>
          </div>

          <footer className="sht-explanation-footer shrink-0 space-y-3 border-t bg-card px-4 py-3 sm:px-8 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <button type="button" disabled={index === 0} onClick={() => setCurrent(n => Math.max(0, n - 1))}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-bold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary">
                <ArrowLeft className="size-4" aria-hidden="true"/>{copy.previous}
              </button>
              <button type="button" onClick={() => {
                if (index === total - 1) setOpen(false);
                else setCurrent(n => Math.min(total - 1, n + 1));
              }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-primary">
                {index === total - 1 ? copy.finish : copy.next}
                {index === total - 1 ? <BookOpenCheck className="size-4" aria-hidden="true"/> : <ArrowRight className="size-4" aria-hidden="true"/>}
              </button>
            </div>
            {source !== "offline" && <p className="max-w-3xl text-xs leading-5 text-muted-foreground">{copy.caution}</p>}
          </footer>
        </DialogContent>
      </Dialog>
    </>
  );
}
