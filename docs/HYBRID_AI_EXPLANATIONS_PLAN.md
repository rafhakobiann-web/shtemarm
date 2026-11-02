# Hybrid AI explanations — implementation plan (Draft PR)

Status: proposal only. Do not deploy, merge, or modify Production/Preview configuration.

## Confirmed decisions
- Hybrid: prefer vetted, book-specific explanations; use AI for clarification, personalized mistakes and follow-up.
- All existing subjects; preserve the original question text, order, answer keys, book IDs and routes.
- Unlimited student-facing explanations: no daily user quota. Provider quotas, abuse throttles, concurrency and budget circuit breakers still apply; explain service outages transparently.
- Armenian, English and Russian output according to the selected locale.

## Existing implementation discovered
- `src/lib/explain.functions.ts` already provides a TanStack server function, cached generation, and fallback.
- `src/lib/explanation-providers.server.ts` already supports server-only Gemini and Groq keys.
- `src/lib/explanation-cache.server.ts` already uses Supabase explanation_cache.
- `src/components/RichExplanation.tsx` renders explanations.
- `docs/AI_SETUP.md` documents provider configuration.
Enhance these existing facilities rather than adding a second explanation endpoint or changing routes.

## Implementation phases
1. Inventory every question renderer and existing explain invocation across subjects, with IDs and answer-key mapping. Add tests verifying question text/order/count and route snapshots remain identical.
2. Resolve a question on the server using trusted book/section/question IDs. Do not accept the browser's claimed correct answer as authoritative. Treat book text as untrusted input; never let it override tutor rules.
3. Add verified-explanation lookup keyed by immutable question ID + source revision + locale. Do not label AI-generated content verified without review. If verified content is absent, use AI generation with explicit provenance.
4. Generate structured explanations (steps, concise answer, common misconception, uncertainty), subject-specific instructions and locale selection. Compare the generated answer with the authoritative key; on mismatch or uncertainty, do not confidently present it as correct.
5. Keep the existing cache, but separate shared canonical explanations from student-specific feedback. Include source revision, locale, model/prompt version in keys; never cache personal answers in a shared cache.
6. Add an inline 'Explain' action to existing question components, plus 'Simplify' and 'Explain my mistake' without route changes. Accessible loading, retry, and failure states; preserve existing rich math rendering.
7. Protect the endpoint with session-aware fair-use abuse controls, request size limits, provider concurrency caps, spending alerts/circuit breaker and privacy-safe logs. Unlimited UI access does not guarantee provider capacity or unlimited cost.
8. Keep all provider keys server-side. Never commit secrets or send them to the browser or Android client.
9. Test every subject and locale, including wrong answers, missing keys, outages, malformed AI output, caching, auth, and concurrent calls. Run lint, unit tests, build and relevant Android checks before review.
10. Deploy only to an isolated review environment after explicit approval; no merge, Production deployment, Preview disruption, or Lovable edits without separate authorization.

## Acceptance criteria
- Existing routes and book banks unchanged.
- Explanation follows the exact official question and answer.
- Correct language selection and subject-specific pedagogy.
- Verified and AI-generated explanations distinguishable.
- No API keys in client output; provider failures handled safely.
- Existing app and site unaffected until tested and approved.

## Configuration to decide during implementation
- Which provider credentials are configured in the isolated review environment.
- Monthly spending cap and service-outage behavior.
- Approval workflow for marking explanations verified.

## API-key-free implementation update (2026-11-02)
- The existing explainAnswer server function now reads cached explanations and otherwise uses the deterministic multilingual fallback; it no longer calls Gemini/Groq.
- Added unit tests in src/test/api-key-free-explanations.test.ts.
- This is phase 1, not a completed on-device AI model. No model weights are bundled, and no browser inference is activated.
- Future on-device AI should be opt-in, capability-tested, downloaded with consent, and validated against verified answers. Low-memory devices continue to use the fallback.
- Existing cache entries are not guaranteed human-reviewed; before describing them as verified, introduce provenance metadata and a review process.
- Current input still accepts client-supplied correct answers; server-side ID resolution is required before treating answers as authoritative.
- CI tests/build have not yet been executed in this PR. Do not merge until verified.

## Android / Vercel compatibility and release gate
- Vercel hosts the site but cannot grant Android browsers the experimental built-in LanguageModel API. A different hosting provider does not fix browser support.
- Unsupported browsers now hide the native-AI action and display the standard fallback; no model download or provider key is needed for that fallback.
- A cached legacy explanation can have been AI-generated. The UI explicitly marks it unverified; provenance must be audited before describing anything as human-verified.
- Native-model output is opt-in and unverified. Native browser availability depends on device, browser version, browser flags, model download eligibility, and storage.
- No WebLLM/Transformers.js model is bundled: adding one requires testing memory, battery, download size, Armenian-language quality, and browser compatibility on actual Android devices.
- Run `npm install`, `npm test`, `npm run build`, and `npm run lint` in an isolated branch checkout or Preview CI before merging. These commands have not been run here.
- Do not enable production deployments or modify Lovable. Keep this PR Draft until build, question-bank invariants and device tests pass.
