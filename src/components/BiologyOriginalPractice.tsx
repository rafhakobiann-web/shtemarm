import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "@tanstack/react-router";
import { BiologyQuestionFromPdf } from "@/components/BiologyQuestionFromPdf";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, FileUp, RefreshCcw, ShieldCheck } from "lucide-react";
import {
  answerForBiologyChoice, biologyAutoGradedCount, biologyIndexedCount,
  deleteLocalBiologyPdf, loadBiologyOriginalIndex, pageForBiologyQuestion,
  readLocalBiologyPdf, saveLocalBiologyPdf, verifyBiologySourcePdf,
  type BiologyOriginalIndex, type BiologyVolume,
} from "@/lib/biology-source";

/**
 * Read source questions in the user's own PDF; practice with source-page and
 * printed single-answer table indices. No copyrighted PDF/text stored on site.
 */
export function BiologyOriginalPractice() {
  const [volume, setVolume] = useState<BiologyVolume>(3);
  const [index, setIndex] = useState<BiologyOriginalIndex | null>(null);
  const [chapterId, setChapterId] = useState(1);
  const [question, setQuestion] = useState(1);
  const [localFile, setLocalFile] = useState<Blob | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [stored, setStored] = useState(false);

  useEffect(() => {
    let alive = true;
    setIndex(null); setLocalFile(null); setMessage(""); setLoading(true); setStored(false);
    setChapterId(1); setQuestion(1); setShowAnswers(false);
    void (async () => {
      try {
        const found = await loadBiologyOriginalIndex(volume);
        if (!alive) return;
        setIndex(found);
        try {
          const cached = await readLocalBiologyPdf(volume);
          if (!alive || !cached) return;
          const valid = await verifyBiologySourcePdf(cached, found);
          if (!alive) return;
          if (valid) { setLocalFile(cached); setStored(true); }
          else setMessage("Նախկին PDF-ը չի համապատասխանում այս մասի 2018 թ. բնօրինակին։ Ընտրիր ճիշտ PDF-ը։");
        } catch {
          if (alive) setMessage("Սարքի պահոցը հասանելի չէ․ PDF-ը կարող ես բացել այս այցելության համար։");
        }
      } catch {
        if (alive) setMessage("Գրքի էջերի և պատասխանների ցանկը բեռնել չհաջողվեց։ Թարմացրու էջը։");
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [volume]);

  useEffect(() => {
    if (!localFile) { setFileUrl(""); return; }
    const url = URL.createObjectURL(localFile);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [localFile]);

  const chapter = index?.chapters.find(c => c.id === chapterId);
  const page = chapter ? pageForBiologyQuestion(chapter, question) : null;
  const answer = chapter ? answerForBiologyChoice(chapter, question) : null;
  const key = `${volume}:${chapterId}:${question}`;
  const selected = chosen[key] ?? "";
  const revealed = checked[key] ?? false;
  const currentPage = showAnswers ? chapter?.answerPages[0] : page;
  const pdfUrl = fileUrl && currentPage ? `${fileUrl}#page=${currentPage}&zoom=page-width` : "";
  const stats = useMemo(() => index ? {
    questions: biologyIndexedCount(index),
    autoGraded: biologyAutoGradedCount(index),
  } : null, [index]);

  function jump(number: number) {
    if (!chapter) return;
    setQuestion(Math.min(chapter.questionCount, Math.max(1, number)));
    setShowAnswers(false);
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !index) return;
    setBusy(true); setMessage("");
    try {
      const valid = await verifyBiologySourcePdf(file, index);
      if (!valid) {
        setMessage("PDF-ը չի համընկնում ընտրված մասի 2018 թ. բնօրինակին։ Մի օգտագործիր մյուս մասի կամ այլ հրատարակության ֆայլը։");
        return;
      }
      setLocalFile(file); setStored(false); setShowAnswers(false);
      try {
        await saveLocalBiologyPdf(volume, file);
        setStored(true);
        setMessage("Բնօրինակ PDF-ը պահպանվեց միայն այս սարքում։ Ֆայլը սերվեր չի ուղարկվել։");
      } catch {
        setMessage("PDF-ը բացված է, սակայն սարքում պահպանել չհաջողվեց։");
      }
    } finally { setBusy(false); event.target.value = ""; }
  }

  async function removeFile() {
    try { await deleteLocalBiologyPdf(volume); } catch { /* Can still clear session. */ }
    setLocalFile(null); setStored(false); setShowAnswers(false);
    setMessage("Այս մասի PDF-ը հեռացվեց ընթացիկ դիտումից և տեղային պահոցից (եթե հասանելի էր)։");
  }

  const switchVolume = (next: BiologyVolume) => {
    if (next !== volume) setVolume(next);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <Link to="/biology" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Կենսաբանության կենտրոն
      </Link>
      <header className="space-y-3 rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-8">
        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-primary">
          <BookOpen className="size-4" /> 2018 · Բնօրինակ շտեմարանների էջային վարժանք
        </span>
        <h1 className="text-balance text-2xl font-black sm:text-4xl">Կենսաբանություն · 3-րդ և 4-րդ մասեր</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Բոլոր վեց բաժինների հարցերն ու նրանց տարբերակները կարդա հենց էջում՝ քո հաստատված PDF-ից։ Նկարներն ու բանաձևերը կտեսնես բնօրինակի հատվածում։ Պատասխանիր 1–4 տարբերակով առաջադրանքներին՝ ըստ գրքի պատասխանների աղյուսակի։
          Հաջորդականության, համապատասխանեցման, պնդումների և խնդիրների պատասխանները դեռ ավտոմատ չեն գնահատվում։
        </p>
        <p className="text-xs text-muted-foreground">
          PDF-ը չի հրապարակվում կամ փոխանցվում սերվերին։ Այն բացվում է միայն քո սարքից։
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {([3, 4] as const).map(id => (
          <button type="button" key={id} aria-pressed={volume === id}
            onClick={() => switchVolume(id)}
            className={`rounded-2xl border-2 p-4 text-left transition-colors ${volume === id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}>
            <span className="block text-lg font-black">Կենսաբանություն · Մաս {id === 3 ? "III" : "IV"}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{id === 3 ? "384" : "392"} էջ · 2018 թ.</span>
          </button>
        ))}
      </div>

      {loading ? <p role="status" className="rounded-2xl border bg-card p-5">Ստուգվում են բնօրինակի էջերն ու սարքում պահված PDF-ը…</p> :
      index && stats ? <>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-4"><strong className="text-2xl font-black">{stats.questions.toLocaleString("hy-AM")}</strong>
            <p className="text-sm text-muted-foreground">Քարտեզագրված բնօրինակ հարցեր և խնդիրներ</p></div>
          <div className="rounded-2xl border bg-card p-4"><strong className="text-2xl font-black">{stats.autoGraded.toLocaleString("hy-AM")}</strong>
            <p className="text-sm text-muted-foreground">1–4 պատասխաններով առաջադրանքներ</p></div>
        </div>
        <section className="space-y-3 rounded-3xl border bg-card p-5">
          <h2 className="flex items-center gap-2 text-lg font-black"><FileUp className="size-5 text-primary" /> Ընտրիր քո բնօրինակ PDF-ը</h2>
          <p className="text-sm text-muted-foreground">Պահանջվում է հենց <strong>{index.sourceName}</strong>՝ 2018 թվականի համապատասխան մասը։ Ստուգվում է ֆայլի SHA-256 նույնականությունը։</p>
          <input type="file" accept=".pdf,application/pdf" disabled={busy}
            className="block w-full min-w-0 rounded-xl border p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:font-bold file:text-primary-foreground"
            aria-label="Ընտրել բնօրինակ կենսաբանության PDF-ը" onChange={e => { void importFile(e); }} />
          {localFile ? <div className="flex flex-wrap items-center gap-3">
            <span role="status" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ShieldCheck className="size-5" /> PDF-ի նույնականությունը հաստատված է {stored ? "· պահված է սարքում" : ""}</span>
            <button type="button" onClick={() => { void removeFile(); }} className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-muted">Հեռացնել տեղային PDF-ը</button>
          </div> : null}
          {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
        </section>
        {chapter && <>
          <div className="grid gap-4 rounded-3xl border bg-card p-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <label className="space-y-2 text-sm font-bold">
              <span className="block">Բաժին</span>
              <select value={chapterId} onChange={e => { setChapterId(Number(e.target.value)); setQuestion(1); setShowAnswers(false); }}
                className="h-12 w-full min-w-0 rounded-xl border bg-background px-3">
                {index.chapters.map(c => <option value={c.id} key={c.id}>{c.id}. {c.title}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-bold">
              <span className="block">Հարցի համարը (1–{chapter.questionCount})</span>
              <input type="number" min={1} max={chapter.questionCount} value={question}
                onChange={e => { if (e.target.value) jump(Number(e.target.value)); }}
                className="h-12 w-full rounded-xl border bg-background px-3" />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
            <button type="button" disabled={question === 1} onClick={() => jump(question - 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 font-bold disabled:opacity-40">
              <ArrowLeft className="size-4" /> Նախորդը
            </button>
            <span className="text-center text-sm font-bold">Բաժին {chapterId} · Հարց {question}/{chapter.questionCount} · PDF էջ {page}</span>
            <button type="button" disabled={question >= chapter.questionCount} onClick={() => jump(question + 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 font-bold disabled:opacity-40">
              Հաջորդը <ArrowRight className="size-4" />
            </button>
          </div>
          <BiologyQuestionFromPdf
            key={`${volume}:${chapter.id}`}
            file={localFile}
            chapter={chapter}
            question={question}
            volume={volume}
          />
          {answer ? <section className="space-y-4 rounded-3xl border bg-card p-5">
            <h2 className="text-lg font-black">Ընտրիր գրքում տպված ճիշտ տարբերակի համարը</h2>
            <div className="grid grid-cols-4 gap-2">
              {["1","2","3","4"].map(option =>
                <button type="button" key={option} aria-pressed={selected === option}
                  disabled={!localFile || revealed}
                  onClick={() => setChosen(previous => ({ ...previous, [key]: option }))}
                  className={`min-h-14 rounded-xl border-2 text-lg font-black transition-colors disabled:opacity-60 ${selected === option ? "border-primary bg-primary/10" : "border-border bg-background"}`}>
                  {option}
                </button>)}
            </div>
            <button type="button" disabled={!selected || !localFile || revealed}
              onClick={() => setChecked(previous => ({ ...previous, [key]: true }))}
              className="min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50">
              Ստուգել պատասխանը
            </button>
            {revealed ? <p role="status" className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="size-5 text-primary" />
              {selected === answer ? "Ճիշտ է։" : `Ճիշտ տարբերակը՝ ${answer}։`}
              <span className="text-xs font-normal text-muted-foreground">Համաձայն 2018 թ. բնօրինակի պատասխանների աղյուսակի</span>
            </p> : null}
          </section> : <section className="rounded-3xl border bg-card p-5 text-sm text-muted-foreground">
            Այս առաջադրանքը պահանջում է ավելի բարդ պատասխան կամ հաշվարկ։ Տես բնօրինակ էջն ու պատասխանների աղյուսակը․ ավտոմատ գնահատում դեռ չկա։
          </section>}
          <section className="space-y-3 rounded-3xl border bg-card p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-black">Բնօրինակ PDF · {showAnswers ? "Պատասխանների բաժին" : `էջ ${page}`}</h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setShowAnswers(previous => !previous)}
                  className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-muted">
                  {showAnswers ? "Վերադառնալ հարցին" : "Բացել պատասխանների էջը"}
                </button>
                {fileUrl ? <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-muted">Բացել առանձին պատուհանում</a> : null}
              </div>
            </div>
            {pdfUrl ? <iframe key={`${volume}:${currentPage}`} title={`Կենսաբանության մաս ${volume} PDF էջ ${currentPage}`}
              src={pdfUrl} className="h-[65vh] min-h-[420px] w-full rounded-xl border bg-background"
              loading="lazy" /> :
              <p className="grid min-h-40 place-items-center rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                Ընտրիր ճիշտ բնօրինակ PDF-ը՝ հարցի տեքստն ու նկարները քո սարքից տեսնելու համար։
              </p>}
            <p className="text-xs text-muted-foreground">Աղբյուրը՝ {index.sourceName}, 2018 թ., բաժին {chapterId}, առաջադրանք {question}։ Հարցերի տեքստերն ու նկարները կայքի պահոցում չեն պատճենվում։</p>
          </section>
        </>}
      </> : <p role="alert" className="rounded-2xl border bg-card p-5">Չհաջողվեց բեռնել շտեմարանի կառուցվածքը։ <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-1 text-primary underline"><RefreshCcw className="size-4" /> Կրկին փորձել</button></p>}
    </div>
  );
}
