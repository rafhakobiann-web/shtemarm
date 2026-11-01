import { describe, expect, it } from "vitest";
import { shouldRetryBookLoad } from "@/lib/useBook";

describe("book request retry policy", () => {
  it("fails promptly when a source asset does not exist", () => {
    expect(shouldRetryBookLoad(0, new Error("Book 21 HTTP 404"))).toBe(false);
    expect(shouldRetryBookLoad(0, new Error("Book 21 HTTP 403"))).toBe(false);
    expect(shouldRetryBookLoad(0, new Error("Book 21 returned text/html, not JSON"))).toBe(false);
    expect(shouldRetryBookLoad(0, new Error("Book 21 has an invalid question-bank format"))).toBe(false);
  });

  it("retries transient failures up to two times, then stops", () => {
    const offline = new TypeError("Failed to fetch");
    expect(shouldRetryBookLoad(0, offline)).toBe(true);
    expect(shouldRetryBookLoad(1, offline)).toBe(true);
    expect(shouldRetryBookLoad(2, offline)).toBe(false);
    expect(shouldRetryBookLoad(1, new Error("Book 21 HTTP 503"))).toBe(true);
  });
});
