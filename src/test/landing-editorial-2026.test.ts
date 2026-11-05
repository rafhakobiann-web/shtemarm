import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { SITE_ANDROID_APK_URL, SITE_ANDROID_BETA_VERSION, safePublicApkUrl } from "@/lib/app-download";

const read=(path:string)=>readFileSync(path,"utf8");

describe("Shtemarm editorial learning landing",()=>{
  it("preserves the brand and website auth route while using the supplied reference's visual language",()=>{
    const landing=read("src/routes/index.tsx");
    const root=read("src/routes/__root.tsx");
    const css=read("src/landing-editorial-2026.css");
    expect(landing).toContain('className="sht-landing sht-editorial"');
    expect(landing).toContain('id="sht-hero-title"');
    expect(landing.match(/<h1\b/g)?.length).toBe(1);
    for (const part of ["practice","journey","ai","download"]) {
      expect(landing).toContain(`<LandingShowcase lang={lang} part="${part}" />`);
    }
    expect(landing.indexOf('part="practice"')).toBeLessThan(landing.indexOf('id="benefits"'));
    expect(landing.indexOf('part="journey"')).toBeGreaterThan(landing.indexOf('id="subjects"'));
    expect(landing.indexOf('part="ai"')).toBeGreaterThan(landing.indexOf('id="how-it-works"'));
    expect(landing.indexOf('part="download"')).toBeGreaterThan(landing.indexOf('id="faq"'));
    expect(landing).toContain('className="sht-landing sht-editorial sht-editorial-v3"');
    expect(landing).toContain("sht-hero-highlight");
    expect(landing).toContain("sht-hero-proof");
    expect(landing).toContain('className="sht-editorial-phone"');
    expect(landing).toContain('to="/auth"');
    expect(landing).toContain('to="/download"');
    expect(root).toContain('landingEditorialCss from "../landing-editorial-2026.css?url"');
    expect(root).toContain('href: landingEditorialCss');
    const netlify=read("netlify.toml");
    expect(netlify).toContain('NITRO_PRESET = "netlify"');
    expect(netlify).toContain('publish = "dist"');
    expect(netlify).not.toContain('/* /index.html 200');
    expect(css).toContain(".sht-story-paper");
    expect(css).toContain(".sht-story-gold");
    expect(css).toContain(".sht-story-ai");
    expect(css).toContain(".sht-story-download");
    expect(css).toContain(".sht-editorial-phone");
    expect(css).toContain(".sht-dynamic-island");
    expect(css).toContain("html.dark .sht-editorial");
    expect(css).toContain("html.dark .sht-editorial :is(.sht-story-paper,.sht-story-gold,.sht-story-download)");
    expect(css).toContain("font-family:\"Noto Sans Armenian\"");
    expect(landing).toContain('aria-expanded={islandExpanded}');
    expect(landing).toContain('href="#experience"');
  });

  it("offers a real, answerable three-question guest sample without pretending it is an official bank",()=>{
    const sample=read("src/components/LandingShowcase.tsx");
    expect(sample).toContain("SAMPLE_QUESTIONS");
    expect(sample).toContain("CheckCircle2, ChevronLeft, ChevronRight");
    expect(sample).toContain("<ChevronLeft size={18}");
    expect(sample).toContain("Mathematics · sample");
    expect(sample).toContain("English · sample");
    expect(sample).toContain("Armenian language · sample");
    expect(sample).toContain("setAnswers(previous=>");
    expect(sample).toContain("changeQuestion(1)");
    expect(sample).toContain("changeQuestion(-1)");
    expect(sample).toContain('role="status"');
    expect(sample).toContain("not an official question-bank item");
    expect(sample).toContain("ոչ պաշտոնական շտեմարանի հարց");
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

  it("downloads a site-hosted APK that guests can access without private GitHub permissions",()=>{
    const sample=read("src/components/LandingShowcase.tsx");
    const download=read("src/routes/download.tsx");
    const manifest=JSON.parse(read("public/downloads/android-release.json"));
    expect(SITE_ANDROID_APK_URL).toBe("/downloads/shtemarm-android.apk");
    expect(SITE_ANDROID_BETA_VERSION).toBe(manifest.version);
    expect(manifest.path).toBe(SITE_ANDROID_APK_URL);
    expect(safePublicApkUrl(SITE_ANDROID_APK_URL)).toBe(SITE_ANDROID_APK_URL);
    expect(sample).toContain('href={SITE_ANDROID_APK_URL}');
    expect(sample).toContain('download="Shtemarm-Android.apk"');
    expect(download).toContain('?? SITE_ANDROID_APK_URL');
    expect(sample).not.toContain("GITHUB_ANDROID_RELEASE_URL");
    expect(download).not.toContain("GITHUB_ANDROID_RELEASE_URL");
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

  it("fully redesigns every lower landing chapter instead of leaving legacy Liquid Glass dark tiles",()=>{
    const css=read("src/landing-editorial-2026.css");
    const source=read("src/routes/index.tsx");
    for (const section of ["#benefits","#subjects","#how-it-works","#faq"]) {
      expect(css).toContain(`html[data-surface="liquid"] .sht-editorial ${section}`);
      expect(source).toContain(`id="${section.slice(1)}"`);
    }
    expect(css).toContain("Editorial v2 — FULL-PAGE");
    expect(css).toContain("#benefits .sht-feature:first-child");
    expect(css).toContain("#subjects .sht-subject-card");
    expect(css).toContain("#how-it-works .sht-step");
    expect(css).toContain("#faq .sht-faq-item");
    expect(css).toContain("html[data-surface=\"liquid\"] .sht-editorial .sht-bottom-cta");
    expect(css).toContain("grid-template-columns:repeat(2,minmax(0,1fr))");
    expect(css).toContain("@media (max-width:767px)");
    expect(css).toContain("@media (max-width:350px)");
  });

  it("protects phone preview and nested text from invisible dark-on-dark Liquid Glass styles",()=>{
    const css=read("src/landing-editorial-2026.css");
    for (const part of [".sht-editorial-phone",".sht-preview",".sht-preview-focus",".sht-preview-controls button",".sht-demo-option"]) {
      expect(css).toContain(`html.dark[data-surface="liquid"] .sht-editorial ${part}`);
    }
    expect(css).toContain('html.dark[data-surface="liquid"] .sht-editorial .sht-demo-option :is(span,svg)');
    expect(css).toContain('html.dark[data-surface="liquid"] .sht-editorial .sht-demo-option:is(.is-active,[aria-pressed="true"])');
    expect(css).toContain("background:#2b515b;");
    expect(css).toContain("color:#f6fbf9;");
    expect(css).toContain("background:#ffcf60;");
    expect(css).toContain("color:#13373d;");
    expect(css).toContain("prefers-reduced-motion:reduce");
  });

  it("isolates the illustrated phone in light and dark mode and stays responsive in Liquid Glass",()=>{
    const css=read("src/landing-editorial-2026.css");
    const landing=read("src/routes/index.tsx");
    expect(css).toContain("SHTEMARM EDITORIAL V3");
    expect(css).toContain('html.dark[data-surface="liquid"] .sht-editorial-v3 .sht-preview');
    expect(css).toContain('html.dark[data-surface="liquid"] .sht-editorial-v3 .sht-demo-options .sht-demo-option');
    expect(css).toContain('html[data-surface="liquid"] .sht-editorial-v3 .sht-demo-options');
    expect(css).toContain('html[data-surface="liquid"] .sht-editorial-v3 .sht-demo-options .sht-demo-option:first-child');
    expect(css).toContain("grid-template-columns:minmax(0,1fr)");
    expect(css).toContain("scroll-timeline animations");
    expect(css).not.toContain("animation-timeline:view()");
    expect(css).toContain("@media(max-width:740px)");
    expect(css).toContain("@media(max-width:420px)");
    expect(landing).toContain('aria-expanded={islandExpanded}');
  });

  it("does not add external tracking, embeds or a nonexistent Play Store listing",()=>{
    const sample=read("src/components/LandingShowcase.tsx");
    expect(sample).not.toContain("iframe");
    expect(sample).not.toContain("<script");
    expect(sample).not.toContain("play.google.com/");
    expect(sample).not.toContain("window.location.assign");
  });
});
