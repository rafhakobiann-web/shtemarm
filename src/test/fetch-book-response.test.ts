import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchBookResponse } from "../lib/fetch-book-response";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("fetchBookResponse", () => {
  it("returns successful responses through the consumer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    await expect(fetchBookResponse("/data/book1.json", async (response) => response.json()))
      .resolves.toEqual({});
  });

  it("passes through ordinary network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(fetchBookResponse("/data/book1.json", async (response) => response.json()))
      .rejects.toThrow("offline");
  });

  it("aborts stalled requests before response headers arrive", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, options: RequestInit) => new Promise<Response>((_resolve, reject) => {
      options.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    vi.stubGlobal("fetch", fetchMock);
    const pending = fetchBookResponse("/data/book1.json", async (response) => response.json(), 100);
    const assertion = expect(pending).rejects.toThrow("չափազանց երկար");
    await vi.advanceTimersByTimeAsync(101);
    await assertion;
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("also times out if the JSON body stalls after headers arrive", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, options: RequestInit) =>
      Promise.resolve({
        json: () => new Promise<unknown>((_resolve, reject) => {
          options.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        }),
      } as unknown as Response),
    );
    vi.stubGlobal("fetch", fetchMock);
    const pending = fetchBookResponse("/data/book1.json", async (response) => response.json(), 100);
    const assertion = expect(pending).rejects.toThrow("չափազանց երկար");
    await vi.advanceTimersByTimeAsync(101);
    await assertion;
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
