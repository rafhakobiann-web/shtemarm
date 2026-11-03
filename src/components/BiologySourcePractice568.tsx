import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { BookOpen, ChevronLeft, ChevronRight, FileCheck2, FileUp } from "lucide-react";
import { useLang } from "@/lib/lang";
import {
  loadBiologyOriginalIndex, readLocalBiologyPdf, saveLocalBiologyPdf,
  verifyBiologySourcePdf, type BiologyOriginalIndex,
} from "@/lib/biology-source";
import {
  openLocalBiologyDocument, readBiologyQuestionFromPdf,
  type PdfQuestionExtract,
} from "@/lib/biology-pdf-text";

type Reference = { chapter: number; number: number; page: number; answerPages: number[] };
type SourceQueue = {
  schemaVersion: number; sourceVolume: number; sourceSha256: string;
  questionCount: number; items: Reference[];
};
type Response = { answer: string; compared: boolean };
type Dictionary = Record<string, { hy: string; en: string; ru: string }>;
const labels = {
  title: { hy: "568 բնօրինակ առաջադրանք · ինքնուրույն վարժանք", en: "568 original tasks · self-practice", ru: "568 оригинальных заданий · самостоятельная практика" },
  caution: { hy: "Այս հարցերը դեռ ամբողջությամբ չեն սրբագրվել կամ ավտոմատ գնահատման չեն ենթարկվում։ Պատասխանն ու միավորները պետք է ստուգել բնօրինակի տպագիր բանալիով։", en: "These tasks have not all been proofread and are not automatically graded. Check answers against the original printed key.", ru: "Эти задания ещё не прошли полную проверку и не оцениваются автоматически. Сверяйте ответы с печатным ключом оригинала." },
  select: { hy: "Ընտրիր քո բնօրինակ PDF-ը (ֆայլը մնում է սարքում)", en: "Choose your original PDF (stays on your device)", ru: "Выберите оригинальный PDF (файл останется на устройстве)" },
  verified: { hy: "Բնօրինակ PDF-ի նույնականությունը հաստատված է", en: "Original PDF identity verified", ru: "Подлинность оригинального PDF подтверждена" },
  invalid: { hy: "Սա Կենսաբանության IV մասի հաստատված PDF-ը չէ։", en: "This is not the verified Biology IV PDF.", ru: "Это не проверенный PDF IV части биологии." },
  failed: { hy: "Չհաջողվեց բեռնել վարժանքը կամ PDF-ը։ Փորձիր նորից։", en: "Could not load the practice or PDF. Try again.", ru: "Не удалось загрузить задания или PDF. Попробуйте снова." },
  chapter: { hy: "Բաժին", en: "Chapter", ru: "Раздел" },
  position: { hy: "Վարժանքի համարը", en: "Practice position", ru: "Номер задания в практике" },
  question: { hy: "Բնօրինակի հարց", en: "Original question", ru: "Вопрос оригинала" },
  next: { hy: "Հաջորդը", en: "Next", ru: "Далее" },
  previous: { hy: "Նախորդը", en: "Previous", ru: "Назад" },
  source: { hy: "Բացել հարցի բնօրինակ էջը", en: "Open original question page", ru: "Открыть исходную страницу задания" },
  answerKey: { hy: "Բացել պատասխանների աղյուսակը", en: "Open printed answer key", ru: "Открыть печатный ключ ответов" },
  answer: { hy: "Իմ պատասխանը (կարող է լինել մի քանի թիվ կամ ենթահարց)", en: "My answer (may contain several values or subquestions)", ru: "Мой ответ (может содержать несколько значений или подпунктов)" },
  confirm: { hy: "Համեմատել եմ պատասխանը գրքի բնօրինակ բանալիի հետ", en: "I compared my answer with the original printed key", ru: "Я сверил(а) ответ с печатным ключом оригинала" },
  saved: { hy: "Պահել որպես ստուգված վարժանք", en: "Mark practice as reviewed", ru: "Отметить как проверенное упражнение" },
  incomplete: { hy: "Նշիր պատասխանը և հաստատիր, որ համեմատել ես բնօրինակ բանալու հետ։", en: "Enter an answer and confirm you compared it with the printed key.", ru: "Введите ответ и подтвердите сверку с печатным ключом." },
  done: { hy: "Ինքնուրույն ստուգված՝", en: "Self-reviewed:", ru: "Проверено самостоятельно:" },
  notGraded: { hy: "Ինքնագնահատում · պաշտոնական միավոր չի հաշվարկվում", en: "Self-practice · no official score calculated", ru: "Самопроверка · официальные баллы не начисляются" },
  noText: { hy: "Տեքստը հնարավոր չէ վստահելիորեն արտածել․ բացիր բնօրինակ էջը, կարդա ամբողջ առաջադրանքը և ենթահարցերը։", en: "Text could not be reliably extracted. Open the original page to read the entire task and all subquestions.", ru: "Текст не удалось достоверно извлечь. Откройте оригинальную страницу и прочитайте всё задание с подпунктами." },
  checkText: { hy: "Սարքում PDF-ից ընթերցված տեքստ․ պարտադիր համեմատիր ամբողջական բնօրինակ էջի հետ։", en: "Text read locally from your PDF; compare it with the complete original page.", ru: "Текст считан локально из PDF; сверьте с полной страницей оригинала." },
  noUpload: { hy: "Տեքստը և PDF-ը սերվերին չեն ուղարկվում։", en: "Neither the text nor the PDF is uploaded to a server.", ru: "Ни текст, ни PDF не загружаются на сервер." },
  loaded: { hy: "Հարցի տեքստը բեռնվում է…", en: "Loading question text…", ru: "Загрузка текста задания…" },
} satisfies Dictionary;
const storageKey = "shtemarm-biology4-source-self-practice-v1";
function readSaved(): Record<string, Response> {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const output: Record<string, Response> = {};
    for (const [id, record] of Object.entries(data)) {
      if (!/^4:[1-6]:[1-9]\d*$/.test(id) || !record || typeof record !== "object") continue;
      const row = record as Partial<Response>;
      if (typeof row.answer === "string" && row.answer.length <= 1000)
        output[id] = { answer: row.answer, compared: row.compared === true };
    }
    return output;
  } catch { return {}; }
}
function isValidQueue(input: unknown, index: BiologyOriginalIndex): input is SourceQueue {
  const q = input as Partial<SourceQueue>;
  if (q?.schemaVersion !== 1 || q.sourceVolume !== 4 || q.sourceSha256 !== index.sourceSha256 ||
      q.questionCount !== 568 || !Array.isArray(q.items) || q.items.length !== 568) return false;
  const seen = new Set<string>();
  for (const item of q.items) {
    const chapter = index.chapters.find(c => c.id === item.chapter);
    const key = item.chapter + ":" + item.number;
    if (!chapter || !Number.isInteger(item.number) || item.number < 1 ||
        item.number > chapter.questionCount || seen.has(key) ||
        !Array.isArray(item.answerPages) || item.answerPages.length !== 2 ||
        item.answerPages.some((p,i) => p !== chapter.answerPages[i])) return false;
    seen.add(key);
    let page = chapter.startPage;
    for (const [first, current] of chapter.pageRuns) {
      if (first > item.number) break;
      page = current;
    }
    if (page !== item.page) return false;
  }
  return seen.size === 568;
}

export function BiologySourcePractice568() {
  const lang = useLang();
  const t = (key: keyof typeof labels) => labels[key][lang];
  const [refs, setRefs] = useState<Reference[]>([]);
  const [index, setIndex] = useState<BiologyOriginalIndex | null>(null);
  const [file, setFile] = useState<Blob | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [pdf, setPdf] = useState<Awaited<ReturnType<typeof openLocalBiologyDocument>> | null>(null);
  const [extract, setExtract] = useState<PdfQuestionExtract | null>(null);
  const [cursor, setCursor] = useState(0);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [compared, setCompared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const [error, setError] = useState("");
  const current = refs[cursor];
  const key = current ? `4:${current.chapter}:${current.number}` : "";
  const response = responses[key] ?? { answer: "", compared: false };
  const reviewedCount = useMemo(() =>
    refs.filter(r => responses[`4:${r.chapter}:${r.number}`]?.compared === true).length,
  [refs, responses]);

  useEffect(() => {
    setResponses(readSaved());
    let mounted = true;
    void loadBiologyOriginalIndex(4).then(async original => {
      const resp = await fetch("/data/biology-source-practice-568.json");
      if (!resp.ok) throw new Error("Source queue not found");
      const data: unknown = await resp.json();
      if (!isValidQueue(data, original)) throw new Error("Source queue does not match original index");
      if (!mounted) return;
      setIndex(original);
      setRefs(data.items);
      try {
        const existing = await readLocalBiologyPdf(4);
        if (mounted && existing && await verifyBiologySourcePdf(existing, original)) setFile(existing);
      } catch { /* Reading browser storage is optional. */ }
    }).catch(() => { if (mounted) setError(labels.failed[lang]); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!file) { setFileUrl(""); return; }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    let live = true;
    setPdf(null);
    if (file) void openLocalBiologyDocument(file).then(doc => {
      if (live) setPdf(doc);
      else void doc.loadingTask.destroy().catch(() => {});
    }).catch(() => { if (live) setError(t("failed")); });
    return () => { live = false; };
  }, [file]);

  useEffect(() => {
    if (!pdf) return;
    return () => { void pdf.loadingTask.destroy().catch(() => {}); };
  }, [pdf]);

  useEffect(() => {
    let live = true;
    setExtract(null);
    if (!pdf || !current || !index) return () => { live = false; };
    const chapter = index.chapters.find(c => c.id === current.chapter);
    if (!chapter) return () => { live = false; };
    setLoadingText(true);
    void readBiologyQuestionFromPdf(pdf.document, chapter, current.number).then(result => {
      if (live) setExtract(result.extract);
    }).catch(() => { if (live) setExtract(null); })
      .finally(() => { if (live) setLoadingText(false); });
    return () => { live = false; };
  }, [pdf, index, current?.chapter, current?.number]);

  useEffect(() => { setCompared(false); }, [key]);

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    if (!chosen || !index) return;
    setBusy(true);
    setError("");
    try {
      if (!await verifyBiologySourcePdf(chosen, index)) {
        setError(t("invalid"));
        return;
      }
      setFile(chosen);
      try { await saveLocalBiologyPdf(4, chosen); } catch { /* Local browser cache is optional. */ }
    } catch { setError(t("failed")); }
    finally { setBusy(false); event.target.value = ""; }
  }

  function moveTo(position: number) {
    if (!refs.length) return;
    setCursor(Math.min(refs.length - 1, Math.max(0, position)));
  }

  function updateResponse(answer: string, markCompared = false) {
    if (!key) return;
    const updated = { ...responses, [key]: { answer: answer.slice(0,1000), compared: markCompared } };
    setResponses(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); }
    catch { /* Self-practice remains available for this session. */ }
  }

  if (error && !index) return <p role="alert" className="rounded-xl border p-4 text-sm">{error}</p>;
  if (!index || !current) return <p role="status" className="rounded-xl border p-4 text-sm">{t("loaded")}</p>;

  const sourcePage = fileUrl + "#page=" + current.page;
  const answerPage = fileUrl + "#page=" + current.answerPages[0];
  return (
    <section id="biology-source-review" className="space-y-5 rounded-3xl border bg-card p-5 sm:p-7" aria-label={t("title")}>
      <div className="space-y-2">
        <h2 className="flex items-center gap-2 text-xl font-black"><BookOpen className="size-5" />{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("caution")}</p>
        <p className="text-xs font-semibold text-primary">{t("done")} {reviewedCount} / 568 · {t("notGraded")}</p>
      </div>
      {!file ? (
        <label className="block space-y-2 text-sm font-semibold">
          <span className="flex items-center gap-2"><FileUp className="size-4" />{t("select")}</span>
          <input type="file" accept=".pdf,application/pdf" disabled={busy}
            onChange={e => { void onFile(e); }}
            className="w-full rounded-xl border bg-background p-3 text-sm" />
        </label>
      ) : <p role="status" className="flex items-center gap-2 text-sm font-semibold text-primary">
        <FileCheck2 className="size-4" /> {t("verified")}
      </p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">{t("noUpload")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">{t("chapter")}
          <select value={current.chapter}
            onChange={e => { const next = refs.findIndex(r => r.chapter === Number(e.target.value));if(next >= 0) moveTo(next); }}
            className="h-11 rounded-xl border bg-background px-3">
            {index.chapters.filter(c => refs.some(r => r.chapter === c.id)).map(c =>
              <option key={c.id} value={c.id}>{c.id}. {c.title}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">{t("position")} (1–568)
          <input type="number" min={1} max={568} value={cursor + 1}
            onChange={e => { const n=Number(e.target.value);if(Number.isInteger(n)) moveTo(n-1); }}
            className="h-11 rounded-xl border bg-background px-3" />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold">
        <span>{t("question")} #{current.number} · {t("chapter")} {current.chapter} · {cursor + 1}/568</span>
        <div className="flex gap-2">
          <button type="button" disabled={cursor===0} onClick={()=>moveTo(cursor-1)}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg border px-3 disabled:opacity-40">
            <ChevronLeft className="size-4" />{t("previous")}
          </button>
          <button type="button" disabled={cursor===refs.length-1} onClick={()=>moveTo(cursor+1)}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg border px-3 disabled:opacity-40">
            {t("next")}<ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      {fileUrl && <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <a href={sourcePage} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-lg border px-3 text-primary hover:underline">
          {t("source")} · {current.page}
        </a>
        <a href={answerPage} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-lg border px-3 text-primary hover:underline">
          {t("answerKey")} · {current.answerPages.join("–")}
        </a>
      </div>}
      {file && (
        <div className="space-y-2 rounded-xl border bg-background p-4">
          {loadingText ? <p role="status" className="text-sm">{t("loaded")}</p> :
            extract?.sourceVerified && extract.text ?
              <>
                <p className="text-xs text-muted-foreground">{t("checkText")}</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{extract.text}</p>
              </> :
              <p className="text-sm text-muted-foreground">{t("noText")}</p>}
        </div>
      )}
      <label className="block space-y-2 text-sm font-semibold">
        <span>{t("answer")}</span>
        <textarea value={response.answer}
          onChange={e=>{ setCompared(false); updateResponse(e.target.value); }}
          rows={3} className="w-full resize-y rounded-xl border bg-background p-3"
          placeholder={t("answer")} />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={compared || response.compared}
          onChange={e=>setCompared(e.target.checked)} className="mt-1 size-4" />
        <span>{t("confirm")}</span>
      </label>
      <button type="button" disabled={!file || !response.answer.trim() || !(compared || response.compared)}
        onClick={()=>{ updateResponse(response.answer,true);setCompared(true); }}
        className="min-h-11 rounded-xl bg-primary px-4 font-bold text-primary-foreground disabled:opacity-40">
        {t("saved")}
      </button>
      {!response.answer.trim() && <p className="text-xs text-muted-foreground">{t("incomplete")}</p>}
    </section>
  );
}
