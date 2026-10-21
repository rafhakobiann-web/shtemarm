import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Languages, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translateEnglish } from "@/lib/translate.functions";
import { englishTokens, type TranslationInput } from "@/lib/translation";

const TranslationContext = createContext<((word: string, context: string) => void) | null>(null);
const localCache = new Map<string, string>();

export function TranslationProvider({ children }: { children: ReactNode }) {
  const translate = useServerFn(translateEnglish);
  const [result, setResult] = useState<{ word: string; text: string; loading: boolean; error: boolean; context: string } | null>(null);
  const request = useRef(0);
  const open = async (word: string, context: string) => {
    const id = ++request.current;
    const data: TranslationInput = { text: word, kind: "word", context: context.slice(0, 2000) };
    const key = JSON.stringify(data);
    const saved = localCache.get(key);
    setResult({ word, context, text: saved ?? "", loading: !saved, error: false });
    if (saved) return;
    try {
      const response = await translate({ data });
      if (!response.error) localCache.set(key, response.text);
      if (id === request.current) setResult({ word, context, ...response, loading: false });
    } catch {
      if (id === request.current) setResult({ word, context, text: "Չհաջողվեց թարգմանել։", loading: false, error: true });
    }
  };
  return <TranslationContext.Provider value={open}>
    {children}
    {result && <aside aria-label="Բառի թարգմանություն" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-lg border bg-popover p-4 text-popover-foreground shadow-card">
      <div className="flex items-center justify-between gap-3"><strong lang="en">{result.word}</strong><Button variant="ghost" size="icon" aria-label="Փակել թարգմանությունը" onClick={() => { request.current++; setResult(null); }}><X /></Button></div>
      <div role="status" className="break-words text-sm leading-relaxed">{result.loading ? <Loader2 className="size-5 animate-spin" aria-label="Թարգմանվում է" /> : result.text}</div>
      {result.error && <Button variant="outline" className="mt-2" onClick={() => open(result.word, result.context)}>Կրկին փորձել</Button>}
    </aside>}
  </TranslationContext.Provider>;
}

export function EnglishText({ text, context = text }: { text: string; context?: string }) {
  const open = useContext(TranslationContext);
  return <span>{englishTokens(text).map((token, index) => /^[A-Za-z]/.test(token) && open ?
    <Button key={index} variant="ghost" type="button" title={`${token} · Թարգմանել`} aria-label={`Թարգմանել ${token}`} onClick={(event) => { event.stopPropagation(); open(token, context); }} className="inline h-auto rounded-sm p-0 [font-family:inherit] [font-weight:inherit] text-[length:inherit] leading-[inherit] whitespace-normal hover:bg-secondary hover:text-primary">{token}</Button> : token)}</span>;
}

export function PassageTranslation({ text }: { text: string }) {
  const translate = useServerFn(translateEnglish);
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState<{ text: string; error: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  if (!text.trim()) return null;
  const load = async () => {
    setVisible(true);
    setLoading(true);
    try { setResult(await translate({ data: { text, kind: "passage", context: "" } })); }
    catch { setResult({ text: "Չհաջողվեց թարգմանել։", error: true }); }
    finally { setLoading(false); }
  };
  return <div className="mt-3 space-y-3">
    <Button variant="outline" disabled={loading} className="h-auto min-h-10 whitespace-normal text-left" onClick={() => { if (!result || result.error) void load(); else setVisible(!visible); }}>
      {loading ? <Loader2 className="animate-spin" /> : <Languages />}{loading ? "Թարգմանվում է…" : result?.error ? "Կրկին թարգմանել" : visible ? "Թաքցնել հայերենը" : "Ցուցադրել հայերեն թարգմանությունը"}
    </Button>
    {visible && result && <div role={result.error ? "alert" : "status"} lang="hy" className="whitespace-pre-line rounded-lg border-l-4 border-primary bg-secondary/50 p-4 text-sm leading-relaxed">{result.text}</div>}
  </div>;
}