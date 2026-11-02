import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { WorkbookExamWorkspace } from "@/components/WorkbookExamWorkspace";
import type { WorkbookSubject } from "@/lib/workbook-exams";

export const Route = createFileRoute("/exam/$subject")({
  staticData: { sitemap: true },
  validateSearch: z.object({
    book: z.coerce.number().int().positive().optional().catch(undefined),
    section: z.coerce.number().int().positive().optional().catch(undefined),
  }),
  beforeLoad: ({ params }) => {
    if (params.subject !== "english" && params.subject !== "armenian") throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: (params.subject === "english" ? "Անգլերեն" : "Հայոց լեզու և գրականություն") + " · Քննության կազմիչ" },
      { name: "description", content: "Անհատական քննություններ՝ հարցերի, բաժինների, ժամանակի և ռեժիմի ընտրությամբ։" },
      { property: "og:title", content: (params.subject === "english" ? "Անգլերեն" : "Հայոց լեզու և գրականություն") + " · Քննության կազմիչ" },
      { property: "og:description", content: "Անհատական քննություններ՝ հարցերի, բաժինների, ժամանակի և ռեժիմի ընտրությամբ։" },
    ],
  }),
  component: ExamPage,
});

function ExamPage() {
  const { subject } = Route.useParams();
  const { book, section } = Route.useSearch();
  return <WorkbookExamWorkspace key={subject + ":" + (book ?? "") + ":" + (section ?? "")}
    subject={subject as WorkbookSubject} initialBook={book} initialSection={section} />;
}
