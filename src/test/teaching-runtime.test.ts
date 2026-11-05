import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mock=vi.hoisted(()=>({get:vi.fn(),save:vi.fn(),generate:vi.fn(),reserve:vi.fn()}));
vi.mock("@tanstack/react-start",()=>({createServerFn:()=>({inputValidator:(validate:(d:unknown)=>unknown)=>({handler:(handler:({data}:{data:unknown})=>unknown)=>({data}:{data:unknown})=>handler({data:validate(data)})})})}));
vi.mock("@/lib/explanation-cache.server",()=>({getSavedExplanation:mock.get,saveExplanation:mock.save}));
vi.mock("@/lib/explanation-providers.server",()=>({generateExplanation:mock.generate}));
vi.mock("@/lib/ai-quota.server",()=>({reserveAiRequest:mock.reserve}));
import { explainAnswer } from "@/lib/explain.functions";
import { explainMathAnswer } from "@/lib/math-explain.functions";
const subject={instruction:"Grammar rule",passage:"",question:"Choose the correct form.",correct:"reads",chosen:"private-choice",locale:"en" as const};
const math={item:"matem-1:1:1:1:1",kind:"open" as const,task:"Solve",correct:"3",chosen:null,pages:[],question:"3x+5=14",options:[],locale:"ru" as const};
beforeEach(()=>{vi.stubEnv("GEMINI_API_KEY","test-only");vi.stubEnv("GROQ_API_KEY","");mock.get.mockReset().mockResolvedValue(null);mock.save.mockReset().mockResolvedValue(undefined);mock.generate.mockReset().mockResolvedValue({ok:true,text:"Worked explanation",provider:"Gemini"});mock.reserve.mockReset().mockResolvedValue({allowed:true,subject:"user"});});
afterEach(()=>vi.unstubAllEnvs());
describe("Teaching requests and caches",()=>{
  it("rejects a missing math condition in the selected language without a model call",async()=>{
    const result=await explainMathAnswer({data:{...math,question:""}});
    expect(result.error).toBe(true);expect(result.text).toContain("Условие");
    expect(mock.generate).not.toHaveBeenCalled();expect(mock.reserve).not.toHaveBeenCalled();
  });
  it("requests the selected language and preserves cache-first access",async()=>{
    await explainAnswer({data:subject});
    expect(mock.generate.mock.calls[0][0]).toContain("in English");
    expect(mock.generate.mock.calls[0][0]).not.toContain("private-choice");
    expect(mock.save).toHaveBeenCalledOnce();
    mock.get.mockResolvedValue("Saved worked explanation");mock.generate.mockClear();mock.reserve.mockClear();
    const result=await explainAnswer({data:subject});
    expect(result.cached).toBe(true);expect(mock.generate).not.toHaveBeenCalled();expect(mock.reserve).not.toHaveBeenCalled();
  });
  it("does not generate or cache a synthetic answer when quota verification fails",async()=>{
    mock.reserve.mockResolvedValue({allowed:false,reason:"signin"});
    const result=await explainMathAnswer({data:math});
    expect(result.offline).toBe(true);expect(mock.generate).not.toHaveBeenCalled();expect(mock.save).not.toHaveBeenCalled();
  });
  it("does not cache provider failures and gives a localized math prompt on success",async()=>{
    mock.generate.mockResolvedValueOnce({ok:false,reason:"unavailable"});
    const result=await explainMathAnswer({data:math});
    expect(result.offline).toBe(true);expect(mock.save).not.toHaveBeenCalled();
    await explainMathAnswer({data:math});
    expect(mock.generate.mock.calls[1][0]).toContain("in Russian");
    expect(mock.save).toHaveBeenCalledOnce();
  });
});
