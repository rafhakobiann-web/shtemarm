import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read=(path:string)=>readFileSync(path,"utf8");

describe("Shtemarm admin + dependency security",()=>{
  it("requires verified Supabase bearer sessions for all explanation-admin endpoints",()=>{
    const src=read("src/lib/question-explanations.functions.ts");
    const auth=read("src/lib/admin-session.server.ts");
    const adminMarkers=src.split("await requireVerifiedAdminSession();");
    expect(adminMarkers).toHaveLength(4);
    expect(src).toContain('const { requireVerifiedAdminSession } = await import("./admin-session.server")');
    expect(src).toContain("adminStoredExplanationIds");
    expect(src).toContain("adminGenerateExplanation");
    expect(src).toContain("adminSetExplanationReviewed");
    expect(auth).toContain("supabaseAdmin.auth.getUser(token)");
    expect(auth).toContain('getRequest().headers.get("authorization")');
    expect(auth).toContain("ADMIN_ALLOWED_USER_IDS");
    expect(auth).toContain('throw new Error("unauthorized")');
    expect(adminMarkers.slice(1).every(chunk=>chunk.indexOf("checkAdmin(data.password)")<chunk.indexOf("const { supabaseAdmin }"))).toBe(true);
  });
  it("preserves public access ONLY to reviewed, non-private explanations",()=>{
    const src=read("src/lib/question-explanations.functions.ts");
    expect(src).toContain("getReviewedExplanation");
    expect(src).toContain('.eq("reviewed", true)');
    expect(src).toContain('.select("explanation, correct")');
    expect(src).not.toContain(".select(\"password\")");
  });
  it("protects the pinned patched TanStack transport and known poisoned releases",()=>{
    const source=read("scripts/check-dependency-security.mjs");
    const lock=read("bun.lock");
    expect(source).toContain('1.168.60');
    expect(source).toContain('1.169.39');
    expect(source).toContain('1.167.38');
    expect(source).toContain('github:tanstack/router#79ac49eedf774dd4b0cfa308722bc463cfe5885c');
    expect(source).toContain('Known malicious TanStack setup dependency');
    expect(lock).toContain('"@tanstack/react-start@1.168.60"');
    expect(lock).toContain('"@tanstack/start-server-core@1.169.39"');
    expect(lock).not.toContain('github:tanstack/router#79ac49eedf774dd4b0cfa308722bc463cfe5885c');
  });
});
