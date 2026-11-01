import { afterEach, describe, expect, it, vi } from "vitest";
import { invalidateBookCache, loadBook } from "@/lib/books";

afterEach(() => vi.unstubAllGlobals());

describe("book JSON loading recovers from malformed sections", () => {
  it("rejects a successful HTTP response with unusable section units, then retries", async () => {
    const bookId = 99123; // Unique test-only ID, not a published source book.
    const response = (sections: unknown[]) =>
      new Response(JSON.stringify({ id: bookId, sections }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([{ n: 1, units: null }]))
      .mockResolvedValueOnce(response([{ n: 1, units: [] }]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadBook(bookId)).rejects.toThrow("invalid question-bank format");
    await expect(loadBook(bookId)).resolves.toMatchObject({
      id: bookId,
      sections: [{ n: 1, units: [] }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("can refresh previously cached empty content after the source is corrected", async () => {
    const bookId = 99124;
    const response = (sections: unknown[]) =>
      new Response(JSON.stringify({ id: bookId, sections }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response([{ n: 1, units: [] }]));
    vi.stubGlobal("fetch", fetchMock);

    expect((await loadBook(bookId)).sections).toHaveLength(0);
    // Refetching without invalidation would reuse the first fulfilled promise.
    invalidateBookCache(bookId);
    expect((await loadBook(bookId)).sections).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
