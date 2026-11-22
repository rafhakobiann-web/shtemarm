import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PRIVATE_BETA_URL, safePublicApkUrl } from "@/lib/app-download";

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
    expect(header.match(/to="\/download"/g)?.length).toBeGreaterThanOrEqual(1);
    expect(home).toContain('to="/download"');
    expect(download).toContain('createFileRoute("/download")');
    expect(download).toContain('beforeinstallprompt');
    expect(download).toContain('appinstalled');
    expect(download).toContain("VITE_ANDROID_APK_URL");
  });
  it("does not misrepresent the repository's private APK as a public file", () => {
    const download = source("src/routes/download.tsx");
    // The private beta may be linked through Actions instead of an old tag.
    // Never treat a workflow URL as a publicly downloadable APK.
    expect(PRIVATE_BETA_URL).toMatch(
      /^https:\/\/github\.com\/rafhakobiann-web\/shtemarm\/(?:actions\/workflows\/[a-z0-9-]+\.yml|releases\/tag\/v[\w.-]+)$/,
    );
    expect(PRIVATE_BETA_URL).not.toMatch(/\.apk(?:[?#]|$)/);
    expect(download).toContain("privateNote");
    expect(download).toContain("invited");
    expect(download).not.toContain('const GITHUB_TOKEN');
    expect(source(".env.example")).toContain("VITE_ANDROID_APK_URL=");
  });
});

describe("smooth scrolling is accessible and avoids expensive repaints", () => {
  it("keeps native scrolling and respects reduced-motion preferences", () => {
    const css = source("src/styles.css");
    const nav = source("src/components/MobileNav.tsx");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(nav).toContain("pb-[env(safe-area-inset-bottom)]");
  });
  it("keeps four stable, accessible mobile destinations", () => {
    const nav = source("src/components/MobileNav.tsx");
    expect(nav).toContain("MOBILE_TAB_TARGETS");
    expect(nav).toContain("grid-cols-4");
    expect(nav).toContain("min-h-16");
    expect(nav).toContain('"/dashboard"');
    expect(nav).toContain('"/explore"');
    expect(nav).toContain('"/study-tools"');
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
