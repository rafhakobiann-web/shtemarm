# Shtemarm — student-led development decisions (2026-11-04)

Approved answers: **1C, 2B, 3C, 4B, 5D**.

## Phase 1 — This Draft PR
- **1C · Dashboard + Continue Learning**: Account-scoped, last-opened book / section / practice mode saved *on the current device*. No question body, selected answer, token, private notes or contact data are stored. First-time visitors see a simple "Choose a book" action.
- **2B · Interactive practice**: Clear immediate, accessible feedback for incorrect multiple-choice and numeric answers; keep answer checking, source text, mistake tracking and existing offline/AI explanations working. Preserve correct-option highlighting.
- **3C · Adaptive AI tutor**: Adaptive mode is the default alongside manual Hint, Explanation and Practice choices. It uses verified context from the current chat to adjust examples and difficulty after attempts, without claiming to see private history or sending stored answers. Continue to require verified sign-in and existing server-side model quotas.
- **4B · Clean and fast mobile**: Simple two-column, large touch targets for AI study modes, restrained color transitions, no additional background motion or heavy visualization packages. Respect reduced-motion.
- **Security before rollout**: Require a verified Supabase identity **and** existing ADMIN_PASSWORD for admin-only explanation endpoints. Optional `ADMIN_ALLOWED_USER_IDS` limits admin access to explicit UUIDs.

### Important limitations
- Continue Learning on this device works for the standard `/study/:bookId/:sectionId` routes. It does not yet sync this last location across devices, or cover every custom math/history exam mode.
- AI adapts only to the current verified chat context. It does not silently upload mistakes saved in the browser or scrape school records.
- Existing saved progress may include earlier mistakes; this PR does not reset or change grading data.
- Previously reported dependency issues require an updated `bun audit` and manual review of each advisory, not an assertion that every advisory is resolved.
- Draft PR is **not a deployment**. Lovable Production, Android release and current student records remain unchanged by this code change.

## Next phases — Planned, not shipped
- **Phase 2**: Verified account-scoped subject weakness analytics, optional student consent before AI uses mistake categories, more detailed per-section review; keep accurate original question-bank mapping first.
- **Phase 3**: XP and achievement improvements, educational mini-games and short revision goals (no manipulative streak pressure).
- **Phase 4**: Performance audits on low-end Android, accessibility, exam book completeness, and release gating.

## Required QA
1. Run `bun install --frozen-lockfile`, `bunx tsc --noEmit`, `bun run build`.
2. Run `bunx vitest run src/test/security-admin-session.test.ts src/test/admin-dependency-security.test.ts src/test/personal-dashboard-learning.test.ts src/test/ai-learning.test.ts`.
3. Run `node scripts/check-repo-secrets.mjs`, `node scripts/check-dependency-security.mjs`, `bun audit --audit-level=high`. Manually review any unresolved alerts.
4. On Android ~320px and 390px: first-time login, Continue Learning after study, accurate book+section+mode, browser reload, sign-out, and user switch on shared device (no previous account's resume).
5. Practice: wrong/correct MC and numeric questions, explanations and mistake notebook. No fabricated official question text.
6. AI: four mode choices, adaptive response after one wrong and one correct attempt, explicit full-solution request, English and Russian, no unauthenticated paid calls.
7. Security: verify anonymous admin calls fail, logged-in non-admin without password fails, verified admin with password works, reviewed non-private explanations remain readable. Recheck Lovable Security scanner on the candidate.
8. Only merge and publish Lovable after green CI and Android device QA.
