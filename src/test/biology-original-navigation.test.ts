import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { z } from "zod";

const homepage = readFileSync("src/routes/dashboard.tsx","utf8");
const route = readFileSync("src/routes/biology_.original.tsx","utf8");
const reader = readFileSync("src/components/BiologyOriginalPractice.tsx","utf8");

describe("Biology original book navigation from screenshot", () => {
  it("shows each of the four actual volumes prominently, not authored 24-question part III as original", () => {
    expect(homepage).toContain('const BIOLOGY_ORIGINAL_BOOKS = [');
    expect(homepage).toContain('volume: 3 as const');
    expect(homepage).toContain('volume: 4 as const');
    expect(homepage).toContain('importedBooks.map');
    expect(homepage).toContain('BIOLOGY_ORIGINAL_BOOKS.map');
    expect(homepage).toContain('BIO_BOOKS.filter((b) => b.id === 31 || b.id === 32)');
    expect(homepage).toContain('to="/book/$bookId" params={{ bookId: String(30 + b.volume) }}');
  });
  it("removes the authored starter block from the source-book catalog", () => {
    expect(homepage).not.toContain('24 հեղինակային վարժանք');
    expect(homepage).toContain('1 837 բնօրինակ առաջադրանք');
    expect(homepage).toContain('1 688 բնօրինակ առաջադրանք');
  });
  it("shows final printed-task coverage without a BETA label for Biology", () => {
    const biologyHeader = homepage.match(/<SubjectHeader title=\{tx\("Կենսաբանություն"\)\}[^>]*\/>/)?.[0];
    expect(biologyHeader).toBeDefined();
    expect(biologyHeader).not.toMatch(/\bbeta\b/);
    const workspace = readFileSync("src/components/BiologyWorkspace.tsx", "utf8");
    expect(workspace).toContain("Մաս III · 1 837 առաջադրանք");
    expect(workspace).toContain("Մաս IV · 1 688 առաջադրանք");
    const loader = readFileSync("src/lib/books.ts", "utf8");
    expect(loader).toContain('"biology-last61"');
    expect(loader).toContain('return supplements.reduce((merged, supplement) => mergeBiologyExtended(merged, supplement), book)');
    const docs = readFileSync("docs/BIOLOGY_3_4_TEXT_IMPORT.md", "utf8");
    expect(docs).toContain("3,525");
    expect(docs).toContain("Manual editorial verification");
    expect(homepage).toContain("սրբագրման փուլ");
  });

  it("uses URL volume 4 when student opens the fourth source book, with a safe default", () => {
    expect(route).toContain('volume: z.coerce.number().int().min(3).max(4).catch(3)');
    expect(route).toContain('search.volume === 4 ? "34" : "33"');
    const schema=z.object({volume:z.coerce.number().int().min(3).max(4).catch(3)});
    expect(schema.parse({volume:"3"}).volume).toBe(3);
    expect(schema.parse({volume:"4"}).volume).toBe(4);
    expect(schema.parse({volume:"100"}).volume).toBe(3);
  });
  it("switches volumes and keeps the address in sync", () => {
    expect(reader).toContain('useState<BiologyVolume>(initialVolume)');
    expect(reader).toContain('useEffect(() => { setVolume(initialVolume); }, [initialVolume])');
    expect(reader).toContain('navigate({ to: "/biology/original", search: { volume: next }, replace: true })');
  });
  it("explains that text is available without selecting a PDF", () => {
    expect(homepage).toContain('հասանելի են՝ առանց PDF ընտրելու');
  });
});

