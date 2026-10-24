import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { explainMathAnswer } from "@/lib/math-explain.functions";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";

type Segment = { page: number };

/** The pages a task is printed on, in order, at most three (a task rarely spans more). */
export function taskPages(segments: Segment[]) {
  return [...new Set(segments.map((s) => s.page))].sort((a, b) => a - b).slice(0, 3);
}

async function pageDataUrl(bookId: string, page: number) {
  const r = await fetch(`/math/books/${bookId}/p-${String(page).padStart(3, "0")}.jpg`);
  if (!r.ok) throw new Error("page");
  const bytes = new Uint8Array(await r.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:image/jpeg;base64,${btoa(binary)}`;
}

function renderExplanation(text: string) {
  return text.split(/(```[\\s\\S]*?```)/g).map((block, i) => {
    if (block.startsWith("```")) {
      const diagram = block.replace(/^```[^\\n]*\\n?/, "").replace(/```$/, "").trim();
      return (
        <div key={i} className="my-3 overflow-x-auto rounded-2xl border border-primary/20 bg-background p-4 shadow-sm">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary"><Sparkles className="size-3.5" />Գծագիր / սխեմա</p>
          <pre className="min-w-max font-mono text-sm leading-relaxed text-foreground">{diagram}</pre>
        </div>
      );
    }
    return block.split(/(\\*\\*[^*]+\\*\\*)/g).map((part, j) =>
      part.startsWith("**") ? <b key={j}>{part.slice(2, -2)}</b> : <span key={j}>{part}</span>,
    );
  });
}

/**
 * On-demand explanation for one sub-question. Nothing is requested until the student asks,
 * and the server caches the result so the same question is explained only once.
 */
export function MathExplain(props: {
  item: string;
  bookId: string;
  pages: number[];
  kind: "choice" | "tf" | "open";
  task: string;
  correct: string;
  chosen: string | null;
}) {
  const tx = useTx();
  const fn = useServerFn(explainMathAnswer);
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const pages = await Promise.all(props.pages.map((p) => pageDataUrl(props.bookId, p)));
      const r = await fn({
        data: { item: props.item, kind: props.kind, task: props.task, correct: props.correct, chosen: props.chosen, pages },
      });
      setText(r.error ? tx(r.text) : r.text);
      setFailed(r.error);
    } catch {
      setText(tx("Չհաջողվեց ստանալ բացատրությունը։"));
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-0">
      {text && (
        <div
          role={failed ? "alert" : "status"}
          className="mt-3 whitespace-pre-line rounded-xl border-l-4 border-sky bg-secondary/60 p-4 text-sm leading-relaxed"
        >
          {renderExplanation(text)}
        </div>
      )}
      {(!text || failed) && (
        <Button
          variant="secondary"
          type="button"
          disabled={loading}
          onClick={run}
          className="mt-3 h-auto min-h-10 w-full whitespace-normal text-left sm:w-auto"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {loading ? tx("Բացատրությունը պատրաստվում է…") : failed ? tx("Կրկին փորձել") : tx("Բացատրել")}
        </Button>
      )}
    </div>
  );
}
