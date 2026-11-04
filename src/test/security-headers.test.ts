import { describe, expect, it } from "vitest";
import { withSecurityHeaders } from "@/lib/security-headers";

describe("HTTP response security", () => {
  it("protects streamed HTML while preserving its body, cookies and status", async () => {
    const original = new Response("<p>Study</p>", { status: 201, headers: {
      "content-type": "text/html", "set-cookie": "session=test; HttpOnly; Secure", "x-request-id": "123",
      "cache-control": "public, max-age=3600", "cdn-cache-control": "public",
    } });
    const result = withSecurityHeaders(new Request("https://shtemarm.example/dashboard"), original);
    expect(result.status).toBe(201);
    expect(await result.text()).toBe("<p>Study</p>");
    expect(result.headers.get("set-cookie")).toContain("HttpOnly");
    expect(result.headers.get("x-request-id")).toBe("123");
    expect(result.headers.get("x-content-type-options")).toBe("nosniff");
    expect(result.headers.get("content-security-policy")).toContain("object-src 'none'");
    expect(result.headers.get("content-security-policy")).toContain("frame-ancestors 'self'");
    expect(result.headers.get("strict-transport-security")).toBe("max-age=31536000");
    expect(result.headers.get("cache-control")).toBe("private, no-store");
    expect(result.headers.has("cdn-cache-control")).toBe(false);
  });

  it.each(["/auth", "/admin/explanations", "/admin.feedback", "/api/public-auth-config"])("prevents shared caching of %s", path => {
    const result = withSecurityHeaders(new Request("https://shtemarm.example" + path), new Response("ok"));
    expect(result.headers.get("cache-control")).toBe("private, no-store");
  });

  it("protects bearer responses and failures without changing public asset caching", () => {
    const authenticated = new Request("https://shtemarm.example/_serverFn/id", {headers:{authorization:"Bearer test"}});
    expect(withSecurityHeaders(authenticated, new Response("ok")).headers.get("cache-control")).toContain("no-store");
    const publicRequest = new Request("http://localhost/data/book1.json");
    const result = withSecurityHeaders(publicRequest, new Response("{}", {headers:{"cache-control":"public, max-age=60"}}));
    expect(result.headers.get("cache-control")).toBe("public, max-age=60");
    expect(result.headers.has("strict-transport-security")).toBe(false);
    expect(withSecurityHeaders(publicRequest, new Response("error", {status:500})).headers.get("cache-control")).toContain("no-store");
  });

  it("preserves an existing stricter CSP and bodyless redirects", () => {
    const result = withSecurityHeaders(new Request("https://shtemarm.example/auth"), new Response(null, {
      status:302, headers:{location:"https://accounts.google.com/", "content-security-policy":"default-src 'none'"},
    }));
    expect(result.status).toBe(302);
    expect(result.headers.get("location")).toBe("https://accounts.google.com/");
    expect(result.headers.get("content-security-policy")).toBe("default-src 'none'");
    expect(result.body).toBeNull();
  });
});
