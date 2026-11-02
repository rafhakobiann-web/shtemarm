import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, FileUp, RefreshCcw, ShieldCheck } from "lucide-react";
import { BiologyQuestionFromPdf } from "@/components/BiologyQuestionFromPdf";
import { recordAnswer } from "@/lib/progress";
import {
  answerForBiologyChoice, biologyAutoGradedCount, biologyIndexedCount,
  deleteLocalBiologyPdf, loadBiologyOriginalIndex,
  readLocalBiologyPdf, saveLocalBiologyPdf, verifyBiologySourcePdf,
  type BiologyOriginalIndex, type BiologyVolume,
} from "@/lib/biology-source";

/**
 * Text-only original-book study. The source PDF is checked once and cached on
 * the student's device, not rendered as images or uploaded to the server.
 * Do not score answers until the complete question and four options are read.
 */
export function BiologyOriginalPractice({ initialVolume = 3 }: { initialVolume?: BiologyVolume }) {
  const navigate = useNavigate();
  const [volume, setVolume] = useState<BiologyVolume>(initialVolume);
  const [index, setIndex] = useState<BiologyOriginalIndex | null>(null);
  const [chapterId, setChapterId] = useState(1);
  const [question, setQuestion] = useState(1);
  const [localFile, setLocalFile] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [canGrade, setCanGrade] = useState(false);
  const [stored, setStored] = useState(false);

  useEffect(() => { setVolume(initialVolume); }, [initialVolume]);
  useEffect(() => {
    let active = true;
    setIndex(null); setLocalFile(null); setMessage(""); setLoading(true); setStored(false);
    setChapterId(1); setQuestion(1); setCanGrade(false);
    void (async () => {
      try {
        const found = await loadBiologyOriginalIndex(volume);
        if (!active) return;
        setIndex(found);
        try {
          const cached = await readLocalBiologyPdf(volume);
          if (!active || !cached) return;
          if (await verifyBiologySourcePdf(cached, found)) {
            if (active) { setLocalFile(cached); setStored(true); }
          } else if (active) {
            setMessage("Պահված PDF-ը չի համապատասխանում ընտրված մասի բնօրինակին։ Ընտրիր ճիշտ ֆայլը։");
          }
        } catch {
          if (active) setMessage("Սարքում ֆայլի պահպանումը հասանելի չէ․ այն կարող ես ընտրել այս այցելության համար։");
        }
      } catch {
        if (active) setMessage("Չհաջողվեց բեռնել հարցերի ցանկը։");
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [volume]);

  const chapter = index?.chapters.find(c => c.id === chapterId);
  const answer = chapter ? answerForBiologyChoice(chapter, question) : null;
  const key = `biology-source:${volume}:${chapterId}:${question}`;
  const selected = chosen[key] ?? "";
  const revealed = checked[key] ?? false;
  const stats = useMemo(() => index ? {
    questions: biologyIndexedCount(index),
    autoGraded: biologyAutoGradedCount(index),
  } : null, [index]);
  const completedInChapter = Object.keys(checked).filter(k =>
    k.startsWith(`biology-source:${volume}:${chapterId}:`)).length;

  function jump(number: number) {
    if (!chapter) return;
    setQuestion(Math.min(chapter.questionCount, Math.max(1, number)));
    setCanGrade(false);
  }

  function switchVolume(next: BiologyVolume) {
    if (next === volume) return;
    setVolume(next);
    setCanGrade(false);
    void navigate({ to: "/biology/original", search: { volume: next }, replace: true });
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !index) return;
    setBusy(true); setMessage("");
    try {
      if (!await verifyBiologySourcePdf(file, index)) {
        setMessage("Ֆայլը չի համապատասխանում այս մասի 2018 թ. բնօրինակին։ Սխալ PDF-ով հարցերը չեն գնահատվի։");
        return;
      }
      setLocalFile(file); setCanGrade(false); setStored(false);
      try {
        await saveLocalBiologyPdf(volume, file);
        setStored(true);
        setMessage("Աղբյուրը հաստատված է և պահված է այս սարքում։");
      } catch {
        setMessage("Աղբյուրը հաստատված է, բայց այս սարքում պահպանել չհաջողվեց։");
      }
    } finally { setBusy(false); event.target.value = ""; }
  }

  async function removeFile() {
    try { await deleteLocalBiologyPdf(volume); } catch { /* Clear session regardless. */ }
    setLocalFile(null); setStored(false); setCanGrade(false);
    setMessage("Տեղային PDF-ը հեռացվեց այս վարժանքից։");
  }

  function checkAnswer() {
    if (!answer || !selected || !canGrade || !localFile || revealed) return;
    setChecked(previous => ({ ...previous, [key]: true }));
    recordAnswer(key, selected === answer);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-16">
      <Link to="/" search={{ subject: "biology" }} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Կենսաբանության շտեմարաններ
      </Link>
      <header className="space-y-2 rounded-3xl border bg-card p-5 sm:p-7">
        <p className="inline-flex items-center gap-2 text-xs font-bold text-primary">
          <BookOpen className="size-4" /> Բնօրինակ շտեմարանների տեքստային վարժանք
        </p>
        <h1 className="text-balance text-2xl font-black sm:text-3xl">Կենսաբանություն · Մաս {volume === 3 ? "III" : "IV"}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Հարց, չորս տեքստային տարբերակ, ստուգում և հաջորդ հարց։ Ոչ գրքի կազմ, ոչ էլ հարցի նկար։
          Միայն վստահելիորեն ընթերցվող հարցերն են ավտոմատ գնահատվում։
        </p>
      </header>

      <nav aria-label="Ընտրել կենսաբանության շտեմարանի մասը" className="grid grid-cols-2 gap-2">
        {([3, 4] as const).map(id => (
          <button type="button" key={id} aria-pressed={volume === id}
            onClick={() => switchVolume(id)}
            className={`min-h-12 rounded-xl border-2 px-4 py-3 text-sm font-black transition-colors ${volume === id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}>
            Մաս {id === 3 ? "III" : "IV"}
          </button>
        ))}
      </nav>

      {loading ? <p role="status" className="rounded-xl border bg-card p-4">Բեռնվում է շտեմարանը…</p> :
      index && stats ? (
        <>
          <p className="text-xs text-muted-foreground">
            {stats.questions.toLocaleString("hy-AM")} համարակալված առաջադրանք · {stats.autoGraded.toLocaleString("hy-AM")} 1–4 պատասխանների բանալի։
            Բոլոր հարցերի տեքստերն առանձին ձեռքով դեռ չեն ստուգվել։
          </p>

          <section className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5">
            <h2 className="inline-flex items-center gap-2 text-base font-black">
              <FileUp className="size-5 text-primary" /> Հարցերի տեքստի աղբյուր
            </h2>
            <p className="text-sm text-muted-foreground">
              {stored ? "PDF-ն արդեն պահված է քո սարքում․ ամեն հարցի համար կրկին ընտրելու կարիք չկա։" :
                `Առաջին անգամ ընտրիր ${index.sourceName} (2018 թ.)։ Տեքստը կկարդացվի միայն քո սարքում՝ առանց նկարների ցուցադրման։`}
            </p>
            {!stored && <input type="file" accept=".pdf,application/pdf" disabled={busy}
              aria-label="Ընտրել կենսաբանության բնօրինակ PDF-ը"
              onChange={e => { void importFile(e); }}
              className="block w-full min-w-0 rounded-xl border p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:font-bold file:text-primary-foreground" />}
            {localFile && (
              <div className="flex flex-wrap items-center gap-3">
                <span role="status" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                  <ShieldCheck className="size-5" /> Աղբյուրը հաստատված է {stored ? "· պահպանված է սարքում" : ""}
                </span>
                <button type="button" onClick={() => { void removeFile(); }}
                  className="min-h-10 rounded-xl border px-3 text-sm font-medium">Հեռացնել PDF-ը</button>
              </div>
            )}
            {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
          </section>

          {chapter && (
            <>
              <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
                <label className="space-y-1 text-sm font-bold">
                  <span className="block">Բաժին</span>
                  <select value={chapterId}
                    onChange={e => { setChapterId(Number(e.target.value)); setQuestion(1); setCanGrade(false); }}
                    className="h-12 w-full min-w-0 rounded-xl border bg-background px-3">
                    {index.chapters.map(c => <option value={c.id} key={c.id}>{c.id}. {c.title}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-bold">
                  <span className="block">Հարց՝ 1–{chapter.questionCount}</span>
                  <input type="number" min={1} max={chapter.questionCount} value={question}
                    onChange={e => { if (e.target.value) jump(Number(e.target.value)); }}
                    className="h-12 w-full rounded-xl border bg-background px-3" />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Հարց {question}/{chapter.questionCount}</span>
                <span>Այս բաժնում ստուգված՝ {completedInChapter}</span>
              </div>

              <BiologyQuestionFromPdf key={`${volume}:${chapter.id}`}
                file={localFile} chapter={chapter} question={question} volume={volume}
                selected={selected} disabled={!localFile || !answer || revealed}
                onChoose={option => setChosen(previous => ({ ...previous, [key]: option }))}
                onTextReady={setCanGrade} />

              {answer ? (
                <section className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5">
                  <button type="button" onClick={checkAnswer}
                    disabled={!selected || !localFile || !canGrade || revealed}
                    className="min-h-12 w-full rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground disabled:opacity-50 sm:w-auto">
                    Ստուգել պատասխանը
                  </button>
                  {revealed && canGrade && (
                    <p role="status" className="flex flex-wrap items-center gap-2 text-sm font-bold">
                      <CheckCircle2 className="size-5 text-primary" />
                      {selected === answer ? "Ճիշտ է։" : `Ճիշտ տարբերակը՝ ${answer}։`}
                    </p>
                  )}
                  {!canGrade && (
                    <p className="text-xs text-muted-foreground">
                      Ստուգելու համար անհրաժեշտ են բնօրինակից ճիշտ ընթերցված հարցն ու բոլոր չորս տարբերակները։
                    </p>
                  )}
                </section>
              ) : (
                <p role="status" className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                  Այս առաջադրանքի պատասխանի տեսակը դեռ չի գնահատվում ավտոմատ։ Կարելի է շարունակել հաջորդ հարցով։
                </p>
              )}

              <nav aria-label="Հարցերի հերթականություն" className="grid grid-cols-2 gap-3">
                <button type="button" disabled={question === 1} onClick={() => jump(question - 1)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-bold disabled:opacity-40">
                  <ArrowLeft className="size-4" /> Նախորդը
                </button>
                <button type="button" disabled={question >= chapter.questionCount} onClick={() => jump(question + 1)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-bold disabled:opacity-40">
                  Հաջորդ հարցը <ArrowRight className="size-4" />
                </button>
              </nav>
            </>
          )}
        </>
      ) : (
        <p role="alert" className="rounded-xl border bg-card p-4">
          Շտեմարանի ցանկը չբեռնվեց։ <button type="button" className="inline-flex items-center gap-1 text-primary underline" onClick={() => window.location.reload()}><RefreshCcw className="size-4"/>Կրկին փորձել</button>
        </p>
      )}
    </div>
  );
}
