import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Languages, Loader2, X, BookmarkPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";
import { translateEnglish } from "@/lib/translate.functions";
import { englishTokens, TRANSLATION_LANGUAGES, type TranslationInput, type TranslationLanguage } from "@/lib/translation";
import { addVocabularyEntry } from "@/lib/vocabulary";
import { getDictionaryTranslation } from "@/lib/word-dictionary";

const TranslationContext = createContext<((word: string, context: string) => void) | null>(null);
const CACHE_PREFIX = "shtemarm-word-translation-v2:";
const memoryCache = new Map<string, string>();

function cacheKey(word: string, language: TranslationLanguage) {
  return `${language}:${word.trim().toLocaleLowerCase("en")}`;
}
function readCached(word: string, language: TranslationLanguage) {
  const key = cacheKey(word, language);
  const memory = memoryCache.get(key);
  if (memory) return memory;
  try {
    const value = window.localStorage.getItem(CACHE_PREFIX + key);
    if (value) { memoryCache.set(key, value); return value; }
  } catch { /* Private browsing or disabled storage: session cache still works. */ }
  return null;
}
function saveCached(word: string, language: TranslationLanguage, value: string) {
  const key = cacheKey(word, language);
  memoryCache.set(key, value);
  try { window.localStorage.setItem(CACHE_PREFIX + key, value); } catch { /* Keep memory cache. */ }
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const tx = useTx();
  const translate = useServerFn(translateEnglish);
  const [language, setLanguage] = useState<TranslationLanguage>("hy");
  const [result, setResult] = useState<{ word: string; text: string; loading: boolean; error: boolean; context: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const request = useRef(0);
  const open = async (word: string, context: string) => {
    const id = ++request.current;
    setSaved(false);
    const cached = readCached(word, language);
    const dictionaryMeaning = getDictionaryTranslation(word, language);
    const savedMeaning = cached ?? dictionaryMeaning;
    setResult({ word, context, text: savedMeaning ?? "", loading: !savedMeaning, error: false });
    if (savedMeaning) {
      if (!cached && dictionaryMeaning) saveCached(word, language, dictionaryMeaning);
      return;
    }
    const data: TranslationInput = { text: word, kind: "word", context: context.slice(0, 2000), language };
    try {
      const response = await translate({ data });
      if (!response.error) saveCached(word, language, response.text);
      if (id === request.current) setResult({ word, context, ...response, loading: false });
    } catch {
      if (id === request.current) setResult({ word, context, text: "Չհաջողվեց թարգմանել։", loading: false, error: true });
    }
  };
  const changeLanguage = async (next: TranslationLanguage) => {
    setLanguage(next);
    if (!result) return;
    const id = ++request.current;
    setSaved(false);
    const cached = readCached(result.word, next);
    if (cached) {
      setResult({ ...result, text: cached, loading: false, error: false });
      return;
    }
    setResult({ ...result, text: "", loading: true, error: false });
    try {
      const data: TranslationInput = { text: result.word, kind: "word", context: result.context.slice(0, 2000), language: next };
      const response = await translate({ data });
      if (!response.error) saveCached(result.word, next, response.text);
      if (id === request.current) setResult({ ...result, ...response, loading: false });
    } catch {
      if (id === request.current) setResult({ ...result, text: "Չհաջողվեց թարգմանել։", loading: false, error: true });
    }
  };
  return <TranslationContext.Provider value={open}>
    {children}
    {result && <aside aria-label={tx("Բառի թարգմանություն")} className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-lg border bg-popover p-4 text-popover-foreground shadow-card">
      <div className="flex items-center justify-between gap-3"><strong lang="en">{result.word}</strong><Button variant="ghost" size="icon" aria-label={tx("Փակել թարգմանությունը")} onClick={() => { request.current++; setResult(null); }}><X /></Button></div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <Languages className="size-4 shrink-0" />
        <span className="sr-only">{tx("Թարգմանության լեզու")}</span>
        <select aria-label={tx("Թարգմանության լեզու")} value={language} onChange={(event) => changeLanguage(event.target.value as TranslationLanguage)} className="w-full rounded-md border bg-background px-3 py-2 text-foreground">
          {TRANSLATION_LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
        </select>
      </label>
      <div role="status" className="mt-3 break-words text-sm leading-relaxed">{result.loading ? <Loader2 className="size-5 animate-spin" aria-label={tx("Թարգմանվում է")} /> : result.error ? tx(result.text) : result.text}</div>
      {result.error && <Button variant="outline" className="mt-2" onClick={() => open(result.word, result.context)}>{tx("Կրկին փորձել")}</Button>}
      {!result.loading && !result.error && result.text && <Button variant={saved ? "secondary" : "outline"} className="mt-3 w-full" onClick={() => { const ok = addVocabularyEntry({ word: result.word, meaning: result.text, context: result.context }); if (ok) setSaved(true); }} disabled={saved}>
        {saved ? <Check className="mr-2 size-4" /> : <BookmarkPlus className="mr-2 size-4" />}{saved ? tx("Ավելացված է բառապաշարում") : tx("Ավելացնել բառապաշարում")}
      </Button>}
    </aside>}
  </TranslationContext.Provider>;
}

export function EnglishText({ text, context = text }: { text: string; context?: string }) {
  const tx = useTx();
  const open = useContext(TranslationContext);
  return <span>{englishTokens(text).map((token, index) => /^[A-Za-z]/.test(token) && open ?
    <Button key={index} variant="ghost" type="button" title={`${token} · ${tx("Թարգմանել")}`} aria-label={tx("Թարգմանել {token}", { token })} onClick={(event) => { event.stopPropagation(); open(token, context); }} className="inline h-auto rounded-sm p-0 [font-family:inherit] [font-weight:inherit] text-[length:inherit] leading-[inherit] whitespace-normal hover:bg-secondary hover:text-primary">{token}</Button> : token)}</span>;
}

export function PassageTranslation({ text }: { text: string }) {
  const tx = useTx();
  const translate = useServerFn(translateEnglish);
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState<{ text: string; error: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  if (!text.trim()) return null;
  const load = async () => {
    setVisible(true);
    setLoading(true);
    try { setResult(await translate({ data: { text, kind: "passage", context: "", language: "hy" } })); }
    catch { setResult({ text: "Չհաջողվեց թարգմանել։", error: true }); }
    finally { setLoading(false); }
  };
  return <div className="mt-3 space-y-3">
    <Button variant="outline" disabled={loading} className="h-auto min-h-10 whitespace-normal text-left" onClick={() => { if (!result || result.error) void load(); else setVisible(!visible); }}>
      {loading ? <Loader2 className="animate-spin" /> : <Languages />}{loading ? tx("Թարգմանվում է…") : result?.error ? tx("Կրկին թարգմանել") : visible ? tx("Թաքցնել հայերենը") : tx("Ցուցադրել հայերեն թարգմանությունը")}
    </Button>
    {visible && result && <div role={result.error ? "alert" : "status"} lang={result.error ? undefined : "hy"} className="whitespace-pre-line rounded-lg border-l-4 border-primary bg-secondary/50 p-4 text-sm leading-relaxed">{result.error ? tx(result.text) : result.text}</div>}
  </div>;
}
