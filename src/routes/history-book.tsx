import { createFileRoute } from "@tanstack/react-router";
import { HistoryWorkspace } from "@/components/HistoryWorkspace";
export const Route = createFileRoute("/history-book")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Հայոց պատմություն · Անհատական թեստ" },
    { name: "description", content: "Կազմիր հայոց պատմության անհատական թեստ՝ ընտրելով բաժինները, առաջադրանքների քանակը, ժամանակը և ռեժիմը։" },
    { property: "og:title", content: "Հայոց պատմություն · Անհատական թեստ" },
    { property: "og:description", content: "Կազմիր հայոց պատմության անհատական թեստ՝ ընտրելով բաժինները, առաջադրանքների քանակը, ժամանակը և ռեժիմը։" },
  ] }),
  component: HistoryWorkspace,
});
