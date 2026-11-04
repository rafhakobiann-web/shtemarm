import { createFileRoute } from "@tanstack/react-router";
import { isPublicAuthConfig } from "@/lib/public-auth-config";

/**
 * Safe public bootstrap endpoint for deployments where Lovable Cloud supplies
 * Supabase connection details only at server runtime, not through VITE_*.
 *
 * This returns ONLY a publishable or verified anon key. Service-role keys,
 * private tokens and arbitrary credentials are never returned.
 */
export const Route = createFileRoute("/api/public-auth-config")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const env = process.env;
        const config = {
          url: env["VITE_SUPABASE_URL"] || env["SUPABASE_URL"] || "",
          key: env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
            env["SUPABASE_PUBLISHABLE_KEY"] ||
            env["VITE_SUPABASE_ANON_KEY"] ||
            env["SUPABASE_ANON_KEY"] || "",
        };
        const headers = {
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        };
        if (!isPublicAuthConfig(config)) {
          return Response.json({ configured: false }, { headers });
        }
        return Response.json({ configured: true, url: config.url, key: config.key }, { headers });
      },
    },
  },
});
