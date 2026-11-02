import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

describe("Biology production crash regression", () => {
  it("initializes the selected book source before passing it into React Query", () => {
    const src = readFileSync("src/components/BiologyWorkspace.tsx", "utf8");
    const sourceState = src.indexOf('const [source, setSource] = useState(');
    const query = src.indexOf('const data = useQuery({');
    expect(sourceState).toBeGreaterThan(0);
    expect(query).toBeGreaterThan(sourceState);
    expect(src).toContain('queryKey: ["biology-configurable-pool-v3", source]');
  });

  it("redirects saved original-book links to standard book pages", () => {
    expect(existsSync("src/routes/biology_.original.tsx")).toBe(true);
    expect(existsSync("src/routes/biology.original.tsx")).toBe(false);
    const standalone = readFileSync("src/routes/biology_.original.tsx", "utf8");
    expect(standalone).toContain('createFileRoute("/biology/original")');
    expect(standalone).toContain('throw redirect({ to: "/book/$bookId"');
    expect(standalone).toContain('search.volume === 4 ? "34" : "33"');
    const biologyRoute = readFileSync("src/routes/biology.tsx", "utf8");
    expect(biologyRoute).toContain('component: BiologyPage');
    expect(biologyRoute).toContain('<BiologyWorkspace');
    expect(biologyRoute).toContain('initialBook={book} initialSection={section}');
  });
});

