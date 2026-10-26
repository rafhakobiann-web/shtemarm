import { useEffect, useState } from "react";

// Shared KaTeX loader for chat, exercises, calculator, and explanations.
// The pinned version is loaded only once even if several components mount.
const KATEX_VERSION = "0.19.0";
const CSS_INTEGRITY = "sha384-3rdsX6e5mueWyoweR9NIVmtEsUkokpBT/0ALqKKIBMr9j4qhHkaIkAcGgsE6uVlp";
const JS_INTEGRITY = "sha384-QFFtAGzvvj+bfgCGxXJlNZZR1nXEZgvG8tDLCCY1F19xl20WlfTYgguB4VcNdxYk";
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
      link.integrity = CSS_INTEGRITY;
      link.crossOrigin = "anonymous";
      link.dataset.shtemarmKatex = "true";
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-shtemarm-katex]');
    const script = existing ?? document.createElement("script");
    const done = () => resolve(current());
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => {
      loading = null;
      resolve(null);
    }, { once: true });
    if (!existing) {
      script.src = "https://cdn.jsdelivr.net/npm/katex@" + KATEX_VERSION + "/dist/katex.min.js";
      script.crossOrigin = "anonymous";
      script.integrity = JS_INTEGRITY;
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
    const inline = (part.startsWith("$") && part.endsWith("$")) ||
      (part.startsWith("\\(") && part.endsWith("\\)"));
    return { text: inline ? part.slice(display ? 2 : part.startsWith("\\") ? 2 : 1, display ? -2 : part.startsWith("\\") ? -2 : -1) : part, math: inline, display };
  });
}

/** Safe, copyable formula rendering: KaTeX never trusts unverified HTML/links. */
export function RichText({ text, katex, display = false }: { text: string; katex: Katex | null; display?: boolean }) {
  return <>{splitMath(text).map((piece, i) => {
    if (!piece.math || !katex) return <span key={i} className="whitespace-pre-wrap">{piece.math && !katex ? (piece.display ? "$$" : "$") + piece.text + (piece.display ? "$$" : "$") : piece.text}</span>;
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
