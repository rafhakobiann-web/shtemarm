import { createFileRoute } from "@tanstack/react-router";
import { BiologyOriginalPractice } from "@/components/BiologyOriginalPractice";

export const Route = createFileRoute("/biology/original")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Կենսաբանություն · Շտեմարան 3 և 4 · Բնօրինակ վարժանք · Shtemarm" },
      { name: "description", content: "Կենսաբանության 2018 թ. շտեմարանի 3-րդ և 4-րդ մասերի հարցերի էջային որոնում և բնօրինակի պատասխանների աղյուսակով վարժանք։" },
    ],
  }),
  component: BiologyOriginalPractice,
});
