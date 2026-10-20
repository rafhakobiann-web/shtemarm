import { describe, expect, it } from "vitest";
import { explanationKey, explanationError, readGeminiStream } from "@/lib/explanation";

const input = { instruction: "Choose", passage: "Text", question: "Question", correct: "a", chosen: "b" };
describe("explanation caching and provider failures", () => {
  it("reuses identical inputs but separates official answers and chosen answers", async () => {
    const key = await explanationKey(input);
    expect(await explanationKey({ ...input })).toBe(key);
    expect(await explanationKey({ ...input, correct: "c" })).not.toBe(key);
    expect(await explanationKey({ ...input, chosen: "c" })).not.toBe(key);
  });
  it("reads fragmented SSE, excludes thoughts and consumes final unterminated event", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({ start(c) {
      c.enqueue(encoder.encode('data: {"candidates":[{"content":{"parts":[{"text":"hidden","thought":true},{"text":"Ճիշտ "}]}}]}\n\n'));
      c.enqueue(encoder.encode('da'));
      c.enqueue(encoder.encode('ta: {"candidates":[{"content":{"parts":[{"text":"է"}]}}]}'));
      c.close();
    } });
    expect(await readGeminiStream(body)).toEqual({ text: "Ճիշտ է", blocked: false });
  });
  it("marks refusals terminal instead of caching partial explanations", async () => {
    const body = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new TextEncoder().encode('data: {"promptFeedback":{"blockReason":"SAFETY"}}\n')); c.close(); } });
    expect((await readGeminiStream(body)).blocked).toBe(true);
  });
  it("distinguishes quota, credentials and transient failures", () => {
    expect(explanationError(429)).not.toBe(explanationError(403));
    expect(explanationError(403)).not.toBe(explanationError(500));
  });
});