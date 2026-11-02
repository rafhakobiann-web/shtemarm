import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  openLocalBiologyDocument, readBiologyQuestionFromPdf,
  type PdfQuestionExtract,
} from "@/lib/biology-pdf-text";
import type { BiologyOriginalChapter } from "@/lib/biology-source";

type Props = {
  file: Blob | null;
  chapter: BiologyOriginalChapter;
  question: number;
  volume: 3 | 4;
  selected: string;
  disabled: boolean;
  onChoose: (number: string) => void;
  onTextReady: Dispatch<SetStateAction<boolean>>;
};

/**
 * One question, one answer list. Source text is extracted locally from the
 * student's verified PDF; we never display book scans or guessed text.
 */
export function BiologyQuestionFromPdf({
  file, chapter, question, volume, selected, disabled, onChoose, onTextReady,
}: Props) {
  const [pdf, setPdf] = useState<Awaited<ReturnType<typeof openLocalBiologyDocument>> | null>(null);
  const [questionData, setQuestionData] = useState<PdfQuestionExtract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setPdf(null);
    setQuestionData(null);
    setError("");
    onTextReady(false);
    if (!file) return () => { active = false; };
    setLoading(true);
    void openLocalBiologyDocument(file).then(async result => {
      if (!active) { await result.loadingTask.destroy(); return; }
      setPdf(result);
    }).catch(() => {
      if (active) setError("Ընտրված PDF-ի տեքստը հնարավոր չեղավ կարդալ։ Ստուգիր ֆայլը և փորձիր կրկին։");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [file, onTextReady]);

  useEffect(() => () => {
    if (pdf) void pdf.loadingTask.destroy().catch(() => {});
  }, [pdf]);

  useEffect(() => {
    let active = true;
    setQuestionData(null);
    setError("");
    onTextReady(false);
    if (!pdf) return () => { active = false; };
    setLoading(true);
    void readBiologyQuestionFromPdf(pdf.document, chapter, question)
      .then(({ extract }) => {
        if (!active) return;
        setQuestionData(extract);
        onTextReady(extract.sourceVerified && extract.hasFourChoices && extract.options.length === 4);
      }).catch(() => {
        if (active) setError("Այս հարցի տեքստը վստահելիորեն առանձնացնել չհաջողվեց։ Այն չի գնահատվի։");
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [pdf, chapter, question, onTextReady]);

  return (
    <section aria-label="Բնօրինակ հարցի տեքստը" className="space-y-4 rounded-3xl border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black">Հարց {question}</h2>
        <span className="text-xs text-muted-foreground">Մաս {volume} · բաժին {chapter.id}</span>
      </div>

      {!file && (
        <p role="status" className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Հաստատիր այս մասի PDF-ը մեկ անգամ։ Այն կպահպանվի քո սարքում, և հարցերի տեքստը կբացվի սովորական վարժանքի ձևով։
        </p>
      )}
      {file && loading && (
        <p role="status" className="text-sm text-muted-foreground">Բեռնվում է հարցի տեքստը…</p>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {file && questionData?.text && !loading && (
        <div className="space-y-4">
          <p className="whitespace-pre-wrap text-base font-semibold leading-relaxed text-foreground">
            {questionData.hasFourChoices ? questionData.stem : questionData.text}
          </p>
          {questionData.hasFourChoices && (
            <div role="group" aria-label="Պատասխանների տարբերակներ" className="grid gap-2">
              {questionData.options.map((option, i) => {
                const answer = String(i + 1);
                return (
                  <button
                    type="button" key={answer}
                    disabled={disabled}
                    aria-pressed={selected === answer}
                    onClick={() => onChoose(answer)}
                    className={`flex min-h-12 items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${selected === answer ? "border-primary bg-primary/10" : "bg-background hover:border-primary/60"}`}
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-sm font-bold">{answer}</span>
                    <span className="min-w-0 flex-1 whitespace-pre-wrap leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {file && !loading && questionData && !questionData.text && !error && (
        <p role="status" className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Այս հարցի բնօրինակ տեքստը դեռ հնարավոր չէ վստահելիորեն արտածել։ Այն չի ցուցադրվի որպես կռահված հարց և չի գնահատվի։
        </p>
      )}
      {file && !loading && questionData?.text && !questionData.hasFourChoices && (
        <p className="text-sm text-muted-foreground">
          Այս առաջադրանքի տեսակը դեռ ավտոմատ չի գնահատվում։ Ցուցադրվում է միայն կարդացվող տեքստը։
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Աղբյուր՝ {volume}-րդ մաս, բաժին {chapter.id}, տպագիր էջ {questionData?.page ?? "—"}։
        Անորոշ տեքստը և պատասխանները չեն լրացվում ինքնաբերաբար։
      </p>
    </section>
  );
}
