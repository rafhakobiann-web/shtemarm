# Shtemarm landing refresh — responsive guest experience (2026-11-05)

## Scope and design
The user's reference informed the editorial treatment: teal hero, amber accents, paper/grid panels, readable Armenian typography and a phone-style preview. Original Shtemarm branding and copy only. All work stays in Draft PR #216; Production, Lovable and the existing exam routes are unchanged.

## Implemented
- Interactive **dynamic-island-inspired** phone notch: accessible expanded state, disclosure and a clear link to the practice sample. Phone preview retains swipe/keyboard buttons and native vertical scrolling.
- **Three answerable, original illustrative guest questions** (math, English grammar, Armenian language), localized HY/EN/RU. Users get answer feedback, next/previous navigation, score and reset without sign-in or persistence. These are NOT verbatim official textbook exercises.
- Dedicated **Try 3 questions** anchor in hero and desktop/mobile menus so guests discover the sample quickly.
- Scoped **dark-mode typography/contrast** fix: Noto Sans Armenian glyph support, less cramped headline letter spacing, legible dark navigation, FAQ and neutral cards while paper/amber sections intentionally retain dark ink.
- Compositor-friendly intro and hover motion, responsive touch feedback, native swipe behavior, optional scroll-based reveals, reduced-motion/high-contrast safeguards, and no new animation libraries or network dependencies.
- Netlify TanStack/Nitro build routing configuration remains in this PR and needs deployment-route smoke checks.

## Android APK — public-vs-private correction
**Important:** The GitHub repository is private. A GitHub release can be *published and non-draft* while still requiring repository access. Therefore it is not a reliable public download link.

The repository already contains the same-origin website APK `public/downloads/shtemarm-android.apk` and metadata `public/downloads/android-release.json` (version **0.1.1-beta.1**, 19,331,250 bytes). The redesigned landing **now links to `/downloads/shtemarm-android.apk`**, and /download loads the manifest and falls back to that on-site asset. The Android download is labeled a **debug beta**, not a signed release or Play Store listing. The website's asset version is older than the private GitHub v0.3.0-beta.4 release; do not misrepresent versions.

The developer can approve and publish a newer properly signed APK to a truly public static host later. Until then, do not rely on `github.com/rafhakobiann-web/shtemarm/releases` for unauthenticated student downloads.

## Guest book previews are separate
The requested **two original questions per section and two complete English text/exercise units per section** are implemented separately in **Draft PR #207**, not this PR. That larger guest-access PR has routing/auth implications and must be reviewed and tested before any merge. The landing's three questions are only an illustrated teaser and do not claim to complete PR #207.

## Verification and release checklist
- [x] GitHub connector confirmed the PR branch remains separate from `main`.
- [x] Website APK and metadata file exist in the repository; automated checksum and size regression added.
- [x] New source-level regressions and jsdom interaction tests committed; GitHub workflow updated to include them.
- [x] Fixed missing `ChevronLeft` import that would break TypeScript/build during sample-question navigation.
- [x] Explicit dark ink on paper, gold and download panels preserves readable contrast in dark mode.
- [x] Legacy `VITE_ANDROID_APK_URL` values pointing at this private GitHub repository are ignored, so they cannot override the on-site APK. 
- [x] jsdom interaction tests explicitly clean up after each run.
- [x] Netlify and Vercel posted successful deployment status contexts for the PR head as of the initial check.
- [ ] **GitHub Actions unavailable:** workflow runs show `failure` with **zero runner steps**, before executing tests. This cannot be treated as passing tests. Inspect account runner availability/billing/settings and rerun.
- [ ] Run `bunx vitest run src/test/landing-editorial-2026.test.ts src/test/landing-sample-interaction.test.tsx src/test/download-scroll.test.ts`.
- [ ] Run `bunx tsc --noEmit` and `bun run build`, then inspect logs.
- [ ] Mobile (320px, 390px), tablet and desktop checks: dark/light typography, expanded notch, quiz, navigation, vertical scroll, reduced motion.
- [ ] Verify public deployed `/downloads/shtemarm-android.apk` and manifest both return correct bytes (not SPA HTML/404), match SHA-256, and install on a test Android device.
- [ ] Verify Netlify / and /download runtime routes. A deploy success status alone does not prove the pages function.
- [ ] No merge or Production/Lovable publish until actual QA is complete.

## Nov 5 — full-page Android screenshot feedback and fix
The user-provided dark-mode Android screenshots demonstrated that the old Liquid Glass styles still dominated the lower landing chapters, and the dark phone preview had unreadable navy cards with dark text. A previous dark-mode fix only covered top-level colors and did not win the nested `html[data-surface="liquid"]` selectors.

**Changes in `src/landing-editorial-2026.css`:**
- Component-specific, dark-mode Liquid Glass overrides for the phone's screen, heading, progress, navigation arrows, option cards, selected state, icons, and caption. Approximate text contrast ratios against final backgrounds: option 8.26:1, selected option 8.74:1, focus text 9.61:1.
- Full landing-only editorial redesign, not just hero: cream graph-paper benefits with alternating gold/mint/white/teal cards; deep teal chapter with light subject tiles; amber three-step chapter; pale FAQ with clear disclosure contrast; deep teal CTA with amber button; readable footer.
- Extra narrow-device rules (767px and 350px), plus keyboard focus and reduced motion support. Core signed-in styles remain untouched.
- Source-level regression checks in `landing-editorial-2026.test.ts` cover every redesigned chapter and the nested dark phone controls.

**Verification status:** CSS source was checked for balanced braces and validated for the above sampled color contrasts. A successful Netlify/Vercel deployment is not a browser/screenshot test. Physical Android light/dark walkthrough and GitHub CI execution are still mandatory before merge or publication.

## November 5 — editorial V3 (reference-aligned page composition)

The standalone earlier Shtemarm HTML design reference suggested a clearer split hero, multiple contrasting reading surfaces, and compact interactive dashboard preview. Combined with the owner-supplied teal/amber mobile design direction, V3 changes both **composition and visual skin**, not just colors.

- Hero now has a two-line localized highlighted headline (HY/EN/RU), gold-underlined emphasis, primary **Try 3 questions** action, sign-in action, Android download link, and concise truthful subject/sample indicators.
- The device preview remains a genuine interactive pointer/swipe accessible component but has a **compact one-column activity list**. The mobile first-child legacy `grid-column:span 2` problem is explicitly reset, preventing enormous cards.
- The mock phone is **deliberately light in both global themes**, with explicit component-level ink, button and selection colors that outrank the Liquid Glass dark selector. This addresses unreadable dark-mode text reported in Android screenshots without relying on inherited theme variables.
- The four showcase chapters are now **composed across the page**, not stacked all before benefits: hero → highlight strip → playable three-question guest sample → benefits → subjects → sample learning journey → onboarding steps → AI tutor illustration → FAQ → website/Android download → final CTA.
- Every original working route is preserved. The AI conversation remains a labeled illustrative display that makes **no paid AI request**. Android APK remains same-origin beta, not Google Play.
- Removed the `animation-timeline:view()` dependency which could leave long sections visually delayed and cause scroll jank; transitions are CSS transform/opacity with reduced-motion accessibility.
- Dedicated `sht-editorial-v3` scope improves specificity without changing signed-in study pages, older books, auth, routing, or Production.

### QA follow-up
- [x] JSX/CSS committed to existing Draft PR #216; Netlify and Vercel build/deployment status reported **success** on updated head.
- [x] CSS brace/string/comment balance and previous theme contrast rules independently reviewed at source level.
- [ ] Physical Android browser light/dark screenshots at 360–430px and desktop at 1280px; ensure sticky menu does not cover anchor targets, and no horizontal scrolling.
- [ ] GitHub Actions and Vitest/type/build verification. Workflow runners still fail before steps (issue #217).
- [ ] APK MIME, size, hash, installation and no private GitHub redirects.
- [ ] Approve visual output and merge only after checks. Production remains untouched.
