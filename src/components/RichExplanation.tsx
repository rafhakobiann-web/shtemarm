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
/** Split steps without breaking multiline display math. */
export function teachingParagraphs(text: string): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];
  let inDollars = false;
  let inBrackets = false;
  const flush = () => { if (current.join("\n").trim()) paragraphs.push(current.join("\n").trim()); current = []; };
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    const outside = !inDollars && !inBrackets;
    if (outside && (!line.trim() || /^\s*(?:[1-9]\d?[.)]\s+|#{1,3}\s+|[-*]\s+)/.test(line))) flush();
    if (line.trim() || current.length) current.push(line);
    if ((line.match(/\$\$/g)?.length ?? 0) % 2) inDollars = !inDollars;
    if (line.includes("\\[")) inBrackets = true;
    if (line.includes("\\]")) inBrackets = false;
  }
  flush();
  return paragraphs;
}
function MathProse({ text }: { text: string }) {
  const katex = useKatex();
  const inline = (value:string) => value.split(/(\*\*[^*]+\*\*)/g).map((part,i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}><RichText text={part.slice(2,-2)} katex={katex}/></strong>
      : <RichText key={i} text={part} katex={katex}/>);
  return <div className="space-y-3">
    {teachingParagraphs(text).map((paragraph, index) => {
      const numbered = /^([1-9][0-9]?)[.)]\s+([\s\S]*)/.exec(paragraph);
      const heading = /^#{1,3}\s+([\s\S]*)/.exec(paragraph);
      const bullet = /^[-*]\s+([\s\S]*)/.exec(paragraph);
      if (heading) return <h4 key={index} className="text-base font-bold leading-7">{inline(heading[1])}</h4>;
      if (bullet) return <ul key={index} className="list-disc pl-5 leading-7"><li>{inline(bullet[1])}</li></ul>;
      return <div key={index} className={numbered ? "flex gap-3 rounded-2xl border border-border/50 bg-background/60 p-3 sm:p-4" : "leading-7"}>
        {numbered && <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-black text-primary">{numbered[1]}</span>}
        <div className="min-w-0 flex-1 space-y-1 leading-7">{inline(numbered ? numbered[2] : paragraph)}</div>
      </div>;
    })}
  </div>;
}
/** Shared, safe formatting for both tutor replies and question explanations. */
export function ExplanationContent({text}:{text:string}) {
  return <div className="min-w-0 space-y-3 break-words">
    {splitExplanation(text).map((block,i) => {
      if (block.kind === "diagram") {
        const diagram = readDiagram(block.value);
        return diagram ? <MathDiagram key={i} spec={diagram} /> : null;
      }
      if (block.kind === "code")
        return <pre key={i} className="max-w-full overflow-auto rounded-2xl border bg-muted/60 p-4 text-xs leading-relaxed">{block.value}</pre>;
      return <MathProse key={i} text={block.value}/>;
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
    <ExplanationContent text={text}/>
  </section>;
}
