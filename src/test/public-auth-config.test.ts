import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isPublicAuthConfig, isPublicSupabaseKey } from "@/lib/public-auth-config";

const source = (path: string) => readFileSync(path, "utf8");
const publishable = "sb_publishable_12345678901234567890";
const jwt = (role: string) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({ role, iss: "https://example.supabase.co" })).toString("base64url");
  return header + "." + claims + ".fakesignature";
};

describe("Shtemarm runtime browser authentication settings", () => {
  it("only accepts public publishable or legacy anon credentials", () => {
    expect(isPublicSupabaseKey(publishable)).toBe(true);
    expect(isPublicSupabaseKey(jwt("anon"))).toBe(true);
    expect(isPublicSupabaseKey(jwt("service_role"))).toBe(false);
    expect(isPublicSupabaseKey("sb_secret_" + "test-only-invalid-key")).toBe(false);
    expect(isPublicSupabaseKey("your-supabase-publishable-key")).toBe(false);
    expect(isPublicSupabaseKey("")).toBe(false);
  });

  it("checks the public Supabase URL, credentials and key together", () => {
    expect(isPublicAuthConfig({ url: "https://example.supabase.co", key: publishable })).toBe(true);
    expect(isPublicAuthConfig({ url: "https://example.supabase.co/", key: jwt("anon") })).toBe(true);
    expect(isPublicAuthConfig({ url: "https://example.supabase.co", key: jwt("service_role") })).toBe(false);
    expect(isPublicAuthConfig({ url: "http://example.supabase.co", key: publishable })).toBe(false);
    expect(isPublicAuthConfig({ url: "https://person:pwd@example.supabase.co", key: publishable })).toBe(false);
    expect(isPublicAuthConfig({ url: "https://example.supabase.co/not-root", key: publishable })).toBe(false);
  });

  it("only publishes safe connection values when present at server runtime", () => {
    const route = source("src/routes/api/public-auth-config.ts");
    expect(route).toContain('createFileRoute("/api/public-auth-config")');
    expect(route).toContain('server: {');
    expect(route).toContain('GET: async ()');
    expect(route).toContain('isPublicAuthConfig(config)');
    expect(route).toContain('configured: false');
    expect(route).toContain('configured: true');
    expect(route).toContain('"Cache-Control": "no-store');
    expect(route).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|sb_secret_/);
  });

  it("tries same-origin runtime settings before hiding the sign-in form", () => {
    const client = source("src/integrations/supabase/client.ts");
    const auth = source("src/routes/auth.tsx");
    expect(client).toContain('ensureBrowserSupabaseConfig(): Promise<boolean>');
    expect(client).toContain('configureBrowserSupabase(config: unknown)');
    expect(client).toContain('fetch("/api/public-auth-config"');
    expect(client).toContain('credentials: "same-origin"');
    expect(client).toContain('cache: "no-store"');
    expect(auth).toContain("ensureBrowserSupabaseConfig().then(ok =>");
    expect(auth).toContain('setConfigured(ok)');
    expect(auth).toContain("setConfigurationAttempt(n => n + 1)");
    expect(auth).toContain('if (!configured) return (');
    expect(auth).toContain('supabase.auth.signInWithPassword');
  });
});

