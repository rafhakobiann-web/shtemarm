import { useEffect, useState } from "react";

// Shared KaTeX loader for chat, exercises, calculator, and explanations.
// The pinned version is loaded only once even if several components mount.
const KATEX_VERSION = "0.16.25";


export type Katex = {
  renderToString: (tex: string, opts?: Record<string, unknown>) => string;
};
let loading: Promise<Katex | null> | null = null;
const current = () => typeof window === "undefined" ? null :
  (window as typeof window & { katex?: Katex }).katex ?? null;

export function loadKatex(): Promise<Katex | null> {
  if (typeof document === "undefined") return Promise.resolve(null);
  if (current()) return Promise.resolve(current());
  if (loading) return loading;
  loading = new Promise<Katex | null>((resolve) => {
    if (!document.querySelector('link[data-shtemarm-katex]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@" + KATEX_VERSION + "/dist/katex.min.css";
      link.crossOrigin = "anonymous";
      link.dataset.shtemarmKatex = "true";
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-shtemarm-katex]');
    const script = existing ?? document.createElement("script");
    const done = () => { const loaded = current(); if (!loaded) loading = null; resolve(loaded); };
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => {
      loading = null;
      resolve(null);
    }, { once: true });
    if (existing && current()) { resolve(current()); return; }
    if (!existing) {
      script.src = "https://cdn.jsdelivr.net/npm/katex@" + KATEX_VERSION + "/dist/katex.min.js";
      script.crossOrigin = "anonymous";
      script.async = true;
      script.dataset.shtemarmKatex = "true";
      document.head.appendChild(script);
    }
  });
  return loading;
}
export function useKatex(): Katex | null {
  const [katex, setKatex] = useState<Katex | null>(() => current());
  useEffect(() => { void loadKatex().then(setKatex); }, []);
  return katex;
}
type Piece = { text: string; math: boolean; display: boolean };
/** Supports inline/block TeX in $...$, $$...$$, \(...\), and \[...\]. */
export function splitMath(text: string): Piece[] {
  const delimiter = /(\\\[[\s\S]+?\\\]|\$\$[\s\S]+?\$\$|\\\([\s\S]+?\\\)|\$[^$\n]+?\$)/g;
  return text.split(delimiter).filter(Boolean).map((part) => {
    const display = (part.startsWith("$$") && part.endsWith("$$")) ||
      (part.startsWith("\\[") && part.endsWith("\\]"));
    const inline = display || (part.startsWith("$") && part.endsWith("$")) ||
      (part.startsWith("\\(") && part.endsWith("\\)"));
    return { text: inline ? part.slice(display ? 2 : part.startsWith("\\") ? 2 : 1, display ? -2 : part.startsWith("\\") ? -2 : -1) : part, math: inline, display };
  });
}

/** Safe, copyable formula rendering: KaTeX never trusts unverified HTML/links. */
export function RichText({ text, katex, display = false }: { text: string; katex: Katex | null; display?: boolean }) {
  return <>{splitMath(text).map((piece, i) => {
    if (!piece.math || !katex) return <span key={i} className="whitespace-pre-wrap">{piece.math && !katex ? (piece.display ? "\\[" : "\\(") + piece.text + (piece.display ? "\\]" : "\\)") : piece.text}</span>;
    try {
      const html = katex.renderToString(piece.text.slice(0, 2000), {
        displayMode: piece.display || display, throwOnError: false,
        trust: false, strict: "warn", output: "htmlAndMathml",
        maxExpand: 300, maxSize: 12,
      });
      return <span key={i} className={piece.display || display ? "math-display my-3 block overflow-x-auto py-2" : "math-inline align-baseline"}
        dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <code key={i}>{piece.text}</code>;
    }
  })}</>;
}


/** Small, conservative upgrade for pre-existing Unicode math bank strings.
 * Explicit TeX delimiters always take precedence over this formatter.
 */
export function enhanceMathText(text: string): string {
  return text.replace(/(\b[A-Za-z]\s*[²³⁴⁵]|√\([0-9a-zA-Z+\- ]+\)|(?<![0-9A-Za-z])\d+\/\d+(?![0-9A-Za-z]))/g, match => {
    if (match.startsWith("√(")) return "$\\sqrt{" + match.slice(2,-1) + "}$";
    if (match.includes("/")) {
      const [a,b]=match.split("/");
      return "$\\frac{" + a + "}{" + b + "}$";
    }
    const power = { "²":"2","³":"3","⁴":"4","⁵":"5" } as Record<string,string>;
    const head = match.trim().slice(0,-1), suffix = match.trim().slice(-1);
    return "$" + head + "^{" + power[suffix] + "}$";
  });
}

/** Plain existing questions gain TeX fractions/powers; explicit $...$ stays intact. */
export function MathContent({ text }: { text: string }) {
  const katex=useKatex();
  const parts=splitMath(text);
  return <>{parts.map((piece,i) => piece.math
    ? <RichText key={i} text={(piece.display?"$$":"$") + piece.text + (piece.display?"$$":"$")} katex={katex}/>
    : <RichText key={i} text={enhanceMathText(piece.text)} katex={katex}/>)}</>;
}
