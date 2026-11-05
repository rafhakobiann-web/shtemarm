import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { GITHUB_ANDROID_APK_URL, GITHUB_ANDROID_RELEASE_URL, safePublicApkUrl } from "@/lib/app-download";

const read=(path:string)=>readFileSync(path,"utf8");

describe("Shtemarm editorial learning landing",()=>{
  it("preserves the brand and website auth route while using the supplied reference's visual language",()=>{
    const landing=read("src/routes/index.tsx");
    const root=read("src/routes/__root.tsx");
    const css=read("src/landing-editorial-2026.css");
    expect(landing).toContain('className="sht-landing sht-editorial"');
    expect(landing).toContain('id="sht-hero-title"');
    expect(landing.match(/<h1\b/g)?.length).toBe(1);
    expect(landing).toContain('<LandingShowcase lang={lang} />');
    expect(landing).toContain('className="sht-editorial-phone"');
    expect(landing).toContain('to="/auth"');
    expect(landing).toContain('to="/download"');
    expect(root).toContain('landingEditorialCss from "../landing-editorial-2026.css?url"');
    expect(root).toContain('href: landingEditorialCss');
    expect(css).toContain(".sht-story-paper");
    expect(css).toContain(".sht-story-gold");
    expect(css).toContain(".sht-story-ai");
    expect(css).toContain(".sht-story-download");
    expect(css).toContain(".sht-editorial-phone");
  });

  it("has a working guest practice sample, not an invented official exam question",()=>{
    const sample=read("src/components/LandingShowcase.tsx");
    expect(sample).toContain("const [answer,setAnswer] = useState<number|null>(null)");
    expect(sample).toContain('onClick={()=>setAnswer(n)}');
    expect(sample).toContain("n===3");
    expect(sample).toContain('role="status"');
    expect(sample).toContain('onClick={()=>setAnswer(null)}');
    expect(sample).toContain("not an official question-bank item");
    expect(sample).toContain("ոչ պաշտոնական շտեմարանի հարց");
    expect(sample).toContain("не задание из официального сборника");
  });

  it("keeps AI and progress previews explicitly illustrative and non-billable",()=>{
    const sample=read("src/components/LandingShowcase.tsx");
    expect(sample).toContain("no AI request");
    expect(sample).toContain("AI հարցում չի կատարվում");
    expect(sample).toContain("Illustrative progress");
    expect(sample).toContain("Օրինակային առաջընթաց");
    expect(sample).not.toContain("chatReply(");
    expect(sample).not.toContain("supabaseAdmin");
    expect(sample).not.toContain("recordAnswer(");
    expect(sample).toContain('to="/auth"');
  });

  it("points Android visitors only to a verified public GitHub beta, not Google Play",()=>{
    const sample=read("src/components/LandingShowcase.tsx");
    const landing=read("src/routes/index.tsx");
    const download=read("src/routes/download.tsx");
    expect(GITHUB_ANDROID_APK_URL).toContain("github.com/rafhakobiann-web/shtemarm/releases/download/v0.3.0-beta.4/");
    expect(safePublicApkUrl(GITHUB_ANDROID_APK_URL)).toBe(GITHUB_ANDROID_APK_URL);
    expect(GITHUB_ANDROID_RELEASE_URL).toContain("/releases/tag/v0.3.0-beta.4");
    expect(sample).toContain('href={GITHUB_ANDROID_APK_URL}');
    expect(sample).toContain('href={GITHUB_ANDROID_RELEASE_URL}');
    expect(sample).toContain("Debug beta build");
    expect(download).toContain("?? GITHUB_ANDROID_APK_URL");
    expect(landing).toContain('to="/download"');
    expect([landing,sample,download].join("\\n")).not.toContain("play.google.com/store/apps");
  });

  it("supports small screens, touch interaction, and reduced-motion accessibility",()=>{
    const css=read("src/landing-editorial-2026.css");
    const landing=read("src/routes/index.tsx");
    expect(css).toContain("@media(max-width:420px)");
    expect(css).toContain("@media(max-width:700px)");
    expect(css).toContain("prefers-reduced-motion:reduce");
    expect(css).toContain(":focus-visible");
    expect(css).toContain(".sht-story-answers button");
    expect(landing).toContain("onPointerDown={startPreviewSwipe}");
    expect(landing).toContain("onPointerUp={finishPreviewSwipe}");
    expect(landing).toContain("onPointerCancel");
  });

  it("reuses the official GitHub release and requires no new image hosting, scripts, or external tracking",()=>{
    const sample=read("src/components/LandingShowcase.tsx");
    expect(sample).not.toContain("iframe");
    expect(sample).not.toContain("<script");
    expect(sample).not.toContain("play.google.com/");
    expect(sample).not.toContain("window.location.assign");
    expect(sample).toContain('rel="noopener noreferrer"');
  });
});
