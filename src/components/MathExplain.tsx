import { useState } from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { explainMathAnswer } from "@/lib/math-explain.functions";
import { RichExplanation } from "@/components/RichExplanation";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";

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
function cacheKey(p: Props) {
  return JSON.stringify([p.item, p.correct, p.chosen, p.question, p.options]);
}

/** Prefer searchable text over uploading full pages on every click.
 * Include scans for native layouts that the simplified prompt cannot capture.
 */
export function MathExplain(props: Props) {
  const tx = useTx();
  const fn = useServerFn(explainMathAnswer);
  const key = cacheKey(props);
  const [result, setResult] = useState<{ key: string; text: string; error: boolean } | null>(() => {
    const previous = explanationCache.get(key);
    return previous ? { key, text: previous, error: false } : null;
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
          item: props.item, kind: props.kind, task: props.task,
          correct: props.correct, chosen: props.chosen,
          question: props.question?.slice(0, 3500) ?? "",
          options: props.options?.slice(0, 6) ?? [], pages,
        },
      });
      setResult({ key, text: r.text, error: !!r.error });
      if (!r.error && !r.offline) explanationCache.set(key, r.text);
    } catch {
      setResult({ key, text: tx("Չհաջողվեց ստանալ բացատրությունը։ Ստուգիր կապը և կրկին փորձիր։"), error: true });
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-w-0">
    {active && <RichExplanation text={active.text} error={active.error}/>}
    {(!active || active.error) && <Button
      variant="secondary" type="button" disabled={loading} onClick={() => void run()}
      className="mt-3 h-auto min-h-11 w-full whitespace-normal text-left sm:w-auto">
      {loading ? <Loader2 className="size-4 animate-spin" /> : active?.error ? <RefreshCw className="size-4"/> : <Sparkles className="size-4"/>}
      {loading ? tx("Բացատրությունը պատրաստվում է…") : active?.error ? tx("Կրկին փորձել") : tx("Տեսնել քայլ առ քայլ լուծումը")}
    </Button>}
  </div>;
}
