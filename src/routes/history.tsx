import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { HistoryWorkspace } from "@/components/HistoryWorkspace";
export const Route = createFileRoute("/history")({
  staticData: { sitemap: true },
  validateSearch: z.object({
    test: z.coerce.number().int().min(1).max(4).optional().catch(undefined),
  }),
  head: () => ({
    meta: [
      { property: "og:title", content: "Հայոց պատմություն · Քննության կազմիչ" },
      { property: "og:description", content: "Կազմիր հայոց պատմության անհատական թեստ՝ ընտրելով բաժինները, առաջադրանքների քանակը, ժամանակը և ռեժիմը։" },
      { title: "Հայոց պատմություն · Քննության կազմիչ" },
      {
        name: "description",
        content:
          "Կազմիր հայոց պատմության անհատական թեստ՝ ընտրելով բաժինները, առաջադրանքների քանակը, ժամանակը և ռեժիմը։",
      },
    ],
  }),
  component: HistoryPage,
});
function HistoryPage() {
  const { test } = Route.useSearch();
  return <HistoryWorkspace key={test ?? "custom"} initialTest={test} />;
}
