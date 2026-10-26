import { createFileRoute, notFound } from "@tanstack/react-router";
import { WorkbookExamWorkspace } from "@/components/WorkbookExamWorkspace";
import type { WorkbookSubject } from "@/lib/workbook-exams";

export const Route = createFileRoute("/exam/$subject")({
  beforeLoad: ({ params }) => {
    if (params.subject !== "english" && params.subject !== "armenian") throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: (params.subject === "english" ? "Անգլերեն" : "Հայոց լեզու և գրականություն") + " · Քննության կազմիչ" },
      { name: "description", content: "Անհատական քննություններ՝ հարցերի, բաժինների, ժամանակի և ռեժիմի ընտրությամբ։" },
    ],
  }),
  component: ExamPage,
});

function ExamPage() {
  const { subject } = Route.useParams();
  return <WorkbookExamWorkspace subject={subject as WorkbookSubject} />;
}
