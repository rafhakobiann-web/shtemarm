import { Sparkles } from "lucide-react";
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
/** Works for math and science explanations. Diagrams have schema validation. */
export function RichExplanation({ text, error = false }: { text: string; error?: boolean }) {
  const tx = useTx();
  return <section role={error ? "alert" : "status"} className="explanation-panel mt-4 min-w-0 space-y-3 rounded-3xl border border-primary/20 bg-card p-4 shadow-sm sm:p-5">
    <header className="flex items-center gap-2 border-b border-border/50 pb-3">
      <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-5"/></span>
      <h3 className="text-base font-black">{tx("Բացատրություն · քայլ առ քայլ")}</h3>
    </header>
    {splitExplanation(text.replace(/\\n/g,"\n")).map((block,i) => {
      if (block.kind === "diagram") {
        const diagram = readDiagram(block.value);
        return diagram ? <MathDiagram key={i} spec={diagram} /> : null;
      }
      if (block.kind === "code")
        return <pre key={i} className="max-w-full overflow-auto rounded-2xl border bg-muted/60 p-4 text-xs leading-relaxed">{block.value}</pre>;
      return <MathProse key={i} text={block.value}/>;
    })}
  </section>;
}
