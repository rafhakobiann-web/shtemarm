import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GITHUB_ANDROID_APK_URL, GITHUB_ANDROID_RELEASE_URL, GITHUB_ANDROID_BETA_VERSION, safePublicApkUrl } from "@/lib/app-download";

const source = (name: string) => readFileSync(name, "utf8");

describe("Shtemarm app download", () => {
  it("only accepts a public HTTPS APK or same-origin static APK path", () => {
    expect(safePublicApkUrl("https://example.org/shtemarm.apk")).toBe(
      "https://example.org/shtemarm.apk",
    );
    expect(safePublicApkUrl(" /downloads/shtemarm.apk ")).toBe(
      "/downloads/shtemarm.apk",
    );
    for (const unsafe of [
      undefined, "", "//evil.com/app.apk", "http://example.org/app.apk",
      "javascript:alert(1)", "https://foo.test/file.zip",
      "https://user:pass@foo.test/app.apk", "https://foo.test/app.apk?access_token=secret",
      "/downloads/test.apk#fragment",
    ]) expect(safePublicApkUrl(unsafe)).toBeNull();
  });
  it("provides a visible, navigable download page on desktop and mobile", () => {
    const header = source("src/components/AppHeader.tsx");
    const home = source("src/routes/index.tsx");
    const download = source("src/routes/download.tsx");
    expect(header.match(/to="\/download"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(home).toContain('to="/download"');
    expect(download).toContain('createFileRoute("/download")');
    expect(download).toContain('beforeinstallprompt');
    expect(download).toContain('appinstalled');
    expect(download).toContain("VITE_ANDROID_APK_URL");
  });
  it("uses a real published GitHub beta, never a Google Play store badge", () => {
    const download = source("src/routes/download.tsx");
    const landing = source("src/routes/index.tsx");
    const showcase = source("src/components/LandingShowcase.tsx");
    expect(GITHUB_ANDROID_BETA_VERSION).toBe("0.3.0-beta.4");
    expect(GITHUB_ANDROID_APK_URL).toMatch(
      /^https:\/\/github\.com\/rafhakobiann-web\/shtemarm\/releases\/download\/v0\.3\.0-beta\.4\/.+\.apk$/,
    );
    expect(safePublicApkUrl(GITHUB_ANDROID_APK_URL)).toBe(GITHUB_ANDROID_APK_URL);
    expect(GITHUB_ANDROID_RELEASE_URL).toContain("/releases/tag/v0.3.0-beta.4");
    expect(download).toContain("?? GITHUB_ANDROID_APK_URL");
    expect(download).toContain('href={GITHUB_ANDROID_RELEASE_URL}');
    expect(landing).toContain('to="/download"');
    expect(showcase).toContain("href={GITHUB_ANDROID_APK_URL}");
    expect(showcase).toContain("href={GITHUB_ANDROID_RELEASE_URL}");
    expect([landing,showcase,download].join("\n")).not.toContain("play.google.com/store/apps");
    expect(source(".env.example")).toContain("VITE_ANDROID_APK_URL=");
  });
});

describe("smooth scrolling is accessible and avoids expensive repaints", () => {
  it("keeps native touch scrolling and respects accessibility preferences", () => {
    const css = source("src/styles.css");
    expect(css).toContain("blur(9px) saturate(140%)");
    expect(css).toContain("prefers-reduced-transparency: reduce");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain('data-glass-blur="off"');
  });
  it("hysteresis reduces dock jitter while preserving the five tab links", () => {
    const nav = source("src/components/MobileNav.tsx");
    expect(nav).toContain("directionTravel");
    expect(nav).toContain("directionTravel > 48");
    expect(nav).toContain("lastSectionY");
    expect(nav).toContain("MOBILE_TAB_TARGETS");
  });
  it("uses draw-cache and stable lazy lists in the native Android app", () => {
    const glass = source("android/app/src/main/java/am/shtemarm/app/NativeLiquidGlass.kt");
    const app = source("android/app/src/main/java/am/shtemarm/app/MainActivity.kt");
    const repo = source("android/app/src/main/java/am/shtemarm/app/QuestionRepository.kt");
    expect(glass).toContain("drawWithCache");
    expect(app).toContain("state = homeScroll");
    expect(app).toContain("state = studyScroll");
    expect(app).toContain("key = { it.id }");
    expect(repo).toContain("recentBooks");
  });
});
