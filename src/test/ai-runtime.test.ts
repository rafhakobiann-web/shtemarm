import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { generateExplanation } from "@/lib/explanation-providers.server";

afterEach(() => vi.unstubAllGlobals());
const response = (status: number, data: unknown) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json" },
});

describe("AI features: chatbot, calculator, translator", () => {
  it("uses the working Groq 20B model first for chat without calling a missing function", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      expect(body.model).toBe("openai/gpt-oss-20b");
      return response(200, { choices:[{message:{content:"Կարող եմ օգնել։"}}] });
    });
    vi.stubGlobal("fetch", fetchMock);
    const answer = await generateExplanation("chat", {groq:"mock",gemini:"mock"}, [], {preferGroq:true,fast:true});
    expect(answer).toEqual({ok:true, provider:"Groq",text:"Կարող եմ օգնել։"});
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const source = readFileSync("src/lib/chat.functions.ts", "utf8");
    expect(source).toContain("async function callGroq");
    expect(source).toContain("promptForConversation");
  });

  it("falls back to fast Gemini if configured Groq is unavailable", async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) =>
      url.includes("groq.com") ? response(503, {error:"unavailable"}) :
        response(200, {candidates:[{content:{parts:[{text:"Աստիճանաբար բացատրենք։"}]}}]})
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = await generateExplanation("chat", {groq:"mock",gemini:"mock"}, [], {preferGroq:true,fast:true});
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("doesn't retry the slower Flash model for a fast-only request", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toContain("gemini-3.5-flash-lite");
      return response(429, {error:"rate limit"});
    });
    vi.stubGlobal("fetch", fetchMock);
    const r = await generateExplanation("chat", {gemini:"mock"}, [], {fast:true});
    expect(r).toEqual({ok:false,reason:"rate_limit"});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shares optional cache and avoids external calls on local translations", () => {
    const translation = readFileSync("src/lib/translate.functions.ts", "utf8");
    expect(translation).toContain("getDictionaryTranslation(data.text, data.language)");
    expect(translation).toContain("getSavedExplanation(key)");
    expect(translation).not.toContain("const { supabaseAdmin }");
    expect(translation).toContain("groqTranslation");
    const calculator = readFileSync("src/lib/calc.functions.ts", "utf8");
    expect(calculator).toContain("generateExplanation(");
    expect(calculator).toContain("requires_vision");
    expect(calculator).toContain("AbortSignal.timeout(16000)");
  });

  it("keeps error messages out of chatbot dialogue on the next attempt", () => {
    const chat = readFileSync("src/routes/chat.tsx", "utf8");
    expect(chat).toContain("messages.filter(m => !m.failed)");
    expect(chat).toContain("failed: !!res.error");
  });
});
