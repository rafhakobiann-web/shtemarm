import { readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { SITE_ANDROID_APK_URL, SITE_ANDROID_BETA_VERSION, safePublicApkUrl, publiclyAccessibleApkUrl } from "@/lib/app-download";

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
  it("uses the existing public website APK instead of a private GitHub release", () => {
    const download = source("src/routes/download.tsx");
    const landing = source("src/routes/index.tsx");
    const showcase = source("src/components/LandingShowcase.tsx");
    const manifest = JSON.parse(source("public/downloads/android-release.json"));
    expect(SITE_ANDROID_BETA_VERSION).toBe(manifest.version);
    expect(SITE_ANDROID_APK_URL).toBe("/downloads/shtemarm-android.apk");
    const file = "public/downloads/shtemarm-android.apk";
    expect(statSync(file).size).toBe(manifest.size);
    expect(createHash("sha256").update(readFileSync(file)).digest("hex")).toBe(manifest.sha256);
    expect(safePublicApkUrl(SITE_ANDROID_APK_URL)).toBe(SITE_ANDROID_APK_URL);
    expect(publiclyAccessibleApkUrl("https://github.com/rafhakobiann-web/shtemarm/releases/download/v0.3.0-beta.4/private.apk")).toBeNull();
    expect(publiclyAccessibleApkUrl(SITE_ANDROID_APK_URL)).toBe(SITE_ANDROID_APK_URL);
    expect(download).toContain("?? SITE_ANDROID_APK_URL");
    expect(showcase).toContain("href={SITE_ANDROID_APK_URL}");
    expect(showcase).toContain("download=\"Shtemarm-Android.apk\"");
    expect(landing).toContain('to="/download"');
    expect([landing,showcase,download].join("\\n")).not.toContain("play.google.com/store/apps");
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
