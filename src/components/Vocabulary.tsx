import { useEffect, useMemo, useState } from "react";
import { Bookmark, Search, Trash2, Volume2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readVocabulary, removeVocabularyEntry, subscribeVocabulary, type VocabularyEntry } from "@/lib/vocabulary";
import { useTx } from "@/lib/lang";

export function Vocabulary() {
  const tx = useTx();
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const refresh = () => setEntries(readVocabulary());
    refresh();
    return subscribeVocabulary(refresh);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return entries;
    return entries.filter(item => [item.word, item.meaning, item.context].some(value => value.toLocaleLowerCase().includes(needle)));
  }, [entries, query]);

  const speak = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return <section className="space-y-5">
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={query} onChange={event => setQuery(event.target.value)} placeholder={tx("Փնտրել բառ, թարգմանություն կամ համատեքստ")} className="pl-9" aria-label={tx("Փնտրել բառապաշարում")} />
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary"><Bookmark className="size-5" /></div>
        <div>
          <p className="font-bold">{tx("Իմ բառապաշարը")}</p>
          <p className="text-sm text-muted-foreground">{tx("{count} պահպանված բառ", { count: entries.length })}</p>
        </div>
      </div>
    </div>

    {filtered.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center">
      <BookOpen className="mx-auto mb-3 size-8 text-muted-foreground" />
      <p className="font-bold">{entries.length ? tx("Որոնման արդյունք չկա") : tx("Դեռ բառեր չկան")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{entries.length ? tx("Փորձիր այլ բառ կամ թարգմանություն։") : tx("Անգլերեն առաջադրանքներում սեղմիր բառի վրա և ընտրիր «Ավելացնել բառապաշարում»։")}</p>
    </div> : <div className="grid gap-3 sm:grid-cols-2">
      {filtered.map(entry => <article key={entry.id} className="min-w-0 rounded-xl border bg-card p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-black" lang="en">{entry.word}</h2>
            <p className="mt-1 break-words text-sm leading-relaxed">{entry.meaning}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" aria-label={tx("Լսել {word}", { word: entry.word })} onClick={() => speak(entry.word)}><Volume2 className="size-4" /></Button>
            <Button variant="ghost" size="icon" aria-label={tx("Հեռացնել {word}", { word: entry.word })} onClick={() => removeVocabularyEntry(entry.id)}><Trash2 className="size-4" /></Button>
          </div>
        </div>
        {entry.context && <p className="mt-3 border-t pt-3 text-xs leading-relaxed text-muted-foreground"><span className="font-bold">{tx("Համատեքստ")}:</span> {entry.context}</p>}
      </article>)}
    </div>}
    <p className="text-xs text-muted-foreground">{tx("Բառերը պահպանվում են այս սարքի բրաուզերում։ Այլ սարքերում ինքնաբերաբար չեն համաժամացվում։")}</p>
  </section>;
}
