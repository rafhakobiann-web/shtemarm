import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("OAuth and MCP build regressions", () => {
  it("keeps the optional auth return parameter optional", () => {
    const auth = readFileSync("src/routes/auth.tsx", "utf8");
    expect(auth).toContain('typeof search["next"] === "string" ? { next: search["next"] } : {}');
  });
  it("uses parsed router search data instead of passing an object to URLSearchParams", () => {
    const consent = readFileSync("src/routes/[.]lovable.oauth.consent.tsx", "utf8");
    expect(consent).toContain("loaderDeps: ({ search }) => ({ authorization_id: search.authorization_id })");
    expect(consent).toContain("const authorizationId = deps.authorization_id");
    expect(consent).not.toContain("new URLSearchParams(location.search)");
    expect(consent).toContain('if (!data) throw new Error(');
    expect(consent).toContain('"redirect_url" in data');
  });
  it("keeps the MCP question payload serializable and typed", () => {
    const tool = readFileSync("src/lib/mcp/tools/get-questions.ts", "utf8");
    expect(tool).toContain("answer?: string | number | number[] | Record<string, number> | null");
    expect(tool).toContain("const units: Array<");
    expect(tool).toContain("structuredContent:");
  });
});
