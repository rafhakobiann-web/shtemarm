import { useState } from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { explainMathAnswer } from "@/lib/math-explain.functions";
import { RichExplanation } from "@/components/RichExplanation";
import { Button } from "@/components/ui/button";
import { useLang, useTx } from "@/lib/lang";

type Segment = { page: number };
type Props = {
  item: string;
  bookId: string;
  pages: number[];
  kind: "choice" | "tf" | "open";
  task: string;
  correct: string;
  chosen: string | null;
  question?: string | undefined;
  options?: string[] | undefined;
  /** Native-source math contains geometry/formulas absent from simplified prompts. */
  nativeSource?: boolean | undefined;
  showRelatedLinks?: boolean | undefined;
};

export function taskPages(segments: Segment[]) {
  return [...new Set(segments.map((s) => s.page))].sort((a, b) => a - b).slice(0, 3);
}

async function pageDataUrl(bookId: string, page: number) {
  const r = await fetch("/math/books/" + bookId + "/p-" + String(page).padStart(3, "0") + ".jpg");
  if (!r.ok) throw new Error("page");
  const bytes = new Uint8Array(await r.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return "data:image/jpeg;base64," + btoa(binary);
}
const explanationCache = new Map<string,string>();
function cacheKey(p: Props,lang:string) {
  return JSON.stringify([lang,p.item, p.correct, p.chosen, p.question, p.options]);
}

/** Prefer searchable text over uploading full pages on every click.
 * Include scans for native layouts that the simplified prompt cannot capture.
 */
export function MathExplain(props: Props) {
  const tx = useTx();
  const lang = useLang();
  const fn = useServerFn(explainMathAnswer);
  const key = cacheKey(props,lang);
  const [result, setResult] = useState<{ key: string; text: string; error: boolean; offline?:boolean; cached?:boolean } | null>(() => {
    const previous = explanationCache.get(key);
    return previous ? { key, text: previous, error: false, cached: true } : null;
  });
  const [loading, setLoading] = useState(false);
  const active = result?.key === key ? result : null;

  const run = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const needsPages = props.nativeSource || !props.question?.trim();
      let pages: string[] = [];
      if (needsPages) {
        try { pages = await Promise.all(props.pages.map(p => pageDataUrl(props.bookId, p))); }
        catch { if (!props.question?.trim()) throw new Error("Missing both text and source page"); }
      }
      const r = await fn({
        data: {
          item: props.item, kind: props.kind, task: props.task, locale: lang,
          correct: props.correct, chosen: props.chosen,
          question: props.question?.slice(0, 3500) ?? "",
          options: props.options?.slice(0, 6) ?? [], pages,
        },
      });
      setResult({ key, text: r.text, error: !!r.error, offline:!!r.offline, cached:!!r.cached });
      if (!r.error && !r.offline) explanationCache.set(key, r.text);
    } catch {
      setResult({ key, text: tx("Չհաջողվեց ստանալ բացատրությունը։ Ստուգիր կապը և կրկին փորձիր։"), error: true });
    } finally {
      setLoading(false);
    }
  };

  // An offline handbook is always available, regardless of AI service or API keys.
  // We link to the source SECTION, not claim this worked example solves the exact question.
  const parts = props.item.split(":");
  const handbookUrl = /^matem-[12]$/.test(parts[0]??"") && /^\d+$/.test(parts[1]??"") && /^\d+$/.test(parts[2]??"")
    ? `/math-handbook?book=${parts[0]}&chapter=${parts[1]}&section=${parts[2]}` : null;
  const sourceUrl=handbookUrl ? `/solutions?view=source&book=${parts[0]}&chapter=${parts[1]}&section=${parts[2]}` : "/solutions?view=source";
  return <div className="min-w-0">
    {props.showRelatedLinks!==false && <div className="mt-3 flex flex-wrap gap-2" aria-label={lang==="en"?"Related learning resources":lang==="ru"?"Связанные учебные материалы":"Կապակցված ուսումնական նյութեր"}>
      <a href={sourceUrl} className="inline-flex min-h-11 items-center rounded-lg border px-3 py-2 text-sm font-semibold text-primary hover:bg-muted">
        {lang==="en"?"Source question solutions":lang==="ru"?"Решения заданий":"Շտեմարանի լուծումները"}
      </a>
      {handbookUrl && <a href={handbookUrl}
        className="inline-flex min-h-11 items-center rounded-lg border px-3 py-2 text-sm font-semibold text-primary hover:bg-muted">
        {lang==="en"?"Methods for this section":lang==="ru"?"Методы раздела":"Այս բաժնի կանոնները"}
      </a>}
    </div>}
    {active && !active.error && <p role="status" className="my-2 text-xs font-semibold text-muted-foreground">
      {active.offline
        ? lang==="en"?"Local explanation (no AI)":lang==="ru"?"Локальное объяснение (без ИИ)":"Տեղային բացատրություն (առանց AI-ի)"
        : active.cached
          ? lang==="en"?"Saved AI explanation":lang==="ru"?"Сохранённое объяснение ИИ":"Պահպանված AI բացատրություն"
          : lang==="en"?"AI explanation":lang==="ru"?"Объяснение ИИ":"AI բացատրություն"}
    </p>}
    {active && <RichExplanation text={active.text} error={active.error} source={active.offline ? "offline" : active.cached ? "cached" : "ai"}/>}
    {(!active || active.error) && <Button
      variant="secondary" type="button" disabled={loading} onClick={() => void run()}
      className="mt-3 h-auto min-h-11 w-full whitespace-normal text-left sm:w-auto">
      {loading ? <Loader2 className="size-4 animate-spin" /> : active?.error ? <RefreshCw className="size-4"/> : <Sparkles className="size-4"/>}
      {loading ? tx("Բացատրությունը պատրաստվում է…") : active?.error ? tx("Կրկին փորձել") : tx("Տեսնել քայլ առ քայլ լուծումը")}
    </Button>}
  </div>;
}

