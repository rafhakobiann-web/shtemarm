# Shtemarm AI provider setup

Shtemarm supports optional server-side AI providers. No API keys are committed to this repository.

## Providers

Set one or more server-side environment variables:

- `GROQ_API_KEY` — Groq API key.
- `GEMINI_API_KEY` — Google Gemini API key.
- `OPENROUTER_API_KEY` — OpenRouter API key; the chat adapter uses the provider's `openrouter/free` model route.

The chat tries configured providers in order: Groq, Gemini, then OpenRouter. If none is configured or all fail, it returns a limited local study fallback. This keeps the chat endpoint responsive, but the fallback is not a generative model and cannot answer arbitrary questions.

Provider model names, free availability, and rate limits can change. Check the provider dashboard and terms before relying on a free tier. Do not use API keys copied from other GitHub repositories; they may be stolen, exposed, revoked, or billed to someone else.

## Where to add keys

Add keys as **server-side environment variables in the deployment platform**, not in browser code and not in GitHub source files.

1. Open the hosting/deployment project that builds the live Shtemarm site.
2. Find **Settings** or **Project Settings**, then **Environment Variables** / **Secrets**.
3. Add the variable name exactly as shown above and paste your own key as its value.
4. Enable it for the production environment (and preview/development if needed).
5. Save the settings and redeploy/restart the deployment so the server receives the new variable.
6. Test the chat. If one provider is out of quota, the code attempts the next configured provider.

If the site is deployed through Lovable, check the linked deployment's secrets/environment-variable settings; the exact location depends on where the app is hosted. If it is deployed on Vercel, use Project Settings → Environment Variables. Never prefix server-only keys with `VITE_` or expose them in client-side code.

## Local development

Create a local `.env.local` file (which must stay untracked) in the project root, for example:

```dotenv
GROQ_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
```

Paste keys only into your own local file. Do not commit that file. If a real key is ever committed or shared publicly, revoke it and create a new one.

## Limits and privacy

Multiple providers can improve availability but do not guarantee unlimited usage. Each provider can enforce quotas, rate limits, model availability, and usage policies. Avoid sending private student information to third-party model providers.


## Prepare AI safely for all students (November 2026)

Shtemarm uses one set of **server-side** provider credentials for the whole website. Students do **not** enter their own API keys. API keys must NEVER be stored in `VITE_*`, Android code, GitHub, a chat message, or browser storage.

### Deployment prerequisites — required order

1. Use a provider account that is permitted under the provider's age/terms and has a hard spending budget configured where supported; a parent/guardian should handle any age-restricted billing/account setup.
2. Apply `supabase/migrations/20261104000000_ai_request_quotas.sql` to the **same Supabase project used by the deployed site**. This migration creates the service-role-only `reserve_ai_request` function and `ai_request_counters` table.
3. Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set on the server. Without them, this rate limiter **fails closed** and live AI requests will be denied. Do not expose the service role key in public variables.
4. Add one or more server-only `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` keys in **the actual hosting provider's** server secret store. For the application’s explanations and math, Gemini and/or Groq are required. OpenRouter currently serves chat only.
5. Configure optional quotas below, deploy to **Preview first**, verify three accounts (signed-in, guest, and admin) and check the provider's usage dashboard. Publish only after tests.

### Defaults and environment variables (all server-side)

| Variable | Default | Meaning |
| --- | ---: | --- |
| `AI_USER_DAILY_LIMIT` | 15 | Remote requests per verified signed-in account per UTC day |
| `AI_GUEST_SHARED_DAILY_LIMIT` | 20 | One **shared** quota across all anonymous visitors per UTC day (NOT 20 per guest) |
| `AI_ADMIN_DAILY_LIMIT` | 80 | Daily admin bulk generation budget |
| `AI_GLOBAL_DAILY_LIMIT` | 200 | Total daily model requests across students, guests and admin |
| `AI_GLOBAL_MINUTE_LIMIT` | 15 | Total model requests per UTC minute |
| `AI_QUOTA_SALT` | default pepper | Optional secret salt for one-way pseudonymous account keys |

Rate limits count **attempts**, including remote provider failures. Gemini → Groq fallback under a single request consumes one reservation. Cached responses and local dictionary lookups don't consume new model reservations. Quotas reset at UTC day/minute boundaries, and the reservation is atomic across concurrent Nitro server instances.

The service-role RPC cannot be invoked by anonymous or authenticated browser clients directly, and the server verifies the Supabase bearer token before classifying a request as a signed-in student. Invalid/missing tokens use the more restrictive shared guest bucket. The database stores only time windows, counters, and hashed account buckets (not prompts, IP addresses, or account emails).

**Fail-closed:** If the migration is missing, the database is down, or the service role isn't configured, the app does not send billable model requests. Chat and explanation views can still use their limited offline fallbacks; this does NOT mean generative AI is active.

### Preview QA

- Verify a real generated chat answer (not the offline fallback badge), an English explanation, a mathematics explanation, a translated word and a passage translation.
- Check both a logged-in student's request quota and the smaller shared guest budget. Do not rely on browser-side limits for enforcement.
- Remove `GEMINI_API_KEY` and `GROQ_API_KEY` from a test deployment to confirm the fallback badge and absence of remote calls; restore the keys using secret settings.
- Test that cached subject explanations load with zero model requests and that quota exhaustion produces a clear, non-generative fallback/error.
- Monitor per-provider billing. The app-wide limits reduce risk, but **do not guarantee zero cost**, especially if the provider has other API uses.
- Never report the feature as deployed until the migration, secret configuration, successful tests and publish are confirmed.

### Guest-specific note

The current guest limit is a **single shared daily pool**, not a robust per-guest identity. It avoids trusting spoofable IP/X-Forwarded-For headers. If public AI needs an individual per-guest allocation at scale, implement verified anonymous identities and anti-automation measures before increasing this limit.
