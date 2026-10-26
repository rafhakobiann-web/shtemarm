import { afterEach, describe, expect, it, vi } from "vitest";
import { errorToUser, generateExplanation } from "@/lib/explanation-providers.server";

afterEach(() => vi.unstubAllGlobals());
const mockResponse = (status: number, json: unknown) =>
  new Response(JSON.stringify(json), { status, headers: { "Content-Type": "application/json" } });

describe("Explanation runtime and current AI model fallback", () => {
  it("reports missing keys without making a network request", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(await generateExplanation("question", {})).toEqual({ ok:false, reason:"no_key" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("uses the currently supported Groq model instead of the retired Llama 3.3 one", async () => {
    const fetcher = vi.fn(async (_url, init) => {
      expect(JSON.parse(init.body).model).toBe("openai/gpt-oss-120b");
      return mockResponse(200, { choices: [{ message: { content:"Քայլ 1․ Բացատրություն։" } }] });
    });
    vi.stubGlobal("fetch", fetcher);
    expect(await generateExplanation("explain", {groq:"test"})).toEqual({
      ok:true, text:"Քայլ 1․ Բացատրություն։",provider:"Groq",
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("tries Groq immediately after the fast Gemini model fails", async () => {
    const fetcher = vi.fn(async (url) => url.includes("generativelanguage.googleapis.com")
      ? mockResponse(404, { error:{ message:"model not accessible" }})
      : mockResponse(200, { choices:[{message:{content:"Քայլերով լուծում"}}] }));
    vi.stubGlobal("fetch",fetcher);
    const result = await generateExplanation("explain", { gemini:"test",groq:"test" });
    expect(result.ok).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("sends only Gemini the math-book images, never a text-only Groq model", async () => {
    const fetcher = vi.fn(async (url,init) => {
      expect(url).toContain("generativelanguage.googleapis.com");
      const body=JSON.parse(init.body);
      expect(body.contents[0].parts[1].inline_data.data).toBe("dGVzdA==");
      return mockResponse(200,{candidates:[{content:{parts:[{text:"Գծագրի բացատրություն"}]}}]});
    });
    vi.stubGlobal("fetch",fetcher);
    const result = await generateExplanation("help",{groq:"test",gemini:"test"},["data:image/jpeg;base64,dGVzdA=="]);
    expect(result.ok).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(await generateExplanation("help",{groq:"test"},["data:image/jpeg;base64,dGVzdA=="]))
      .toEqual({ ok:false,reason:"requires_vision" });
  });
  it("communicates invalid keys and rate limiting rather than silently claiming a solution", async () => {
    vi.stubGlobal("fetch",vi.fn(async () => mockResponse(401,{error:{message:"no"}})));
    const r=await generateExplanation("q",{groq:"bad"});
    expect(r).toEqual({ok:false, reason:"invalid_key"});
    expect(errorToUser("invalid_key")).toContain("բանալին");
    vi.stubGlobal("fetch",vi.fn(async () => mockResponse(429,{error:{message:"rate limit"}})));
    expect(await generateExplanation("q",{groq:"test"})).toEqual({ok:false,reason:"rate_limit"});
  });
});
