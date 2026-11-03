import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

// Preserve saved links while using the same study and test pages as other books.
export const Route = createFileRoute("/biology_/original")({
  staticData: { sitemap: false },
  validateSearch: z.object({ volume: z.coerce.number().int().min(3).max(4).catch(3) }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/book/$bookId", params: { bookId: search.volume === 4 ? "34" : "33" }, replace: true });
  },
});
