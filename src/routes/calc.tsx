import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Send, X, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { solveProblem } from "@/lib/calc.functions";
import { useKatex, RichText } from "@/components/MathText";
import { ScientificCalc } from "@/components/ScientificCalc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/calc")({
  head: () => ({
    meta: [
      { title: "Հաշվիչ · Shtemarm" },
      { name: "description", content: "Լուծեք խնդիրը տեքստով կամ նկարով՝ քայլ առ քայլ։" },
      { property: "og:title", content: "Հաշվիչ · Shtemarm" },
    ],
  }),
  component: CalcPage,
});

type Img = { mime: "image/jpeg"; data: string; preview: string };

/** Shrinks a photo to at most 1600px on the long side, as a JPEG, so the upload stays small. */
async function shrink(file: File): Promise<Img> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const preview = canvas.toDataURL("image/jpeg", 0.85);
  return { mime: "image/jpeg", data: preview.split(",")[1] ?? "", preview };
}

function CalcPage() {
  const tx = useTx();
  const katex = useKatex();
  const [text, setText] = useState("");
  const [img, setImg] = useState<Img | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ text: string; error: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    try {
      setImg(await shrink(file));
      setResult(null);
    } catch {
      setResult({ text: tx("Չհաջողվեց բեռնել նկարը։ Փորձեք մեկ այլ նկար։"), error: true });
    }
  };

  const solve = async () => {
    if (busy || (!text.trim() && !img)) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await solveProblem({
        data: {
          text: text.trim() || undefined,
          image: img ? { mime: img.mime, data: img.data } : undefined,
        },
      });
      setResult(res.error ? { text: tx(res.text), error: true } : res);
    } catch {
      setResult({ text: tx("Չհաջողվեց լուծել։ Փորձեք ավելի ուշ։"), error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
          <Calculator className="size-7 text-primary" /> {tx("Հաշվիչ")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {tx("Գրիր խնդիրը կամ լուսանկարիր այն, և օգնականը կլուծի՝ քայլ առ քայլ։")}
        </p>
      </header>

      <Tabs defaultValue="sci">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sci">{tx("Գիտական հաշվիչ")}</TabsTrigger>
          <TabsTrigger value="ai">{tx("AI լուծիչ")}</TabsTrigger>
        </TabsList>
        <TabsContent value="sci" className="shadow-card glass rounded-3xl p-5 sm:p-6">
          <ScientificCalc />
        </TabsContent>
        <TabsContent value="ai" className="space-y-6">
        <section className="shadow-card glass space-y-4 rounded-3xl p-5 sm:p-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tx("Օրինակ՝ լուծիր՝ $x^2 - 5x + 6 = 0$")}
            rows={4}
            maxLength={2000}
            aria-label={tx("Խնդրի տեքստը")}
          />

          {img && (
            <div className="relative w-fit">
              <img src={img.preview} alt={tx("Խնդրի նկարը")} className="max-h-60 rounded-2xl border object-contain" />
              <button
                type="button"
                onClick={() => setImg(null)}
                aria-label={tx("Հեռացնել նկարը")}
                className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => cameraRef.current?.click()}>
              <Camera /> {tx("Լուսանկարել")}
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <ImagePlus /> {tx("Ընտրել նկար")}
            </Button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            <Button variant="game" className="ml-auto" onClick={solve} disabled={busy || (!text.trim() && !img)}>
              {busy ? <Loader2 className="animate-spin" /> : <Send />} {tx("Լուծել")}
            </Button>
          </div>
        </section>

        {busy && (
          <div className="grid place-items-center py-10 text-muted-foreground">
            <Loader2 className="animate-spin text-primary" />
          </div>
        )}

        {result && (
          <section
            className={`shadow-card rounded-3xl border p-5 sm:p-6 ${result.error ? "border-destructive/40 bg-card text-destructive" : "bg-card"}`}
            aria-live="polite"
          >
            <div className="whitespace-pre-line text-[15px] leading-relaxed">
              <RichText text={result.text} katex={katex} />
            </div>
          </section>
        )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
