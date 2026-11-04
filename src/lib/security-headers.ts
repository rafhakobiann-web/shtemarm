/** Baseline protections without blocking Start's streamed scripts or OAuth redirects. */
export function withSecurityHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Keep Lovable's editor preview embeddable. Do not allow arbitrary framing.
  // Preserve a stronger policy installed by the framework/hosting layer.
  if (!headers.has("Content-Security-Policy")) {
    headers.set("Content-Security-Policy", [
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      "frame-ancestors 'self' https://lovable.dev https://*.lovable.dev https://*.lovable.app",
    ].join("; "));
  }
  if (new URL(request.url).protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000");
  }
  const path = new URL(request.url).pathname;
  if (request.headers.has("authorization") || response.headers.has("set-cookie") ||
      /^\/(?:auth|admin(?:[/.]|$)|api(?:\/|$))/.test(path) || response.status >= 400) {
    // Shared caches must never retain account responses, tokens or error pages.
    headers.set("Cache-Control", "private, no-store");
    headers.delete("CDN-Cache-Control");
    headers.delete("Cloudflare-CDN-Cache-Control");
    headers.delete("Surrogate-Control");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
