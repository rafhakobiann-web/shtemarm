import { createFileRoute } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import cover1 from "@/assets/hayoc-patm-1.webp.asset.json";
import cover2 from "@/assets/hayoc-patm-2.webp.asset.json";
import cover3 from "@/assets/hayoc-patm-3.webp.asset.json";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [
    { title: "Հայոց պատմություն · Շտեմարան" },
    { name: "description", content: "Հայոց պատմության երեք շտեմարանները՝ շուտով։" },
    { property: "og:title", content: "Հայոց պատմություն · Շտեմարան" },
    { property: "og:description", content: "Հայոց պատմության շտեմարանների ընտրություն։ Շուտով։" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HistoryPage,
});

function HistoryPage() {
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-3xl font-black">Հայոց պատմություն</h1>
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><LockKeyhole className="size-4" />Շուտով</span>
    </div>
    <div className="grid gap-6 sm:grid-cols-3">
      {[cover1, cover2, cover3].map((cover, i) => <article key={cover.asset_id} className="overflow-hidden rounded-lg border bg-card">
        <img src={cover.url} alt={`Հայոց պատմություն · Շտեմարան ${i + 1}`} className="aspect-[700/988] w-full object-contain" />
        <div className="flex items-center justify-between gap-2 p-4"><h2 className="font-bold">Շտեմարան {i + 1}</h2><LockKeyhole className="size-4 text-muted-foreground" aria-label="Շուտով" /></div>
      </article>)}
    </div>
  </div>;
}