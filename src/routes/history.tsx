import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, Trophy } from "lucide-react";
import { HistoryExam } from "@/components/HistoryExam";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/history")({
  validateSearch: z.object({ test: z.coerce.number().int().min(1).max(4).optional() }),
  head: () => ({ meta: [
    { title: "Հայոց պատմություն · Թեստեր" },
    { name: "description", content: "Հայոց պատմության 2026 թվականի 1-ին փուլի նմուշային թեստեր՝ 70 առաջադրանք։" },
    { property: "og:title", content: "Հայոց պատմություն · Թեստեր" },
    { property: "og:description", content: "Հայոց պատմության նմուշային թեստեր 2026 թ. քննության կառուցվածքով։" },
    { property: "og:type", content: "website" },
  ] }),
  component: HistoryPage,
});

const TESTS = [1, 2, 3, 4] as const;

function HistoryPage() {
  const { test } = Route.useSearch();

  if (test) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/history"><ArrowLeft /> Բոլոր թեստերը</Link>
        </Button>
        <HistoryExam testId={test} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black">Հայոց պատմություն</h1>
        <p className="text-sm text-muted-foreground">2026 թ. 1-ին փուլ · նմուշային թեստեր։ Շտեմարանները շուտով։</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TESTS.map((id) => (
          <Link
            key={id}
            to="/history"
            search={{ test: id }}
            className="shadow-card flex items-center gap-4 rounded-2xl border bg-card p-5 transition-transform hover:-translate-y-1"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary"><Trophy /></span>
            <div>
              <h2 className="font-bold">Թեստ {id}</h2>
              <p className="text-sm text-muted-foreground">70 հարց</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
