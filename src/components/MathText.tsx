import { useEffect, useState } from "react";
// KaTeX loader and renderer for chat and calculator replies.
const KATEX_VERSION = "0.16.11";
type Katex = { renderToString: (tex: string, opts?: Record<string, unknown>) => string };

/** Loads KaTeX once from a pinned CDN build; until it is ready, formulas show as plain text. */
export function useKatex(): Katex | null {
  const [katex, setKatex] = useState<Katex | null>(() => (typeof window !== "undefined" ? (window as unknown as { katex?: Katex }).katex ?? null : null));
  useEffect(() => {
    const w = window as unknown as { katex?: Katex };
    if (w.katex) return setKatex(w.katex);
    if (!document.querySelector("link[data-katex]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`;
      link.dataset.katex = "1";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js`;
    script.async = true;
    script.onload = () => setKatex(w.katex ?? null);
    document.head.appendChild(script);
  }, []);
  return katex;
}

/** Plain text, with $…$ and $$…$$ segments rendered as KaTeX. */
export function RichText({ text, katex }: { text: string; katex: Katex | null }) {
  if (!katex) return <>{text}</>;
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        const display = part.startsWith("$$") && part.endsWith("$$") && part.length > 4;
        const inline = !display && part.startsWith("$") && part.endsWith("$") && part.length > 2;
        if (!display && !inline) return <span key={i}>{part}</span>;
        const tex = display ? part.slice(2, -2) : part.slice(1, -1);
        let html: string;
        try {
          html = katex.renderToString(tex, { displayMode: display, throwOnError: false });
        } catch {
          return <span key={i}>{part}</span>;
        }
        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </>
  );
}
