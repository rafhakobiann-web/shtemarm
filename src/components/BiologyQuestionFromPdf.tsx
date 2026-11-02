import { useEffect, useRef, useState } from "react";
import {
  openLocalBiologyDocument, readBiologyQuestionFromPdf, renderBiologyQuestionCrop,
  type PdfQuestionExtract,
} from "@/lib/biology-pdf-text";
import type { BiologyOriginalChapter } from "@/lib/biology-source";

type Props = {
  file: Blob | null;
  chapter: BiologyOriginalChapter;
  question: number;
  volume: 3 | 4;
};

export function BiologyQuestionFromPdf({ file, chapter, question, volume }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<Awaited<ReturnType<typeof openLocalBiologyDocument>> | null>(null);
  const [questionData, setQuestionData] = useState<PdfQuestionExtract | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setPdf(null); setQuestionData(null); setImageReady(false); setError("");
    if (!file) return;
    setLoading(true);
    void openLocalBiologyDocument(file).then(async result => {
      if (!alive) { await result.loadingTask.destroy(); return; }
      setPdf(result);
    }).catch(() => {
      if (alive) setError("PDF-ի տեքստի և գծագրի ընթերցումը չհաջողվեց․ կարող ես օգտվել ներքևի բնօրինակ PDF դիտարկիչից։");
    }).finally(() => { if (alive) setLoading(false); });
    return () => {
      alive = false;
      // Wait for page tasks before destroying; on file changes, data is dropped.
      // Do not keep extracted copyrighted material beyond the session.
    };
  }, [file]);

  useEffect(() => {
    return () => { if (pdf) void pdf.loadingTask.destroy().catch(() => {}); };
  }, [pdf]);

  useEffect(() => {
    let alive = true;
    setQuestionData(null); setImageReady(false);
    if (!pdf) return;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const result = await readBiologyQuestionFromPdf(pdf.document, chapter, question);
        if (!alive) return;
        setQuestionData(result.extract);
        if (canvas.current) {
          await renderBiologyQuestionCrop(result.page, result.extract, canvas.current);
          if (alive) setImageReady(true);
        }
      } catch {
        if (alive) setError("Այս հարցի տեքստը հնարավոր չեղավ կարդալ։ Օգտվիր բնօրինակ էջից՝ առանց ենթադրական տեքստի։");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [pdf, chapter, question]);

  return (
    <section aria-label="Հարցի բնօրինակ տեքստը" className="space-y-4 rounded-3xl border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black">Հարց {question} · տեքստը բնօրինակից</h2>
        <span className="text-xs text-muted-foreground">Մաս {volume} · բաժին {chapter.id}</span>
      </div>
      {!file ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Ընտրիր վերևում նշված ճիշտ բնօրինակ PDF-ը։ Հարցի տեքստը, տարբերակներն ու նկարները կբացվեն այստեղ՝ առանց ֆայլը սերվեր փոխանցելու։
        </p>
      ) : (
        <>
          {loading && <p role="status" className="text-sm text-muted-foreground">Կարդացվում է բնօրինակի հարցը…</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {questionData?.text && !loading ? (
            <div className="space-y-4 rounded-2xl border bg-background p-4 sm:p-5">
              <p className="whitespace-pre-wrap text-base font-semibold leading-relaxed text-foreground">
                {questionData.stem || questionData.text}
              </p>
              {questionData.hasFourChoices && (
                <ol className="space-y-3 text-sm leading-relaxed">
                  {questionData.options.map((option, i) => (
                    <li className="flex items-start gap-3" key={i}>
                      <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted font-black">{i+1}</span>
                      <span className="min-w-0 flex-1 whitespace-pre-wrap">{option}</span>
                    </li>
                  ))}
                </ol>
              )}
              {!questionData.hasFourChoices && (
                <p className="text-xs text-muted-foreground">
                  Այս տիպի հարցի տարբերակների ավտոմատ առանձնացումը հաստատված չէ․ համեմատիր անմիջապես ստորև ցուցադրված բնօրինակի հատվածի հետ։
                </p>
              )}
            </div>
          ) : null}
          {questionData && !questionData.text && !loading && (
            <p role="status" className="text-sm text-muted-foreground">
              Այս էջի տեքստը վստահելի Unicode ձևով վերականգնել հնարավոր չէ։ Ցուցադրվում է բնօրինակ հարցի տպագիր պատկերը։
            </p>
          )}
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground">
              Հենց բնօրինակից ստացված հատվածը (ներառում է նաև նկարներ, բանաձևեր)
            </p>
            <div className="overflow-x-auto rounded-2xl border bg-white p-2">
              <canvas ref={canvas} className="block h-auto max-w-full" role="img" aria-label={`Կենսաբանություն՝ մաս ${volume}, բաժին ${chapter.id}, բնօրինակ հարց ${question}`} />
              {questionData && !imageReady && !error && <p className="p-4 text-xs text-gray-700">Պատրաստվում է էջի հատվածը…</p>}
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Հաշվարկներն ու պատասխանները միշտ ստուգիր այս տպագիր հատվածով․ տեքստային արտածումը կարող է բաց թողնել գծագրեր կամ արտասովոր նշաններ։
            Դրանք կայքի սերվերում չեն պահպանվում։
          </p>
        </>
      )}
    </section>
  );
}
