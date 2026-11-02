import { chromium } from "playwright";

const TARGETS = [
  "https://shtemarm.lovable.app/",
  "https://shtemarm.lovable.app/biology",
  "https://shtemarm.lovable.app/biology/original",
];
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
let errors = 0;
try {
  for (const url of TARGETS) {
    console.log("\n--- testing URL:", url);
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Linux; Android 16; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
      viewport: { width: 393, height: 852 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      ignoreHTTPSErrors: false,
    });
    const page = await context.newPage();
    const exceptions = [];
    page.on("pageerror", e => exceptions.push("pageerror: " + e.message + "\n" + String(e.stack ?? "").slice(0, 1200)));
    page.on("console", e => { if (e.type() === "error") exceptions.push("console: " + e.text().slice(0, 1400)); });
    page.on("response", r => {
      if (r.status() >= 400 && new URL(r.url()).origin === "https://shtemarm.lovable.app") {
        exceptions.push("HTTP " + r.status() + ": " + r.url());
      }
    });
    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 35000 });
      await page.waitForTimeout(4500);
      const content = await page.locator("body").innerText({ timeout: 15000 });
      const headings = await page.locator("h1").allTextContents();
      const docTitle = await page.title();
      const failed = /Էջը չհաջողվեց բեռնել|This page didn't load|Не удалось загрузить страницу/.test(content);
      const first = content.slice(0, 800);
      console.log(JSON.stringify({status: response?.status(), finalUrl: page.url(), docTitle, headings, failed, bodyStart: first, exceptions}, null, 2));
      if (failed || (response?.status() ?? 599) >= 400 || exceptions.some(e => e.includes("pageerror"))) errors++;
    } catch (e) {
      errors++;
      console.log("Navigation failed:", String(e));
      console.log("Observed errors:", JSON.stringify(exceptions));
    } finally {
      await context.close();
    }
  }
} finally { await browser.close(); }
if (errors) {
  console.error("Production smoke failed on", errors, "URL(s).");
  process.exitCode = 1;
}
