import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

describe("Biology production crash regression", () => {
  it("initializes the selected book source before passing it into React Query", () => {
    const src = readFileSync("src/components/BiologyWorkspace.tsx", "utf8");
    const sourceState = src.indexOf('const [source, setSource] = useState("all");');
    const query = src.indexOf('const data = useQuery({');
    expect(sourceState).toBeGreaterThan(0);
    expect(query).toBeGreaterThan(sourceState);
    expect(src).toContain('queryKey: ["biology-configurable-pool-v2", source]');
  });

  it("keeps the original PDF reader as a non-nested route beside Biology's exam builder", () => {
    expect(existsSync("src/routes/biology_.original.tsx")).toBe(true);
    expect(existsSync("src/routes/biology.original.tsx")).toBe(false);
    const standalone = readFileSync("src/routes/biology_.original.tsx", "utf8");
    expect(standalone).toContain('createFileRoute("/biology/original")');
    expect(standalone).toContain('component: BiologyOriginalPractice');
    expect(readFileSync("src/routes/biology.tsx", "utf8")).toContain('component: BiologyWorkspace');
  });
});
