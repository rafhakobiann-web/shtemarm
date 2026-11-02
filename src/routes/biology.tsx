import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { BiologyWorkspace } from "@/components/BiologyWorkspace";

export const Route = createFileRoute("/biology")({
  staticData: { sitemap: true },
  // A section test must retain the source book and printed section. Without
  // this, students can land in the wrong subject or receive unrelated tasks.
  validateSearch: z.object({
    book: z.coerce.number().int().min(31).max(34).optional().catch(undefined),
    section: z.coerce.number().int().positive().optional().catch(undefined),
  }),
  head: () => ({
    meta: [
      { title: "Կենսաբանություն · Անհատական քննություններ" },
      { name: "description", content: "Կազմիր կենսաբանության թեստ ըստ գրքի, բաժինների, հարցերի տեսակների, քանակի և ժամանակի։" },
    ],
  }),
  component: BiologyPage,
});

function BiologyPage() {
  const { book, section } = Route.useSearch();
  return <BiologyWorkspace key={`${book ?? "all"}:${section ?? "all"}`} initialBook={book} initialSection={section} />;
}
