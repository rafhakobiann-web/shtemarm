import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bookmark } from "lucide-react";
import { Vocabulary } from "@/components/Vocabulary";
import { useTx } from "@/lib/lang";

export const Route = createFileRoute("/vocabulary")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Shtemarm · Իմ բառապաշարը" },
    { name: "description", content: "Պահպանիր անգլերեն բառերը, թարգմանությունները և համատեքստերը՝ կրկնելու համար։" },
  ] }),
  component: VocabularyPage,
});

function VocabularyPage() {
  const tx = useTx();
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft className="size-4" />{tx("Գլխավոր էջ")}
    </Link>
    <header className="space-y-3">
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary"><Bookmark className="size-4" />{tx("Անգլերենի ուսուցում")}</span>
      <h1 className="text-3xl font-black sm:text-4xl">{tx("Իմ բառապաշարը")}</h1>
      <p className="max-w-2xl leading-relaxed text-muted-foreground">{tx("Պահպանիր նոր բառերը՝ դրանց հայերեն իմաստներով ու համատեքստով, հետո որոնիր, լսիր և կրկնիր դրանք։")}</p>
    </header>
    <Vocabulary />
  </main>;
}
