import { describe, expect, it } from "vitest";
import type { Unit } from "@/lib/books";
import { GUEST_PREVIEW_LIMIT, guestPreviewUnits } from "@/lib/guest-preview";
const source = (id: number): Unit => ({
  id: `1-3-${id}`, label: String(id), kind: "mc", passage: `Original text ${id}`,
  questions: [
    { n: "1", stem: "A", options: { a: "A", b: "B" }, answer: "a" },
    { n: "2", stem: "B", options: { a: "A", b: "B" }, answer: "b" },
  ],
});
describe("guest task visibility", () => {
  const units = [source(1), source(2), source(3), source(4)];
  it("renders only two whole tasks and keeps complete reading texts", () => {
    expect(GUEST_PREVIEW_LIMIT).toBe(2);
    const preview = guestPreviewUnits(units, false);
    expect(preview.map(u => u.id)).toEqual(["1-3-1", "1-3-2"]);
    expect(preview[0]).toBe(units[0]);
    expect((preview[0] as Extract<Unit, {kind:"mc"}>).questions).toHaveLength(2);
  });
  it("unlocks every original task only for confirmed signed-in students", () => {
    expect(guestPreviewUnits(units, true)).toBe(units);
    expect(guestPreviewUnits(units, false)).toHaveLength(2);
    expect(guestPreviewUnits([], false)).toEqual([]);
  });
  it("never changes source records or progress IDs", () => {
    const original = units.map(u => u.id);
    guestPreviewUnits(units, false);
    expect(units.map(u => u.id)).toEqual(original);
    expect(units).toHaveLength(4);
  });
});
