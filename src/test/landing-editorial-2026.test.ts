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
    expect(landing).toContain('<LandingShowcase lang={lang} />');
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

  it("does not add external tracking, embeds or a nonexistent Play Store listing",()=>{
    const sample=read("src/components/LandingShowcase.tsx");
    expect(sample).not.toContain("iframe");
    expect(sample).not.toContain("<script");
    expect(sample).not.toContain("play.google.com/");
    expect(sample).not.toContain("window.location.assign");
  });
});
