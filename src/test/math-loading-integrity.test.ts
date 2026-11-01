import { afterEach, describe, expect, it, vi } from "vitest";
import { loadMathBookIndex } from "@/lib/math-bank";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const miniIndex = {
  books: { "matem-1": { title: "Book", sections: [{
    chapter: 1, section: 1, title: "Section", pages: [1, 2],
    tasks: [{ task: 1, sub_count: 1, segments: [{ page: 1, y0: 0, y1: 20 }],
      answers: ["1"], answer_type: "choice" }],
  }] } },
};
const miniText = { "matem-1": { "1-1": { "1": [
  { prompt: "Question one", options: ["A", "B", "C", "D"] },
] } } };

describe("math source-bank downloads", () => {
  it("merges the existing indexed question wording without generating or changing answers", async () => {
    const mockedFetch = vi.fn(async (url: string) =>
      new Response(JSON.stringify(url.includes("index") ? miniIndex : miniText), {
        status: 200, headers: { "content-type": "application/json" },
      }));
    vi.stubGlobal("fetch", mockedFetch);
    const result = await loadMathBookIndex();
    const task = result.books["matem-1"]?.sections[0]?.tasks[0];
    expect(task?.questions?.[0]?.prompt).toBe("Question one");
    expect(task?.answers).toEqual(["1"]);
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });

  it("rejects successful HTML fallbacks instead of accepting a missing book", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("<html>not found</html>", {
        status: 200, headers: { "content-type": "text/html" },
      }),
    ));
    await expect(loadMathBookIndex()).rejects.toThrow("instead of JSON");
  });

  it("aborts a JSON body stalled after HTTP response headers", async () => {
    vi.useFakeTimers();
    const mockedFetch = vi.fn((_url: string, options: RequestInit) => Promise.resolve({
      ok: true, status: 200, headers: new Headers({ "content-type": "application/json" }),
      json: () => new Promise((_resolve, reject) => {
        options.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      }),
    } as unknown as Response));
    vi.stubGlobal("fetch", mockedFetch);
    const pending = loadMathBookIndex();
    const assertion = expect(pending).rejects.toThrow("չափազանց երկար");
    await vi.advanceTimersByTimeAsync(20_001);
    await assertion;
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });
});
