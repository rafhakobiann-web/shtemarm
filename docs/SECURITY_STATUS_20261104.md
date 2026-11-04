# Shtemarm security status — 2026-11-04

## Confirmed source, lockfile, and live database checks

| Finding | Current state | Evidence / action |
| --- | --- | --- |
| Unauthorized visitors reading private feedback | Mitigated in live PostgreSQL | `anon` and `authenticated` cannot SELECT `public.feedback`; RLS is on. Server role can read only through trusted functions. |
| Browser impersonating prior AI replies | Fixed in main | Chat only accepts a student question plus HMAC-verified server context; never trusts a browser-supplied assistant role. |
| Unauthenticated paid translation, explanation, math, calculator or chat calls | Fixed in main source | `reserveAiRequest` verifies Supabase Auth before new metered provider requests; saved local/cached education content remains available to guests. |
| AI provider quotas | Present | Atomic database minute/day limits, verified-user budgets and fail-closed fallback. |
| Administrator bulk explanation routes | **Hardened in this PR** | Require verified Supabase user AND existing `ADMIN_PASSWORD`, with optional `ADMIN_ALLOWED_USER_IDS` allowlist. The reviewed explanation read-only endpoint stays public. |
| TanStack Start reflected XSS GHSA-qx66-fv34-fjm8 | Patched in current lockfile | `@tanstack/react-start@1.168.60` and `@tanstack/start-server-core@1.169.39` match the first patched versions reported by the maintainer. |
| Poisoned TanStack releases GHSA-g7cv-rxg3-hmpx | No listed malicious versions seen in current lock | New `scripts/check-dependency-security.mjs` blocks known compromised versions and malicious optional package markers. |
| Lovable dependency security scanner's 12 items | **Not fully resolved** | Need individual advisory identifiers and validated patched dependency graph for Tailwind/Vite, Zod and all transitive packages. Don't pretend 12 warnings are cleared by checking one CVE. |
| Public static `/data/*.json` books | **Still publicly downloadable** | Guest's two-exercise UI is not protection for raw question-bank files. Protecting source content requires backend authenticated access plus carefully served preview items, with migration testing. |
| Secret exposure | No known current-source secret from existing checks; not a complete guarantee | Existing `scripts/check-repo-secrets.mjs` and Git-history audit must run. Rotate any keys that have been published in the past. |
| Build and deployment | **Not confirmed safe for a new release** | GitHub Actions previously stopped before running tests. Lovable may publish a different code commit than GitHub main. Verify production hash, tests and security scan. |

## Verify the new admin access control

1. Open the administrative explanation page while signed out. All three privileged server functions must reject access even if supplied the correct password.
2. As a signed-in account, an incorrect admin password must reject every privileged function.
3. As the authorized administrator, a verified Supabase session plus the correct password must allow permitted operations.
4. For stronger identity protection, set `ADMIN_ALLOWED_USER_IDS` in server-only Secrets to the Supabase Auth user UUID(s) authorized to administer Shtemarm. This supplements—not replaces—the password. Without this variable, any verified account would also need to know the admin password to administer.
5. Normal students and guests must still be able to request previously reviewed answers via the read-only `getReviewedExplanation` endpoint.

## Build and dependency checks

Run in a clean build environment:

```sh
node scripts/check-dependency-security.mjs
node scripts/check-repo-secrets.mjs
bun install --frozen-lockfile
bunx vitest run src/test/admin-dependency-security.test.ts src/test/security-feedback-chat.test.ts src/test/ai-budget.test.ts
bunx tsc --noEmit
bun run build
```

For the other package warnings, use `bun audit` where supported, review advisory IDs and resolved transitive versions, then upgrade **in a separate lockfile-consistent change**. Major framework upgrades can break authentication and SSR, and aren't automatically a safer emergency patch.

## Release safety

This PR is initially Draft; Lovable Production is unchanged. A successful Netlify build does not prove working server functions, authentication, security, or no vulnerabilities. Confirm the fixed code is *actually published*, then re-run Lovable's Security Scan. Do not publish while known critical findings remain unresolved.
