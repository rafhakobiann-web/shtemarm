# Shtemarm security findings — 2026-11-04

Lovable reported:
1. **Critical:** "Anyone can read another visitor's feedback".
2. **Warning:** "Anyone can choose the AI chat's message roles".
Lovable's dashboard also listed 12 known package issues and separate build errors; those are NOT marked as fixed by this change.

## Private feedback remediation

- `feedback` contains visitor messages, optional contact details and developer replies. It must not be readable via the public Supabase API.
- Live database defense applied: `REVOKE ALL ... FROM public, anon, authenticated` on the table. RLS remains enabled; service_role access is retained.
- Old visitor feedback and replies were **not deleted**.
- A nullable `user_id` column records verified owners for **new** signed-in submissions. Legacy guest messages remain private and unassigned. Never infer ownership from browser `clientId`.
- `getMyFeedback` requires a real Supabase bearer token validated with `auth.getUser`, and filters by verified `user_id`. Signed-out users get no private messages.
- Admin list/reply require both a verified signed-in session **and** the configured admin password, checked server-side. The admin password is not exposed in public JavaScript.
- Anonymous feedback can still be **submitted**, not read. Atomic service-role-only abuse controls limit submissions to 5/day per verified account/browser identity, 250/day site-wide and 12/minute. Client-generated identifiers are spoofable; the global cap protects the service against trivial rotation. A CAPTCHA/human challenge may be appropriate if abuse grows.

### Live database status

Migrations:
- `supabase/migrations/20261104113500_private_feedback_grants.sql`
- `supabase/migrations/20261104114500_feedback_owner_and_limits.sql`

Applied through the connected Lovable PostgreSQL database. Verified that anon/authenticated have no direct SELECT/INSERT grants for `feedback`, the server still has SELECT permission, the owner column exists, and the feedback quota RPC is available only to service_role.

### Privacy limitations

- This mitigation prevents direct SQL/PostgREST access; it cannot prove whether anyone accessed historical data before the change.
- The legacy guest feedback history is not displayed to arbitrary visitors. We don't migrate it to user accounts based on supplied client IDs.
- The visible page changes require the feature branch to be merged and built. Live DB protections are already active.

## Chat role forgery remediation

- The browser now sends only `question`, `mode`, `locale`, and an optional opaque `contextToken`. No visitor chooses `assistant`, `system`, or `tool` roles on server function input.
- Previous tutor messages are recovered only from an HMAC-signed, short-lived token issued by the server. Tokens expire in three hours and are not saved in the database or browser storage.
- Invalid/tampered/expired tokens are ignored; only the latest student question is processed.
- `CHAT_CONTEXT_SIGNING_KEY` is an optional dedicated server secret. If absent, the private `SUPABASE_SERVICE_ROLE_KEY` is used with a distinct HMAC domain label. If neither is configured, safe single-turn tutoring works without restoring previous assistant replies.
- Signed chat context is integrity-protected, **not encrypted**, and held only in browser memory. Do not put sensitive health, identity, or financial details in questions.

## Release checklist

- [ ] Run `bun install --frozen-lockfile`
- [ ] Run `bunx vitest run src/test/security-feedback-chat.test.ts src/test/ai-learning.test.ts src/test/ai-runtime.test.ts`
- [ ] Run `bunx tsc --noEmit`, `node scripts/check-repo-secrets.mjs`, and `bun run build`
- [ ] Test signed-out and signed-in feedback submission; verify each user sees only their own new messages.
- [ ] Try a valid admin login and a signed-out direct call to each admin endpoint (must reject).
- [ ] Test fake `assistant` and `system` roles sent in chat RPC input (must reject) and several legitimate follow-ups with signed history.
- [ ] Verify provider quota guard still applies and no model secrets appear in network payloads.
- [ ] Rescan in Lovable; inspect any new finding rather than assuming old reports immediately clear.
- [ ] Review the separate 12 dependency issues before publication; do not automatically upgrade breaking framework versions without testing.

**Production remains untouched at the application-code level until this Draft PR is reviewed and tests pass.** The DB grants and additive migrations have already been applied as an immediate protective measure.
