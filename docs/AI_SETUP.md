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
| `AI_USER_DAILY_LIMIT` | 60 | Remote requests per verified signed-in account per UTC day |
| `AI_GUEST_SHARED_DAILY_LIMIT` | 30 | Reserved for future verified guest trials; anonymous metered AI calls are currently **disabled** |
| `AI_ADMIN_DAILY_LIMIT` | 80 | Daily admin bulk generation budget |
| `AI_GLOBAL_DAILY_LIMIT` | 800 | Total daily model requests across students, guests and admin |
| `AI_GLOBAL_MINUTE_LIMIT` | 25 | Total model requests per UTC minute |
| `AI_QUOTA_SALT` | default pepper | Optional secret salt for one-way pseudonymous account keys |

Rate limits count **attempts**, including remote provider failures. Gemini → Groq fallback under a single request consumes one reservation. Cached responses and local dictionary lookups don't consume new model reservations. Quotas reset at UTC day/minute boundaries, and the reservation is atomic across concurrent Nitro server instances.

The service-role RPC cannot be invoked by anonymous or authenticated browser clients directly, and the server verifies the Supabase bearer token before classifying a request as a signed-in student. Invalid/missing tokens are denied metered AI access before any model call or quota reservation. The database stores only time windows, counters, and hashed account buckets (not prompts, IP addresses, or account emails).

**Fail-closed:** If the migration is missing, the database is down, or the service role isn't configured, the app does not send billable model requests. Chat and explanation views can still use their limited offline fallbacks; this does NOT mean generative AI is active.

### Preview QA

- Verify a real generated chat answer (not the offline fallback badge), an English explanation, a mathematics explanation, a translated word and a passage translation.
- Check a logged-in student's request quota and verify a signed-out visitor cannot trigger a metered model call. Do not rely on browser-side limits for enforcement.
- Remove `GEMINI_API_KEY` and `GROQ_API_KEY` from a test deployment to confirm the fallback badge and absence of remote calls; restore the keys using secret settings.
- Test that cached subject explanations load with zero model requests and that quota exhaustion produces a clear, non-generative fallback/error.
- Monitor per-provider billing. The app-wide limits reduce risk, but **do not guarantee zero cost**, especially if the provider has other API uses.
- Never report the feature as deployed until the migration, secret configuration, successful tests and publish are confirmed.

### Guest-specific note

**Currently disabled:** anonymous visitors cannot trigger billable translations, new answer explanations, math explanations, AI calculator solutions or AI chat. They can still use local dictionaries, public book previews, reviewed explanations and shared cached translations/explanations. The legacy `AI_GUEST_SHARED_DAILY_LIMIT` is reserved for a future guest-trial system with verified anonymous identities and anti-automation safeguards.


## Learning-first AI tutor — expanded access

Students need more than a short fixed allowance to learn effectively. The Shtemarm AI tutor offers **three modes**, selected in the chat:

- **Hint** (default): gives a concrete first step and guiding question; if the student requests a full answer, it explains completely.
- **Full explanation**: a worked answer, mathematical steps, why the method works, and an optional check question.
- **Practice**: gives one exercise, waits for the student's attempt, checks it and explains the mistake.

The AI tutor follows the selected Armenian, English, or Russian UI language, allows school topics beyond the original narrow list, and now receives the conversation's previous assistant replies as well as student messages. It still cannot guarantee factual correctness; students should verify exam answer keys.

### Quota defaults and realistic cost limits

The updated default policy gives **60 live calls per authenticated student per UTC day**, **zero anonymous metered calls**, **800 live calls per UTC day across the whole site**, and **25 per UTC minute**. This is intentionally not "unlimited" paid-model access. Admins may choose *lower* values based on actual provider billing and demand. Existing hosting secrets such as `AI_USER_DAILY_LIMIT=15` override the new defaults until updated.

With cache-first shared question explanations, students can replay a previously generated explanation **without another paid model call**. The cache no longer distinguishes a different student's selected answer when the underlying source question and official correct answer are the same; in that case the AI creates a general study explanation, not individualized feedback.

Because cached explanations are reused, don't put a learner's name, personal details, or private notes into the shared question-explanation prompt. Chat conversation text is **not** placed in the shared cache.

### Validation before production

1. Try the three tutoring modes on a real algebra or English grammar task, including switching modes mid-conversation.
2. Verify one full-solution request really includes the answer and logical steps, not only hints.
3. Verify the same source question yields a saved cached explanation across different selected answers, including math, without a second generation call.
4. Check actual AI provider billing and rate-limit dashboards; set the `AI_GLOBAL_DAILY_LIMIT` lower if needed.
5. Ensure code build, authentication, and multilingual mobile UI pass before merging the Draft PR.


## Lovable security scan: metered public AI endpoints — 2026-11-04

Lovable flagged 3 critical public AI endpoints (translation, answer explanation, math explanation) and a warning for the AI calculator. The live AI chatbot also shares the same quota guard.

**New policy:** Unregistered visitors can use the free book preview, local dictionary and existing cached/reviewed explanations, but **any new billable model request requires an authenticated Supabase user verified on the server**. The server does not trust browser-supplied user identifiers or client-side route guards. A token must be validated with `supabaseAdmin.auth.getUser(token)` before the quota RPC and before any Gemini/Groq/OpenRouter calls. Missing/invalid tokens return a localized `signin` error or an honestly marked non-generative local explanation. Registered students retain their configured per-account daily allowance plus the global minute/day guards.

**Release test checklist:**
- As a signed-out visitor, open each of: AI translation (dictionary hit vs previously unknown passage), answer explanation (cached vs uncached), math explanation (cached vs uncached), AI calculator (text and image), AI chatbot. Confirm zero remote provider calls for uncached or calculator/chat requests.
- As a signed-in student, validate one real request in each feature, confirm Supabase token attachment, normal quota consumption and daily cap.
- Test an expired, malformed or manually supplied Bearer token: paid generation must deny. Test no provider secrets appear in HTML/JS network payloads.
- Run TypeScript, Vitest and production build on the updated branch and re-run Lovable security scan. The scanner may report on the currently published code until this change is merged and deployed.
- The screenshot's **12 dependency advisories** are a separate workstream. Do not mass-upgrade TanStack/Vite/Zod versions without examining advisory IDs, compatible patched versions and the lockfile, then completing build and route QA.

**Provider billing note:** Site-level daily quotas reduce possible spend but do not guarantee zero billing. Verify actual per-provider hard budget and access terms separately.
