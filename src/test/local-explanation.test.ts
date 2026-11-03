import { describe, expect, it } from "vitest";
import { localAvailability, localExplain } from "../lib/local-explanation.client";

describe("optional on-device AI", () => {
  it("reports unsupported on the server without accessing browser globals", async () => {
    if (typeof window === "undefined") {
      expect(await localAvailability()).toBe("unsupported");
    }
  });
  it("does not silently replace the fallback when no native model exists", async () => {
    if (typeof window === "undefined") {
      await expect(localExplain({ question: "2 + 2?", correct: "4", chosen: null, locale: "en" })).rejects.toThrow("Unsupported browser");
    }
  });
});
