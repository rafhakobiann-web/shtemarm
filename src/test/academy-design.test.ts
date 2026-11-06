import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE, normalizeAppearance } from "@/lib/theme";
import { translate } from "@/lib/lang";

const css = readFileSync("src/styles.css","utf8");
const home = readFileSync("src/routes/index.tsx","utf8");
const dashboard = readFileSync("src/routes/dashboard.tsx", "utf8");
const header = readFileSync("src/components/AppHeader.tsx","utf8");
const mobile = readFileSync("src/components/MobileNav.tsx","utf8");
const preferences = readFileSync("src/components/PersonalizationControls.tsx","utf8");

function luminance(hex:string){
  const values=hex.replace("#","").match(/.{2}/g)?.map(v=>parseInt(v,16)/255)??[];
  return values.map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4)
    .reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i]!,0);
}
describe("Shtemarm Academy final design tokens",()=>{
  it("uses an accessible dark teal for the new learning identity",()=>{
    expect(css).toContain("--primary: #0b766b");
    expect(css).toContain("--background: oklch(0.98 0.008 126)");
    const contrast=(1.05)/(luminance("#0b766b")+0.05);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    expect(readFileSync("public/shtemarm-logo.svg","utf8")).toContain("#0B766B");
  });
  it("defaults to visible Liquid Glass while retaining a lighter Academy option",()=>{
    expect(DEFAULT_APPEARANCE.surface).toBe("liquid");
    expect(DEFAULT_APPEARANCE.glass).toBe("adaptive");
    expect(DEFAULT_APPEARANCE.blur).toBe(true);
    expect(normalizeAppearance({surface:"liquid",glass:"vivid",blur:true}).surface).toBe("liquid");
    expect(preferences).toContain("DEFAULT_ACCENT");
    expect(preferences).toContain('soft: "Ակադեմիական"');
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain("user-high-contrast");
  });
  it("provides navigable content rather than hiding existing questions or features",()=>{
    // / is the public landing, while existing subject/exam destinations remain on /dashboard.
    for (const value of ["sht-hero", "sht-bento-grid", "sht-subject-grid", 'to="/auth"']) {
      expect(home).toContain(value);
    }
    for (const value of ["DashboardOverview", "sht-home-2026", "sht-home-subject-grid",
      'id="subjects"', 'id="exams"', 'to="/explore"', 'to="/study-tools"',
      'to="/subject/$subject"', "PHYSICS_BOOKS.map", "BIO_BOOKS.filter",
      "HISTORY_BOOKS.map", "ARMENIAN_BOOKS.map", "BOOKS.map", "MATH_BOOKS.map"]) {
      expect(dashboard).toContain(value);
    }
    const explore = readFileSync("src/routes/explore.tsx","utf8");
    for (const value of ['id="subjects"', 'id="exams"', 'id="tools"',
      'to="/mini-games"', 'to="/math"', 'to="/history"', 'to="/biology"'])
      expect(explore).toContain(value);
    expect(header).toContain('to="/explore"');
    expect(header).toContain('to="/study-tools"');
  });
  it("keeps the critical study destinations visible on phones with real touch targets",()=>{
    expect(mobile).toContain("grid-cols-5");
    expect(mobile).toContain("min-h-[3.6rem]");
    expect(mobile).toContain('to: "/explore"');
    expect(mobile).toContain('hash: "exams"');
    expect(mobile).toContain('to: "/profile"');
    expect(mobile).toContain('to: "/study-tools"');
  });
  it("localizes new study dashboard copy in English and Russian",()=>{
    expect(translate("en","Սովորիր վստահ։ Պատրաստվիր խելացի։")).toBe("Learn with confidence. Prepare smarter.");
    expect(translate("ru","Սովորիր վստահ։ Պատրաստվիր խելացի։")).toBe("Учись уверенно. Готовься эффективнее.");
    expect(translate("ru","Գործիքներ")).toBe("Инструменты");
  });
});
