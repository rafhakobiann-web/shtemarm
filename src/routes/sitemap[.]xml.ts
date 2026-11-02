import { createFileRoute, type AnyRouter } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import {
  isSitemapRouteIncluded,
  sitemapPathForLocation,
  sitemapStaticPaths,
  sitemapXML,
  type SitemapEntry,
} from "@/lib/sitemap";
import { ALL_BOOKS } from "@/lib/books";
import { ENGLISH_LEVELS } from "@/lib/levelTests";

const BASE_URL = "https://shtemarm.lovable.app";

// Code-backed public collections for the parameterized routes included in the sitemap.
const SUBJECT_IDS = ["physics", "chemistry", "geography", "russian"] as const;
const EXAM_SUBJECTS = ["english", "armenian"] as const;

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = (await getRouterInstance()) as unknown as AnyRouter;
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        const add = (to: string, params: Record<string, string>, routeId: string) => {
          if (!isSitemapRouteIncluded(router.routesById[routeId])) return;
          const location = router.buildLocation({ to, params, search: () => ({}), hash: "" });
          const path = sitemapPathForLocation(router, location, routeId);
          if (path) entries.push({ path });
        };

        for (const book of ALL_BOOKS) add("/book/$bookId", { bookId: String(book.id) }, "/book/$bookId");
        for (const subject of SUBJECT_IDS) add("/subject/$subject", { subject }, "/subject/$subject");
        for (const subject of EXAM_SUBJECTS) add("/exam/$subject", { subject }, "/exam/$subject");
        for (const level of [...ENGLISH_LEVELS.map((l) => l.id), "placement"]) {
          add("/level-test/$level", { level }, "/level-test/$level");
        }

        if (entries.length === 0) {
          return new Response(
            'No pages are included in this sitemap. Check route decisions and ancestor exclusions. Setting "exclude-subtree" on the root excludes the entire site.',
            { status: 404, headers: { "Cache-Control": "no-store" } },
          );
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
