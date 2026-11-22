import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering; a route's existence
// must not depend on auth, network availability or stylesheet hydration.
describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
  const paths = [
    "/", "/auth", "/dashboard", "/learn", "/chat", "/mistakes",
    "/study-library", "/search", "/learning-insights",
    "/practice-history", "/study-preferences", "/explore",
    "/profile", "/study-tools",
  ];

  it.each(paths)("resolves %s to its actual route rather than the root/404", (path) => {
    const matches = router.matchRoutes(path);
    expect(matches.length).toBeGreaterThan(1);
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.at(-1)?.pathname.replace(/\/+$/, "") || "/").toBe(path);
  });

  it("keeps the root layout and its nested child route", () => {
    const matches = router.matchRoutes("/chat");
    expect(matches[0]?.routeId).toBe(rootRouteId);
    expect(matches.at(-1)?.routeId).toBe("/chat");
  });
});
