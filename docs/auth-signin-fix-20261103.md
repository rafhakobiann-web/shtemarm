# Shtemarm sign-in repair: Google OAuth, runtime configuration and session validation (Draft)

## Screenshot diagnosis — Lovable hosting

The screenshot of `shtemarm.lovable.app` shows the site's fallback **“Մուտքը ժամանակավորապես անհասանելի է”**, which is rendered when `hasSupabaseConfig()` returns false, **before** password or Google sign-in is attempted.

Read-only investigation of the user's Lovable project confirmed that its Supabase-backed cloud database is **enabled**, but the project source exposes an `.env.example` and no `.env` file. This can mean the browser build lacks `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, even if the server runtime supplies public Supabase credentials.

The patch now attempts `GET /api/public-auth-config` from the **same origin** when build-time public config is missing. Its TanStack Start server route only returns a validated HTTPS Supabase URL and a **publishable / role=anon** key (both are public connection parameters). Service-role keys, `sb_secret_*`, and invalid keys are not returned. The browser checks these values before initializing the shared Supabase client and presents sign-in only after configuration succeeds. If runtime public settings are also unavailable, the guest-learning fallback remains with a retry button.

**The new endpoint requires a working TanStack Start server runtime.** If Lovable's publish target does not serve server routes, or if the backend does not expose public Supabase URL and publishable/anon key under supported server variables, the owner must configure the two public `VITE_*` variables for the build. This patch cannot manufacture a missing backend credential or Google provider.


This patch fixes two incorrect assumptions in the account page:

1. **Vercel and custom domains are not Lovable OAuth broker hosts.** These use Supabase's ordinary Google OAuth with a same-origin `/auth` callback. Genuine Lovable-hosted pages continue to use the existing Lovable broker.
2. **Successful promise resolution does not guarantee the user signed in.** Password sign-in and the Lovable broker now require an actual session before navigating to the home page. Missing sessions show a useful error instead of silently treating sign-in as successful.

The patch keeps registration, password recovery, sign-out, offline/guest learning, and Preview/Production isolation. No secrets or provider tokens have been added to the repository. The generated Lovable and Supabase integration modules have not been modified.

## Required deployment configuration (owner-only)

This code fix cannot create/enable a backend account or Google OAuth provider. To make live sign-in work, check the settings for **each deployed host**:

- Set `VITE_SUPABASE_URL` to that environment's correct Supabase HTTPS URL.
- Set `VITE_SUPABASE_PUBLISHABLE_KEY` to its **public publishable/anon key** in the deployment environment; do not use a service role key or secret key in a VITE_ variable.
- For native Supabase Google OAuth on Vercel/custom domains, enable and configure the **Google** provider in Supabase Auth, including the provider's Google Cloud OAuth client and the Supabase callback URL provided in Supabase's dashboard.
- Add the application's exact return URLs (e.g. `https://shtemarm.vercel.app/auth`, and approved custom-domain `/auth` URLs) to Supabase Auth's redirect allowlist. The login page never accepts arbitrary external return URLs.
- The Lovable OAuth broker must remain configured separately on Lovable-hosted surfaces; keep its editor Preview workflow intact.
- Ensure the public URL and publishable key in **Production** point to the intended Production backend, and Preview points to its intended separate backend. Avoid changing Production by copying Preview secrets.

After deployments are configured, test in a regular browser with a test account:
1. Email/password sign-in shows an account and survives page refresh.
2. Sign-out removes the session.
3. Google sign-in returns to `/auth`, with an active Supabase session; test both Vercel/custom and Lovable hosts (the flows differ).
4. Registration confirmation, forgot-password recovery and signed-out guest studying.
5. Test any Android WebView in the device itself; some Google flows require a trusted external browser.

**Not verified by this PR:** Actual live Google credentials, redirect allowlists or real user sessions. The GitHub tests validate routing/session guards, not access to the owner's external OAuth settings.

## Tests

```sh
bunx vitest run src/test/google-oauth-routing.test.ts src/test/auth-and-covers.test.ts
bun run build
```

Keep the PR as a Draft until live browser sign-in and a test account are verified. No merge/deploy from this patch.
