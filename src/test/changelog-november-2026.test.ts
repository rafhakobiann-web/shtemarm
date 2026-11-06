import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const timeline = readFileSync("src/routes/changelog.tsx", "utf8");
const notes = readFileSync("CHANGELOG.md", "utf8");
const dates = [6, 5, 4, 3, 2].map(day => `November ${day}, 2026`);

describe("November 2–6, 2026 changelogs", () => {
  it("shows all five dates newest first on the website", () => {
    const found = Array.from(timeline.matchAll(/date: "(November [2-6], 2026)"/g), m => m[1]);
    expect(found).toEqual(dates);
    expect(timeline).toContain("November 1, 2026");
  });

  it("records each date once in the markdown changelog", () => {
    for (const date of dates) {
      expect(notes.split("\n").filter(line => line.startsWith("## ") && line.includes(date))).toHaveLength(1);
    }
    const positions = dates.map(date => notes.indexOf(date));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("does not claim pending Armenian diagrams or APK deployment are live", () => {
    expect(timeline).toContain("Draft only: nine Armenian Volume I syntax diagrams");
    expect(timeline).toContain("APK release not confirmed");
    expect(notes).toContain("Draft, not released");
    expect(notes).toContain("A merged PR does not prove");
  });

  it("offers English, Armenian and Russian for new entries", () => {
    const recent = timeline.split('date: "November 1, 2026"')[0];
    const items = Array.from(recent.matchAll(/\{ emoji: ".*?", en: ".*?", hy: ".*?", ru: ".*?" \}/g));
    expect(items.length).toBeGreaterThanOrEqual(20);
    expect(recent).toContain("titleRu:");
    expect(timeline).toContain('const ru = lang === "ru"');
  });
});
