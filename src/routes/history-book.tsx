import { createFileRoute } from "@tanstack/react-router";
import { HistoryWorkspace } from "@/components/HistoryWorkspace";
export const Route = createFileRoute("/history-book")({
  staticData: { sitemap: true },
  head: () => ({ meta: [{ title: "Հայոց պատմություն · Անհատական թեստ" }] }),
  component: HistoryWorkspace,
});
