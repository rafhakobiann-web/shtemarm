import { useEffect, useId, useState } from "react";
import { ChevronDown, NotebookPen, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/lang";
import {
  readScratchpad, sanitizeScratchpad, scratchpadKey,
  SCRATCHPAD_MAX_LENGTH, writeScratchpad,
} from "@/lib/study-scratchpad";

const COPY = {
  hy: {
    title: "Իմ նշումները", hint: "Նշիր բանաձևեր, մտքեր կամ այն, ինչ ուզում ես հիշել։",
    local: "Պահպանվում է միայն այս դիտարկչում", label: "Նշումներ այս բաժնի համար",
    placeholder: "Գրի՛ր քո նշումները…", saved: "Նշումները պահպանված են",
    failed: "Չհաջողվեց պահպանել։ Պատճենիր նշումներդ, որ չկորցնես։",
    clear: "Մաքրել նշումները", limit: "նիշ",
  },
  en: {
    title: "My scratchpad", hint: "Jot down formulas, ideas, or anything you want to remember.",
    local: "Saved only in this browser", label: "Notes for this section",
    placeholder: "Write your notes here…", saved: "Notes saved",
    failed: "Could not save. Copy your notes so you don't lose them.",
    clear: "Clear notes", limit: "characters",
  },
  ru: {
    title: "Мои заметки", hint: "Запиши формулы, идеи и всё, что хочешь запомнить.",
    local: "Хранится только в этом браузере", label: "Заметки к этому разделу",
    placeholder: "Записывай свои заметки…", saved: "Заметки сохранены",
    failed: "Не удалось сохранить. Скопируй заметки, чтобы не потерять их.",
    clear: "Очистить заметки", limit: "символов",
  },
} as const;

export function StudyScratchpad({ bookId, sectionId }: { bookId: string; sectionId: string }) {
  const t = COPY[useLang()];
  const inputId = useId();
  const key = scratchpadKey(bookId, sectionId);
  const [note, setNote] = useState(() => readScratchpad(key));
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setNote(readScratchpad(key));
    setSaved(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) {
        setNote(readScratchpad(key));
        setSaved(true);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const changeNote = (value: string) => {
    const next = sanitizeScratchpad(value);
    setNote(next);
    setSaved(writeScratchpad(key, next));
  };

  return (
    <details className="sht-study-scratchpad group rounded-2xl border bg-card">
      <summary className="sht-scratchpad-trigger flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 sm:px-5">
        <span aria-hidden="true" className="sht-scratchpad-icon grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <NotebookPen className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block text-sm font-black text-foreground">{t.title}</strong>
          <span className="block text-xs leading-relaxed text-muted-foreground">{t.local}</span>
        </span>
        {note.trim() && <span aria-hidden="true" className="sht-scratchpad-filled size-2 shrink-0 rounded-full bg-primary" />}
        <ChevronDown aria-hidden="true" className="sht-scratchpad-chevron size-5 shrink-0 text-muted-foreground" />
      </summary>
      <div className="sht-scratchpad-body space-y-3 border-t px-4 pb-4 pt-4 sm:px-5">
        <p className="text-sm leading-relaxed text-muted-foreground">{t.hint}</p>
        <label htmlFor={inputId} className="block text-sm font-bold text-foreground">{t.label}</label>
        <textarea id={inputId} rows={5} maxLength={SCRATCHPAD_MAX_LENGTH}
          value={note} onChange={event => changeNote(event.target.value)}
          placeholder={t.placeholder}
          className="sht-scratchpad-input block w-full min-w-0 resize-y rounded-xl border bg-background px-4 py-3 text-base leading-relaxed text-foreground focus-visible:outline-2 focus-visible:outline-primary"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span role="status" aria-live="polite" className="flex min-w-0 items-center gap-1.5">
            {saved ? <CheckCircle2 aria-hidden="true" className="size-4 text-success" /> : <AlertCircle aria-hidden="true" className="size-4 text-destructive" />}
            {saved ? t.saved : t.failed}
          </span>
          <span className="tabular-nums">{note.length} / {SCRATCHPAD_MAX_LENGTH} {t.limit}</span>
        </div>
        <button type="button" disabled={!note} onClick={() => changeNote("")}
          className="sht-scratchpad-clear inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">
          <Trash2 aria-hidden="true" className="size-4" />{t.clear}
        </button>
      </div>
    </details>
  );
}
