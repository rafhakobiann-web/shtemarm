import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MathDemandReference } from "@/components/MathDemandReference";
import { isOpenTask, isShortAnswer, isRight } from "@/lib/math-progress";
import { readFileSync } from "node:fs";

describe("math book task demand: source and answer format", () => {
  it("exposes a source-book instruction check without downloading all PDF images at mount", () => {
    const html=renderToStaticMarkup(<MathDemandReference bookId="matem-1"
      segments={[{page:149,y0:72.5,y1:140.5}]} />);
    expect(html).toContain("aria-expanded=\"false\"");
    expect(html).toContain("Համեմատել առաջադրանքի պահանջը");
    expect(html).not.toContain("p-149.jpg");
  });
  it("retains typed numeric answers even when they happen to be 1, 2, 3 or 4", () => {
    expect(isOpenTask({answer_type:"open",answers:["1","2","3","4"]})).toBe(true);
    expect(isOpenTask({answer_type:"choice",answers:["1","2","3","4"]})).toBe(false);
    expect(isOpenTask({answer_type:"tf",answers:["T","F"]})).toBe(false);
    expect(isShortAnswer("1")).toBe(false);
    expect(isRight("1,5","1.5")).toBe(true);
  });
  it("makes the source-task demand available throughout book, game and exam routes", () => {
    for(const file of ["src/routes/math.books.tsx","src/routes/math.play.tsx","src/routes/math.index.tsx"]){
      const route=readFileSync(file,"utf8");
      expect(route).toContain("MathDemandReference");
    }
  });
  it("keeps both original source PDFs pinned to audited immutable checksums", () => {
    const audit=JSON.parse(readFileSync("public/data/math-transcriptions/audit.json","utf8"));
    expect(audit.source_sha256["matem-1"]).toMatch(/^[0-9a-f]{64}$/);
    expect(audit.source_sha256["matem-2"]).toMatch(/^[0-9a-f]{64}$/);
  });
});
