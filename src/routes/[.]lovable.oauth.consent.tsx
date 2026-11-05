import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // SSR has no localStorage session and would redirect signed-in users.
  ssr: false,
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Միացնել հավելվածը · Shtemarm" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    // An immediate-redirect result carries redirect_url and no client details.
    if (data && "redirect_url" in data) throw redirect({ href: data.redirect_url });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md space-y-3 rounded-2xl border bg-card p-6">
      <h1 className="text-xl font-black">Միացումը չի բացվում</h1>
      <p role="alert" className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "այս հավելվածը";
  const scopes = (details?.scope ?? "").split(" ").filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorization_id)
      : await supabase.auth.oauth.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data && "redirect_url" in data ? data.redirect_url : undefined;
    if (!target) {
      setBusy(false);
      setError("Լիազորման սերվերը չվերադարձրեց վերահասցե։");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="mx-auto max-w-md space-y-5 rounded-2xl border bg-card p-6 shadow-card">
      <div className="space-y-2">
        <h1 className="text-2xl font-black">Միացնել {clientName}-ը Shtemarm-ին</h1>
        <p className="text-sm text-muted-foreground">
          Սա թույլ է տալիս {clientName}-ին օգտագործել այս հավելվածը որպես դու։
        </p>
      </div>

      {scopes.length > 0 && (
        <ul className="space-y-1 text-sm">
          {scopes.map((scope) => (
            <li key={scope} className="rounded-lg border bg-muted/30 px-3 py-2">
              {scope === "openid"
                ? "Հաստատել քո ինքնությունը"
                : scope === "email"
                  ? "Կիսվել քո էլ. փոստով"
                  : scope === "profile"
                    ? "Կիսվել քո հիմնական պրոֆիլով"
                    : `Լրացուցիչ թույլտվություն՝ ${scope}`}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Սա չի շրջանցում հավելվածի թույլտվությունները կամ տվյալների պաշտպանությունը։
      </p>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="game" className="min-h-12 flex-1" disabled={busy} onClick={() => void decide(true)}>
          {busy ? "Կատարվում է…" : "Հաստատել"}
        </Button>
        <Button type="button" variant="outline" className="min-h-12 flex-1" disabled={busy} onClick={() => void decide(false)}>
          Չեղարկել միացումը
        </Button>
      </div>
    </main>
  );
}
