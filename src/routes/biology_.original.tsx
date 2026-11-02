import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { BiologyOriginalPractice } from "@/components/BiologyOriginalPractice";

export const Route = createFileRoute("/biology/original")({
  staticData: { sitemap: false },
  validateSearch: z.object({ volume: z.coerce.number().int().min(3).max(4).catch(3) }),
  head: () => ({
    meta: [
      { title: "Կենսաբանություն · Շտեմարան 3 և 4 · Բնօրինակ վարժանք · Shtemarm" },
      { name: "description", content: "Կենսաբանության 2018 թ. շտեմարանի 3-րդ և 4-րդ մասերի հարցերի էջային որոնում և բնօրինակի պատասխանների աղյուսակով վարժանք։" },
    ],
  }),
  component: OriginalBiologyBookPage,
});

function OriginalBiologyBookPage() {
  const { volume } = Route.useSearch();
  return <BiologyOriginalPractice initialVolume={volume === 4 ? 4 : 3} />;
}
